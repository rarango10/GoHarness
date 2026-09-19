# Plan de implementación — pendientes de `lecciones.md` (Lotes 8, 9 y 10)

## Contexto

`lecciones.md` acumula seis entradas `listo para aplicar` (L36, L39, L40, L45, L46, L47). La persona
suma además cuatro que no estaban listas: L42 (guarda de reglas), L9 (dod-checker y `git stash`), L38
(confirmación en prosa) y L41 (commit en los pasos 0-3). L41 ya se repitió: en la corrida de
raíz-y-cuadrado, `requirements.md` y `design.md` terminaron adentro del commit de T1.

Se verificó contra `plugin/goharness/` que **ninguna está aplicada todavía** (2026-09-19).

**Restricción de ejecución.** Hay una feature en construcción con el harness actual. Los lotes **no
se ejecutan en esta sesión**. Se aplican cuando esa feature cierre, porque `lecciones.md` prohíbe
cambiar el harness con una prueba en vuelo.

## Qué se hace ahora, al aprobar este plan (lo único)

Dejar el plan donde lo encuentre la sesión que lo ejecute. No se toca `plugin/goharness/` y no se
corre `sync-plugin.sh`, así que la feature en curso no se ve afectada.

1. Guardar este documento, tal cual, en **`docs/2026-09-19-lotes-8-a-10/plan.md`**. Es la convención
   de `HARNESS.md` para los planes de ciclo, y va versionado junto al resto.
2. En `lecciones.md`, sección «Lo que queda», una línea: *«Plan de aplicación de las diez pendientes
   —orden, dependencias y contradicciones resueltas—: `docs/2026-09-19-lotes-8-a-10/plan.md`.
   Ejecutar cuando no haya ninguna corrida del ciclo en vuelo.»* `EMPEZAR-ACA.md` manda a quien llega
   a leer ese índice, así que el plan queda a un salto.
3. Commit de los dos archivos: *«Plan de los lotes 8 a 10»*.

La sesión que ejecute los lotes arranca con: *«Vengo a mejorar el harness. Leé `HARNESS.md`, el
índice de `lecciones.md` y `docs/2026-09-19-lotes-8-a-10/plan.md`.»*

## Dependencias entre entradas

```
L42 (guarda) ──────────────► protege a L40, L41 y L46.2 (reglas y tablas duplicadas)
L46.1 (ranura de superficie en design-template)
   ├─► L46.4  verify-e2e lee la superficie declarada
   ├─► L47    instalar Playwright solo si hay superficie
   ├─► L45.3  el destinatario [paso 7] solo vale con superficie
   └─► cierre de implement-task: paso 7 o paso 8 según el design
L46.3 (pregunta de superficie en harness-init) ─► L47.1 (sembrar config + dependencia)
L41 ◄─► L9   commitear pronto achica lo que un `git stash` puede llevarse
L36 + L38    mismo archivo y pasos contiguos de planning-tasks
```

## Contradicciones y cómo se resuelven

| Choque | Resolución |
|---|---|
| **L45 ↔ L46.** L45 propone el destinatario `[paso 7]`, y L46 nació de un `Pendiente` dirigido a un paso 7 que no iba a existir. | Vocabulario: `[Tn]`, `[paso 7]` (**solo si el `design.md` declara superficie navegable**), `[paso 8]`, `[decidir ya]`. Por eso L45 va **después** de L46. |
| **L46 ↔ L47.** L47 instala en el paso 0, pero L46 decide la superficie por feature. Un proyecto sin UI hoy y con UI mañana no tenía quién sembrara Playwright. | **Decidido por la persona:** si en el init ya hay UI, `harness-init` siembra e instala. Si todavía no, no siembra nada, y **`specify` lo remite al aprobar el primer `design.md` con superficie navegable**: corre el doctor, y si falla, nombra a `harness-init` en modo revisión (config, instalación con el sí y la pata e2e de la higiene) antes de `planning-tasks`. |
| **L39 ↔ L47.** L39 rechaza agregar chequeos enumerados; L47 suma una verificación de dependencia. | L47 **modifica el ítem 4 existente**, no agrega un quinto. El doctor comprueba una afirmación («hay config, entonces hay dependencia»), que es el espíritu de L39. |
| **L40 y L41 ↔ L42.** Las dos reglas nuevas se escriben en 3 o 4 lugares, y nada verifica que coincidan. | L42 va **primero** como guarda: se corre antes (línea base) y después de cada lote que toca reglas. |
| **L46.2 ↔ L42.** La tabla del ciclo vive en el router y en `CLAUDE.template.md`, y L46 la cambia en los dos lados. | El chequeo de L42 compara también las filas de la tabla del ciclo (número de paso y productor), no solo las reglas. |

