# Requirements — <Feature name>

> Status: pending approval | approved (YYYY-MM-DD)
<Once approved, if the document is amended: `approved (YYYY-MM-DD) · amended (YYYY-MM-DD): R3.2, R3.5`.
The amended ids accumulate; it is what `implement-task` reads to know which `done` tasks to reopen.>

## Introduction

<One or two paragraphs: what problem this feature solves, for whom, and what the result looks like
when it is working. Write the problem, not the solution — the "how" goes in design.md.>

## Scope

**Includes**
- <a concrete capability that is in>
- <...>

**Does not include (for now)**
- <what is deliberately left out, and in one sentence why>
- <...>

## Requirements

### R1 — <short, descriptive title>

**User story:** As a <role>, I want <capability>, so that <benefit>.

#### Acceptance criteria

1. WHEN <observable condition or event>
   THE SYSTEM SHALL <verifiable behavior>
2. IF <unwanted condition or edge case>
   THEN THE SYSTEM SHALL <expected response>
3. <...>

### R2 — <short, descriptive title>

**User story:** As a <role>, I want <capability>, so that <benefit>.

#### Acceptance criteria

1. WHEN <...>
   THE SYSTEM SHALL <...>
2. <...>

## Assumptions

- <things you are taking as true and that, if they turn out false, change the spec>

## Open questions

- <what was left undecided, who has to decide it and what it blocks if it isn't decided>

## Amendments

<Empty until the approved document changes. One line per amendment, written by `specify`:>

- <YYYY-MM-DD · R3.2, R3.5 · what changed and why · where it came from (T7, step 7, closing)>

<!--
Reminders when writing:

- Numbering: criteria are cited as R1.1, R1.2 from design.md and from the tests.
  New ones go at the end and nothing is renumbered, neither before nor after approval: a criterion
  whose meaning changes is marked obsolete and is born with a new id.
- One criterion, one behavior. If it has an "and", an "and also" or a "besides", it is almost
  certainly two criteria — split it. Phase 1 has a step dedicated to rereading in search of
  conjunctions, and it exists because this rule skips itself: the compound criterion reads naturally
  when writing it and the cost shows up two steps later, when one clause gets a test and the other
  doesn't, and the verifier has no way to say "half met" because its verdict is per criterion.
- Verifiable: someone has to be able to write an automated test that fails if it isn't met.
  "The system must be fast" is not verifiable; "THE SYSTEM SHALL respond in under 2 s for files of
  up to 5,000 rows" is.
  If the feature has a binding visual reference, what is adopted from it is also a criterion, and it
  is verified by looking: the criterion says who looks and against what. See "Appearance criteria"
  in ../../references/ears-patterns.md.
- No implementation: no names of functions, files or libraries here. If you feel like writing them,
  it is material for design.md.
- The complete EARS patterns are in ../../references/ears-patterns.md
-->
