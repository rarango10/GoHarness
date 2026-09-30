export const meta = {
  name: 'tasks-fanout',
  description: 'Creates or iterates the tasks.md of any approved spec with fan-out: a single scout, one reviewer per task in parallel, a reducer that resolves conflicts and a single writer.',
  // One {title} per call to phase(), matched EXACTLY. That is why the titles are
  // static: meta has to be a pure literal, so a title interpolated with ${...} can
  // never match and the phase disappears from the progress view without any error.
  // What varies per run goes in the label; what structures the workflow goes in the
  // title.
  phases: [
    { title: 'Spec survey' },
    { title: 'Initial plan from scratch' },
    { title: 'Task review' },
    { title: 'Reduction' },
    { title: 'Consistency check' },
    { title: 'Writing tasks.md' },
  ],
}

// ---------------------------------------------------------------------------
// Architecture
//
//   scout (1 agent, read)  ->  router (pure JS)  ->  from scratch | iterative
//                                                          \        /
//                                                     reviewer fan-out
//                                                     (1 agent per task)
//                                                              |
//                                                     reduce in JS (0 tokens)
//                                                              |
//                                                     reducer (1 agent)
//                                                              |
//                                          new tasks? -> another fan-out round
//                                                              |
//                                                     writer (1 agent, the only
//                                                     one that writes tasks.md)
//
// The fan-out is possible because judgment is separated from writing. A planner that
// writes tasks.md can't be parallelized: several agents editing the same file are a race
// condition and the last one to save wins. Here the reviewers return typed verdicts and
// never touch the disk.
//
// This is the ONLY path by which the PLAN of tasks.md is written in this project (see
// CLAUDE.md and the planning-tasks skill, which is the one that triggers it). The other
// region of the file -- each task's Status and Log -- is written by whoever implements,
// and the task-writer preserves it instead of overwriting it.
//
// INVARIANT RULE: of the five agent() calls in this script, FOUR use a read-only
// agentType (spec-scout, plan-reducer, task-reviewer) and only the last one
// (task-writer) can write. If you add an agent() call, give it a read-only agentType:
// a call without agentType inherits the full toolset, Write included, and reintroduces
// the second writer this architecture exists to avoid.
//
// AGENT NAMES: when this workflow runs from a plugin, its agents are NOT registered with
// the bare name but namespaced -- 'my-harness:spec-scout' instead of 'spec-scout' -- and
// the five calls fail. The agentP() helper below resolves that prefix ONCE, reading it
// from the error message itself, and reuses it. Discovering it instead of assuming it is
// what keeps a plugin rename from breaking the script.
//
// LANGUAGE: the prompts are in English; the documents are written in the project's
// language (the one its CLAUDE.md is written in). The scout reads keywords in either
// language and returns canonical values; the writer writes the project's form, following
// the glossary in the task-format skill.
// ---------------------------------------------------------------------------

// The plugin's prefix, discovered on the first call. null = not known yet;
// '' = the bare name resolved (the harness lives in the project, not in a plugin).
let AGENT_PREFIX = null

async function agentP(prompt, opts) {
  const base = opts.agentType
  if (AGENT_PREFIX !== null) {
    return agent(prompt, { ...opts, agentType: AGENT_PREFIX + base })
  }
  try {
    const out = await agent(prompt, opts)
    AGENT_PREFIX = ''
    return out
  } catch (e) {
    const listed = String((e && e.message) || e).match(/Available agents:\s*(.+)/)
    if (!listed) throw e
    const hit = listed[1].split(/[,\s]+/).find((n) => n.endsWith(':' + base))
    if (!hit) throw e
    AGENT_PREFIX = hit.slice(0, hit.length - base.length)
    log(`Agents namespaced by the plugin: using the prefix "${AGENT_PREFIX}".`)
    return agent(prompt, { ...opts, agentType: AGENT_PREFIX + base })
  }
}

