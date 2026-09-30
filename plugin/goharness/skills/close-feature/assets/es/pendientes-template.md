# Pendientes del proyecto

<El backlog de lo que apareció en una feature y le corresponde a otra: código de una feature ya
cerrada, algo transversal (toolchain, runner, dependencias), o algo que la persona decidió dejar
afuera. Si es de la feature en curso, no va acá: va a su `tasks.md` y se resuelve allá.>

<Quién escribe qué:
- `close-feature` agrega entradas nuevas al cerrar cada feature (mueve las líneas `[backlog]` de su
  `Pendientes`), y pasa a `resuelto` las que esa feature tomó.
- `specify` pasa a `en <feature>` las que una feature nueva toma, al aprobar su `requirements.md`.
- `descartado` lo decide la persona.
- Nadie edita ni borra el cuerpo de una entrada que escribió otro. Lo nuevo se agrega abajo, con
  fecha.

Quién lee:
- `brainstorming`, antes de explorar una idea nueva: nombra las `abierto` que tocan el mismo código.
- `close-feature`, ante un rojo: si el test coincide con una entrada abierta, no reabre tareas.
- `dod-checker` **no** lo lee, a propósito: un verificador con una lista de fallas conocidas aprende
  a descartar rojos.>

<Los ids `P<n>` no se reusan nunca, aunque una entrada se descarte: pueden estar citados en un
`tasks.md` o en un commit.>

## P1 · <título corto> · `abierto`

- **Estado:** `abierto` | `en <carpeta-de-la-feature>` | `resuelto (AAAA-MM-DD, <carpeta-de-la-feature>)` | `descartado (AAAA-MM-DD): <por qué>`
- **De dónde salió:** <carpeta de la feature y tarea o paso — `docs/2026-09-24-dashboard/`, T16>
- **Evidencia:** <el fallo literal, el comando, cuántas veces pasó y dónde>
- **Lo que se sabe:** <hechos comprobados>
- **Lo que no se sabe:** <sospechas, marcadas como tales>
- **Qué no hacer:** <el atajo tentador y por qué no — p. ej. «no subir vitest dentro de otra
  feature: invalida todos sus veredictos»>
- **Para quién:** <qué tipo de feature debería tomarlo, o qué parte del código toca>
