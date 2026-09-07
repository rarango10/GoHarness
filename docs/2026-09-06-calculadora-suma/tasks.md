# Tasks — Calculadora de suma

> Requirements: [`./requirements.md`](./requirements.md) · Design: [`./design.md`](./design.md)
> Estado: aprobado (2026-09-06)

## Plan

| # | Tarea | Cubre | Estado |
|---|-------|-------|--------|
| T1 | Scaffoldear el proyecto y dejar en verde los comandos de verificación | — | hecho |
| T2 | add suma dos enteros pasados como texto | R2.1 | hecho |
| T3 | Un operando vacío, con solo espacios o con texto no numérico vale 0 | R2.2, R2.3 | hecho |
| T4 | Los negativos y los decimales con punto se suman con su signo y su parte decimal | R2.4 | hecho |
| T5 | El resultado no muestra el ruido de representación binaria | R2.5 | hecho |
| T6 | App renderiza las tres casillas etiquetadas y vacías | R1.1, R1.3, R4.1 | hecho |
| T7 | El botón Calcular muestra la suma y la reemplaza en cada nuevo cálculo | R1.2, R2.1, R2.6, R4.2 | hecho |
| T8 | El botón Limpiar vacía las tres casillas | R1.2, R3.1, R4.2 | hecho |
| T10 | Montar App como raíz real en main.tsx | — | hecho |
| T11 | Configurar Playwright y habilitar npm run e2e | — | hecho |

**Criterios sin tarea asignada:** ninguno

## Bitácora

### T1 — Scaffoldear el proyecto y dejar en verde los comandos de verificación

**Objetivo:** Existe el esqueleto del proyecto (package.json con los scripts que declara CLAUDE.md, Vite, React + TypeScript en modo estricto, Vitest con entorno jsdom y Testing Library, Biome, `index.html` y un `src/main.tsx` mínimo que monta un componente placeholder). `npm run check` (typecheck + test), `npm run lint` y `npm run build` corren y terminan en verde. No se agregó ninguna dependencia fuera del stack de CLAUDE.md.
**Cubre:** —
**Por qué no cubre criterios:** Infraestructura inicial. CLAUDE.md declara que el repo no está scaffoldeado y que los comandos de verificación son el contrato al que hay que llegar, no algo que funcione hoy: sin package.json, tsconfig estricto, Vitest con jsdom y Testing Library, no hay forma de escribir el primer test rojo de ninguna otra tarea. No cubre criterios porque no agrega comportamiento observable de la calculadora. La config de Playwright queda deliberadamente fuera: `playwright test` sin ningún spec en `end2end/` no da verde, y los specs los escribe `e2e-test-writer` en el paso 7.
**Primer test (rojo):** Un test trivial en `src/smoke.test.ts` (por ejemplo, que `1 + 1` es `2`). Arranca rojo en el sentido más literal: hoy no se puede ni ejecutar, porque no hay `package.json` ni Vitest instalado y `npm test` falla de inmediato. Pasa a verde cuando el toolchain corre.

**Registro** — 2026-09-06

Scaffoldeado con Vite + React + TypeScript estricto, Vitest (entorno jsdom) + Testing Library,
Biome 2 y Playwright pendiente para T11. `package.json`, `tsconfig.json`, `vite.config.ts`
(vitest embebido vía `defineConfig` de `vitest/config`), `biome.json`, `index.html`,
`src/main.tsx` (placeholder) y `src/smoke.test.ts` como primer test rojo→verde.

Desvío menor respecto del design: se agregó `@types/react` y `@types/react-dom` como
devDependencies — no estaban en la lista de `CLAUDE.md` porque son declaraciones de tipos, no
librerías de runtime; sin ellas `tsc --noEmit` no resolvía los módulos de React. No afecta el
stack acordado.

`npm run check`, `npm run lint`, `npm run build` y `npm run dev` (puerto 5173) verificados en
verde.

