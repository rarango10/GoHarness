export const meta = {
  name: 'tasks-fanout',
  description: 'Crea o itera el tasks.md de cualquier spec aprobado con fan-out: scout unico, un revisor por tarea en paralelo, un reducer que resuelve conflictos y un unico escritor.',
  // Un {title} por cada llamada a phase(), matcheado EXACTO. Por eso los titulos son
  // estaticos: meta tiene que ser un literal puro, asi que un titulo interpolado con
  // ${...} no puede matchear nunca y la fase desaparece de la vista de progreso sin
  // ningun error. Lo que varia por corrida va en el label; lo que estructura el
  // workflow va en el title.
  phases: [
    { title: 'Reconocimiento del spec' },
    { title: 'Plan inicial desde cero' },
    { title: 'Revision de tareas' },
    { title: 'Reduccion' },
    { title: 'Chequeo de consistencia' },
    { title: 'Escritura de tasks.md' },
  ],
}

// ---------------------------------------------------------------------------
// Arquitectura
//
//   scout (1 agente, lectura)  ->  router (JS puro)  ->  from scratch | iterativo
//                                                              \        /
//                                                        fan-out de revisores
//                                                        (1 agente por tarea)
//                                                                 |
//                                                        reduce en JS (0 tokens)
//                                                                 |
//                                                        reducer (1 agente)
//                                                                 |
//                                            tareas nuevas? -> otra ronda de fan-out
//                                                                 |
//                                                        writer (1 agente, unico
//                                                        que escribe tasks.md)
//
// El fan-out es posible porque el juicio esta separado de la escritura. Un planificador
// que escribe tasks.md no se puede paralelizar: varios agentes editando el mismo archivo
// son una condicion de carrera y gana el ultimo que guarda. Aca los revisores devuelven
// veredictos tipados y nunca tocan el disco.
//
// Este es el UNICO camino por el que se escribe el PLAN de tasks.md en este proyecto (ver
// CLAUDE.md y el skill planning-tasks, que es el que lo dispara). La otra region del archivo
// -- el Estado y el Registro de cada tarea -- la escribe quien implementa, y el task-writer
// la preserva en vez de pisarla.
//
// REGLA INVARIANTE: de las cinco llamadas a agent() de este script, CUATRO usan un
// agentType de solo lectura (spec-scout, plan-reducer, task-reviewer) y solo la ultima
// (task-writer) puede escribir. Si agregas una llamada a agent(), declarale un agentType
// de solo lectura: una llamada sin agentType hereda el toolset completo, incluido Write,
// y reintroduce el segundo escritor que esta arquitectura existe para evitar.
//
// NOMBRES DE AGENTE: cuando este workflow corre desde un plugin, sus agentes NO se
// registran con el nombre pelado sino namespaceados -- 'mi-harness:spec-scout' en vez
// de 'spec-scout' -- y las cinco llamadas fallan. El helper agentP() de abajo resuelve
// ese prefijo UNA vez, leyendolo del propio mensaje de error, y lo reusa. Descubrirlo
// en vez de asumirlo es lo que hace que renombrar el plugin no rompa el script.
// ---------------------------------------------------------------------------

// Prefijo del plugin, descubierto en la primera llamada. null = todavia no se sabe;
// '' = el nombre pelado resolvio (el harness vive en el proyecto, no en un plugin).
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
    log(`Agentes namespaceados por el plugin: se usa el prefijo "${AGENT_PREFIX}".`)
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
const FORCE = input.force === true // seguir aunque el spec no este aprobado

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const TASK_DRAFT = {
  type: 'object',
  required: ['title', 'covers', 'objective', 'firstTest'],
  properties: {
    title: { type: 'string', description: 'Que se logra, en una linea' },
    covers: {
      type: 'array',
      items: { type: 'string' },
      description: 'Ids de criterio (ej. R1.2). Vacio solo si es infraestructura o integracion',
    },
    coversNote: { type: 'string', description: 'Si covers esta vacio, por que la tarea existe igual' },
    objective: { type: 'string', description: 'Que tiene que ser cierto cuando este terminada' },
    firstTest: { type: 'string', description: 'El caso concreto con el que arranca el ciclo TDD' },
  },
}

