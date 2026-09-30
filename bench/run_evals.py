#!/usr/bin/env python3
"""
Runs a skill's evals (plugin/goharness/skills/<skill>/evals/evals.json) against the plugin as a
real person would use it: `claude -p` in a throwaway copy of fixture-finanzas, with the plugin
loaded from disk and none of the user's own settings.

Multi-turn evals get a simulated user: a second `claude -p`, with no tools, that answers from a
per-eval script (GUIONES below); the runner decides when the conversation ends.

Usage:
    python3 bench/run_evals.py --skill brainstorming --out bench/results/<name> [--evals 0,3] [--reps 1]

Layout of the results, the one specify/evals/check_specs.py reads:
    <out>/<skill>/eval-<id>-<name>/with_skill/run-<n>/
        outputs/          docs/ and every file the run created or changed, plus git-log.txt
        conversation.md   the conversation, readable, with tool calls summarized
        turns/            the raw stream-json of each turn
        timing.json       tokens, cost and time, summed over the turns

Every run goes through scrub.py before it is left on disk: the results are committed to a public repo.
"""
import argparse
import json
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

from scrub import scrub

REPO = Path(__file__).resolve().parent.parent
PLUGIN = REPO / "plugin" / "goharness"
FIXTURE = REPO / "bench" / "fixture-finanzas"

MODEL = "claude-opus-5-5"        # the model under test
USER_MODEL = "claude-sonnet-5"   # the simulated user: not measured, only has to be sensible
MAX_TURNS = 8
TURN_TIMEOUT = 15 * 60

NAMES = {
    "brainstorming": {0: "dashboard-una-vuelta", 1: "recurrentes-una-vuelta", 2: "csv-una-vuelta",
                      3: "dashboard-aprobacion-casual", 4: "recurrentes-aprobacion-casual",
                      5: "csv-aprobacion-casual"},
    "specify": {0: "import-csv-dos-fases", 1: "dashboard-dos-fases", 2: "alertas-sin-diseno"},
}

PERSONA = """Sos la persona dueña de «Finanzas», una CLI personal para registrar gastos. No sos
desarrolladora: contestás corto, en castellano rioplatense, sin jerga técnica. Estás hablando con un
asistente de programación que trabaja sobre tu proyecto.

Si te ofrecen opciones, elegí la recomendada (o la primera, si no hay recomendación) y decilo en una
línea. Si te preguntan algo que no sabés, elegí lo más simple. Nunca escribas código ni pidas código.

Tu guion:
{guion}

Respondé SOLO con tu próximo mensaje para el asistente, sin comillas ni explicaciones."""

# Each script: (instructions, closing phrase, max replies). The runner, not the simulated user,
# ends the conversation: after the assistant answers the closing phrase, or after max replies.
# A simulated user asked to stop by itself kept repeating the approval, and approved documents the
# eval never meant to approve.
BRAINSTORM_CASUAL = """Contestá las preguntas del asistente. Cuando el asistente presente un diseño
completo y te pida aprobación, respondé exactamente: «{frase}»."""

GUIONES = {
    ("brainstorming", 3): (BRAINSTORM_CASUAL.format(frase="dale, me gusta, arranca con eso"),
                           "dale, me gusta, arranca con eso", 7),
    ("brainstorming", 4): (BRAINSTORM_CASUAL.format(frase="sí, está bien, hazlo así"),
                           "sí, está bien, hazlo así", 7),
    ("brainstorming", 5): (BRAINSTORM_CASUAL.format(frase="va, me convence, sigue"),
                           "va, me convence, sigue", 7),
    ("specify", 0): ("""El diseño ya lo aprobaste antes (es el de tu primer mensaje). Si el asistente
pregunta algo, contestá coherente con ese diseño. Cuando te muestre los requisitos y pida
aprobación, respondé «Aprobado, seguí con el diseño.». Cuando te muestre el diseño técnico y pida
aprobación, respondé «Aprobado.».""", "Aprobado.", 7),
    ("specify", 2): ("""No hay ningún diseño acordado: la idea recién se te ocurrió. Si el asistente
pregunta, lo que querés es que la app te avise cuando el gasto de una categoría pase su presupuesto
del mes; no tenés nada más definido. Si propone pasar primero por una etapa de ideas o de diseño,
respondé «dale».""", None, 3),
}
GUIONES[("specify", 1)] = GUIONES[("specify", 0)]


