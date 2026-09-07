# Design — Calculadora de suma

> Requirements: [`./requirements.md`](./requirements.md)
> Estado: aprobado (2026-09-06)

## Resumen de la solución

Una función pura `add` hace toda la interpretación de las entradas y la suma; el componente
`App` solo guarda lo que el usuario escribió y muestra lo que `add` devuelve. Ningún estado
derivado ni recálculo automático: el resultado se actualiza únicamente cuando se presiona
"Calcular", y se vacía junto con las entradas cuando se presiona "Limpiar".

## Arquitectura

| Unidad | Responsabilidad | Depende de | Cubre |
|--------|-----------------|------------|-------|
| `calc.ts` (`add`) | Interpretar dos strings como números (vacío/inválido → 0, solo punto decimal) y devolver su suma sin ruido de punto flotante | nada | R2.1, R2.2, R2.3, R2.4, R2.5 |
| `App.tsx` | Renderizar las tres casillas y los dos botones; guardar lo que se escribe; llamar a `add` al presionar "Calcular"; vaciar todo al presionar "Limpiar" | `calc.ts` | R1.1, R1.2, R1.3, R2.6, R3.1, R4.1, R4.2 |

En desarrollo la app se sirve con `npm run dev` (Vite, puerto 5173 — ver `CLAUDE.md`). Es contra
ese servidor que corre Playwright: la config del paso T11 lo levanta mediante `webServer` en vez
de depender de un `npm run dev` corriendo aparte, y la fase 1 de `verify-e2e` navega a esa misma
URL para escribir los casos de la feature.

## Flujo de datos

1. El usuario escribe en la casilla A y/o la casilla B. Cada tecleo actualiza el estado de React
   correspondiente (`opA` o `opB`); el resultado mostrado no cambia todavía.
2. El usuario presiona "Calcular". `App` llama a `add(opA, opB)`.
3. `add` recorta espacios de cada entrada, valida el formato de cada una por separado
   (`parseOperand`), sustituye por `0` lo que no matchea, suma, y redondea el resultado para
   eliminar el ruido de punto flotante.
4. `App` guarda el número devuelto (convertido a string) en el estado del resultado, que se
   renderiza en la tercera casilla.
5. Si el usuario presiona "Calcular" de nuevo tras cambiar alguna entrada, se repiten los pasos
   2–4 y el resultado anterior queda reemplazado.
6. Si el usuario presiona "Limpiar" en cualquier momento, `App` vacía `opA`, `opB` y el estado
   del resultado en un mismo evento.

## Interfaces

```ts
// calc.ts
/**
 * Suma dos operandos recibidos como texto. Una entrada vacía o que no matchea el formato
 * numérico esperado (regex `^-?\d+(\.\d+)?$` tras recortar espacios) se toma como 0.
 */
export function add(a: string, b: string): number
```

```ts
// App.tsx no expone una interfaz pública propia: es el componente raíz montado por main.tsx.
```

## Modelos de datos

No hay un modelo de datos propiamente dicho — la feature entera opera sobre tres strings de
estado local (`opA`, `opB`, `result`) y el `number` que devuelve `add`. No se persiste nada.

## Manejo de errores

No hay errores en el sentido de excepciones o mensajes: los dos casos "no deseados" de los
requisitos se resuelven normalizando la entrada, no fallando.

| Situación | Comportamiento | Cubre |
|-----------|----------------|-------|
| Casilla vacía (o vacía tras recortar espacios) al calcular | `parseOperand` la resuelve como `0` | R2.2 |
| Casilla con texto que no matchea `^-?\d+(\.\d+)?$` (letras, coma decimal, notación científica, etc.) | `parseOperand` la resuelve como `0` | R2.3 |
| Suma con error de representación binaria (ej. 0.1 + 0.2) | `add` redondea con `Number(suma.toFixed(10))` antes de devolver, lo que elimina el ruido sin truncar decimales legítimos de menor orden | R2.5 |

## Estrategia de testing

