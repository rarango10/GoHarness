# Tests E2E — Calculadora de suma

> Requirements: [`./requirements.md`](./requirements.md) · Design: [`./design.md`](./design.md) · Tasks: [`./tasks.md`](./tasks.md)
> Estado: aprobado (2026-09-06)
> Scripts: `end2end/2026-09-06-calculadora-suma/`

## Superficie bajo prueba

- **Comando:** `npm run dev` (Vite). `playwright.config.ts` lo levanta solo vía `webServer`
  (`reuseExistingServer` fuera de CI) — no hace falta tenerlo corriendo aparte.
- **URL base:** `http://localhost:5173`
- **Estado de partida:** la app arranca sin datos persistidos (no hay backend ni storage); cada
  caso navega a `/` y encuentra las tres casillas vacías. Los tres casos comparten esta misma
  precondición, no hace falta repetirla caso por caso.

## Casos

### E1 — Calcular, recalcular tras cambiar una entrada, y limpiar

**Tipo:** happy path
**Cubre:** R1.1, R1.2, R1.3, R2.1, R2.6, R3.1, R4.1, R4.2
**Precondiciones:** ninguna además de la de partida (página recién cargada).
**Pasos:**
1. Navegar a `/`. Comprobar que "Primer número", "Segundo número" y "Resultado" están vacías.
2. Escribir "2" en "Primer número" y "3" en "Segundo número".
3. Hacer click en "Calcular".
4. Cambiar "Primer número" a "10".
5. Hacer click en "Calcular" de nuevo.
6. Hacer click en "Limpiar".
**Resultado esperado:** Tras el paso 3, "Resultado" muestra "5". Tras el paso 5, "Resultado"
muestra "13" (reemplaza al "5" anterior, no lo acumula). Tras el paso 6, las tres casillas
quedan vacías.

### E2 — Una casilla vacía se trata como 0 al calcular

**Tipo:** fallo
**Cubre:** R2.2
**Criterio de origen:** "IF una casilla de entrada está vacía (o queda vacía después de recortar
espacios) al presionar 'Calcular', THEN THE SYSTEM SHALL tratar su valor como 0 para el
cálculo."
**Precondiciones:** ninguna además de la de partida.
**Pasos:**
1. Navegar a `/`.
2. Escribir "7" en "Primer número". Dejar "Segundo número" vacía.
3. Hacer click en "Calcular".
**Resultado esperado:** "Resultado" muestra "7" — la casilla vacía se sumó como 0, sin mensaje
de error visible y sin bloquear el cálculo.

### E3 — Texto no numérico se trata como 0 al calcular

**Tipo:** fallo
**Cubre:** R2.3
**Criterio de origen:** "IF una casilla de entrada contiene texto que no es un número válido al
presionar 'Calcular' —incluido un número con coma como separador decimal, por ejemplo
'3,5'— THEN THE SYSTEM SHALL tratar su valor como 0 para el cálculo."
**Precondiciones:** ninguna además de la de partida.
**Pasos:**
1. Navegar a `/`.
2. Escribir "abc" en "Primer número" y "4" en "Segundo número".
3. Hacer click en "Calcular".
**Resultado esperado:** "Resultado" muestra "4" — el texto no numérico se sumó como 0, sin
mensaje de error visible y sin bloquear el cálculo.

## Trazabilidad

| Caso | Criterios | Tareas relacionadas |
|---|---|---|
| E1 | R1.1, R1.2, R1.3, R2.1, R2.6, R3.1, R4.1, R4.2 | T6, T7, T8, T10 |
| E2 | R2.2 | T3 |
| E3 | R2.3 | T3 |

## Pendientes

- ninguno
