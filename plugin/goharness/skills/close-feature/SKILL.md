---
name: close-feature
description: "Closes a finished feature: if it has a screen, it asks the person to look at it —against its visual reference, if the design declares one— before anything else; it runs the full hygiene command on the repo's final state, checks that all of dod-checker's verdicts are still true together, and makes the closing commit. A red moves the affected task down to in progress and hands it back to TDD. It is step 8 of the cycle. Use it when the person says, in English or Spanish, 'let's close the feature / cerremos la feature', 'let's commit / commiteemos', 'ready to commit / listo para commitear', 'we're done with X / ya terminamos X', or when every task is done and the e2e cycle has closed. It doesn't repair code, doesn't touch the task plan and doesn't approve anything: if something comes out red, it names the task that goes back to in progress and hands the fix back to the implement-task skill."
---

# Close Feature

Step 8, and the last of the cycle. For a long time it was mentioned in prose and had no row in the
table — which made it look like red tape. It isn't, and the skill's name says so: **it isn't "make
the commit", it is closing the feature**. The commit is the end; what matters is the run that comes
before.

## A verdict is taken on a state

It is the main reason for this step, so it's worth having it clear before the procedure. The other
one is simpler: in a feature with a screen, this is the only moment of the cycle when someone looks
at it (step 2 of the procedure).

`dod-checker` verifies **one task, at one moment**. Its `meets` is true for the repo as it was when
it took it. Nothing guarantees it stays true afterwards, and **a task can become a lie without its
code changing a line**.

It happened, and the case is worth more than the rule: a task was verified with `end2end/` empty and
its `meets` was correct **then**. Two steps later the e2e cycle populated that folder, the unit test
runner started picking up the Playwright specs, and the command the task declared green turned red.
The task wasn't touched. The verdict aged.

The most uncomfortable part of the case: that task's own `Goal` said the empty folder was "the
expected result until `e2e-test-writer` writes them". **The plan knew the state was going to change
and there was no place to use that information.** This step is that place.

| | What it asks | About what |
|---|---|---|
| Step 6 · `dod-checker` | does this task meet the criteria it claims to cover? | one task, at one moment |
| Step 7 · `verify-e2e` | does the whole feature work? | the feature, at one moment |
| **Step 8 · this skill** | **are all the verdicts still true *together*?** | **the repo, in its final state** |
| **Step 8 · the person** | **does it look the way it had to look?** | **the screen, next to its reference** |

**Verifying task by task doesn't guarantee the whole.** It is the same distinction that separates
step 6 from step 7, one level up.

## When it applies

- The whole `tasks.md` table is `done`.
- If the feature had an e2e cycle, closed and green.

If a task is still `pending` or `in progress`, this isn't the closing: say so and stop. Nothing is
lost — each task already has its commit with its id, so the work done is saved anyway.

## The procedure

1. **Look at the state before running anything.** The `tasks.md` table, and `e2e-test-report.md` if
   it exists. Say in one line what you are going to close and how many tasks it brings.

   **And check whether any `done` went stale because of an amendment.** If `requirements.md` or
   `design.md` say `amended (…): <ids>`, cross those ids with the `Covers` of each `done` task and
   with the date of its `**Verification:**`. A `meets` earlier than the amendment of a criterion the
   task covers was taken on a text that is no longer current: it is treated as a red, with the same
   routing as "What to do with a red". `implement-task` checks it when starting; this is the net for
   when the amendment arrived after the last task.

