---
name: task-format
description: "Format reference for a feature's tasks.md: the template, what a task is, how criteria are assigned to Covers, the optional fields and what the journal is for, plus the keyword glossary (English canonical form and Spanish alias). It is not a step of the cycle and produces no document: it is preloaded by the agents that read or write tasks.md (task-writer, task-reviewer, plan-reducer, dod-checker). To write the plan, the path is the planning-tasks skill; to implement a task, implement-task."
user-invocable: false
---

# Format of `tasks.md`

**This is a reference, not a work instruction.** It describes what the file looks like. What you
have to do with it is said by your own role: the prompt that invoked you, or the skill or agent you
are. If you got here looking to write the plan, that path is `planning-tasks`; if you were looking
to implement a task, `implement-task`.

The **plan** in `tasks.md` —which tasks there are, their ids, their order, their `Covers`— is
written by the dynamic workflow `tasks-fanout`, and nothing else; it is triggered by the
`planning-tasks` skill, which first checks the spec and confirms the cost. (Each task's `Status`
and `Log` are the other region of the file, and whoever implements writes them; see `CLAUDE.md`.)
Don't write the plan by hand turn by turn or delegate it to a subagent with write permission: the
workflow exists so the plan has a single writer, and planning from outside reintroduces the second
planner that architecture eliminates. If the workflow isn't available, the right step is to unblock
it, not to improvise the plan.

What follows are the file's **format rules**, not a procedure. The template is
`assets/<lang>/tasks-template.md`, in this same skill.

1. **The file is `tasks.md`**, in the spec folder (`docs/YYYY-MM-DD-<feature>/`), following
   `assets/<lang>/tasks-template.md`.
2. **One task, one TDD cycle**: failing test → implement → passing test, of a size that can be
   finished in one sitting. If a task needs three different tests to make sense, it is probably
   three tasks.
3. **Order them so you can stop at any point**: each task should leave the repo working and green.
   A plan that only works if it is completed in full doesn't work as a plan.
4. **A criterion is assigned to the task that completes it**, not to the ones that enable it. If a
   criterion says "when Calculate is pressed, show the sum in the result box", the task that writes
   the sum function **doesn't cover it**: it implements a precondition of it. That task carries
   `Covers: —` and explains in `Covers none because:` which criterion it helps close and in which
   task it is closed.

   Splitting one criterion between two tasks looks more traceable and is the opposite: neither of
   them satisfies it, both claim to cover it, and the verifier is left with no way to answer its own
   question —does this task meet the criterion it claims to cover?— about something it only half
   meets. When in doubt about whether a task completes or enables: if this task were finished and
   no other, could the criterion be checked end to end? If the answer is no, it enables.

5. **Close the traceability chain**: each task says which criteria it covers. Then look at the
   cross-check in both directions — a task that covers no criterion is scope nobody asked for, and a
   criterion without any task is either an oversight or something that has to be declared out of
   scope explicitly. That cross-check is the reason for numbering the criteria from phase 1.
6. **The plan is presented and waits for approval**, like every document in the cycle. The
   workflow leaves it in `pending approval` and doesn't approve it on its own; whoever receives the
   yes records it in the header.

When planning, each task has only a goal, the criteria it covers and a first test — plus two
optional fields that appear only when they apply: `Covers none because:` (when `Covers` is `—`) and
`Note:` (e.g. `replaces T4`). They are the only two that can't be rebuilt by rereading the file, so
if the workflow produces them and they don't get written, they are lost. **The journal is filled in
during implementation, not when planning**: the plan leaves the structure ready, not the account of
work that hasn't happened yet.

## What the journal is for

It is the most underestimated part of the spec. Finished code shows the result and never the
discarded alternative; six months later nobody remembers why something ended up that way, and the
same thing gets discussed again or —worse— a decision that had a good reason gets reverted.

**Whoever implements writes it, not the workflow.** `tasks-fanout` owns the plan —which tasks there
are, their ids, their order, their `Covers`— and whoever implements owns two regions of the task
they are doing: its `Status` cell and its `Log` block. They are different parts of the file, with
different owners, and they aren't written at the same time. That Log also holds the
**Verification** line with `dod-checker`'s verdict: without a `meets` recorded there, the task
doesn't move to `done`.

Of what gets written down, there is one category that can't stay silent: **the deviation from the
design**. If the implementation ended up doing something different from what was designed, it is
recorded in the task and `design.md` is amended with the `specify` skill, not by hand from the
task. An unrecorded deviation breaks traceability without anyone noticing, because the document
still reads as if it described what exists.

## Glossary

These words aren't prose: they are signals between agents. One agent writes `meets` and another
reads it to move the task to `done`; if one writes one word and the other expects another, the
chain breaks without any visible error. That is why each one has a **canonical form, in English**,
and a Spanish alias. Both forms mean exactly the same thing. **When writing, use the form of the
project's language** —the one declared in its `CLAUDE.md`—: the canonical one in an English
project, the alias in a Spanish one. When reading, accept both.

| Canonical | Spanish alias | Where it lives |
|---|---|---|
| `pending` · `in progress` · `done` | `pendiente` · `en curso` · `hecho` | status column of the plan |
| `meets` · `partially-meets` · `does-not-meet` · `unverifiable` | `cumple` · `cumple-parcial` · `no-cumple` · `no-verificable` | `dod-checker`'s verdict on the task |
| `no-evidence` | `sin-evidencia` | `dod-checker`'s verdict on a criterion |
| `pending approval` · `approved` · `amended` | `pendiente de aprobación` · `aprobado` · `enmendado` | header of `requirements.md`, `design.md` and `tasks.md` |
| `closed` | `cerrado` | header of `tasks.md`, written by `close-feature` |
| `Status` · `Covers` · `Goal` · `First test (red)` · `Note` | `Estado` · `Cubre` · `Objetivo` · `Primer test (rojo)` · `Nota` | fields of a task |
| `Covers none because` · `Ids issued` · `Criteria without a task` | `Por qué no cubre criterios` · `Ids emitidos` · `Criterios sin tarea asignada` | fields of the plan |
| `Log` · `Verification` · `Previous verification (superseded)` | `Registro` · `Verificación` · `Verificación previa (superada)` | what whoever implements writes |
| `Journal` · `Follow-ups` | `Bitácora` · `Pendientes` | section titles of `tasks.md` |
| `[step N]` · `[decide now]` · `[backlog]` | `[paso N]` · `[decidir ya]` · `[backlog]` | recipient of a follow-up |
| `pass` · `fail` · `did-not-run` | `pasa` · `falla` · `no-corrio` | result of an e2e case in `e2e-test-report.md` |
| `test` · `code` · `spec` · `undetermined` | `test` · `codigo` · `spec` · `indeterminado` | cause of an e2e failure in `e2e-test-report.md` |

`Registro` and `Bitácora` would both be "log" in English: that is why the section is `Journal`. And
the `Pendientes` section is `Follow-ups` so it doesn't clash with a task's `pending` status.

## This skill's files

The templates come twice, in `assets/en/` and `assets/es/`: `<lang>` is the project's language.

- `assets/<lang>/tasks-template.md` — structure of `tasks.md` (plan + journal + follow-ups)