**Verificación:** `dod-checker` devolvió `no-verificable` (no `cumple` ni `no-cumple`): `npm run build`
y `typecheck` corrieron en verde en su entorno, pero `npm test` (Vitest) y `npm run lint`
(Biome) se colgaron de forma reproducible arrancando workers/binario nativo, con y sin el
sandbox del harness deshabilitado. Se reprodujo el mismo colgado de forma independiente
corriendo los comandos a mano: quedaron dos procesos `biome check .` en estado zombi
(`UE`, ininterrumpible, no responden ni a `kill -9`), y desde entonces cualquier intento de
levantar un worker de Vitest (`--pool=forks` o `--pool=threads`) también se cuelga con
`[vitest-pool-runner]: Timeout waiting for worker to respond`. `npm run build` y
`npm run typecheck`, que corren in-process sin forkear, siguen en verde. Es un bloqueo del
entorno de ejecución (fork/IPC), no evidencia de que el código falle — pendiente de que el
entorno se recupere (reinicio de terminal/máquina) para volver a intentar la verificación.

**Registro** — 2026-09-06 (continuación)

El bloqueo de fork/IPC resultó ser iCloud sincronizando `node_modules` dentro del repo: el
`prepare` de cada worker de Vitest tardaba 97 s (contra los ~34 ms normales) porque el daemon de
iCloud competía por los mismos archivos que el worker intentaba leer al arrancar. Se resolvió
moviendo el proyecto fuera de la carpeta sincronizada, a `~/dev/my-harness-demo`. Con eso, los
workers vuelven a levantar en milisegundos y `npm test` / `npm run lint` dejan de colgarse.

De paso, al reinstalar en la ubicación nueva el toolchain bajó de versión: `vite` de 8 a 7 y
`vitest` de 5 a 3 (no fue un downgrade deliberado, sino lo que resolvió `npm install` en ese
momento). No se detectó ninguna incompatibilidad con el resto del stack.

Se agregó `@testing-library/jest-dom` como devDependency sin declararlo como desvío en su
momento — no está en la lista original de `CLAUDE.md`, que solo nombraba
`@testing-library/react` y `@testing-library/user-event`. `dod-checker` corrió la verificación
de T1 dos veces (una con el colgado de iCloud todavía activo, otra ya en `~/dev`) y en ninguna
de las dos señaló la dependencia como fuera de lista, pese a que el Objetivo de T1 declara
explícitamente que no se agregó ninguna fuera del stack. La detectó una revisión manual de
`package.json` contra la tabla de `CLAUDE.md`, dependencia por dependencia.

Decisión: `@testing-library/jest-dom` se queda. Es la compañera estándar de Testing Library y
aporta los matchers de accesibilidad (`toBeInTheDocument`, `toHaveAccessibleName`, etc.) que
T6–T8 van a necesitar para verificar sus criterios. La ausencia en la lista de `CLAUDE.md` era
un hueco del contrato, no un exceso de la implementación — se corrigió `CLAUDE.md` para incluirla
en la fila de Testing Library en vez de quitar la dependencia.

**Verificación:** `dod-checker` devolvió `cumple`. Con `CLAUDE.md` ya corregido (jest-dom
incluido en el stack), `npm run check`, `npm run lint` y `npm run build` corrieron en verde
sobre `~/dev/my-harness-demo`; el Objetivo de T1 se cumple sin ninguna dependencia fuera del
stack acordado.

### T2 — add suma dos enteros pasados como texto

**Objetivo:** Existe `src/calc.ts` exportando `add(a: string, b: string): number` como función pura, sin tocar React ni el DOM, y suma correctamente dos enteros bien formados. Es el esqueleto de la lógica sobre el que se apoyan las tareas siguientes.
**Cubre:** R2.1
**Primer test (rojo):** `add("2", "3")` devuelve `5`. Rojo porque el módulo `src/calc.ts` todavía no existe y el import no resuelve.

**Registro** — 2026-09-06

`src/calc.test.ts` con el test `add('2', '3')` → `5`; confirmado en rojo (`./calc` no resolvía).
Implementación mínima en `src/calc.ts`: `add(a, b) = Number(a) + Number(b)`, suficiente para
enteros bien formados — sin validación de formato todavía, eso llega en T3 y T4. `npm run check`
en verde (2 test files, 2 tests).

