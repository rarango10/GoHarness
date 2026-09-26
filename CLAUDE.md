# La calculadora de ejemplo

> **¿Venís a editar el harness y no la calculadora?** Empezá por
> [`EMPEZAR-ACA.md`](EMPEZAR-ACA.md); el contrato del mantenedor está en
> [`HARNESS.md`](HARNESS.md). Lo que sigue es el contrato de **este proyecto de ejemplo**.

Aplicación web con una calculadora básica: dos casillas de entrada, una de resultado de solo
lectura, botones de operación y uno para limpiar.

## Stack

<!-- ranura: stack -->
| Pieza | Elección |
|---|---|
| Build / dev server | Vite |
| UI | React + TypeScript (modo estricto) |
| Tests unitarios y de componente | Vitest + Testing Library (`@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`), entorno `jsdom` |
| Tests end to end | Playwright |
| Lint y formato | Biome |
| Gestor de paquetes | npm. No uses pnpm ni yarn: el proyecto guarda sus versiones en `package-lock.json`, que es de npm. |

No agregues dependencias fuera de esta lista sin acordarlo antes. En particular: sin librería de
componentes, sin framework de estilos y sin manejador de estado global — alcanza con CSS plano y
`useState`.

## Comandos de verificación

De acá sacan qué correr los skills y subagentes del ciclo.

| Propósito | Comando |
|---|---|
| **Verificación de una tarea** (tipos + tests) | `npm run check` |
| Previo al commit de cada tarea | `npm run verify` |
| **Higiene del cierre de la feature** (paso 8) | `npm run verify && npm run e2e` |
| Chequeo de tipos | `npm run typecheck` (`tsc --noEmit`) |
| Tests unitarios | `npm test` (`vitest run`) |
| Tests unitarios en watch | `npm run test:watch` |
| Lint y formato (solo chequea) | `npm run lint` (`biome check .`) |
| Arreglar formato y lint | `npm run format` (`biome check --write .`) |
| Tests end to end | `npm run e2e` (`playwright test`) |
| Build de producción | `npm run build` |
| Dev server | `npm run dev` (Vite, puerto 5173) |

- `npm run check` encadena `typecheck` → `test`, y nada más.
- `npm run verify` encadena `check` → `lint` → `build`. **No incluye los e2e**, que son más lentos
  y dependen de los navegadores de Playwright.

### Cuál correr en cada paso

<!-- ranura: correccion -->
- **Verificación por tarea (paso 6, `dod-checker`)**: `npm run check`, y solo ese. Es
  deliberado que no corra `lint` ni `build`: una queja de formato de Biome no dice nada sobre si
  la tarea cumple su criterio de aceptación, y hacerla fallar por eso reporta un incumplimiento
  falso. El formato se arregla con `npm run format`, no bloqueando la verificación.

- **Antes del commit de cada tarea**: `npm run verify`. Ahí sí corresponde exigir lint y build en verde.
- **Verificación de la feature (paso 7, `verify-e2e`)**: `npm run e2e`.

<!-- ranura: higiene -->
- **Cierre de la feature (paso 8, `close-feature`)**: `npm run verify && npm run e2e`. Acá sí
  entran lint, build y el e2e, sobre el estado final: el verde del paso 7 vale para el repo como
  estaba entonces, no para lo que se tocó después.

<!-- ranura: auditor -->
- **Auditor de dependencias (paso 8, `close-feature`)**: `npm audit`. Es informativo y no va
  dentro de `npm run verify`: frena solo lo que la feature trajo; lo heredado va al backlog.

### Notas de entorno

- Los specs de Playwright viven en `end2end/` — es la convención que espera el harness, y los
  escribe únicamente el subagente `e2e-test-writer`.
- Si los navegadores de Playwright no están instalados en el entorno, `npx playwright install
  chromium` los instala antes del primer `npm run e2e`.
- La config de Playwright levanta el server por su cuenta (`webServer`), así que no hay que
  tener `npm run dev` corriendo aparte para los e2e.

## Reglas del proyecto

1. **La lógica va separada de la UI.** Las operaciones viven en un módulo propio, como
   funciones puras, sin tocar el DOM ni React. La UI las llama; los casos borde se prueban ahí, no a
   través del componente.
2. **TypeScript estricto, sin `any`.** Si un tipo no cierra, arreglá el modelo — no lo silencies
   con un cast.
3. **Toda entrada del usuario es texto.** Las casillas de números son `<input>`: lo que llega es
   `string` y puede estar vacío, tener espacios o no ser un número. La conversión y su validación
   son parte de la lógica, con su test.
