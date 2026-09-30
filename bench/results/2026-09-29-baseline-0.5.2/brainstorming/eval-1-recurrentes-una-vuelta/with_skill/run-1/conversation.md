## Usuario

¿Cómo deberíamos manejar las transacciones recurrentes, tipo Netflix o el gym, para que no tenga que categorizarlas cada mes a mano?

## Asistente

- `Skill: {"skill": "goharness:brainstorming", "args": "Transacciones recurrentes (Netflix, gym) para no categorizarlas cada mes a mano"}`
- `Bash: {"command": "git ls-files | grep -v node_modules && cat docs/pendientes.md 2>/dev/null; ls docs", "description": "List repo files and read backlog"}`
- `Bash: {"command": "cat src/movimientos.ts src/almacen.ts src/cli.ts package.json", "description": "Read source files and package.json"}`

Revisé el repo antes de preguntar. Hoy `agregar` recibe `fecha descripción monto [categoría]`: si no pasás la categoría, queda en `Otros`. No hay nada que recuerde movimientos anteriores ni que genere movimientos solos. Tampoco existe `docs/pendientes.md`, así que no hay entradas del backlog que se crucen con esto.

Tu pedido se puede leer de dos maneras, y el diseño cambia bastante según cuál sea. Te pregunto una sola cosa:

**¿Qué es lo que hoy repetís a mano cada mes?**

- **A) Solo la categoría.** Igual cargás el movimiento de Netflix todos los meses (porque el monto o la fecha pueden variar), pero querés que al escribir «Netflix» la categoría `Servicios` se ponga sola. Esto sería categorización automática por reglas de descripción, y serviría para cualquier gasto que se repite, no solo para las suscripciones.
- **B) El movimiento entero.** Querés declarar una vez «Netflix, $X, Servicios, el día 5 de cada mes» y que el movimiento aparezca sin que lo cargues. Esto sería una plantilla de movimientos recurrentes. Como es una CLI sin proceso de fondo, habría que definir cuándo se generan: con un comando explícito o al correr `listar`.
- **C) Las dos cosas.**

Por ahora no te propongo ningún enfoque: primero quiero saber cuál de estos es tu problema.