const input =
  typeof args === 'undefined' || args === null || args === ''
    ? {}
    : typeof args === 'string'
      ? (args.trim().startsWith('{') ? JSON.parse(args) : { specDir: args.trim() })
      : args

const SPEC_DIR_HINT = input.specDir || input.spec || input.folder || null
const MAX_ROUNDS = Number(input.maxRounds) > 0 ? Number(input.maxRounds) : 3
const FORCE = input.force === true // continue even if the spec isn't approved

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const TASK_DRAFT = {
  type: 'object',
  required: ['title', 'covers', 'objective', 'firstTest'],
  properties: {
    title: { type: 'string', description: 'What is achieved, in one line' },
    covers: {
      type: 'array',
      items: { type: 'string' },
      description: 'Criterion ids (e.g. R1.2). Empty only if it is infrastructure or integration',
    },
    coversNote: { type: 'string', description: 'If covers is empty, why the task exists anyway' },
    objective: { type: 'string', description: 'What has to be true when it is finished' },
    firstTest: { type: 'string', description: 'The concrete case the TDD cycle starts with' },
  },
}

const TASK_FULL = {
  type: 'object',
  required: ['id', 'title', 'covers', 'status', 'objective', 'firstTest'],
  properties: {
    id: { type: 'string', description: 'E.g. T7. An id already used is never reused' },
    title: { type: 'string' },
    covers: { type: 'array', items: { type: 'string' } },
    coversNote: { type: 'string' },
    status: { type: 'string', enum: ['pending', 'in progress', 'done'] },
    objective: { type: 'string' },
    firstTest: { type: 'string' },
    note: { type: 'string', description: 'E.g. replaces T4' },
  },
}

const SCOUT_SCHEMA = {
  type: 'object',
  required: ['specDir', 'featureName', 'requirementsStatus', 'designStatus', 'criteria', 'tasksExist', 'tasks', 'projectState'],
  properties: {
    specDir: { type: 'string', description: 'Real path of the spec folder' },
    featureName: { type: 'string' },
    requirementsStatus: { type: 'string', enum: ['approved', 'pending approval', 'absent'] },
    designStatus: { type: 'string', enum: ['approved', 'pending approval', 'absent'] },
    criteria: {
      type: 'array',
      description: 'ALL the acceptance criteria of requirements.md, without exception',
      items: {
        type: 'object',
        required: ['id', 'summary'],
        properties: {
          id: { type: 'string' },
          summary: { type: 'string' },
          obsolete: { type: 'boolean', description: 'true if requirements.md marks it obsolete through an amendment' },
        },
      },
    },
    amendments: {
      type: 'string',
      description: 'LITERAL content of the "## Amendments" (or "## Enmiendas") sections of requirements.md and design.md, each with its title. Empty string if neither has amendments.',
    },
    tasksExist: { type: 'boolean' },
    maxIdIssued: {
      type: 'number',
      description: 'Number of the highest id EVER ISSUED, read from the "Ids issued" (or "Ids emitidos") line of the header. 0 if that line does not exist',
    },
    tasks: { type: 'array', items: TASK_FULL },
    unassignedCriteria: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'reason'],
        properties: { id: { type: 'string' }, reason: { type: 'string' } },
      },
    },
    projectState: {
      type: 'string',
      description: 'Summary of the real state: branch and latest commits, structure of src, and literal result of the verification commands',
    },
    existingPendientes: {
      type: 'string',
      description: 'LITERAL content of the "## Follow-ups" (or "## Pendientes") section of tasks.md, line by line, with the recipient each one already has. Empty string if the section does not exist or has no real content. Whoever implements writes it; this run only transcribes it so the writer preserves it.',
    },
  },
}

const DRAFT_SCHEMA = {
  type: 'object',
  required: ['tasks'],
  properties: {
    tasks: { type: 'array', items: TASK_DRAFT },
    unassignedCriteria: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'reason'],
        properties: { id: { type: 'string' }, reason: { type: 'string' } },
      },
    },
  },
}