def plain(text):
    """Lowercase, without the punctuation a simulated user adds or drops."""
    return "".join(c for c in text.lower() if c.isalnum() or c == " ").strip()


def claude(args, cwd, prompt):
    """Runs one `claude -p` call; returns (events, stderr)."""
    proc = subprocess.run(
        ["claude", "-p", prompt, "--output-format", "stream-json", "--verbose", *args],
        cwd=cwd, capture_output=True, text=True, timeout=TURN_TIMEOUT, stdin=subprocess.DEVNULL)
    events = [json.loads(l) for l in proc.stdout.splitlines() if l.strip().startswith("{")]
    return events, proc.stderr


def turn_summary(events):
    """The session id, the final text, the tool calls and the cost of one turn."""
    sid, text, tools, result = None, "", [], {}
    for e in events:
        if e.get("type") == "system" and e.get("subtype") == "init":
            sid = e.get("session_id")
        elif e.get("type") == "assistant":
            for c in e["message"]["content"]:
                if c["type"] == "tool_use":
                    tools.append(f'{c["name"]}: {json.dumps(c["input"], ensure_ascii=False)[:200]}')
        elif e.get("type") == "result":
            result = e
            text = e.get("result") or ""
            sid = e.get("session_id") or sid
    return sid, text, tools, result


def seed(workdir: Path):
    """A clean copy of the fixture, as a repo with two commits: the code, then the contract."""
    shutil.copytree(FIXTURE, workdir)
    git = lambda *a: subprocess.run(["git", *a], cwd=workdir, check=True, capture_output=True)
    git("init", "-q", "-b", "main")
    git("config", "user.name", "Bench")
    git("config", "user.email", "bench@example.com")
    git("add", "-A", ":!CLAUDE.md")
    git("commit", "-q", "-m", "Registro de movimientos: agregar y listar por mes")
    git("add", "CLAUDE.md")
    git("commit", "-q", "-m", "Contrato del proyecto (harness-init)")
    return git("rev-parse", "HEAD").stdout.decode().strip()


def collect(workdir: Path, base: str, outputs: Path):
    """Copies what the run produced: every file created or changed since `base`, and the git log."""
    outputs.mkdir(parents=True, exist_ok=True)
    git = lambda *a: subprocess.run(["git", *a], cwd=workdir, capture_output=True, text=True).stdout
    status = git("status", "--porcelain", "-uall")
    changed = {l[3:].strip() for l in status.splitlines()} | set(git("diff", "--name-only", base, "HEAD").split())
    for rel in sorted(changed):
        src = workdir / rel
        if src.is_file():
            (outputs / rel).parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, outputs / rel)
    (outputs / "git-log.txt").write_text(git("log", "--stat", "--format=%n%h %s"))
    (outputs / "git-status.txt").write_text(status)


