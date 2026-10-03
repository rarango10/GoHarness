# Lessons

A record of what we learn using the harness, so it isn't lost between sessions. Each entry says
**what happened**, **why it matters** and **what should be done**. When something is applied, it is
marked with its commit, not deleted: knowing why something was done is worth as much as the change.

Statuses: `open` (the fix still has to be decided) · `watching` (we know it happens; whether to
touch it is still to be decided) · **`ready to apply`** (the fix is written here; it only has to be
done) · `resolved` · `partially resolved` · **`accepted limit`** (the analysis is closed and the
conclusion was to touch nothing — it isn't pending, and reopening it costs repeating the analysis) ·
`discarded` (the premise turned out false; it is kept because knowing why it was false stops us from
believing it again).

> **Apply nothing while a test of the harness is in flight.** Changing a skill or the workflow in the
> middle of a run invalidates the result: afterwards you can't tell what caused what. The
> `ready to apply` fixes are gathered and done together when the run is over.

**Where the earlier lessons are.** L1 to L57 were written in Spanish, in
[`GoHarness-es/lecciones.md`](https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md),
and are not translated. What they taught is distilled below in
[Principles](#principles-from-l1l57), each with a link to its entry. The six that are still standing
travel here in full. New lessons are written here, in English, from L58 on.

---

## Status index

**This table is the durable record of what is done and what isn't.** It is what you read to know,
and you don't have to look anywhere else — same function as the `Status` column of a `tasks.md`,
and for the same reason. The resolved L1–L57 are in the
[original index](https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#índice-de-estado).

| # | What | Status | Where it stands |
|---|------|--------|-----------------|
| [L6](#l6--playwrights-mcp-could-pick-better-selectors--watching) | Playwright's MCP would pick better selectors | `watching` | outside the plugin: waits for a real `causa: test` failure |
| [L8](#l8--gates-are-instructions-not-mechanisms--accepted-limit) | Gates are instructions, not mechanisms | **`accepted limit`** | analysis closed |
| [L12](#l12--dod-checker-trusts-that-a-passing-test-proves-what-it-claims--partially-resolved) | A passing test doesn't prove what it claims to prove | **`partially resolved`** | batch 13 · `dod-checker` (sabotage + diff). The red→green order stays in L29 |
| [L29](#l29--the-evidence-that-there-was-tdd-is-self-reported-prose--partially-resolved) | The evidence of TDD is self-reported prose | **`partially resolved`** | batch 5 · one commit per task. **The order is still unverified** |
| [L50](#l50--a-requested-domain-skill-wasnt-invoked-the-contract-pointed-to-its-copy--open) | A requested domain skill wasn't invoked: the contract pointed to its copy | `open` | outside the harness for now: the generic part is in L49 |
| [L53](#l53--dependency-security-has-no-step-it-was-seen-by-accident--partially-resolved) | Dependency security has no step: it was seen by accident | **`partially resolved`** | batch 14 · `close-feature` + a slot in the template. The baseline looks at the manifest, not the transitive tree |
| [L58](#l58--an-approval-that-carries-a-verb-to-start-starts-the-next-step--watching) | An approval that carries a verb to start starts the next step | `watching` | 2 of 2 in the 0.5.2 baseline, passed once in English |
| [L59](#l59--one-question-at-a-time-announced-four-asked--watching) | "One question at a time", announced; four asked | `watching` | 1 of 1 in the baseline; passed in the phase 3 evals and in the English run (six questions, one at a time) |
| [L60](#l60--the-task-writer-carries-over-spec-gaps-already-resolved--open) | The task writer carries over spec gaps already resolved | `open` | seen in the phase 2 workflow test |
| [L61](#l61--the-compound-criterion-detector-only-knows-spanish--ready-to-apply) | The compound-criterion detector only knows Spanish | **`ready to apply`** | `check_specs.py` |
| [L62](#l62--an-eval-script-shorter-than-the-conversation-leaves-expectations-unevaluated--ready-to-apply) | An eval script shorter than the conversation leaves expectations unevaluated | **`ready to apply`** | `run_evals.py`, script of brainstorming 5 |
| [L63](#l63--the-contract-marks-are-still-in-spanish--open) | The contract marks are still in Spanish | `open` | requested by the maintainer; after phase 6 |
| [L64](#l64--dod-checker-can-read-the-previous-features-commit--resolved) | `dod-checker` can read the previous feature's commit | `resolved` | phase 6 fixes · the search is narrowed to the feature's `tasks.md` |
| [L65](#l65--a-triagers-json-value-escaped-into-an-english-report--resolved) | A triager's JSON value escaped into an English report | `resolved` | phase 6 fixes · mapping in the triager and the glossary; checked on the next English feature |
| [L66](#l66--a-closing-with-nothing-to-commit-leaves-no-trace--ready-to-apply) | A closing with nothing to commit leaves no trace | **`ready to apply`** | blocks 0.6.0 · `close-feature`, `tasks-template.md` |
| [L67](#l67--harness-init-installs-a-dependency-nobody-was-asked-about--ready-to-apply) | `harness-init` installs a dependency nobody was asked about | **`ready to apply`** | `harness-init`: extends the rule of L47 |
| [L68](#l68--the-workflow-discovers-the-agent-prefix-by-failing-every-run--ready-to-apply) | The workflow discovers the agent prefix by failing, every run | **`ready to apply`** | `planning-tasks`, `tasks-fanout.js` |
| [L69](#l69--a-feature-that-needs-to-change-the-contract-has-no-route--open) | A feature that needs to change the contract has no route | `open` | 1 of 1 · candidate: a ninth class of change in the router |
| [L70](#l70--the-plan-creates-guard-tasks--open) | The plan creates guard tasks | `open` | 2 of 2 features · merge them, or accept it |

### Applied, not yet exercised by a real run

Carried over from the Spanish repo. Each one is in the plugin; none has run on a real feature yet.

- **[L49]** (batch 11), the visual reference — its natural test is a redesign with a binding
  mockup.
- **[L56]** (batch 12), the way back — a small feature where, in the middle of step 5, a criterion
  already covered by a `done` task gets amended. It has to go through `specify`, leave the header
  `amended` and `## Amendments`, and `implement-task` has to detect the task to reopen when it
  starts, and reopen it only with the yes.
- **[L51]** and **L12** (batch 13) — the next feature with client-side JavaScript.
- **[L55]** (batch 15) — in a new session, invoke each agent with a minimal prompt: its first
  message must not mention a skill that isn't its own.

**Exercised by the English run of phase 6** (2026-10-02, see
[L64–L70](#the-english-run-of-phase-6)), and out of this list: the backlog of [L54] (`dod-checker`
opened P1, the second closing wrote it); the closing's contract reread of [L52] and dependency audit
of [L53] (both closings); the dependency subtraction of [L24] (twelve verdicts on `@types/node`);
and `harness-init` seeding from scratch and in review mode.

**What no run has exercised yet:** the routing of the e2e cycle (`causa: test` / `codigo` /
`spec`) — every e2e run so far was green —, the detection of an aged verdict of [L33], and an A/B
comparison of *same input, different harness*.

---

## Principles from L1–L57

What the resolved lessons left in the harness, one line of principle each and the entries it came
from. The analysis, the evidence and the dead ends are in the originals.

### Every document has one producer, and every change has an owner

- **Even the project's contract has a producer.** The one step left without an owner is the one
  that gets done by hand every time — and it was the one repeated most. `harness-init` exists for
  that. [L1]
- **The contract holds what is true for every feature; the design, what is true for this one.** A
  file tree in `CLAUDE.md` makes `design.md` ratify instead of design. [L14]
- **A state nobody owns after the approval stays wrong.** An approval that happens in the chat has
  to land in the file, and someone has to be named to write it. [L21]
- **Rules that must live in two places need a guard, not care.** A rule fixed on one side breaks
  nothing visible; the next seeded project is born with the old one. The same holds for the
  example that shows the template. [L42] [L57]
- **The repo is the source; everything else is a copy.** A check that enumerates what it knows never
  finds what isn't on its list: compare whole trees. [L35]
- **An agent that understands ownership narrows a command that exceeds its region** — evidence the
  principle, not a list, is what travels. [L34]

### A verdict is worth what its question is worth

- **Correctness and hygiene are two commands.** With lint inside the verification of a task, a
  formatting complaint fails it for a reason unrelated to its criterion. [L13]
- **Don't tell the verifier the result you expect.** An independent verdict asked for in the same
  sentence that announces "it's green" is biased toward `meets`. [L22]
- **The verifier runs once, diagnoses, and stops.** When the environment fails, the useful answer
  is `unverifiable` with a precise reason, not ten attempts at fixing it. [L23]
- **What isn't a step isn't done.** A restriction mentioned in passing is not a procedure: subtracting
  dependencies against the contract had to become a step. [L24]
- **A superseded verdict is marked, not erased.** The log keeps the error and its correction, and a
  reader who finds the first line must not conclude the opposite of what happened. [L26]
- **A criterion belongs to the task that completes it, not to the ones that enable it.** Otherwise
  the verifier invents vocabulary ("in the scope it set out") to answer a question that doesn't
  fit. [L27]
- **A verdict holds for the state it was taken on.** `done` can become false without the task
  changing a line; step 8 re-checks everything on the final state. [L33]
- **A criterion in a task's `Covers` has to be closable in step 6.** "The e2e confirms it" is no
  answer: if the unit runner has no DOM, a DOM criterion can't be verified there. [L51]
- **Read-only is enforced by tools where it can be, and forbidden by execution, not net effect.** An
  agent that runs `git stash` and `git stash pop` leaves no trace and still wrote. [L9]

### The gate belongs to the person

- **Asking is not optional when it was asked for, and the questions need a stopping condition, not
  only a rhythm.** "One question per message" says how often, never when to stop. [L15] [L16]
- **Never hand a decision back as if the person had made it.** "As you asked" about something they
  never asked is manufactured consent, and it enters the spec as an agreed criterion. [L17]
- **Name the next step when asking for the approval, not after.** A yes without knowing what it
  unlocks reads as the harness having stopped. [L18]
- **The unit of step 5 is the task, and the second round of a task waits for the yes too.** "Eleven
  tasks" admits two readings until it is written which one holds. [L28] [L40]
- **Implementing closes with verifying.** A task implemented and not verified is indistinguishable
  from half done. [L30]
- **A confirmation is prose.** Turned into a structured question with one option, it was rejected
  and the person never saw it. [L38]
- **A skill that applies the reason behind a rule, not just the list, is the design working.** [L43]

### What is written has to be read by someone

- **Verifying a plan must not unapprove it.** Otherwise the cheapest check becomes the most
  expensive. [L10]
- **The next free id is stored, not derived.** Deriving it from what is left in the file reuses a
  number that may be cited in a commit. [L11]
- **Each step commits what it produces.** Otherwise the closing commit mixes step 7 with
  adjustments from steps 0 and 2. [L41]
- **A warning in a log needs a recipient.** Eight notes addressed "to the future" had no reader, and
  one was lost. [L45]
- **What belongs to another feature needs a place to live.** The same flaky test was written down
  five times in five tasks. [L54]
- **The cycle needs a way back.** A change enters through the highest document it touches and
  cascades down; the verdicts that relied on it stop being valid. [L56]
- **The contract ages with each feature.** It is reread when closing, and a review looks for false
  statements, not only for missing slots. [L39] [L52]

### The cycle fits the feature, not the other way round

- **A feature without an interface is a path, not an exception.** Step 7 is declared per feature.
  [L46]
- **Whoever seeds a config owns its dependency.** A Playwright config without `@playwright/test`
  costs the whole of step 7. [L47]
- **What isn't a criterion doesn't exist for the cycle.** A mockup that was never turned into
  criteria was ignored by a run that closed all green. [L49]
- **A rule written and never enforced is a wish.** "One criterion, one behavior" was in the
  template being used, and the criterion still came out compound; it needed a mechanical check.
  [L31]
- **Preload the format, not the mandate.** Agents that got the whole `specify` skill to learn the
  shape of `tasks.md` read it as contamination and ignored it. [L32] [L55]

### Packaging and environment

- **Inside a plugin everything is namespaced, workflows and agent types included**: discover the
  prefix from the error, never hardcode it. [L4] [L19]
- **For workflows there is no shadowing**: a local copy and the plugin's coexist, and you may be
  running the old one. [L5]
- **Two plugins with the same name don't coexist, and the loser is switched off silently.** [L44]
- **`claude plugin details` lies by omission**: it doesn't count the root `SKILL.md` or the
  workflows. [L3]
- **A skill preloaded by bare name does resolve inside a plugin** — checked through tool calls, not
  prose. [L2]
- **Progress that exists and isn't named doesn't exist for the person.** The workflow declares its
  phases and `planning-tasks` names `/workflows`. [L20] [L36]
- **A tag pushed without its branch publishes the old version, without error.** Push `main` first,
  and check with a real install. [L48]
- **A project verified by agents can't live in a synced folder.** iCloud turned a 34 ms worker start
  into 97 s. [L25]
- **Read the transcript before concluding.** A "slash command that improvised" turned out to be the
  router doing its job. [L37]

---

## L6 · Playwright's MCP could pick better selectors · `watching`

**What happened.** `e2e-test-writer` is told to prefer selectors by role and accessible text
(`getByRole`, `getByLabel`). But the role and the accessible name are computed at runtime, on the
rendered DOM, and today the agent deduces them by reading the markup in the source code.

**Why it matters.** A badly chosen selector makes the e2e fail, the triager has to diagnose
`causa: test`, and a whole round is spent finding out the code was fine.

**What should be done.** Phase 1 of `verify-e2e` detects whether Playwright's MCP is available and,
if it is, `e2e-test-writer` checks each selector with `browser_snapshot` —the accessibility tree of
the running page— before writing it.

**What NOT to do.** Declare the MCP as a component of the plugin. It would start a Playwright server
for everyone who installs it, even if they never use the e2e cycle. The MCP goes at user level, in
`~/.claude.json`, which is where it already is.

**Nothing to touch until the e2e cycle has a real `causa: test` failure.**

*Original: [L6 in GoHarness-es][L6-es].*

---

## L8 · Gates are instructions, not mechanisms · `accepted limit`

**What happened.** It holds for the four fixed gates of the cycle and the three configurable ones of
the e2e. Nothing stops a model from skipping an active gate, or `--modo autonomo` from turning off
more than was asked.

**Why it matters.** It is an accepted limitation, not a bug. The reason was documented: a gate
configuration file wouldn't bind more than the prose does, and it would add a normative source that
can contradict the skill. Real enforcement (`PreToolUse` hooks) doesn't map, because hooks fire on
tool calls and there is no tool-call boundary that means "the plan was approved".

**The nuance.** The return of the `Workflow` tool *is* an exact boundary, and `planning-tasks` uses
it to name `/workflows` and report when the plan is ready ([L36]).

**What should be done.** Nothing for now. It is written down so the analysis isn't rediscovered.

*Original: [L8 in GoHarness-es][L8-es].*

---

## L12 · `dod-checker` trusts that a passing test proves what it claims · `partially resolved`

**What happened.** With a person driving the TDD cycle, it is enough: they saw the red before the
green. In autonomous mode it flips — whoever implements has a direct incentive to produce green, and
the verifier takes the green as good.

**What should be done.** Turn on a test audit, or demand the red demonstrated before implementing.

**What was applied (batch 13).** `dod-checker` gained the sabotage question —*if I break what
produces this, does the test fail?*— and looks at the diff of the task's commit, not only at the
final state. That covers one half: that the test exercises what the criterion names.

**What remains.** When the test was written. That is [L29](#l29--the-evidence-that-there-was-tdd-is-self-reported-prose--partially-resolved).

*Original: [L12 in GoHarness-es][L12-es].*

---

## L29 · The evidence that there was TDD is self-reported prose · `partially resolved`

**What happened.** T2 to T5 of the demo (2026-09-06) built `calc.ts` in four real increments, each
with its own scope — checked by reading the Logs. But when trying to **check it independently** the
gap showed up: the project wasn't a git repo, and `dod-checker` only sees the final state. The only
evidence that the stepping happened is what whoever implemented wrote that they did.

**How it was found.** Reading `calc.ts` with the final regex `^-?\d+(\.\d+)?$` while T3's Log said
`^\d+$`, there was a reasonable suspicion that the Log lied. It was settled, but **only because the
Logs told the progression in prose**. Without that prose —or with false prose— there was nothing to
consult.

**Why it matters.** The whole harness rests on TDD: the contract makes it a rule, every task
declares its "first test (red)", and the stepping of the plan only makes sense if it is respected.
But **no artifact records the order**. An implementer who writes the complete solution and then the
tests produces exactly the same final state, the same `meets` verdicts, and a Log that can say
whatever it wants. The method's most central rule is the only one without verifiable evidence.

**It gets worse with [L12](#l12--dod-checker-trusts-that-a-passing-test-proves-what-it-claims--partially-resolved)**,
but it is different: L12 says `dod-checker` trusts that a passing test proves what it claims to
prove. This one says nobody can know **when** that test was written.

**The evidence exists, but it is ephemeral.** T5's transcript shows the complete, explicit cycle:
the red test with `expected 0.30000000000000004 to be 0.3`, the fix, and the green. So whoever
implements **does produce** the evidence — only it stays in a chat log nobody will be able to consult
a month from now, instead of in the repo. Nothing new has to be generated: what already happens has
to be persisted.

**What should be done.** Demand **one commit per task**, with the id in the message. With that:

- `git log` becomes the independent record of the stepping, and it isn't written by whoever
  implements but by the tool.
- `dod-checker` can look at that task's diff instead of the final state, and see whether the test
  file changed together with the code or much later.
- Later review stops depending on prose: what the Log says is compared with what the diff shows.

It costs one line of rule in the contract and one step per task, and it turns the method's most
important claim —"TDD is done here"— from a statement into data.

**Correction: that last part is oversold, and that is why the lesson stays `partially resolved`.** One
commit per task does **not** prove the test was written first: it brings the test and the
implementation together, so what it shows is that the task was a **unit of work**, not an order.
The strong proof would be **two** commits per task —one red and one green— and it is ruled out for a
good reason: a red commit contradicts the rule that each task leaves the repo working and green.

So the gap is covered in three pieces and one stays open:

| What it gives | What it doesn't |
|---|---|
| The commit per task gives traceability and a unit of work, written by the tool | It doesn't give the order |
| The red line in the `Log` gives **diagnosis**: what failed and how it looked | It isn't proof — it is self-reported like the rest of the journal |
| — | **The real order is still not independently verifiable** |

The red line was added anyway, and it is worth what it does do: "red because `add('0.1','0.2')`
returned `0.30000000000000004`" tells whoever reads it a month later why the rounding exists, which
finished code never shows. It is diagnosis, not evidence.

**Scope note.** The finance repo did have commits per stage, so the gap hadn't been noticed. It only
showed up when the harness was used on a new project, where nobody ran `git init` and nothing in the
method asked for it. It is exactly the kind of tacit assumption that reuse uncovers.

*Original: [L29 in GoHarness-es][L29-es].*

---

## L50 · A requested domain skill wasn't invoked: the contract pointed to its copy · `open`

**What happened.** In the same feature as [L49], the person asked in the first message to use the
`network-kpi-dashboards` skill. It was never invoked. The OoklaWeb `CLAUDE.md` said visual work
takes `docs/reference/sistema-de-diseno/` as reference and that **"that last document is read before
proposing any visual change"**. That document was a hand-made summary, and when listing what was
non-negotiable **it forgot `layout.md`**, precisely the piece that defines the grid and the
composition. With the skill, its step 4 (start from the reference dashboard) and its step 5 (compare
with the checklist) were lost too.

**Why it matters.** Two different things:

- **A copy doesn't replace the source.** Copies are made by summarizing, and what is lost is exactly
  what nobody was looking at. The skill already fixed it on its side: it opens with "if the project
  has a copy of this material, the copy doesn't replace this skill".
- **A rule in `CLAUDE.md` that no step consumes is an orphan rule.** OoklaWeb's rule was, in
  practice, the "script to use the skill only when the project needs it". It was written and
  loaded, but each step follows its own instructions, and none said "look for the reference and use
  it". On top of that, it pointed to the summary instead of the source.

**What should be done.** The direction is clear; one detail is missing:

- With the slot of [L49], the feature says where its reference comes from. If it is a skill, the
  steps that use it (brainstorming, specify, close-feature) **invoke it**; they don't read a copy.
- In `harness-init`: if the person names domain material, ask whether it is a skill or a file. If
  there is also a copy in the repo, the rule has to say that **the source wins**.
- **What remains to be decided:** whether domain skills are also declared in `CLAUDE.md`, so they
  hold beyond the visual —OoklaWeb has another case, the documentation of Ookla's methodology— or
  only in the per-feature slot. It is decided on the second iteration of the dashboard, with
  evidence.

**What this case is not.** It isn't a reason to put the KPI skill inside the harness: most projects
have no dashboards. The harness has to know **when** to use a reference; what matters in each design
is known by each skill.

*Original: [L50 in GoHarness-es][L50-es].*

---

## L53 · Dependency security has no step: it was seen by accident · `partially resolved`

**What happened.** OoklaWeb2, feature `2026-09-24-dashboard`, 2026-09-25. In the third round of T16
jsdom was installed, and `npm install` printed at the end "5 vulnerabilities (3 moderate, 1 high, 1
critical)". That is how it became known, **by accident**: if the feature hadn't installed anything,
nobody would have seen it. On review:

- All five are in the **vitest 2** chain (vitest, vite, vite-node, esbuild, @vitest/mocker),
  **older than the feature**: the engine's lockfile, imported from OoklaWeb, already had them. jsdom
  added none. Knowing that took auditing the `HEAD` lockfile by hand in a separate folder.
- All of them affect **vite's dev server** or **vitest's UI**, and the project runs neither
  (`vitest run`, static HTML). The practical risk is low, but not zero.
- The fix is `vitest@5`, **three major versions**. The person decided not to touch it in the
  feature: changing the runner during the closing invalidates the 19 `dod-checker` verdicts, which
  were taken with vitest 2. It became a feature of its own.

**Why it matters.** Three things:

- **No step of the cycle looks at dependency security.** Not `harness-init` when seeding, not
  `dod-checker` (which subtracts dependencies against the Stack, [L24], but doesn't audit), not the
  hygiene command, not `close-feature`. Nowhere in the plugin did `npm audit` or the word
  "vulnerability" appear.
- **Without a baseline, "this feature brought it" can't be told apart from "it was already there".**
  That is the question that decides what to do: a new vulnerability is the responsibility of the
  feature that introduced it, and an inherited one shouldn't stop a closing. Here it was answered by
  hand, auditing the `HEAD` lockfile in another folder. No step would do it on its own.
- **The typical fix changes the runner, and that clashes with the verdict model.** A major jump of
  vitest is the definition of "a verdict holds for the state it was taken on" ([L33]): every `meets`
  is in doubt at once. Doing it inside a feature contaminates it. The cycle has to say it goes
  separately.

**What should be done.** To be decided together with [L52]:

- **`close-feature`: compare the audit against the baseline.** Run the ecosystem's audit
  (`npm audit`, `pip-audit`, whatever fits the stack) on the base branch's lockfile and on the final
  one, and report **the difference**. A **new** vulnerability drops the task that brought the
  dependency to `in progress`, like a hygiene red. The **inherited** ones are reported and don't
  block: they are written down as a follow-up addressed outside the feature. Informative by default,
  and blocking only for what the feature introduced.
- **`harness-init`: one line in the contract about which auditor the project uses**, in the stack
  slot or next to the hygiene commands. That way `close-feature` knows what to run without guessing
  the ecosystem. If there is no auditor for the stack, it is said and the slot stays explicit.
- **Cycle rule: a major change of the runner or the toolchain is a feature of its own**, never a
  fix in the middle of another. It invalidates every existing verdict, and its verification is a
  different one: that the whole suite stays green with the new runner.

**What was applied (batch 14).** `close-feature` runs the declared auditor and blocks only what the
feature added or bumped; the inherited goes to the backlog. The contract template has a "Dependency
auditor" slot, outside hygiene. The toolchain rule is in the router, under "When something changes
midway".

**What remains.** The baseline compares the manifest, not the transitive tree: a vulnerability that
arrives through a sub-dependency of an unchanged package isn't attributed to the feature.

**What this case is not.** It isn't a request to block every closing with a red `npm audit`. Most
warnings in a typical project are in development dependencies and in code that never reaches the
product, as here. A check that always blocks is learned to be ignored. What is needed is to **see
the difference** each feature brings and **decide** about the inherited, not a traffic light.

*Original: [L53 in GoHarness-es][L53-es].*

---

## L58 · An approval that carries a verb to start starts the next step · `watching`

**What happened.** In the evals of the 0.5.2 baseline (2026-09-29), brainstorming eval 3 ended with
the simulated user saying "dale, me gusta, arranca con eso" ("ok, I like it, go ahead with that").
The skill invoked `specify` and wrote `requirements.md` in the same turn, taking the "dale" as
approval *and* as a request to start the spec. The same happened in the runner's trial run: 2 of 2.
Evals 4 and 5, with approvals that carry no verb to start ("sí, está bien, hazlo así", "va, me
convence, sigue"), stopped correctly. On the English core (2026-09-30) eval 3 passed, once: *"I
haven't started on the spec yet… writing requirements.md is a separate step"*.

**Why it matters.** The rule is that no step starts the next one: it names it. A casual approval
with a verb is exactly how people talk, so this is the gate most likely to be skipped in real use.

**What should be done.** Nothing yet: nothing was changed between the fail and the pass (the move
forbade behavior changes), and one run is a signal, not a fix. Repeat eval 3 a few times; if it fails
again, the fix goes in `brainstorming`'s "After Approval": an approval ends the step even when it
carries a verb to start.

*Evidence: [baseline](bench/results/2026-09-29-baseline-0.5.2/README.md) ·
[phase 3](bench/results/2026-09-30-phase3-en/README.md).*

---

## L59 · "One question at a time", announced; four asked · `watching`

**What happened.** In the baseline, brainstorming eval 2 (CSV import, one turn) announced "one at a
time", then asked about banks, separator, date format and amounts together, and listed five more
decisions ahead. On the English core it passed, once.

**Why it matters.** Four questions in one message get answered by halves, and what isn't answered
gets decided by the model. That is how [L16] and [L17] started.

**What should be done.** Same as [L58](#l58--an-approval-that-carries-a-verb-to-start-starts-the-next-step--watching):
repeat before touching anything.

**Since then, two passes in a row:** the phase 3 evals, and the English run of phase 6, whose
brainstorming asked six questions one at a time. Still `watching`.

*Evidence: [baseline](bench/results/2026-09-29-baseline-0.5.2/README.md).*

---

## L60 · The task writer carries over spec gaps already resolved · `open`

**What happened.** In the real test of `tasks-fanout` during phase 2 of the move (2026-09-30), on a
copy of the fixture, `task-writer` wrote into the plan `specGaps` that came from earlier rounds and
had already been resolved in the spec.

**Why it matters.** A gap that is no longer a gap sends the person to look for a problem that
doesn't exist, and teaches them to skip that section.

**What should be done.** To be decided: whether the scout marks the gaps as resolved when it reads
the spec, or the writer only keeps the gaps the reducer of *this* round reports. Reproduce it first
with a plan that has a resolved gap.

---

## L61 · The compound-criterion detector only knows Spanish · `ready to apply`

**What happened.** `check_specs.py` became bilingual in phase 2 for section names, but its detector
of compound criteria (the mechanical check of [L31]) looks for a conjunction followed by a verb in
Spanish infinitive (`-ar`, `-er`, `-ir`). `and` is in its list of conjunctions, but English verbs
don't end that way, so on an English criterion it never fires.

**Why it matters.** On an English spec the check stays green by not seeing anything: a detection
that is missing looks exactly like a spec that is fine.

**What should be done.** Give the detector an English pattern —`and` followed by a second verb after
`shall`— and check it against an English spec with a compound criterion planted on purpose: it has
to go red.

---

## L62 · An eval script shorter than the conversation leaves expectations unevaluated · `ready to apply`

**What happened.** In the phase 3 evals (2026-09-30), brainstorming eval 5 left 2 expectations not
evaluated: the skill presented the design in its 7th reply, and the runner ends the conversation
after 7 replies, so nobody was left to approve it.

**Why it matters.** An unevaluated expectation is neither a pass nor a fail, and it is easy to read
as a pass in a total.

**What should be done.** In `run_evals.py`, don't cut a conversation while the skill's last reply is
waiting for an approval that the eval's script is there to give: the cut has to come after it,
whatever turn the design arrives in. And keep writing in the results README when an expectation
couldn't be evaluated and why, as that run did.

---

## L63 · The contract marks are still in Spanish · `open`

**What happened.** In phase 4 of the move the invisible marks of the contract —`<!-- ranura: … -->`
and `<!-- regla: … -->`— were kept in Spanish in both templates, because they are contract: the
parity guard, `harness-init`, the router and every contract already seeded depend on them. The
maintainer asked that they move to English (`slot:` / `rule:`) after phase 6.

**Why it matters.** An English-speaking contributor reads `ranura` in every template without knowing
what it means, and the harness claims to be in English.

**What should be done.** Rename them in the templates, the guard, `harness-init`, the router and the
bench fixture's `CLAUDE.md` (which means a new baseline). **To be decided:** how contracts seeded
before the change are read — accepting both forms when reading, the same way the glossary does with
keywords, is the obvious candidate.

---

## The English run of phase 6

L64–L70 come from the English half of phase 6 (2026-10-02): a calculator built from an empty folder
with the plugin installed from the real marketplace, two features (`add-two-integers`,
`subtract-two-integers`), all nine steps each, green. The evidence is in that local project (its
`docs/`, `git log` and `docs/pendientes.md`), not in this repo. Several observations shared a cause
and are merged. The fixes are planned in
[`docs/2026-10-02-phase6-fixes/`](docs/2026-10-02-phase6-fixes/plan.md).

---

## L64 · `dod-checker` can read the previous feature's commit · `resolved`

**What happened.** Task ids restart at T1 in every feature. `dod-checker` finds the task's commit
with `git log --oneline --grep='<id>'`, so from the second feature on, `--grep='T3'` returned both
features' T3 (`f680ff2` from `add-two-integers`, `e95def6` from `subtract-two-integers`); the same
for T1, T2 and T4. `dod-checker` raised it itself, as P1 of the project's backlog, proposing to
change the commit convention in the contract.

**Why it matters.** The diff check of [L12](#l12--dod-checker-trusts-that-a-passing-test-proves-what-it-claims--partially-resolved)
reads the task's commit. If it reads the wrong one, the verdict is about another task's code, and
nothing on screen says so.

**What should be done.** No contract change: every task commit touches its own feature's
`tasks.md` (checked on all 16 task commits of the run), so the search only needs narrowing —
`git log --oneline --grep='^<id>:' -- <spec folder>/tasks.md`. Checked on the run's repo: it returns
only `e95def6`. It is the only `--grep=` in the plugin.

**Applied** in `agents/dod-checker.md` ("Look at the task's diff"), as written above.

---

## L65 · A triager's JSON value escaped into an English report · `resolved`

**What happened.** Both English e2e reports wrote the triager's JSON values into the document:
`### E1 — pasa`, `- Result: pasa`, and next to them an invented `Cause: none`. The values
(`pasa | falla | no-corrio`, `test | codigo | spec | indeterminado`) are contract and stay literal
in the JSON, but nothing gives their English form for the report, and `e2e-triager` preloads no
skill, so it never sees the glossary.

**Why it matters.** It fails the gate of phase 6: a keyword escaped into the other language. And 2
of 2 reports did it, so it isn't a slip.

**What should be done.** Put the mapping where the triager writes the report (step 4 of
`agents/e2e-triager.md`): result and cause in the project's language in the report, literal in the
JSON. Add the two rows to the glossary in `task-format` too, so the canonical list stays complete.
The English words are decided with the maintainer.

**Applied** with the maintainer's words: result `pass` · `fail` · `did-not-run`, cause `test` ·
`code` · `spec` · `undetermined`, in step 4 of the triager and as two rows of the glossary. A case
that passes has no cause, so `Cause: none` isn't invented again. It is checked on the next English
e2e report.

---

## L66 · A closing with nothing to commit leaves no trace · `ready to apply`

**What happened.** `close-feature` of the first feature found nothing left to commit and, as its
instructions say, made no empty commit. That the step ran stayed in the chat only. The next feature's
`brainstorming` read `git log`, saw step 7 (`1d2c06e`) as the last commit, concluded the feature was
still open and offered to close it again ("one feature at a time"). The second closing did commit
(`59c208d`), because it had backlog to write.

**Why it matters.** The next step reads the repo, not the chat. A step that only exists in the chat
didn't happen, for whoever comes after — the same as [L21].

**What should be done.** The closing always writes one line in the header of `tasks.md` (for example
`> Closed: YYYY-MM-DD · hygiene green`) and commits it: that commit isn't empty, it is the record.
Touches `close-feature`, the `tasks-template.md` header in `en` and `es`, and the glossary if
`Closed` becomes a keyword. The exact form is decided with the maintainer.

---

## L67 · `harness-init` installs a dependency nobody was asked about · `ready to apply`

**What happened.** Step 0 installed five dev dependencies. Four came from an answer; `@types/node`
was never mentioned: it came with a `tsconfig.json` (`"types": ["node"]`) that `harness-init` wrote on
its own and that isn't in `assets/stacks/typescript-node/`. The Stack didn't list it, so:
`dod-checker` flagged it on every task (twelve verdicts — the subtraction of [L24] working); the
implementer offered to edit `CLAUDE.md` itself; and `close-feature` saw it but classified it as "an
omission, not a falsehood". It was fixed through `harness-init` review mode (`6568fd8`), and the
note disappeared in the second feature.

**Why it matters.** The contract said something false about the project from step 0, and three
agents noticed without any of them owning the fix. Twelve identical notes teach the person to skip
the note.

**What should be done.** One line, extending the rule of [L47] ("a config is seeded together with
its dependency, or it isn't seeded"): **every dependency you install is named in the question that
installs it and listed in the Stack.** That covers the closing and the verifier without touching
them. In the same file, a translation slip: the example slot `<stack: preguntá antes de completar>`
should read `<stack: ask before filling in>`, like the template.

---

## L68 · The workflow discovers the agent prefix by failing, every run · `ready to apply`

**What happened.** Each `tasks-fanout` run shows one agent in red in `/workflows`: the script calls
`spec-scout` by its bare name, fails, reads `goharness:` from the error and retries ([L19]). It
works, but `planning-tasks` already launched `goharness:tasks-fanout` and knows the prefix. Raised by
the maintainer.

**Why it matters.** A red agent on every run teaches people to ignore red agents.

**What should be done.** `planning-tasks` passes the prefix with the folder
(`{"specDir": "docs/…", "agentPrefix": "goharness:"}`) and `tasks-fanout.js` starts `AGENT_PREFIX`
from it. The discovery by error stays as the fallback for a harness that runs without a plugin.

---

## L69 · A feature that needs to change the contract has no route · `open`

**What happened.** The first feature's T9 added a build, so the contract's hygiene and e2e commands
had to change. The design said the change was "applied with its own yes, in the task that introduces
it", so the plan gave `implement-task` an edit of `CLAUDE.md` — whose producer is `harness-init`
(`db66d1a`, `d95db42`). The router's eight classes of change don't include "the feature changes the
contract". `close-feature` would catch it only at step 8, while step 7 already runs the contract's
e2e command — and it passed by luck, with a build left on disk ([L33]). In the same spirit, the
implementer offered to fix the Stack of [L67](#l67--harness-init-installs-a-dependency-nobody-was-asked-about--ready-to-apply)
itself.

**Why it matters.** The contract is the one document every feature trusts. Edited from inside a task,
it skips the only step that checks it against the repo ([L39]).

**What should be done.** To be decided. Candidate: a ninth class in the router —"the contract has to
change"— whose path is `harness-init` in review mode, before the step that needs it.

---

## L70 · The plan creates guard tasks · `open`

**What happened.** In both features, two tasks passed on their first run with no code change (T5 and
T8 in the first, T3 and T4 in the second), and their goals said so in advance: they pin a criterion
that an earlier task already completed. The implementer handled them well, breaking the code on
purpose to see the red.

**Why it matters.** `task-format` rule 4 says a criterion belongs to the task that completes it
([L27]), and the reviewers didn't apply it. Each guard task costs a full verification cycle, and the
person approves four tasks where two were work.

**What should be done.** To be decided. Candidate: the reviewers merge a task whose first test would
already pass into the task that completes its criterion. Or accept it, and say so.

---

[L1]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l1--claudemd-no-tiene-productor--resuelto
[L2]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l2--la-precarga-skills-specify-dentro-de-un-plugin--resuelto--funciona
[L3]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l3--claude-plugin-details-miente-por-omisión--resuelto--documentado
[L4]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l4--los-workflows-de-un-plugin-se-registran-namespaceados--resuelto
[L5]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l5--para-workflows-no-hay-shadowing--resuelto--documentado
[L6-es]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l6--el-mcp-de-playwright-podría-elegir-mejores-selectores--en-observación
[L7]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l7--el-ciclo-e2e-nunca-corrió-entero--resuelto--corrió-y-salió-bien
[L8-es]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l8--las-compuertas-son-instrucciones-no-mecanismos--límite-asumido
[L9]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l9--que-los-agentes-de-solo-lectura-no-escriban-es-conducta-no-impedimento--resuelto-lote-8
[L10]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l10--re-planificar-desaprueba-un-plan-que-no-cambió--resuelto
[L11]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l11--el-próximo-id-libre-se-calcula-sobre-lo-que-quedó-en-el-archivo--resuelto
[L12-es]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l12--dod-checker-confía-en-que-un-test-que-pasa-prueba-lo-que-dice-probar--resuelto-parcialmente-lote-13
[L13]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l13--el-comando-de-verificación-puede-conflacionar-corrección-con-estilo--resuelto
[L14]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l14--claudemd-se-metió-en-territorio-de-designmd--resuelto
[L15]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l15--decidió-el-stack-sin-preguntar-habiéndoselo-pedido--resuelto--vía-l16-y-l17
[L16]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l16--brainstorming-fija-el-ritmo-de-las-preguntas-pero-no-la-condición-de-corte--resuelto
[L17]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l17--un-modelo-puede-devolverte-una-decisión-propia-como-si-fuera-tuya--resuelto
[L18]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l18--el-paso-siguiente-se-nombra-después-de-aprobar-no-al-pedir-la-aprobación--resuelto
[L19]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l19--los-agenttype-del-workflow-sufren-el-mismo-namespacing-que-el-workflow--resuelto
[L20]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l20--el-workflow-no-declara-metaphases-y-tres-títulos-no-podrían-matchear--resuelto
[L21]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l21--el-encabezado-estado-de-tasksmd-no-tiene-dueño-después-de-la-aprobación--resuelto
[L22]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l22--nadie-define-qué-se-le-puede-contar-a-dod-checker-al-invocarlo--resuelto
[L23]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l23--dod-checker-no-tiene-regla-de-corte-cuando-la-verificación-falla--resuelto
[L24]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l24--dod-checker-no-tiene-un-paso-que-compare-las-dependencias-contra-claudemd--resuelto
[L25]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l25--un-proyecto-verificado-por-agentes-no-puede-vivir-en-una-carpeta-sincronizada--resuelto
[L26]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l26--el-registro-no-tiene-convención-para-un-veredicto-superado--resuelto
[L27]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l27--cubre-no-distingue-satisface-el-criterio-de-es-necesaria-para-él--resuelto
[L28]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l28--la-granularidad-de-la-compuerta-dentro-del-paso-5-no-está-definida--resuelto
[L29-es]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l29--la-evidencia-de-que-hubo-tdd-es-prosa-autorreportada--resuelto-parcialmente
[L30]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l30--la-fase-de-implementación-no-tiene-instrucción-de-cierre--resuelto
[L31]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l31--la-regla-un-criterio-un-comportamiento-existe-y-nada-la-hace-cumplir--resuelto
[L32]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l32--un-agente-no-distingue-su-propia-configuración-de-lo-que-le-mandó-el-llamador--resuelto--en-dod-checker
[L33]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l33--un-veredicto-solo-vale-para-el-estado-en-que-se-tomó--resuelto
[L34]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l34--un-agente-razonó-su-frontera-de-propiedad-mejor-de-lo-que-se-le-pidió--resuelto--evidencia-positiva
[L35]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l35--dos-archivos-del-plugin-nunca-tuvieron-fuente-en-el-repo--resuelto
[L36]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l36--el-progreso-del-workflow-existía-y-ningún-paso-lo-nombraba--resuelto-lote-8
[L37]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l37--un-slash-command-que-no-resuelve-no-da-error-improvisa--descartada
[L38]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l38--preguntá-y-esperá-el-sí-se-tradujo-a-una-pregunta-estructurada-inválida--resuelto-lote-8
[L39]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l39--el-modo-revisión-de-harness-init-aprueba-un-contrato-que-miente--resuelto-lote-9
[L40]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l40--la-segunda-ronda-de-una-tarea-no-decía-si-espera-el-sí--resuelto-lote-10
[L41]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l41--los-pasos-0-a-3-no-commitean--resuelto-lote-10
[L42]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l42--una-regla-vive-en-claudemd-y-en-la-plantilla-sin-verificación--resuelto-lote-8
[L43]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l43--un-skill-extendió-un-principio-escrito-más-allá-de-la-lista-que-se-le-dio--resuelto--evidencia-positiva
[L44]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l44--dos-plugins-con-el-mismo-nombre-no-conviven-y-el-que-pierde-se-apaga-en-silencio--resuelto--documentado
[L45]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l45--las-advertencias-del-registro-no-tienen-lector-ni-destinatario--resuelto-lote-10
[L46]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l46--el-ciclo-asume-que-toda-feature-tiene-interfaz--resuelto-lote-9
[L47]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l47--se-siembra-el-config-de-playwright-y-la-dependencia-no-tiene-dueño--resuelto-lote-9
[L48]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l48--un-tag-empujado-sin-la-rama-publica-la-versión-vieja-sin-error--resuelto
[L49]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l49--un-artefacto-de-referencia-no-existe-para-el-ciclo--resuelto-lote-11
[L50-es]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l50--un-skill-de-dominio-pedido-no-se-invocó-el-contrato-apuntaba-a-su-copia--abierto
[L51]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l51--el-paso-6-no-puede-cerrar-criterios-de-dom-si-el-runner-de-unidad-no-tiene-dom--resuelto-lote-13
[L52]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l52--el-contrato-envejece-con-la-feature-y-nadie-lo-relee-al-cerrarla--resuelto-lote-14
[L53-es]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l53--la-seguridad-de-las-dependencias-no-tiene-paso-se-vio-por-accidente--resuelto-parcialmente-lote-14
[L54]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l54--los-hallazgos-que-le-corresponden-a-otra-feature-no-tienen-dónde-vivir--resuelto-lote-12
[L55]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l55--se-precarga-un-skill-entero-con-su-mandato-a-agentes-que-solo-necesitan-su-formato--resuelto-lote-15
[L56]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l56--el-ciclo-va-hacia-adelante-y-no-tiene-camino-de-vuelta--resuelto-lote-12
[L57]: https://github.com/rarango10/GoHarness-es/blob/main/lecciones.md#l57--el-contrato-del-ejemplo-se-queda-atrás-de-la-plantilla-y-la-guarda-no-lo-ve--resuelto