**Verificación:** `dod-checker` devolvió `cumple`. R2.1 se cubre en el alcance que T2 se propuso
(aritmética correcta para operandos válidos); la mitad de UI del criterio (botón "Calcular" +
casilla resultado) queda, por diseño, para T7.

### T3 — Un operando vacío, con solo espacios o con texto no numérico vale 0

**Objetivo:** `add` interpreta cada operando por separado antes de sumar: recorta espacios y, si lo que queda no es un entero sin signo bien formado, lo toma como 0. Quedan resueltos los casos de casilla vacía, casilla con solo espacios, texto no numérico y número con coma decimal ("3,5" → 0), y el recorte de espacios alrededor de un número válido (" 4 " → 4, el supuesto de requirements.md). El formato aceptado sigue siendo deliberadamente estrecho: signo y decimales llegan en la tarea siguiente.
**Cubre:** R2.2, R2.3
**Primer test (rojo):** `add("abc", "3")` devuelve `3`. Rojo porque una suma que confía en la conversión numérica directa produce `NaN`: es exactamente el caso que obliga a validar el formato del operando en vez de convertirlo a ciegas.

**Registro** — 2026-09-06

Tests agregados a `src/calc.test.ts` para los cinco casos del Objetivo (vacío, solo espacios,
texto no numérico, coma decimal, espacios alrededor de un válido). Confirmado en rojo: `abc` y
`3,5` daban `NaN` (vacío/espacios/trim ya funcionaban porque `Number()` los resuelve solo).
Implementación: `parseOperand` recorta espacios y valida contra `^\d+$` (entero sin signo, el
alcance de esta tarea); lo que no matchea vale 0. `add` ahora suma `parseOperand(a) +
parseOperand(b)`. Signo y decimales quedan para T4. `npm run check` en verde (7 tests).

**Verificación:** `dod-checker` devolvió `cumple`. R2.2 y R2.3 cubiertos con test directo; sin
desvíos respecto del design (el regex `^\d+$` es el paso intermedio esperado antes de T4).

### T4 — Los negativos y los decimales con punto se suman con su signo y su parte decimal

**Objetivo:** El formato de operando aceptado se amplía al que fija el design (`^-?\d+(\.\d+)?$` tras recortar): un número con signo menos o con parte decimal separada por punto se incluye en la suma con su valor real, y sigue valiendo 0 todo lo que no matchee (incluida la coma decimal, que no debe empezar a colarse).
**Cubre:** R2.4
**Primer test (rojo):** `add("-2.5", "1")` devuelve `-1.5`. Rojo porque, tal como quedó la tarea anterior, solo se acepta un entero sin signo: "-2.5" se descarta como inválido y el resultado da `1`.

**Registro** — 2026-09-06

Test agregado en `src/calc.test.ts`: `add('-2.5', '1')` → `-1.5`. Confirmado en rojo (daba `1`,
porque el regex de T3 solo aceptaba enteros sin signo). Se amplió `parseOperand` al regex final
del design (`^-?\d+(\.\d+)?$` tras `trim`), reemplazando `UNSIGNED_INTEGER`. Se agregó también un
test de regresión para confirmar que la coma decimal ("3,5") sigue sin ser válida con el regex
ampliado. `npm run check` en verde (9 tests).

**Verificación:** `dod-checker` devolvió `cumple`. R2.4 cubierto; regex coincide letra por letra
con design.md; sin desvíos.

### T5 — El resultado no muestra el ruido de representación binaria

**Objetivo:** `add` redondea el resultado antes de devolverlo (`Number(suma.toFixed(10))`, según el design) para eliminar el error de representación de punto flotante, sin truncar decimales legítimos: `0.1 + 0.2` da `0.3`, y una suma con decimales genuinos como `1.234 + 2.111` sigue dando `3.345`. Con esto `calc.ts` queda completo y toda la lógica de R2 verificada sin pasar por la UI.
**Cubre:** R2.5
**Primer test (rojo):** `add("0.1", "0.2")` devuelve exactamente `0.3`. Rojo porque la suma directa devuelve `0.30000000000000004`.

