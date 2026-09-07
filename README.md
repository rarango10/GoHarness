# my-harness-demo

Una calculadora que suma dos números. Tres casillas, dos botones, una función pura de nueve
líneas.

**La calculadora no es el punto.** Es la excusa mínima para mostrar cómo se trabaja con el
harness `harness-spike`: un ciclo de desarrollo asistido de siete pasos, cada uno con un
artefacto, un único productor y una compuerta de aprobación humana. Una feature trivial deja ver
el proceso completo sin que la complejidad del dominio tape el andamiaje.

Este repo es, sobre todo, **el rastro documental de ese ciclo corrido de punta a punta**. El
código de `src/` se lee en cinco minutos; lo que vale la pena leer está en `docs/`.

## El ciclo

Siete pasos. Cada uno produce un artefacto, se detiene y espera aprobación. **Ningún paso
arranca al que le sigue: lo nombra.**

| # | Producto | Lo produce | Se pide diciendo |
|---|----------|------------|------------------|
| 1 | diseño acordado (en el chat) | skill `brainstorming` | «quiero agregar X» |
| 2 | `requirements.md` | skill `specify`, fase 1 | «escribamos el spec» |
| 3 | `design.md` | skill `specify`, fase 2 | «pasemos al diseño» |
| 4 | `tasks.md` | skill `planning-tasks` → workflow `tasks-fanout` | «planeemos las tareas» |
| 5 | código + tests | TDD, a mano | «implementemos T3» |
| 6 | veredicto por tarea (en el chat) | subagente `dod-checker` | «verificá T3» |
| 7 | `e2e-tests-plan.md` + `e2e-test-report.md` | skill `verify-e2e` | «verifiquemos e2e» |

Todo el papeleo de una feature vive en `docs/AAAA-MM-DD-<feature>/`.

### Las tres reglas que lo sostienen

1. **Un solo productor por documento.** `tasks.md` lo escribe únicamente el workflow
   `tasks-fanout`; los specs e2e, únicamente `e2e-test-writer`; el reporte e2e, únicamente
   `e2e-triager`. Nunca a mano, nunca con otro subagente.

2. **El avance lo escribe quien implementa**, y solo en dos regiones de la tarea en curso: su
   celda de `Estado` y su bloque de `Registro`.

3. **`hecho` significa verificado.** Una tarea pasa a `hecho` solo cuando `dod-checker` devolvió
   `cumple` y ese veredicto quedó asentado en su `Registro`. Cualquier resultado menor la deja en
   `en curso`.

## Qué hay para mirar

```
docs/2026-09-06-calculadora-suma/
  requirements.md      # criterios de aceptación en notación EARS (R1.1 … R4.2)
  design.md            # arquitectura, interfaces, estrategia de testing
  tasks.md             # el plan (T1…T11) + la bitácora completa de cada tarea
  e2e-tests-plan.md    # 3 casos: 1 happy path + 2 de fallo, citando criterios
  e2e-test-report.md   # resultado de la corrida real de Playwright

end2end/2026-09-06-calculadora-suma/   # specs escritos por e2e-test-writer
src/                                    # el código: calc.ts (lógica pura) + App.tsx (UI)
CLAUDE.md                               # el contrato del proyecto: stack y comandos
```

**Si vas a leer un solo archivo, que sea [`docs/2026-09-06-calculadora-suma/tasks.md`](docs/2026-09-06-calculadora-suma/tasks.md).**
Su sección `Bitácora` tiene, tarea por tarea: el objetivo, el test que arrancó en rojo, qué se
implementó, y el veredicto de `dod-checker` que la habilitó a pasar a `hecho`.

## Cuatro momentos donde el ciclo hizo su trabajo

Están todos asentados en la bitácora de `tasks.md`. Son la razón por la que el andamiaje existe.

**1. El desvío que el verificador no vio, y la persona sí (T1).**
Se agregó `@testing-library/jest-dom` sin declararla, y el Objetivo de T1 afirmaba
explícitamente que no se había agregado ninguna dependencia fuera del stack. `dod-checker` corrió
dos veces y devolvió `cumple` las dos, sin señalarla. La detectó una revisión manual de
`package.json` contra la tabla de `CLAUDE.md`, línea por línea. La decisión humana no fue quitar
la dependencia sino **ensanchar el contrato**: se corrigió `CLAUDE.md` para incluirla, porque el
hueco estaba en la lista, no en la implementación. La compuerta humana no es ceremonia.

**2. La corrección a medias que sí se detectó (T6).**
Una verificación anterior anotó que faltaba probar que la casilla "Resultado" fuera de solo
lectura. Se agregó esa aserción… y solo esa. `dod-checker` devolvió `cumple-parcial`: la mitad
"las otras dos son editables" seguía sin test, pese a que el Registro afirmaba que el criterio
quedaba cubierto por completo. El veredicto anterior quedó **marcado como superado, no borrado**
— la bitácora conserva el error y su corrección, que es lo que la vuelve útil.

**3. El veredicto que no es ni sí ni no (T1).**
`dod-checker` tiene cuatro veredictos: `cumple`, `cumple-parcial`, `no-cumple` y
**`no-verificable`**. Ese cuarto salvó una verificación: los workers de Vitest se colgaban de
forma reproducible y el checker se negó a declarar un fallo del código cuando lo que fallaba era
el entorno. La causa resultó ser iCloud sincronizando `node_modules` (el `prepare` de cada worker
tardaba 97 s contra los ~34 ms normales); se resolvió moviendo el repo fuera de la carpeta
sincronizada. Un verificador binario habría reportado un incumplimiento falso.

**4. Una tarea `hecho` que dejó de estarlo (T11, en el commit).**
El Objetivo de T11 afirmaba que `npm run verify` quedaba en verde porque "la carpeta `end2end/`
vacía no rompe la verificación previa al commit". `dod-checker` lo verificó y era cierto —
**mientras la carpeta estuviera vacía**. Cuando el paso 7 la pobló con tres specs, Vitest empezó
a levantarlos (su `include` por defecto matchea `*.spec.ts`) y `verify` se puso en rojo. El paso 7
no introdujo el hueco: lo destapó. T11 volvió a `en curso`, se arregló con un `exclude` en
`vite.config.ts`, y recién volvió a `hecho` con un `cumple` nuevo — esta vez comprobado con la
carpeta ya poblada. De yapa, el arreglo tocó dos regiones con dueños distintos: la config es mía,
pero el reformateo de los specs lo tuvo que hacer `e2e-test-writer`, su único escritor
autorizado.

## Comandos

| Propósito | Comando |
|---|---|
| Verificación de una tarea (paso 6) | `npm run check` |
| Higiene previa al commit | `npm run verify` |
| Tests end to end (paso 7) | `npm run e2e` |
| Dev server | `npm run dev` (puerto 5173) |

`npm run check` encadena `typecheck` → `test`. `npm run verify` agrega `lint` → `build`, y **no**
incluye los e2e. El detalle completo, incluido por qué el paso 6 deliberadamente no corre `lint`,
está en [`CLAUDE.md`](CLAUDE.md).

## Stack

Vite · React + TypeScript (estricto) · Vitest + Testing Library (jsdom) · Playwright · Biome ·
npm. Sin librería de componentes, sin framework de estilos, sin estado global: para tres casillas
y dos botones alcanza con CSS plano y `useState`.

## Estado

Las 9 tareas del plan en `hecho`, cada una con veredicto `cumple` asentado. Los 3 casos e2e en
verde contra la app real. El ciclo llegó hasta el paso 7 completo.