const VERDICT_SCHEMA = {
  type: 'object',
  required: ['taskId', 'verdict', 'rationale'],
  properties: {
    taskId: { type: 'string' },
    verdict: {
      type: 'string',
      enum: ['ok', 'resize', 'split', 'merge', 'remove', 'status'],
      description: 'ok = stays as it is. resize = same id, adjust scope. split = replace it with several. merge = absorb it into another. remove = take it out. status = only the status changes because the code already exists',
    },
    rationale: { type: 'string' },
    newTitle: { type: 'string' },
    newCovers: { type: 'array', items: { type: 'string' } },
    newObjective: { type: 'string' },
    newFirstTest: { type: 'string' },
    newStatus: { type: 'string', enum: ['pending', 'in progress', 'done'] },
    mergeInto: { type: 'string', description: 'Id of the task that absorbs this one' },
    splitInto: { type: 'array', items: TASK_DRAFT, description: 'Without id: the reducer assigns them' },
    missingTasks: { type: 'array', items: TASK_DRAFT, description: 'Neighboring coverage gaps, without id' },
    specGaps: { type: 'array', items: { type: 'string' } },
  },
}

const PLAN_SCHEMA = {
  type: 'object',
  required: ['tasks', 'changelog'],
  properties: {
    tasks: { type: 'array', items: TASK_FULL, description: 'The COMPLETE, ordered plan, not only what changed' },
    unassignedCriteria: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'reason'],
        properties: { id: { type: 'string' }, reason: { type: 'string' } },
      },
    },
    changelog: {
      type: 'array',
      items: {
        type: 'object',
        required: ['taskId', 'action', 'detail'],
        properties: {
          taskId: { type: 'string' },
          action: { type: 'string', enum: ['ok', 'resize', 'split', 'merge', 'remove', 'status', 'add'] },
          detail: { type: 'string' },
        },
      },
    },
    specGaps: { type: 'array', items: { type: 'string' } },
  },
}

// ---------------------------------------------------------------------------
// Deterministic helpers (pure JS, zero tokens)
// ---------------------------------------------------------------------------

const idNum = (id) => {
  const m = String(id || '').match(/(\d+)/)
  return m ? Number(m[1]) : 0
}

const coverageGaps = (criteria, tasks, unassigned) => {
  const covered = new Set()
  for (const t of tasks) for (const c of t.covers || []) covered.add(String(c).trim())
  const excused = new Set((unassigned || []).map((u) => String(u.id).trim()))
  // L56 — a criterion made obsolete by an amendment needs no task: it was replaced by another id.
  return criteria.filter((c) => !c.obsolete).map((c) => c.id).filter((id) => !covered.has(id) && !excused.has(id))
}

const orphanTasks = (tasks) =>
  tasks.filter((t) => (!t.covers || t.covers.length === 0) && !t.coversNote).map((t) => t.id)

const duplicateIds = (tasks) => {
  const seen = new Set()
  const dupes = []
  for (const t of tasks) {
    if (seen.has(t.id)) dupes.push(t.id)
    seen.add(t.id)
  }
  return dupes
}

const summarize = (t) =>
  `${t.id} — ${t.title} [covers: ${(t.covers || []).join(', ') || '—'}] [status: ${t.status}]`

// ---------------------------------------------------------------------------
// Phase 1 — Scout: a single agent reads everything and runs the verification once
// ---------------------------------------------------------------------------

phase('Spec survey')

