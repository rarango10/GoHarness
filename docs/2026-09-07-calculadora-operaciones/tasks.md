# Tasks — Calculadora de operaciones

> Requirements: [`./requirements.md`](./requirements.md) · Design: [`./design.md`](./design.md)
> Estado: aprobado (2026-09-07)
> Ids emitidos: hasta T9

## Plan

| # | Tarea | Cubre | Estado |
|---|-------|-------|--------|
| T1 | Función pura subtract en calc.ts, con las reglas de operando ya vigentes | — | hecho |
| T2 | Función pura multiply en calc.ts, con las mismas reglas de operando | — | hecho |
| T3 | Función pura divide en calc.ts, que devuelve null cuando el divisor interpretado es 0 | R5.2, R5.3, R5.4 | hecho |
| T4 | Botón "Restar" en la UI, que muestra la diferencia en la casilla de resultado | R2.1 | pendiente |
| T5 | Botón "Multiplicar" en la UI, que muestra el producto en la casilla de resultado | R3.1 | pendiente |
| T6 | Botón "Dividir" en la UI, que muestra el cociente cuando el divisor no es 0 | R4.1 | pendiente |
| T7 | "Dividir" muestra el texto "Error" cuando el divisor interpretado es 0 | R4.2, R4.3 | pendiente |
| T8 | Reemplazar "Calcular" por el botón "Sumar", completando los cuatro botones de operación | R1.1, R1.2, R1.3, R5.1 | pendiente |
| T9 | Actualizar los specs e2e de la feature de suma para engancharse a "Sumar" | — | pendiente |

**Criterios sin tarea asignada:** ninguno

## Bitácora

### T1 — Función pura subtract en calc.ts, con las reglas de operando ya vigentes

**Objetivo:** calc.ts exporta subtract(a: string, b: string): number, que interpreta ambos operandos con el parseOperand existente y devuelve la diferencia redondeada con Number(x.toFixed(10)), igual que add. add no se modifica. npm run check en verde.
**Cubre:** —
**Por qué no cubre criterios:** Habilita R2.1, que se cierra en la tarea que agrega el botón 'Restar' cableado a la casilla de resultado (T4 de este plan): sola, la función no es observable al presionar ningún botón. También aporta los casos de subtract a las reglas compartidas R5.2 y R5.3, que se cierran en la tarea de divide, cuando las tres operaciones nuevas comparten parseOperand y el redondeo.
**Primer test (rojo):** En calc.test.ts: subtract('5', '3') devuelve 2 — rojo porque subtract todavía no existe. Después se suman en el mismo ciclo subtract('3', '5') → -2 y subtract('abc', '5') → -5.

**Registro** — 2026-09-10

Confirmado en rojo: `TypeError: (0 , subtract) is not a function` en los tres tests nuevos de
`calc.test.ts` (`subtract('5','3')`, `subtract('3','5')`, `subtract('abc','5')`), porque
`subtract` todavía no existía. Implementación mínima en `calc.ts`: `subtract(a, b) =
parseOperand(a) - parseOperand(b)`, redondeado con `Number(difference.toFixed(10))` — mismo
mecanismo que `add`, que no se tocó. `npm run check` en verde (19 tests). Sin desvíos respecto
del design.

**Verificación:** `dod-checker` devolvió `cumple`. `Cubre: —` es correcto: T1 habilita R2.1 (se
cierra en T4) y aporta casos a R5.2/R5.3 (se cierran en T3), por eso no hay ningún criterio que
esta tarea deba cerrar por sí sola.

### T2 — Función pura multiply en calc.ts, con las mismas reglas de operando

**Objetivo:** calc.ts exporta multiply(a: string, b: string): number, con la misma forma que add y subtract: parseOperand para cada operando y redondeo con Number(x.toFixed(10)). npm run check en verde.
**Cubre:** —
**Por qué no cubre criterios:** Habilita R3.1, que se cierra en la tarea que agrega el botón 'Multiplicar' cableado (T5 de este plan). Aporta además los casos de multiply a R5.2 y R5.4, que se cierran en la tarea de divide, donde las reglas compartidas quedan completas para las tres operaciones nuevas.
**Primer test (rojo):** En calc.test.ts: multiply('4', '3') devuelve 12 — rojo porque multiply todavía no existe. En el mismo ciclo se agregan multiply('', '5') → 0 y multiply('0.1', '3') → 0.3.