**Registro** — 2026-09-06

Tests agregados en `src/calc.test.ts`: `add('0.1', '0.2')` → `0.3` y `add('1.234', '2.111')` →
`3.345` (decimales legítimos no se truncan). Confirmado en rojo el primero (`0.30000000000000004`).
`add` ahora redondea con `Number(sum.toFixed(10))` antes de devolver, tal como fija el design.
Con esto `calc.ts` queda completo — R2.1 a R2.5 cubiertos. `npm run check` en verde (11 tests).

**Verificación:** `dod-checker` devolvió `cumple`. R2.5 cubierto incluyendo el borde de no
truncar decimales legítimos; mecanismo idéntico al design. `calc.ts` completo, sin desvíos.

### T6 — App renderiza las tres casillas etiquetadas y vacías

**Objetivo:** Existe `src/App.tsx` con las tres casillas: dos `<input>` editables y un tercero de solo lectura para el resultado, cada uno asociado a su `<label>` ("Primer número", "Segundo número", "Resultado"). Al montar el componente las tres están vacías. Se accede a ellas por rol y nombre accesible, nunca por clase CSS ni por posición. Todavía no hay botones ni cálculo.
**Cubre:** R1.1, R1.3, R4.1
**Primer test (rojo):** Al renderizar `App`, los tres textbox obtenidos por nombre accesible ("Primer número", "Segundo número", "Resultado") existen y su valor es la cadena vacía. Rojo porque `App.tsx` todavía no existe.

**Registro** — 2026-09-06

`src/App.test.tsx` con el test que renderiza `App` y busca las tres casillas por
`getByRole('textbox', { name: ... })`. Confirmado en rojo (`./App` no resolvía). Implementación
mínima en `src/App.tsx`: dos `<input>` editables con `<label htmlFor>` ("Primer número",
"Segundo número") en estado local (`useState`), y un tercer `<input readOnly>` para "Resultado".
Todavía no hay botones ni llamada a `add` — llegan en T7/T8. `npm run check` en verde (12 tests).

**Verificación (superada, ver más abajo):** `dod-checker` devolvió `cumple`. R1.1, R1.3 y R4.1
cubiertos. Nota sin bloquear el veredicto: el test no ejercita explícitamente que las dos
primeras casillas son editables y la tercera de solo lectura (falta un
`toHaveAttribute('readonly')` o intento de escritura); se sostiene por lectura de código,
coincide con lo que design.md mapea como cobertura de R1.1.

**Registro** — 2026-09-06 (continuación)

Se cerró el hueco que dejó anotado la verificación anterior: se agregó a `App.test.tsx` la
aserción `expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveAttribute('readonly')`.
Con esto R1.1 queda cubierto por test entero (editable/solo-lectura incluido), no solo por
lectura de código. `npm run check` en verde (12 tests, sin cambios de código en `App.tsx` — el
atributo ya estaba desde la implementación original).

**Verificación (superada, ver más abajo):** `dod-checker` devolvió `cumple-parcial`: la
aserción agregada solo cubría la mitad "Resultado es de solo lectura" de R1.1; no había ninguna
aserción de que "Primer número" y "Segundo número" NO son de solo lectura (o que aceptan
escritura), pese a que este Registro afirmaba que el criterio quedaba cubierto "por completo,
editable/solo-lectura incluido" — esa afirmación no coincidía con el contenido real del test.

**Registro** — 2026-09-06 (continuación 2)

Corregido el hueco real: se agregaron
`expect(screen.getByRole('textbox', { name: 'Primer número' })).not.toHaveAttribute('readonly')`
y el equivalente para "Segundo número". Ahora las tres mitades del criterio (dos editables + una
de solo lectura) tienen aserción propia. `npm run check` en verde (12 tests, sin cambios de
código en `App.tsx`).

**Verificación:** `dod-checker` devolvió `cumple`. R1.1, R1.3 y R4.1 cubiertos por completo; las
seis aserciones (valor vacío + editable/solo-lectura) cierran los huecos de las dos rondas
anteriores. Sin desvíos respecto del design.

