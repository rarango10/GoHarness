# my-harness-demo

Aplicación web con una calculadora básica. La primera versión tiene tres casillas —dos para
escribir los números a sumar y una tercera con el resultado—, un botón para ejecutar la
operación y otro para limpiar los valores.

## Estado del proyecto

**El proyecto todavía no está scaffoldeado.** No existe `package.json` ni ninguna dependencia
instalada. Los comandos de verificación de más abajo son el contrato al que tiene que llegar el
repo, no algo que funcione hoy: la primera tarea de implementación es dejarlos corriendo en
verde sobre un esqueleto vacío. Hasta que eso pase, cualquier subagente que intente verificar va
a encontrar el repo sin scaffolding — eso es un resultado válido que hay que reportar, no un
fallo que haya que rodear inventando otros comandos.

## Stack

| Pieza | Elección |
|---|---|
| Build / dev server | Vite |
| UI | React + TypeScript (modo estricto) |
| Tests unitarios y de componente | Vitest + Testing Library (`@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`), entorno `jsdom` |
| Tests end to end | Playwright |
| Lint y formato | Biome |
| Gestor de paquetes | npm (hay npm 10.9.4 y Node 22.22.0; **no** hay pnpm ni yarn instalados) |

No agregues dependencias fuera de esta lista sin acordarlo antes. En particular: sin librería de
componentes, sin framework de estilos y sin manejador de estado global — para tres casillas y
dos botones alcanza con CSS plano y `useState`.

## Comandos de verificación

De acá sacan qué correr `spec-scout`, `dod-checker`, `task-reviewer` y `e2e-triager`.

| Propósito | Comando |
|---|---|
| **Verificación de una tarea** (tipos + tests) | `npm run check` |
| Higiene previa al commit | `npm run verify` |
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

- **Verificación por tarea (paso 6, `dod-checker`)**: `npm run check`, y solo ese. Es
  deliberado que no corra `lint` ni `build`: una queja de formato de Biome no dice nada sobre si
  la tarea cumple su criterio de aceptación, y hacerla fallar por eso reporta un incumplimiento
  falso. El formato se arregla con `npm run format`, no bloqueando la verificación.
- **Antes de un commit**: `npm run verify`. Ahí sí corresponde exigir lint y build en verde.
- **Verificación de la feature (paso 7, `verify-e2e`)**: `npm run e2e`.

### Notas de entorno

- Los specs de Playwright viven en `end2end/` — es la convención que espera el harness, y los
  escribe únicamente el subagente `e2e-test-writer`.
- Los navegadores de Playwright no están instalados. Antes del primer `npm run e2e` hace falta
  `npx playwright install chromium`.
- La config de Playwright levanta el server por su cuenta (`webServer`), así que no hay que
  tener `npm run dev` corriendo aparte para los e2e.

## Reglas del proyecto

1. **La lógica va separada de la UI.** Las operaciones viven en `src/calc.ts` como funciones
   puras, sin tocar el DOM ni React. La UI las llama; los casos borde se prueban ahí, no a
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

## Ciclo de trabajo

Este repo usa el ciclo del plugin `harness-spike`: brainstorming → `requirements.md` →
`design.md` → `tasks.md` → implementación con TDD → verificación por tarea (`dod-checker`) →
verificación end to end (`verify-e2e`). Cada paso se detiene y espera aprobación humana.

El ruteo de qué skill produce cada documento lo define el propio plugin — invocá el skill
`harness-spike` para verlo. Este archivo no lo duplica: solo declara el stack y los comandos.

Todo el papeleo de una feature vive en `docs/AAAA-MM-DD-<feature>/`.