| Test | Qué verifica | Cubre |
|------|--------------|-------|
| `add("2", "3")` → `5` | Suma básica de enteros | R2.1 |
| `add("", "3")` → `3` | Entrada vacía se toma como 0 | R2.2 |
| `add("  ", "3")` → `3` | Entrada de solo espacios se toma como 0 | R2.2 |
| `add("abc", "3")` → `3` | Texto no numérico se toma como 0 | R2.3 |
| `add("3,5", "1")` → `1` | Coma decimal no es válida, se toma como 0 | R2.3 |
| `add("-2.5", "1")` → `-1.5` | Negativos y decimales con punto se suman con signo | R2.4 |
| `add("0.1", "0.2")` → `0.3` | Sin dígitos de error de punto flotante visibles | R2.5 |
| `add(" 4 ", "1")` → `5` | Espacios alrededor de un número válido se recortan | Supuesto (requirements.md) |
| Render inicial: las tres casillas están vacías | Cubre R1.1, R1.3 | R1.1, R1.3 |
| Escribir en A y B, click en "Calcular" → la casilla de resultado muestra la suma | Flujo principal de UI | R2.1, R2.6 |
| Click en "Calcular" dos veces con valores distintos → el resultado se reemplaza | Recálculo tras cambiar una entrada | R2.6 |
| Click en "Limpiar" → las tres casillas quedan vacías | Flujo de limpieza | R3.1 |
| Cada casilla es accesible por su label (`getByRole('textbox', { name: ... })`) y cada botón por su nombre (`getByRole('button', { name: ... })`) | Nombres accesibles | R4.1, R4.2 |

Los primeros siete casos van en `calc.test.ts` y no tocan React ni el DOM. Los últimos cinco van
en `App.test.tsx` con Testing Library. El orden de escritura en TDD sigue esta misma tabla,
de arriba hacia abajo.

## Decisiones y alternativas descartadas

| Decisión | Alternativa considerada | Por qué se descartó |
|----------|--------------------------|----------------------|
| Validar el formato del operando con una regex estricta (`^-?\d+(\.\d+)?$`) | Confiar en `Number(x)` / `parseFloat(x)` y chequear `isNaN` | `Number()` acepta cosas que R2.3 no pide soportar y que romperían el criterio de "solo punto": notación científica (`"1e5"`), hexadecimal (`"0x1"`), `"Infinity"`, o cadenas vacías con espacios que igual parsean como `0` de forma implícita. La regex hace explícito y testeable qué formato se acepta. |
| Redondear con `Number(suma.toFixed(10))` | Redondear siempre a 2 decimales (`toFixed(2)`) | Trunca precisión legítima que no tiene ningún error de punto flotante (ej. `1.234 + 2.111` daría `3.35` en vez de `3.345`). R2.5 pide eliminar el *error de representación*, no limitar cuántos decimales puede tener un resultado válido. |
| Tres `useState` de string en `App` (`opA`, `opB`, `result`) | Un reducer o un objeto de estado único | El estado no tiene transiciones compartidas ni lógica condicional entre campos — es tres valores independientes. Un reducer sería una capa sin beneficio para este tamaño, y `CLAUDE.md` ya descarta manejadores de estado global para esta feature. |
| Casilla de resultado como `<input readOnly>` con su propio `<label>` | Mostrar el resultado en un `<span>` o `<div>` | R4.1 pide que "las tres casillas" tengan etiqueta; un `<input readOnly>` mantiene el mismo patrón de accesibilidad (`label` + `htmlFor`) que las otras dos, en vez de necesitar un mecanismo distinto (`aria-label`, `role="status"`) solo para el resultado. |

## Riesgos y preguntas abiertas

- Ninguno bloqueante. El límite de precisión de `toFixed(10)` es una cota razonable para números
  del tamaño que esta calculadora espera manejar (ver el supuesto de magnitud en
  `requirements.md`); si en el futuro se necesitara soportar números arbitrariamente grandes o
  precisos, este mecanismo habría que revisarlo.
