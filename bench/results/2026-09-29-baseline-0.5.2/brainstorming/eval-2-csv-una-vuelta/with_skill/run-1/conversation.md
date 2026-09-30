## Usuario

Necesito poder importar mis movimientos bancarios desde un CSV y que la app intente categorizarlos automáticamente.

## Asistente

- `Skill: {"skill": "goharness:brainstorming"}`
- `Bash: {"command": "git ls-files && cat docs/pendientes.md 2>/dev/null; cat package.json; for f in $(git ls-files src); do echo \"== $f\"; cat $f; done; ls docs/*", "description": "List repo files and read s`
- `Bash: {"command": "git ls-files && cat docs/pendientes.md package.json", "description": "List repo files and read backlog and package.json"}`
- `Read: {"file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-feq1s0li/finanzas/src/movimientos.ts"}`
- `Read: {"file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-feq1s0li/finanzas/src/cli.ts"}`
- `Read: {"file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-feq1s0li/finanzas/src/almacen.ts"}`

Estamos en el paso 1 (brainstorming): antes de escribir el spec o tocar código, quiero cerrar el diseño con vos.

Esto es lo que ya hay en el repo:
- `Movimiento` tiene `fecha` (AAAA-MM-DD), `descripcion`, `monto` (siempre positivo, porque es un gasto) y `categoria`. Las categorías son fijas: Comida, Transporte, Servicios, Ocio, Salud y Otros.
- La CLI tiene dos comandos, `agregar` y `listar`, y guarda todo en un JSON. La validación y el filtrado ya están en funciones puras.
- Todavía no existe `docs/pendientes.md`, así que no hay tareas del backlog que se crucen con esta.

Quedan varias decisiones abiertas y las voy a ir preguntando de a una. La primera es el formato del CSV.

**¿Qué CSV exporta tu banco?** Lo ideal es que me pegues la fila de encabezado y 2 o 3 filas de ejemplo; podés tapar los datos sensibles. Si no, contestame esto:
- **a)** ¿Es de un solo banco, o querés soportar varios formatos?
- **b)** ¿Qué separador usa (`,` o `;`)? ¿La coma o el punto es el separador decimal?
- **c)** ¿Qué formato tiene la fecha (`DD/MM/AAAA`, `AAAA-MM-DD`, otro)?
- **d)** ¿Cómo aparecen los montos? Puede ser una sola columna con signo (negativo = débito) o dos columnas separadas, débito y crédito.

Después de esto voy a preguntar, también de a una:
- qué hacer con los ingresos o créditos, porque la app hoy solo registra gastos;
- cómo categorizar: reglas por palabra clave o aprendizaje a partir de tu historial;
- si antes de guardar mostramos una vista previa;
- cómo detectar duplicados cuando importás el mismo archivo dos veces;
- qué hacer con las filas inválidas.