2. **If the feature is navigable, the person looks at it before the hygiene.** Read `## Surface` and
   `## Visual reference` of `design.md` (`## Superficie` and `## Referencia visual` in a Spanish
   project). If the surface is navigable, this step isn't optional: **it is the only point of the
   cycle where someone sees what was built**. `dod-checker` verifies code against criteria,
   `verify-e2e` verifies behavior and hygiene verifies that the repo is healthy. None of them answers
   "does this look the way it had to look?". It happened: a redesign closed with everything green and
   the person saw it for the first time after the closing commit, very far from the mockup it had to
   respect.

   Tell them how to open it —`## Surface` says so— and what to look at it against:

   - **Binding reference with a skill as source:** invoke the skill and pass them its checklist, to
     walk it with the app next to the reference.
   - **Binding reference with a file as source:** the list is the adopt / adapt / discard table of
     `## Visual reference`. They open the file next to the app.
   - **Guiding or none:** it's enough to look at it and ask yourself whether you'd show it to whoever
     asked for the feature.

   **The person decides, and you wait for their answer before continuing.** If you can take
   screenshots, they help, but they don't replace their eyes. A design written before the
   `## Visual reference` section existed doesn't have it: ask whether there was something it had to
   look like.

   Whatever shows up **isn't fixed here**, and it's routed according to which criterion covers it:

   - **It contradicts a criterion a task covers** → it is a red like any other: the task moves down
     to `in progress`. See "What to do with a red".
   - **No criterion covers it** —the typical case: a piece of the reference that never reached the
     spec— → there is no task to reopen, and this step doesn't create tasks. It is a gap in the spec.
     Name `specify` to add the criterion (an amendment) and `planning-tasks` for the plan, and stop.
     If the person decides to leave it for another feature, write it in the `## Follow-ups` of
     `tasks.md` with recipient `[backlog]` and continue: the "The backlog" step, below, moves it when
     closing.

   A non-navigable feature skips this step.

3. **Run the hygiene command, complete, once.** The one `CLAUDE.md` declares as such — not the
   correctness one, which belongs to step 6.

   Two shortcuts not to take, because both cancel the whole step: **don't narrow it** to this
   feature's tests, and **don't skip it** because each task already ran its own. Each task ran on
   *its* state; none ran on *this* one. That the parts passed separately is exactly the claim this
   step comes to check, so it can't also be its excuse for not checking it.

   If some leg of the hygiene command doesn't apply today —an e2e runner with no app to navigate, a
   dependency not installed— say so explicitly instead of letting it run and counting the failure as
   a finding. A red from missing scaffolding doesn't reopen any task.

4. **Green → contract, dependencies, backlog and closing commit.** Sections below, in that order.

5. **Red → routing.** Section below. **Present the red and what you plan to do with it before
   touching `tasks.md`**: moving a task down from `done` mutates the only durable record of what is
   finished, and that isn't done without a yes.

## What to do with a red

**Don't fix it here.** For the same reason the e2e cycle doesn't repair code: it would be a second
writer of `src/`, it would skip the TDD the project sets as a rule, and it can close the symptom
leaving the cause. This step diagnoses and routes.

**Before looking for the task, check whether the red is already known.** If a test fails that
**matches an open entry in the backlog** —`docs/pendientes.md`, or a `[backlog]` line of this
feature—, it isn't this feature's: retry that leg once, record the literal result in the existing
entry (not in a new one), and don't reopen any task. If the test isn't in the backlog, it is a red
like any other: **don't assume it is the known one** because it looks alike. The match is by the
test's name or the file, not by family resemblance.

1. **Identify the affected task.** The failure points to a criterion, a file or a command; the task
   is the one that covers it. If the red isn't any particular task's —project configuration, a
   runner picking up what isn't its business— **the affected task is the one that declared that
   command would stay green**. If it's still unclear, ask: guessing which one drops from `done` costs
   more than asking.

2. **Move it down to `in progress`** in its `Status` cell, and record in its `Log` which red
   reopened it, with the literal failure. The previous verification line **is marked**
   `**Previous verification (superseded):**`, not deleted: it was correct when it was taken, and that
   is precisely what this step teaches. A verdict that aged isn't a verdict that was wrong.

3. **Hand it back to step 5** by naming `implement-task`, and stop. The fix is the usual TDD, and
   the task goes back to `done` **only with a new `meets`, taken on the final state**. Don't start
   the repair in the same message.

4. **When it comes back, this step is redone in full.** It isn't enough for the specific red to turn
   green: the hygiene run is done again, complete, because the fix changed the state again.

## The contract, reread

`CLAUDE.md` was written before this feature, and the feature may have made one of its sentences
false without touching it: it happened with a "the repo has no copy of the system" that became a lie
the day a task ported the system into the code, and nobody saw it, because no task touches the
contract and no verifier reads its prose. A false sentence there is worse than a missing one: every
agent reads it.

Reread the sentences **about state** —the Stack, the project's own rules, the sources it names—
against the final repo. Not the method's, which don't depend on the feature. If one became false,
**don't fix it here**: name `harness-init` in review mode, which is its producer, and stop until it
comes back. If they are all still true, say so in one line and continue.

## The dependencies

