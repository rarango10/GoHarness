## Usuario

Del brainstorm quedó aprobado esto para el dashboard: un comando de CLI que para un mes dado muestra por categoría gastado, presupuestado, % usado y una alerta si pasa el 100%; las categorías que tienen gasto pero no presupuesto (o al revés) se muestran igual marcadas como "sin definir"; el cálculo va en una función pura testeable, separada de la impresión. Pasemos a la spec.

## Asistente

- `Skill: {"skill": "goharness:specify", "args": "Dashboard de presupuesto por categoría: comando CLI que para un mes dado muestra por categoría gastado, presupuestado, % usado y alerta si pasa el 100%; categor`
- `Bash: {"command": "cd /private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-ujjnhjkg/finanzas; git ls-files | grep -v node_modules; cat package.json; cat src/*.ts 2>/dev/null | head -300;`

Antes de escribir `requirements.md` me faltan algunos datos. Sin ellos no puedo escribir criterios que un test pueda comprobar. Leí el código (`src/movimientos.ts`, `src/cli.ts`, `src/almacen.ts`) y hoy **no existe ningún lugar donde vivan los presupuestos**, así que la primera pregunta es la que más importa. En cada una va mi propuesta, así que alcanza con responder «sí» o corregir:

1. **¿Cómo se cargan los presupuestos?** ¿Esta feature incluye un comando para fijarlos, por ejemplo `finanzas presupuesto <categoría> <monto>`, o se editan a mano en un archivo? *Propuesta:* incluir el comando, que se guarde junto a los movimientos y que un segundo `presupuesto` sobre la misma categoría reemplace al anterior.
2. **¿El presupuesto es uno solo para todos los meses, o se fija mes por mes?** *Propuesta:* uno solo por categoría, que vale para cualquier mes.
3. **Presupuesto sin gasto:** ahí el % sí se puede calcular (da 0%). ¿Lo muestro como «0%» junto a la marca «sin definir», o en esa fila el % también dice «sin definir»? En el caso inverso, gasto sin presupuesto, el % no se puede calcular, así que ahí va «sin definir» seguro. *Propuesta:* «sin definir» en la columna % de los dos casos, para que se lean igual.
4. **Categorías sin gasto ni presupuesto en ese mes:** *Propuesta:* no se muestran.
5. **Si no se pasa el mes:** ¿el comando usa el mes actual o da error y devuelve un código distinto de 0? *Propuesta:* usa el mes actual. Si el mes tiene un formato inválido (no es `AAAA-MM`), da error y termina con código 1, igual que hoy hace `agregar` con los datos inválidos.
6. **Formato y orden:** *Propuesta:* montos con 2 decimales, como en `listar`, % redondeado a entero y filas ordenadas por categoría alfabéticamente.

Lo que doy por supuesto, salvo que me digas otra cosa:
- La alerta aparece cuando el uso pasa estrictamente el 100%. Con 100% justo no hay alerta.
- No hay fila de totales, porque no se habló en el brainstorm, así que queda afuera del alcance.
- No hay entradas de backlog que esta feature resuelva: todavía no existe `docs/pendientes.md`.

Con tus respuestas escribo `requirements.md` en `docs/2026-09-30-dashboard-presupuesto/` y te lo paso para aprobar.

## Usuario

Sí, todas tus propuestas me parecen bien, seguí así.

## Asistente

- `Bash: {"command": "cat /var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-ujjnhjkg/plugin/skills/specify/references/ears-patterns.md | head -80"}`
- `Write: {"file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-ujjnhjkg/finanzas/docs/2026-09-30-dashboard-presupuesto/requirements.md", "content": "# Requirements — Dashboard`
- `Bash: {"command": "cd /private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-ujjnhjkg/finanzas/docs/2026-09-30-dashboard-presupuesto && sed -i '' 's/las categorías conocida (/las categoría`

Escribí la spec de requisitos en `docs/2026-09-30-dashboard-presupuesto/requirements.md`, con tus seis respuestas incorporadas. Está en «pendiente de aprobación» y todavía no hice commit.

**Requisitos (22 criterios en total):**
- **R1 — Fijar el presupuesto de una categoría** (5 criterios): el presupuesto se guarda entre ejecuciones y uno nuevo reemplaza al anterior. Se rechaza una categoría desconocida o un monto que no sea mayor que 0, sin tocar lo guardado y con código de salida 1.
- **R2 — Dashboard de un mes** (9 criterios): qué filas aparecen, cómo se calculan gastado y % usado, la alerta cuando el gasto supera estrictamente el 100%, el orden alfabético y los 2 decimales.
- **R3 — Categorías «sin definir»** (5 criterios): el % dice «sin definir» en los dos casos. Sin presupuesto, la columna presupuestado muestra «—»; sin gasto, el gastado muestra 0.00. Esas filas nunca muestran alerta.
- **R4 — Elección del mes** (3 criterios): sin mes, usa el mes actual. Un mes inválido muestra un error y termina con código 1.

**Queda afuera por ahora:** presupuestos distintos para cada mes, borrar un presupuesto, la fila de totales y validar la categoría en `agregar` (hoy acepta cualquier texto).

