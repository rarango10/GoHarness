# Tests E2E — <Nombre de la feature>

> Requirements: [`./requirements.md`](./requirements.md) · Design: [`./design.md`](./design.md) · Tasks: [`./tasks.md`](./tasks.md)
> Estado: pendiente de aprobación | aprobado (AAAA-MM-DD)
> Scripts: `end2end/AAAA-MM-DD-<feature>/`

## Superficie bajo prueba

<Cómo se levanta la app y contra qué URL corre Playwright. Sale de design.md y del package.json,
no de un supuesto: `npm run dev` en http://localhost:5173, por ejemplo. Sin esta línea, quien
retome el plan dentro de un mes no sabe contra qué se probó.>

- **Comando:** <cómo se levanta>
- **URL base:** <...>
- **Estado de partida:** <con qué datos arranca cada caso: base vacía, seed fijo, etc. Si los tres
  casos comparten precondición, decilo acá una vez.>

## Casos

<Son exactamente tres: E1 happy path, E2 y E3 de fallo. El número es fijo. Un plan e2e que crece
sin techo termina siendo una segunda suite de tests unitarios: lenta, frágil y que nadie corre.>

<Los pasos se escriben en términos de lo que hace un usuario — «carga un gasto de 100 y elige a
dos participantes» — no de selectores. El selector es una decisión de quien escribe el script, y
un plan lleno de `#input-monto` se rompe con el primer cambio de markup sin que la feature haya
cambiado en nada.>

### E1 — <título del happy path>

**Tipo:** happy path
**Cubre:** R1.1, R2.3
**Precondiciones:** <...>
**Pasos:**
1. <...>
2. <...>
**Resultado esperado:** <qué tiene que ver el usuario en pantalla. Observable, no interno: «la
lista muestra dos saldos, 50 y −50», no «el ledger quedó balanceado».>

### E2 — <título del primer caso de fallo>

**Tipo:** fallo
**Cubre:** R3.4
**Criterio de origen:** <el texto del criterio de requirements.md que describe este rechazo. Va
citado, no parafraseado: es lo que prueba que el caso no fue inventado.>
**Precondiciones:** <...>
**Pasos:**
1. <...>
**Resultado esperado:** <el rechazo tal como lo ve el usuario: qué mensaje, qué queda sin cambiar.>

### E3 — <título del segundo caso de fallo>

<Mismo formato que E2.>

## Trazabilidad

| Caso | Criterios | Tareas relacionadas |
|---|---|---|
| E1 | R1.1, R2.3 | T4, T9 |
| E2 | R3.4 | T12 |
| E3 | <...> | <...> |

<La columna de tareas es lo que le permite al triager rutear un fallo de código a una tarea
concreta de tasks.md. Sin ella, un fallo de E2 no sabe a qué tarea volver.>

## Pendientes

<Huecos que aparecieron al escribir el plan y que decide una persona. El más común: que en
requirements.md no haya dos criterios de error de los que sacar E2 y E3. Eso se dice acá, no se
tapa inventando un caso.>

- <ninguno | ...>

<!--
Recordatorios al escribir:

- Tres casos: uno de happy path y dos de fallo. Ni más ni menos.
- Los dos casos de fallo salen de criterios que ya existen en requirements.md (los `IF ... THEN`),
  citados por id. Un caso de fallo inventado prueba una decisión de producto que nadie tomó: cuando
  falla, no se sabe si el bug está en el código o en el supuesto.
- El happy path, ante la duda, es el que cruza más criterios.
- Nada de código ni de selectores acá. El plan dice qué se prueba; el script dice cómo.
- El resultado esperado es siempre observable por un usuario. Un e2e que afirma sobre estado
  interno es un test de unidad con un browser al lado.
-->
