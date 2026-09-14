# Tasks — Raíz cuadrada y elevar al cuadrado

> Requirements: [`./requirements.md`](./requirements.md) · Design: [`./design.md`](./design.md)
> Estado: aprobado (2026-09-13)
> Ids emitidos: hasta T8

## Plan

| # | Tarea | Cubre | Estado |
|---|-------|-------|--------|
| T1 | Agrega squareRoot en calc.ts para operandos no negativos | — | hecho |
| T2 | squareRoot devuelve null cuando el operando interpretado es negativo | — | hecho |
| T3 | Agrega square en calc.ts | — | hecho |
| T4 | Engancha el botón "Raíz cuadrada" en la UI | R2.1, R2.2, R2.3 | hecho |
| T5 | Engancha el botón "Elevar al cuadrado" y cierra la fila de operaciones unarias | R1.1, R1.2, R3.1, R3.2 | pendiente |
| T6 | Los dos botones unarios ignoran la segunda casilla | R4.1 | pendiente |
| T7 | El resultado de una operación unaria reemplaza al cálculo anterior | R4.2 | pendiente |
| T8 | El resultado mostrado no tiene dígitos de error de punto flotante | R4.3 | pendiente |

**Criterios sin tarea asignada:** ninguno

## Bitácora

### T1 — Agrega squareRoot en calc.ts para operandos no negativos

**Objetivo:** calc.ts exporta `squareRoot(a: string): number | null` y, para operandos interpretados mayores o iguales a 0, devuelve `Math.sqrt` del valor redondeado con el mismo mecanismo `Number(x.toFixed(10))` que ya usan add/subtract/multiply; el vacío, los espacios y el texto no numérico se interpretan como 0 vía el `parseOperand` ya existente. Ninguna función existente se modifica y `npm run check` queda en verde.
**Cubre:** —
**Por qué no cubre criterios:** Es la función pura sin la interfaz: R2.1, R2.3 y R4.3 hablan de mostrar el resultado en la casilla de resultado, y eso solo se puede comprobar de punta a punta con el botón. Habilita R2.1 y R2.3 (que cierran en la tarea del botón "Raíz cuadrada") y R4.3 (que cierra en la última tarea, sobre la UI).
**Primer test (rojo):** En `src/calc.test.ts`: `squareRoot('9')` devuelve 3 (falla porque `squareRoot` todavía no existe). En el mismo ciclo se agregan `squareRoot('0')` → 0, `squareRoot('2')` → 1.4142135624, `squareRoot('')` → 0 y `squareRoot('abc')` → 0.

**Registro** — 2026-09-13

- **Rojo:** `TypeError: (0 , squareRoot) is not a function` al correr `squareRoot('9')` — la función todavía no existía en `calc.ts`.
- Implementado `squareRoot(a: string): number` en `src/calc.ts`, reutilizando `parseOperand` y el mismo redondeo `Number(x.toFixed(10))` que ya usan `add`/`subtract`/`multiply`/`divide`.
- Se dejó el retorno como `number` (no `number | null`) a propósito: el camino negativo (`null`) es el objetivo de T2, que todavía no corrió. La firma final `number | null` que cita el design en el `Objetivo` describe el estado después de T2, no un incumplimiento de esta tarea.
- **Verificación:** `dod-checker` → **cumple**. `npm run check` en verde (42 tests, incluidos los 5 nuevos de `squareRoot`). Sin desvíos de diseño ni huecos de spec. `Cubre: —` (no aplica ningún criterio R).

### T2 — squareRoot devuelve null cuando el operando interpretado es negativo

**Objetivo:** `squareRoot` devuelve `null`, sin calcular nada, cuando `parseOperand` del argumento da un número negativo, siguiendo el mismo patrón que `divide` con divisor 0. El caso de cero negativo sigue el camino normal (raíz de 0), como anota el design. `npm run check` en verde.
**Cubre:** —
**Por qué no cubre criterios:** Implementa la mitad lógica de R2.2, pero el criterio pide mostrar "Error" en la casilla de resultado: calc.test.ts solo puede ver el null. R2.2 cierra en la tarea que engancha el botón "Raíz cuadrada" con showResult.
**Primer test (rojo):** En `src/calc.test.ts`: `squareRoot('-4')` devuelve `null` (falla porque hoy devolvería NaN).

