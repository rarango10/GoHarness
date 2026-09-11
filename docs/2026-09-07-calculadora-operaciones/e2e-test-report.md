# Reporte E2E — Calculadora de operaciones

> Spec: [`./e2e-tests-plan.md`](./e2e-tests-plan.md) · Tasks: [`./tasks.md`](./tasks.md)
> Corrida: 2026-09-11

## Corrida

**Comando:** `npm run e2e` (`playwright test`), según la tabla de "Comandos de verificación" de
`CLAUDE.md` (fila "Tests end to end").

**Resultado literal** (stdout completo, sin recortar):

```
> my-harness-demo@0.1.0 e2e
> playwright test

Running 6 tests using 5 workers

  ✓  2 end2end/2026-09-06-calculadora-suma/e2-casilla-vacia-como-cero.spec.ts:4:1 › E2 (R2.2): una casilla vacía se trata como 0 al calcular (441ms)
  ✓  4 end2end/2026-09-06-calculadora-suma/e3-texto-no-numerico-como-cero.spec.ts:4:1 › E3 (R2.3): texto no numérico se trata como 0 al calcular (443ms)
  ✓  1 end2end/2026-09-07-calculadora-operaciones/e2-dividir-por-cero-literal.spec.ts:4:1 › E2 (R4.2): dividir por el literal "0" muestra "Error" (455ms)
  ✓  5 end2end/2026-09-06-calculadora-suma/e1-calcular-recalcular-limpiar.spec.ts:4:1 › E1 (R1.1, R1.2, R1.3, R2.1, R2.6, R3.1, R4.1, R4.2): calcular, recalcular tras cambiar una entrada, y limpiar (524ms)
  ✓  6 end2end/2026-09-07-calculadora-operaciones/e3-divisor-no-numerico.spec.ts:4:1 › E3 (R4.3): un divisor no numérico también muestra "Error" (133ms)
  ✓  3 end2end/2026-09-07-calculadora-operaciones/e1-cuatro-operaciones-en-secuencia.spec.ts:4:1 › E1 (R1.1, R1.2, R1.3, R2.1, R3.1, R4.1, R5.1): sumar, restar, multiplicar y dividir en secuencia, reemplazando el resultado en cada paso (610ms)

  6 passed (1.4s)
```

`playwright test` corre todo `end2end/` (incluye los 3 specs de `2026-09-06-calculadora-suma/`,
ya actualizados a "Sumar" por T9). Los 3 casos propios de este spec —E1, E2 y E3 de
`e2e-tests-plan.md`— están entre los 6, todos en verde. Los otros 3 pertenecen a la feature de
suma y quedan fuera del alcance de este reporte, solo se citan porque forman parte de la corrida
literal.

**Suite:** 6 de 6 casos pasaron (0 fallas). De los 3 casos del plan de esta feature (E1, E2, E3):
3 de 3 pasaron.

## Casos

### E1 — Sumar, restar, multiplicar y dividir en secuencia, reemplazando el resultado en cada paso

- **Resultado:** pasa
- **Causa:** — (no aplica; solo se asigna causa a fallos)
- **Evidencia:** `end2end/2026-09-07-calculadora-operaciones/e1-cuatro-operaciones-en-secuencia.spec.ts:4:1`,
  610ms, sin errores. Verificó ausencia de "Calcular", presencia de los 4 botones, la secuencia
  14 → 6 → 40 → 2.5 y el vaciado tras "Limpiar", tal como describe el plan paso a paso.
- **Criterio:** R1.1, R1.2, R1.3, R2.1, R3.1, R4.1, R5.1
- **Tarea afectada:** null
- **Razón:** el script ejecuta exactamente los 7 pasos del plan y todas las aserciones del
  "Resultado esperado" se cumplieron; no hay hallazgo que reportar.

### E2 — Dividir por el literal "0" muestra "Error"

- **Resultado:** pasa
- **Causa:** —
- **Evidencia:** `end2end/2026-09-07-calculadora-operaciones/e2-dividir-por-cero-literal.spec.ts:4:1`,
  455ms, sin errores. `toHaveValue('Error')` se cumplió tras dividir "8" / "0".
- **Criterio:** R4.2
- **Tarea afectada:** null
- **Razón:** coincide con el criterio de origen citado en el plan; sin hallazgo.

### E3 — Un divisor no numérico también muestra "Error"

- **Resultado:** pasa
- **Causa:** —
- **Evidencia:** `end2end/2026-09-07-calculadora-operaciones/e3-divisor-no-numerico.spec.ts:4:1`,
  133ms, sin errores. `toHaveValue('Error')` se cumplió tras dividir "8" / "abc".
- **Criterio:** R4.3
- **Tarea afectada:** null
- **Razón:** coincide con el criterio de origen citado en el plan; sin hallazgo.

## Ruteo

Ningún caso requiere ruteo: los 3 casos de esta feature pasaron en la única corrida realizada
(sin reintentos, según `retries: 0` de `playwright.config.ts`). No hay hallazgos que devolver a
`e2e-test-writer`, a TDD, ni a `specify`.

## specGaps

Ninguno detectado en esta pasada. El único pendiente que señala el propio
`e2e-tests-plan.md` —R5.2 sin caso e2e propio, cubierto por la suite de suma y por tests de
función pura/componente— ya está declarado y justificado ahí; no es un hueco nuevo.

## Notas fuera de alcance

`git status` muestra dos archivos modificados sin commitear que no pertenecen a esta corrida ni
a esta feature: `docs/2026-09-06-calculadora-suma/requirements.md` y `playwright.config.ts`. No
se tocaron para este diagnóstico; se mencionan solo porque `dod-checker` ya los había señalado en
T5 como preexistentes y ajenos a la tarea en curso, y siguen así.
