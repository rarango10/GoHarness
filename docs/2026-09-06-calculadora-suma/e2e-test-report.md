# Reporte E2E — Calculadora de suma

> Plan: [`./e2e-tests-plan.md`](./e2e-tests-plan.md) · Tasks: [`./tasks.md`](./tasks.md)
> Specs: `end2end/2026-09-06-calculadora-suma/`
> Fecha de la corrida: 2026-09-06

## Corrida

**Comando:** `npm run e2e` (`playwright test`), según la tabla "Comandos de verificación" de
`CLAUDE.md` para el paso `verify-e2e`.

**Precondición verificada antes de correr:** los navegadores de Playwright ya estaban instalados
(`~/Library/Caches/ms-playwright` contiene `chromium-1243`, `chromium_headless_shell-1243` y
`ffmpeg-1011`; `npx playwright --version` responde `Version 1.63.0`). No hizo falta instalar nada.

**Salida literal:**

```
> my-harness-demo@0.0.0 e2e
> playwright test

Running 3 tests using 3 workers

  ✓  2 end2end/2026-09-06-calculadora-suma/e2-casilla-vacia-como-cero.spec.ts:4:1 › E2 (R2.2): una casilla vacía se trata como 0 al calcular (451ms)
  ✓  1 end2end/2026-09-06-calculadora-suma/e3-texto-no-numerico-como-cero.spec.ts:4:1 › E3 (R2.3): texto no numérico se trata como 0 al calcular (455ms)
  ✓  3 end2end/2026-09-06-calculadora-suma/e1-calcular-recalcular-limpiar.spec.ts:4:1 › E1 (R1.1, R1.2, R1.3, R2.1, R2.6, R3.1, R4.1, R4.2): calcular, recalcular tras cambiar una entrada, y limpiar (511ms)

  3 passed (2.3s)
```

**Resumen:** 3 casos, 3 corridos, 3 pasan (E1, E2, E3). Ninguno falló. La corrida se hizo una sola
vez, sin reintentos.

## Casos

### E1 — Calcular, recalcular tras cambiar una entrada, y limpiar

- **Resultado:** pasa
- **Evidencia:** `✓ E1 (...): calcular, recalcular tras cambiar una entrada, y limpiar (511ms)`
- **Causa:** n/a
- **Criterio:** R1.1, R1.2, R1.3, R2.1, R2.6, R3.1, R4.1, R4.2
- **Tarea afectada:** n/a

### E2 — Una casilla vacía se trata como 0 al calcular

- **Resultado:** pasa
- **Evidencia:** `✓ E2 (R2.2): una casilla vacía se trata como 0 al calcular (451ms)`
- **Causa:** n/a
- **Criterio:** R2.2
- **Tarea afectada:** n/a

### E3 — Texto no numérico se trata como 0 al calcular

- **Resultado:** pasa
- **Evidencia:** `✓ E3 (R2.3): texto no numérico se trata como 0 al calcular (455ms)`
- **Causa:** n/a
- **Criterio:** R2.3
- **Tarea afectada:** n/a

## Verificación cruzada contra el plan (informativa, sin ejecutar nada más)

Para dejar constancia de por qué el veredicto es "pasa" y no solo "el runner dijo verde", se
revisó cada script contra el paso a paso del plan:

- **E1** (`e1-calcular-recalcular-limpiar.spec.ts`): sigue los seis pasos del plan en el mismo
  orden (vacío inicial → "2"/"3" → Calcular → "5" → cambiar a "10" → Calcular → "13" → Limpiar →
  vacío), enganchado por rol y nombre accesible (`getByRole('textbox'/'button', { name: ... })`),
  coherente con `App.tsx` (dos inputs editables + uno `readOnly`, dos botones `Calcular`/
  `Limpiar`).
- **E2** (`e2-casilla-vacia-como-cero.spec.ts`): reproduce exactamente el paso a paso de R2.2
  (dejar "Segundo número" vacía, "7" en la primera, Calcular → "7"), y `calc.ts`
  (`parseOperand` sobre `""` no matchea `SIGNED_DECIMAL` → 0) confirma que el comportamiento es
  el esperado, no casualidad del entero.
- **E3** (`e3-texto-no-numerico-como-cero.spec.ts`): reproduce el paso a paso de R2.3 ("abc"/"4"
  → Calcular → "4"); `parseOperand` sobre `"abc"` tampoco matchea el regex → 0, consistente con
  el criterio de origen.

No se encontró ningún desvío entre plan, spec y código que amerite marcar un caso como fallo
oculto por un assert débil.

## Ruteo

No hay fallos: no hay casos para `aFase2`, `aTDD`, `aSpecify` ni `aPersona`.

## Huecos de spec detectados

Ninguno nuevo en esta corrida. Se deja constancia de que `tasks.md` ya trae anotado en su sección
"Pendientes" un hueco preexistente (design.md no cubre la infraestructura de Playwright/`end2end/`
de T11), que no es un hallazgo de esta corrida y no requiere acción de este reporte.
