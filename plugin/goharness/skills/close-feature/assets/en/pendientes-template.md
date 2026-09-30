# Project backlog

<The backlog of what showed up in one feature and belongs to another: code of an already closed
feature, something cross-cutting (toolchain, runner, dependencies), or something the person decided
to leave out. If it belongs to the feature in progress, it doesn't go here: it goes to its
`tasks.md` and is solved there.>

<Who writes what:
- `close-feature` adds new entries when closing each feature (it moves the `[backlog]` lines of its
  `Follow-ups`), and moves to `resolved` the ones that feature took.
- `specify` moves to `in <feature>` the ones a new feature takes, when approving its
  `requirements.md`.
- `discarded` is decided by the person.
- Nobody edits or deletes the body of an entry someone else wrote. New things are added below, with
  a date.

Who reads:
- `brainstorming`, before exploring a new idea: it names the `open` ones that touch the same code.
- `close-feature`, facing a red: if the test matches an open entry, it doesn't reopen tasks.
- `dod-checker` does **not** read it, on purpose: a verifier with a list of known failures learns
  to dismiss reds.>

<The `P<n>` ids are never reused, even if an entry is discarded: they may be cited in a `tasks.md`
or in a commit.>

## P1 · <short title> · `open`

- **Status:** `open` | `in <feature-folder>` | `resolved (YYYY-MM-DD, <feature-folder>)` | `discarded (YYYY-MM-DD): <why>`
- **Where it came from:** <feature folder and task or step — `docs/2026-09-24-dashboard/`, T16>
- **Evidence:** <the literal failure, the command, how many times it happened and where>
- **What is known:** <proven facts>
- **What isn't known:** <suspicions, marked as such>
- **What not to do:** <the tempting shortcut and why not — e.g. "don't upgrade vitest inside
  another feature: it invalidates all its verdicts">
- **For whom:** <what kind of feature should take it, or what part of the code it touches>
