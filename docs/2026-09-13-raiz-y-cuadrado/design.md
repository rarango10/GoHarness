# Design — Raíz cuadrada y cuadrado

> Requirements: [`./requirements.md`](./requirements.md)
> Estado: aprobado (2026-09-13)

## Resumen de la solución

Se agregan dos funciones puras a `calc.ts` (`squareRoot`, `square`) con la misma forma que las
operaciones binarias existentes, reutilizando el `parseOperand` que ya interpreta el texto de un
operando. Ninguna función existente se modifica. `squareRoot` sigue el mismo patrón que `divide`:
cuando el operando interpretado es negativo, no hay resultado real, así que devuelve `null` en
vez de `NaN`. `square` siempre devuelve un `number`, porque el cuadrado de cualquier número real
está definido. `App.tsx` agrega una fila nueva de dos botones debajo de la fila de operadores
existente; cada uno llama a su función de `calc.ts` con `opA` únicamente y traduce el resultado
con el mismo helper `showResult` que ya traduce `null` a `'Error'` para "Dividir". Los botones
nuevos reutilizan la clase `op-btn` para heredar la tipografía, el tamaño y el layout de los
botones existentes, y suman un modificador de color propio siguiendo el patrón de `op-add`,
`op-sub`, etc.

## Arquitectura

| Unidad | Responsabilidad | Depende de | Cubre |
|--------|-----------------|------------|-------|
| `calc.ts` (`squareRoot`, `square`) | Interpretar un string con `parseOperand` (ya existente) y devolver su raíz cuadrada o su cuadrado sin ruido de punto flotante; `squareRoot` devuelve `null` cuando el operando interpretado es negativo | `parseOperand` (ya existe en `calc.ts`) | R2.1, R2.2, R2.3, R3.1, R3.2, R4.3 |
| `App.tsx` | Agregar los botones "Raíz cuadrada" y "Elevar al cuadrado" debajo de la fila de operadores existente; al presionar uno, llamar a la función de `calc.ts` correspondiente solo con `opA` y mostrar su resultado con el `showResult` ya existente | `calc.ts` | R1.1, R1.2, R4.1, R4.2 |
| `App.css` (`.op-sqrt`, `.op-square`) | Dar a los dos botones nuevos el mismo tratamiento visual que `.op-add`/`.op-sub`/etc.: borde, color y sombra propios sobre la base `.op-btn` compartida | Clase base `.op-btn` (ya existente) | — (look and feel, sin criterio propio) |

## Flujo de datos

1. El usuario escribe en la casilla "Primer número" (`opA`); el contenido de "Segundo número"
   (`opB`) es irrelevante para esta feature y no se lee.
2. El usuario presiona "Raíz cuadrada" o "Elevar al cuadrado". `App` llama a `squareRoot(opA)` o
   `square(opA)`, respectivamente — ninguna de las dos recibe `opB`.
3. La función interpreta `opA` con `parseOperand` (recorta espacios; vacío o texto no numérico →
   0; admite signo negativo y decimales con punto):
   - `square` calcula `x * x` y redondea con `Number(x.toFixed(10))`, el mismo mecanismo que ya
     usan `add`/`subtract`/`multiply`, y siempre devuelve un `number`.
   - `squareRoot` primero evalúa si `x` es negativo. Si lo es, devuelve `null` sin calcular nada.
     Si no, calcula `Math.sqrt(x)` y lo redondea con el mismo mecanismo.
4. Para "Raíz cuadrada", `App` pasa el resultado a `showResult` (ya existente, agregado en la
   feature de operaciones): si es `number`, lo convierte a string y lo guarda como resultado; si
   es `null`, guarda `'Error'`. Para "Elevar al cuadrado", `App` llama directamente a
   `setResult(String(square(opA)))` sin pasar por `showResult`, porque `square` siempre devuelve
   `number` — no hay ningún caso de `null` que traducir (desvío respecto de la redacción original
   de este documento, detectado y registrado al verificar T7; ver bitácora de T5/T7 en
   `tasks.md`).
5. El nuevo valor reemplaza lo que hubiera en la casilla de resultado, sin importar cuál fue el
   último botón presionado antes.

## Interfaces

```ts
// calc.ts — se agregan junto a add/subtract/multiply/divide existentes, que no se modifican
/** Devuelve null cuando el operando interpretado (parseOperand(a)) es negativo. */
export function squareRoot(a: string): number | null
export function square(a: string): number
```

`App.tsx` no agrega ninguna interfaz pública nueva: reutiliza `showResult(value: number | null)`,
ya existente desde la feature de operaciones binarias.

## Modelos de datos

No hay un modelo de datos nuevo. `squareRoot` reutiliza la misma forma `number | null` que ya
introdujo `divide`; `square` devuelve `number` igual que `add`/`subtract`/`multiply`.

## Manejo de errores

