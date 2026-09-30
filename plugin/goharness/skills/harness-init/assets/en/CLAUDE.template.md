# <project name: ask before filling in>

<what it is, in one or two lines: ask before filling in>

## Language

<!-- ranura: idioma -->
The cycle's documents —this file, the specs, the plans, the reports and the backlog— are written in
**<English | Spanish: ask before filling in>**, keywords included. The chat is not bound by it: each
person talks in their own language.

## Stack

<!-- ranura: stack -->
- <stack: ask before filling in. The language, the test runner and little else. The concrete
  libraries of each feature are decided in its `design.md`, not here.>

## Verification commands

They are **two slots with different purposes**. Conflating them muddies each task's verdict, which
is the durable record of what is done.

<!-- ranura: correccion -->
**Correctness** — the one for step 5 when closing a task, and the one `dod-checker` runs in step 6.
It answers "does the code meet the acceptance criteria?". Typecheck and tests; nothing else.

```bash
<typecheck command: ask before filling in>
<test command: ask before filling in>
```

<!-- ranura: higiene -->
**Hygiene** — the one for step 8, once, on the final state of the repo. It answers something else:
"is the whole repo healthy with all of this inside?". This is where lint, format, build and e2e go.

```bash
<hygiene command: ask before filling in. If the project has no lint or build yet, repeat the
correctness ones and say so — the slot exists anyway and gets filled when they show up.>
```

<!-- ranura: auditor -->
**Dependency auditor** — step 8 runs it to see which vulnerabilities the feature brought in.
It is informative, not part of hygiene: it blocks only what the feature introduced.

```bash
<the ecosystem's auditor command (npm audit, pip-audit…), or "none": ask before filling in>
```

**Why separate, in both directions.** With lint, build or e2e inside the correctness command, a
formatting complaint or a missing browser makes a task's verification fail for a reason that has
nothing to do with its criterion. And the other way around: if the only run is the correctness one,
task by task, **nobody ever checks the whole** — which is how a `done` can become a lie without the
task changing a line.

## Workflow

| # | Product | Produced by | Asked for by saying |
|---|---------|-------------|---------------------|
| 0 | this file | skill `harness-init` | "let's set up the contract", "let's set up the project" |
| 1 | agreed design (in the chat, no file) | skill `brainstorming` | "I want to add X", "how do we build Y" |
| 2 | `requirements.md` | skill `specify`, phase 1 | "let's write the spec" |
| 3 | `design.md` | skill `specify`, phase 2 | "on to the design" |
| 4 | `tasks.md` | skill `planning-tasks` → workflow `tasks-fanout` | "let's plan the tasks" |
| 5 | code + tests | skill `implement-task` (TDD) | "let's implement T3" |
| 6 | verdict per task (in the chat) | subagent `dod-checker` | "verify T3" |
| 7 | `e2e-tests-plan.md` + `e2e-test-report.md` — **conditional** | skill `verify-e2e` | "let's verify e2e" |
| 8 | hygiene run + closing commit | skill `close-feature` | "let's close the feature" |

**Step 7 is not for every feature.** It applies only if the feature's `design.md` declares a
navigable surface — something Playwright can open. A feature without an interface (a CLI, a
library, a job) finishes its tasks in `done` and jumps straight to step 8: that is not an exception,
it is the path for that kind of feature.

All of a feature's paperwork lives in `docs/YYYY-MM-DD-<feature>/`, except the Playwright specs,
which go in `end2end/` at the root because they are code and `playwright.config.ts` has to see them.

<!-- ranura: backlog -->
**Project backlog:** <`docs/pendientes.md` —the default, created the first time it is needed— or
the tracker the project already uses (GitHub Issues, Jira): ask before filling in>. It is the place
for what shows up in one feature and belongs to another.

Steps 6, 7 and 8 verify different things and none replaces another: `dod-checker` asks whether
*a task* meets the criteria it claims to cover; `verify-e2e` asks whether *the whole feature*
works; `close-feature` asks whether *all the verdicts are still true together*, on the final state.

