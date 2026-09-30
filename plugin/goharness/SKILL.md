---
name: goharness
description: "Explains this harness's assisted development cycle and routes to the piece that handles each step. Use it when the person asks how work is done here, what the next step is, which skill fits what they want to do, or when they ask to start a feature and it is not clear where in the cycle they are — in English or Spanish: \"what's next? / ¿qué sigue?\", \"how do we work here? / ¿cómo se trabaja acá?\". It produces no document of its own: it names the skill that does."
---

# Harness — the cycle and its routing

This plugin brings a nine-step development cycle, counting step 0, which prepares the project. Each
step produces an artifact, stops and waits for human approval. **No step starts the one after it:
it names it.**

| # | Product | Produced by | Asked for by saying |
|---|---------|-------------|---------------------|
| 0 | the project's `CLAUDE.md` | skill `harness-init` | "let's set up the project / preparemos el proyecto", "there's no CLAUDE.md / no hay CLAUDE.md" |
| 1 | agreed design (in the chat) | skill `brainstorming` | "I want to add X / quiero agregar X", "how do we build Y / cómo construimos Y" |
| 2 | `requirements.md` | skill `specify`, phase 1 | "let's write the spec / escribamos el spec" |
| 3 | `design.md` | skill `specify`, phase 2 | "on to the design / pasemos al diseño" |
| 4 | `tasks.md` | skill `planning-tasks` → workflow `tasks-fanout` | "let's plan the tasks / planeemos las tareas" |
| 5 | code + tests | skill `implement-task` (TDD) | "let's implement T3 / implementemos T3", "next one / seguimos con la que sigue" |
| 6 | verdict per task (in the chat) | subagent `dod-checker` | "verify T3 / verificá T3" |
| 7 | `e2e-tests-plan.md` + `e2e-test-report.md` — **conditional** | skill `verify-e2e` | "let's verify e2e / verifiquemos e2e" |
| 8 | hygiene run + closing commit | skill `close-feature` | "let's close the feature / cerremos la feature", "let's commit / commiteemos" |

**Step 7 is not for every feature.** It applies only if the feature's `design.md` declares a
navigable surface — something Playwright can open. A feature without an interface (a CLI, a
library, a job) finishes its tasks in `done` and jumps straight to step 8: that is not an exception,
it is the path for that kind of feature.

All of a feature's paperwork lives in `docs/YYYY-MM-DD-<feature>/`.

**Each document has a single producer.** If a phrase leaves you torn between two skills, this table
wins. And if the project's `CLAUDE.md` brings its own routing table, **the project's wins**: this
skill describes the default cycle, it does not impose it on a repo that already decided.

## Language

The harness's instructions are in English; the project writes in its own language. **The project's
language is the one the `Language` slot of its `CLAUDE.md` declares** (`<!-- ranura: idioma -->`);
a contract from before that slot existed uses the language it is written in. In that language you
write every document of the cycle: prose, section titles and keywords. The keywords (`done`,
`meets`, `Covers`, `Log`…) have a canonical English form and a Spanish alias; the glossary in
`task-format` maps them.

**The chat is not bound by it**: talk with each person in the language they write in. A team can
talk in Spanish and write its documents in English. The canned phrases the skills bring —a
question, a warning, a summary line— are part of the chat: translate them when saying them.

The document templates come in both languages, in `assets/en/` and `assets/es/` of each skill.
Where a skill or agent says `assets/<lang>/…`, `<lang>` is the project's language.

If the project has no `CLAUDE.md` yet, `harness-init` asks for the documents' language and writes it
in the contract; from then on the contract decides.

## What the harness expects from the project

The skills and subagents don't know your stack. They read the project's `CLAUDE.md`, which has to
declare at least:

- **Verification commands** — that is where `spec-scout`, `dod-checker`, `task-reviewer` and
  `e2e-triager` get what to run. Without that section they don't know how to check anything. It is
  best to separate two slots: the **correctness** command (typecheck + tests), which is the one for
  steps 5 and 6, and the **hygiene** command (lint, format, build, e2e), which is the one for step 8.
  With lint inside the first one, a formatting complaint makes a task's verification fail for a
  reason unrelated to its criterion.
- **Stack and rules** — the project's contract, which `specify` respects when designing.

If the project has no `CLAUDE.md`, **don't invent it and don't assume `npm`**: that file has a
producer, and it is the `harness-init` skill of step 0. Name it and stop there — seeding it by hand
is exactly what made taking the harness to another repo manual work.

## The four rules that hold the cycle up

<!-- regla: single-producer -->
1. **A single producer per document.** The plan in `tasks.md` is written only by the
   `tasks-fanout` workflow; the e2e tests, only by `e2e-test-writer`; the e2e report, only by
   `e2e-triager`. Never by hand, never with another subagent.

<!-- regla: progress-by-implementer -->
2. **Progress is written by whoever implements**, and only in the regions of the task they are
   doing: its `Status` cell and its `Log` block — plus the approval header of `tasks.md`, once,
   when the person confirms the plan. This is not an exception to the previous rule — they are
   different regions with different owners. The only thing forbidden is implementing while a
   `tasks-fanout` run is in flight.

