---
name: implement-task
description: "Implements ONE task of a feature's tasks.md, end to end: marks it in progress, writes the first test in red, implements the minimum for green, invokes dod-checker without asking, records the verdict in the Log and commits with the task's id in the message. It is step 5 of the cycle. Use it when the person says, in English or Spanish, 'let's implement T3 / implementemos T3', 'let's do T5 / hagamos T5', 'let's start implementing / arranquemos con la implementación', 'next one / seguimos con la que sigue', or when an approved tasks.md has pending tasks. It doesn't write the task plan —only the tasks-fanout workflow does that— nor verify the whole feature —that is verify-e2e—. If there is no tasks.md with the task being asked for, this skill doesn't apply: that request enters the cycle through brainstorming or specify."
---

# Implement Task

Step 5 of the cycle, and the one that for a long time had no owner: the table said "TDD, by hand".
The steps with a skill behave the same every time; the one without it improvised, and it gathered
the largest number of unwritten rules in the harness.

**The unit of this step is the task, not the phase.** A `tasks.md` with eleven tasks is eleven
cycles, not one long one. And **a task doesn't end with code: it ends with a verdict.** Implementing
and verifying are the same act — a task implemented and not verified stays `in progress`, which is
indistinguishable from "half done". It is not a resting point of the cycle: it is a limbo where
nobody knows whether the work is any good.

## Mode, and how it is said

By default there is **one gate per task**: when finishing each one you stop and wait for the yes
before starting the next.

That gate can be waived, and **only in one way**: the invocation literally brings
`--modo corrido`. Nothing else turns it on.

**Don't infer it.** "Let's implement T3, T4 and T5" **is a list, not a waiver** — it says which
tasks have to be done, not that the yes between them can be skipped. Hurry doesn't turn it on
either, nor the tone, nor a "go all in", nor the tasks looking alike. If the person meant to go
straight through and didn't use the vocabulary, the cost of asking is one line; the cost of assuming
it is that the gate becomes a matter of opinion, which is exactly what this skill comes to close.

**What is never waived, not even in `--modo corrido`:**

- **Every task is verified.** Verifying is never batched. If you ever catch yourself proposing to
  implement three tasks in a row but verify them one by one, **treat that asymmetry as the signal
  that the proposal is wrong**: if there is enough trust to run three tasks without looking, there
  would also be enough to verify them together. A precaution placed on one side and not the other
  isn't a design, it is misallocated distrust.
- **The stop rule.** If a verdict comes back other than `meets`, **stop there**: the task stays
  `in progress`, you record it, you warn, and you don't start the next one. Waiving the intermediate
  approval is speeding up; waiving the stop is changing what finishing means. `done` means verified,
  and no mode moves that. **And the second round of that same task also waits for the yes, always,
  in any mode.** Stopping isn't only "not starting the next one": it is handing the decision to keep
  going back to the person, because a partial verdict may be saying the criterion is wrong, not the
  code. It has happened that two tasks of the same run were treated differently —one asked before
  its second round, the other didn't— because "you don't start the next one" says nothing about
  going back to the same one.

**Say when starting which mode you understood**, in one line, before touching anything. If the
person mistyped it, that is the only cheap moment to find out.

## Before starting

The spec folder is `docs/YYYY-MM-DD-<feature>/`. If there are several and it isn't clear which one,
ask. Read `tasks.md`, `requirements.md`, `design.md` and the project's `CLAUDE.md` — the commands
come from there, and they are those of the project you're in, not a fixed list.

Five checks, before the first task:

1. **The header of `tasks.md` says `approved`.** If it says `pending approval`, the plan may be
   approved anyway and not recorded: `task-writer` is forbidden from touching that header, so the yes
   happened in the chat and didn't land in the file. **Ask in one line whether the plan is approved,
   and with the yes write `> Status: approved (YYYY-MM-DD)` right away — and commit that change right
   there.** Whoever receives the yes for a document commits it: without that, the `approved` stays
   floating next to the rest of this task's work, exposed to anything that touches the working tree
   before its commit arrives. That header is a durable record: `planning-tasks` reads it to decide
   whether the spec is ready, and so does the workflow's scout on the next run. An approved plan that
   shows as pending is treated as not approved. If the answer is that it isn't approved, stop and send
   them to `planning-tasks`.

2. **The repo is a git repo.** If it isn't, say so and offer `git init` before starting. It isn't
   red tape: without a repo there are no per-task commits, and with that you lose the only record of
   progress that isn't written by whoever implements. It happened — a whole project was done without
   a repo because nobody ran it and nothing in the method asked for it.

3. **There is no `tasks-fanout` run in flight, nor an open amendment or re-plan.** It is the only
   thing this step is forbidden to do in parallel: between the scout reading and the writer saving,
   your `done` gets lost; and with a half-approved amendment, you implement against a criterion that
   may not exist tomorrow.