Each document has **a single producer**: if a phrase leaves you torn between two skills, this table
wins. Each step waits for human approval before the next one, and no skill starts the one after
it — it only names it.

## Rules

<!-- regla: one-feature-at-a-time -->
- One feature at a time. Don't open parallel fronts.
<!-- regla: tdd -->
- TDD: failing test → implement → passing test.
<!-- regla: no-needless-deps -->
- Don't add dependencies without need.
<!-- regla: single-producer -->
- **The plan is written only by the `tasks-fanout` workflow**, never by hand or with another
  subagent: which tasks exist, their ids, their order, their title and their `Covers`. The workflow
  reviews in parallel with read-only agents and materializes with a single writer; planning from
  outside reintroduces the second writer that this eliminates.
<!-- regla: progress-by-implementer -->
- **Progress is written by whoever implements**, and only in the regions of the task they are
  doing: its `Status` cell and its `Log` block — plus the approval header of `tasks.md`, once, when
  the person confirms the plan. They are different regions with different owners. The only thing
  forbidden is implementing while a `tasks-fanout` run is in flight: between the scout reading and
  the writer saving, your `done` gets lost.
<!-- regla: done-means-verified -->
- **`done` means verified.** A task moves to `done` only when `dod-checker` returned `meets` and
  its `Log` records that verdict; any lesser result leaves it `in progress`. That is the project's
  **DoD**. The `Status` column is the durable record of what is truly finished.
<!-- regla: task-is-the-unit -->
- **The unit of step 5 is the task, not the phase.** Eleven tasks are eleven cycles. The gate
  between tasks is waived only with `implement-task`'s vocabulary (`--modo corrido`), never by
  inference; each task's verification and the stop on a lesser verdict are never waived, in any
  mode. And the second round of the same task —when a verdict came out lower than `meets`— also
  waits for the yes, always, in any mode: it is not "the next task", so `--modo corrido` does not
  reach it.
<!-- regla: one-commit-per-task -->
- **One commit per task, with its id in the message.**
<!-- regla: verdict-on-a-state -->
- **A verdict is taken on a state.** `dod-checker`'s `meets` holds for the repo as it was when it
  was taken, and it can become false without the task changing a line. That is why step 8 runs
  hygiene on the final state, and a red there reopens the affected task.
<!-- regla: e2e-does-not-fix-code -->
- **The e2e cycle does not fix code.** `e2e-triager` diagnoses and routes; if the cause is the code,
  the task drops to `in progress` and is fixed with the usual TDD.
<!-- regla: change-enters-at-top -->
- **A change enters through the highest document it touches.** Whatever forces going back midway —a
  wrong criterion, a design that no longer describes what exists, a missing task— is not fixed where
  it showed up: it is classified and enters through that document's producer (`specify` with a
  short amendment, `planning-tasks` for the plan), and cascades down. Every `meets` that relied on
  what was amended stops being valid, and its task goes back to `in progress` with the yes. What
  belongs to another feature goes to the project backlog. The classes and their paths are in the
  `goharness` router.
- <this project's own rules: optional, and only the ones that hold for **every** feature. E.g. "logic
  goes in pure functions, separate from the UI". Write them as a norm —what is done, what isn't—,
  never as a state —what there is—: the state is changed by the next feature and the rule is left
  lying. If there are none yet, delete this line.>

<!--
What does NOT go in this file, and why it matters:

- **Names of concrete files, modules or components.** No "Structure" section with a file tree.
  That is decided by `specify` in phase 2, feature by feature, and it is exactly where alternatives
  are considered. With the structure already written here, `design.md` ratifies instead of
  designing and the single-producer rule breaks before the cycle starts.
  The boundary is this: a rule that holds for every feature belongs to the contract; a concrete
  file tree does not.
- **Requirements or acceptance criteria.** They belong to `requirements.md`.
- **The work plan.** It belongs to `tasks.md`, and a workflow writes it.

This file is the permanent contract: stack, commands, rules that outlive every feature. If
something changes feature by feature, it doesn't go here.
-->
