# <nombre del proyecto: preguntá antes de completar>

<qué es, en una o dos líneas: preguntá antes de completar>

## Stack

- <stack: preguntá antes de completar. El lenguaje, el runner de tests y poco más. Las librerías
  concretas de cada feature se deciden en su `design.md`, no acá.>

## Comandos de verificación

Son **dos ranuras con propósitos distintos**. Conflacionarlas ensucia el veredicto de cada tarea,
que es el registro durable de qué está hecho.

**Corrección** — la del paso 5 al cerrar una tarea, y la que corre `dod-checker` en el paso 6.
Contesta «¿el código cumple los criterios de aceptación?». Typecheck y tests; nada más.

```bash
<comando de typecheck: preguntá antes de completar>
<comando de tests: preguntá antes de completar>
```

**Higiene** — la del paso 8, una vez, sobre el estado final del repo. Contesta otra cosa: «¿el repo
entero está sano con todo esto adentro?». Acá sí van lint, formato, build y el e2e.

```bash
<comando de higiene: preguntá antes de completar. Si el proyecto todavía no tiene lint ni build,
repetí los de corrección y decilo — la ranura existe igual y se llena cuando aparezcan.>
```

**Por qué separadas, en las dos direcciones.** Con lint, build o e2e adentro del comando de
corrección, una queja de formato o un browser que falta hace fallar la verificación de una tarea por
una razón que no tiene nada que ver con su criterio. Y al revés: si la única corrida es la de
corrección, tarea por tarea, **nadie comprueba nunca el conjunto** — que es como un `hecho` puede
volverse mentira sin que la tarea cambie una línea.

## Workflow de trabajo

| # | Producto | Lo produce | Se pide diciendo |
|---|----------|------------|------------------|
| 0 | este archivo | skill `harness-init` | «armemos el contrato», «preparemos el proyecto» |
| 1 | diseño acordado (en el chat, sin archivo) | skill `brainstorming` | «quiero agregar X», «cómo construimos Y» |
| 2 | `requirements.md` | skill `specify`, fase 1 | «escribamos el spec» |
| 3 | `design.md` | skill `specify`, fase 2 | «pasemos al diseño» |
| 4 | `tasks.md` | skill `planning-tasks` → workflow `tasks-fanout` | «planeemos las tareas» |
| 5 | código + tests | skill `implement-task` (TDD) | «implementemos T3» |
| 6 | veredicto por tarea (en el chat) | subagente `dod-checker` | «verificá T3» |
| 7 | `e2e-tests-plan.md` + `e2e-test-report.md` | skill `verify-e2e` | «verifiquemos e2e» |
| 8 | corrida de higiene + commit de cierre | skill `close-feature` | «cerremos la feature» |

Todo el papeleo de una feature vive en `docs/AAAA-MM-DD-<feature>/`, salvo los specs de Playwright,
que van en `end2end/` en la raíz porque son código y los tiene que ver `playwright.config.ts`.

Los pasos 6, 7 y 8 verifican cosas distintas y ninguno reemplaza a otro: `dod-checker` pregunta si
*una tarea* cumple los criterios que dice cubrir; `verify-e2e` pregunta si *la feature entera*
funciona; `close-feature` pregunta si *todos los veredictos siguen siendo ciertos juntos*, sobre el
estado final.

Cada documento tiene **un solo productor**: si una frase te deja dudando entre dos skills, gana esta
tabla. Cada paso espera aprobación humana antes del siguiente, y ningún skill arranca al que le
sigue — solo lo nombra.

## Reglas

- Una feature a la vez. No abrir frentes en paralelo.
- TDD: test que falla → implementar → test que pasa.
- No agregar dependencias sin necesidad.
- **El plan lo escribe solo el workflow `tasks-fanout`**, nunca a mano ni con otro subagente: qué
  tareas existen, sus ids, su orden, su título y su `Cubre`. El workflow revisa en paralelo con
  agentes de solo lectura y materializa con un único escritor; planificar por afuera reintroduce el
  segundo escritor que eso elimina.
- **El avance lo escribe quien implementa**, y solo en las regiones de la tarea que está haciendo:
  su celda de `Estado` y su bloque de `Registro` — más el encabezado de aprobación de `tasks.md`,
  una vez, cuando la persona confirma el plan. Son regiones distintas con dueños distintos. Lo único
  prohibido es implementar mientras hay una corrida de `tasks-fanout` en vuelo: entre que el scout
  lee y el escritor guarda, tu `hecho` se pierde.
- **`hecho` significa verificado.** Una tarea pasa a `hecho` solo cuando `dod-checker` devolvió
  `cumple` y su `Registro` deja asentado ese veredicto; cualquier resultado menor la deja en
  `en curso`. Ese es el **DoD** del proyecto. La columna `Estado` es el registro durable de qué está
  terminado de verdad.
- **La unidad del paso 5 es la tarea, no la fase.** Once tareas son once ciclos. La compuerta entre
  tareas se renuncia solo con el vocabulario de `implement-task` (`--modo corrido`), nunca por
  inferencia; que cada tarea se verifique y que un veredicto menor corte la corrida no se renuncian
  en ningún modo.
- **Un commit por tarea, con su id en el mensaje.**
- **Un veredicto se toma sobre un estado.** El `cumple` de `dod-checker` vale para el repo tal como
  estaba al tomarlo, y puede volverse falso sin que la tarea cambie una línea. Por eso el paso 8
  corre la higiene sobre el estado final, y un rojo ahí reabre la tarea afectada.
- **El ciclo e2e no repara código.** `e2e-triager` diagnostica y rutea; si la causa es el código, la
  tarea baja a `en curso` y se arregla con el TDD de siempre.
- <reglas propias de este proyecto: opcional, y solo las que valen para **toda** feature. Ej. «la
  lógica va en funciones puras, separada de la UI». Si no hay ninguna todavía, borrá esta línea.>

<!--
Qué NO va en este archivo, y por qué importa:

- **Nombres de archivos, módulos o componentes concretos.** Nada de una sección «Estructura» con un
  árbol de archivos. Eso lo decide `specify` en la fase 2, feature por feature, y es justo donde se
  consideran alternativas. Con la estructura ya escrita acá, el `design.md` ratifica en vez de
  diseñar y la regla de un solo productor se rompe antes de que el ciclo arranque.
  El límite es este: una regla que vale para toda feature es del contrato; un árbol de archivos
  concreto no.
- **Requisitos ni criterios de aceptación.** Son de `requirements.md`.
- **El plan de trabajo.** Es de `tasks.md`, y lo escribe un workflow.

Este archivo es el contrato permanente: stack, comandos, reglas que sobreviven a todas las
features. Si algo cambia feature por feature, no va acá.
-->