4. **No `done` went stale because of an amendment.** If the header of `requirements.md` or
   `design.md` says `amended (…): <ids>`, cross those ids with the `Covers` of the `done` tasks and
   with the date of their `**Verification:**` line. A task whose `meets` is **earlier** than the
   amendment of an id it covers verified a criterion that no longer says the same thing: its `done`
   is no longer valid. Name it and **ask before moving it down**: with the yes, `in progress` in its
   `Status`, and in its `Log` the old verification becomes `**Previous verification (superseded):**
   amendment R3.2 (YYYY-MM-DD)`. It is the same rule step 8 applies to a hygiene red: a verdict that
   aged wasn't wrong, it was taken on something else.

5. **Which task it is.** The one they name; if they name none, the first `pending` one following the
   table's order. That order isn't decorative: each task should leave the repo working and green, and
   skipping one breaks that property. If you want to do another one, say why.

If what they ask for isn't a task of a `tasks.md`, this skill doesn't apply: name the step of the
cycle that fits and stop.

## The cycle per task

1. **Open the task.** Put `in progress` in its `Status` cell and state in two lines its `Goal`, its
   `Covers` and its `First test (red)`, as the plan left them. Starting by reading what the task says
   has to be achieved avoids the most common failure mode of this phase: implementing what you
   remember of the design instead of what the task asks for.

   **Also read `## Follow-ups`** and name the items addressed to this task (`[T<n>]`, with the id
   you're opening). They are warnings someone left for this exact moment: one that said "better
   decide this before T9", with no recipient other than that loose sentence, was never read again —
   T9 was opened, implemented and verified with `meets` without anyone looking at it.

2. **Write the first test and run it red.** The one the task declares. **Run it and look at the
   failure** — a test that was never seen failing proves nothing, because a test that passes from the
   start also passes with broken code.

   Keep the literal failure message: it goes into the journal in step 6. **It is a diagnosis, not
   proof.** The red line is self-reported just like the rest of the `Log`, and it doesn't show the
   test was written first. What it brings is something else, and it is real: it says **what** failed
   and **what it looked like**. "Red because `add('0.1','0.2')` returned `0.30000000000000004`"
   explains to whoever reads it a month from now why the rounding exists — something the finished
   code never shows.

3. **Implement the minimum for green.** Whatever isn't in this task's `Goal` isn't written here, even
   if you see it coming and even if it's cheap: it goes in as a task of the plan or as a line in
   `Follow-ups`. Extra scope in a task is scope nobody planned and no criterion covers.

   **Every line you add in `Follow-ups` carries a recipient, in brackets and at the start:**
   `[T<n>]` if it is for a future task already numbered, `[step 7]` if it only matters when
   generating the e2e tests —it only makes sense if `design.md` declares a navigable surface—,
   `[step 8]` if it is for the closing, `[decide now]` if it needs a decision from the person before
   continuing, and `[backlog]` if it belongs to **another feature**: code of a feature already
   closed, or something cross-cutting (toolchain, runner, dependencies). A line without a recipient
   is a diary entry nobody opens again: that is what happened to the T9 warning in the paragraph
   above.

   **Before writing a `[backlog]` line, check whether it's already there.** In this feature's
   `Follow-ups` or in the project backlog (`docs/pendientes.md`, or whatever `CLAUDE.md` names). If
   it is, quote its id or its line in the `Log` instead of adding another one: the same flaky test
   written down five times, from five tasks, is five rediscoveries of the same thing.

4. **Run the correctness command** `CLAUDE.md` declares — typecheck and tests. **Not the hygiene
   one** (lint, format, build): that one belongs to step 8, before the final commit of the whole. Putting
   lint here makes a formatting complaint read as an unmet task, and it dirties the verdict, which is
   the durable record of what is done.

5. **Invoke `dod-checker`. Without asking.** You finished implementing: verifying is the rest of the
   same act, not a separate decision. Asking "shall I verify?" asks to authorize something that has
   no irreversible cost and without whose result the person can't decide anything. The gate that
   matters comes afterwards, with the verdict in hand. How to invoke it is in the next section, and
   the how is half the point.

6. **Record the verdict and move the `Status`.** In that task's `Log` block, following the format of
   `assets/tasks-template.md` in the `task-format` skill:

   - The `**Verification:**` line with the verdict, the criteria and the test results.
   - The red line from step 2, with the literal message.
   - The decisions that had to be made and that the design didn't fix, and the deviations if there
     were any.

   And in the table: **`meets` → `done`. Any other verdict leaves it `in progress`**, with what was
   missing written down — `partially-meets`, `does-not-meet` and `unverifiable` all mean "not yet".
   If this isn't the task's first verification, the current line is **the last one**, and the
   previous one is marked `**Previous verification (superseded):**` instead of being deleted.

7. **Commit, with the task's id in the message.** `T3: <what was achieved>`. The commit goes here,
   after recording, so it carries code, tests and journal together: the whole task is one unit in the
   history. If a task needed two rounds there are two commits with the same id — **the id is what
   groups them, not the count**.

   What this gives, and it's best not to oversell it: `git log` becomes a record of progress written
   by the tool and not by whoever implements, and it shows the task was one unit of work. **It
   doesn't prove the test was written before the code** — that would need two commits per task, red
   and green, and that is ruled out because a red commit breaks the rule that each task leaves the
   repo green.

8. **Gate: present and stop.** The verdict, what you recorded, the commit, and which would be the
   next task. Wait for the yes. In `--modo corrido` this is the only part that gets skipped, and only
   to move on to the next task, and only while the verdict was `meets`. **If instead this closes a
   second round of the task you just reopened, wait for the yes anyway — in any mode.** It isn't the
   same gate as starting the next task, even though both live in this same step 8.

## How to invoke `dod-checker`

**Pass it the task's id and the path of the spec folder. Nothing else.** It reads everything else.

**Don't tell it how it went.** That the tests are green, that the command passed, that the task
seems ready to you, what a previous verdict was: none of that goes in the prompt. Asking for an
independent verdict in the same sentence that announces the expected result doesn't produce
independence, and whoever invokes is exactly the interested party — the implementer presenting their
own work.

**Don't propose the verdict vocabulary to it.** There are four and it defines them: `meets`,
`partially-meets`, `does-not-meet`, `unverifiable`. A request like "tell me meets, doesn't meet or
partial" shrinks the space of answers and can erase the only correct way out. It has happened: it
left out `unverifiable`, which was the verdict that applied.

The damage of contaminating the input isn't theoretical and you don't see it coming. In a real
verification the prompt brought the list of dependencies the implementer had already confessed, and
the verifier **used that journal as a checklist**: it found exactly those two, no more, and didn't
compare the manifest against `CLAUDE.md`. The verdict ended up ratifying the implementer's account
instead of auditing it. The contamination wasn't in the commands —it ran them itself— but in **what
it looked for and what it compared it against**.

That you ran the correctness command yourself in step 4 doesn't replace it running it; the only thing
not done is telling it.

**If the name doesn't resolve, the harness is packaged.** Inside a plugin the agent is registered as
`<plugin-name>:dod-checker`. Try the bare name: if it fails, the error lists the available agents
and you take the right one from there. Don't invent the prefix before having that list — it changes
depending on how it's installed.

## What you write, and what you don't

You write **the code and the tests**, and four things of `tasks.md`: the **`Status` cell** and the
**`Log` block** of the task you're doing, the **approval header** when you receive the yes, and
**`## Follow-ups`** — only to add a new line about an out-of-scope finding, never to edit or delete a
line another task left: that one is still yours to read, not territory to clean up. Nothing else of
that file.

**The Plan table isn't yours**: which tasks exist, their ids, their order, their title and their
`Covers` are written only by the `tasks-fanout` workflow. If while implementing you find that a task
is missing, that one is extra, or that a `Covers` is wrong, **don't fix it**: write it down, say it,
and let it be resolved with `planning-tasks`. Touching up the plan from here reintroduces the second
writer that that whole architecture exists to eliminate.

You don't touch `requirements.md` or `design.md` either. If a criterion turns out to be wrong, or the
implementation deviated from what was designed, it is recorded in the `Log` and it is an
**amendment** for `specify`, not an edit on the way: an unrecorded deviation silently breaks
traceability, and one edited by hand from the task skips the yes of whoever approved the document.

## When something changes midway

If what you found isn't a bug of this task, **stop the task before continuing to implement** and
classify it with the router's table (`goharness`, "When something changes midway"). Record in the
`Log` what you found and which class you assigned it to, say it, and name the path:

- **Another `done` task of this feature is broken** (what you're doing contradicts its `meets`):
  propose moving it down to `in progress` and wait for the yes. With the yes, that task also becomes
  yours —its `Status` and its `Log`— just like when step 8 hands one back to you: old verification
  marked `(superseded)` with the reason, and it is repaired with this same cycle. Finish or pause the
  one you had open first: two tasks `in progress` at the same time aren't verified separately.
- **The criterion or the design is wrong** → amendment with `specify`. This task stays `in progress`
  until the amendment comes back.
- **The plan is wrong** → `planning-tasks`.
- **It belongs to another feature** → `[backlog]` in `Follow-ups`, and you continue with yours if it
  doesn't block you.
- **The feature itself changes** → say so and name `brainstorming`.

Don't start the path you named in the same message: it is another step, with its own gate.

## When all tasks are `done`

Say so and stop. What follows is **step 7**, the end-to-end verification of the `verify-e2e`
skill: `dod-checker` answered eleven times "does this task meet its criteria?", and none of those
answers says whether the whole feature walks. They are different verifications and neither replaces
the other.

Don't start it yourself: name it. **Read the `## Surface` section of `design.md`** (`## Superficie`
in a Spanish project): if it declares not navigable, there is no step 7 to run for this feature, and
what follows directly is **step 8**, the `close-feature` skill.

The per-task commits **don't close the feature**. Each one saves a task; the closing is something
else, and it is the hygiene run on the final state: your `meets` for task 3 was taken on a repo that
by then had already changed seven times.

Keywords go in the project's language (see the glossary in `task-format`): in a Spanish project the
task moves between `pendiente`, `en curso` and `hecho`, the verdicts are `cumple`, `cumple-parcial`,
`no-cumple` and `no-verificable`, the lines are `**Verificación:**` and
`**Verificación previa (superada):**`, and the recipients `[paso 7]`, `[paso 8]` and `[decidir ya]`.
