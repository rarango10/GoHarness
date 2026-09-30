## Usuario

Del brainstorm quedó aprobado esto para el dashboard: un comando de CLI que para un mes dado muestra por categoría gastado, presupuestado, % usado y una alerta si pasa el 100%; las categorías que tienen gasto pero no presupuesto (o al revés) se muestran igual marcadas como "sin definir"; el cálculo va en una función pura testeable, separada de la impresión. Pasemos a la spec.

## Asistente

- `Skill: {"skill": "goharness:specify"}`
- `Bash: {"command": "cd /private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-jrh0oql5; cat plugin/skills/specify/assets/requirements-template.md plugin/skills/specify/references/ears-patte`
- `Bash: {"command": "cd /private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-jrh0oql5/finanzas; cat src/*.ts test/*.ts"}`

Antes de escribir `requirements.md` tengo que resolver algunos detalles. Revisé el código: hoy el sistema **no tiene presupuestos**. Solo existen movimientos con 6 categorías fijas (`src/movimientos.ts`). Sin estos datos no puedo escribir criterios que un test pueda comprobar:

**Bloqueantes**

1. **¿De dónde salen los presupuestos?** Veo dos opciones:
   - (a) Un comando nuevo para definirlos, por ejemplo `finanzas presupuesto <categoría> <monto>`.
   - (b) Un archivo que editás a mano.

   En cualquiera de los dos casos, si el alta queda fuera de esta feature, el dashboard no tiene de dónde leer.
2. **¿El presupuesto es por mes o es fijo?** Por mes sería un monto distinto para cada `AAAA-MM`. Fijo sería un monto por categoría que vale para todos los meses.
3. **Un presupuesto sin gasto:** el brainstorm dice que se marca «sin definir», igual que el gasto sin presupuesto. Te pregunto porque en ese caso el % se puede calcular (0%). ¿Querés «sin definir» de todos modos, o una marca distinta como «sin gasto»?
4. **Umbral de la alerta:** «pasa el 100%», ¿quiere decir estrictamente más de 100%? ¿Justo 100% no alerta?

**Menores** (si no me decís nada, uso lo que va entre paréntesis y lo anoto en Supuestos)

5. Mes sin argumento → (se muestra el mes actual).
6. Mes con formato inválido → (mensaje de error y código de salida distinto de 0, como `agregar`).
7. Mes sin gastos ni presupuestos → (mensaje «no hay datos para AAAA-MM» y salida 0).
8. Categorías sin gasto ni presupuesto → (no se muestran).
9. % usado → (entero redondeado). Orden de las filas → (el orden fijo de las categorías).
10. ¿Fila de totales? → (no, queda afuera por ahora).

Con esas respuestas escribo `docs/2026-09-29-dashboard-presupuestos/requirements.md` y te lo traigo para aprobar.

## Usuario

1. La opción (a), un comando para cargarlos. 2. Por mes. 3. Sí, "sin definir" en los dos casos, para que sea igual. 4. Sí, estrictamente más de 100%, justo 100% no alerta. Y las menores están todas bien como las proponés.

## Asistente

- `Bash: {"command": "mkdir -p /private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-jrh0oql5/finanzas/docs/2026-09-29-dashboard-presupuestos && cat > /private/var/folders/nf/pn_wl51x55dbxmw`
- `Bash: {"command": "cd /private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-jrh0oql5/finanzas/docs/2026-09-29-dashboard-presupuestos && python3 - <<'EOF'\np='requirements.md'; s=open(p).r`
- `Bash: {"command": "python3 - <<'EOF'\np='requirements.md'; s=open(p).read()\nblk=\"\"\"15. IF la fila de una categoría está marcada como «sin definir»\n    THEN THE SYSTEM SHALL no mostrar alerta en esa fil`

Escribí la spec en `docs/2026-09-29-dashboard-presupuestos/requirements.md`, con tus respuestas incorporadas.

**R1 — Cargar el presupuesto de una categoría en un mes** (8 criterios)
- Para cargarlo se indican mes, categoría y monto.
- Cada carga válida muestra un mensaje de confirmación.
- El presupuesto sigue guardado la próxima vez que ejecutás el programa.
- Si cargás de nuevo la misma categoría en el mismo mes, el monto nuevo reemplaza al anterior.
- Un mes, una categoría o un monto inválidos terminan con un error y un código de salida distinto de 0.
- Una carga con error no cambia nada de lo que ya estaba guardado.

**R2 — Dashboard de un mes** (15 criterios)
- **Filas:** hay una fila por cada categoría con gasto o con presupuesto; las que no tienen ninguno de los dos no aparecen. Van en el orden fijo de las categorías.
- **Columnas:** gastado (solo movimientos de ese mes), presupuestado y % usado, redondeado a entero. Los presupuestos de otros meses no cuentan.
- **Alerta:** aparece solo si lo gastado es estrictamente mayor que lo presupuestado. Justo 100% no alerta.
- **«Sin definir»:** vale en los dos casos, gasto sin presupuesto y presupuesto sin gasto. Esas filas nunca muestran alerta (R2.15).
- **Sin mes:** se muestra el mes actual. Un mes con formato inválido da error y un código de salida distinto de 0.
- **Mes vacío:** muestra «no hay datos para AAAA-MM» y termina con código de salida 0.

