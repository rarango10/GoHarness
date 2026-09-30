---
name: harness-init
description: "Seeds a project's CLAUDE.md so the harness can work there: it starts from a template and fills its slots by interviewing, never by deciding alone. It is step 0 of the cycle. Use it when the person says 'let's write the contract / armemos el contrato', 'let's set up the project / preparemos el proyecto', 'start the harness here / iniciemos el harness acá', 'there's no CLAUDE.md / no hay CLAUDE.md', or wants to start a feature in a repo that doesn't have one yet. If a CLAUDE.md already exists, it doesn't overwrite it: it reviews it against what the harness needs and proposes the fixes. It also seeds the configs that encode the harness's memory (excluding end2end/ from the unit runner, retries 0 in Playwright), and it does not seed the document templates, which travel in the skills that use them."
---

# Harness Init

Step 0, and for a long time the only one without an owner. The seven steps of the cycle each have
their producer; **the project's contract had none**, and the only way out the router offered was
"do it with `/init` or by hand".

That made it manual work exactly where it should be a command: `CLAUDE.md` is the only thing that
has to be adapted to take the harness to another repo, that is, **the step that will be repeated
the most**. In a project that already exists it goes unnoticed; in a new one it is the first thing
you run into.

`/init` is not enough: on an empty folder it has nothing to analyze, and it doesn't know the slots
the harness needs.

## The two halves, and why both are needed

**The template constrains by structure, not by prose.** That is what makes it valuable: almost all
of the harness is instruction gates, which are obeyed because the model reads them. The template
isn't.

- It has no "Structure" section, so that section **doesn't exist** — and putting a file tree in the
  contract, which is `design.md`'s territory, goes from unlikely to impossible.
- It has **two command slots labeled separately**, correctness and hygiene, so conflating them is
  no longer available either.

**The interview fills the slots.** And here is the mechanism that matters: **an unfilled slot is a
visible question.** A `<stack: preguntá antes de completar>` left untouched shows in the file, and
anyone who opens it knows something is missing. A free generation that decided alone leaves no mark
— and it has happened: a whole stack was written without asking, with the question explicitly
requested in the prompt, and the resulting file had no way to give it away.

## If a `CLAUDE.md` already exists

**Don't overwrite it.** This skill is not "regenerate the contract"; on a repo that already has one,
its job is to review it against what the harness needs and **propose** the fixes, one by one, for
the person to decide.

