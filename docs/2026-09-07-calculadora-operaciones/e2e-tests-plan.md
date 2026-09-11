# Tests E2E — Calculadora de operaciones

> Requirements: [`./requirements.md`](./requirements.md) · Design: [`./design.md`](./design.md) · Tasks: [`./tasks.md`](./tasks.md)
> Estado: aprobado (2026-09-11)
> Scripts: `end2end/2026-09-07-calculadora-operaciones/`

## Superficie bajo prueba

- **Comando:** `npm run dev` (Vite). `playwright.config.ts` lo levanta solo vía `webServer`
  (`reuseExistingServer` fuera de CI) — no hace falta tenerlo corriendo aparte.
- **URL base:** `http://localhost:5173`
- **Estado de partida:** la app arranca sin datos persistidos; cada caso navega a `/` y encuentra
  las tres casillas vacías y los cuatro botones de operación (Sumar, Restar, Multiplicar,
  Dividir) más "Limpiar". Los tres casos comparten esta misma precondición.

## Casos

### E1 — Sumar, restar, multiplicar y dividir en secuencia, reemplazando el resultado en cada paso

**Tipo:** happy path
**Cubre:** R1.1, R1.2, R1.3, R2.1, R3.1, R4.1, R5.1
**Precondiciones:** ninguna además de la de partida.
**Pasos:**
1. Navegar a `/`. Comprobar que no existe ningún botón de nombre accesible "Calcular", y que sí
   existen "Sumar", "Restar", "Multiplicar" y "Dividir".
2. Escribir "10" en "Primer número" y "4" en "Segundo número".
3. Hacer click en "Sumar".
4. Hacer click en "Restar".
5. Hacer click en "Multiplicar".
6. Hacer click en "Dividir".
7. Hacer click en "Limpiar".
**Resultado esperado:** Tras el paso 3, "Resultado" muestra "14". Tras el paso 4, muestra "6"
(reemplaza al "14" anterior, no lo acumula, y la operación cambió de Sumar a Restar). Tras el
paso 5, muestra "40". Tras el paso 6, muestra "2.5". Tras el paso 7, las tres casillas quedan
vacías.

### E2 — Dividir por el literal "0" muestra "Error"

**Tipo:** fallo
**Cubre:** R4.2
**Criterio de origen:** "IF el divisor interpretado de la segunda casilla es 0 (por ejemplo, la
casilla contiene literalmente '0') al presionar 'Dividir', THEN THE SYSTEM SHALL mostrar 'Error'
en la casilla de resultado en lugar de un valor numérico."
**Precondiciones:** ninguna además de la de partida.
**Pasos:**
1. Navegar a `/`.
2. Escribir "8" en "Primer número" y "0" en "Segundo número".
3. Hacer click en "Dividir".
**Resultado esperado:** "Resultado" muestra "Error", sin ningún valor numérico.

### E3 — Un divisor no numérico también muestra "Error"

**Tipo:** fallo
**Cubre:** R4.3
**Criterio de origen:** "IF la segunda casilla está vacía, contiene solo espacios, o contiene
texto que no es un número válido al presionar 'Dividir', THEN THE SYSTEM SHALL tratar el divisor
como 0 y mostrar 'Error' en la casilla de resultado, con el mismo comportamiento que R4.2."
**Precondiciones:** ninguna además de la de partida.
**Pasos:**
1. Navegar a `/`.
2. Escribir "8" en "Primer número" y "abc" en "Segundo número".
3. Hacer click en "Dividir".
**Resultado esperado:** "Resultado" muestra "Error" — el divisor no numérico se trató como 0,
mismo resultado visible que dividir por el "0" literal de E2.

## Trazabilidad

| Caso | Criterios | Tareas relacionadas |
|---|---|---|
| E1 | R1.1, R1.2, R1.3, R2.1, R3.1, R4.1, R5.1 | T4, T5, T6, T8 |
| E2 | R4.2 | T7 |
| E3 | R4.3 | T7 |

## Pendientes

- Ninguno bloqueante. R5.2 (operando inválido tratado como 0, la regla genérica compartida por
  las cuatro operaciones) no tiene un caso e2e propio: el mismo mecanismo (`parseOperand`) ya lo
  prueba la suite e2e de la feature de suma (E2/E3 de `docs/2026-09-06-calculadora-suma/`), y las
  tres operaciones nuevas lo verifican exhaustivamente a nivel de función pura y de componente
  (T1, T2, T3, T7). Un cuarto caso e2e repitiendo la misma regla sobre una operación distinta no
  agregaría cobertura de riesgo nueva.
