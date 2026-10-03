# Phase 6 fixes — what the English run found, and how to apply it

The English half of phase 6 of the [founding plan](../2026-09-29-founding-plan/plan.md) ran on
2026-10-02: a calculator built from an empty folder, with the plugin installed from the real
marketplace, two features (`add-two-integers`, `subtract-two-integers`), all nine steps each, green.
It found seven things worth a lesson (the items of steps 1, 2 and 4 below; several observations made
during the run turned out to share a cause and are merged). This plan turns them into lessons and
fixes, in order, **before** the Spanish run and before 0.6.0.

The evidence is local, not in this repo: `~/dev/pruebas-goharness/calc-en` (its `docs/`, `git log`
and `docs/pendientes.md`). Read it when an item below cites it.

## How to work

- **One change at a time.** Explain it to the maintainer in Spanish, plainly, without assuming a
  developer background: what it is, why, what changes, what you need decided. Wait for the yes.
- **After each change:** the five checks of [`MAINTAINING.md`](../../MAINTAINING.md#the-checks),
  then one commit. **No push** until the maintainer says so.
- **Fewer rules, not more.** Every fix below edits an existing rule or a single line; if one starts
  growing into a new section, stop and ask.
- **No evals needed** unless `brainstorming` or `specify` change. None of the fixes below touches them.

## Step 0 — The lessons

Write the seven items of steps 1, 2 and 4 into [`LESSONS.md`](../../LESSONS.md) as L64–L70, each
with what happened, why it matters and what should be done, and add them to the status index. Also:

- **"Applied, not yet exercised"**: [L54] (the backlog) and [L52]/[L53] (the closing's contract
  reread and dependency audit) ran for real; [L24] (subtracting dependencies against the contract)
  and `harness-init` review mode ran too. Move them out of that list, citing the run. The e2e
  failure path is still unexercised.
- **L59**: two passes in a row (phase 3 evals, and the run's brainstorming asked six questions one
  at a time). Still `watching`.
- **README, "Status and known limits"**: the line "Spanish is proven by evals; English isn't yet"
  now has a full English run behind it. Update it.

Commit: `Phase 6: lessons from the English run`.

## Step 1 — Fixes that block 0.6.0

### 1.1 `dod-checker` finds the previous feature's commit · `ready to apply`

**What happened.** Task ids restart at T1 in every feature. `dod-checker` looks for the task's
commit with `git log --oneline --grep='<id>'` ([`agents/dod-checker.md`](../../plugin/goharness/agents/dod-checker.md),
"Look at the task's diff"). From the second feature on, `--grep='T3'` returns both features' T3, and
the diff check —the one from L12— can read the wrong commit. In the run, `dod-checker` itself raised
it as P1 in the project's backlog, proposing to change the commit convention in the contract.

**The fix — no contract change.** Every task commit touches its own feature's `tasks.md` (checked on
all 16 task commits of the run), so the search only needs narrowing:

```
git log --oneline --grep='^<id>:' -- <spec folder>/tasks.md
```

Checked on the run's repo: returns only the right T3. It is the only `--grep=` in the plugin.

### 1.2 "pasa" in an English e2e report · `ready to apply`

**What happened.** Both English e2e reports wrote the triager's JSON values into the document:
`### E1 — pasa`, `- Result: pasa`. The values (`pasa | falla | no-corrio`,
`test | codigo | spec | indeterminado`) are contract and stay literal **in the JSON**, but nothing
gives their English form for the report, so the agent copied the Spanish one (and invented
`Cause: none` next to it). It fails the phase 6 gate: a keyword escaped into the other language.

**The fix.** `e2e-triager` preloads no skill, so it never sees the glossary in `task-format`. Put
the mapping where it writes the report ([`agents/e2e-triager.md`](../../plugin/goharness/agents/e2e-triager.md),
step 4, "Write `e2e-test-report.md`"): result `pass · fail · did-not-run` ↔ `pasa · falla ·
no-corrio`; cause `test · code · spec · undetermined` ↔ `test · codigo · spec · indeterminado`. The
report uses the project's form; the JSON keeps the literal. Also add the two rows to the glossary in
`task-format`, so the canonical list stays complete. Decide the English words with the maintainer.

**How to check it:** re-run step 7 on `calc-en`'s second feature after reinstalling (see step 3),
or wait for the next English feature.

### 1.3 A closing with nothing to commit leaves no trace · `ready to apply`

**What happened.** `close-feature` of the first feature found nothing left to commit and, as its
instructions say, made no empty commit ("If nothing was left uncommitted, say so and finish"). The
record that the step ran stayed in the chat only. The next feature's `brainstorming` read `git log`,
saw step 7 as the last commit and concluded the feature was still open — it offered to close it
again.

