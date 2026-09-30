## Usuario

Necesito poder importar mis movimientos bancarios desde un CSV y que la app intente categorizarlos automáticamente.

## Asistente

- `Skill: {"skill": "goharness:brainstorming", "args": "Importar movimientos bancarios desde un CSV y categorizarlos automáticamente."}`
- `Bash: {"command": "git ls-files && cat docs/pendientes.md 2>/dev/null; cat package.json; for f in $(git ls-files 'src/*'); do echo \"=== $f\"; cat $f; done; ls docs/*/", "description": "Explore repo files, `

Estuve mirando el repo antes de preguntar:

- **Modelo actual:** un `Movimiento` tiene `fecha`, `descripcion`, `monto` (positivo = gasto) y `categoria`. La categoría es una de 6 fijas: Comida, Transporte, Servicios, Ocio, Salud, Otros. `validarMovimiento` ya valida.
- **CLI:** tiene `agregar` y `listar [AAAA-MM]`, y guarda todo en un solo JSON (`src/almacen.ts`).
- **Backlog:** `docs/pendientes.md` no existe, así que no hay nada abierto que esta feature pueda absorber.

Todavía quedan varias decisiones abiertas: el formato del CSV, qué hacer con los ingresos, qué pasa si importás el mismo archivo dos veces, cómo se categoriza, qué pasa con las filas inválidas y si hay confirmación antes de guardar. Voy de a una pregunta.

**Pregunta 1: ¿cómo es el CSV que te da tu banco?** Me sirve más que nada:

- **(a)** Pegar 2 o 3 filas de ejemplo con el encabezado (podés cambiar los montos y las descripciones). Esta es la opción que prefiero, porque así el diseño se ajusta a un archivo real y no a uno que yo me imagine.
- **(b)** Si no lo tenés a mano, decirme: qué columnas trae, qué separador usa (`,` o `;`), en qué formato viene la fecha (`DD/MM/AAAA` o `AAAA-MM-DD`) y cómo escribe los decimales (`1.234,56` o `1234.56`).
- **(c)** Que el formato sea configurable porque usás varios bancos. Te aviso que esto agranda bastante la feature.
