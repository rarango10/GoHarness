## Usuario

Del brainstorm quedó aprobado esto para el dashboard: un comando de CLI que para un mes dado muestra por categoría gastado, presupuestado, % usado y una alerta si pasa el 100%; las categorías que tienen gasto pero no presupuesto (o al revés) se muestran igual marcadas como "sin definir"; el cálculo va en una función pura testeable, separada de la impresión. Pasemos a la spec.

## Asistente

- `Skill: {"skill": "goharness:specify", "args": "Dashboard de presupuesto por mes: comando CLI que para un mes dado muestra por categoría gastado, presupuestado, % usado y alerta si pasa el 100%; categorías co`
- `Bash: {"command": "git ls-files && cat package.json && ls docs 2>/dev/null; cat docs/pendientes.md 2>/dev/null; for f in $(git ls-files 'src/*'); do echo \"=== $f\"; cat \"$f\"; done", "description": "List `
- `Read: {"file_path": "~/dev/GoHarness/plugin/goharness/skills/specify/assets/requirements-template.md"}`
- `Read: {"file_path": "~/dev/GoHarness/plugin/goharness/skills/specify/references/ears-patterns.md"}`
- `Bash: {"command": "git ls-files && cat package.json", "description": "List tracked files and show package.json"}`
- `Read: {"file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-m8ftfat3/finanzas/src/cli.ts"}`
- `Read: {"file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-m8ftfat3/finanzas/src/movimientos.ts"}`
- `Read: {"file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-m8ftfat3/finanzas/src/almacen.ts"}`
- `Read: {"file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-m8ftfat3/finanzas/test/movimientos.test.ts"}`

Antes de escribir `requirements.md` revisé el código. Hay un hueco que el brainstorm no cerró, y sin esa respuesta no puedo escribir criterios que se puedan testear. Hoy no existe ningún concepto de presupuesto: `src/movimientos.ts` solo conoce movimientos, con una lista fija de categorías (Comida, Transporte, Servicios, Ocio, Salud, Otros).

Te dejo las preguntas juntas:

1. **¿De dónde salen los presupuestos?** Esta es la que bloquea.
   - a) Un archivo JSON que editás a mano, y esta feature solo lo lee.
   - b) Un comando nuevo para cargarlos, por ejemplo `finanzas presupuestar <categoría> <monto>`, que agrandaría el alcance.
   - c) Otra cosa.
2. **¿El presupuesto es por mes o fijo?** Puede valer igual para todos los meses, o definirse distinto por mes (por ejemplo `2026-09`).
3. **¿Cómo se muestra el % usado?** Mi propuesta es redondearlo a entero (`87%`). Si una categoría no tiene presupuesto, no hay % que calcular: ¿mostramos `—` junto a la marca «sin definir»?
4. **¿Qué pasa si no se pasa el mes o si tiene mal formato?** Mi propuesta:
   - Sin mes, toma el mes actual.
   - Con formato distinto de `AAAA-MM`, da un error y un código de salida distinto de 0.
5. **¿Cómo se llama el comando?** Propongo `finanzas dashboard <AAAA-MM>`.

Si no me decís otra cosa, doy esto por supuesto:
- **La alerta sale solo si se pasa del 100%.** Exactamente 100% no alerta, porque así lo dijo el brainstorm («si pasa el 100%»).
- **Se omiten las categorías sin gasto y sin presupuesto en el mes.**

Con las respuestas escribo `requirements.md` en `docs/2026-09-29-dashboard-presupuesto/` y te lo paso para aprobar.

## Usuario

1. Un archivo JSON que edito a mano, la opción a. 2. Fijo, igual todos los meses. 3. Sí, mostrar "—" cuando no hay presupuesto. 4. De acuerdo con tu propuesta. 5. Me gusta `finanzas dashboard <AAAA-MM>`.

## Asistente

- `Read: {"file_path": "~/dev/GoHarness/plugin/goharness/skills/specify/assets/requirements-template.md"}`
- `Read: {"file_path": "~/dev/GoHarness/plugin/goharness/skills/specify/references/ears-patterns.md"}`
- `Write: {"file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-m8ftfat3/finanzas/docs/2026-09-29-dashboard-presupuesto/requirements.md", "content": "# Requirements — Dashboard`
- `Edit: {"replace_all": false, "file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-m8ftfat3/finanzas/docs/2026-09-29-dashboard-presupuesto/requirements.md", "old_string": "-`
- `Edit: {"replace_all": false, "file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-m8ftfat3/finanzas/docs/2026-09-29-dashboard-presupuesto/requirements.md", "old_string": " `