**Registro** — 2026-09-13

- **Rojo:** `AssertionError: expected NaN to be null` al correr `squareRoot('-4')` — `Math.sqrt` de un negativo daba `NaN`, no `null`.
- Agregado el chequeo `if (value < 0) return null` antes de calcular la raíz, cambiando la firma a `number | null`.
- Caso borde verificado: `-0 < 0` es `false` en JS, así que un cero negativo sigue el camino normal (raíz de 0), consistente con lo anotado en `design.md`.
- **Verificación:** `dod-checker` → **cumple**. `npm run check` en verde (43 tests). Sin desvíos de diseño ni huecos de spec. `Cubre: —` (habilita R2.2, que cierra en T4).

### T3 — Agrega square en calc.ts

**Objetivo:** calc.ts exporta `square(a: string): number`, que interpreta el operando con `parseOperand` y devuelve `x * x` redondeado con `Number(x.toFixed(10))`; el cuadrado de un negativo es positivo y el vacío o no numérico da 0. Ninguna función existente se modifica y `npm run check` queda en verde.
**Cubre:** —
**Por qué no cubre criterios:** Función pura sin interfaz: R3.1, R3.2 y R4.3 hablan del valor mostrado en la casilla de resultado. Habilita R3.1 y R3.2 (cierran en la tarea del botón "Elevar al cuadrado") y R4.3 (cierra en la última tarea).
**Primer test (rojo):** En `src/calc.test.ts`: `square('4')` devuelve 16 (falla porque `square` no existe). En el mismo ciclo se agregan `square('-4')` → 16, `square('0.1')` → 0.01, `square('')` → 0 y `square('abc')` → 0.

**Registro** — 2026-09-13

- **Rojo:** `TypeError: (0 , square) is not a function` al correr `square('4')` — la función todavía no existía en `calc.ts`.
- Implementado `square(a: string): number` en `src/calc.ts`, reutilizando `parseOperand` y el mismo redondeo `Number(x.toFixed(10))` que las demás operaciones.
- **Verificación:** `dod-checker` → **cumple**. `npm run check` en verde (48 tests, incluidos los 5 nuevos de `square`). Sin desvíos de diseño ni huecos de spec. `Cubre: —` (habilita R3.1, R3.2, R4.3, que cierran en T5/T8).

### T4 — Engancha el botón "Raíz cuadrada" en la UI

**Objetivo:** App.tsx muestra un botón nuevo con nombre accesible "Raíz cuadrada" (símbolo √ visible, `aria-label` en palabras) en una fila nueva debajo de la fila de operadores existente y arriba de "Limpiar", con la clase `op-btn` más el modificador `.op-sqrt` definido en App.css. Al presionarlo, llama a `squareRoot` solo con `opA` y pasa el resultado a `showResult`: número válido muestra su raíz, operando negativo muestra "Error", y casilla vacía o con texto no numérico muestra 0. `npm run check` en verde.
**Cubre:** R2.1, R2.2, R2.3
**Primer test (rojo):** En `src/App.test.tsx`: escribir "9" en "Primer número", hacer click en `getByRole('button', { name: 'Raíz cuadrada' })` y esperar que la casilla "Resultado" muestre "3" (falla porque el botón no existe). En el mismo ciclo: "-4" → "Error" y primera casilla vacía → "0".

**Registro** — 2026-09-13