**Supuestos que vale la pena revisar:**
- **Recargar reemplaza (R1.4).** Mientras no haya un comando para borrar, es la única forma de corregir un presupuesto.
- **La alerta compara montos, no el % redondeado.** Un 100,4% se muestra como «100%» pero alerta, porque el gasto supera al presupuesto.
- **Categorías.** Son solo las 6 que ya existen, sin categorías nuevas.

**Queda afuera:** borrar y listar presupuestos, presupuestos que se repiten de un mes a otro, fila de totales e ingresos.

No hay preguntas abiertas. Si lo aprobás, marco el archivo como aprobado, lo commiteo y paso a la fase 2: escribir `design.md` a partir de estos criterios. Ahí se decide dónde se guardan los presupuestos, los nombres de los comandos y la función pura del cálculo.

## Usuario

Aprobado, seguí con el diseño.

## Asistente

- `Bash: {"command": "sed -i '' 's/^> Estado: pendiente de aprobación$/> Estado: aprobado (2026-09-29)/' docs/2026-09-29-dashboard-presupuestos/requirements.md && head -3 docs/2026-09-29-dashboard-presupuestos`
- `Write: {"file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-jrh0oql5/finanzas/docs/2026-09-29-dashboard-presupuestos/design.md", "content": "# Design — Dashboard de presupu`
- `Edit: {"replace_all": false, "file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-jrh0oql5/finanzas/docs/2026-09-29-dashboard-presupuestos/design.md", "old_string": "| pres`
- `Bash: {"command": "git status --short"}`

Marqué `requirements.md` como aprobado y lo commiteé (`cae8585`). El design está en `docs/2026-09-29-dashboard-presupuestos/design.md`, esperando tu aprobación.

**Cómo queda:**
- **Comandos nuevos:** `finanzas presupuesto <AAAA-MM> <categoría> <monto>` y `finanzas dashboard [AAAA-MM]`.
- **Dónde se guardan:** en un archivo aparte, `data/presupuestos.json`. La ruta se puede cambiar con `FINANZAS_PRESUPUESTOS`, igual que `FINANZAS_DATOS` para los movimientos. El archivo de movimientos no cambia.
- **Funciones puras:**
  - `presupuestos.ts`: validar el mes, validar una carga, y cargar o reemplazar un presupuesto.
  - `dashboard.ts`: `calcularDashboard` arma las filas y `formatearDashboard` las convierte en texto.
- **Capa `comandos.ts`:** recibe el almacén de datos y la fecha actual como parámetros, en lugar de acceder al disco o al reloj por su cuenta. Así los mensajes, los códigos de salida, el «no guarda si hay error» y el «mes actual» se prueban sin disco y sin lanzar procesos. `cli.ts` queda como simple cableado.
- **Cambio en código existente:** `movimientos.ts` exporta `CATEGORIAS`, la lista ordenada de categorías, y el tipo `Categoria` sale de ahí. La usan tanto la validación (R1.6) como el orden de las filas (R2.3).
- **Tests:** hay una tabla que asigna un test a cada uno de los 23 criterios. No hace falta un navegador simulado para testear y ningún criterio depende de pruebas de punta a punta.

**Decisiones que vale la pena revisar:**
- **La alerta compara centavos enteros.** Con decimales comunes, 33,33 + 33,33 + 33,34 da algo apenas mayor que 100 y alertaría contra un presupuesto de 100, en contra de R2.9.
- **`2026-13` se rechaza como mes inválido.** Interpreté «formato AAAA-MM» como un mes real, del 01 al 12.
- **No es navegable:** es una CLI, así que el paso 7 (e2e) no aplica y al terminar las tareas se pasa directo al cierre.
- **Sin dependencias nuevas.**

Si lo aprobás, marco `design.md` como aprobado, lo commiteo, y el paso siguiente es **`planning-tasks`**. Ese skill comprueba que el spec esté completo y, con tu sí, lanza el workflow `tasks-fanout`, que arma el `tasks.md`. Ese workflow usa varios agentes: uno que releva el spec, un revisor por tarea en paralelo, uno que combina las revisiones y un único escritor al final.

## Usuario

Aprobado.

## Asistente

- `Bash: {"command": "sed -i '' 's/^> Estado: pendiente de aprobación$/> Estado: aprobado (2026-09-29)/' docs/2026-09-29-dashboard-presupuestos/design.md && sed -n 1,4p docs/2026-09-29-dashboard-presupuestos/d`

Marqué `design.md` como aprobado y lo commiteé (`4f06740`).

La spec de `docs/2026-09-29-dashboard-presupuestos/` tiene los dos documentos aprobados, `requirements.md` y `design.md`. No hace falta revisar la configuración de Playwright porque la feature no es navegable: es una CLI.

El paso siguiente es el skill **`planning-tasks`**. Primero comprueba que el spec esté completo y después, con tu sí, lanza el workflow `tasks-fanout`, que arma el `tasks.md`. Para pedirlo, decí «planeemos las tareas».
