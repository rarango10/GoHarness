# Plan — lecciones abiertas y protocolo de cambios a mitad de camino (Lotes 12 a 15)

## Contexto

`lecciones.md` tiene nueve entradas no resueltas: L6, L8, L12, L29 (parcial), L50 a L55. La persona
pide dos cosas: (1) decidir cuáles se vuelven mejora del harness y cuáles quedan afuera, y (2)
resolver la duda de fondo: **qué se hace cuando, a mitad de un ciclo, aparece algo que obliga a
tocar el spec, el plan o lo ya implementado.** Hoy no hay respuesta clara.

Qué existe hoy (verificado en `plugin/goharness/`) son **caminos sueltos, sin protocolo**:

| Situación | Qué dice el harness hoy | Hueco |
|---|---|---|
| Criterio mal, detectado en paso 5 | `implement-task`: «es un hallazgo para `specify`» | No dice qué pasa después: aprobación, tareas `hecho` afectadas, re-plan |
| Criterio mal, detectado en paso 7 | `verify-e2e`: `aSpecify` → «nombrá `specify` y pará» | Idem |
| Desvío del design | `implement-task` y `specify`: «se registra y se lleva al documento» | No dice **quién** edita `design.md` (su productor es `specify`) |
| Requisitos que cambian | `specify` § «Si los requisitos cambian después»: «actualizá todos los documentos afectados» | **Contradice el productor único**: incluye `tasks.md` |
| Falta una tarea / `Cubre` mal | `implement-task`: «anotalo, que lo resuelva `planning-tasks`» | Funciona; falta que el re-plan sepa **qué** cambió |
| Bug en una tarea `hecho` | Solo `close-feature` y `verify-e2e` la bajan a `en curso` | En el paso 5 nadie puede: `implement-task` solo toca su tarea |
| Algo de otra feature | Nada (es L54) | Sin lugar, sin dueño, sin lector |

Y un hueco que ninguna lección nombró todavía: **un `cumple` vale para un estado del código (L33),
pero también para el texto del criterio.** Si R3.2 se enmienda, el `hecho` de la tarea que lo cubre
queda viejo, y ni `tasks-fanout` ni `close-feature` lo detectan. Va como lección nueva, **L56**.

Decisiones de la persona (2026-09-26): no hay corrida en vuelo, se aplica ya; la re-aprobación de un
spec cambiado es una **enmienda corta**; entran el protocolo y todas las lecciones que califican.

## Evaluación de las abiertas

| # | Veredicto | Qué va al harness | Qué queda afuera |
|---|---|---|---|
| **L54** backlog de otra feature | **Harness** — base del protocolo | Clase «otra feature», `docs/pendientes.md` con dueños y lectores, `[backlog]` | El tracker concreto (GitHub, Jira): se nombra en el `CLAUDE.md` del proyecto |
| **L56** (nueva) cambios a mitad de camino | **Harness** — es el pedido central | El protocolo entero (abajo) | — |
| **L51** DOM de pruebas | **Harness**, la regla; **stack**, el default | Estado vs efecto en la estrategia de testing; «lo confirma el e2e» no vale para un `Cubre`; chequeo en `task-reviewer` | jsdom como default vive en `stacks/typescript-node/`, no en el método |
| **L12** test que pasa sin probar | **Harness**, parcial | `dod-checker` pregunta «¿si rompo el efecto, este test falla?» y mira el diff del commit de la tarea | El orden rojo→verde sigue sin prueba (L29): queda `límite asumido` |
| **L52** contrato que envejece | **Harness** | `close-feature` relee las frases de estado de `CLAUDE.md`; `harness-init` escribe reglas normativas | — |
| **L53** seguridad de dependencias | **Mitad y mitad** | Regla «un salto mayor de toolchain es una feature propia» (clase del protocolo); ranura «auditor» en la plantilla; chequeo **informativo** en `close-feature` que solo bloquea lo que la feature trajo | Qué auditor, qué severidad importa: decisión del proyecto en su `CLAUDE.md` |
| **L55** precarga de `specify` | **Harness** | Separar formato de mandato | — |
| **L50** skill de dominio | **Afuera por ahora** | Lo genérico ya lo cubrió L49 (la ranura dice «invocá el skill») | Qué skills de dominio usa un proyecto es contrato del proyecto. Se decide con la evidencia de la 2.ª iteración del dashboard, como dice el índice |
| **L6** MCP de Playwright | **Afuera**, `en observación` | Nada hasta que el ciclo e2e tenga un fallo `causa: test` real | El MCP vive a nivel usuario, nunca como componente del plugin |
| **L8** | `límite asumido`, sin cambios | — | — |