<!-- regla: task-is-the-unit -->
3. **The unit of step 5 is the task, not the phase.** Eleven tasks are eleven cycles, each closed
   by a `dod-checker` verdict and its approval. The gate between tasks is waived only with
   `implement-task`'s vocabulary (`--modo corrido`), never by inference; each task's verification
   and the stop on a lesser verdict are never waived. And the second round of the same task —when a
   verdict came out lower than `meets`— also waits for the yes, always: it is not "the next task",
   so `--modo corrido` does not reach it.

<!-- regla: done-means-verified -->
<!-- regla: verdict-on-a-state -->
4. **`done` means verified, and on a given state.** A task moves to `done` only when `dod-checker`
   returned `meets` and that verdict was recorded in its `Log`; any lesser result leaves it
   `in progress`. And that `meets` holds for the repo as it was when it was taken: it can become
   false without the task changing, so step 8 checks it again on the final state and a red there
   reopens the task. The `Status` column is the durable record of what is truly finished.

## When something changes midway

The cycle above goes forward. This section is the way back: what to do when, in the middle of a
feature, something shows up that forces touching the spec, the plan or what is already implemented.

**The rule, in one line:** *a change enters through the highest document it touches, cascades down
through its producers, and every verdict that relied on what changed stops being valid.*

**1. Stop and classify.** Whoever detects it —`implement-task`, `dod-checker`, `e2e-triager`,
`close-feature`— does not fix it where they found it. They record it in the `Log` of the task in
progress (or in their step's report), put it in a class and name the path:

| Class | Question that tells it apart | Path |
|---|---|---|
| Bug in the task in progress | Does it break, or is it missing from, what I'm doing? | TDD of the same task |
| Bug in another `done` task of this feature | Does it contradict another task's `meets`? | That task drops to `in progress`, with the yes, and goes back to `implement-task` |
| The *how* changed, not the *what* | Do the criteria stay the same while `design.md` no longer describes what exists? | Amendment of `design.md` with `specify` |
| The *what* changed | Does a criterion have to be corrected, added or made obsolete? | Amendment of `requirements.md` with `specify`, and cascade |
| The plan is wrong, the spec isn't | Is a task missing or extra, or is a `Covers` wrong? | `planning-tasks` |
| A decision is needed now | Is it impossible to continue without the person choosing? | `[decide now]` in `Follow-ups` |
| It belongs to another feature | Is it another feature's code, or something cross-cutting: toolchain, runner, dependencies? | `[backlog]` in `Follow-ups`, and `close-feature` moves it to the project backlog |
| The feature itself changed | Did the problem it solves change, or does the amendment leave much of the plan without a purpose? | `brainstorming`; the person decides whether this feature closes with what it has |

When in doubt between two classes, **the higher one**: treating a wrong criterion as a bug covers
it up with code; treating a bug as a wrong criterion costs a short amendment.

**A major jump of the runner or the toolchain always belongs to another feature.** It invalidates
every existing verdict at once, and its verification is a different one: that the whole suite stays
green with the new tool. Done in the middle of a feature, it contaminates it.

**2. The amendment.** `specify` makes it, on an already approved document: **only what changed**
is presented, the yes is awaited and it is committed separately. The header becomes
`approved (…) · amended (…): <ids>` and the document gains a line in `## Amendments`. Nothing is
renumbered: a criterion whose meaning changes is marked obsolete and is born with a new id.

**3. What stops being valid.** A `meets` holds for the state of the code it was taken on, and also
for the text of the criterion it verified. A `done` task whose `Covers` has an id amended **after**
its verification is no longer verified: it goes back to `in progress`, with the person's yes, and
whoever implements moves it back, because `Status` and `Log` are their region. It is detected by
`implement-task` when it starts and, as a safety net, by `close-feature`.

**4. The re-plan.** If the amendment added, removed or made criteria obsolete, the plan is redone
with `planning-tasks`; its reviewers see `## Amendments`. A plan that changes asks for approval
again.

**5. Resume** with `implement-task`. While an amendment or a re-plan is open, nothing is
implemented: it is the same reason nothing is implemented with `tasks-fanout` in flight.

**The project backlog** is `docs/pendientes.md`, unless the `CLAUDE.md` names another place (a
tracker). What belongs to another feature lives there, with an id `P<n>` that is never reused.
`close-feature` writes it when closing each feature (it moves the `[backlog]` lines and resolves
the ones the feature took), `specify` marks it when a feature takes an entry, and `brainstorming`
reads it before exploring a new idea. `dod-checker` does not read it, on purpose: a verifier with a
list of "known failures" learns to dismiss reds.

## Environment requirement

Step 4 uses a dynamic workflow. If the `Workflow` tool doesn't exist, you have to turn on
`"enableWorkflows": true` in `~/.claude/settings.json` (or `/config` → Dynamic workflows) and open
a **new session**: the workflow registry is built at startup. Without that, `planning-tasks` can't
launch anything — and the right path is to unblock it, not to plan `tasks.md` by hand.