## Procedimiento por lote (de `HARNESS.md`)

Editar `plugin/goharness/` → `bash plugin/goharness/checks/sync-plugin.sh` («sin deriva») → **sesión
nueva** → probar el paso tocado en el demo → las cuatro verificaciones (`claude plugin validate .
--strict`, `claude plugin validate plugin/goharness --strict`, `lint-workflow-literals.cjs`,
`sync-plugin.sh`) → en `lecciones.md`, sección `## Lote N aplicado — fecha` y filas del índice a
`resuelto` con su commit → un commit por lote.

---

## Lote 8 — Guardas y arreglos aislados (L42, L9, L36, L38)

No dependen de nada. Van primero porque L42 es la herramienta que cuida a los otros dos lotes.

1. **L42 — `checks/check-rules-parity.cjs` (nuevo).** Extrae los títulos en negrita de «Reglas del
   harness» en `CLAUDE.md` y en `skills/harness-init/assets/CLAUDE.template.md` y compara los
   conjuntos. Compara también las filas de la tabla del ciclo entre `SKILL.md` (router) y la
   plantilla. Se agrega a la lista de verificaciones de `HARNESS.md`. Se corre al principio para
   fijar la línea base de hoy.
2. **L9 — `agents/dod-checker.md:25` y `agents/spec-scout.md:14`.** Reescribir la prohibición sobre
   la **ejecución** y no sobre el efecto: *ningún comando que modifique el repo, aunque lo restaure
   después — `git stash`, `checkout` y `reset` incluidos*. Nombrar la alternativa de solo lectura
   (`git log`, `git diff`, `git blame`).
3. **L38 — `skills/planning-tasks/SKILL.md`, paso 2.** La confirmación va en prosa: pedir un sí no es
   ofrecer una elección.
4. **L36 — mismo archivo, paso 3.** Al lanzar, decir tres cosas: `Task ID`, **`/workflows` para ver
   el avance** y la forma del fan-out. Al recibir la notificación de fin, leer `wf_<runId>.json` y
   reportar `agentCount`, la duración y los `logs`.

**Prueba:** re-planificar el `tasks.md` aprobado de `raíz-y-cuadrado` (también confirma que L10 sigue
en pie) y mirar la confirmación y el mensaje de lanzamiento. Para L9, correr `dod-checker` sobre una
tarea hecha y revisar su transcript buscando `stash`.

## Lote 9 — Superficie navegable (L46, L47, L39)

Es el lote más grande y el que fija la base de L45. Orden interno: de la base hacia los que leen.

1. **`skills/specify/assets/design-template.md`** — ranura nueva **Superficie**: navegable (URL o
   `file://`, y cómo se levanta) o no navegable (CLI, librería, base, job). Es L46.1.
2. **`skills/verify-e2e/`**
   - `scripts/e2e-doctor.cjs` (nuevo; L47.2): paquete en `devDependencies`, que resuelva desde el
     proyecto, y que exista el **browser que esa versión espera**. Esta última comprobación queda
     como `TODO(human)` para la persona.
   - `SKILL.md`: la precondición 3 lee primero la superficie del `design.md`. «No navegable» es una
     **rama hacia el paso 8**, no un fallo; el sondeo actual queda de respaldo. La precondición 4
     corre el doctor.
3. **`skills/harness-init/SKILL.md`**
   - L39: antes de las cuatro comprobaciones, leer el archivo entero buscando afirmaciones que el repo
     contradiga, **las existentes y las propias**, y escribir las frases de estado en condicional.
   - L46.3: pregunta de superficie, proponiendo la respuesta a partir del repo.
   - L47.1: regla *config y dependencia juntos o nada*, columna «Dependencia» en «Qué sembrar»,
     instalación con el sí, ítem 4 del modo revisión («y su dependencia está instalada») y el doctor
     al final, junto al `grep` de ranuras.
   - Rama «todavía no hay UI»: no se siembra `playwright.config.ts` ni la pata e2e, y la ranura de
     higiene lo dice en condicional.