## El protocolo: «Cuando algo cambia a mitad de camino»

**La regla, en una línea:** *un cambio entra por el documento más alto que afecta, baja en cascada
por sus productores, y todo veredicto que se apoyaba en lo cambiado deja de valer.*

**1. Parar y clasificar.** Quien lo detecta (`implement-task`, `dod-checker`, `e2e-triager`,
`close-feature`) no sigue implementando: lo asienta en el `Registro` de la tarea en curso y lo pone
en una clase.

| # | Clase | Pregunta que la distingue | Camino |
|---|---|---|---|
| 1 | Bug en la tarea en curso | ¿Lo rompe o le falta a lo que estoy haciendo? | TDD de la misma tarea (existe) |
| 2 | Bug en una tarea `hecho` de esta feature | ¿Contradice el `cumple` de otra tarea? | Esa tarea baja a `en curso`, **con el sí**, también desde el paso 5 (nuevo) |
| 3 | El *cómo* cambió, el *qué* no | ¿Los criterios siguen igual y el design ya no describe lo que existe? | Enmienda de `design.md` vía `specify` |
| 4 | El *qué* está mal, falta o sobra | ¿Hay que cambiar, agregar o marcar obsoleto un criterio? | Enmienda de `requirements.md` vía `specify` → cascada |
| 5 | El plan está mal, el spec no | ¿Falta una tarea, sobra, o un `Cubre` está mal? | `planning-tasks` (iterativo) |
| 6 | Hace falta una decisión ya | ¿No puedo seguir sin que la persona elija? | `[decidir ya]` (existe) |
| 7 | Le corresponde a otra feature | ¿Es código de otra feature, o transversal (toolchain, runner, deps)? | `[backlog]` → `docs/pendientes.md` (L54). Un salto mayor de toolchain siempre cae acá (L53) |
| 8 | Cambió la feature misma | ¿Cambió el problema que resuelve, o la enmienda deja sin propósito buena parte del plan? | `brainstorming`; la persona decide si esta feature cierra con lo que tiene |

**2. La enmienda (clases 3 y 4), en `specify`:**
- Criterios nuevos al final, nunca renumerar; los que cambian de sentido se marcan **obsoletos** y
  nacen con id nuevo (ya es regla de `specify`; ahora aplica también después de aprobar).
- Encabezado: `> Estado: aprobado (AAAA-MM-DD) · enmendado (AAAA-MM-DD): R3.2, R5.4`.
- Sección `## Enmiendas` al final del documento: fecha, ids, motivo, de dónde salió (`T7`, paso 7…).
- Aprobación corta: se presenta solo lo que cambió, se espera el sí, se commitea (`Enmienda
  <feature>: R3.2`). Un cambio en `requirements.md` pregunta además si arrastra al design (cascada).
- Al pedir el sí, nombra lo que habilita: las tareas `hecho` que van a reabrirse y si hace falta
  re-plan.

**3. Invalidación.** Una tarea `hecho` cuyo `Cubre` incluye un id enmendado **después** de su
`cumple` deja de estar verificada. La baja quien implementa (es su región: `Estado` + `Registro`),
con el sí, marcando la verificación como `**Verificación previa (superada):** enmienda R3.2`. Dos
lugares la detectan: el arranque de `implement-task` (chequeo nuevo) y `close-feature` (red de
seguridad, junto a la higiene).

**4. Re-plan.** Si la enmienda agrega, quita o vuelve obsoletos criterios → `planning-tasks`.
`spec-scout` transcribe `## Enmiendas`, y los revisores lo ven. Un plan que cambia vuelve a
`pendiente de aprobación` (comportamiento existente de L10).