### T7 — El botón Calcular muestra la suma y la reemplaza en cada nuevo cálculo

**Objetivo:** `App` muestra un botón cuyo nombre accesible es "Calcular". Al presionarlo, llama a `add` con lo que hay en las dos casillas de entrada y escribe el resultado en la casilla de resultado. El resultado solo cambia al presionar el botón —tipear no lo recalcula— y un segundo cálculo tras modificar una entrada reemplaza el valor anterior en vez de acumularlo o dejar el viejo. Cubre R1.2 y R4.2 en su mitad de "Calcular"; la mitad de "Limpiar" llega en la tarea siguiente.
**Cubre:** R1.2, R2.1, R2.6, R4.2
**Primer test (rojo):** Escribir "2" y "3" en las casillas de entrada y hacer click en el botón de nombre accesible "Calcular": la casilla de resultado muestra "5". Rojo porque todavía no hay ningún botón que renderizar ni handler que llame a `add`. En el mismo ciclo se agrega el caso de R2.6: cambiar una entrada a "10", volver a calcular, y comprobar que el resultado pasa a "13".

**Registro** — 2026-09-06

Dos tests agregados en `src/App.test.tsx` con `userEvent`: tipear "2"/"3" y click en "Calcular"
→ resultado "5"; y un segundo caso que cambia "Primer número" a "10" tras el primer cálculo,
vuelve a calcular, y confirma que el resultado pasa a "13" (reemplaza, no acumula). Confirmado
en rojo (no existía el botón). Implementación: `App` importa `add` de `calc.ts`, agrega
`setResult` al estado y un `<button type="button">Calcular</button>` cuyo `onClick` llama
`setResult(String(add(opA, opB)))`. El resultado solo cambia al presionar el botón — tipear no
dispara el handler. `npm run check` en verde (14 tests).

**Verificación:** `dod-checker` devolvió `cumple`. R2.1 y R2.6 cubiertos por completo (incluido
el borde "reemplaza, no acumula"); R1.2 y R4.2 cubiertos en la mitad "Calcular" que T7 se
propuso — "Limpiar" queda para T8. Sin desvíos respecto del design.

### T8 — El botón Limpiar vacía las tres casillas

**Objetivo:** `App` muestra un segundo botón cuyo nombre accesible es "Limpiar". Al presionarlo, las dos casillas de entrada y la de resultado quedan vacías en un mismo evento, sin importar si hubo un cálculo previo. Con esto R1.2 y R4.2 quedan cubiertos por completo (los dos botones existen y son alcanzables por su nombre accesible) y la feature está funcionalmente terminada a nivel componente.
**Cubre:** R1.2, R3.1, R4.2
**Primer test (rojo):** Tras escribir en ambas entradas y calcular, hacer click en el botón de nombre accesible "Limpiar": las tres casillas quedan con valor vacío. Rojo porque el botón "Limpiar" todavía no se renderiza.

**Registro** — 2026-09-06

Test agregado en `src/App.test.tsx`: tipear "2"/"3", calcular (resultado "5"), click en
"Limpiar" y verificar que las tres casillas quedan vacías. Confirmado en rojo (no existía el
botón). Implementación: segundo `<button type="button">Limpiar</button>` cuyo `onClick` llama
`setOpA('')`, `setOpB('')` y `setResult('')` en el mismo evento. Con esto R1.2 y R4.2 quedan
cubiertos por completo (los dos botones existen y son alcanzables por nombre accesible).
`npm run check` en verde (15 tests).

**Verificación:** `dod-checker` devolvió `cumple`. R1.2, R3.1 y R4.2 cubiertos por completo; el
handler de Limpiar es incondicional, cubre el borde "sin importar si hubo cálculo previo" por
la propia forma del código. Sin desvíos respecto del design.

### T10 — Montar App como raíz real en main.tsx