const scout = await agentP(
  `${SPEC_DIR_HINT
    ? `Spec folder: ${SPEC_DIR_HINT}.`
    : `You weren't given a spec folder. Look under docs/ for the most recent folder with the format YYYY-MM-DD-<feature> that has a requirements.md, and use that one.`}

Survey the complete state of the spec and of the project. It is the only time anyone is going to do
this: every reviewer that comes afterwards works with what you return.

The documents may be in English or in Spanish. Return the statuses in their canonical form from the
glossary of the task-format skill, whatever the file's language: "approved" or "aprobado" is
approved; "pending approval" or "pendiente de aprobación" is pending approval; "pending",
"in progress", "done" (or "pendiente", "en curso", "hecho") are pending, in progress, done.
Everything else is transcribed as it is.

1. Read requirements.md and design.md. Report the status of each one's header
   (approved / pending approval), or absent if the file doesn't exist. A header
   "approved (date) · amended (date): <ids>" (in Spanish, "aprobado (fecha) · enmendado (fecha)")
   is approved: the amendment already had its yes. Transcribe in amendments the LITERAL content of
   each document's "## Amendments" section ("## Enmiendas" in Spanish), with its title; empty string
   if neither has one.
2. Extract ALL the acceptance criteria of requirements.md with their id (R<n>.<m>) and a one-line
   summary. None may be missing: the whole workflow's coverage check is done against this list, and
   a criterion you don't list is a criterion nobody will notice is missing. The ones requirements.md
   marks obsolete go in anyway, with obsolete = true.
3. If tasks.md exists, transcribe its complete Plan table, and for each task also bring, from its
   journal section: Goal, First test, and —if present— the lines "Covers none because:" (in
   Spanish "Por qué no cubre criterios:"; it goes in coversNote) and "Note:" ("Nota:"; it goes in
   note). Those two fields are optional and only exist in some tasks. In old files the coversNote
   may come embedded in the "Cubre:" line itself (format "Cubre: ninguno — <reason>" or
   "Cubre: — (<reason>)"); in that case extract only the reason, without the "ninguno", the dash or
   the parentheses that wrapped it. If you don't transcribe them they are lost forever: a task left
   without coversNote is reread as scope nobody asked for, and one without note loses track of which
   task it replaced. If tasks.md doesn't exist, tasksExist = false and tasks = []. Also transcribe
   "Criteria without a task" ("Criterios sin tarea asignada") if it has real content, and the
   LITERAL content of the "## Follow-ups" section ("## Pendientes") in existingPendientes — line by
   line, with the recipient each one already has, without summarizing or reordering. It is the
   region of whoever implements, not yours: if you don't transcribe it as it is, the writer has
   nothing to preserve it with.
4. From the header of tasks.md, transcribe the number of the line "Ids issued: up to T<n>" (in
   Spanish "Ids emitidos: hasta T<n>") in maxIdIssued. If that line isn't there —files written
   before it existed— return 0: the workflow falls back to the usual calculation. That line is the
   memory of which ids were already handed out, including those of tasks that later disappeared
   from the plan; without it an id can be reused and break a reference made from a commit or from a
   journal.
5. Survey the real state of the project: current branch, latest commits (git log --oneline -15),
   git status, the structure of the source code (src/ or whatever there is), and run the commands
   CLAUDE.md declares in its verification commands section ("Comandos de verificación" in a Spanish
   project) — this project's, not a fixed list. Paste the literal result: pass/fail and how many
   tests. If CLAUDE.md declares no commands, or the project's dependency manifest doesn't exist, say
   so explicitly instead of inventing a command.

Don't modify any file.`,
  { schema: SCOUT_SCHEMA, agentType: 'spec-scout', model: 'sonnet', label: 'scout' },
)

if (!scout) {
  return { error: 'The scout failed: the spec could not be read. No file was touched.' }
}

const specDir = scout.specDir
const existingPendientes = scout.existingPendientes || ''

if (!FORCE && (scout.requirementsStatus !== 'approved' || scout.designStatus !== 'approved')) {
  return {
    error: 'Precondition not met: requirements.md and design.md have to be approved.',
    specDir,
    requirementsStatus: scout.requirementsStatus,
    designStatus: scout.designStatus,
    suggestion: 'Run the `specify` skill (phases 1 and 2) first. To force it anyway: pass {"specDir":"...","force":true}.',
  }
}

log(`Spec: ${specDir} — ${scout.criteria.length} criteria, ${scout.tasks.length} existing tasks`)