Escribí `docs/2026-09-29-dashboard-presupuesto/requirements.md`. Todavía no lo commiteé: queda esperando tu aprobación.

**Requisitos:**
- **R1 — Presupuestos desde archivo (R1.1–R1.6).** Monto fijo por categoría, igual para todos los meses.
  - Si el archivo no existe, ninguna categoría tiene presupuesto.
  - Tres casos de archivo mal armado dan error: JSON inválido, un monto que no es mayor que 0 y una categoría desconocida. Los tres terminan con código de salida distinto de 0.
- **R2 — Cálculo por categoría (R2.1–R2.7).** Gastado del mes, % redondeado a entero y alerta solo si el gasto supera al presupuesto.
  - Las dos marcas «sin definir» (gasto sin presupuesto, y presupuesto sin gasto) son criterios separados.
  - Las categorías sin gasto ni presupuesto se omiten.
- **R3 — Comando `finanzas dashboard [AAAA-MM]` (R3.1–R3.8).** Una fila por categoría, «—» donde no hay presupuesto y la marca en la misma fila.
  - Sin mes, toma el mes actual.
  - Con un mes inválido, da error y código de salida distinto de 0.
  - Si el mes no tiene nada para mostrar, avisa que no hay datos.

La función pura del cálculo quedó como restricción, no como criterio, porque no es algo que se vea desde afuera.

**Supuestos que te conviene revisar:**
- **«—» también en la columna de presupuestado**, no solo en la de %.
- **La alerta se decide con los montos, no con el % redondeado.** Un 100,4 % se muestra como `100%` pero alerta.
- **Una categoría desconocida en el JSON es un error**, para que no pase un error de tipeo como «comida». No se muestra como una categoría más.
- **Orden y formato de las filas:** siguen el orden de la lista de categorías actual y los montos van con 2 decimales, como en `listar`.
- **Ubicación del archivo de presupuestos:** la decide el design, siguiendo el patrón de `FINANZAS_DATOS`.

No pude leer la plantilla ni la guía de EARS del skill porque me faltó el permiso de lectura sobre esa carpeta. Armé el archivo con la estructura que describe el propio skill; si querés que siga la plantilla al pie de la letra, dame ese permiso.

**Si lo aprobás**, marco el encabezado como aprobado, lo commiteo y paso a la fase 2: convertir estos criterios en `design.md`, con la función pura, el formato del JSON de presupuestos, el cambio en `cli.ts` y qué test cubre cada criterio.



## Usuario

Aprobado, seguí con el diseño.

## Asistente