4. **Elementos accesibles y estables para los e2e.** Cada casilla y cada botón necesita un label
   asociado o un `aria-label`. Los tests se enganchan por rol y nombre accesible
   (`getByRole('button', { name: ... })`), no por clases CSS ni por posición en el DOM.
5. **Un test que falla primero.** El paso 5 del ciclo es TDD: escribí el test que falla, hacelo
   pasar, después limpiá.
6. **`npm run check` en verde antes de dar una tarea por terminada**, y sin marcar `hecho` sin el
   veredicto `cumple` de `dod-checker` asentado en el `Registro`. El `npm run verify` completo va
   antes del commit.

## Reglas del harness

Memoria del método, no decisiones de este proyecto — vienen de la plantilla del harness y no se
reabren en cada init. Viven acá porque este archivo es lo único que cualquier skill o subagente
tiene siempre cargado, incluso cuando no hay ningún workflow corriendo.

- Una feature a la vez. No abrir frentes en paralelo.
- TDD: test que falla → implementar → test que pasa.
- No agregar dependencias sin necesidad.
- **El plan lo escribe solo el workflow `tasks-fanout`**, nunca a mano ni con otro subagente: qué
  tareas existen, sus ids, su orden, su título y su `Cubre`. El workflow revisa en paralelo con
  agentes de solo lectura y materializa con un único escritor; planificar por afuera reintroduce
  el segundo escritor que eso elimina.
- **El avance lo escribe quien implementa**, y solo en las regiones de la tarea que está
  haciendo: su celda de `Estado` y su bloque de `Registro` — más el encabezado de aprobación de
  `tasks.md`, una vez, cuando la persona confirma el plan. Son regiones distintas con dueños
  distintos. Lo único prohibido es implementar mientras hay una corrida de `tasks-fanout` en
  vuelo: entre que el scout lee y el escritor guarda, tu `hecho` se pierde.
- **`hecho` significa verificado.** Una tarea pasa a `hecho` solo cuando `dod-checker` devolvió
  `cumple` y su `Registro` deja asentado ese veredicto; cualquier resultado menor la deja en
  `en curso`. Ese es el DoD del proyecto. La columna `Estado` es el registro durable de qué está
  terminado de verdad.
- **La unidad del paso 5 es la tarea, no la fase.** Cada tarea es su propio ciclo de TDD y su
  propia verificación. La compuerta entre tareas se renuncia solo con el vocabulario de
  `implement-task` (`--modo corrido`), nunca por inferencia; que cada tarea se verifique y que un
  veredicto menor corte la corrida no se renuncian en ningún modo. Y la segunda ronda de una misma
  tarea —cuando un veredicto salió menor que `cumple`— también espera el sí, siempre, en cualquier
  modo: no es «la tarea siguiente», así que `--modo corrido` no la alcanza.
- **Un commit por tarea, con su id en el mensaje.**
- **Un veredicto se toma sobre un estado.** El `cumple` de `dod-checker` vale para el repo tal
  como estaba al tomarlo, y puede volverse falso sin que la tarea cambie una línea. Por eso el
  paso 8 corre la higiene sobre el estado final, y un rojo ahí reabre la tarea afectada.
- **El ciclo e2e no repara código.** `e2e-triager` diagnostica y rutea; si la causa es el código,
  la tarea baja a `en curso` y se arregla con el TDD de siempre.
- **Un cambio entra por el documento más alto que toca.** Un criterio mal, un design desactualizado
  o una tarea que falta no se arreglan donde aparecieron: entran por el productor de ese documento
  (`specify` con una enmienda corta, `planning-tasks` para el plan) y bajan en cascada. Todo
  `cumple` apoyado en lo enmendado deja de valer, y su tarea vuelve a `en curso` con el sí. Lo que
  le corresponde a otra feature va a `docs/pendientes.md`.

## Ciclo de trabajo

Este repo usa el ciclo del plugin `goharness`. Cada paso se detiene y espera aprobación
humana.

El ruteo de qué skill produce cada documento lo define el propio plugin — invocá el skill
`goharness` para verlo. Este archivo no duplica la tabla de ruteo.

Todo el papeleo de una feature vive en `docs/AAAA-MM-DD-<feature>/`.

<!-- ranura: backlog -->
**Backlog del proyecto:** `docs/pendientes.md` (se crea la primera vez que hace falta). Es el lugar
de lo que aparece en una feature y le corresponde a otra.