// Shared context: every agent receives it identical, so they don't diverge.
const SHARED = `Spec folder: ${specDir} (requirements.md, design.md, tasks.md).

Acceptance criteria of requirements.md:
${scout.criteria.map((c) => `- ${c.id}: ${c.summary}${c.obsolete ? ' (OBSOLETE: no task has to cover it; one that covers it is out of date)' : ''}`).join('\n')}
${scout.amendments ? `
Spec amendments (the spec changed after being approved; a task whose Covers touches these ids may
have become misaligned with the current criterion):
${scout.amendments}
` : ''}
Real state of the project (already surveyed, don't run it again):
${scout.projectState}`

// ---------------------------------------------------------------------------
// Phase 2 — Router (pure JS, zero tokens): from scratch or iterative mode
// ---------------------------------------------------------------------------

let plan = scout.tasks.slice()
let unassigned = scout.unassignedCriteria || []
const changelog = []
const specGaps = []
let agentsSpent = 1

if (!scout.tasksExist || plan.length === 0) {
  phase('Initial plan from scratch')
  log('There is no tasks.md: the initial plan is drawn and then it enters the same iterative loop.')

  const draft = await agentP(
    `${SHARED}

tasks.md doesn't exist yet. Draw the COMPLETE initial task plan for this feature, following
assets/<lang>/tasks-template.md from the task-format skill.

Rules:
- One task = one complete TDD cycle (failing test → implement → passing test), of a size that can be
  finished in one sitting. If a task needs three unrelated tests to make sense, it is three tasks.
- Order them so each task leaves the repo working and with the tests green: it has to be possible to
  stop at any point without being left halfway.
- Every task covers at least one criterion, except initial infrastructure or final integration — and
  in that case explain why in coversNote.
- Every criterion in the list above has to be covered by some task, or appear in
  unassignedCriteria with its reason.
- Don't propose ids: the order of the array is the order of the plan.
- Respect design.md: don't invent modules or dependencies the design didn't define.
- Write titles, goals and first tests in the language the spec is written in.

Don't write any file. Return only the JSON.`,
    { schema: DRAFT_SCHEMA, agentType: 'plan-reducer', model: 'opus', label: 'initial plan' },
  )
  agentsSpent++

  if (!draft || !draft.tasks || draft.tasks.length === 0) {
    return { error: 'The initial plan could not be generated. No file was touched.', specDir }
  }

  plan = draft.tasks.map((t, i) => ({
    id: `T${i + 1}`,
    title: t.title,
    covers: t.covers || [],
    coversNote: t.coversNote,
    status: 'pending',
    objective: t.objective,
    firstTest: t.firstTest,
  }))
  unassigned = draft.unassignedCriteria || []
  for (const t of plan) changelog.push({ taskId: t.id, action: 'add', detail: 'initial plan' })
  log(`Initial plan: ${plan.length} tasks. None reviewed yet — they all enter the fan-out.`)
}

// ---------------------------------------------------------------------------
// Phase 3 — Round loop: reviewer fan-out -> reduce in JS -> reducer
// ---------------------------------------------------------------------------

// The maximum between what the file records as issued and what the living plan shows. Taking
// only the living plan reuses the id of a deleted task, which is exactly what the numbering
// rule forbids: that id may be quoted in a commit or in a journal.
let maxId = Math.max(
  Number(scout.maxIdIssued) || 0,
  plan.reduce((m, t) => Math.max(m, idNum(t.id)), 0),
)
let queue = plan.map((t) => t.id) // round 1: all of them
let round = 0

