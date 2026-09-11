# Design — Calculadora de operaciones

> Requirements: [`./requirements.md`](./requirements.md)
> Estado: aprobado (2026-09-07)

## Resumen de la solución

Se agregan tres funciones puras a `calc.ts` (`subtract`, `multiply`, `divide`) con la misma forma
que `add`, reutilizando el `parseOperand` que ya interpreta cada operando de texto. `add` no se
toca. La única que difiere en su firma es `divide`: cuando el divisor interpretado vale 0, no
puede devolver un número válido, así que devuelve `null` en vez de `Infinity` o `NaN`. `App.tsx`
reemplaza el botón único "Calcular" por cuatro botones de operación; cada uno llama a su función
de `calc.ts` y traduce el resultado a lo que se muestra en la casilla: un número se convierte a
string, y `null` se muestra como el texto "Error". La lógica sigue sin saber nada de esa palabra
—la decide la UI—, igual que la lógica no sabe de ningún otro texto de pantalla.

## Arquitectura

| Unidad | Responsabilidad | Depende de | Cubre |
|--------|-----------------|------------|-------|
| `calc.ts` (`subtract`, `multiply`, `divide`) | Interpretar dos strings con `parseOperand` (ya existente) y devolver su resta/producto/cociente sin ruido de punto flotante; `divide` devuelve `null` cuando el divisor interpretado es 0 | `parseOperand` (ya existe en `calc.ts`) | R2.1, R3.1, R4.1, R4.2, R4.3, R5.2, R5.3, R5.4 |
| `App.tsx` | Reemplazar el botón "Calcular" por cuatro botones de operación; al presionar uno, llamar a la función de `calc.ts` correspondiente y mostrar su resultado (`'Error'` cuando la función devuelve `null`), reemplazando cualquier resultado previo | `calc.ts` | R1.1, R1.2, R1.3, R5.1 |

## Flujo de datos

1. El usuario escribe en las casillas A y B (sin cambios respecto de la feature de suma).
2. El usuario presiona uno de los cuatro botones de operación. `App` llama a la función de
   `calc.ts` correspondiente (`add`, `subtract`, `multiply` o `divide`) con `opA` y `opB`.
3. La función interpreta cada operando con `parseOperand` (recorta espacios; vacío o texto no
   numérico → 0; admite signo negativo y decimales con punto) y aplica la operación:
   - `add`, `subtract` y `multiply` siempre devuelven un `number`, redondeado con
     `Number(x.toFixed(10))` para eliminar ruido de punto flotante — el mismo mecanismo que ya
     usa `add`.
   - `divide` primero evalúa el divisor interpretado. Si es 0, devuelve `null` sin dividir. Si no,
     calcula el cociente y lo redondea con el mismo mecanismo.
4. `App` recibe el resultado. Si es `number`, lo convierte a string y lo guarda en el estado del
   resultado. Si es `null`, guarda el string `'Error'` directamente — la conversión ocurre en
   `App`, no en `calc.ts`.
5. El nuevo valor reemplaza lo que hubiera en la casilla de resultado, sin importar si el cálculo
   anterior fue de la misma operación o de otra.
6. "Limpiar" sigue vaciando `opA`, `opB` y el resultado en un mismo evento, sin cambios.

## Interfaces

```ts
// calc.ts — se agregan junto al add existente, que no se modifica
export function subtract(a: string, b: string): number
export function multiply(a: string, b: string): number
/** Devuelve null cuando el divisor interpretado (parseOperand(b)) es 0. */
export function divide(a: string, b: string): number | null
```

```ts
// App.tsx no expone una interfaz pública propia: sigue siendo el componente raíz.
// Internamente, un único helper traduce el resultado de cualquier operación a lo que se muestra:
function showResult(value: number | null): void // setResult(value === null ? 'Error' : String(value))
```

## Modelos de datos

No hay un modelo de datos propiamente dicho. Se agrega una única forma nueva: el resultado de
`divide` es `number | null`, en vez del `number` que devuelven las otras tres operaciones. Es la
única función cuyo llamador (`App`) tiene que manejar dos casos en vez de uno.

## Manejo de errores

| Situación | Comportamiento | Cubre |
|-----------|----------------|-------|
| Divisor interpretado es 0 porque la segunda casilla contiene literalmente "0" | `divide` devuelve `null`; `App` muestra "Error" en la casilla de resultado | R4.2 |
| Divisor interpretado es 0 porque la segunda casilla está vacía, tiene solo espacios, o tiene texto no numérico | `parseOperand` ya resuelve esos casos como 0 (regla heredada de la suma); `divide` los trata igual que un "0" literal y devuelve `null` | R4.3 |

## Estrategia de testing

