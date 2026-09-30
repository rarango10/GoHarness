# Baseline — goharness 0.5.2, before translation

The reference that phase 3 of the [founding plan](../../../docs/2026-09-29-founding-plan/plan.md)
compares against: the evals of `brainstorming` and `specify`, run on the Spanish plugin as it came
out of `GoHarness-es`, before touching a single instruction.

## How it was run

- **Runner:** [`bench/run_evals.py`](../../run_evals.py), on a clean copy of
  [`fixture-finanzas`](../../fixture-finanzas/) per run.
- **Model under test:** `claude-opus-5-5`, Claude Code 2.1.285. Simulated user: `claude-sonnet-5`.
- **One run per eval.** The author is on a Pro plan, so runs are spent carefully: a failure here is
  a signal, not yet a verdict, and gets repeated before being called a pattern.
- **Grading:** by hand against each eval's expectations, with evidence in each run's
  `grading.json`; `specify` also through `check_specs.py` (output in `specify/check_specs.txt`).
- `review.html` in each skill folder is the skill-creator viewer. Use its *Outputs* tab; the
  *Benchmark* tab assumes a second configuration that this baseline does not have.

## Results

| Skill | Eval | Passed | Turns | Time | Cost (equiv.) |
|---|---|---|---|---|---|
| brainstorming | 0 dashboard, one turn | 5/5 | 1 | 22 s | $0.23 |
| brainstorming | 1 recurring, one turn | 5/5 | 1 | 17 s | $0.21 |
| brainstorming | 2 CSV, one turn | **4/5** | 1 | 21 s | $0.23 |
| brainstorming | 3 dashboard, casual approval | **3/5** | 5 | 126 s | $1.60 |
| brainstorming | 4 recurring, casual approval | 5/5 | 7 | 113 s | $2.07 |
| brainstorming | 5 CSV, casual approval | 5/5 | 7 | 104 s | $2.22 |
| specify | 0 CSV import, two phases | 7/7 | 5 | 287 s | $3.77 |
| specify | 1 dashboard, two phases | 7/7 | 4 | 224 s | $2.72 |
| specify | 2 alerts, no agreed design | 3/3 | 4 | 116 s | $1.54 |
| | **Total** | **44/47** | | ~17 min | $14.59 |

## The failures: 3 expectations, in 2 evals

1. **`brainstorming` 3 — "dale, me gusta, arranca con eso" started `specify`.** The skill invoked
   `specify` and wrote `requirements.md` in the same turn, saying it took the "dale" as approval
   *and* as a request to start the spec. The same happened in the runner's trial run: 2 out of 2.
   Evals 4 and 5, with "sí, está bien, hazlo así" and "va, me convence, sigue", stopped correctly.
   The phrase that fails is the one with an explicit verb to start ("arranca"). Two expectations
   fail: it wrote the spec, and it did not say the spec is a separate step. Per decision 6 of the
   plan, this is recorded, not fixed, until after phase 6.
2. **`brainstorming` 2 — four questions in one.** It announced "one at a time", then asked about
   banks, separator, date format and amounts together, and listed five more decisions ahead.

## What the runs are not

- **Not the first attempt at `specify`.** The first one ran with permission prompts unanswered, so
  `specify` could not read its own templates. It is kept in
  [`../specify-invalida-sin-permisos/`](../specify-invalida-sin-permisos/) as the reason the runner
  now runs a copy of the plugin with every permission granted. `brainstorming` ran before that
  fix: only redundant read-only shell commands were denied there, and each run read the same
  files another way.
- **`specify` 2 goes further than its expectations.** The simulated user, after the correct refusal,
  approved a brainstorm and asked for the spec; the later `requirements.md` was an explicit request.
  Only the first turn is graded.
- **The date in `specify`'s expectations** (`docs/2026-09-04-…`) is the day the eval was written;
  it was graded as "today's date".