while (queue.length > 0 && round < MAX_ROUNDS) {
  round++
  const toReview = plan.filter((t) => queue.includes(t.id))
  if (toReview.length === 0) {
    log(`Round ${round}: the queue points to tasks that no longer exist in the plan. The loop closes.`)
    queue = []
    break
  }
  phase('Task review')
  log(`Round ${round}: reviewing ${toReview.length} task(s).`)

  const tableForReviewers = plan.map(summarize).join('\n')

  // Fan-out. parallel() and not pipeline(): the reducer needs ALL the verdicts at once
  // to be able to resolve crossed merges, overlapping splits and new numbering.
  const verdicts = await parallel(
    toReview.map((task) => () =>
      agentP(
        `${SHARED}

Current complete plan (context — do NOT review it all):
${tableForReviewers}

You get to review ONE single task:

  ${summarize(task)}
  Goal: ${task.objective || '(no goal written)'}
  First test: ${task.firstTest || '(no first test written)'}

Issue your verdict on it and only on it. You may look at its immediate neighbors to decide a merge
or detect a gap, but don't issue verdicts on other tasks.

Remember: you don't write files, you don't propose ids (the reducer numbers), and when in doubt the
verdict is "ok".`,
        {
          schema: VERDICT_SCHEMA,
          model: 'sonnet',
          agentType: 'task-reviewer',
          label: `${task.id} · round ${round}`,
          phase: 'Task review',
        },
      ),
    ),
  )
  agentsSpent += toReview.length

  const valid = verdicts.filter(Boolean)
  if (valid.length < verdicts.length) {
    log(`Warning: ${verdicts.length - valid.length} reviewer(s) failed; those tasks stay unreviewed this round.`)
  }
  if (valid.length === 0) {
    log('No valid review this round. The loop is cut.')
    break
  }

  // Reduce in JS: zero tokens.
  const changed = valid.filter((v) => v.verdict !== 'ok')
  for (const v of valid) for (const g of v.specGaps || []) if (!specGaps.includes(g)) specGaps.push(g)

  const newDrafts = valid.reduce((n, v) => n + (v.splitInto || []).length + (v.missingTasks || []).length, 0)
  const gapsNow = coverageGaps(scout.criteria, plan, unassigned)

  log(`Round ${round}: ${valid.length} verdicts — ${valid.length - changed.length} ok, ${changed.length} with changes, ${newDrafts} task(s) proposed, ${gapsNow.length} criterion(s) uncovered.`)

  if (changed.length === 0 && newDrafts === 0 && gapsNow.length === 0) {
    for (const v of valid) changelog.push({ taskId: v.taskId, action: 'ok', detail: v.rationale })
    queue = []
    break
  }

  // Reducer: the only one that sees the whole plan and all the verdicts together.
  const reduced = await agentP(
    `${SHARED}

You are the reducer of the task plan. You receive the current plan and the verdicts of reviewers who
worked in parallel, each looking at ONE task without seeing what the others decided. Your job is to
resolve those verdicts into a single coherent plan.

CURRENT PLAN (${plan.length} tasks, in order):
${JSON.stringify(plan, null, 2)}

VERDICTS OF THIS ROUND:
${JSON.stringify(valid, null, 2)}

DETERMINISTIC CHECKS ALREADY DONE:
- Criteria not covered by any task: ${gapsNow.length ? gapsNow.join(', ') : 'none'}
- Tasks with neither criterion nor justification: ${orphanTasks(plan).join(', ') || 'none'}
- Duplicate ids: ${duplicateIds(plan).join(', ') || 'none'}
- Highest id used so far: T${maxId}

RESOLUTION RULES:
1. Numbering: every new task (from a split, from a missingTasks, or to fill a coverage gap) takes
   the next free id starting at T${maxId + 1}. NEVER reuse or renumber an existing id, even if the
   original task disappears: that id may be quoted in a commit or in the journal. In a task that
   replaces another, put in "note" which one it replaces.
2. Crossed merges: if A asks to merge into B and B asks to merge into A, merge them only once into
   the lowest id and record it in the changelog.
3. Overlapping splits: if two verdicts propose tasks that do the same thing, keep one.
4. Coverage: every criterion in the list has to end up covered by some task or appear in
   unassignedCriteria with a real reason. A gap is filled by adding a task at the end.
5. The tasks that weren't reviewed this round go into the final plan as they are, untouched.
6. Order: each task should leave the repo working and with the tests green. If a split breaks that
   order, relocate the new parts where they belong.
7. A verdict without a concrete reason is discarded: leave the task as it was.

Return the COMPLETE, ordered plan (all the tasks, not only the ones that changed), the changelog of
what you did with each reviewed task, and the accumulated spec gaps.

Don't write any file. Return only the JSON.`,
    { schema: PLAN_SCHEMA, agentType: 'plan-reducer', model: 'opus', label: `reducer round ${round}`, phase: 'Reduction' },
  )
  agentsSpent++

  if (!reduced || !reduced.tasks || reduced.tasks.length === 0) {
    log(`The reducer failed in round ${round}. The previous round's plan is kept and the loop is cut.`)
    break
  }

  const before = new Set(plan.map((t) => t.id))
  const beforeById = new Map(plan.map((t) => [t.id, t]))

  plan = reduced.tasks
  unassigned = reduced.unassignedCriteria || unassigned
  maxId = plan.reduce((m, t) => Math.max(m, idNum(t.id)), maxId)
  for (const e of reduced.changelog || []) changelog.push(e)
  for (const g of reduced.specGaps || []) if (!specGaps.includes(g)) specGaps.push(g)

  // The next round's queue: what nobody has reviewed yet.
  //  - new tasks (ids that didn't exist)
  //  - old tasks whose scope changed without a reviewer looking at them (e.g. they absorbed a merge)
  queue = plan
    .filter((t) => {
      if (!before.has(t.id)) return true
      if (queue.includes(t.id)) return false // already reviewed this round
      const old = beforeById.get(t.id)
      return old && (old.title !== t.title || (old.covers || []).join(',') !== (t.covers || []).join(','))
    })
    .map((t) => t.id)

  if (queue.length) {
    log(`Round ${round} closed: ${plan.length} tasks. Waiting for review: ${queue.join(', ')}`)
  }
}

