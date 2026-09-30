## Usuario

Quiero que la app tenga un dashboard donde vea cuánto llevo gastado por categoría este mes comparado con mi presupuesto.

## Asistente

- `Skill: {"skill": "goharness:brainstorming", "args": "Quiero que la app tenga un dashboard donde vea cuánto llevo gastado por categoría este mes comparado con mi presupuesto."}`
- `Bash: {"command": "git ls-files | grep -v node_modules && cat package.json && cat docs/pendientes.md 2>/dev/null; ls docs; for f in $(git ls-files src); do echo \"== $f\"; cat $f; done", "description": "Exp`

Revisé el repo antes de preguntar nada. Esto es lo que hay hoy:

- **Es una CLI** (`src/cli.ts`) con dos comandos, `agregar` y `listar [AAAA-MM]`. Los datos viven en `data/movimientos.json`.
- **Las categorías son fijas**: Comida, Transporte, Servicios, Ocio, Salud, Otros (`src/movimientos.ts:1`).
- **El presupuesto no existe todavía.** No hay ningún dato ni archivo donde se guarde, así que la feature tiene que incluir cómo se carga.
- **No hay backlog.** `docs/pendientes.md` todavía no existe, así que no hay pendientes abiertos que se crucen con esto.

Lo primero que necesito saber define el tamaño de toda la feature: cuando decís **«dashboard»**, ¿qué te imaginás?

- **A) Un comando más en la terminal**, por ejemplo `finanzas resumen [AAAA-MM]`. Imprime una tabla por categoría con lo gastado, el presupuesto, lo que queda y el % usado, y quizás una barrita de texto. Sigue siendo una CLI: no suma dependencias ni tests e2e con Playwright (el paso 7 no aplica).
- **B) Una página web local** que se abre en el navegador, por ejemplo con `finanzas dashboard` levantando un servidor. Es más vistosa, pero suma un servidor, HTML y el ciclo e2e con Playwright. Además te voy a preguntar si tiene que parecerse a alguna referencia visual.

Yo recomiendo la **A**, porque encaja con lo que ya es la app y es bastante más chica. Pero depende de qué tengas en mente: ¿A, B u otra cosa?