const TASK_FULL = {
  type: 'object',
  required: ['id', 'title', 'covers', 'status', 'objective', 'firstTest'],
  properties: {
    id: { type: 'string', description: 'Ej. T7. Nunca se reutiliza un id ya usado' },
    title: { type: 'string' },
    covers: { type: 'array', items: { type: 'string' } },
    coversNote: { type: 'string' },
    status: { type: 'string', enum: ['pendiente', 'en curso', 'hecho'] },
    objective: { type: 'string' },
    firstTest: { type: 'string' },
    note: { type: 'string', description: 'Ej. reemplaza a T4' },
  },
}

const SCOUT_SCHEMA = {
  type: 'object',
  required: ['specDir', 'featureName', 'requirementsStatus', 'designStatus', 'criteria', 'tasksExist', 'tasks', 'projectState'],
  properties: {
    specDir: { type: 'string', description: 'Ruta real de la carpeta del spec' },
    featureName: { type: 'string' },
    requirementsStatus: { type: 'string', enum: ['aprobado', 'pendiente de aprobación', 'ausente'] },
    designStatus: { type: 'string', enum: ['aprobado', 'pendiente de aprobación', 'ausente'] },
    criteria: {
      type: 'array',
      description: 'TODOS los criterios de aceptacion de requirements.md, sin excepcion',
      items: {
        type: 'object',
        required: ['id', 'summary'],
        properties: { id: { type: 'string' }, summary: { type: 'string' } },
      },
    },
    tasksExist: { type: 'boolean' },
    maxIdIssued: {
      type: 'number',
      description: 'Numero del id mas alto EMITIDO alguna vez, leido de la linea "Ids emitidos" del encabezado. 0 si esa linea no existe',
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
      description: 'Resumen del estado real: rama y ultimos commits, estructura de src, y resultado literal de los comandos de verificacion',
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
      description: 'ok = queda como esta. resize = mismo id, ajustar alcance. split = reemplazarla por varias. merge = absorberla en otra. remove = sacarla. status = solo cambia el estado porque el codigo ya existe',
    },
    rationale: { type: 'string' },
    newTitle: { type: 'string' },
    newCovers: { type: 'array', items: { type: 'string' } },
    newObjective: { type: 'string' },
    newFirstTest: { type: 'string' },
    newStatus: { type: 'string', enum: ['pendiente', 'en curso', 'hecho'] },
    mergeInto: { type: 'string', description: 'Id de la tarea que absorbe a esta' },
    splitInto: { type: 'array', items: TASK_DRAFT, description: 'Sin id: los asigna el reducer' },
    missingTasks: { type: 'array', items: TASK_DRAFT, description: 'Huecos de cobertura vecinos, sin id' },
    specGaps: { type: 'array', items: { type: 'string' } },
  },
}