**Decisiones que tomé yo:**
- **Categorías conocidas:** R1.3 rechaza cualquier categoría que no sea Comida, Transporte, Servicios, Ocio, Salud u Otros. No lo habíamos hablado; lo decidí yo.
- **«—» en presupuestado:** R3.2 pone «—» cuando no hay presupuesto. Tampoco lo habíamos hablado; lo decidí yo.
- **Mes sin datos:** un mes válido sin gastos ni presupuestos muestra el dashboard vacío, sin un mensaje especial.
- **Queda para `design.md`:** los nombres de los comandos, dónde se guardan los presupuestos y la separación entre la función pura del cálculo y la impresión.

No quedan preguntas abiertas.

Si lo aprobás, lo marco como `aprobado (2026-09-30)`, hago el commit y paso a la fase 2: escribir `design.md` a partir de estos criterios.

## Usuario

Aprobado, seguí con el diseño.

## Asistente

- `Bash: {"command": "cd /private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-ujjnhjkg/finanzas; git status --short; cat docs/2026-09-30-dashboard-presupuesto/requirements.md; cat /var/fold`
- `Bash: {"command": "cd /private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-ujjnhjkg/finanzas; sed -i '' 's/^> Estado: pendiente de aprobación$/> Estado: aprobado (2026-09-30)/' docs/2026`
- `Write: {"file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-ujjnhjkg/finanzas/docs/2026-09-30-dashboard-presupuesto/design.md", "content": "# Design — Dashboard de presupue`
- `Bash: {"command": "cd /private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-ujjnhjkg/finanzas/docs/2026-09-30-dashboard-presupuesto && python3 - <<'EOF'\np='design.md'; s=open(p).read()\n`

Marqué `requirements.md` como aprobado y lo commiteé (`4bfd48d`). Ya está escrito el diseño en `docs/2026-09-30-dashboard-presupuesto/design.md`: está en «pendiente de aprobación» y sin commit.

Antes de escribirlo releí los criterios aprobados: no aparecieron contradicciones ni huecos, así que no agregué ninguno.

**Cómo queda:**
- **Comandos:** `finanzas presupuesto <categoría> <monto>` y `finanzas dashboard [AAAA-MM]`.
- **Dónde se guardan:** los presupuestos van en `presupuestos.json`, en la misma carpeta que `movimientos.json`. Es un objeto `{ categoría: monto }` y la ubicación sale de la variable `FINANZAS_DATOS` que ya existe, sin agregar otra.
- **Cálculo separado de la impresión:** hay dos funciones puras en `src/dashboard.ts`. `calcularDashboard` arma las filas y marca con `null` los casos «sin definir»; `formatearDashboard` las convierte en texto. `src/presupuestos.ts` tiene la validación y el reemplazo del presupuesto.
- **Cómo se prueban persistencia, códigos de salida y mes actual:** en `src/comandos.ts`, cada comando recibe las rutas, la fecha de hoy y las funciones de salida, y devuelve el código de salida. Así se prueban sin subproceso, sin build previo y sin dependencias nuevas.
- **Superficie:** no navegable, porque es una CLI. El paso 7 (e2e) no aplica y la feature va directo al paso 8.
- **Testing:** todo con Vitest. Cada uno de los 22 criterios tiene al menos un test asignado y ninguno queda «solo e2e».

**Decisiones que conviene que mires:**
- **Alerta:** se decide comparando los montos, no el % redondeado. Un uso de 100,4% se muestra como «100%» con alerta, que es lo que dice R2.6.
- **Mes actual:** se toma de la hora local. Si se tomara de UTC, el último día del mes a la noche daría el mes siguiente.
- **Categorías:** el tipo `Categoria` pasa a derivarse de una lista `CATEGORIAS`, que hace falta para rechazar categorías desconocidas (R1.3). `agregar` y `listar` no se tocan.
- **Categorías cargadas a mano:** un movimiento con una categoría fuera de la lista (`agregar` hoy la acepta) aparece en el dashboard como fila «sin definir».

Si lo aprobás, lo marco como `aprobado (2026-09-30)`, hago el commit y el siguiente paso es el skill **`planning-tasks`**. Ese skill revisa la spec y lanza el workflow `tasks-fanout`, que pone a revisar en paralelo un agente por tarea y después arma `tasks.md` en un solo paso. No lo arranco sin tu sí.

## Usuario

Aprobado.

## Asistente

- `Bash: {"command": "cd /private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-ujjnhjkg/finanzas; git status --short; git diff; head -4 docs/2026-09-30-dashboard-presupuesto/design.md; git l`
- `Bash: {"command": "cd /private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-ujjnhjkg/finanzas/docs/2026-09-30-dashboard-presupuesto; wc -l design.md; sed -n 95,110p design.md; tail -5 des`
- `Bash: {"command": "cd /private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-ujjnhjkg/finanzas; sed -i '' 's/^> Estado: pendiente de aprobación$/> Estado: aprobado (2026-09-30)/' docs/2026`

Marqué `design.md` como `aprobado (2026-09-30)` y lo commiteé en `e329d8d`. `requirements.md` ya estaba commiteado con su aprobación.

La feature no se puede abrir en un navegador, porque es una CLI. Por eso no hace falta preparar Playwright, y al terminar las tareas se salta el paso 7 (e2e) y se va directo al cierre.

El siguiente paso es el skill **`planning-tasks`**: revisa que la spec esté completa y, con tu sí, lanza el workflow `tasks-fanout`, que genera `tasks.md`. No lo arranco sin que me lo pidas; cuando quieras, decime «planeemos las tareas».
