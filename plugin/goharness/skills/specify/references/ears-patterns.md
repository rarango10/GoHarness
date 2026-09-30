# EARS patterns

EARS (Easy Approach to Requirements Syntax) is a small set of templates for writing requirements.
The point isn't the ceremony: it forces you to say **under what condition** the system does **what
observable thing**, and that translates almost one to one into a test.

The prose goes in the project's language and the keywords in English (`WHEN`, `IF`/`THEN`,
`WHILE`, `WHERE`, `THE SYSTEM SHALL`), as recognizable formal vocabulary. In a Spanish project:
`WHEN el usuario importa un CSV válido THE SYSTEM SHALL crear una transacción por fila`.

## The 5 patterns

### 1. Ubiquitous — always holds, no condition

```
THE SYSTEM SHALL <behavior>
```

For rules that apply at all times. If you find yourself writing many of these, be suspicious:
there is almost always an implicit condition worth making explicit.

> THE SYSTEM SHALL record every transaction with date, amount and category.

### 2. Event-driven — `WHEN`

```
WHEN <event or condition>
THE SYSTEM SHALL <behavior>
```

The most common case: something happens, the system responds.

> WHEN the user runs the import command with a valid CSV file
> THE SYSTEM SHALL create one transaction per row and report how many it imported.

### 3. Unwanted behavior — `IF` / `THEN`

```
IF <unwanted condition or edge case>
THEN THE SYSTEM SHALL <response>
```

For errors, invalid data and everything that can go wrong. It is the pattern that later becomes the
design's error handling table.

> IF a CSV row has a non-numeric amount
> THEN THE SYSTEM SHALL skip that row, report it at the end and continue with the rest.

### 4. State-driven — `WHILE`

```
WHILE <ongoing state>
THE SYSTEM SHALL <behavior>
```

For what holds while a situation lasts, not at a single instant.

> WHILE an import is in progress
> THE SYSTEM SHALL reject a second import of the same file.

### 5. Optional / conditioned on a capability — `WHERE`

```
WHERE <the feature or configuration is present>
THE SYSTEM SHALL <behavior>
```

For what applies only if a certain option is enabled or a certain piece of data exists.

> WHERE the user defined a budget for the category
> THE SYSTEM SHALL show the percentage used next to the amount spent.

## Combinations

They can be chained when the case calls for it, but without overdoing it: if a criterion needs
three nested conditions to be understood, it is probably several criteria.

> WHEN the user imports a file that was already imported before
> IF duplicate detection is on
> THEN THE SYSTEM SHALL skip the repeated movements and report how many it skipped.

## Appearance criteria

They are only needed when `design.md` is going to declare a **binding** visual reference (the
adopt / adapt / discard table comes out of brainstorming). Without them, the reference doesn't exist
for the cycle: nobody verifies it, because no criterion names it, and a spec that only asks for "the
system's colors" ends with a result that meets everything and doesn't look like it.

"Looks like the mockup" is not verifiable, just like "the system must be fast". The way out is the
same: bring the quality down to something checkable. Every piece the table marks `adopt` or `adapt`
falls into one of these four types:

- **Inventory** — which parts there are and in what order.
  > THE SYSTEM SHALL show, in this order: the day's completion, the day's summary and the timeline.
- **Structure** — how they are placed relative to each other.
  > THE SYSTEM SHALL show the day's completion and the day's summary in the same row, with the
  > completion at twice the width of the summary.
- **Component** — in what form a piece of data is shown.
  > THE SYSTEM SHALL represent the completion percentage as a progress ring.
- **Token** — which visual vocabulary is used.
  > THE SYSTEM SHALL use only colors declared in the design system's token table.

Naming a design system's tokens or pieces is **not** "implementation disguised as a requirement"
(see below): the value is fixed by something external, and that makes it a requirement. What is
still the design's is *how* it is built — with which files, functions or CSS structure.

**And every appearance criterion says who looks at it and against what.** A test on CSS doesn't
tell a twelve-column grid from a one-column stack: both use the same tokens. Only the token one is
tested well with a test; the other three are checked **by looking at the screen next to the
reference**, and `close-feature` does that before closing. If the criterion doesn't say so, the
verifier ends up marking it as met by reading code, which is exactly where the difference doesn't
show.

## Typical mistakes

**Non-observable behavior.** If you can't write a test that fails when it isn't met, it isn't an
acceptance criterion.

- ✗ THE SYSTEM SHALL handle CSV files efficiently.
- ✓ WHEN a file of up to 5,000 rows is imported, THE SYSTEM SHALL complete the import in under 2 seconds.

**Two behaviors in one criterion.** The "and also" is the clue.

- ✗ WHEN a CSV is imported, THE SYSTEM SHALL categorize the movements and detect duplicates and show a summary.
- ✓ Three separate criteria, each verifiable on its own.

**Implementation disguised as a requirement.** Names of functions, files or libraries are design
decisions, not user needs.

- ✗ THE SYSTEM SHALL use `csv-parse` to read the file.
- ✓ WHEN the file has the expected format (date, description, amount), THE SYSTEM SHALL read all its rows. *(which library is used is decided in design.md)*

**Vague condition.** "If something goes wrong" doesn't say when.

- ✗ IF there is a problem with the file, THEN THE SYSTEM SHALL warn.
- ✓ IF the file doesn't exist at the given path, THEN THE SYSTEM SHALL exit with a message that shows the path it looked in.

**Requirement without an owner.** If nobody knows which role needs it or what for, check whether
it's needed: it may be a feature nobody asked for.