| Situación | Comportamiento | Cubre |
|-----------|----------------|-------|
| El valor interpretado de la primera casilla es negativo al presionar "Raíz cuadrada" | `squareRoot` devuelve `null`; `App` muestra "Error" en la casilla de resultado (vía `showResult`) | R2.2 |
| La primera casilla está vacía, tiene solo espacios, o tiene texto no numérico al presionar "Raíz cuadrada" o "Elevar al cuadrado" | `parseOperand` ya resuelve esos casos como 0 (regla heredada de la suma); `squareRoot(0)` devuelve `0`, `square(0)` devuelve `0` — ninguno de los dos es un caso de error | R2.3, R3.2 |

## Estrategia de testing

| Test | Qué verifica | Cubre |
|------|--------------|-------|
| `squareRoot('9')` → `3` | Raíz cuadrada básica | R2.1 |
| `squareRoot('0')` → `0` | Caso borde: raíz de cero | R2.1 |
| `squareRoot('2')` → `1.4142135624` | Redondeo sin ruido de punto flotante | R4.3 |
| `squareRoot('-4')` → `null` | Operando negativo devuelve `null` | R2.2 |
| `squareRoot('')` → `0` | Operando vacío se toma como 0 | R2.3 |
| `squareRoot('abc')` → `0` | Operando no numérico se toma como 0 | R2.3 |
| `square('4')` → `16` | Cuadrado básico | R3.1 |
| `square('-4')` → `16` | Cuadrado de negativo es positivo | R3.1 |
| `square('0.1')` → `0.01` | Sin ruido de punto flotante visible | R4.3 |
| `square('')` → `0` | Operando vacío se toma como 0 | R3.2 |
| `square('abc')` → `0` | Operando no numérico se toma como 0 | R3.2 |
| Render inicial: existen los botones "Raíz cuadrada" y "Elevar al cuadrado" por nombre accesible | Los dos botones nuevos están | R1.1, R1.2 |
| Escribir "9" en la primera casilla, click en "Raíz cuadrada" → resultado "3" | Wiring de UI de la raíz cuadrada | R2.1 |
| Escribir "-4" en la primera casilla, click en "Raíz cuadrada" → resultado "Error" | `App` traduce `null` a "Error" para este botón (no lo puede probar `calc.test.ts`, que solo ve el `null`) | R2.2 |
| Escribir "4" en la primera casilla, click en "Elevar al cuadrado" → resultado "16" | Wiring de UI del cuadrado | R3.1 |
| Escribir "5" en la primera casilla y "999" en la segunda, click en "Raíz cuadrada" → resultado usa solo la primera ("2.236...") | El contenido de la segunda casilla se ignora | R4.1 |
| Click en "Sumar" (resultado previo distinto), después escribir "9" y click en "Raíz cuadrada" → resultado pasa a "3" | El resultado se reemplaza sin importar cuál fue el cálculo anterior | R4.2 |

Los primeros once casos van en `calc.test.ts`, sin tocar React ni el DOM. Los últimos cinco van en
`App.test.tsx` con Testing Library. El orden de escritura en TDD sigue esta misma tabla, de
arriba hacia abajo.

## Decisiones y alternativas descartadas

| Decisión | Alternativa considerada | Por qué se descartó |
|----------|--------------------------|----------------------|
| Ambos botones operan únicamente sobre `opA` | Operar sobre `opA` y `opB` por separado (cuatro botones) | Acordado en el brainstorming: el pedido es una operación unaria sobre "el número", no duplicar cada botón por casilla. |
| `squareRoot` devuelve `number \| null`; `App` traduce `null` a `'Error'` con el `showResult` ya existente | `squareRoot` devuelve directamente el string `'Error'` | Mezclaría texto de presentación dentro de la lógica pura, violando la regla 1 de `CLAUDE.md`. Además reutiliza sin cambios el mecanismo que ya introdujo `divide`, sin necesidad de un segundo camino de traducción. |
| Dos funciones nuevas y chicas (`squareRoot`, `square`) en vez de generalizar un `calculate` | Una función genérica que reciba el nombre de la operación | Ya descartado en la feature anterior por la misma razón: tocaría funciones existentes y ya verificadas para agregar un parámetro que ninguna tarea necesita, sin ninguna ganancia real. |
| Botones con símbolo visible (`√`, `x²`) y `aria-label` en palabras ("Raíz cuadrada", "Elevar al cuadrado") | Texto del verbo como contenido visible del botón | Mismo patrón ya acordado y en uso para los cuatro botones de operación existentes: símbolo compacto + nombre accesible en palabras, testeable por rol y nombre. |
| Clases CSS nuevas `.op-sqrt`/`.op-square` sobre la base `.op-btn` compartida | Una clase genérica única para todos los botones de operación, sin variantes de color por operación | El patrón existente ya da un color/sombra distintivo por operación (`.op-add`, `.op-sub`, `.op-mul`, `.op-div`); mantenerlo es lo que da el "look and feel acorde" pedido, no una excepción a él. |

## Riesgos y preguntas abiertas

- Ninguno bloqueante. `Math.sqrt(-0)` devuelve `-0`, pero `-0 < 0` es `false` en JavaScript, así
  que un operando que interprete como cero negativo cae en el camino normal (raíz de 0) y no en
  el de error — consistente con que R2.2 habla de negativos, no de signo de cero.
