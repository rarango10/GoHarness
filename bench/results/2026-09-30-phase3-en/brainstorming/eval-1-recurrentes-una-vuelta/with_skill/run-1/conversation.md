## Usuario

¿Cómo deberíamos manejar las transacciones recurrentes, tipo Netflix o el gym, para que no tenga que categorizarlas cada mes a mano?

## Asistente

- `Skill: {"skill": "goharness:brainstorming", "args": "Transacciones recurrentes (Netflix, gym) para no categorizarlas a mano cada mes"}`
- `Bash: {"command": "git ls-files && cat docs/pendientes.md 2>/dev/null; ls docs; find src -type f | xargs cat; cat package.json", "description": "Explore repo files, backlog and source"}`

Miré el repo: hoy `agregar` recibe fecha, descripción, monto y una categoría opcional, que si falta queda en `Otros`. No hay nada que recuerde movimientos anteriores. Tampoco existe `docs/pendientes.md`, así que no hay pendientes que se crucen con esto.

Antes de proponer un enfoque necesito entender qué es lo que hoy te cuesta. «Recurrentes» puede querer decir dos cosas bastante distintas:

- **A. Categoría automática.** Seguís cargando cada movimiento a mano, pero cuando escribís «Netflix» la categoría (`Servicios`) sale sola. Lo que te ahorrás es elegir la categoría. La regla se aplica a todo lo que tenga esa descripción, se repita o no.
- **B. Movimientos que se generan solos.** Declarás una vez «Netflix, $X, `Servicios`, todos los meses», y el programa crea el movimiento de cada mes sin que lo cargues. Lo que te ahorrás es cargarlo entero.
- **C. Las dos cosas.**

¿Cuál se parece más a lo que querés? Si la respuesta es B, después te pregunto qué pasa cuando el monto cambia de un mes a otro y cuándo tiene que aparecer el movimiento.