- **Rojo:** `TestingLibraryElementError: Unable to find an accessible element with the role "button" and name "Raíz cuadrada"` al hacer click en el botón — todavía no existía en `App.tsx`.
- Agregada una fila nueva `.unary-operators-row` en `App.tsx` con el botón √, `aria-label="Raíz cuadrada"`, clase `op-btn op-sqrt`, debajo de `.operators-row` y arriba de "Limpiar". `onClick` llama a `showResult(squareRoot(opA))`, reutilizando el `showResult` ya existente (que traduce `null` a "Error").
- Agregadas `.unary-operators-row` y `.op-sqrt` en `App.css`, siguiendo el mismo patrón que `.operators-row`/`.op-add` etc. (color y sombra propios sobre la base `.op-btn`).
- **Verificación:** `dod-checker` → **cumple**. R2.1, R2.2, R2.3 todos `cumple`. `npm run check` en verde (51 tests). Sin desvíos de diseño ni huecos de spec.

### T5 — Engancha el botón "Elevar al cuadrado" y cierra la fila de operaciones unarias

**Objetivo:** App.tsx muestra el segundo botón nuevo con nombre accesible "Elevar al cuadrado" (símbolo x² visible) junto al de raíz, en la misma fila debajo de los cuatro operadores y arriba de "Limpiar", con clase `op-btn` más `.op-square` en App.css. Al presionarlo, llama a `square` solo con `opA` y muestra el resultado: valor positivo, valor negativo (cuadrado positivo) y casilla vacía o no numérica (0). Con esta tarea los dos botones nuevos existen, están ubicados donde pide R1.1 y exponen los nombres accesibles de R1.2. `npm run check` en verde.
**Cubre:** R1.1, R1.2, R3.1, R3.2
**Primer test (rojo):** En `src/App.test.tsx`: escribir "4" en "Primer número", click en `getByRole('button', { name: 'Elevar al cuadrado' })` y esperar "16" en "Resultado" (falla porque el botón no existe). En el mismo ciclo: "-4" → "16", vacío → "0", y un test de ubicación que verifica que los dos botones nuevos están después de "Dividir" y antes de "Limpiar" en el orden del DOM.

**Registro** — <completar al implementar; fecha>

### T6 — Los dos botones unarios ignoran la segunda casilla

**Objetivo:** Queda probado en App.test.tsx que el contenido de "Segundo número" no influye en el resultado de "Raíz cuadrada" ni de "Elevar al cuadrado": con la segunda casilla llena de cualquier cosa, el resultado es el mismo que con la segunda casilla vacía. Si el test descubre que algún handler lee `opB`, se corrige. `npm run check` en verde.
**Cubre:** R4.1
**Primer test (rojo):** En `src/App.test.tsx`: escribir "5" en "Primer número" y "999" en "Segundo número", click en "Raíz cuadrada" y esperar el mismo valor que da la raíz de 5 sola ("2.2360679775"); análogo para "Elevar al cuadrado" con resultado "25".

**Registro** — <completar al implementar; fecha>

### T7 — El resultado de una operación unaria reemplaza al cálculo anterior

**Objetivo:** Queda probado que, tras un cálculo previo con otro botón, presionar "Raíz cuadrada" o "Elevar al cuadrado" reemplaza por completo el contenido de la casilla de resultado, sin concatenar ni conservar el valor anterior. `npm run check` en verde.
**Cubre:** R4.2
**Primer test (rojo):** En `src/App.test.tsx`: escribir "7" y "5", click en "Sumar" (resultado "12"), después cambiar la primera casilla a "9" y hacer click en "Raíz cuadrada"; el resultado debe ser exactamente "3".

**Registro** — <completar al implementar; fecha>

### T8 — El resultado mostrado no tiene dígitos de error de punto flotante

**Objetivo:** Queda probado a nivel UI que los casos con ruido binario clásico se muestran matemáticamente correctos en la casilla de resultado para ambos botones nuevos, cerrando R4.3 de punta a punta sobre el redondeo ya implementado en calc.ts. `npm run check` en verde.
**Cubre:** R4.3
**Primer test (rojo):** En `src/App.test.tsx`: escribir "0.1" en "Primer número", click en "Elevar al cuadrado" y esperar "0.01" (no "0.010000000000000002"); en el mismo ciclo, "2" + "Raíz cuadrada" muestra "1.4142135624".

**Registro** — <completar al implementar; fecha>

## Pendientes

- Ninguno detectado en esta pasada.
