---
name: specify
description: "Writes a feature's spec in two phases, each with its approval gate: requirements.md with acceptance criteria in EARS notation, and design.md with architecture, interfaces, data models, errors and testing strategy. The task plan (tasks.md) is NOT this skill's job: it is the next step and the planning-tasks skill does it. Use this skill as soon as there is an approved design from brainstorming, or when the person says, in English or Spanish, 'let's write the spec / escribamos el spec', 'let's document the requirements / documentemos los requisitos', 'let's spec X / hagamos el spec de X', 'let's define the acceptance criteria / definamos los criterios de aceptación', 'on to the design / pasemos al diseño', or asks to put in writing what a feature has to do before coding it. It is the step after brainstorming and before the task plan — it documents what has to be built and how, but it doesn't write code or plan the tasks."
---

# Specify

Turn an already clarified idea into an executable spec: first **what** the system has to do
(`requirements.md`), then **how** it is built (`design.md`). **In what order it is done**
(`tasks.md`) comes afterwards and is not this skill's work: the `planning-tasks` skill builds it
with the `tasks-fanout` workflow.

The project's workflow is: brainstorm → **requirements + design (this skill)** → task plan
(`planning-tasks`) → TDD implementation → verification → commit. This skill covers the first two
phases of the spec and stops there.

## Before starting

This skill starts from an idea that was already discussed and agreed. If you arrive without that
—the person dropped a loose idea, the scope is still ambiguous, or no approach has been agreed
yet— don't invent the requirements: propose going through brainstorming first. A spec built on
your own assumptions looks tidy and still documents the wrong feature, and the cost of finding out
only shows up during implementation.

If the design already comes approved from a brainstorm, don't ask again what was already decided:
read it from the conversation and use it. Making people repeat decisions already made is the
fastest way for the spec to feel like bureaucracy.

The reverse holds too: a brainstorm fixes the shape of the feature, not every detail needed to
write verifiable criteria. Date format, decimal separator, whether the CSV has a header, where the
data is persisted, what exit code the command returns — none of that is usually discussed while
designing, and yet without it no criterion can be tested. When something like that is missing, ask
**before** writing and all together in one message: here you are not exploring the idea (that part
is over), you are closing specific gaps, and a short list gets answered in one sitting.

The criterion for whether to ask: **can you write a test that fails without that piece of data?**
If you can't, ask. If the data doesn't change any criterion, pick the reasonable option, keep
going, and write it down under **Assumptions** — that is what that section is for. For visuals, the
equivalent question is **can you point at the difference by opening the screen next to the
reference?**

**If brainstorming agreed on a binding visual reference**, every piece its table marks `adopt` or
`adapt` has to end up as a criterion in `requirements.md` —of inventory, structure, component or
token, see "Appearance criteria" in `references/ears-patterns.md`—, and the whole table is copied
to the `## Visual reference` section of `design.md`. An adopted piece that doesn't reach a criterion
is invisible to the rest of the cycle: nobody implements it on purpose and nobody notices it is
missing.

Be careful with what you do next with those answers. They will reach you at implementation level
—"in `data/movements.json`", "exit code 2"— and an acceptance criterion describes observable
behavior, not mechanism. Before transcribing one, ask yourself whether the person cares about
**that concrete value** or only that the behavior happens. If what they need is for the movements
to still be there the next time they open the app, that is the criterion; the file path is an
assumption now and a design decision later. If instead the exact value **is** the requirement,
because something external depends on it, then it does go in the criterion — and say what depends
on it, so it's clear why it is fixed.

## Why requirements before design

Separating the "what" from the "how" keeps the design honest: if you start with the solution, the
requirements end up written to justify what you already decided to build. Written first, and in the
form condition → observable behavior, the acceptance criteria turn directly into the next phase's
tests — which is exactly what a project working with TDD needs.

## Phase 1 — Requirements

1. **Pick the folder**: `docs/YYYY-MM-DD-<feature-in-kebab-case>/`, with today's date and a short,
   descriptive name (`docs/2026-09-04-import-csv/`). One focused spec per feature, not a monolithic
   document.
2. **Write `requirements.md`** following `assets/<lang>/requirements-template.md`.
3. **Write the criteria in EARS**: prose in the project's language, keywords in English (`WHEN`,
   `IF`/`THEN`, `WHILE`, `WHERE`, `THE SYSTEM SHALL`). They work as formal vocabulary, like SQL's
   keywords. The patterns, examples and typical mistakes are in `references/ears-patterns.md` —
   read it if you're unsure which one applies or how to phrase something that doesn't fit the
   simple pattern.
4. **Number everything**: requirements `R1`, `R2`… and criteria `R1.1`, `R1.2`… The design and the
   tests are going to reference them, and that traceability is what later lets you verify nothing
   was left uncovered.
5. **Bound the scope**: include only what was agreed, and make explicit what stays out for now. One
   requirement too many is one feature too many that someone is going to build.
