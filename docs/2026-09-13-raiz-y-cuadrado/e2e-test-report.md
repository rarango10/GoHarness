# Reporte E2E — Raíz cuadrada y cuadrado

> Plan: [`./e2e-tests-plan.md`](./e2e-tests-plan.md) · Specs: `end2end/2026-09-13-raiz-y-cuadrado/`

## Corrida

**Comando:** `npm run e2e` (`playwright test --reporter=list`), ejecutado una sola vez.

**Resultado literal** (9 tests totales en todo `end2end/`, de los cuales 3 pertenecen a este
spec):

```
Running 9 tests using 5 workers

  ✓  1 end2end/2026-09-06-calculadora-suma/e2-casilla-vacia-como-cero.spec.ts:4:1 › E2 (R2.2): una casilla vacía se trata como 0 al calcular (717ms)
  ✓  5 end2end/2026-09-07-calculadora-operaciones/e2-dividir-por-cero-literal.spec.ts:4:1 › E2 (R4.2): dividir por el literal "0" muestra "Error" (791ms)
  ✓  4 end2end/2026-09-06-calculadora-suma/e3-texto-no-numerico-como-cero.spec.ts:4:1 › E3 (R2.3): texto no numérico se trata como 0 al calcular (797ms)
  ✓  3 end2end/2026-09-06-calculadora-suma/e1-calcular-recalcular-limpiar.spec.ts:4:1 › E1 (R1.1, R1.2, R1.3, R2.1, R2.6, R3.1, R4.1, R4.2): calcular, recalcular tras cambiar una entrada, y limpiar (884ms)
  ✓  2 end2end/2026-09-07-calculadora-operaciones/e1-cuatro-operaciones-en-secuencia.spec.ts:4:1 › E1 (R1.1, R1.2, R1.3, R2.1, R3.1, R4.1, R5.1): sumar, restar, multiplicar y dividir en secuencia, reemplazando el resultado en cada paso (920ms)
  ✓  8 end2end/2026-09-13-raiz-y-cuadrado/e2-raiz-de-negativo-muestra-error.spec.ts:4:1 › E2 (R2.2): la raíz cuadrada de un número negativo muestra "Error" (401ms)
  ✓  9 end2end/2026-09-13-raiz-y-cuadrado/e3-cuadrado-con-casilla-vacia-como-cero.spec.ts:4:1 › E3 (R3.2): elevar al cuadrado con la primera casilla vacía trata el valor como 0 (326ms)
  ✓  7 end2end/2026-09-13-raiz-y-cuadrado/e1-raiz-y-cuadrado-sobre-primera-casilla.spec.ts:4:1 › E1 (R1.1, R1.2, R2.1, R3.1, R4.1, R4.2): raíz cuadrada y elevar al cuadrado operan sobre la primera casilla y reemplazan el resultado anterior (446ms)
  ✓  6 end2end/2026-09-07-calculadora-operaciones/e3-divisor-no-numerico.spec.ts:4:1 › E3 (R4.3): un divisor no numérico también muestra "Error" (2.3s)

  9 passed (4.7s)
```

Los `@playwright/test` y el browser Chromium ya estaban instalados en el entorno (`playwright
--version` → 1.63.0, caché de browsers presente); `webServer` levantó Vite sin intervención.
No se reintentó ningún caso.

De los 9 tests que corrió `npm run e2e`, los tres que pertenecen a este spec
(`end2end/2026-09-13-raiz-y-cuadrado/`) son E1, E2 y E3, todos con resultado **pasa**. Los otros
6 pertenecen a specs de features previas (`2026-09-06-calculadora-suma`,
`2026-09-07-calculadora-operaciones`) y no se diagnostican acá.

## Casos

### E1 — Raíz cuadrada y elevar al cuadrado sobre la primera casilla

**Cubre:** R1.1, R1.2, R2.1, R3.1, R4.1, R4.2
**Resultado:** pasa
**Evidencia:** `✓ E1 ... (446ms)` — sin assertion fallida.
**Causa:** n/a (no aplica; el caso pasó).

### E2 — Raíz cuadrada de un número negativo muestra "Error"

**Cubre:** R2.2
**Resultado:** pasa
**Evidencia:** `✓ E2 ... (401ms)` — sin assertion fallida.
**Causa:** n/a.

### E3 — Elevar al cuadrado con la primera casilla vacía trata el valor como 0

**Cubre:** R3.2
**Resultado:** pasa
**Evidencia:** `✓ E3 ... (326ms)` — sin assertion fallida.
**Causa:** n/a.

## Ruteo

Ninguno. Los tres casos del spec pasaron en el único intento corrido; no hay hallazgos que rutear
a `e2e-test-writer`, a TDD ni a `specify`.

## Huecos de spec detectados

Ninguno. El propio plan (`e2e-tests-plan.md`, sección "Pendientes") ya documenta y justifica por
qué R2.3 no tiene un caso e2e dedicado (queda cubierto a nivel unitario/integración en T4); no se
detectó ningún hueco adicional al correr la suite.
