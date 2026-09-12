# Tasks — <Nombre de la feature>

> Requirements: [`./requirements.md`](./requirements.md) · Design: [`./design.md`](./design.md)
> Estado: pendiente de aprobación | aprobado (AAAA-MM-DD)
> Ids emitidos: hasta T<n>

<La línea "Ids emitidos" es la memoria de qué ids ya se repartieron, **incluidos los de tareas que
después desaparecieron del plan**. La escribe el workflow. Sin ella, una corrida futura calcularía
el próximo id libre mirando solo las tareas vivas, y reutilizaría el número de una tarea eliminada
— justo lo que la regla de numeración prohíbe, porque ese id puede estar citado en un commit o en
la bitácora de otra tarea.>

## Plan

<Una fila por tarea, en el orden en que conviene hacerlas. El orden importa: cada tarea
debería dejar el repo funcionando y con los tests en verde, para poder parar en cualquier
punto sin quedar a mitad de camino.>

| # | Tarea | Cubre | Estado |
|---|-------|-------|--------|
| T1 | <qué se logra, en una línea> | R1.1, R1.2 | pendiente |
| T2 | <...> | — | pendiente |

<Estados: `pendiente` · `en curso` · `hecho`. Esta tabla es el único lugar donde vive el
estado — no lo repitas abajo, o van a terminar contradiciéndose.>

<`hecho` significa **verificado**, no «ya lo programé». Lo escribe quien implementa, y solo con un
`cumple` de `dod-checker` asentado en el Registro de esa tarea; con cualquier otro veredicto la
tarea queda en `en curso`. Esta columna es el único registro durable de qué está terminado, así
que un `hecho` de más es peor que una tarea olvidada: se lee como trabajo cerrado.>

<Columna `Cubre`: los ids de criterio separados por coma. Si la tarea no cubre ninguno, va `—` y
el motivo se explica abajo, en su sección de bitácora. La tabla queda angosta y legible; la
justificación viaja pegada a la tarea.>

**Criterios sin tarea asignada:** <ninguno | R3.2 — y por qué (ej. se cubre en otra feature)>

## Bitácora

<Una sección por tarea. Al planificar solo existen el objetivo, qué cubre y el primer test.
El resto se completa mientras se trabaja: es el registro de lo que realmente pasó.>

### T1 — <título>

**Objetivo:** <qué tiene que ser cierto cuando esta tarea esté terminada>
**Cubre:** R1.1, R1.2
**Primer test (rojo):** <el caso concreto con el que arranca el ciclo TDD>

**Registro** — <completar al terminar; fecha>

- **Verificación:** <`dod-checker` → cumple · R1.1, R1.2 · npm test 14/14 · 2026-09-05. Sin esta
  línea, y sin un `cumple`, la tarea no puede pasar a `hecho` en la tabla de arriba. Si el
  veredicto fue menor, anotá cuál y qué faltó: eso es lo que va a mirar el que retome.>
- **Verificación previa (superada):** <si una tarea se verificó más de una vez —pasa siempre que el
  primer veredicto fue menor que `cumple`, o que el entorno no dejó correr los tests— **la línea
  vigente es la última**, y las anteriores se marcan así, con el prefijo "previa (superada)". No se
  borran: el camino hasta el `cumple` es justo lo que la bitácora existe para guardar. Pero sin
  marcarlas, quien lea de arriba hacia abajo encuentra primero un `no-verificable` sobre una tarea
  que la tabla da por `hecha`, y concluye lo contrario de lo que pasó.>
- <Decisiones que hubo que tomar y que el design no fijaba. Esto es lo más valioso del
  archivo: dentro de un mes nadie se acuerda por qué se eligió así, y el código solo
  muestra el resultado, nunca la alternativa descartada.>
- <Desvíos respecto del design: si la implementación terminó haciendo algo distinto de lo
  diseñado, decilo acá y actualizá `design.md`. Un desvío sin registrar rompe la
  trazabilidad en silencio — el documento sigue describiendo algo que ya no existe.>
- <Lo que apareció y no esperabas: un caso borde nuevo, un supuesto que resultó falso, algo
  que costó el triple de lo previsto.>

### T2 — <título>

<Esta segunda tarea muestra los dos campos opcionales. Ponelos SOLO cuando apliquen: una tarea
normal tiene Objetivo, Cubre y Primer test, y nada más.>

**Objetivo:** <...>
**Cubre:** —
**Por qué no cubre criterios:** <va solo si `Cubre` es `—`. Infraestructura inicial o integración
final: por qué la tarea existe igual. Sin esta línea la tarea se lee como alcance que nadie pidió,
y el chequeo automático de trazabilidad la marca como huérfana.>
**Nota:** <va solo si aplica. Ej. `reemplaza a T4`. Un id nunca se reutiliza ni se renumera —
puede estar citado en un commit o en la bitácora—, así que esta línea es lo único que conecta una
tarea con la que vino a reemplazar, absorber o dividir.>
**Primer test (rojo):** <...>

**Registro** —

- <...>

## Pendientes

<Cosas que salieron mientras se trabajaba y que no son tareas de esta feature: ideas para
después, deuda asumida a propósito, preguntas sin responder. Sirve para no perderlas sin
tener que agrandar el alcance ahora.>

- <...>

<!--
Recordatorios al escribir:

- Una tarea = un ciclo de TDD completo (test que falla → implementar → test que pasa), del
  tamaño que se pueda terminar de una sentada. Si una tarea necesita tres tests para tener
  sentido, probablemente sean tres tareas.
- Toda tarea cubre al menos un criterio. Si no cubrís ninguno, preguntate qué está haciendo
  acá: o falta un criterio en requirements.md, o la tarea es alcance que nadie pidió.
- Al revés también: si un criterio no aparece en ninguna fila, o falta una tarea o hay que
  decir explícitamente por qué queda afuera.
- Nada de código en este archivo. Describe qué hay que lograr, no cómo se escribe.
- `Por qué no cubre criterios:` y `Nota:` son los dos campos que se pierden si no se escriben
  acá. Todo lo demás se puede reconstruir leyendo el archivo; estos dos no, y su ausencia no se
  nota: una tarea sin el primero se relee como huérfana, y una sin el segundo pierde para siempre
  a qué tarea reemplazó.
- La bitácora se completa mientras se trabaja, no al final de todo. Escrita después, se
  convierte en un resumen prolijo que perdió justo lo que valía la pena: las dudas y las
  alternativas que se descartaron en el momento.
-->
