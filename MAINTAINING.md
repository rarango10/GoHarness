# Maintaining GoHarness

The contract of **whoever edits the harness**. If you came to build software *with* it, this file
isn't for you: read the [`README.md`](README.md) and install the plugin in your own project.

The rules of the **method** —what `done` means, who writes the plan, the unit of step 5— are not
here: they live in the router ([`plugin/goharness/SKILL.md`](plugin/goharness/SKILL.md)) and in the
contract template the harness seeds. This is maintenance of the product, not the method.

## Where the source lives

```
.claude-plugin/marketplace.json   the repo as a marketplace: points to ./plugin/goharness
plugin/goharness/                 THE PLUGIN. This is what gets installed
├── .claude-plugin/plugin.json    name, version, license
├── SKILL.md                      the router: explains the cycle and routes to the step at hand
├── skills/                       the 7 step skills, plus task-format (reference)
│   └── */assets/{en,es}/         each document template, in both languages
├── agents/                       the 7 subagents
├── workflows/tasks-fanout.js     the only writer of tasks.md
└── checks/                       the literal linter, the parity guard and the sync script
bench/                            the test bench: a frozen fixture, the eval runner, results
docs/                             plans of the harness's own cycles of change
LESSONS.md                        what went wrong using it, and the backlog
```

**It isn't in `.claude/` on purpose.** There, this repo would load its own skills *besides* the
installed plugin, and there would be two live versions of each one.

## The development loop

1. **Edit** the source in `plugin/goharness/`.
2. **Load it** in a session. Two ways:
   - `claude --plugin-dir plugin/goharness`, from the folder you test in. Nothing to sync; it is
     what the bench does.
   - Or mirror it into a copy Claude Code auto-loads:
     ```bash
     bash plugin/goharness/checks/sync-plugin.sh      # default: ~/.claude/skills/goharness
     ```
     It copies and then compares both whole trees in both directions. It has to say
     **"no drift"**; it fails if a file is extra or missing — on purpose, because a check that never
     fails is decorative.
