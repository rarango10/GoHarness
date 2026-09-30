# Tasks — <Feature name>

> Requirements: [`./requirements.md`](./requirements.md) · Design: [`./design.md`](./design.md)
> Status: pending approval | approved (YYYY-MM-DD)
> Ids issued: up to T<n>

<The "Ids issued" line is the memory of which ids were already handed out, **including those of
tasks that later disappeared from the plan**. The workflow writes it. Without it, a future run would
compute the next free id looking only at the live tasks, and would reuse the number of a removed
task — exactly what the numbering rule forbids, because that id may be cited in a commit or in
another task's journal.>

## Plan

<One row per task, in the order they are best done. The order matters: each task should leave the
repo working and with the tests green, so you can stop at any point without being left halfway.>

| # | Task | Covers | Status |
|---|------|--------|--------|
| T1 | <what is achieved, in one line> | R1.1, R1.2 | pending |
| T2 | <...> | — | pending |

<Statuses: `pending` · `in progress` · `done`. This table is the only place where status lives —
don't repeat it below, or they will end up contradicting each other.>

<`done` means **verified**, not "I already coded it". Whoever implements writes it, and only with a
`meets` from `dod-checker` recorded in that task's Log; with any other verdict the task stays
`in progress`. This column is the only durable record of what is finished, so one `done` too many is
worse than a forgotten task: it reads as closed work.>

<`Covers` column: the criterion ids separated by commas. If the task covers none, it gets `—` and
the reason is explained below, in its journal section. The table stays narrow and readable; the
justification travels attached to the task.>

**Criteria without a task:** <none | R3.2 — and why (e.g. it is covered in another feature)>

## Journal

<One section per task. When planning, only the goal, what it covers and the first test exist. The
rest is filled in while working: it is the record of what really happened.>

### T1 — <title>

**Goal:** <what has to be true when this task is finished>
**Covers:** R1.1, R1.2
**First test (red):** <the concrete case the TDD cycle starts with>

**Log** — <fill in when finishing; date>

- **Verification:** <`dod-checker` → meets · R1.1, R1.2 · npm test 14/14 · 2026-09-05. Without this
  line, and without a `meets`, the task can't move to `done` in the table above. If the verdict was
  lesser, write down which one and what was missing: that is what whoever picks it up will look at.>
- **Previous verification (superseded):** <if a task was verified more than once —it always happens
  when the first verdict was lower than `meets`, or when the environment didn't let the tests run—
  **the current line is the last one**, and the earlier ones are marked like this, with the prefix
  "previous (superseded)". They aren't deleted: the road to the `meets` is exactly what the journal
  exists to keep. But without marking them, whoever reads top to bottom first finds an
  `unverifiable` on a task the table gives as `done`, and concludes the opposite of what happened.>
- <Decisions that had to be made and that the design didn't settle. This is the most valuable part
  of the file: a month from now nobody remembers why it was chosen that way, and the code only
  shows the result, never the discarded alternative.>
- <Deviations from the design: if the implementation ended up doing something different from what
  was designed, say so here and ask for the amendment of `design.md` with `specify` — it isn't
  edited by hand from the task. An unrecorded deviation breaks traceability silently: the document
  keeps describing something that no longer exists.>
- <What came up that you didn't expect: a new edge case, an assumption that turned out false,
  something that cost three times what was planned.>

### T2 — <title>

<This second task shows the two optional fields. Put them ONLY when they apply: a normal task has
Goal, Covers and First test, and nothing else.>

**Goal:** <...>
**Covers:** —
**Covers none because:** <only if `Covers` is `—`. Initial infrastructure or final integration: why
the task exists anyway. Without this line the task reads as scope nobody asked for, and the
automatic traceability check marks it as an orphan.>
**Note:** <only if it applies. E.g. `replaces T4`. An id is never reused or renumbered —it may be
cited in a commit or in the journal—, so this line is the only thing that connects a task with the
one it came to replace, absorb or split.>
**First test (red):** <...>

**Log** —

- <...>

## Follow-ups

<Things that came up while working and that aren't tasks of this feature: ideas for later, debt
taken on purpose, unanswered questions. It keeps them from getting lost without having to grow the
scope now.>

<Every line carries a recipient in brackets, at the start: who has to read it and at what moment.
Without a recipient it is a diary entry nobody opens again — it really happened: a warning written
in loose prose ("better decide this before T9") never found a reader, and the task that should have
read it was implemented and verified without it.>

- `[T7]` <something task T7 is going to need and that whoever opens it won't guess just by reading
  its `Goal`>
- `[step 7]` <something that matters only when generating the e2e tests — it only makes sense if
  the feature's `design.md` declares a navigable surface>
- `[step 8]` <something to review at closing, on the final state of the repo>
- `[decide now]` <something that needs a decision from the person before continuing, it can't wait
  for a future step>
- `[backlog]` <something that belongs to another feature: code of an already closed feature,
  something cross-cutting (toolchain, runner, dependencies), or what the person decided to leave
  out when looking at the app in step 8. When closing, `close-feature` moves it to the project
  backlog and leaves here the id `P<n>` it was moved to; from there it is read by the brainstorming
  of the feature that takes it>

<!--
Reminders when writing:

- One task = one complete TDD cycle (failing test → implement → passing test), of a size that can
  be finished in one sitting. If a task needs three tests to make sense, it is probably three
  tasks.
- Every task covers at least one criterion. If you cover none, ask yourself what it is doing here:
  either a criterion is missing from requirements.md, or the task is scope nobody asked for.
- The other way around too: if a criterion doesn't appear in any row, either a task is missing or
  it has to be said explicitly why it is left out.
- No code in this file. It describes what has to be achieved, not how it is written.
- `Covers none because:` and `Note:` are the two fields that are lost if they aren't written here.
  Everything else can be rebuilt by reading the file; these two can't, and their absence doesn't
  show: a task without the first one rereads as an orphan, and one without the second loses forever
  which task it replaced.
- The journal is filled in while working, not at the very end. Written afterwards, it becomes a
  tidy summary that lost exactly what was worth it: the doubts and the alternatives discarded in
  the moment.
-->
