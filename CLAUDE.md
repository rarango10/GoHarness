# GoHarness — maintainer notes

This repo **is the plugin**: an agent-assisted development cycle for Claude Code, published as the
`goharness` marketplace. There is no app here, and this file is **not a project contract** — don't
run the harness's cycle on this repo. How to maintain it, in full: [`MAINTAINING.md`](MAINTAINING.md).

## Where things are

- `plugin/goharness/` — the source of everything that gets installed: the router (`SKILL.md`),
  `skills/`, `agents/`, `workflows/tasks-fanout.js`, `checks/`.
- `bench/` — the test bench: a frozen fixture, `run_evals.py`, and results compared against the
  0.5.2 baseline.
- `LESSONS.md` — what went wrong using the harness, and the backlog (its status index).
- `docs/YYYY-MM-DD-<name>/` — plans of the harness's own cycles of change. Old ones aren't reopened.

## Before committing a change to the plugin

```bash
claude plugin validate . --strict
claude plugin validate plugin/goharness --strict
node plugin/goharness/checks/lint-workflow-literals.cjs plugin/goharness/workflows/tasks-fanout.js
node plugin/goharness/checks/check-rules-parity.cjs
bash plugin/goharness/checks/sync-plugin.sh "$(mktemp -d)"
```

All five green. A behavior change to `brainstorming` or `specify` is checked with the bench's evals
too — they cost quota, so only the skills you touched, one run per eval.

## Rules

- **Instructions in English; each project writes in its own language.** A template is two files
  (`assets/en/`, `assets/es/`); a keyword is two words (canonical + Spanish alias, in the glossary
  of `task-format`). The contract literals stay in Spanish: `--modo …`, `--sin …`,
  `<!-- ranura: … -->`, `<!-- regla: … -->`, the triager's JSON and `docs/pendientes.md`.
- **Don't edit the harness with a run of the cycle in flight** — afterwards you can't tell what
  caused what.
- **Fewer rules, not more.** A lesson becomes a rule only if, without it, something that matters
  fails.
- **Nothing is deleted from `LESSONS.md`**; a false lesson is marked `discarded`.
- **This repo is public.** No personal data in a commit: bench results go through `bench/scrub.py`
  (the runner does it), and anything else is checked before pushing.
- **Publishing:** push `main` before the tag, and confirm with a real install — see
  `MAINTAINING.md`.