| Test | Qué verifica | Cubre |
|------|--------------|-------|
| `subtract('5', '3')` → `2` | Resta básica | R2.1 |
| `subtract('3', '5')` → `-2` | Resultado negativo se calcula y devuelve con signo | R2.1, R5.3 |
| `subtract('abc', '5')` → `-5` | Operando inválido se toma como 0 | R5.2 |
| `multiply('4', '3')` → `12` | Multiplicación básica | R3.1 |
| `multiply('', '5')` → `0` | Operando vacío se toma como 0 | R5.2 |
| `multiply('0.1', '3')` → `0.3` | Sin ruido de punto flotante visible | R5.4 |
| `divide('10', '2')` → `5` | División básica | R4.1 |
| `divide('-9', '3')` → `-3` | Signo se preserva en la división | R4.1, R5.3 |
| `divide('5', '0')` → `null` | Divisor literal 0 | R4.2 |
| `divide('5', '')` → `null` | Divisor vacío se trata como 0 | R4.3 |
| `divide('5', 'abc')` → `null` | Divisor no numérico se trata como 0 | R4.3 |
| Render inicial: no existe ningún botón con nombre accesible "Calcular" | El botón viejo ya no está | R1.3 |
| Render inicial: existen los botones "Sumar", "Restar", "Multiplicar", "Dividir" por nombre accesible | Los cuatro botones nuevos están | R1.1, R1.2 |
| Escribir "2"/"3", click en "Restar" → resultado "-1" | Wiring de UI de la resta | R2.1 |
| Escribir "4"/"3", click en "Multiplicar" → resultado "12" | Wiring de UI de la multiplicación | R3.1 |
| Escribir "10"/"2", click en "Dividir" → resultado "5" | Wiring de UI de la división | R4.1 |
| Escribir "10"/"0", click en "Dividir" → resultado "Error" | `App` traduce `null` a "Error" (esto no lo puede probar `calc.test.ts`, que solo ve el `null`) | R4.2 |
| Click en "Sumar" (resultado "5"), después click en "Restar" con las mismas casillas → resultado pasa a "-1" | El resultado se reemplaza al cambiar de operación, no solo al repetir la misma | R5.1 |

Los primeros once casos van en `calc.test.ts`, sin tocar React ni el DOM. Los últimos siete van en
`App.test.tsx` con Testing Library. El orden de escritura en TDD sigue esta misma tabla, de
arriba hacia abajo — igual que en la feature de suma.

## Decisiones y alternativas descartadas

| Decisión | Alternativa considerada | Por qué se descartó |
|----------|--------------------------|----------------------|
| Cuatro botones de operación, cada uno calcula al toque, reemplazando "Calcular" | Un selector de operación (radio/dropdown) más un botón "Calcular" único | Agrega un estado nuevo ("operación seleccionada") y una interacción extra sin necesidad: el pedido es tener las cuatro operaciones a un toque, no elegir y confirmar. Acordado en el brainstorming. |
| Tres funciones puras nuevas (`subtract`, `multiply`, `divide`) con la misma forma que `add`, sin tocarlo | Una función genérica `calculate(a, b, operador)` | `add` ya está implementada y verificada por T2–T5 de la feature anterior; una función genérica tocaría ese punto de entrada para agregarle un parámetro que ninguna tarea existente necesita, arriesgando algo que ya está `hecho` sin ninguna ganancia real (cuatro funciones chicas no son más difíciles de mantener que una con un `switch`). |
| `divide` devuelve `number \| null`; `App` traduce `null` a `'Error'` | `divide` devuelve directamente el string `'Error'` cuando el divisor es 0 | Mezclaría texto de presentación dentro de la lógica pura, violando la regla 1 de `CLAUDE.md` (la lógica no toca la UI). Con `null`, `calc.ts` solo describe "no hay resultado numérico posible"; qué texto mostrar es decisión de `App.tsx`. |
| `divide` devuelve `number \| null` | Lanzar una excepción cuando el divisor es 0 | Dividir por cero con una entrada de usuario no es un error de programación — es un caso esperado que hay que manejar en cada click. Una excepción obligaría a un `try/catch` en el handler del botón por el mismo motivo que ya resuelve un valor de retorno explícito, sin ganar nada. |
| Botones con símbolo visible (`+`, `−`, `×`, `÷`) y `aria-label` en palabras ("Sumar", "Restar", "Multiplicar", "Dividir") | Botones con el verbo como texto visible | Acordado en el brainstorming: el símbolo es más compacto visualmente y el nombre accesible en palabras mantiene el mismo patrón de testing por rol y nombre (`getByRole('button', { name: 'Sumar' })`) que ya usan "Calcular"/"Limpiar". |

## Riesgos y preguntas abiertas

- Ninguno bloqueante. `divisor === 0` en JavaScript también es verdadero para `-0` (`-0 === 0` es
  `true`), así que un divisor que interprete como cero negativo cae en el mismo camino de
  `'Error'` sin necesitar ningún chequeo adicional.
- Un divisor distinto de cero pero muy cercano (por ejemplo, `"0.0000000001"`) no dispara
  "Error": produce un cociente grande pero válido, que es el comportamiento esperado — R4.2/R4.3
  hablan del divisor exactamente 0, no de una magnitud mínima.