4. **`skills/specify/SKILL.md`, fase 2** (decisión de la persona): con el design aprobado, si declara
   superficie navegable y el doctor falla, nombrar `harness-init` en modo revisión antes de
   `planning-tasks`.
5. **`SKILL.md` (router) y `CLAUDE.template.md`** — el paso 7 figura como **condicional** en la tabla
   del ciclo (L46.2).
6. **`skills/harness-init/assets/stacks/typescript-node/playwright.config.ts`** — `trace:
   'retain-on-failure'` y una línea sobre superficies `file://`.

**Prueba:** el chequeo de L42 en verde (tablas). El doctor da ✓ en el demo y ✗ en un proyecto del
scratchpad sin el paquete. `harness-init` sobre una carpeta vacía del scratchpad hace la pregunta de
superficie y ofrece instalar. `harness-init` en modo revisión sobre el demo audita afirmaciones.
`verify-e2e` sobre un spec de prueba que declara «no navegable» rutea al paso 8 sin escribir nada.

## Lote 10 — `implement-task` y las reglas repetidas (L45, L40, L41)

Va después del 9 porque el vocabulario de destinatarios y el cierre dependen de la ranura de
superficie. `implement-task` se edita **una sola vez**, acá.

1. **`skills/implement-task/SKILL.md`**, en una pasada:
   - L40, en la sección de modo y en el paso 8: la segunda ronda de la misma tarea **espera el sí,
     siempre**.
   - L45.1, paso 1: leer `## Pendientes` y nombrar los ítems dirigidos a la tarea.
   - L45.2, «Lo que escribís»: `Pendientes` pasa a ser región escribible.
   - L45.3: toda línea de `Pendientes` lleva destinatario, con el vocabulario de la tabla de
     contradicciones.
   - Cierre: paso 7 o paso 8 según la superficie declarada en el `design.md` (L46).
2. **`skills/specify/assets/tasks-template.md`** — formato de `Pendientes` con destinatario.
3. **`agents/task-writer.md:39` y `workflows/tasks-fanout.js`** — L45.4: preservar y **fusionar**
   `Pendientes` en vez de regenerarlo desde los `specGaps`.
4. **Reglas en cuatro lugares** (L40 y L41): `implement-task`, el `CLAUDE.md` del repo,
   `CLAUDE.template.md` y la regla 3 del router.
   - L40: la segunda ronda espera el sí.
   - L41: *quien recibe el sí de un documento lo commitea*. Una línea cada uno en `specify` (después
     de aprobar requirements y design), en `harness-init` (el contrato, los configs y el
     `package.json` de la instalación) y en quien asienta la aprobación de `tasks.md`.

**Prueba:** el chequeo de L42 en verde (reglas). `lint-workflow-literals.cjs` sobre
`tasks-fanout.js`. En el demo, un `tasks.md` con un `Pendiente` `[T2]` que se re-planifica sin
perderse, y `implement-task` abriendo T2 y nombrándolo. La segunda ronda de L40 solo se ejercita con
un veredicto parcial real: si no ocurre, queda anotada como «no ejercitada».

---

## Cierre de la ronda

- `lecciones.md`: las diez entradas en `resuelto` con lote y commit, «Lo que queda» reescrito, y las
  tres secciones «Lote N aplicado» con lo que apareció al aplicar.
- Subir `version` en `plugin/goharness/.claude-plugin/plugin.json` y hacer la instalación real en una
  carpeta descartable (`HARNESS.md` → «Publicar una versión»).

## Verificación global

- `node plugin/goharness/checks/check-rules-parity.cjs` en verde.
- Las cuatro verificaciones de `HARNESS.md` en verde.
- `grep -rn "on-first-retry\|deje un cambio en" plugin/goharness` sin resultados.
- Un ciclo corto completo en el demo (una feature mínima) recorriendo los pasos tocados, en una
  sesión nueva con el plugin sincronizado.
