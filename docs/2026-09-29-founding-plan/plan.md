# Plan — GoHarness in English, in its own repo

> **Status: approved (2026-09-29).**
>
> This is the founding document of this repo: an English translation of the last plan written in
> [`GoHarness-es`](https://github.com/rarango10/GoHarness-es), the Spanish repo where the harness
> was born. The [Spanish original](https://github.com/rarango10/GoHarness-es/blob/main/docs/2026-09-29-goharness-en-ingles/plan.md)
> stays there as the record of **why** the move happened. Links to files that only exist in that
> repo point there.
>
> Names in `code` (files, skills, tags such as `<!-- ranura: … -->`) are kept as they are today in
> the code, in Spanish; renaming them is part of phases 2 to 5.

## Context

GoHarness was tested successfully in Spanish, on the calculator in `GoHarness-es`. Now there are
English-speaking coworkers who are going to **use it, read it and propose changes to it**. That
last part is what settles it: nobody can give an opinion on a rule they cannot read, so the
harness's instructions —not just its edges— have to be in English.

The [2026-09-12](https://github.com/rarango10/GoHarness-es/blob/main/docs/2026-09-12-modos-de-trabajo/plan.md#cuándo-sí-convendría-partir-el-repo)
plan dated this decision and listed the signals for it. The second one came true: *"that outside
people show up contributing to the harness and the noise of the example gets in the way"*. That
plan also anticipated the fate of `HARNESS.md`: becoming the maintainer repo's README.

**Only its author uses the repo**; one or two people explored it. There are no users to keep
compatibility for: a heads-up is enough.

**Goal:** a new `GoHarness` repo, in English, dedicated only to the plugin, that also works in
Spanish; and the old repo, renamed `GoHarness-es`, frozen at 0.5.2 as a case study.

## Options considered

| Option | Why not |
|---|---|
| **English fork, both alive** | Every improvement made twice, by hand, with nothing to detect when they drift apart. At this harness's pace (7 commits to the plugin in a single day) the English one would always lag behind. |
| **Whole harness bilingual, in the old repo** | The same double maintenance, in one place. And Claude Code plugins have no way to switch language. |
| **Instructions in Spanish, edges in English** | Would have worked if coworkers only *used* it. Since they will also propose changes, it is not enough. |
| **Turn the old repo into English, in place** | Viable, but it drags along the calculator, its Spanish contract and compatibility with 0.5.x projects. |
| **New repo in English + the old one frozen** ✔ | A single living branch, so no double maintenance. And the new repo is born without the "two things at once" confusion that `EMPEZAR-ACA.md` exists to resolve. |

## Decisions made

1. **The name `GoHarness` goes to the new repo.** The old one is renamed `GoHarness-es`, and its
   plugin is renamed `goharness-es`. The two plugins cannot share a name: "two plugins with the
   same name do not coexist, and the losing one is silently disabled"
   ([`HARNESS.md`](https://github.com/rarango10/GoHarness-es/blob/main/HARNESS.md)).
2. **`GoHarness-es` stays truly frozen.** Its last commit is the phase 0 one. If it receives fixes,
   it becomes the double-maintenance fork that was ruled out.
3. **The new harness speaks English inside and the project's language outside.** The author works
   in Spanish and will use the new harness, so Spanish is a supported language, not a leftover.
4. **The calculator does not move.** It stays in `GoHarness-es` as a public case study, and the new
   README links to it.
5. **Lessons are distilled, not translated.** The 3,283 lines of
   [`lecciones.md`](https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md) stay there.
   What travels to the new repo is a summary of principles, with a link to each original entry,
   plus the entries that are still open.
6. **No harness improvements go in while the move lasts.** Whatever comes up is written down as a
   new lesson and applied after phase 6. Mixing translation with behavior changes makes it
   impossible to know what caused what: it is the "don't edit the harness with a run in flight"
   rule, applied to the move.

## Phase 0 — Close `GoHarness-es` (in the old repo)

The order matters for a concrete reason. **GitHub redirects the old name of a renamed repo until
someone creates a new repo with that name; at that moment the redirect is cut.** Everything that
depends on the redirect has to be done and verified before step 6.

1. **Last commit** (version **0.5.2**):
   - `plugin.json` and `.claude-plugin/marketplace.json`: `name` → `goharness-es`.
   - Install instructions → `rarango10/GoHarness-es` and `goharness-es@goharness-es`, in
     `README.md`, `EMPEZAR-ACA.md` and `HARNESS.md`. Old plans are not touched: they are a record.
   - Notice at the top of `README.md`: *"This version was frozen at 0.5.2. Development continues at
     [rarango10/GoHarness](https://github.com/rarango10/GoHarness), which also works in Spanish."*
   - Note at the top of the `lecciones.md` index: the repo was frozen; new lessons are written in
     the new repo.
   - The five checks in `HARNESS.md` green. The parity guard should not move: no rule changes.
2. **Rename the repo on GitHub:** Settings → Repository name → `GoHarness-es`.
3. **Update the local clone:** `git remote set-url origin https://github.com/rarango10/GoHarness-es.git`.
   **Before creating the new repo**: otherwise, a `git push` from there would send the calculator's
   history to the wrong repo.
4. **Push `main`, then the tag** (`claude plugin tag plugin/goharness --push`), in that order, as
   `HARNESS.md` says.
5. **Real install in a throwaway folder** of `goharness-es@goharness-es` from the new name. Check
   that `installPath` ends in `0.5.2`.
6. **Clean the machine:** uninstall `goharness@goharness`, remove the old marketplace and delete the
   development copy `~/.claude/skills/goharness/`. The new plugin will use that path.
7. **Rename the local folder** `dev/GoHarness` → `dev/GoHarness-es`. Note: Claude's session memory
   is tied to the path. If the new repo is cloned into `dev/GoHarness`, it inherits those notes,
   which is what we want, because they are the author's preferences, not the repo's.

**Gate:** step 5 green. Only then is the new repo created.

## Phase 1 — The new repo is born

- **Create `rarango10/GoHarness`** with the history of `plugin/` and `.claude-plugin/`, without the
  calculator, so `git blame` keeps explaining every line of the plugin. Done with
  `git filter-repo --path plugin/ --path .claude-plugin/` (needs installing) or with
  `git subtree split`; decided when executing it. If neither works cleanly, start without history
  and link to the old repo.
- **Same structure** `plugin/goharness/`, so the check commands and the sync keep their paths.
- **A copy of this plan** as `docs/<date>-founding-plan/plan.md`, translated.
- **Test bench** (see the next section), before touching a single instruction.
- **No routing file.** `EMPEZAR-ACA.md` existed because the repo was two things; the new one is one.

## The test bench that replaces the calculator

The calculator served two purposes: **showcase** and **test bench**. The showcase is covered by the
link to the case study. The test bench needs an explicit replacement, because almost every lesson
was born there.

- **One throwaway project per test, starting at step 0.** Better than the calculator: its
  `CLAUDE.md` was weeks old, so `harness-init` almost never ran from scratch again.
- **A written recipe** in `MAINTAINING.md` (formerly `HARNESS.md`): how to create the folder,
  install the local plugin, which small feature to ask for and what to look at in each step.
- **The existing evals** for `brainstorming` and `specify` as a quick safety net. They are run
  **before** translating, to have the baseline to compare against afterwards.

## Phase 2 — Language-independent foundations (the text stays in Spanish)

Structure first, prose after. At the end of this phase, the harness behaves the same as 0.5.2 on a
Spanish project. That is tested on the bench.

- **Tags on the rules:** every rule in the template and the router gets `<!-- regla: <id> -->`,
  as the slots already do with `<!-- ranura: … -->`. `check-rules-parity.cjs` compares tags, not
  bold titles. Without that, the guard cannot compare an English template with a Spanish one.
- **Keyword glossary**, in `formato-de-tareas`. A canonical English version (`pending`,
  `in progress`, `done`, `meets`, `partially-meets`, `does-not-meet`, `unverifiable`, `Covers`,
  `Log`, `approved`…) with its Spanish aliases (`pendiente`, `en curso`, `hecho`, `cumple`, `Cubre`,
  `Registro`, `aprobado`…).
- **Schemas in canonical English:** the `enum`s in `tasks-fanout.js` move to the canonical values,
  and `spec-scout` normalizes what it reads from a `tasks.md` in either language.
- **`check_specs.py`** accepts the design's section names in both languages.
- **The parity guard loses one side:** without an example's `CLAUDE.md`, it compares router ↔
  template, and English template ↔ Spanish template.

## Phase 3 — Translate the core

- Skills, agents, workflow prompts and script messages (`e2e-doctor.cjs` talks to whoever uses the
  harness), **one at a time**, with the test bench between each one.
- **New rule:** converse and write documents in the project's language, and translate the canned
  messages the skills bring when saying them.
- **Each skill's `description`** in English, with examples in both languages: "let's implement T3 /
  implementemos T3".
- **Translation does not change behavior.** Phrases like "`done` means verified" or "don't confuse
  'I couldn't verify' with 'does not meet'" came from concrete lessons. When the obvious
  translation loses the nuance, the original `lecciones.md` entry says what has to survive.
- **Evals after translating**, compared against the phase 1 baseline.

## Phase 4 — Templates in both languages

- `assets/en/` and `assets/es/` for the six templates: `CLAUDE`, `requirements`, `design`,
  `tasks`, the e2e plan and `pendientes` (~600 lines).
- **A `<!-- ranura: idioma -->` slot** in the contract template. `harness-init` asks for it in step
  0 and seeds the templates of the chosen language.
- The parity guard checks that both versions have the same tags and the same slots.

## Phase 5 — Repo documents

| File | Where it comes from |
|---|---|
| `README.md` | The parts of the current README that speak to whoever uses or evaluates the harness. "Moments where the cycle did its job" is summarized and links to the case study in `GoHarness-es`. |
| `MAINTAINING.md` | `HARNESS.md`, plus the test bench recipe. |
| `LESSONS.md` | The distilled principles from what is already resolved, in English, with a link to the original entry. The entries still standing travel in full: **L6**, **L8**, **L12**, **L29**, **L50** and **L53**. New lessons are written in English. |
| `CLAUDE.md` | A short one for the maintainer: the repo is the plugin, where the source is and what is checked. It is no longer an example's contract. |

## Phase 6 — Gate for sharing

1. **One complete feature in English and another in Spanish**, each in its own throwaway folder,
   with the plugin installed from the real marketplace. It passes if:
   - each one goes through the nine steps;
   - the documents come out in the project's language;
   - no keyword slips out in the other language.
2. **Version 0.6.0.** The numbering continues, because the plugin's history travels with the repo.
   1.0 is kept for when the harness stops changing so often.
3. **Only then**, share it with the coworkers.

## What is not done

- The calculator and its `docs/` do not move.
- Old `lecciones.md` entries are not translated.
- `GoHarness-es` is not touched after phase 0.
- No improvements are applied to the harness during the move (decision 6).

## Risks

| Risk | What contains it |
|---|---|
| Creating the new repo before verifying the rename | The phase 0 gate |
| Pushing the calculator to the new repo | Phase 0 step 3, before creating anything |
| Translation changes behavior without anyone noticing | Evals before and after, the bench between each skill, and the lessons as the reference for what must survive |
| A keyword differing between agents | A single glossary and canonical schemas (phase 2) before translating the prose |
| The templates in the two languages drift apart | Parity guard by tags (phases 2 and 4) |
| Losing the test bench | Built in phase 1, before any change |