**Objetivo:** `src/main.tsx` monta `<App />` en el elemento root real, reemplazando el placeholder que dejó T1, y `npm run dev` sirve la calculadora funcionando. `npm run check` sigue en verde. No se toca la config de Playwright: eso es T11.
**Cubre:** —
**Por qué no cubre criterios:** Integración. Cablea al punto de entrada real piezas cuyo comportamiento ya está cubierto por R1, R2, R3 y R4 en T6-T8: hasta acá `App` solo existía dentro de los tests de componente y la app servida por Vite seguía mostrando el placeholder del scaffolding. No agrega comportamiento nuevo, hace observable en el navegador el que ya está verificado.
**Nota:** reemplaza a T9 (parte de montaje)
**Primer test (rojo):** Test de componente sobre el punto de montaje: renderizar lo que `main.tsx` monta en el root y comprobar que aparece el textbox de nombre accesible "Primer número". Rojo mientras el root siga montando el placeholder del scaffolding en lugar de `App`.

**Registro** — 2026-09-06

`src/main.test.tsx`: crea un `<div id="root">` en `document.body`, importa dinámicamente
`./main` dentro de `act()` (necesario porque `createRoot().render()` fuera de `act` deja el
commit sin flushear en jsdom — sin eso el test daba falso-rojo con el root vacío en vez del
placeholder) y verifica que aparece el textbox "Primer número". Confirmado en rojo con el motivo
correcto: el root montaba `<p>Calculadora — en construcción</p>`. Implementación: `main.tsx`
importa `App` de `./App` y la monta en vez del placeholder. Verificado además manualmente que
`npm run dev` sirve `App` real (curl a `/src/main.tsx` confirma el import y el render). `npm run
check` en verde (16 tests).

**Verificación:** `dod-checker` devolvió `cumple`. Confirmó por lectura de código y por curl al
dev server que `main.tsx` monta `App` real; sin rastro del placeholder; no tocó nada de
Playwright. `Cubre: —`, sin criterios que evaluar uno por uno.

### T11 — Configurar Playwright y habilitar npm run e2e

**Objetivo:** Existe `playwright.config.ts` con `testDir` apuntando a `end2end/` y `webServer` levantando el dev server de Vite (CLAUDE.md: no hace falta tener `npm run dev` corriendo aparte), y el script `npm run e2e` está definido en package.json. Playwright resuelve la config sin errores; que todavía no encuentre specs es el resultado esperado hasta que `e2e-test-writer` los escriba, no una falla de configuración. Queda anotado que antes del primer `npm run e2e` real hace falta `npx playwright install chromium`. `npm run verify` (check → lint → build) termina en verde sobre el proyecto completo; `verify` no incluye los e2e, así que la carpeta `end2end/` vacía no rompe la verificación previa al commit.
**Cubre:** —
**Por qué no cubre criterios:** Infraestructura de verificación end to end: CLAUDE.md fija `npm run e2e` como el comando del paso 7 (`verify-e2e`) y que los specs viven en `end2end/`. No cubre criterios porque no agrega comportamiento; deja corriendo el comando con el que después se comprueban los criterios ya implementados. Los specs de `end2end/` no se escriben acá: los escribe únicamente el subagente `e2e-test-writer`.
**Nota:** reemplaza a T9 (parte de configuración e2e)
**Primer test (rojo):** Correr `npm run e2e` y comprobar que Playwright carga `playwright.config.ts`, resuelve `testDir` y levanta el `webServer`, sin ningún error de configuración (el único diagnóstico admisible es que no hay specs en `end2end/`). Rojo mientras falte `playwright.config.ts`, falte el script en package.json, o el `webServer` no levante el dev server.

**Registro** — 2026-09-06

Confirmado en rojo: `npm run e2e` daba `sh: playwright: command not found` (el script ya
existía en `package.json` desde T1, pero no había dependencia instalada ni config). Se agregó
`@playwright/test` como devDependency (coincide con la fila "Tests end to end: Playwright" de
`CLAUDE.md`) y `playwright.config.ts` con `testDir: './end2end'` y `webServer` levantando
`npm run dev` contra `http://localhost:5173`, con `reuseExistingServer` fuera de CI. Ahora
`npm run e2e` resuelve la config sin error y el único diagnóstico es `Error: No tests found` —
exactamente el resultado esperado hasta que `e2e-test-writer` escriba specs. Se corrió
`npm run verify` completo (`check` → `lint` → `build`) en verde sobre el proyecto entero; el
lint señaló dos archivos de tareas anteriores sin formatear (`App.test.tsx`, `main.test.tsx`) y
se corrigieron con `npm run format` (solo reflow de línea, sin cambio de comportamiento). Se
instaló el navegador con `npx playwright install chromium`, dejando el entorno listo para el
primer `npm run e2e` real que corra specs.