3. **New session** so it picks up the changes.
4. **Test** the change by running the step of the cycle you touched, on a throwaway copy of
   [`bench/fixture-finanzas`](bench/fixture-finanzas/) — or on the evals, if you touched
   `brainstorming` or `specify` (see [The test bench](#the-test-bench)).
5. **Write down** what you learned in [`LESSONS.md`](LESSONS.md). That isn't bureaucracy: it is
   the asset.

**An install from the marketplace is a cached copy.** Editing the repo doesn't change what the
session loads until you run `claude plugin update` and restart.

## The checks

Five commands, and none is optional before a commit to the plugin:

```bash
claude plugin validate . --strict                  # the marketplace
claude plugin validate plugin/goharness --strict   # the plugin
node plugin/goharness/checks/lint-workflow-literals.cjs plugin/goharness/workflows/tasks-fanout.js
node plugin/goharness/checks/check-rules-parity.cjs  # rules, cycle table, slots and en/es twins
bash plugin/goharness/checks/sync-plugin.sh "$(mktemp -d)"  # has to say "no drift"
```

(The last one syncs into a throwaway folder: it checks the copy is complete without touching your
development copy.)

**The linter looks superfluous and isn't.** `tasks-fanout.js` is almost all prompts between
backticks. One backtick too many inside a prompt closes the literal and opens another, and the text
in between is parsed as expressions: the file is still valid JavaScript and the prompt is
destroyed. `node --check` is no use on that file: it uses a top-level `return`, which is how the
workflow runtime executes it, and under ESM that gives an error that means nothing.

**The parity guard watches duplication that can't be removed.** The method's rules and the cycle
table live in the router and again in `CLAUDE.template.md`, the one `harness-init` seeds in every
project; and every template exists twice, in `assets/en/` and `assets/es/`. They aren't redundant
copies —the router talks to the harness, the template to the project being born—, but they have to
name the same rules and the same producers. Fixing a rule on one side breaks nothing visible: the
next seeded project is born with the old version. The guard compares:

- each rule by its invisible tag (`<!-- regla: done-means-verified -->`): every tag of the router
  has to exist in both contract templates, and a rule without a tag is a red;
- the producer of each step of the cycle table;
- the two contract templates: same `regla` and `ranura` marks in the same order;
- each template against its twin: same heading levels, as many table rows and hidden comments.

It compares structure, not wording: it catches a section added in one language and forgotten in
the other, without pretending to judge a translation.

### A real install, before publishing

It is the only thing that proves what another person will see:

```bash
cd "$(mktemp -d)"
claude plugin marketplace add rarango10/GoHarness --scope local
claude plugin install goharness@goharness --scope local
claude plugin list --json    # 8 skills (7 step + 1 reference), 7 agents, the workflow and the router
claude plugin uninstall goharness@goharness --scope local      # from this same folder
claude plugin marketplace remove goharness --scope local       # only if this test added it
```

## Two languages

The harness's instructions are in English; each project writes its documents in the language of
its `CLAUDE.md`. Keeping both working means four things when you edit:

- **A template is two files.** Changing `assets/en/…` without `assets/es/…` (or the other way
  round) is a red in the parity guard.
- **A keyword is two words.** The glossary in
  [`task-format`](plugin/goharness/skills/task-format/SKILL.md) gives each one a canonical English
  form and a Spanish alias. A new keyword enters the glossary with both before any agent uses it:
  one agent writes it and another reads it, and if they disagree the chain breaks without any
  visible error.
- **Some literals are never translated**, because they are contract and older projects depend on
  them: the modes (`--modo corrido`, `--modo autonomo`, `--sin plan` and its siblings), the marks
  `<!-- ranura: … -->` and `<!-- regla: … -->`, the triager's JSON (`ruteo`, `aFase2`, `aTDD`,
  `aSpecify`, `indeterminado`, `causa`) and `docs/pendientes.md`.
- **Trigger phrases go in both languages** in each skill's `description`
  (`'let's write the spec / escribamos el spec'`): the description is what triggers the skill, so a
  phrase only in English leaves a Spanish speaker without it.

## The test bench

[`bench/`](bench/) exists so a change of prose can be checked instead of eyeballed.

- **`fixture-finanzas/`** — a small TypeScript CLI with its seeded `CLAUDE.md`, in Spanish.
  **It is frozen**: every result compares against runs on this exact fixture, so changing it means
  a new baseline. (That is why it has no `Language` slot: it falls back to "the language the
  contract is written in", which is Spanish.)
- **`run_evals.py`** — runs a skill's `evals/evals.json` the way a person would use it:
  `claude -p` in a clean copy of the fixture (a git repo with two commits), with the plugin loaded
  by `--plugin-dir` and none of your own settings (`--setting-sources project`,
  `--strict-mcp-config`). Multi-turn evals get a simulated user, a second `claude -p` with no tools
  that answers from a per-eval script; the runner cuts the conversation.
- **`scrub.py`** — removes personal data (home paths, username, connected services) from results.
  The runner applies it to every run, because the results are committed to a public repo.
- **`results/`** — one folder per run of the bench, each with a `README.md` that summarizes it.
  The reference is [`2026-09-29-baseline-0.5.2`](bench/results/2026-09-29-baseline-0.5.2/README.md).

The recipe:

```bash
python3 bench/run_evals.py --skill brainstorming --out bench/results/YYYY-MM-DD-<name>
python3 bench/run_evals.py --skill specify --out bench/results/YYYY-MM-DD-<name> [--evals 0,2] [--reps 1]
python3 plugin/goharness/skills/specify/evals/check_specs.py bench/results/YYYY-MM-DD-<name>/specify \
  > bench/results/YYYY-MM-DD-<name>/specify/check_specs.txt
```

Then grade **by hand** against each eval's expectations, leave the evidence in each run's
`grading.json`, and write the folder's `README.md` with the table against the baseline.

**Runs cost quota.** A full pass of both skills is about 13–15 USD equivalent. So: one run per eval,
and a failure is a signal, not yet a verdict — it gets repeated before being called a pattern.
Only the evals of the skills you touched.

**Testing the workflow** (`tasks-fanout`) has no evals: it is run for real on a copy of the fixture
with a spec folder already approved. Because the bench uses `--setting-sources project`, that copy
needs its own `.claude/settings.json` with `"enableWorkflows": true`, or the `Workflow` tool doesn't
exist.

## The backlog

It is the **status index** at the top of [`LESSONS.md`](LESSONS.md). The statuses that matter:

- **`ready to apply`** — the fix is already written down in the entry. It is executed without
  reasoning it again. That is where you start.
- **`open`** — the fix still has to be decided.
- **`watching`** — it happened once, without harm; it is applied if it happens again.
- **`accepted limit`** — the analysis is closed and the conclusion was to touch nothing. Don't
  reopen it without new evidence.

## The maintainer's rules

- **The repo is the source; everything else is a copy.** If you find a file in the plugin that
  doesn't exist in the repo, bring it in — don't edit it there.
- **Don't edit the harness with a run of the cycle in flight.** Afterwards you can't tell what caused
  what.
- **Two plugins with the same name don't coexist, and the one that loses is switched off
  silently.** If you install `goharness` from the marketplace while you have the development copy
  in `~/.claude/skills/goharness`, the latter is disabled and it only shows in
  `claude plugin list`. While you edit, don't install it. (And don't keep `goharness-es` installed
  either: different name, same trigger phrases.)
- **Fewer rules, not more.** Before turning a lesson into a rule, ask: if this isn't done, does
  something that matters fail? What is hypothetical, a one-off slip in execution, or already caught
  by the existing process doesn't become a rule.
- **The plan of a new cycle of change goes in `docs/YYYY-MM-DD-<name>/`.** Old plans aren't
  reopened: they stay as a record of what was decided and why.
- **Nothing is deleted from `LESSONS.md`.** A lesson that turned out false is marked `discarded`
  with the correction next to it — the analysis error is worth as much as the finding.

## Packaging, and what surprises you there

**Inside a plugin everything is renamed**: the workflow registers as `goharness:tasks-fanout` and
the subagents as `goharness:spec-scout`. The bare name stops resolving, and that breaks in two
places: when launching the workflow —`planning-tasks` reads the `Available:` list from the error
itself and relaunches— and inside the script, in the five subagent calls, where `tasks-fanout.js`
discovers the prefix from the error message and caches it.

The pattern holds for anything you package: **discover the prefix by reading it from the error,
never hardcode it.**

**`claude plugin details <name>` lies by omission.** It gives the inventory and the projected
always-on cost, but it doesn't count the `SKILL.md` at the plugin's root nor the workflows. In a
real session the router and the namespaced workflow load too: **check against the session's skill
list**, which is what was actually loaded.

## Publishing a version

1. Bump `version` in `plugin/goharness/.claude-plugin/plugin.json` and commit.
2. **`git push origin main` — before the tag.** The marketplace reads the default branch, not the
   tags: a tag pushed without `main` points to a commit the marketplace never sees, and whoever
   installs gets the old version with no error at all.
3. `claude plugin tag plugin/goharness --push` — builds the tag `goharness--v{version}`, checks on
   the way that the manifest and the marketplace entry match, and pushes it. It takes the plugin's
   path because its manifest isn't at the repo root; `--dry-run` shows the tag before creating it.
4. **Check with a real install** (the one above), and look that `installPath` ends in the new
   version. `claude plugin marketplace update` says "updated" even when it brought nothing, so its
   message proves nothing.

On the other side it is updated with `claude plugin update goharness@goharness`.

## Forking it and publishing your own

Since `plugin/goharness/` is already a plugin and the repo is already its marketplace, your fork
installs the same way as this one, with your user instead of `rarango10`.

1. **Rename it.** In `plugin/goharness/.claude-plugin/plugin.json` (`name`), in the `name:` of the
   router `SKILL.md`, and in `.claude-plugin/marketplace.json` (`name`, `owner` and the `plugins`
   entry). **It isn't cosmetic:** two plugins with the same name don't coexist, and the one that
   loses is switched off silently.
2. **Run the five checks** above.
3. **Check nothing broke** with the bench, on the skills you changed.
4. **Publish it with a tag**, following the steps above with your plugin's name.
