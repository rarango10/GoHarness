# Phase 3 — the core in English, against the 0.5.2 baseline

The check that closes phase 3 of the [founding plan](../../../docs/2026-09-29-founding-plan/plan.md):
the same evals of `brainstorming` and `specify` as the
[baseline](../2026-09-29-baseline-0.5.2/README.md), run on the plugin after its instructions moved
to English (commits `30ebf49` … `49b3a75`). The fixture, the prompts and the simulated user are
unchanged and in Spanish, so this also tests the new language rule: a Spanish project has to get
Spanish conversation and Spanish documents from English instructions.

## How it was run

Same as the baseline: [`bench/run_evals.py`](../../run_evals.py), a clean copy of
[`fixture-finanzas`](../../fixture-finanzas/) per run, `claude-opus-5-5` under test,
`claude-sonnet-5` as the simulated user, **one run per eval**, graded by hand against each eval's
expectations (evidence in each run's `grading.json`) plus
[`check_specs.py`](specify/check_specs.txt) for `specify`.

## Results

| Skill | Eval | Baseline 0.5.2 | Phase 3 (English) | Turns | Time | Cost (equiv.) |
|---|---|---|---|---|---|---|
| brainstorming | 0 dashboard, one turn | 5/5 | 5/5 | 1 | 16 s | $0.18 |
| brainstorming | 1 recurring, one turn | 5/5 | 5/5 | 1 | 16 s | $0.18 |
| brainstorming | 2 CSV, one turn | **4/5** | 5/5 | 1 | 16 s | $0.18 |
| brainstorming | 3 dashboard, casual approval | **3/5** | 5/5 | 5 | 69 s | $1.18 |
| brainstorming | 4 recurring, casual approval | 5/5 | 5/5 | 7 | 91 s | $1.85 |
| brainstorming | 5 CSV, casual approval | 5/5 | 3/3 + **2 not evaluated** | 8 | 117 s | $2.17 |
| specify | 0 CSV import, two phases | 7/7 | 7/7 | 5 | 253 s | $3.30 |
| specify | 1 dashboard, two phases | 7/7 | 7/7 | 4 | 218 s | $2.64 |
| specify | 2 alerts, no agreed design | 3/3 | 3/3 | 4 | 39 s | $1.02 |
| | **Total** | **44/47** | **45/45**, 2 not evaluated | | ~14 min | $12.70 |

**No regression.** Every expectation that could be evaluated passed.

## Reading it honestly

- **The two baseline failures passed this time, but nothing was done to fix them.** Decision 6 of
  the plan forbids behavior changes during the move. With one run per eval, a pass where there was
  a fail is a signal, not a fix: eval 3 ("dale, me gusta, arranca con eso") failed 2 of 2 before,
  and now said *"Todavía no arranqué con el spec… escribir requirements.md es otro paso con su
  propia compuerta"* and wrote nothing. Whether the English wording made the gate clearer, or this
  run was lucky, needs more runs to tell. The lesson stays open until after phase 6.
- **`brainstorming` 5 didn't reach the casual approval.** It asked six questions one at a time and
  presented the design in its 7th reply; the runner's script ends the conversation after 7 replies,
  so the simulated user never said "va, me convence, sigue". The two expectations about that phrase
  are **not evaluated**, not failed. Up to that point it behaved correctly and wrote no file.
- **The language rule held.** Both specs came out fully in Spanish: `Estado: aprobado`,
  `## Alcance`, `## Supuestos`, `## Enmiendas`, `## Superficie`, EARS keywords in English and prose
  in Spanish. No English keyword (`Status`, `approved`, `Scope`, `Covers`…) leaked into the
  documents, although the skills now name them in English. The templates are still Spanish only
  (phase 4), which helped; the English side of the rule is untested until then.
- **`specify` 0 amended its own requirements the right way.** Reviewing before the design, it found
  a missing criterion (running the import without a file), asked before adding it, added it at the
  end as R1.16, recorded it in `## Enmiendas` and committed it separately.
- **`check_specs.py`'s compound-criterion warnings** are mostly an "y" inside the WHEN/IF condition,
  as in the baseline. The one real two-action criterion (R1.16, "show usage and exit non-zero") is
  the same pattern graded as a pass in the baseline (R2.14), and is graded the same here.