**The fix.** The closing always writes one line in the header of `tasks.md` —for example
`> Closed: YYYY-MM-DD · hygiene green`— and commits it. That commit isn't empty: it is the record.
Touches [`skills/close-feature/SKILL.md`](../../plugin/goharness/skills/close-feature/SKILL.md)
("The closing commit" and "When finished"), the `tasks-template.md` header in `en` and `es` (the
parity guard checks they match), and the glossary if `Closed` becomes a keyword (`Cerrado`).
Decide the exact form with the maintainer.

## Step 2 — Fixes that don't block, but are cheap

### 2.1 `harness-init` installs a dependency nobody was asked about · `ready to apply`

**What happened.** Step 0 installed five dev dependencies. Four came from an answer; `@types/node`
was never mentioned. It came with a `tsconfig.json` (`"types": ["node"]`) that `harness-init` wrote
on its own — it isn't in `assets/stacks/typescript-node/`, which only has the Vitest and Playwright
configs. The Stack didn't list it, so `dod-checker` flagged it on every task (twelve verdicts), the
implementer offered to edit `CLAUDE.md` itself, and `close-feature` saw it but classified it as "an
omission, not a falsehood". It was fixed in the run through `harness-init` review mode, and the
note disappeared in the second feature.

**The fix — one line, extending an existing rule.** In
[`skills/harness-init/SKILL.md`](../../plugin/goharness/skills/harness-init/SKILL.md), the rule "a
config is seeded together with its dependency, or it isn't seeded" gains: **every dependency you
install is named in the question that installs it and listed in the Stack.** That covers the
closing and the verifier without touching them.

**And a translation slip in the same file**: the example slot `<stack: preguntá antes de
completar>` (section "The interview fills the slots") should read
`<stack: ask before filling in>`, like the template.

### 2.2 The workflow discovers the agent prefix by failing, every run · `ready to apply`

**What happened.** Each `tasks-fanout` run shows one agent in red in `/workflows`: the script calls
`spec-scout` by its bare name, fails, reads `goharness:` from the error and retries (L19). It works,
but `planning-tasks` already launched `goharness:tasks-fanout` and knows the prefix. A red agent on
every run teaches people to ignore red agents. Raised by the maintainer.

**The fix.** `planning-tasks` passes the prefix with the folder (`args` already accepts JSON:
`{"specDir": "docs/…", "agentPrefix": "goharness:"}`), and `tasks-fanout.js` starts `AGENT_PREFIX`
from it. The discovery by error stays as the fallback for a harness that runs without a plugin.
After editing the script, the literal linter is mandatory.

## Step 3 — Publish the fixes, and check the install

The Spanish run has to test the fixed version, from the real marketplace.

1. **Bump the version to 0.5.3** (not 0.6.0 yet: that comes after the gate). The plugin cache is
   keyed by version; with the same `0.5.2`, an install can keep serving the old copy.
2. Push `main` (with the maintainer's yes), then reinstall in a throwaway folder and **diff the
   installed copy against `plugin/goharness/`** — a "✔ success" proves nothing. Only `.in_use`
   may differ.

## Step 4 — Decide, don't apply yet

Two observations need a decision, not a ready fix. Bring them to the maintainer one at a time; if the
decision isn't quick, they wait until after 0.6.0.

- **A feature that needs to change the contract has no route.** The second feature's design said
  the hygiene command needed the build "applied with its own yes, in the task that introduces it",
  so the plan gave `implement-task` a `CLAUDE.md` edit — whose producer is `harness-init`. The
  router's eight classes of change don't include "the feature changes the contract", and
  `close-feature` catches it only at step 8, while step 7 already runs the contract's e2e command
  (it passed by luck, with a build left on disk). Candidate: a ninth class in the router —"the
  contract has to change"— whose path is `harness-init` in review mode, before the step that needs it.
- **The plan creates "guard tasks".** In both features, two tasks passed on their first run with no
  code change, and their goals said so in advance: they pin a criterion that an earlier task already
  completed. `task-format` rule 4 says a criterion belongs to the task that completes it; the
  reviewers didn't apply it. Cost: a full verification cycle per guard task. The implementer handled
  it well (breaking the code on purpose to see the red). Candidate: the reviewers merge a task whose
  first test would already pass into the task that completes its criterion. Or accept it, and say so.

## Step 5 — The Spanish run

Back to phase 6: a Spanish project from an empty folder, with 0.5.3 installed from the marketplace.
**Decide its scope with the maintainer first**: one feature (the sum) tests the language; two
features also test 1.1 and 1.3, which only show up on a second feature. Same reviewing as the
English run: after each step, look for keywords escaped into English.

Then 0.6.0, and only then, share it.

[L24]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l24--dod-checker-no-tiene-un-paso-que-compare-las-dependencias-contra-claudemd--resuelto
[L52]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l52--el-contrato-envejece-con-la-feature-y-nadie-lo-relee-al-cerrarla--resuelto-lote-14
[L53]: ../../LESSONS.md#l53--dependency-security-has-no-step-it-was-seen-by-accident--partially-resolved
[L54]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l54--los-hallazgos-que-le-corresponden-a-otra-feature-no-tienen-dónde-vivir--resuelto-lote-12
