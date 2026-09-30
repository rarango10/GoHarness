## Usuario

Quiero que la app tenga un dashboard donde vea cuánto llevo gastado por categoría este mes comparado con mi presupuesto.

## Asistente

- `Skill: {"skill": "goharness:brainstorming", "args": "Quiero que la app tenga un dashboard donde vea cuánto llevo gastado por categoría este mes comparado con mi presupuesto."}`
- `Bash: {"command": "git ls-files | grep -v node_modules && cat package.json && cat docs/pendientes.md 2>/dev/null; ls docs", "description": "List project files, package.json and backlog"}`
- `Bash: {"command": "for f in src/*.ts test/*.ts; do echo \"=== $f\"; cat $f; done", "description": "Show source and test files"}`
- `Read: {"file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-ga2ni3md/finanzas/src/movimientos.ts"}`
- `Read: {"file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-ga2ni3md/finanzas/src/cli.ts"}`
- `Read: {"file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-ga2ni3md/finanzas/src/almacen.ts"}`

Revisé el repo antes de preguntar. Hoy tenés una CLI con `agregar` y `listar [AAAA-MM]`, seis categorías fijas (`Comida`, `Transporte`, `Servicios`, `Ocio`, `Salud`, `Otros`) y los movimientos en un JSON local. Todavía no hay presupuesto en ningún lado, así que la feature también tiene que crearlo. No existe `docs/pendientes.md`, así que no hay entradas del backlog que se crucen con esto.

La primera pregunta es la que más cambia el tamaño de todo. Cuando decís **«dashboard»**, ¿qué te imaginás?

- **A) Un reporte en la terminal.** Un comando nuevo, por ejemplo `finanzas resumen [AAAA-MM]`, que imprime una tabla con una fila por categoría: gastado, presupuesto, restante y quizás una barrita de texto `████░░ 67%`. Sigue siendo una CLI y no suma dependencias. Por el contrato, no tendría el paso e2e (7).
- **B) Una página web local.** Algo como `finanzas dashboard` levanta un servidor y abrís el navegador para ver barras o gráficos. Es más vistoso, pero es bastante más grande: servidor HTTP, HTML/CSS, probablemente alguna dependencia, y activa el paso 7 con Playwright.
- **C) Otra cosa.**

Yo te recomiendo la **A**, porque es lo más chico que responde tu pregunta («cuánto llevo contra el presupuesto este mes») y encaja con lo que ya existe. Si más adelante querés la versión web, se puede montar sobre los mismos cálculos. Igual, decidilo vos: si lo que buscás es verlo en el navegador, vamos por la B.
