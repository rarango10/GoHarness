---
name: verify-e2e
description: "Verifies an already implemented feature end to end, in two phases: it writes e2e-tests-plan.md with 3 cases (1 happy path and 2 failure cases) from the approved spec, and then orchestrates the generation of the Playwright tests and their run, up to an e2e-test-report.md that routes each failure. Use it when the person says, in English or Spanish, 'let's verify e2e / verifiquemos e2e', 'let's test end to end / probemos de punta a punta', 'let's build the end to end tests / armemos los tests end to end', 'let's run the e2e / corramos el e2e', or when every task of a tasks.md is already done and it remains to check that the whole feature works. It is the step after dod-checker's per-task verification: dod-checker verifies a task against its criteria, this skill verifies the whole feature against the spec. It doesn't write the tests or the report on its own — the e2e-test-writer and e2e-triager subagents do that."
---

# Verify E2E

`dod-checker` answers "does T7 meet R3.2?". This skill answers another question: **does the whole
feature work?** They are different verifications and neither replaces the other — 29 tasks `done`,
each one verified against its criteria, still say nothing about whether the complete flow walks from
start to finish.

The project's workflow is: brainstorm → requirements + design → task plan → TDD implementation
(`implement-task`) → per-task verification (`dod-checker`) → **end-to-end verification (this
skill)** → closing (`close-feature`). This skill is step 7 and stops there.

You produce a single document yourself: `e2e-tests-plan.md`. The other two products of the cycle
each have their own owner, and it isn't you: the scripts are written by the `e2e-test-writer`
subagent and the report by the `e2e-triager` subagent. It is the same single-producer-per-document
rule that governs the rest of the project.

## Modes and gates

There are three gates, and **by default all three are active**. The mode is said when invoking;
there is no configuration file, and don't add one: the default lives here, in this file, which is
the only place that rules over this step.

| id | Where it stops | What it protects |
|---|---|---|
| `plan` | After writing `e2e-tests-plan.md`, before generating scripts | A bad plan produces three bad tests. Reviewing it is reading a three-case markdown. |
| `scripts` | After generating the tests, before running them | That generated code isn't executed without anyone having looked at it. |
| `ruteo` | After the report, before acting on it | It is the only one that mutates durable state: it moves a task down from `done` to `in progress` in `tasks.md`. |

Exact vocabulary, as it may come in the invocation:

- nothing → all three active
- `--modo autonomo` → none; the cycle runs from the spec to the report without stopping
- `--sin plan`, `--sin scripts`, `--sin ruteo` → turns off that one and only that one
- they combine: `--sin scripts --sin ruteo`

Two precautions. **Turn off exactly what you were told and nothing more**: a `--sin scripts`
doesn't authorize skipping the `ruteo` gate, even though both are in the same cycle. And **say when
starting which mode you understood**, in one line, before doing anything. If the person mistyped it,
that is the only cheap moment to find out.

## Phase 1 — Understand the process and check preconditions

The spec folder is `docs/YYYY-MM-DD-<feature>/`. If there are several and it isn't clear which one,
ask.