6. **Reread every criterion looking for conjunctions, before presenting.** One criterion, one
   behavior: if it says "show two editable fields **and** a third read-only one", that is two
   criteria, not one. It is a short pass and it has to be done explicitly, because the cost of
   skipping it isn't paid here but two steps later: a compound criterion gets half covered —one
   clause with a test and the other without— and the verifier has no way to say so, because its
   vocabulary has one verdict per criterion and not per clause. You end up with a `meets` on
   something that is only half tested.
7. **Present and wait for approval**: say in the chat which requirements were left (the titles are
   enough, don't repeat the whole file), where the file is, and what assumptions or open questions
   you wrote down. **Also say what that yes unlocks**: if it's approved, phase 2 follows, which turns
   these criteria into `design.md`. Then stop.

   Naming the next step **when asking** for approval and not afterwards is not a courtesy detail:
   whoever approves has to know what they are approving toward. If the step's name only arrives
   with the "ok, approved", the chain can only be discovered in hindsight — you find out what you
   authorized after having authorized it.

Don't move to design until you have a yes. If the answer brings changes, adjust the file and ask for
approval again.

**When the yes arrives, record it in the file right away**: the header of `requirements.md` becomes
`> Status: approved (YYYY-MM-DD)` (in a Spanish project, `> Estado: aprobado (AAAA-MM-DD)`). The
approval happens in the chat and the chat gets lost; what stays is the header, and it is what
`planning-tasks` reads to decide whether the spec is ready, and what the workflow's scout reads on
the next run. An approved document that shows as pending is treated as not approved. **Commit that
change right there**: whoever receives the yes for a document commits it, and without that the file
stays floating until the first task's commit, mixed with another step's work.

## Phase 2 — Design

Before writing anything, **reread the approved requirements looking for problems**: ambiguities,
criteria that contradict each other, gaps between what is asked and what would be needed for it to
work. If you find something, say it and resolve it with the person instead of covering it with a
decision of your own — it's much cheaper here than halfway through the implementation.

When a new criterion comes out of that review —it happens often, that is exactly what it's for—
add it to `requirements.md` with two precautions:

- **Number at the end, never renumber.** The ids are already quoted in what has been written so far
  and will end up in the test names. If a criterion was wrong, correct it or mark it obsolete in
  place; reusing its number silently breaks references.
- **Say what changed and confirm it.** The approval was on what the person read. Name the criteria
  you added and wait for a yes before continuing with the design — it's a short exchange, not a full
  re-approval of the document, but without it the approved document and the one that exists stop
  being the same.

Then:

1. **Write `design.md`** in the same folder, following `assets/<lang>/design-template.md`.
2. **Reference the requirements**: every design decision exists to satisfy something. Link sections
   with the ids (`R1.2`) and, in the testing strategy, map which test covers which criterion.
   **Separate state criteria from effect criteria**: if the feature has client-side JavaScript, the
   effect ones —what changes on screen when interacting— need a test DOM declared in the design,
   and "the e2e confirms it" doesn't work for a criterion a task is going to cover. Ruling out the
   test DOM is a valid decision only if no effect criterion stays in a task's `Covers`; if it is
   ruled out, say which ones stay "e2e only". That consequence only shows up in step 6, two steps
   after this approval, and that is why it has to be named here.
3. **Design for what exists**: follow the patterns of the existing code and the rules `CLAUDE.md`
   declares — its stack, its verification commands, and the restrictions the project set for itself
   (for example, not adding dependencies without need). If a new dependency or layer seems
   necessary, justify why the requirement can't be satisfied without it.
4. **Keep a record of what was ruled out**: which alternatives you considered and why not. That
   avoids discussing the same thing again in three weeks.
5. **Present and wait for approval**, same as in phase 1: when asking for the yes, also say what it
   unlocks —the task plan, which `planning-tasks` builds by launching a workflow with one agent per
   task— so whoever approves knows what they are authorizing and at what cost. And when the yes
   arrives, **record `> Status: approved (YYYY-MM-DD)` in the header of `design.md` right away, and
   commit the change**, for the same reason as in phase 1.

**If the just-approved design declares a navigable surface**, before naming the next step run the
Playwright doctor (`node <verify-e2e-path>/scripts/e2e-doctor.cjs`, with the project's path). It
may be the project's first feature that needs an interface: if the doctor fails, don't fix it
yourself — name the `harness-init` skill **in review mode** (it seeds `playwright.config.ts`, asks
for the yes to install the dependency and adds the `e2e` leg to the hygiene command) and wait for it
to come back before continuing with `planning-tasks`. Detecting it here, with the design just
approved, costs a short review; detecting it in step 7 costs the whole feature already implemented.

Once the design is approved (and, if it applies, with the doctor green), say that the next step is
the **`planning-tasks`** skill, which checks the spec and launches the dynamic workflow
`tasks-fanout`: one reviewer per task in parallel, a reducer that synthesizes the verdicts and a
single writer at the end. Name it, don't start it: just as `brainstorming` itself names `specify`
without invoking it, chaining it here would skip the design approval gate it just passed. That
`planning-tasks` now knows how to trigger the workflow on its own doesn't change that — it makes
over-chaining easier, not more acceptable.

## The format of `tasks.md` is not this skill's

The **plan** in `tasks.md` —which tasks there are, their ids, their order, their `Covers`— is
written only by the `tasks-fanout` workflow, which `planning-tasks` triggers; each task's `Status`
and `Log` are written by whoever implements. Don't write the plan by hand or delegate it to a
subagent with write permission: the workflow exists so the plan has a single writer. If the
workflow isn't available, the right step is to unblock it, not to improvise the plan.

The file's format rules and its template live in the reference skill `task-format`. They are
separate from this skill on purpose: the agents that need them preload them without also loading
the mandate to write a spec.

## After the tasks are approved

Stop there. Say that the spec is complete —`requirements.md`, `design.md` and `tasks.md`— and that
the next step is the TDD implementation, starting with T1's first red test. Don't start it: it is
another step of the workflow, not part of this skill.

A short or informal approval ("ok", "go", "sure" / "dale", "va", "listo") approves the document you
presented, nothing more. Don't read it as permission to chain the next phase in the same message:
approving the requirements is not approving the design, approving the design is not approving the
tasks, and approving the tasks is not asking for code.

## Amendments: when the spec changes after being approved

You arrive here from another step: `implement-task` found a wrong criterion or a design that no
longer describes what exists, `verify-e2e` routed `aSpecify`, `close-feature` found something no
criterion covers. It is the way back of the cycle, and the classes that trigger it are in the
router, in "When something changes midway".

**You write only `requirements.md` and `design.md`.** Never `tasks.md`, even if the amendment leaves
a task without a purpose or asks for a new one: the plan is redone by `planning-tasks`, and a task's
`Status` is moved by whoever implements. A document left describing old requirements is worse than
not having it, because it reads as if it were current — that is why the amendment names everything
that is affected, even what it doesn't touch.

1. **Start with the highest document it touches.** If a criterion changes, it is
   `requirements.md`, and then you ask whether it drags the design along. If only the how changed
   —the criteria stay the same—, it is `design.md` and nothing else.
2. **Same numbering rules as in phase 2:** new criteria go at the end and nothing is renumbered. A
   criterion that **changes meaning** is not rewritten in place: it is marked
   `(obsolete — see R3.5)` and is born with a new id. Correcting the wording without changing the
   behavior (a typo, an ambiguity that doesn't move any test) is done in place and amended anyway.
3. **Record the amendment in the document.** A line in `## Amendments` —date, ids, what changed,
   where it came from (`T7`, step 7, closing)— and the header becomes
   `> Status: approved (YYYY-MM-DD) · amended (YYYY-MM-DD): R3.2, R3.5`. If it already had
   amendments, the list of ids accumulates.
4. **Present only what changed and wait for the yes.** It is a short approval, not a re-approval of
   the document. When asking for it, say what it unlocks: which `done` tasks cover the amended ids
   and will go back to `in progress`, and whether re-planning is needed (it is if criteria were
   added, removed or made obsolete). With the yes, **commit the amendment separately**:
   `Amendment <feature>: R3.2, R3.5`.
5. **Name the next step and stop.** `planning-tasks` if the set of criteria changed; if not,
   `implement-task`, which detects the tasks to reopen when it starts. Don't reopen tasks yourself:
   `Status` and `Log` are not your region.

**If the amendment redefines the feature** —it changes the problem it solves, or leaves much of the
plan without a purpose—, it is not an amendment: say so and name `brainstorming`. The person decides
whether this feature closes with what it has and the rest is a new feature.

## If the feature takes backlog entries

If brainstorming agreed that this feature resolves entries of `docs/pendientes.md` (or of the
tracker `CLAUDE.md` names), name them in the `## Scope` of `requirements.md` by their id (`P2`), and
when committing the approval of `requirements.md` move their state to `in <feature-folder>` in the
backlog. Only that cell: the rest of the entry belongs to whoever wrote it. `close-feature` moves
them to `resolved` when closing.

## This skill's files

The templates come twice, in `assets/en/` and `assets/es/`: `<lang>` is the project's language.

- `assets/<lang>/requirements-template.md` — structure of `requirements.md`
- `assets/<lang>/design-template.md` — structure of `design.md`
- `references/ears-patterns.md` — the 5 EARS patterns, examples and typical mistakes

Keywords, section titles and the header's states go in the project's language: in a Spanish
project, `Estado`, `aprobado`, `enmendado`, `## Alcance`, `## Supuestos`, `## Enmiendas`,
`(obsoleto — ver R3.5)`, and the backlog's `en <carpeta>` and `resuelto`.