const PLAN_SCHEMA = {
  type: 'object',
  required: ['tasks', 'changelog'],
  properties: {
    tasks: { type: 'array', items: TASK_FULL, description: 'El plan COMPLETO y ordenado, no solo lo que cambio' },
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
// Helpers deterministas (JS puro, cero tokens)
// ---------------------------------------------------------------------------

const idNum = (id) => {
  const m = String(id || '').match(/(\d+)/)
  return m ? Number(m[1]) : 0
}

const coverageGaps = (criteria, tasks, unassigned) => {
  const covered = new Set()
  for (const t of tasks) for (const c of t.covers || []) covered.add(String(c).trim())
  const excused = new Set((unassigned || []).map((u) => String(u.id).trim()))
  return criteria.map((c) => c.id).filter((id) => !covered.has(id) && !excused.has(id))
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
  `${t.id} — ${t.title} [cubre: ${(t.covers || []).join(', ') || '—'}] [estado: ${t.status}]`

// ---------------------------------------------------------------------------
// Fase 1 — Scout: un unico agente lee todo y corre la verificacion una sola vez
// ---------------------------------------------------------------------------

phase('Reconocimiento del spec')

const scout = await agentP(
  `${SPEC_DIR_HINT
    ? `Carpeta del spec: ${SPEC_DIR_HINT}.`
    : `No te dieron carpeta de spec. Buscá bajo docs/ la carpeta con formato AAAA-MM-DD-<feature> más reciente que tenga requirements.md, y usá esa.`}

Relevá el estado completo del spec y del proyecto. Es la única vez que alguien va a hacer esto:
todos los revisores que vienen después trabajan con lo que devuelvas vos.

1. Leé requirements.md y design.md. Reportá el estado literal del encabezado de cada uno
   ("aprobado" / "pendiente de aprobación"), o "ausente" si el archivo no existe.
2. Extraé TODOS los criterios de aceptación de requirements.md con su id (R<n>.<m>) y un resumen
   de una línea. Que no falte ninguno: el chequeo de cobertura de todo el workflow se hace contra
   esta lista, y un criterio que no listes es un criterio que nadie va a notar que falta.
3. Si existe tasks.md, transcribí su tabla de Plan completa, y para cada tarea traé también,
   desde su sección de Bitácora: Objetivo, Primer test, y —si están— las líneas
   "Por qué no cubre criterios:" (va en coversNote) y "Nota:" (va en note). Esos dos campos son
   opcionales y solo existen en algunas tareas. En archivos viejos el coversNote puede venir
   embebido en la propia línea "Cubre:" (formato "Cubre: ninguno — <motivo>" o
   "Cubre: — (<motivo>)"); en ese caso extraé solo el motivo, sin el "ninguno", el guion ni los
   paréntesis que lo envolvían. Si no los transcribís se pierden para
   siempre: una tarea que se queda sin coversNote se relee como alcance que nadie pidió, y una
   sin note pierde el rastro de a qué tarea reemplazó. Si no existe tasks.md, tasksExist = false
   y tasks = []. Transcribí también "Criterios sin tarea asignada" si tiene contenido real.
4. Del encabezado de tasks.md, transcribí el número de la línea "Ids emitidos: hasta T<n>" en
   maxIdIssued. Si esa línea no está —archivos escritos antes de que existiera— devolvé 0: el
   workflow cae al cálculo de siempre. Esa línea es la memoria de qué ids ya se repartieron,
   incluidos los de tareas que después desaparecieron del plan; sin ella un id se puede reutilizar
   y romper una referencia hecha desde un commit o desde una bitácora.
5. Relevá el estado real del proyecto: rama actual, últimos commits (git log --oneline -15),
   git status, la estructura del código fuente (src/ o la que haya), y corré los comandos que
   CLAUDE.md declara en su sección "Comandos de verificación" — los de este proyecto, no una lista
   fija. Pegá el resultado literal: pasa/falla y cuántos tests. Si CLAUDE.md no declara comandos,
   o el manifiesto de dependencias del proyecto no existe, decilo explícitamente en vez de
   inventar un comando.

No modifiques ningún archivo.`,
  { schema: SCOUT_SCHEMA, agentType: 'spec-scout', model: 'sonnet', label: 'scout' },
)

if (!scout) {
  return { error: 'El scout falló: no se pudo leer el spec. No se tocó ningún archivo.' }
}

const specDir = scout.specDir

if (!FORCE && (scout.requirementsStatus !== 'aprobado' || scout.designStatus !== 'aprobado')) {
  return {
    error: 'Precondición no cumplida: requirements.md y design.md tienen que estar aprobados.',
    specDir,
    requirementsStatus: scout.requirementsStatus,
    designStatus: scout.designStatus,
    sugerencia: 'Corré el skill `specify` (fases 1 y 2) primero. Para forzar igual: pasá {"specDir":"...","force":true}.',
  }
}

log(`Spec: ${specDir} — ${scout.criteria.length} criterios, ${scout.tasks.length} tareas existentes`)

// Contexto compartido: todos los agentes lo reciben identico, para que no diverjan.
const SHARED = `Carpeta del spec: ${specDir} (requirements.md, design.md, tasks.md).

Criterios de aceptación de requirements.md:
${scout.criteria.map((c) => `- ${c.id}: ${c.summary}`).join('\n')}

Estado real del proyecto (ya relevado, no lo vuelvas a correr):
${scout.projectState}`

// ---------------------------------------------------------------------------
// Fase 2 — Router (JS puro, cero tokens): desde cero o modo iterativo
// ---------------------------------------------------------------------------

let plan = scout.tasks.slice()
let unassigned = scout.unassignedCriteria || []
const changelog = []
const specGaps = []
let agentsSpent = 1

if (!scout.tasksExist || plan.length === 0) {
  phase('Plan inicial desde cero')
  log('No hay tasks.md: se dibuja el plan inicial y después entra al mismo loop iterativo.')

  const draft = await agentP(
    `${SHARED}

Todavía no existe tasks.md. Dibujá el plan inicial COMPLETO de tareas para esta feature,
siguiendo assets/tasks-template.md del skill specify.

Reglas:
- Una tarea = un ciclo de TDD completo (test que falla → implementar → test que pasa), del tamaño
  que se pueda terminar de una sentada. Si una tarea necesita tres tests no relacionados para
  tener sentido, son tres tareas.
- Ordenalas de forma que cada tarea deje el repo funcionando y con los tests en verde: tiene que
  poder pararse en cualquier punto sin quedar a mitad de camino.
- Toda tarea cubre al menos un criterio, salvo infraestructura inicial o integración final — y
  en ese caso explicá por qué en coversNote.
- Todo criterio de la lista de arriba tiene que estar cubierto por alguna tarea, o figurar en
  unassignedCriteria con su motivo.
- No propongas ids: el orden del array es el orden del plan.
- Respetá design.md: no inventes módulos ni dependencias que el diseño no haya definido.

No escribas ningún archivo. Devolvé solo el JSON.`,
    { schema: DRAFT_SCHEMA, agentType: 'plan-reducer', model: 'opus', label: 'plan inicial' },
  )
  agentsSpent++

  if (!draft || !draft.tasks || draft.tasks.length === 0) {
    return { error: 'No se pudo generar el plan inicial. No se tocó ningún archivo.', specDir }
  }

  plan = draft.tasks.map((t, i) => ({
    id: `T${i + 1}`,
    title: t.title,
    covers: t.covers || [],
    coversNote: t.coversNote,
    status: 'pendiente',
    objective: t.objective,
    firstTest: t.firstTest,
  }))
  unassigned = draft.unassignedCriteria || []
  for (const t of plan) changelog.push({ taskId: t.id, action: 'add', detail: 'plan inicial' })
  log(`Plan inicial: ${plan.length} tareas. Ninguna revisada todavía — entran todas al fan-out.`)
}

// ---------------------------------------------------------------------------
// Fase 3 — Loop de rondas: fan-out de revisores -> reduce en JS -> reducer
// ---------------------------------------------------------------------------

// El maximo entre lo que el archivo registra como emitido y lo que el plan vivo muestra. Tomar
// solo el plan vivo reutiliza el id de una tarea eliminada, que es justo lo que la regla de
// numeracion prohibe: ese id puede estar citado en un commit o en una bitacora.
let maxId = Math.max(
  Number(scout.maxIdIssued) || 0,
  plan.reduce((m, t) => Math.max(m, idNum(t.id)), 0),
)
let queue = plan.map((t) => t.id) // ronda 1: todas
let round = 0

while (queue.length > 0 && round < MAX_ROUNDS) {
  round++
  const toReview = plan.filter((t) => queue.includes(t.id))
  if (toReview.length === 0) {
    log(`Ronda ${round}: la cola apunta a tareas que ya no existen en el plan. Se cierra el loop.`)
    queue = []
    break
  }
  phase('Revision de tareas')
  log(`Ronda ${round}: revisando ${toReview.length} tarea(s).`)

  const tableForReviewers = plan.map(summarize).join('\n')

  // Fan-out. parallel() y no pipeline(): el reducer necesita TODOS los veredictos a la vez
  // para poder resolver merges cruzados, splits que se superponen y numeracion nueva.
  const verdicts = await parallel(
    toReview.map((task) => () =>
      agentP(
        `${SHARED}

Plan completo actual (contexto — NO lo revises entero):
${tableForReviewers}

Te toca revisar UNA sola tarea:

  ${summarize(task)}
  Objetivo: ${task.objective || '(sin objetivo escrito)'}
  Primer test: ${task.firstTest || '(sin primer test escrito)'}

Emití tu veredicto sobre ella y solo sobre ella. Podés mirar sus vecinas inmediatas para decidir
un merge o detectar un hueco, pero no emitas veredictos sobre otras tareas.

Recordá: no escribís archivos, no proponés ids (el reducer numera), y ante la duda el veredicto
es "ok".`,
        {
          schema: VERDICT_SCHEMA,
          model: 'sonnet',
          agentType: 'task-reviewer',
          label: `${task.id} · ronda ${round}`,
          phase: 'Revision de tareas',
        },
      ),
    ),
  )
  agentsSpent += toReview.length

  const valid = verdicts.filter(Boolean)
  if (valid.length < verdicts.length) {
    log(`Aviso: ${verdicts.length - valid.length} revisor(es) fallaron; esas tareas quedan sin revisar en esta ronda.`)
  }
  if (valid.length === 0) {
    log('Ninguna revisión válida en esta ronda. Se corta el loop.')
    break
  }

  // Reduce en JS: cero tokens.
  const changed = valid.filter((v) => v.verdict !== 'ok')
  for (const v of valid) for (const g of v.specGaps || []) if (!specGaps.includes(g)) specGaps.push(g)

  const newDrafts = valid.reduce((n, v) => n + (v.splitInto || []).length + (v.missingTasks || []).length, 0)
  const gapsNow = coverageGaps(scout.criteria, plan, unassigned)

  log(`Ronda ${round}: ${valid.length} veredictos — ${valid.length - changed.length} ok, ${changed.length} con cambios, ${newDrafts} tarea(s) propuesta(s), ${gapsNow.length} criterio(s) sin cubrir.`)

  if (changed.length === 0 && newDrafts === 0 && gapsNow.length === 0) {
    for (const v of valid) changelog.push({ taskId: v.taskId, action: 'ok', detail: v.rationale })
    queue = []
    break
  }

  // Reducer: el unico que ve el plan entero y todos los veredictos juntos.
  const reduced = await agentP(
    `${SHARED}

Sos el reducer del plan de tareas. Recibís el plan actual y los veredictos de revisores que
trabajaron en paralelo, cada uno mirando UNA tarea sin ver lo que decidieron los otros. Tu trabajo
es resolver esos veredictos en un único plan coherente.

PLAN ACTUAL (${plan.length} tareas, en orden):
${JSON.stringify(plan, null, 2)}

VEREDICTOS DE ESTA RONDA:
${JSON.stringify(valid, null, 2)}

CHEQUEOS DETERMINISTAS YA HECHOS:
- Criterios sin cubrir por ninguna tarea: ${gapsNow.length ? gapsNow.join(', ') : 'ninguno'}
- Tareas sin criterio ni justificación: ${orphanTasks(plan).join(', ') || 'ninguna'}
- Ids duplicados: ${duplicateIds(plan).join(', ') || 'ninguno'}
- Id más alto usado hasta ahora: T${maxId}

REGLAS DE RESOLUCIÓN:
1. Numeración: toda tarea nueva (de un split, de un missingTasks, o para tapar un hueco de
   cobertura) toma el próximo id libre a partir de T${maxId + 1}. NUNCA reutilices ni renumeres un
   id existente, aunque la tarea original desaparezca: ese id puede estar citado en un commit o
   en la bitácora. En una tarea que reemplaza a otra, poné en "note" a cuál reemplaza.
2. Merges cruzados: si A pide fusionarse en B y B pide fusionarse en A, fusionalos una sola vez
   en el id más bajo y dejalo asentado en el changelog.
3. Splits superpuestos: si dos veredictos proponen tareas que hacen lo mismo, quedate con una.
4. Cobertura: todo criterio de la lista tiene que quedar cubierto por alguna tarea o figurar en
   unassignedCriteria con un motivo real. Un hueco se tapa agregando una tarea al final.
5. Las tareas que no fueron revisadas en esta ronda van tal cual al plan final, sin tocar.
6. Orden: cada tarea debería dejar el repo funcionando y con los tests en verde. Si un split
   rompe ese orden, reubicá las partes nuevas donde corresponda.
7. Un veredicto sin razón concreta se descarta: dejá la tarea como estaba.

Devolvé el plan COMPLETO y ordenado (todas las tareas, no solo las que cambiaron), el changelog
de lo que hiciste con cada tarea revisada, y los huecos de spec acumulados.

No escribas ningún archivo. Devolvé solo el JSON.`,
    { schema: PLAN_SCHEMA, agentType: 'plan-reducer', model: 'opus', label: `reducer ronda ${round}`, phase: 'Reduccion' },
  )
  agentsSpent++

  if (!reduced || !reduced.tasks || reduced.tasks.length === 0) {
    log(`El reducer falló en la ronda ${round}. Se conserva el plan de la ronda anterior y se corta el loop.`)
    break
  }

  const before = new Set(plan.map((t) => t.id))
  const beforeById = new Map(plan.map((t) => [t.id, t]))

  plan = reduced.tasks
  unassigned = reduced.unassignedCriteria || unassigned
  maxId = plan.reduce((m, t) => Math.max(m, idNum(t.id)), maxId)
  for (const e of reduced.changelog || []) changelog.push(e)
  for (const g of reduced.specGaps || []) if (!specGaps.includes(g)) specGaps.push(g)

  // La cola de la proxima ronda: lo que nadie reviso todavia.
  //  - tareas nuevas (ids que no existian)
  //  - tareas viejas cuyo alcance cambio sin que un revisor las mirara (ej. absorbieron un merge)
  queue = plan
    .filter((t) => {
      if (!before.has(t.id)) return true
      if (queue.includes(t.id)) return false // ya la revisamos en esta ronda
      const old = beforeById.get(t.id)
      return old && (old.title !== t.title || (old.covers || []).join(',') !== (t.covers || []).join(','))
    })
    .map((t) => t.id)

  if (queue.length) {
    log(`Ronda ${round} cerrada: ${plan.length} tareas. Pendientes de revisar: ${queue.join(', ')}`)
  }
}

if (queue.length > 0) {
  log(`Techo de ${MAX_ROUNDS} rondas alcanzado con ${queue.length} tarea(s) sin revisar (${queue.join(', ')}). Un plan que no converge después de tantas vueltas necesita ojo humano, no más iteraciones.`)
}

// ---------------------------------------------------------------------------
// Fase 4 — Chequeo final determinista (JS puro, cero tokens)
// ---------------------------------------------------------------------------

phase('Chequeo de consistencia')

const finalGaps = coverageGaps(scout.criteria, plan, unassigned)
const finalOrphans = orphanTasks(plan)
const finalDupes = duplicateIds(plan)

if (finalGaps.length) log(`Quedan criterios sin cubrir: ${finalGaps.join(', ')}`)
if (finalOrphans.length) log(`Quedan tareas sin criterio ni justificación: ${finalOrphans.join(', ')}`)
if (finalDupes.length) log(`Quedan ids duplicados: ${finalDupes.join(', ')}`)

// ---------------------------------------------------------------------------
// Fase 5 — Writer: el unico agente que toca tasks.md en todo el workflow
// ---------------------------------------------------------------------------

phase('Escritura de tasks.md')

// L10 — Re-planificar no debe desaprobar un plan que no cambio. Se compara el plan final contra
// el que leyo el scout: ids, orden, titulo, Cubre y los encabezados de bitacora, que son la region
// del workflow. El Estado queda FUERA de la comparacion a proposito: lo escribe quien implementa,
// y una tarea que paso a hecho no es un cambio de plan. Aritmetica, cero tokens.
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
  log('El plan final es identico al que ya estaba: se preserva el encabezado de Estado.')
}

const written = await agentP(
  `Carpeta del spec: ${specDir}.

Escribí ${specDir}/tasks.md con esta tabla de Plan final. Es la fuente de verdad: no agregues,
no saques, no reordenes y no renumeres nada.

PLAN FINAL (${plan.length} tareas, en orden):
${JSON.stringify(plan, null, 2)}

CRITERIOS SIN TAREA ASIGNADA:
${unassigned.length ? JSON.stringify(unassigned, null, 2) : 'ninguno'}

PENDIENTES (huecos de spec detectados durante la revisión — para que los decida una persona):
${specGaps.length ? specGaps.map((g) => `- ${g}`).join('\n') : '- Ninguno detectado en esta pasada.'}
${finalGaps.length ? `- Criterios que quedaron sin cubrir: ${finalGaps.join(', ')}` : ''}
${finalDupes.length ? `- Ids duplicados sin resolver: ${finalDupes.join(', ')}` : ''}

Dónde van los campos opcionales, cuando la tarea los trae (seguí assets/tasks-template.md del
skill specify):
- "coversNote" → en la tabla, la columna "Cubre" lleva un guion largo; el texto va en la bitácora
  de esa tarea, en una línea que empieza con **Por qué no cubre criterios:**
- "note" → en la bitácora de esa tarea, en una línea que empieza con **Nota:**
No los pongas en la tabla ni los mezcles dentro de otro campo: la próxima corrida los lee de esas
dos líneas exactas para poder devolvértelos, y lo que quede en cualquier otro lado se pierde.

En el encabezado, después de la línea de Estado, escribí:

  > Ids emitidos: hasta T${maxId}

Es la memoria de qué ids ya se repartieron, incluidos los de tareas que después desaparecieron del
plan. Sin esa línea, una corrida futura calcula el próximo id libre mirando solo las tareas vivas y
puede reutilizar uno ya usado, que es exactamente lo que la regla de numeración prohíbe: ese id
puede estar citado en un commit o en una bitácora.

${planUnchanged
  ? `ENCABEZADO DE ESTADO: el plan final es idéntico al que ya estaba en el archivo — mismos ids, mismo
orden, mismos títulos, mismo Cubre y mismos encabezados de bitácora. **Preservá la línea de Estado
tal como está**, incluido un "aprobado" con su fecha. Esta corrida verificó que el plan sigue en
pie; no lo cambió, así que no hay nada que volver a aprobar.`
  : `ENCABEZADO DE ESTADO: el plan cambió respecto del que estaba en el archivo, así que dejá el
encabezado en "pendiente de aprobación". Lo aprueba una persona, no vos.`}

Acordate de preservar textualmente todo Registro de bitácora que ya tenga contenido real.`,
  { agentType: 'task-writer', model: 'opus', label: 'tasks.md' },
)
agentsSpent++

// ---------------------------------------------------------------------------
// Resultado: lo unico que entra al contexto de la sesion principal
// ---------------------------------------------------------------------------

const count = (a) => changelog.filter((e) => e.action === a).length

return {
  specDir,
  archivo: `${specDir}/tasks.md`,
  estado: 'pendiente de aprobación — lo aprueba una persona, no este workflow',
  tareasFinales: plan.length,
  rondas: round,
  agentes: agentsSpent,
  resumen: {
    sinCambios: count('ok'),
    redimensionadas: count('resize'),
    divididas: count('split'),
    fusionadas: count('merge'),
    eliminadas: count('remove'),
    estadoActualizado: count('status'),
    agregadas: count('add'),
  },
  criteriosSinCubrir: finalGaps,
  idsDuplicados: finalDupes,
  tareasSinRevisar: queue,
  huecosDeSpec: specGaps,
  plan: plan.map(summarize),
  escritura: written || 'El escritor falló: revisá tasks.md a mano.',
}