**Before the five checks, read the whole file looking for claims the repo contradicts — the ones
already there and the ones you are going to propose.** Every sentence about the state of the
project —what exists, what is missing, what works, how many steps the cycle has— is checked against
the real repo, not against what the file says about itself. A false claim in the contract is worse
than a missing one: every agent reads it and treats it as true. **Before presenting a change,
reread your own text with the same criterion** — a new sentence can be false from the day it is
written. And when a sentence about state is needed, write it as a conditional ("if they aren't
installed, `npx playwright install chromium` installs them"): a statement of state ages, a
conditional doesn't. **The same goes for the project's own rules: a rule says what is done or not
done, not what there is.** "No summary of the design system is kept in the repo" survives a feature
porting the system's code; "the repo has no copy of the system" becomes false with the first commit
that does what the design skill asks, and nobody notices. The five checks below are the minimum the
harness needs, not the complete list of what can be wrong.

Look at five things:

1. **The two command slots** are labeled and separate. If there is a single list of commands, that
   is the most expensive finding of the five: without the separation, `implement-task` and
   `close-feature` have nothing to bind to, and a lint inside the correctness command makes a
   task's verification fail over a formatting complaint.
2. **There is no structure section** and no concrete file names.
3. **The cycle table** names the current producers of each step.
4. **The configs** from the "What to seed" section exist, say what they have to say, **and their
   dependency is installed** — run the doctor from the section below, don't inspect it by eye.
5. **Every slot of the template exists in the contract, with its mark.** The template marks the
   slots that the cycle's steps read with an invisible comment, `<!-- ranura: auditor -->`. Look
   for every mark of `assets/CLAUDE.template.md` in the project's `CLAUDE.md`: if one is missing,
   that slot doesn't exist yet —the template added it after the contract was written— and it is
   proposed, with its mark, like any other fix. If the slot is there but without the mark (written
   in another form, for example a table), only the mark is proposed: the project's wording is not
   touched.

A change to the `CLAUDE.md` of a project that is already working is a change of contract: it is
proposed and the yes is awaited. Don't apply it in one go.

## The interview

Before asking anything, **look at what's already there**: `package.json`, `pyproject.toml`,
`go.mod`, a `Makefile`, whatever files there are. A question whose answer is in the repo is a
question that spends the person's patience without buying anything.

**First round — what doesn't depend on anything:**

- The project's name and what it is, in one line.
- **The stack.** This is the one that is never skipped, not even when the answer seems obvious. If
  you have a recommendation, give it — but **labeled**: "I decided this, tell me if it works". What
  you can't do is write it in the file as if it had been asked for.
- **Will there be a navigable interface?** A URL or a `file://` someone can open — web, a
  dashboard, anything Playwright can visit. Look at the repo before asking and **propose the
  answer**: an `index.html`, a `vite.config`, a UI framework in `package.json` suggest it on their
  own; so does a CLI or library project. This answer decides whether in "What to seed" you install
  Playwright now or install nothing yet — it doesn't decide whether *this* particular feature will
  have one: each `design.md` declares that, separately.

**Second round — what depends on the stack:**

- **If there is an interface with client-side JavaScript, the test DOM.** A click that changes what
  is shown is an *effect* criterion, and in step 5 it needs a DOM to be tested; e2e only arrives
  after every task is `done`, so it doesn't replace it. In `typescript-node` the default is jsdom,
  and `vitest.config.ts` brings the line commented out. If the answer is yes, add it to the Stack
  and to the install with the same yes as Playwright. A static HTML interface, with no client-side
  behavior, doesn't need it.
- **The correctness command**: typecheck and tests. Nothing else.
- **The hygiene command**: lint, format, build, e2e — whatever exists. If the project doesn't have
  any yet, the slot is filled by repeating the correctness ones **and saying it is provisional**. The
  empty slot is not deleted: it exists because step 8 will look for it.
- **The dependency auditor**: the ecosystem's (`npm audit`, `pip-audit`, `govulncheck`…) or
  "none", said explicitly. `close-feature` runs it to see which vulnerabilities each feature
  **brought**; without the slot, it would have to guess the ecosystem. It doesn't go inside hygiene:
  an inherited warning from a development dependency can't block closing a feature that didn't
  bring it.

If the repo already declares scripts, **propose them instead of asking in the abstract**: "I took
these from your `package.json`, do you confirm them?". It's faster and leaves the origin in view.

**The project's own rules:** ask whether there is one that holds for *every* feature. If there
isn't, the line is deleted instead of inventing one.

**The backlog:** does the project already use a tracker (GitHub Issues, Jira)? If so, the contract
names it; if not, the default stays, `docs/pendientes.md`. It is where whatever shows up in one
feature and belongs to another goes, and the router needs it written down so that finding has
somewhere to go.

**Label the origin of everything that ends up written**: "you asked for it" · "I decided it, tell
me if it works" · "I assumed it because X". A stated assumption is honest; a silent one becomes a
rule of the contract and from then on nobody questions it again.

## Writing the file

Copy `assets/CLAUDE.template.md` to `CLAUDE.md` at the project root and fill the slots with what
came out of the interview. The cycle table and the harness's rules **come already written**: they
are the method's memory, not the project's decisions, and they are not reopened on every init.
**The `<!-- ranura: … -->` marks stay**: they are invisible when reading, and they are what lets a
future review know which slots the template added later.

**The check before calling the step finished**, and it is mechanical on purpose:

```bash
grep -n "preguntá antes de completar" CLAUDE.md
```

If it returns something, there is an unfilled slot. That can be fine —sometimes a piece of data is
missing that the person doesn't have right now— but then **say it plainly** instead of letting it
pass: the file stays with an open question inside, which is exactly what the template came to
achieve. Never cover it up by filling it in on your own.

## What to seed besides `CLAUDE.md`

The configs that encode the harness's knowledge and that a new project won't rediscover. They are
in `assets/stacks/<stack>/`, and today there is only one, `typescript-node`. **That is on purpose:
start with one stack and add more as they show up**, instead of inventing configs for stacks nobody
has used yet.

**Rule: a config is seeded together with its dependency, or it isn't seeded.** A
`playwright.config.ts` without `@playwright/test` installed is the same problem as a file without an
owner, only disguised: the config has a producer (this skill), the dependency has nobody in charge,
and nothing notices it until step 7 — at the end of a whole feature, not at the start of the
project.

| File | What it encodes | Dependency |
|---|---|---|
| `vitest.config.ts` | Excludes `end2end/` from the unit runner. Without this, the two runners fight over the `.spec.ts` files — and the failure only shows up when the e2e cycle populates the folder, invalidating verdicts of tasks nobody touched. | `vitest` |
| `playwright.config.ts` | `retries: 0`. A case that passes on the second attempt is a finding, not a resolved case, and the triager has to see it that way. | `@playwright/test` + Chromium |

**`playwright.config.ts` is seeded only if the interview answered that there will be a navigable
interface.** If so, seed it together with its dependency, at the same moment, with a single yes:

```bash
npm i -D @playwright/test
npx playwright install chromium
```

It is the same install that used to be asked for in step 7, moved here: there it cost a whole
feature of waiting, here it costs one line. **If the answer was that there won't be an interface —or
that it isn't known yet—, don't seed the config or the `e2e` leg of the hygiene command.** The
hygiene slot is filled without that leg, and you say so as a conditional when writing it ("if an
interface shows up, this slot adds `npx playwright test`"): the first feature that declares a
navigable surface in its `design.md` will bring this skill back, in review mode, to seed what is
missing today.

**Copy them with their comments.** The comments *are* the content: they explain why the file
exists, and without them the first person to read them will delete the exclusion because it looks
arbitrary.

If the stack is none of the ones in `assets/stacks/`, **don't improvise the configs**: say which
problem they solve —the ones in the table— and let the person decide how it translates to their
stack. A config invented for a runner you don't know is worse than none.

**If you seeded Playwright, run the doctor at the end**, next to the unfilled-slots check above:
`node <verify-e2e-path>/scripts/e2e-doctor.cjs`, with the project's path. It confirms that the
dependency and the browser actually got installed — not that the command ran without error, which is
not the same thing if the install failed halfway.

**Offer `git init` if the repo isn't one.** The method asks for one commit per task, and without a
repo that doesn't exist. It happened: a whole project was done without a repo because nobody ran it
and nothing in the method asked for it.

## What NOT to seed

- **The document templates** (`requirements-template.md`, `design-template.md`,
  `tasks-template.md`, `e2e-tests-plan-template.md`). They already travel in the `assets/` of the
  skills that use them, and several agents know them by preloading. Copying them into the project
  creates two copies and the question of which one wins, which is the same trap as having the same
  workflow in two places.
- **The `docs/` folder.** `specify` creates it when it needs it.
- **`docs/pendientes.md`.** `close-feature` creates it the first time a feature leaves something for
  another one. An empty backlog seeded in advance is a file without content that everyone reads.
- **Code, scaffolding or an example app.** This step writes the contract, not the project.

## When finished

**Commit what you seeded**: the `CLAUDE.md`, the configs, and the `package.json`/`package-lock.json`
if you installed something — whoever receives the yes for a document or an install commits it.
Without this, the contract stays floating until the first task's commit, mixed with another step's
work.

Say in three lines what was left: the agreed stack, the two commands, and which configs you seeded
(and whether Playwright stayed out because there is no interface yet). Then name **step 1**, the
`brainstorming` skill: it is where the first feature comes in. Don't start it yourself.

## This skill's files

- `assets/CLAUDE.template.md` — the contract template, with its slots.
- `assets/stacks/typescript-node/` — the configs that encode the harness's memory for that stack.