**5. Reanudar** con `implement-task`. Mientras una enmienda o un re-plan están abiertos, no se
implementa (misma lógica que «no implementar con `tasks-fanout` en vuelo»).

## Lotes

Procedimiento por lote (de `HARNESS.md`): editar `plugin/goharness/` → `bash
plugin/goharness/checks/sync-plugin.sh` («sin deriva») → las verificaciones → commit del lote →
sección «Lote N aplicado» e índice en `lecciones.md`.

### Paso previo
- Commitear el diff pendiente de `lecciones.md` (L51–L55, ya escrito por la persona).
- Escribir **L56** en `lecciones.md` con el análisis de arriba (qué pasó, por qué importa, qué
  hacer, lo que no es) y sumarla al índice.

### Lote 12 — Protocolo de cambios (L56 + L54)
- **`plugin/goharness/SKILL.md`** (router): sección nueva «Cuando algo cambia a mitad de camino» con
  la tabla de ocho clases y los cinco pasos. Mención de `docs/pendientes.md` en prosa, fuera de la
  tabla del ciclo (la guarda de paridad compara filas de esa tabla).
- **`CLAUDE.md`** (repo) y **`skills/harness-init/assets/CLAUDE.template.md`**: regla nueva en negrita,
  **«Un cambio entra por el documento más alto que toca.»**, en los dos lados (lo exige
  `check-rules-parity.cjs`). La plantilla nombra además dónde vive el backlog (archivo o tracker).
- **`skills/specify/SKILL.md`**: reemplazar «Si los requisitos cambian después» por «Enmiendas»
  (modo enmienda, encabezado, `## Enmiendas`, aprobación corta, cascada). Quitar el «actualizá todos».
  Marcar en `Alcance` los `P<n>` del backlog que la feature toma (`en <feature>`).
- **`skills/specify/assets/requirements-template.md`** y **`design-template.md`**: la variante
  `enmendado` del encabezado y la sección `## Enmiendas` (vacía por defecto).
- **`skills/implement-task/SKILL.md`**: (a) chequeo 5 de «Antes de arrancar»: enmiendas posteriores
  al `cumple` de tareas `hecho`; (b) clase 2 desde el paso 5; (c) el desvío de design se rutea a
  `specify`, no se edita a mano; (d) destinatario `[backlog]`; (e) «no se implementa con una
  enmienda o re-plan abiertos».
- **`skills/specify/assets/tasks-template.md`**: `[feature siguiente]` se unifica en `[backlog]`.
- **`skills/close-feature/SKILL.md`**: mover las `[backlog]` a `docs/pendientes.md` (dejando el
  `P<n>`), pasar a `resuelto <commit>` los `P<n>` que la feature tomó, reconocer un rojo que
  coincide con una entrada abierta (se reintenta y documenta, no reabre tareas), y la red de
  seguridad de invalidación por enmienda. Plantilla nueva **`skills/close-feature/assets/pendientes-template.md`**.
- **`skills/brainstorming/SKILL.md`**: al explorar, leer las entradas `abierto` de
  `docs/pendientes.md` y nombrar las que tocan el mismo código.
- **`agents/spec-scout.md`** + **`workflows/tasks-fanout.js`** (schema del scout y prompt de los
  revisores): transcribir `## Enmiendas` y pasarlo a `task-reviewer`.
- **`skills/verify-e2e/SKILL.md`**: `aSpecify` apunta a la sección del router («enmienda»).
- `dod-checker` **no** lee el backlog, a propósito (L54, contaminación de L22).

### Lote 13 — Calidad de la evidencia (L51 + L12)
- **`design-template.md`** § Estrategia de testing: distinguir criterios de **estado** y de **efecto**;
  con JavaScript de cliente, declarar el DOM de pruebas; «lo confirma el e2e» no vale para un
  criterio que está en el `Cubre` de una tarea.
- **`skills/specify/SKILL.md`** fase 2: la misma pauta al diseñar.
- **`agents/task-reviewer.md`** y **`agents/plan-reducer.md`**: marcar una tarea cuyo `Cubre` tenga un
  criterio que el design deja solo al paso 7.