if (queue.length > 0) {
  log(`Ceiling of ${MAX_ROUNDS} rounds reached with ${queue.length} task(s) unreviewed (${queue.join(', ')}). A plan that doesn't converge after that many rounds needs human eyes, not more iterations.`)
}

// ---------------------------------------------------------------------------
// Phase 4 — Final deterministic check (pure JS, zero tokens)
// ---------------------------------------------------------------------------

phase('Consistency check')

const finalGaps = coverageGaps(scout.criteria, plan, unassigned)
const finalOrphans = orphanTasks(plan)
const finalDupes = duplicateIds(plan)

if (finalGaps.length) log(`Criteria still uncovered: ${finalGaps.join(', ')}`)
if (finalOrphans.length) log(`Tasks still with neither criterion nor justification: ${finalOrphans.join(', ')}`)
if (finalDupes.length) log(`Duplicate ids remain: ${finalDupes.join(', ')}`)

// ---------------------------------------------------------------------------
// Phase 5 — Writer: the only agent that touches tasks.md in the whole workflow
// ---------------------------------------------------------------------------

phase('Writing tasks.md')

// L10 — Re-planning must not unapprove a plan that didn't change. The final plan is compared
// against the one the scout read: ids, order, title, Covers and the journal headings, which are
// the workflow's region. Status is left OUT of the comparison on purpose: whoever implements
// writes it, and a task that moved to done isn't a plan change. Arithmetic, zero tokens.
const samePlan = (a, b) =>
  a.id === b.id &&
  a.title === b.title &&
  (a.covers || []).join(',') === (b.covers || []).join(',') &&
  (a.objective || '') === (b.objective || '') &&
  (a.firstTest || '') === (b.firstTest || '')

const planUnchanged =
  scout.tasksExist &&
  scout.tasks.length === plan.length &&
  scout.tasks.every((t, i) => samePlan(t, plan[i]))

if (planUnchanged) {
  log('The final plan is identical to the one already there: the Status header is preserved.')
}

