# GoHarness

An **agent-assisted development cycle** for Claude Code, packaged as an installable plugin. Nine
steps, from the project's contract to the closing commit; each one produces an artifact, stops and
waits for human approval.

Its instructions are in English, and it **works in English and in Spanish**: each project chooses
the language of its documents, and each person talks to it in their own.

If you came to use it in your project, it is two commands. If you came to evaluate the method, go
straight to [The cycle doing its job](#the-cycle-doing-its-job). If you came to **edit the
harness**, the door is [`MAINTAINING.md`](MAINTAINING.md).

---

## Install it

```bash
claude plugin marketplace add rarango10/GoHarness
claude plugin install goharness@goharness
```

It is installed for your user, so it works in all your projects. Then:

1. **Turn on dynamic workflows**, which step 4 needs: `/config` → *Dynamic workflows*, or
   `"enableWorkflows": true` in `~/.claude/settings.json`. And **open a new session**: the
   workflow registry is built at startup. It is a setting of your machine, not of the repo.
2. **In your project, ask for step 0**: "let's set up the project". The `harness-init` skill
   interviews you —starting with the language of the documents— and writes the `CLAUDE.md` the rest
   of the harness needs to know which commands to run. If you already have one, it doesn't
   overwrite it: it reviews it and proposes changes.
3. **Start the first feature** with "I want to add X". From there, each step names the next one.

**Ask for the steps in plain language.** Inside the plugin everything carries a prefix
—`goharness:implement-task`, `goharness:dod-checker`— and the bare name only resolves if the skill
lives in your repo. The phrases in the "Asked for by saying" column trigger each skill by its
description, and those **don't depend on the prefix**. They work in English and in Spanish.

To update: `claude plugin marketplace update goharness`, then
`claude plugin update goharness@goharness`, and restart the session.

**If you had the Spanish edition installed** (`goharness-es`), uninstall it first. Both answer to
the same phrases, so with the two installed you can't tell which one is running a step.

---

## The cycle, in nine steps

| # | Product | Produced by | Asked for by saying |
|---|---------|-------------|---------------------|
| 0 | the project's `CLAUDE.md` | skill `harness-init` | "let's set up the project" |
| 1 | agreed design (in the chat) | skill `brainstorming` | "I want to add X" |
| 2 | `requirements.md` | skill `specify`, phase 1 | "let's write the spec" |
| 3 | `design.md` | skill `specify`, phase 2 | "on to the design" |
| 4 | `tasks.md` | skill `planning-tasks` → workflow `tasks-fanout` | "let's plan the tasks" |
| 5 | code + tests + one commit per task | skill `implement-task` (TDD) | "let's implement T3" |
| 6 | verdict per task (in the chat) | subagent `dod-checker` | "verify T3" |
| 7 | `e2e-tests-plan.md` + `e2e-test-report.md` — **conditional** | skill `verify-e2e` | "let's verify e2e" |
| 8 | hygiene run + closing commit | skill `close-feature` | "let's close the feature" |

Step 0 runs once per repo; steps 1 to 8, once per feature. All the paperwork lives in
`docs/YYYY-MM-DD-<feature>/`.

**Step 7 is not for every feature.** Its `design.md` declares whether there is a navigable
surface —something to open with a URL or a `file://`—, per feature and not per project. Without
one, `dod-checker`'s verdict goes straight to step 8: that is not an exception, it is the path for a
CLI, a library or a job. When there is one, `harness-init` installs Playwright with its
`playwright.config.ts` in step 0, on the same yes — not in step 7, where a missing package costs the
whole feature a wait.

**If the feature has to look like something, the cycle knows.** The same `design.md` declares its
visual reference —none, guiding or binding, and if binding, where it comes from: a design skill or
a file—. The harness names no particular skill: a dashboard design system, a brand or a PNG mockup
all go in the same slot. With a binding reference, brainstorming sorts it piece by piece (adopt /
adapt / discard), `specify` turns what was adopted into criteria, and step 8 asks the person to look
at the app next to the reference before closing.

**Between steps 5 and 6 there is no gate, on purpose.** A task implemented and not verified is in
a limbo you can't tell apart from "half done", so implementing and verifying are one act: the
approval comes after the verdict, and it is **per task** — eleven tasks are eleven cycles.

**When something forces going back, the cycle has a way back.** A badly written criterion, a design
that no longer describes what exists or a missing task are not fixed where they showed up: they
enter through the producer of the highest document they touch —`specify` with a short amendment,
`planning-tasks` for the plan— and cascade down. Every `meets` that relied on what was amended stops
being valid, and its task goes back to `in progress` with the yes. What belongs to another feature
goes to the project backlog, `docs/pendientes.md`, which the next brainstorming reads. The eight
classes and their paths are in the router, under "When something changes midway".

The last three check different things and none replaces another: `dod-checker` asks whether *one
task* meets its criteria; `verify-e2e`, whether *the whole feature* walks; `close-feature`, whether
*all the verdicts are still true together* on the final state. And none of the three answers
whether the screen looks the way it should: that is why, in a navigable feature, step 8 starts with
the person looking at it.

---

## Two languages

The harness writes each project's documents in **one** language, declared in the `Language` slot of
its `CLAUDE.md`. `harness-init` asks for it first.

- **Documents** —the contract, specs, plans, reports and backlog— follow the project's language,
  section titles and keywords included. The templates come in both languages.
- **The chat doesn't.** Each person talks in their own language: a team can talk in Spanish and
  write its documents in English.
- **The keywords are signals between agents.** One agent writes `meets` and another reads it to move
  a task to `done`. Each one has a canonical English form and a Spanish alias (`meets` / `cumple`,
  `done` / `hecho`, `Covers` / `Cubre`…); the agents write the project's form and read both. The
  glossary is in the `task-format` skill.

A few literals stay in Spanish in every project, because they are part of the contract and older
projects depend on them: the modes `--modo corrido` and `--modo autonomo`, the slot markers
`<!-- ranura: … -->` and the backlog file `docs/pendientes.md`.

---

## The three ideas that hold it up

### A single producer per document

`tasks.md` is written **only** by the `tasks-fanout` workflow; the e2e specs, **only** by
`e2e-test-writer`; the report, **only** by `e2e-triager`. Never by hand, never with another
subagent.

The apparent exception proves the rule: in `tasks.md`, each task's `Status` and `Log` are written
by whoever implements it —plus the approval header, once—. That is not a second author of the same
document: they are **different regions with different owners**.

### The gate travels with the step

There is no gate configuration file, deliberately: each gate is prose inside the skill that owns the
step, so you can't read the step without reading its gate. The mode is said **when invoking**
(`--modo corrido`, `--modo autonomo`), not in a JSON.

And waivers have **their own vocabulary, which is never inferred**: "let's implement T3, T4 and T5"
is a list, not a waiver of the gate between tasks.

### `done` means verified

A task moves to `done` **only** with a `meets` from `dod-checker` recorded in its `Log`. Any lesser
result leaves it `in progress`. That turns the `Status` column into the durable record of what is
really finished.

With a twist that took a while to find: **a verdict holds for the state it was taken on**, and it
can become false without the task changing a line. That is why step 8 exists.

---

## The cycle doing its job

The harness was built and tested on a small calculator, over three full features, in Spanish. That
project is frozen as a case study in
[`rarango10/GoHarness-es`](https://github.com/rarango10/GoHarness-es), with every document of the
cycle in view. Its README tells
[six moments](https://github.com/rarango10/GoHarness-es#momentos-donde-el-ciclo-hizo-su-trabajo)
where the scaffolding earned its place; in short:

1. **The deviation the verifier missed and the person caught.** An undeclared dependency passed two
   `meets`; a line-by-line review against the contract found it. The verifier now subtracts the
   dependencies against the contract as a mandatory step.
2. **The half fix that was caught.** A task added the one missing assertion and claimed the whole
   criterion; `dod-checker` returned `partially-meets`. The earlier verdict was marked superseded,
   not erased.
3. **The verdict that is neither yes nor no.** Test workers hung because iCloud was syncing
   `node_modules`; `dod-checker` returned `unverifiable` instead of blaming the code.
4. **A `done` task that stopped being done.** Its goal promised a green `verify` "because the
   `end2end/` folder is empty" — true until step 7 filled it. **Step 8 was born from that case.**
5. **The verifier that stopped rounding up.** In the second feature, two tasks returned
   `partially-meets` on real findings that the earlier version had let through with a footnote.
6. **The deviation seen two tasks later, which reached the document.** A shortcut that departed from
   `design.md` went unmarked in its own task; a later task's log caught it, and `design.md` was
   amended to describe what exists.

If you are going to read a single file there, make it
[`docs/2026-09-07-calculadora-operaciones/tasks.md`](https://github.com/rarango10/GoHarness-es/blob/main/docs/2026-09-07-calculadora-operaciones/tasks.md):
task by task, the goal, the test that started red with its literal message, what was implemented,
and the verdict that let it move to `done`.

---

## The project's contract: `CLAUDE.md`

It is the harness's point of indirection. The skills and agents **don't know** which test runner you
use: they read the commands in the "Verification commands" section and run those.

Yours is produced by step 0: `harness-init` starts from the template that travels inside the plugin
([`assets/en/CLAUDE.template.md`](plugin/goharness/skills/harness-init/assets/en/CLAUDE.template.md),
or its [Spanish twin](plugin/goharness/skills/harness-init/assets/es/CLAUDE.template.md)) and fills
it in by interviewing you. To see how one looks after real features,
[the calculator's](https://github.com/rarango10/GoHarness-es/blob/main/CLAUDE.md) is a good read —
**but don't copy it**: it would bring you Vite, React, Biome and a calculator's stack.

Two things about that template matter more than they seem:

- **It has no "Structure" section**, so putting a file tree in the contract —which is the
  `design.md`'s territory— goes from unlikely to **impossible**.
- **An unfilled slot is a visible question** in the file (`<…: ask before filling in>`). A free
  generation that decided on its own leaves no mark.

---

## What's in the plugin

```
plugin/goharness/
├── SKILL.md                      the router: explains the cycle and routes to the step at hand
├── skills/
│   ├── harness-init/             seeds the project's CLAUDE.md: template + interview
│   ├── brainstorming/            loose idea → agreed design
│   ├── specify/                  requirements.md and design.md, with templates and evals
│   ├── planning-tasks/           checks the spec and launches the workflow. Doesn't plan
│   ├── task-format/              reference: the format of tasks.md and the keyword glossary
│   ├── implement-task/           one task, end to end, up to its verdict
│   ├── verify-e2e/               the end-to-end cycle, in two phases
│   └── close-feature/            the look, hygiene on the final state and the closing commit
├── agents/
│   ├── spec-scout.md             surveys the spec and the repo in one pass     [read only]
│   ├── task-reviewer.md          judges ONE task of the plan                   [read only]
│   ├── plan-reducer.md           synthesizes the verdicts into a plan          [read only]
│   ├── task-writer.md            materializes the plan                         [writes tasks.md]
│   ├── dod-checker.md            is this task really done?                     [read only]
│   ├── e2e-test-writer.md        turns the e2e plan into Playwright            [writes end2end/]
│   └── e2e-triager.md            runs, diagnoses and routes. Doesn't repair    [writes the report]
└── workflows/tasks-fanout.js     scout → N reviewers in parallel → reducer → 1 writer
```

Seven subagents, **three** with write permission, and each one writes a different document.

---

## Status and known limits

The harness works end to end: the full cycle ran three times on the calculator, the second with
nine tasks, 37 tests and six of six e2e cases green. The move to English was checked with the same
evals before and after (`brainstorming` and `specify`, in [`bench/`](bench/)): 44/47 on the Spanish
0.5.2, 45/45 evaluated on the English core.

This is what still doesn't hold on its own, and it is here because a method that doesn't say where
it is fragile reads as if it weren't. The full record is in [`LESSONS.md`](LESSONS.md).

- **The visual reference hasn't run on a real feature yet.** It was born from a redesign that closed
  all green and far from its mockup.
- **The routing of the e2e cycle has never been exercised.** It ran three times and all three were
  green, so the failure path —`causa: test` / `codigo` / `spec`— still has zero runs.
- **There is no independent evidence of TDD order.** The commit per task proves the task was a unit
  of work, not that the test was written first: it brings both together.
- **The approval gates are instructions, not mechanisms.** No tool-call boundary means "the plan was
  approved" — except that the `Workflow` tool's return is an exact boundary, and `planning-tasks`
  uses it.
- **English has a full run; Spanish only has evals so far.** A calculator built from an empty
  folder, in English, ran two features through all nine steps, green, and its findings are being
  fixed ([L64–L70](LESSONS.md#the-english-run-of-phase-6)). The evals run on a Spanish project, but
  a full Spanish feature from the marketplace is still to come: it is the gate before 0.6.0.

---

## Where it comes from

The harness was built in
[`rarango10/10X-mis-finanzas`](https://github.com/rarango10/10X-mis-finanzas), now archived, and
matured in [`rarango10/GoHarness-es`](https://github.com/rarango10/GoHarness-es) alongside the
calculator. It moved here, in English and without the example app, so that people who don't read
Spanish can use it, read its skills and propose changes. The plugin's git history and its tags
(`goharness--v0.3.0` onwards) came along; the plan of the move is in
[`docs/2026-09-29-founding-plan/`](docs/2026-09-29-founding-plan/plan.md).

## License

[Apache-2.0](LICENSE). Copyright 2026 Raul Arango — see [`NOTICE`](NOTICE).