- **`skills/harness-init/SKILL.md`** + **`assets/stacks/typescript-node/vitest.config.ts`**: en proyectos
  web, preguntar por el DOM de pruebas junto al stack; jsdom como default comentado en el config.
- **`agents/dod-checker.md`** § Qué verificar: por cada criterio, el test que lo evidencia tiene que
  ejercitar el efecto que nombra, no un helper; pregunta explícita «¿si rompo lo que produce esto,
  este test falla?»; mirar `git show` del commit de la tarea (lectura, ya autorizado).

### Lote 14 — Cierre (L52 + L53)
- **`skills/close-feature/SKILL.md`**: paso nuevo antes del commit: releer las frases de estado de
  `CLAUDE.md` (Stack, reglas propias, fuentes nombradas) contra el repo final; si una quedó falsa,
  nombrar `harness-init` en modo revisión y parar. Y el chequeo **informativo** de dependencias:
  correr el auditor declarado; bloquea solo lo que afecta paquetes que la feature agregó o subió
  (diff del manifiesto desde el primer commit de la feature); lo heredado va al backlog.
- **`skills/harness-init/SKILL.md`** + **`CLAUDE.template.md`**: «una regla del proyecto dice qué se
  hace, no qué hay», con el ejemplo de L52; ranura opcional «Auditor de dependencias» en Comandos
  de verificación (o «ninguno», explícito).

### Lote 15 — Formato separado del mandato (L55)
- **Primero verificar** (con `claude-code-guide`) si un skill de plugin puede declararse no
  invocable por el usuario/modelo y seguir siendo precargable en `skills:` de un agente.
- Si se puede: skill nuevo **`formatos-del-spec`**, solo referencia, con las tres plantillas y
  `ears-patterns.md` movidas desde `specify`; `specify` lo usa; los cuatro agentes que leen
  formatos (`dod-checker`, `task-writer`, `task-reviewer`, `plan-reducer`) lo precargan en vez de
  `specify`. Actualizar las rutas citadas en `implement-task`, `close-feature`, `harness-init`, el
  README y el conteo de skills de `HARNESS.md`.
- Si no se puede: solo la opción mínima (sacar la precarga a `e2e-test-writer` y `e2e-triager`) y
  L55 queda `resuelto parcialmente`.
- En los dos casos: `e2e-test-writer` y `e2e-triager` dejan de precargar `specify`.

### Cierre
- Índice de `lecciones.md`: L54, L56, L51, L52, L55 → `resuelto (Lote N)`; L12 y L53 →
  `resuelto parcialmente` con lo que queda; L50 y L6 → razón de por qué siguen afuera. «Lo que
  queda» se reescribe. Sección «Lote N aplicado» por lote con lo que apareció.
- Subir `version` a 0.5.0 en `plugin.json`. Publicar (push + tag) solo si la persona lo pide.

## Verificación

1. Las cinco de `HARNESS.md`, después de cada lote: `claude plugin validate . --strict`, `claude plugin
   validate plugin/goharness --strict`, `lint-workflow-literals.cjs` sobre `tasks-fanout.js`,
   `check-rules-parity.cjs` (tiene que ver la regla nueva en los dos lados) y `sync-plugin.sh` («sin
   deriva»).
2. `grep` de contradicciones: ya no aparece «actualizá todos los que queden afectados» ni
   `[feature siguiente]`; ningún skill fuera de `specify` dice editar `design.md`/`requirements.md`.
3. L55: en sesión nueva, invocar cada agente con un prompt mínimo; su primer mensaje no menciona un
   skill ajeno (hoy, dos de dos lo hacen).
4. Prueba del protocolo en el demo, en sesión nueva: una feature chica de la calculadora (p. ej.
   «porcentaje»), y a mitad del paso 5 enmendar un criterio ya cubierto por una tarea `hecho`.
   Tiene que: pedir la enmienda a `specify`, dejar el encabezado `enmendado` y `## Enmiendas`,
   detectar la tarea a reabrir al arrancar `implement-task`, y reabrirla solo con el sí. Si esa
   prueba no se corre en esta sesión, el lote queda anotado como «aplicado sin probar» en el índice,
   con esta prueba como su prueba natural.