const written = await agentP(
  `Spec folder: ${specDir}.

Write ${specDir}/tasks.md with this final Plan table. It is the source of truth: don't add, don't
remove, don't reorder and don't renumber anything.

LANGUAGE: the file is written in the project's language (the one its CLAUDE.md is written in).
Section titles, field names, statuses and recipients follow the glossary of the task-format skill:
the canonical form in an English project, the Spanish alias in a Spanish one. The plan's statuses
come in canonical form (pending, in progress, done); in Spanish they are pendiente, en curso, hecho.
The recipients below come in canonical form too ([decide now]); in Spanish, [decidir ya].

FINAL PLAN (${plan.length} tasks, in order):
${JSON.stringify(plan, null, 2)}

CRITERIA WITHOUT A TASK:
${unassigned.length ? JSON.stringify(unassigned, null, 2) : 'none'}

FOLLOW-UPS — merge, don't replace:

What was already in the file's follow-ups section ("## Follow-ups", or "## Pendientes" in Spanish).
**Preserve it as it is, line by line, with the recipient each one already had** — it is the region
of whoever implements, not yours, and a re-plan isn't the moment to decide whether a warning is
still current:
${existingPendientes ? existingPendientes : '(the section did not exist or had no real content)'}

Add, as new lines, the spec gaps this run detected — they need a person to decide, so they go with
recipient [decide now] unless they say otherwise. Don't repeat one if an existing line already says
the same:
${specGaps.length ? specGaps.map((g) => `- [decide now] ${g}`).join('\n') : '(none detected in this pass)'}
${finalGaps.length ? `- [decide now] Criteria left uncovered: ${finalGaps.join(', ')}` : ''}
${finalDupes.length ? `- [decide now] Unresolved duplicate ids: ${finalDupes.join(', ')}` : ''}

Where the optional fields go, when the task brings them (follow assets/<lang>/tasks-template.md from the
task-format skill):
- "coversNote" → in the table, the Covers column carries an em dash; the text goes in that task's
  journal, in a line that starts with **Covers none because:** (in Spanish, **Por qué no cubre criterios:**)
- "note" → in that task's journal, in a line that starts with **Note:** (in Spanish, **Nota:**)
Don't put them in the table or mix them into another field: the next run reads them from those two
exact lines to be able to give them back to you, and whatever ends up anywhere else is lost.

In the header, after the Status line, write:

  > Ids issued: up to T${maxId}

(in Spanish, "> Ids emitidos: hasta T${maxId}"). It is the memory of which ids were already handed
out, including those of tasks that later disappeared from the plan. Without that line, a future run
computes the next free id looking only at the living tasks and may reuse one already used, which is
exactly what the numbering rule forbids: that id may be quoted in a commit or in a journal.

${planUnchanged
  ? `STATUS HEADER: the final plan is identical to the one already in the file — same ids, same
order, same titles, same Covers and same journal headings. **Preserve the Status line as it is**,
including an "approved" with its date. This run checked that the plan still stands; it didn't change
it, so there is nothing to approve again.`
  : `STATUS HEADER: the plan changed with respect to the one in the file, so leave the header in
"pending approval" ("pendiente de aprobación" in Spanish). A person approves it, not you.`}

Remember to preserve verbatim every journal Log that already has real content.`,
  { agentType: 'task-writer', model: 'opus', label: 'tasks.md' },
)
agentsSpent++

// ---------------------------------------------------------------------------
// Result: the only thing that enters the main session's context
// ---------------------------------------------------------------------------

const count = (a) => changelog.filter((e) => e.action === a).length

return {
  specDir,
  file: `${specDir}/tasks.md`,
  status: 'pending approval — a person approves it, not this workflow',
  finalTasks: plan.length,
  rounds: round,
  agents: agentsSpent,
  summary: {
    unchanged: count('ok'),
    resized: count('resize'),
    split: count('split'),
    merged: count('merge'),
    removed: count('remove'),
    statusUpdated: count('status'),
    added: count('add'),
  },
  uncoveredCriteria: finalGaps,
  duplicateIds: finalDupes,
  unreviewedTasks: queue,
  specGaps,
  plan: plan.map(summarize),
  writing: written || 'The writer failed: check tasks.md by hand.',
}