**Registro** — 2026-09-10

Confirmado en rojo: `TypeError: (0 , multiply) is not a function` en los tres tests nuevos.
Implementación mínima en `calc.ts`: `multiply(a, b) = parseOperand(a) * parseOperand(b)`,
redondeado con `Number(product.toFixed(10))` — mismo mecanismo que `add`/`subtract`. `npm run
check` en verde (22 tests). Sin desvíos respecto del design.

**Verificación:** `dod-checker` devolvió `cumple`. `Cubre: —` es correcto: T2 habilita R3.1 (se
cierra en T5) y aporta casos a R5.2/R5.4 (se cierran en T3).

### T3 — Función pura divide en calc.ts, que devuelve null cuando el divisor interpretado es 0

**Objetivo:** calc.ts exporta divide(a: string, b: string): number | null: evalúa primero el divisor con parseOperand y, si vale 0, devuelve null sin dividir; si no, devuelve el cociente redondeado con Number(x.toFixed(10)). Con esta tarea las tres operaciones nuevas comparten el mismo parseOperand y el mismo redondeo, así que la suite de calc.test.ts prueba completas las tres reglas compartidas sobre resta, multiplicación y división: operando vacío/con espacios/no numérico tratado como 0 (R5.2), signo y decimales con punto respetados (R5.3) y resultado sin dígitos de error de punto flotante (R5.4). La UI las muestra tal cual (String(value)), sin poder alterarlas. El null habilita además R4.1, R4.2 y R4.3, que se cierran en las tareas de UI de la división. npm run check en verde.
**Cubre:** R5.2, R5.3, R5.4
**Primer test (rojo):** En calc.test.ts: divide('10', '2') devuelve 5 — rojo porque divide todavía no existe. En el mismo ciclo se agregan divide('-9', '3') → -3, divide('5', '0') → null, divide('5', '') → null y divide('5', 'abc') → null.

**Registro** — 2026-09-10

Confirmado en rojo: `TypeError: (0 , divide) is not a function` en los cinco tests nuevos.
Implementación en `calc.ts`: `divide(a, b)` evalúa primero `parseOperand(b)`; si es 0 devuelve
`null` sin dividir, si no calcula `parseOperand(a) / divisor` redondeado con
`Number(quotient.toFixed(10))` — mismo mecanismo que las otras tres operaciones. `npm run check`
en verde (27 tests). Sin desvíos respecto del design.

**Verificación:** `dod-checker` devolvió `cumple`. R5.2, R5.3 y R5.4 cerrados: la cobertura queda
repartida entre subtract/multiply/divide tal como lo planeó `design.md` (cada regla compartida
tiene su evidencia en al menos una de las tres operaciones nuevas, no necesariamente en las
tres).

### T4 — Botón "Restar" en la UI, que muestra la diferencia en la casilla de resultado

**Objetivo:** App.tsx muestra un botón nuevo con símbolo visible '−' y aria-label 'Restar' que, al presionarlo, llama a subtract(opA, opB) y escribe el resultado en la casilla de resultado. El botón 'Calcular' y 'Limpiar' siguen funcionando igual que hoy, así que la app queda usable y npm run check y npm run e2e siguen en verde.
**Cubre:** R2.1
**Primer test (rojo):** En App.test.tsx: escribir '2' en la primera casilla y '3' en la segunda, hacer click en getByRole('button', { name: 'Restar' }) y esperar que la casilla de resultado muestre '-1' — rojo porque el botón 'Restar' todavía no existe.

**Registro** — <completar al implementar; fecha>

### T5 — Botón "Multiplicar" en la UI, que muestra el producto en la casilla de resultado

**Objetivo:** App.tsx muestra un botón con símbolo visible '×' y aria-label 'Multiplicar' que, al presionarlo, llama a multiply(opA, opB) y escribe el resultado en la casilla de resultado, reemplazando lo que hubiera. El resto de la UI queda sin cambios y npm run check en verde.
**Cubre:** R3.1
**Primer test (rojo):** En App.test.tsx: escribir '4' y '3', hacer click en getByRole('button', { name: 'Multiplicar' }) y esperar que la casilla de resultado muestre '12' — rojo porque el botón todavía no existe.

**Registro** — <completar al implementar; fecha>

### T6 — Botón "Dividir" en la UI, que muestra el cociente cuando el divisor no es 0

