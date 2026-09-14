# Tests E2E — Raíz cuadrada y cuadrado

> Requirements: [`./requirements.md`](./requirements.md) · Design: [`./design.md`](./design.md) · Tasks: [`./tasks.md`](./tasks.md)
> Estado: aprobado (2026-09-13)
> Scripts: `end2end/2026-09-13-raiz-y-cuadrado/`

## Superficie bajo prueba

- **Comando:** `npm run dev` (Vite), levantado automáticamente por `playwright.config.ts` vía
  `webServer`.
- **URL base:** `http://localhost:5173`
- **Estado de partida:** la app arranca sin ningún dato persistido — las tres casillas
  ("Primer número", "Segundo número", "Resultado") vacías en cada caso.

## Casos

### E1 — Raíz cuadrada y elevar al cuadrado sobre la primera casilla

**Tipo:** happy path
**Cubre:** R1.1, R1.2, R2.1, R3.1, R4.1, R4.2
**Precondiciones:** app recién cargada, las tres casillas vacías.
**Pasos:**
1. El usuario escribe "9" en "Primer número" y "999" en "Segundo número".
2. El usuario hace click en el botón "Raíz cuadrada".
3. El usuario cambia "Primer número" a "4", sin tocar "Segundo número".
4. El usuario hace click en el botón "Elevar al cuadrado".
**Resultado esperado:** después del paso 2, "Resultado" muestra "3" (el contenido de "Segundo
número" no influyó). Después del paso 4, "Resultado" muestra "16", reemplazando por completo el
"3" anterior.

### E2 — Raíz cuadrada de un número negativo muestra "Error"

**Tipo:** fallo
**Cubre:** R2.2
**Criterio de origen:** "IF el valor interpretado de la primera casilla es negativo al presionar
'Raíz cuadrada', THEN THE SYSTEM SHALL mostrar 'Error' en la casilla de resultado en lugar de un
valor numérico." (R2.2)
**Precondiciones:** app recién cargada, las tres casillas vacías.
**Pasos:**
1. El usuario escribe "-4" en "Primer número".
2. El usuario hace click en el botón "Raíz cuadrada".
**Resultado esperado:** "Resultado" muestra "Error", no un valor numérico.

### E3 — Elevar al cuadrado con la primera casilla vacía trata el valor como 0

**Tipo:** fallo
**Cubre:** R3.2
**Criterio de origen:** "IF la primera casilla está vacía, contiene solo espacios, o contiene
texto que no es un número válido al presionar 'Elevar al cuadrado', THEN THE SYSTEM SHALL tratar
su valor como 0 y mostrar el resultado del cuadrado de 0." (R3.2)
**Precondiciones:** app recién cargada, las tres casillas vacías.
**Pasos:**
1. El usuario hace click en el botón "Elevar al cuadrado" sin escribir nada en "Primer número".
**Resultado esperado:** "Resultado" muestra "0".

## Trazabilidad

| Caso | Criterios | Tareas relacionadas |
|---|---|---|
| E1 | R1.1, R1.2, R2.1, R3.1, R4.1, R4.2 | T4, T5, T6, T7 |
| E2 | R2.2 | T2, T4 |
| E3 | R3.2 | T3, T5 |

## Pendientes

- Ninguno. `requirements.md` tenía más de dos criterios `IF...THEN` disponibles (R2.2, R2.3,
  R3.2); se eligieron R2.2 (caso de error genuino) y R3.2 (caso de entrada inválida tratada como
  0) para no duplicar el mismo tipo de caso entre E2 y E3. R2.3 (la variante equivalente para
  raíz cuadrada) queda cubierta a nivel unitario en `calc.test.ts` y de integración en
  `App.test.tsx` (T4), no repetida acá.
