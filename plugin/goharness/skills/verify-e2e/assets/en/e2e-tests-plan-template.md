# E2E Tests — <Feature name>

> Requirements: [`./requirements.md`](./requirements.md) · Design: [`./design.md`](./design.md) · Tasks: [`./tasks.md`](./tasks.md)
> Status: pending approval | approved (YYYY-MM-DD)
> Scripts: `end2end/YYYY-MM-DD-<feature>/`

## Surface under test

<How the app is brought up and against which URL Playwright runs. It comes from design.md and from
package.json, not from an assumption: `npm run dev` at http://localhost:5173, for example. Without
this line, whoever picks up the plan a month from now doesn't know what it was tested against.>

- **Command:** <how it is brought up>
- **Base URL:** <...>
- **Starting state:** <what data each case starts with: empty database, fixed seed, etc. If the
  three cases share a precondition, say it here once.>

## Cases

<They are exactly three: E1 happy path, E2 and E3 failure. The number is fixed. An e2e plan that
grows without a ceiling ends up being a second unit test suite: slow, fragile and run by nobody.>

<The steps are written in terms of what a user does — "enters an expense of 100 and picks two
participants" — not selectors. The selector is a decision of whoever writes the script, and a plan
full of `#amount-input` breaks with the first markup change without the feature having changed at
all.>

### E1 — <title of the happy path>

**Type:** happy path
**Covers:** R1.1, R2.3
**Preconditions:** <...>
**Steps:**
1. <...>
2. <...>
**Expected result:** <what the user has to see on screen. Observable, not internal: "the list shows
two balances, 50 and −50", not "the ledger ended up balanced".>

### E2 — <title of the first failure case>

**Type:** failure
**Covers:** R3.4
**Source criterion:** <the text of the requirements.md criterion that describes this rejection.
Quoted, not paraphrased: it is what proves the case wasn't invented.>
**Preconditions:** <...>
**Steps:**
1. <...>
**Expected result:** <the rejection as the user sees it: which message, what stays unchanged.>

### E3 — <title of the second failure case>

<Same format as E2.>

## Traceability

| Case | Criteria | Related tasks |
|---|---|---|
| E1 | R1.1, R2.3 | T4, T9 |
| E2 | R3.4 | T12 |
| E3 | <...> | <...> |

<The tasks column is what lets the triager route a code failure to a concrete task of tasks.md.
Without it, a failure of E2 doesn't know which task to go back to.>

## Follow-ups

<Gaps that showed up while writing the plan and that a person decides. The most common one: that
requirements.md doesn't have two error criteria to draw E2 and E3 from. That is said here, not
covered up by inventing a case.>

- <none | ...>

<!--
Reminders when writing:

- Three cases: one happy path and two failure. No more, no less.
- The two failure cases come from criteria that already exist in requirements.md (the
  `IF ... THEN` ones), cited by id. An invented failure case tests a product decision nobody made:
  when it fails, you don't know whether the bug is in the code or in the assumption.
- The happy path, when in doubt, is the one that crosses the most criteria.
- No code or selectors here. The plan says what is tested; the script says how.
- The expected result is always observable by a user. An e2e that asserts on internal state is a
  unit test with a browser next to it.
-->