Read, in this order: `requirements.md` (the numbered criteria are the plan's raw material),
`design.md` (that's where the app's surface and how to bring it up come from) and `tasks.md` (the
`Status` column says what is really implemented).

Then check four things, and **stop everything if any of them fails**:

1. **`requirements.md` and `design.md` say `approved`** in their header. If not, send them to the
   `specify` skill. An e2e test plan written on an unapproved spec tests a feature that can still
   change.
2. **There is something implemented worth testing.** If the whole `tasks.md` table is `pending`,
   there is nothing to verify end to end yet. If some tasks are `done` and others aren't, say so and
   ask whether it's worth it anyway: an e2e on a half-built feature fails by design, and those
   failures mean nothing.
3. **The feature has a navigable surface.** Read the `## Surface` section of `design.md`
   (`## Superficie` in a Spanish project). If it declares **not navigable**, this isn't a failure:
   it is a branch. Say it plainly and name **step 8** (`close-feature`) — there is no e2e to generate
   for this feature, and don't write any file when you stop here. If it declares **navigable**,
   continue with the URL (or the `file://`) and how to bring it up that the same section describes.

   Specs written before this slot existed don't have it. For those, the fallback probe: look for a
   `dev`/`start`/`serve` script in `package.json`, an `index.html`, a server, a `baseURL` in
   `playwright.config.ts`. If nothing shows up there either, stop and say it plainly: without a
   navigable surface there is no e2e to generate, and the remedy isn't to invent it or to fall back
   to unit tests in disguise —Vitest is already there for that— but to build the interface as a
   separate feature, with its own brainstorming.
4. **The Playwright doctor is green.** Run `node scripts/e2e-doctor.cjs <project-path>` (the
   project's path, not the skill's). It replaces inspecting by eye with two mechanical checks: the
   dependency declared and resolved from the project, and the browser that version expects present
   on disk. If it fails, report it with the fix each line prints (`npm i -D @playwright/test`,
   `npx playwright install chromium`) and wait: installing dependencies or downloading a browser of
   hundreds of megabytes is the person's decision, not yours.

Close the phase saying in one line what you found: the app's surface, how it is brought up, and how
many tasks are `done`.

## Phase 2 — The e2e test plan

Write `e2e-tests-plan.md` in the spec folder, following `assets/e2e-tests-plan-template.md`.

**There are exactly three cases: one happy path and two failure cases.** Not four because you found
another interesting flow, nor two because the third looked similar. The number is fixed on purpose:
an e2e plan that grows without a ceiling ends up being a second suite of unit tests, slow and
fragile, that nobody runs.

- **The happy path (`E1`)** is the complete journey that gives the feature its meaning, from the
  first screen to the observable result. If you have to choose between two, keep the one that
  crosses more acceptance criteria.
- **The two failure cases (`E2`, `E3`)** come from the criteria that already describe a rejection or
  an error in `requirements.md` —the `IF ... THEN` ones— and are cited by id. **Don't invent them.**
  An invented failure case tests a product decision nobody made, and when it fails nobody knows
  whether the bug is in the code or in the assumption.
- If `requirements.md` doesn't have two error criteria, say so: it is a gap in the spec, it goes to
  the plan's **Follow-ups** with recipient `[decide now]`, and a person decides it. Don't cover it
  up by picking anything.

Each case carries an id, a title, the criteria it covers, preconditions, numbered steps in terms of
what a user does (not CSS selectors: whoever writes the script solves that) and an observable
expected result.

**`plan` gate:** present the three titles and the criteria they cover, say where the file is, and
stop. Don't continue without a yes.

## Generating the scripts

Invoke the **`e2e-test-writer`** subagent, just one, passing it the path of the approved plan and
the destination folder `end2end/YYYY-MM-DD-<feature>/`. It is the only one that writes there; don't
touch the files it produces yourself, not even for a small fix.

**`scripts` gate:** say which files it generated and stop before running them.

## Run and diagnose

Invoke the **`e2e-triager`** subagent. It runs the tests, diagnoses each failure and writes
`e2e-test-report.md` in the spec folder. It also returns a structured verdict in JSON, which is what
you use to route.

Don't run the tests yourself before invoking it: the run is its own, and a second run from outside
only adds a result that then has to be reconciled.

**`ruteo` gate:** present the report's summary and what you plan to do with each failure, and wait
for the yes before touching anything.

## Routing

The verdict's `ruteo` field has three destinations, and each one is a different path:

- **`aFase2`** — the test was badly written. Go back to phase 2, correct **only those cases** of the
  plan, and redo the cycle from there. **Two rounds at most.** On the third, stop and take it to the
  person: a case that doesn't stabilize in two attempts isn't a badly written test, it is an
  ambiguity of the spec in disguise.
- **`aTDD`** — the failure is in the code. The named task goes back to `in progress` in `tasks.md`
  and the e2e failure is recorded in its `Log` as the starting point. **You write that**, not the
  triager: `Status` and `Log` are the region of whoever implements, and in this cycle whoever
  implements is this session. From there the fix is the usual TDD, with the `implement-task` skill,
  and the task goes back to `done` only when `dod-checker` returns `meets`. The e2e cycle ends here;
  don't start the repair in the same message.
- **`aSpecify`** — the test and the code do what they say, and what's wrong is the criterion. Name
  the `specify` skill for an **amendment** and stop. Don't correct `requirements.md` yourself. What
  follows the amendment —which `done` tasks are reopened, whether re-planning is needed— is in the
  router, "When something changes midway"; this e2e cycle is run again when the affected tasks are
  back to `done`.

A case in `indeterminado` isn't routed anywhere: it is counted and taken to the person. Guessing the
destination of an ambiguous failure costs more than asking.

If everything came out green, say so and name **step 8**, the `close-feature` skill: it runs the
full hygiene on the final state and makes the closing commit. Don't start it yourself. And say it
when closing, not afterwards, because this cycle is exactly the one that can invalidate an old
verdict — populating `end2end/` once already turned red the command a task declared green, without
that task changing anything. The report stays as the durable record of this run.

## Why there is no agent that repairs the code

Because one already exists and it is the project's TDD. An e2e failure whose cause is the code is a
bug in an already implemented task: a task that goes back to `in progress`, with a red starting test
that on top of that is already written. An agent that edited `src/` to turn the e2e green would be a
second writer of the code, would skip the TDD cycle `CLAUDE.md` sets as a rule, and could close the
symptom leaving the cause. This skill's automatic loop is the one on the test side; the code side
leaves the loop on purpose.

## This skill's files

- `assets/e2e-tests-plan-template.md` — structure of `e2e-tests-plan.md`
- `scripts/e2e-doctor.cjs` — precondition 4: dependency and browser installed. `harness-init` also
  invokes it, at the end of step 0 in a project with a navigable surface.

The gate ids, the flags and the triager's JSON values (`ruteo`, `aFase2`, `aTDD`, `aSpecify`,
`indeterminado`) are literal vocabulary: they stay as they are in any language. The keywords in the
documents follow the project's language (see the glossary in `task-format`).
