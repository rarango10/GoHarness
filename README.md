# GoHarness

Un **ciclo de desarrollo asistido por agentes** para Claude Code, empaquetado como plugin
instalable — y una app chiquita construida enteramente con él, con todo su rastro documental a la
vista.

1. **El harness** (`goharness`): nueve pasos, siete skills, siete subagentes y un workflow dinámico.
   Cada paso produce un artefacto, se detiene y espera aprobación humana.
2. **La calculadora de `src/`**: el ejemplo. No es el punto — es la prueba de que el método produce
   algo, y el lugar donde se puede leer cómo quedó cada documento del ciclo.

Si venís a usarlo en tu proyecto, son dos comandos. Si venís a evaluar el método, andá derecho a
[Momentos donde el ciclo hizo su trabajo](#momentos-donde-el-ciclo-hizo-su-trabajo). Y
si venís a **editar el harness**, la puerta es [`EMPEZAR-ACA.md`](EMPEZAR-ACA.md).

---

## Instalarlo

```bash
claude plugin marketplace add rarango10/GoHarness
claude plugin install goharness@goharness
```

Queda instalado para tu usuario, así que sirve en todos tus proyectos. Después:

1. **Habilitá los workflows dinámicos**, que el paso 4 necesita: `/config` → *Dynamic workflows*, o
   `"enableWorkflows": true` en `~/.claude/settings.json`. Y **abrí una sesión nueva**: el registro
   de workflows se arma al arrancar. Es un setting de tu máquina, no del repo.
2. **En tu proyecto, pedí el paso 0**: «preparemos el proyecto». El skill `harness-init` te
   entrevista y escribe el `CLAUDE.md` que el resto del harness necesita para saber qué comandos
   correr. Si ya tenés uno, no lo pisa: lo revisa y te propone cambios.
3. **Arrancá la primera feature** con «quiero agregar X». Desde ahí, cada paso nombra el siguiente.

**Pedí los pasos en lenguaje natural.** Adentro del plugin todo lleva prefijo —
`goharness:implement-task`, `goharness:dod-checker`— y el nombre pelado solo resuelve si el skill
vive en tu repo. Las frases de la columna «Se pide diciendo» disparan cada skill por su descripción,
y esas **no dependen del prefijo**.

Para actualizar: `claude plugin marketplace update goharness`, después
`claude plugin update goharness@goharness`, y reiniciá la sesión.

---

## El ciclo, en nueve pasos

| # | Producto | Lo produce | Se pide diciendo |
|---|----------|------------|------------------|
| 0 | el `CLAUDE.md` del proyecto | skill `harness-init` | «preparemos el proyecto» |
| 1 | diseño acordado (en el chat) | skill `brainstorming` | «quiero agregar X» |
| 2 | `requirements.md` | skill `specify`, fase 1 | «escribamos el spec» |
| 3 | `design.md` | skill `specify`, fase 2 | «pasemos al diseño» |
| 4 | `tasks.md` | skill `planning-tasks` → workflow `tasks-fanout` | «planeemos las tareas» |
| 5 | código + tests + un commit por tarea | skill `implement-task` (TDD) | «implementemos T3» |
| 6 | veredicto por tarea (en el chat) | subagente `dod-checker` | «verificá T3» |
| 7 | `e2e-tests-plan.md` + `e2e-test-report.md` — **condicional** | skill `verify-e2e` | «verifiquemos e2e» |
| 8 | corrida de higiene + commit de cierre | skill `close-feature` | «cerremos la feature» |

El paso 0 corre una vez por repo; del 1 al 8, una vez por feature. Todo el papeleo vive en
`docs/AAAA-MM-DD-<feature>/`.

**El paso 7 no es de todas las features.** Su `design.md` declara si hay superficie navegable —algo
que abrir con una URL o un `file://`—, por feature y no por proyecto. Sin eso, el veredicto de
`dod-checker` pasa directo al paso 8: no es una excepción, es el camino para una CLI, una librería o
un job. Cuando sí la hay, `harness-init` instala Playwright junto con `playwright.config.ts` en el
paso 0, con el mismo sí — no recién en el paso 7, donde un paquete ausente cuesta la feature entera
de espera.

**Entre el 5 y el 6 no hay compuerta, y es a propósito.** Una tarea implementada y sin verificar
queda en un limbo indistinguible de «a medio hacer», así que implementar y verificar son el mismo
acto: la aprobación va después del veredicto, y es **por tarea** — once tareas son once ciclos.

Los tres últimos verifican cosas distintas y ninguno reemplaza a otro: `dod-checker` pregunta si
*una tarea* cumple sus criterios; `verify-e2e`, si *la feature entera* camina; `close-feature`, si
*todos los veredictos siguen siendo ciertos juntos* sobre el estado final.

---

## Las tres ideas que lo sostienen

### Un solo productor por documento

`tasks.md` lo escribe **solo** el workflow `tasks-fanout`; los specs e2e, **solo** `e2e-test-writer`;
el reporte, **solo** `e2e-triager`. Nunca a mano, nunca con otro subagente.

La excepción aparente confirma la regla: en `tasks.md`, el `Estado` y el `Registro` de cada tarea los
escribe quien implementa —más el encabezado de aprobación, una vez—. No es un segundo autor del mismo
documento: son **regiones distintas con dueños distintos**.

### La compuerta viaja con el paso

No hay archivo de configuración de compuertas, y es deliberado: cada una es prosa dentro del skill
dueño de ese paso, así que no podés leer el paso sin leer su compuerta. El modo se dice **al
invocar** (`--modo corrido`, `--modo autonomo`, `--sin plan`), no en un JSON.

Y las renuncias tienen **vocabulario propio, que no se infiere**: «implementemos T3, T4 y T5» es una
lista, no una renuncia a la compuerta entre tareas.

### `hecho` significa verificado

Una tarea pasa a `hecho` **solo** con un `cumple` de `dod-checker` asentado en su `Registro`.
Cualquier resultado menor la deja en `en curso`. Eso convierte la columna `Estado` en el registro
durable de qué está terminado de verdad.

Con una vuelta de tuerca que costó descubrir: **un veredicto vale para el estado en que se tomó**, y
puede volverse falso sin que la tarea cambie una línea. Por eso existe el paso 8.

---

## Momentos donde el ciclo hizo su trabajo

Están todos asentados en las bitácoras de `docs/`. Son la razón por la que el andamiaje existe. Los
cuatro primeros son de la feature de suma, la primera que se corrió; el quinto es de la segunda, ya
con el harness corregido, y el sexto es de la tercera (`raíz-y-cuadrado`).

**1. El desvío que el verificador no vio, y la persona sí (T1).**
Se agregó `@testing-library/jest-dom` sin declararla, y el Objetivo de T1 afirmaba explícitamente que
no se había agregado ninguna dependencia fuera del stack. `dod-checker` corrió dos veces y devolvió
`cumple` las dos, sin señalarla. La detectó una revisión manual de `package.json` contra la tabla de
`CLAUDE.md`, línea por línea. La decisión humana no fue quitar la dependencia sino **ensanchar el
contrato**. La compuerta humana no es ceremonia. *(De ahí salió una corrección al verificador: hoy
restar las dependencias contra el contrato es un paso obligatorio de su procedimiento.)*

**2. La corrección a medias que sí se detectó (T6).**
Una verificación anterior anotó que faltaba probar que la casilla "Resultado" fuera de solo lectura.
Se agregó esa aserción… y solo esa. `dod-checker` devolvió `cumple-parcial`: la mitad "las otras dos
son editables" seguía sin test, pese a que el Registro afirmaba que el criterio quedaba cubierto por
completo. El veredicto anterior quedó **marcado como superado, no borrado** — la bitácora conserva el
error y su corrección, que es lo que la vuelve útil.

**3. El veredicto que no es ni sí ni no (T1).**
`dod-checker` tiene cuatro veredictos, y el cuarto es **`no-verificable`**. Ese salvó una
verificación: los workers de Vitest se colgaban de forma reproducible y el checker se negó a declarar
un fallo del código cuando lo que fallaba era el entorno. La causa resultó ser iCloud sincronizando
`node_modules` — el `prepare` de cada worker tardaba 97 s contra los ~34 ms normales — y se resolvió
moviendo el repo fuera de la carpeta sincronizada. Un verificador binario habría reportado un
incumplimiento falso.

**4. Una tarea `hecho` que dejó de estarlo (T11, en el commit).**
El Objetivo de T11 afirmaba que `npm run verify` quedaba en verde porque "la carpeta `end2end/` vacía
no rompe la verificación previa al commit". Era cierto **mientras la carpeta estuviera vacía**. Cuando
el paso 7 la pobló con tres specs, Vitest empezó a levantarlos y `verify` se puso en rojo. El paso 7
no introdujo el hueco: lo destapó. T11 volvió a `en curso`, se arregló con un `exclude` en
`vite.config.ts`, y volvió a `hecho` recién con un `cumple` nuevo. **De ese caso nació el paso 8.**

**5. El verificador que dejó de redondear para arriba (segunda feature).**
En la feature de operaciones, dos tareas volvieron `cumple-parcial` por hallazgos reales: un criterio
con tres cláusulas y una sin test, y un objetivo que exigía `verify` en verde mientras el lint fallaba
por deuda de la tarea anterior. Las dos se cerraron con una segunda ronda y su veredicto anterior
marcado como superado. Antes de las correcciones, ese mismo caso salía `cumple` con una nota al pie.

**6. El desvío que se vio dos tareas después, y llegó al documento (T5 → T7, tercera feature).**
En T5 el botón «Elevar al cuadrado» quedó con `setResult(String(square(opA)))` directo, en vez de
pasar por `showResult` como decía el `design.md`. Era equivalente —`square` nunca devuelve `null`, no
hay error que traducir— y `dod-checker` dio `cumple`; el `Registro` de T5 cuenta qué se escribió pero
no lo marca como desvío. Lo marcó el de T7, al probar otro criterio, y **`design.md` se actualizó para
describir lo que existe**. Es la regla de la bitácora funcionando como segunda pasada: un desvío sin
registrar deja un documento que describe algo que ya no está, y este quedó registrado y corregido en
el mismo archivo donde se iba a leer. La feature cerró con 8 tareas, 61 tests y los tres casos e2e en
verde.

---

## Qué hay para mirar

```
docs/2026-09-06-calculadora-suma/        la primera feature, 10 tareas
docs/2026-09-07-calculadora-operaciones/ la segunda, 9 tareas, con el harness corregido
docs/2026-09-13-raiz-y-cuadrado/         la tercera, 8 tareas, con un desvío de diseño registrado
  requirements.md      criterios de aceptación en notación EARS
  design.md            arquitectura, interfaces, estrategia de testing
  tasks.md             el plan + la bitácora completa de cada tarea
  e2e-tests-plan.md    3 casos: 1 happy path + 2 de fallo, citando criterios
  e2e-test-report.md   resultado de la corrida real de Playwright

docs/2026-09-06-mejoras-del-harness/     el plan con el que se corrigió el propio harness
lecciones.md                             47 lecciones de usarlo: qué falló y por qué
end2end/                                 los specs, escritos por e2e-test-writer
src/                                     el código: calc.ts (lógica pura) + App.tsx (UI)
```

**Si vas a leer un solo archivo, que sea
[`docs/2026-09-07-calculadora-operaciones/tasks.md`](docs/2026-09-07-calculadora-operaciones/tasks.md).**
Su sección `Bitácora` tiene, tarea por tarea: el objetivo, el test que arrancó en rojo con su mensaje
literal, qué se implementó, y el veredicto que la habilitó a pasar a `hecho`.

---

## El contrato del proyecto: `CLAUDE.md`

Es el punto de indirección de todo el harness. Los skills y los agentes **no saben** qué runner de
tests usás: leen los comandos de la sección «Comandos de verificación» y corren esos.

**El `CLAUDE.md` de este repo es un ejemplo, no una plantilla — no lo copies.** El tuyo lo produce el
paso 0: `harness-init` parte de la plantilla que viaja adentro del plugin
([`plugin/goharness/skills/harness-init/assets/CLAUDE.template.md`](plugin/goharness/skills/harness-init/assets/CLAUDE.template.md))
y la completa entrevistándote. Copiar el de acá te traería Vite, React, Biome y el stack de una
calculadora.

Los dos juntos se leen bien: la **plantilla en blanco** muestra la estructura y las preguntas; el
**[`CLAUDE.md`](CLAUDE.md) de este repo** muestra cómo queda después de dos features reales, con las
dos ranuras de comandos rotuladas —corrección e higiene— y las reglas del proyecto separadas de las
del harness.

Dos cosas de esa plantilla que importan más de lo que parecen:

- **No tiene sección «Estructura»**, así que meter un árbol de archivos en el contrato —que es
  territorio del `design.md`— pasa de improbable a **imposible**.
- **Una ranura sin llenar es una pregunta visible** en el archivo. Una generación libre que decidió
  sola no deja ninguna marca.

---

## Qué hay adentro del repo

```
.claude-plugin/marketplace.json   el repo como marketplace: apunta a ./plugin/goharness
plugin/goharness/                 el plugin: esto es lo que se instala
├── .claude-plugin/plugin.json    nombre, versión, licencia
├── SKILL.md                      el router: explica el ciclo y enruta al paso que toca
├── skills/
│   ├── harness-init/             siembra el CLAUDE.md del proyecto: plantilla + entrevista
│   ├── brainstorming/            idea suelta → diseño acordado
│   ├── specify/                  requirements.md y design.md, con templates y evals
│   ├── planning-tasks/           verifica el spec y lanza el workflow. No planifica
│   ├── implement-task/           una tarea, de punta a punta, hasta su veredicto
│   ├── verify-e2e/               el ciclo end-to-end, en dos fases
│   └── close-feature/            la higiene sobre el estado final y el commit de cierre
├── agents/
│   ├── spec-scout.md             releva el spec y el repo de una pasada     [solo lectura]
│   ├── task-reviewer.md          juzga UNA tarea del plan                   [solo lectura]
│   ├── plan-reducer.md           sintetiza los veredictos en un plan        [solo lectura]
│   ├── task-writer.md            materializa el plan                        [escribe tasks.md]
│   ├── dod-checker.md            ¿esta tarea está realmente hecha?          [solo lectura]
│   ├── e2e-test-writer.md        traduce el plan e2e a Playwright           [escribe end2end/]
│   └── e2e-triager.md            corre, diagnostica y rutea. No repara      [escribe el reporte]
├── workflows/tasks-fanout.js     scout → N revisores en paralelo → reducer → 1 escritor
└── checks/                       el linter de literales y el script de sincronización
```

Siete subagentes, **tres** con permiso de escritura, y cada uno escribe un documento distinto.

**El plugin no vive en `.claude/` a propósito.** Ahí este repo cargaría sus propios skills *además*
del plugin instalado, y quedarían dos versiones vivas de cada uno. Fuera de `.claude/`, la semilla
puede seguir siendo su propio banco de pruebas.

### El linter que parece de más y no lo es

`tasks-fanout.js` es casi todo prompts entre backticks. Un backtick de más adentro de un prompt cierra
el literal y abre otro, y el texto del medio pasa a parsearse como expresiones: el archivo sigue
siendo JavaScript válido y el prompt quedó destruido. Por eso:

```bash
node plugin/goharness/checks/lint-workflow-literals.cjs plugin/goharness/workflows/tasks-fanout.js
```

(`node --check` sobre ese archivo **no** sirve: usa `return` en el nivel superior, que es como lo
ejecuta el runtime de workflows, y bajo ESM eso da un error que no significa nada.)

---

## Forkearlo y publicar el tuyo

Como `plugin/goharness/` ya es un plugin y el repo ya es su marketplace, tu fork se instala igual que
este, con tu usuario en lugar de `rarango10`.

**1. Cambiale el nombre.** En `plugin/goharness/.claude-plugin/plugin.json` (`name`), en el
`name:` del router `SKILL.md`, y en `.claude-plugin/marketplace.json` (`name`, `owner` y la entrada
de `plugins`). **No es cosmético:** dos plugins con el mismo nombre no conviven. Si instalás tu fork
llamándose `goharness` teniendo este instalado, uno de los dos queda desactivado **en silencio**, y el
único lugar donde se ve es `claude plugin list`.

**2. Validá los dos manifiestos.**

```bash
claude plugin validate . --strict                  # el marketplace
claude plugin validate plugin/goharness --strict   # el plugin
```

**3. Medí el costo.** `claude plugin details <nombre>` da el inventario y el costo proyectado. Este
harness cuesta **~1.9k tokens always-on** por sesión; el resto se paga al invocar cada skill.

**Pero `details` miente por omisión.** No cuenta el `SKILL.md` de la raíz del plugin ni los
workflows. En una sesión real se cargan además el router y el workflow namespaceado. **Verificá
contra el listado de skills de la sesión**, que es lo que efectivamente se cargó.

**4. Probá que no se rompió nada.** `specify` y `brainstorming` traen sus propias evals, así que un
cambio de prosa es verificable en vez de a ojo: `claude plugin eval <nombre>`.

**5. Publicalo con un tag.** `claude plugin tag` arma el tag de release (`{nombre}--v{version}`) y
valida de paso que el manifiesto y la entrada del marketplace coincidan.

### Mientras editás el harness

Instalado desde el marketplace, el plugin es una copia en la caché: **editar el repo no cambia lo que
carga la sesión** hasta que corras `claude plugin update` y reinicies. Para iterar sin ese ciclo:

```bash
bash plugin/goharness/checks/sync-plugin.sh ~/.claude/skills/<nombre>
```

Copia y después compara los dos árboles completos en las dos direcciones. Falla si sobra un archivo o
si falta uno — a propósito, porque un chequeo que nunca falla es decorativo. Ojo con el punto 1: esa
copia y una instalación con el mismo nombre no cargan juntas, y gana la instalada.

### El namespacing, que es lo que sorprende al empaquetar

Adentro de un plugin **todo se renombra**: el workflow se registra como `goharness:tasks-fanout` y los
subagentes como `goharness:spec-scout`. El nombre pelado deja de resolver, y eso rompe en dos lugares:
al lanzar el workflow —`planning-tasks` lee la lista de `Available:` del propio error y relanza— y
adentro del script, en las cinco llamadas a subagentes, donde `tasks-fanout.js` descubre el prefijo
del mensaje de error y lo cachea.

El patrón vale para cualquier cosa que empaquetes: **descubrir el prefijo leyéndolo del error, nunca
hardcodearlo.**

---

## Comandos del ejemplo

| Propósito | Comando |
|---|---|
| Verificación de una tarea (pasos 5 y 6) | `npm run check` |
| Higiene, previa al commit (paso 8) | `npm run verify` |
| Tests end to end (paso 7) | `npm run e2e` |
| Dev server | `npm run dev` (puerto 5173) |

`npm run check` encadena `typecheck` → `test`. `npm run verify` agrega `lint` → `build`. **Son dos
ranuras y no una**, y el porqué está en [`CLAUDE.md`](CLAUDE.md): con lint adentro del comando de
corrección, una queja de formato hace fallar la verificación de una tarea por una razón ajena a su
criterio.

**Stack del ejemplo:** Vite · React + TypeScript estricto · Vitest + Testing Library (jsdom) ·
Playwright · Biome · npm.

---

## Estado y límites conocidos

El harness funciona de punta a punta: el ciclo completo corrió tres veces sobre este ejemplo, la
segunda con nueve tareas, 37 tests y seis de seis casos e2e en verde. Esto es lo que todavía no se
sostiene solo, y está acá porque un método que no dice dónde es frágil se lee como si no lo fuera. El
registro completo, con el análisis de cada caso, está en [`lecciones.md`](lecciones.md).

**Resuelto en los lotes 8 a 10 (2026-09-22).** `planning-tasks` nombra `/workflows` al lanzar el plan
y reporta duración y logs al terminar; el modo revisión de `harness-init` lee el contrato entero
buscando afirmaciones falsas —las que ya están y las que él mismo propone— antes de sus cuatro
comprobaciones; la segunda ronda de una tarea espera el sí siempre, en cualquier modo; y la
prohibición de escritura de `dod-checker` y `spec-scout` quedó escrita sobre la ejecución, no sobre
el efecto neto, después de que uno de los dos corriera `git stash` y `git stash pop` verificando una
tarea real.

- **El ruteo del ciclo e2e nunca se ejercitó.** Corrió entero tres veces y las tres en verde, así que
  el camino del fallo —`causa: test` / `codigo` / `spec`— sigue con cero pruebas.
- **No hay evidencia independiente del orden del TDD.** El commit por tarea prueba que la tarea fue
  una unidad de trabajo, no que el test se escribió primero: trae los dos juntos.
- **Las compuertas de aprobación son instrucciones, no mecanismos.** Ningún borde de llamada a
  herramienta significa «el plan fue aprobado» — con el matiz de que el retorno del tool `Workflow`
  sí es un borde exacto, y es lo que aprovecha el arreglo de arriba.

---

## De dónde viene

El harness se construyó en [`rarango10/10X-mis-finanzas`](https://github.com/rarango10/10X-mis-finanzas),
hoy archivado: ahí están los 58 commits de su construcción. Se mudó acá porque una semilla se juzga
por lo que muestra funcionando, y este es el repo donde el método se usó de verdad.

`lecciones.md` viajó con él. Es la parte que no se puede reconstruir leyendo el código: 47 entradas
de qué falló al usarlo, por qué, y qué se cambió — incluidas las que siguen abiertas.

## Licencia

[Apache-2.0](LICENSE). Copyright 2026 Raul Arango — ver [`NOTICE`](NOTICE).