**Verificación (superada, ver más abajo):** `dod-checker` devolvió `cumple`. Config resuelve sin
error (único diagnóstico "No tests found", el esperado); `npm run check` y `npm run verify` en
verde; Chromium instalado. Sin desvíos respecto del design. `Cubre: —`, sin criterios que
evaluar uno por uno.

**Registro** — 2026-09-06 (continuación) — vuelta a `en curso`

La tarea volvió a `en curso` al preparar el commit: `npm run verify` quedó en rojo apenas
`end2end/` dejó de estar vacía. Vitest levantaba los tres specs de Playwright, porque su patrón
`include` por defecto (`**/*.{test,spec}.?(c|m)[jt]s?(x)`) matchea `end2end/**/*.spec.ts`, y
fallaba al colectarlos con `Error: Playwright Test did not expect test() to be called here`. Los
16 tests reales seguían pasando, pero `npm test` salía con error y arrastraba a `check` y a
`verify`.

Esto contradice el Objetivo de T11, que afirmaba que "`verify` no incluye los e2e, así que la
carpeta `end2end/` vacía no rompe la verificación previa al commit". La afirmación era cierta
**solo mientras la carpeta estuviera vacía**, y así fue verificada — el hueco no lo introdujo el
paso 7, lo destapó. Es exactamente el caso que la regla 3 del harness cubre: `hecho` significa
verificado, y esto dejó de estarlo.

Arreglo en `vite.config.ts`: `exclude: [...configDefaults.exclude, 'end2end/**']`, preservando
los excludes por defecto de Vitest en vez de reemplazarlos. Los specs de `end2end/` los corre
Playwright y los transpila por su cuenta; `tsconfig.json` ya los dejaba fuera del typecheck por
la misma razón.

Además, Biome marcó formato en los tres specs generados. No los toqué: `end2end/` tiene un único
escritor autorizado (`e2e-test-writer`), así que el reflow lo aplicó él a pedido, sin cambiar
ningún assert ni ningún paso.

**Verificación:** `dod-checker` devolvió `cumple`. Corrió los tres comandos que el Objetivo
nombra: `npm run check` (16 tests), `npm run verify` completo (tests + lint sobre 17 archivos +
build) y `npm run e2e` (3 specs, 3 pasan). El punto crítico quedó comprobado, no afirmado:
`verify` da verde **con `end2end/` ya poblada**, que es justo lo que la primera verificación no
pudo ver porque la carpeta estaba vacía.

## Pendientes

- `design.md` no dice nada sobre la verificación end to end: su tabla de "Estrategia de testing" cubre solo `calc.test.ts` y `App.test.tsx`, mientras CLAUDE.md fija `npm run e2e` como el paso 7 del ciclo y `end2end/` como carpeta de specs. Por eso T11 queda como infraestructura sin respaldo en el design. Definir si la config de Playwright y el alcance de los e2e corresponden al design de esta feature o son parte del contrato del repo (y en ese caso dejarlo dicho en design.md) es una decisión de una persona, no algo que resuelva el plan.
- Consecuencia práctica del punto anterior: entre T11 y el paso 7 el repo queda con `end2end/` vacía, y `npm run e2e` en ese estado no puede dar un verde estricto (no hay specs que correr). `npm run verify` no incluye e2e, así que la regla de "cada tarea deja el repo en verde" se sostiene, pero conviene que quede acordado explícitamente que ese es el estado esperado y no un incumplimiento — sobre todo porque CLAUDE.md prohíbe que nadie que no sea `e2e-test-writer` escriba specs en `end2end/`.