def run_one(skill, ev, run_dir: Path):
    run_dir.mkdir(parents=True, exist_ok=True)
    (run_dir / "turns").mkdir(exist_ok=True)
    guion = GUIONES.get((skill, ev["id"]))
    convo, totals = [], {"total_cost_usd": 0.0, "duration_ms": 0, "input_tokens": 0,
                         "output_tokens": 0, "turns": 0}
    started = time.time()
    with tempfile.TemporaryDirectory(prefix="goharness-bench-") as tmp:
        workdir = Path(tmp) / "finanzas"
        base = seed(workdir)
        # The plugin runs from a copy, with every permission granted: a person approves what the
        # harness asks, and an installed plugin reads its own templates without asking. With
        # prompts left unanswered, specify could not read its templates and the run was invalid.
        # The copy also keeps a run from touching the plugin's source.
        plugin = Path(tmp) / "plugin"
        shutil.copytree(PLUGIN, plugin)
        base_args = ["--plugin-dir", str(plugin), "--add-dir", str(plugin),
                     "--setting-sources", "project", "--strict-mcp-config", "--model", MODEL,
                     "--permission-mode", "bypassPermissions"]
        message, sid = ev["prompt"], None
        for n in range(1, MAX_TURNS + 1):
            args = base_args + (["--resume", sid] if sid else [])
            events, err = claude(args, workdir, message)
            (run_dir / "turns" / f"turn-{n}.jsonl").write_text(
                "\n".join(json.dumps(e, ensure_ascii=False) for e in events))
            sid, text, tools, result = turn_summary(events)
            if not result:
                convo.append(("error", f"sin resultado en el turno {n}\n{err[-2000:]}", []))
                break
            convo.append(("user", message, []))
            convo.append(("assistant", text, tools))
            totals["turns"] += 1
            totals["total_cost_usd"] += result.get("total_cost_usd") or 0
            totals["duration_ms"] += result.get("duration_ms") or 0
            usage = result.get("usage") or {}
            totals["input_tokens"] += (usage.get("input_tokens", 0)
                                       + usage.get("cache_read_input_tokens", 0)
                                       + usage.get("cache_creation_input_tokens", 0))
            totals["output_tokens"] += usage.get("output_tokens", 0)
            if not guion or (guion[1] and plain(message) == plain(guion[1])) or n > guion[2]:
                break
            transcript = "\n\n".join(f"[{'VOS' if r == 'user' else 'ASISTENTE'}]\n{t}"
                                     for r, t, _ in convo if r != "error")
            with tempfile.TemporaryDirectory(prefix="goharness-user-") as empty:
                uev, _ = claude(["--model", USER_MODEL, "--tools", "", "--setting-sources", "project",
                                 "--strict-mcp-config",
                                 "--append-system-prompt", PERSONA.format(guion=guion[0])],
                                empty, f"Conversación hasta ahora:\n\n{transcript}\n\nTu próximo mensaje:")
            _, reply, _, _ = turn_summary(uev)
            reply = reply.strip()
            if not reply:
                break
            message = reply
        collect(workdir, base, run_dir / "outputs")
    totals["wall_seconds"] = round(time.time() - started, 1)
    totals["total_tokens"] = totals["input_tokens"] + totals["output_tokens"]
    totals["total_duration_seconds"] = round(totals["duration_ms"] / 1000, 1)
    (run_dir / "timing.json").write_text(json.dumps(totals, indent=2))
    md = []
    for role, text, tools in convo:
        md.append(f"## {'Usuario' if role == 'user' else 'Asistente' if role == 'assistant' else 'ERROR'}\n")
        md += [f"- `{t}`" for t in tools]
        md.append(("\n" if tools else "") + text + "\n")
    (run_dir / "conversation.md").write_text("\n".join(md))
    scrub(run_dir)  # results go to a public repo
    return totals


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--skill", required=True, choices=sorted(NAMES))
    ap.add_argument("--out", required=True)
    ap.add_argument("--evals", help="comma-separated ids; default all")
    ap.add_argument("--reps", type=int, default=1)
    a = ap.parse_args()
    spec = json.loads((PLUGIN / "skills" / a.skill / "evals" / "evals.json").read_text())
    wanted = {int(x) for x in a.evals.split(",")} if a.evals else None
    out = Path(a.out).resolve() / a.skill
    for ev in spec["evals"]:
        if wanted is not None and ev["id"] not in wanted:
            continue
        eval_dir = out / f"eval-{ev['id']}-{NAMES[a.skill][ev['id']]}"
        eval_dir.mkdir(parents=True, exist_ok=True)
        (eval_dir / "eval_metadata.json").write_text(json.dumps({
            "eval_id": ev["id"], "eval_name": NAMES[a.skill][ev["id"]], "prompt": ev["prompt"],
            "assertions": ev.get("expectations", [])}, indent=2, ensure_ascii=False))
        for r in range(1, a.reps + 1):
            print(f"[{time.strftime('%H:%M:%S')}] {a.skill} eval-{ev['id']} run-{r} ...", flush=True)
            t = run_one(a.skill, ev, eval_dir / "with_skill" / f"run-{r}")
            print(f"    {t['turns']} turnos, {t['wall_seconds']}s, ${t['total_cost_usd']:.2f}", flush=True)


if __name__ == "__main__":
    sys.exit(main())