If `CLAUDE.md` declares a dependency auditor, run it on the final state. **It is informative, and it
blocks only what this feature brought.** To tell them apart, look at the manifest's diff since before
the feature's first commit (`git log --oneline -- <manifest>` and `git diff`, read only):

- **A vulnerability in a package the feature added or bumped** is the feature's. It is a red: the
  task that brought that package moves down to `in progress`, with the routing of "What to do with a
  red".
- **An inherited vulnerability** —the package was already there, with that version, before the
  feature— is reported and doesn't block. If it isn't in the backlog, it goes in as a new entry in
  the next step. Its fix is almost always a version jump of the toolchain, and that is a feature of
  its own: done here, it would invalidate every verdict of this one.

If the contract says "none" or doesn't have the slot, say so in one line and continue: the missing
slot is a finding for `harness-init`, not a red of this feature.

## The backlog

What this feature found that belongs to another isn't lost with it. With hygiene green and before
the closing commit:

1. **Move each `[backlog]` line of `## Follow-ups`** to the project backlog —`docs/pendientes.md`,
   unless `CLAUDE.md` names another place—. If the file doesn't exist, create it from
   `assets/<lang>/pendientes-template.md`. Each new entry takes the next `P<n>`, which is never reused, and
   carries what the template says: where it came from, the evidence, what is known and what isn't,
   and what **not** to do. In `Follow-ups` the line stays, with the id it was moved to at the end:
   `→ P4`. Don't delete it: it is the region of whoever wrote it.
2. **If the feature took backlog entries** (the `## Scope` of `requirements.md` names them), move
   their state to `resolved` (`resuelto`) with the date. The closing commit's hash doesn't exist yet:
   it is filled in with the feature's folder, which is enough to find it.
3. **If the project uses a tracker instead of the file**, don't write it yourself: list the entries
   to create, with their text ready, and let the person load them. Publishing to an external service
   isn't done without their yes.

In the backlog you write only **new entries** and the **state** of the ones this feature took. The
rest of each entry belongs to whoever wrote it, just like in `Follow-ups`.

## The closing commit

It brings what the tasks didn't commit: the step 7 documents (`e2e-tests-plan.md`,
`e2e-test-report.md`), the `end2end/` specs, `docs/pendientes.md` if you touched it, and the
configuration adjustments that came out of this step. **It doesn't replace or squash the per-task
commits** — each one has its id and its diff, and that staggering is what makes `git log` work as a
record. This one's message names the feature, not a task.

**If nothing was left uncommitted, say so and finish.** Don't fabricate an empty commit to have one:
the value of this step is the run, not the commit. A legitimate closing may consist of "hygiene came
out green and there was nothing pending to commit".

## What this step doesn't do

- **It doesn't repair code or tests.** It routes to `implement-task`.
- **It doesn't touch the plan.** Which tasks exist and their ids belong to the `tasks-fanout`
  workflow. This step moves `Status` and writes `Log` and `Follow-ups`, which are the region of
  whoever implements — and at this moment of the cycle, whoever implements is this session.
- **It doesn't approve anything.** If a spec document was left unapproved, it is a finding to
  report, not something to record here.
- **It doesn't decide the feature is good.** It decides the repo is healthy with it inside. Whether
  it looks the way it had to look is decided by the person, looking at it in step 2: this skill gives
  them what to open and what to compare it against, not the verdict.
- **It doesn't create tasks.** A finding from the look that no criterion covers goes to `specify` and
  `planning-tasks`, not to a task invented here.
- **It doesn't fix what's in the backlog.** It records it and acknowledges it; the feature that
  picks it resolves it.
- **It doesn't edit `CLAUDE.md`.** If the contract was left lying, `harness-init` fixes it in review
  mode.

## When finished

With the commit made —or with the record that it wasn't needed— the feature is closed. Say so, name
what was left in the `Follow-ups` of `tasks.md` and the `P<n>` entries added to the backlog, if
anything, and stop. The next feature starts at step 1, with `brainstorming`.

## This skill's files

The templates come twice, in `assets/en/` and `assets/es/`: `<lang>` is the project's language.

- `assets/<lang>/pendientes-template.md` — structure of the project backlog, with its owner and reader
  rules. It is copied to `docs/pendientes.md` the first time a feature leaves something for another.

Keywords go in the project's language (see the glossary in `task-format`): in a Spanish project,
`hecho`, `en curso`, `cumple`, `**Verificación previa (superada):**`, `## Pendientes` and the
backlog's `resuelto`.