- `Edit: {"replace_all": false, "file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-m8ftfat3/finanzas/docs/2026-09-29-dashboard-presupuesto/requirements.md", "old_string": ">`
- `Bash: {"command": "git add docs/2026-09-29-dashboard-presupuesto/requirements.md && git commit -q -m \"Requirements dashboard-presupuesto: aprobado\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- `Edit: {"replace_all": false, "file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-m8ftfat3/finanzas/docs/2026-09-29-dashboard-presupuesto/requirements.md", "old_string": "-`

Hay dos cambios en `requirements.md`, todavía sin commitear:
- **R1.7 (nuevo):** si el archivo es JSON válido pero no es un objeto de categoría a monto, aparece un mensaje de error que nombra el archivo.
- **R1.6 (ampliado):** el código de salida distinto de 0 ahora también aplica al caso de R1.7. Ninguna tarea ni test lo cita todavía, así que no rompe nada.

No encontré otros problemas: ningún criterio contradice a otro, y la alerta y las marcas «sin definir» no se pueden dar en la misma fila.

**Si decís que sí**, commiteo este cambio y escribo `design.md` con la función pura del cálculo, el formato del JSON de presupuestos, el cambio en `cli.ts` y el mapa de qué test cubre cada criterio.

## Usuario

Sí, dale, commiteá y seguí con el diseño.

## Asistente

- `Bash: {"command": "cat .gitignore tsconfig.json vitest.config.ts", "description": "Show gitignore and configs"}`
- `Read: {"file_path": "~/dev/GoHarness/plugin/goharness/skills/specify/assets/design-template.md"}`
- `Edit: {"replace_all": false, "file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-m8ftfat3/finanzas/docs/2026-09-29-dashboard-presupuesto/requirements.md", "old_string": ">`
- `Bash: {"command": "cat >> docs/2026-09-29-dashboard-presupuesto/requirements.md <<'EOF'\n\n## Enmiendas\n\n- 2026-09-29 — R1.7 nuevo (archivo de presupuestos con JSON válido pero sin forma de objeto) y R1.6`
- `Write: {"file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-m8ftfat3/finanzas/docs/2026-09-29-dashboard-presupuesto/design.md", "content": "# Design — Dashboard de presupue`

Commiteé la enmienda de R1.6 y R1.7 (`322cf6d`). Escribí `docs/2026-09-29-dashboard-presupuesto/design.md`; todavía no lo commiteé porque espera tu aprobación.

**Qué propone:**
- **Tres capas:**
  - **Funciones puras:** `validarPresupuestos`, `calcularDashboard`, `formatearDashboard`, `esMesValido` y `mesActual`.
  - **Orquestador:** `comandoDashboard`, que recibe los movimientos, la lectura de presupuestos y la fecha de hoy ya resueltos. Devuelve las líneas, los errores y el código de salida, sin tocar disco ni consola.
  - **`cli.ts`:** solo lee los archivos, imprime y sale con el código.
- **Presupuestos:** en `data/presupuestos.json`, con la forma `{ "Comida": 80000, ... }`, y se pueden mover a otra ruta con `FINANZAS_PRESUPUESTOS`, igual que `FINANZAS_DATOS`. `data/` ya está en `.gitignore`.
- **Categorías:** `movimientos.ts` pasa a exportar `CATEGORIAS` como lista. Sirve para validar nombres y para ordenar las filas; el tipo `Categoria` no cambia.
- **Alerta en centavos enteros:** una decisión que no estaba en los requirements. Evita que una suma como 0,1 + 0,2 «supere» un presupuesto de 0,3 por un error de redondeo de la máquina.
- **Tests:** hay un mapa de qué test cubre cada criterio, de R1.1 a R3.8. Ninguno levanta un proceso, porque los códigos de salida se prueban en el orquestador.
  - Sin test propio queda solo el cableado de `cli.ts` (imprimir y salir con el código), que son tres líneas sin lógica.
- **Paso 7:** no hay superficie navegable, así que la feature salta la verificación e2e y va directo al cierre.
- **Alternativas descartadas:** meter los presupuestos en `movimientos.json`, testear la CLI compilada como proceso, comparar montos directamente con decimales, decidir la alerta con el % redondeado y usar una librería de tablas.

Tampoco pude leer la plantilla de `design.md` del skill, por el mismo permiso que falta sobre esa carpeta, así que seguí la estructura que describe el skill.

**Si lo aprobás**, lo marco como aprobado y lo commiteo. El paso siguiente es `planning-tasks`: revisa que el spec esté completo y, con tu sí, lanza el workflow `tasks-fanout`, que arma el plan de tareas con un revisor por tarea en paralelo y un único escritor al final. No lo arranco yo.

## Usuario

Aprobado.

## Asistente

- `Edit: {"replace_all": false, "file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-m8ftfat3/finanzas/docs/2026-09-29-dashboard-presupuesto/design.md", "old_string": "> Estad`
- `Bash: {"command": "git add docs/2026-09-29-dashboard-presupuesto/design.md && git commit -q -m \"Design dashboard-presupuesto: aprobado\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\" && git lo`

El spec del dashboard está completo y aprobado. Marqué `design.md` como aprobado y lo commiteé (`9172ac3`); el árbol de trabajo quedó limpio.

En `docs/2026-09-29-dashboard-presupuesto/` quedan los dos documentos:
- `requirements.md` está aprobado, con una enmienda que agregó R1.7 y amplió R1.6 para cubrirlo.
- `design.md` está aprobado.

La feature no tiene pantalla, así que no hace falta preparar Playwright y el paso de verificación de punta a punta (paso 7) se salta.

El paso siguiente es `planning-tasks`: revisa que el spec esté completo y, con tu sí, lanza el workflow `tasks-fanout`, que arma `tasks.md`. No lo arranco; pedilo con «planeemos las tareas».