**Objetivo:** App.tsx muestra un botón con símbolo visible '÷' y aria-label 'Dividir' que, al presionarlo, llama a divide(opA, opB) y escribe el cociente en la casilla de resultado cuando la función devuelve un número. El caso null (divisor 0) todavía no tiene su tratamiento propio y se cierra en la tarea siguiente. npm run check en verde.
**Cubre:** R4.1
**Primer test (rojo):** En App.test.tsx: escribir '10' y '2', hacer click en getByRole('button', { name: 'Dividir' }) y esperar que la casilla de resultado muestre '5' — rojo porque el botón todavía no existe.

**Registro** — <completar al implementar; fecha>

### T7 — "Dividir" muestra el texto "Error" cuando el divisor interpretado es 0

**Objetivo:** App.tsx traduce el null que devuelve divide al string 'Error' en la casilla de resultado, mediante el helper showResult(value) que decide entre 'Error' y String(value). Como parseOperand ya interpreta vacío, solo espacios y texto no numérico como 0, el mismo camino cubre el '0' literal (R4.2) y el divisor vacío o no numérico (R4.3), sin ningún chequeo extra. La palabra 'Error' vive solo en App.tsx, nunca en calc.ts. npm run check en verde.
**Cubre:** R4.2, R4.3
**Primer test (rojo):** En App.test.tsx: escribir '10' y '0', hacer click en 'Dividir' y esperar que la casilla de resultado muestre 'Error' — rojo porque hoy el null se convertiría a la cadena 'null'.

**Registro** — <completar al implementar; fecha>

### T8 — Reemplazar "Calcular" por el botón "Sumar", completando los cuatro botones de operación

**Objetivo:** App.tsx ya no tiene ningún control con nombre accesible 'Calcular': en su lugar hay un botón con símbolo visible '+' y aria-label 'Sumar' cableado a add. Con eso quedan los cuatro botones de operación (Sumar, Restar, Multiplicar, Dividir) con esos nombres accesibles, y cualquiera de ellos reemplaza el resultado anterior sin acumularlo, incluso al pasar de una operación a otra. Se actualizan los tests existentes de App.test.tsx que hoy se enganchan a 'Calcular'. 'Limpiar' no cambia. npm run check en verde.
**Cubre:** R1.1, R1.2, R1.3, R5.1
**Primer test (rojo):** En App.test.tsx: en el render inicial, queryByRole('button', { name: 'Calcular' }) es null y existen los cuatro botones por nombre accesible 'Sumar', 'Restar', 'Multiplicar' y 'Dividir' — rojo porque hoy el botón 'Calcular' existe y 'Sumar' no. En el mismo ciclo, el caso de R5.1: con '2' y '3', click en 'Sumar' muestra '5' y después click en 'Restar' cambia el resultado a '-1' (también rojo, porque 'Sumar' no existe).

**Registro** — <completar al implementar; fecha>

### T9 — Actualizar los specs e2e de la feature de suma para engancharse a "Sumar"

**Objetivo:** Los tres specs de end2end/2026-09-06-calculadora-suma/ (calcular/recalcular/limpiar, casilla vacía como 0, texto no numérico como 0) verifican el mismo comportamiento de suma a través del botón 'Sumar' en lugar de 'Calcular'. npm run e2e vuelve a pasar los 3 specs, y npm run verify sigue en verde.
**Cubre:** —
**Por qué no cubre criterios:** Tarea de integración: no cubre un criterio nuevo, repara la consecuencia de R1.3. Los tres specs de end2end/2026-09-06-calculadora-suma/ buscan el botón 'Calcular', que la tarea anterior elimina, así que npm run e2e queda en rojo hasta que se los actualice. Sin esta tarea el plan termina con una suite rota que ninguna otra tarea reclama. Los specs los reescribe el subagente e2e-test-writer, que es el único dueño de end2end/ según CLAUDE.md; acá no se cambia ningún comportamiento ni se agregan escenarios nuevos.
**Primer test (rojo):** Correr npm run e2e y ver los 3 specs de end2end/2026-09-06-calculadora-suma/ fallando por no encontrar el botón con nombre accesible 'Calcular' — ese es el rojo de partida; el verde es la misma corrida pasando contra 'Sumar'.

**Registro** — <completar al implementar; fecha>

## Pendientes

- Ninguno detectado en esta pasada.
