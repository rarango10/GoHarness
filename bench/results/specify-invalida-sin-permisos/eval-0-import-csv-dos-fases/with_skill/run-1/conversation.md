## Usuario

Ya quedó aprobado del brainstorm el diseño para importar movimientos del banco: parser de CSV de formato fijo (fecha, descripción, monto) de un solo banco, motor de reglas por palabra clave sobre la descripción con las categorías Comida, Transporte, Servicios, Ocio, Salud y Otros, los movimientos que no matchean quedan como "Sin categoría", detección de duplicados por fecha+descripción+monto, y todo se corre como comando de CLI. Escribamos el spec.

## Asistente

- `Skill: {"skill": "goharness:specify", "args": "Importar movimientos del banco: parser CSV formato fijo (fecha, descripción, monto) de un solo banco; motor de reglas por palabra clave sobre la descripción con`
- `Bash: {"command": "git ls-files | grep -v node_modules && cat package.json && ls docs; cat docs/pendientes.md 2>/dev/null; S=~/dev/GoHarness/plugin/goharness/skills/specify; cat `
- `Bash: {"command": "git ls-files && cat package.json && ls -R docs", "description": "List repo files, package.json and docs"}`
- `Read: {"file_path": "~/dev/GoHarness/plugin/goharness/skills/specify/assets/requirements-template.md"}`
- `Read: {"file_path": "~/dev/GoHarness/plugin/goharness/skills/specify/references/ears-patterns.md"}`
- `Bash: {"command": "cat src/*.ts test/*.ts .gitignore", "description": "Show source, tests and gitignore"}`

Antes de escribir `requirements.md` me faltan algunos datos. Del brainstorm tengo el diseño completo; esto son detalles sin los que no puedo escribir un test que falle. Leí el código actual (`src/movimientos.ts`, `src/cli.ts`, `src/almacen.ts`) y estas preguntas salen de cruzarlo con lo que acordamos:

**Formato del CSV**
1. ¿Me pasás 2 o 3 líneas de ejemplo tal como las exporta el banco, con el encabezado si lo trae? Con eso resuelvo el separador de campos (`,` o `;`), el formato de fecha (¿`DD/MM/AAAA`?), el separador decimal y si hay comillas.
2. **Signo del monto.** Hoy el modelo guarda los gastos como `monto` positivo y `validarMovimiento` rechaza el ≤ 0. ¿El banco exporta los gastos en negativo? Y si el archivo trae ingresos (acreditaciones, reintegros), ¿se ignoran o son un error?

**Reglas por palabra clave**
3. ¿Las reglas son fijas en el código o van en un archivo que puedas editar sin tocar código? Si tenés en mente palabras clave iniciales por categoría (por ejemplo `SUBE` → Transporte), pasámelas.
4. Si una descripción matchea reglas de dos categorías, ¿cuál gana? Propongo: gana la primera regla en orden de declaración, y el match es sin distinguir mayúsculas ni tildes.
5. Quiero confirmar la distinción entre **«Otros»** y **«Sin categoría»**. «Otros» sería una categoría a la que se llega por regla, y «Sin categoría» un valor aparte que hoy no existe en el tipo `Categoria`, así que habría que ampliarlo. ¿Es así? ¿`listar` tiene que mostrar «Sin categoría» tal cual?

**Duplicados**
6. ¿Duplicado contra qué: contra lo que ya está guardado, contra otras líneas del mismo archivo, o las dos cosas? Hay un caso límite: dos cafés iguales el mismo día en el mismo CSV se verían como duplicados. ¿Aceptás que se pierda el segundo?
7. ¿Qué pasa con un duplicado: se saltea en silencio o se informa?

**Errores y salida**
8. Si una línea está mal formada (fecha inválida, monto vacío), ¿se aborta la importación entera sin guardar nada, o se importan las buenas y se informan las malas con su número de línea?
9. Al terminar, ¿alcanza con un resumen tipo «12 importados, 3 duplicados, 2 sin categoría»? ¿O querés el detalle de cada movimiento?

Lo que no afecta a ningún criterio lo decido yo y lo anoto en **Supuestos**: el nombre del comando (`finanzas importar <archivo.csv>`), que el archivo de datos sea el mismo `data/movimientos.json` y la codificación UTF-8.

## Usuario

1. Fecha DD/MM/AAAA, separador coma, monto con punto decimal, sin comillas, con encabezado. 2. Los gastos vienen en negativo, y si hay ingresos que se ignoren. 3. Que las reglas estén en un archivo que yo pueda editar, y para arrancar: "SUBE" y "colectivo" a Transporte, "farmacia" a Salud, "supermercado" y "resto" a Comida. 4. De acuerdo con tu propuesta. 5. Sí, es así, y quiero que "Sin categoría" se vea tal cual en el listado. 6. Contra las dos cosas, y sí, acepto que se pierda el segundo café. 7. Que se informe. 8. Que se importen las buenas y se avisen las malas con el número de línea. 9. Con el resumen alcanza.

## Asistente

- `Write: {"file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-jvbt_wsz/finanzas/docs/2026-09-29-importar-movimientos/requirements.md", "content": "# Requirements — Importar m`

Escribí el spec en `docs/2026-09-29-importar-movimientos/requirements.md`, con 5 requisitos y 29 criterios en EARS:

- **R1 — Comando de importación:** importa las líneas válidas y no duplicadas, muestra un resumen (importados, duplicados, sin categoría) y cubre los errores de archivo inexistente y de falta de ruta.
- **R2 — Lectura del CSV:** saltea el encabezado, convierte `DD/MM/AAAA` a `AAAA-MM-DD`, pasa los montos negativos a gasto positivo e ignora ingresos y líneas vacías. Las líneas mal formadas se avisan con su número y las buenas entran igual.
- **R3 — Categorización por reglas:** las reglas viven en un archivo editable que, si no existe, se crea con tus reglas iniciales. Aplica la primera regla que coincide, sin distinguir mayúsculas ni tildes, y lo que no coincide queda en «Sin categoría». También cubre qué pasa si el archivo de reglas está mal armado.
- **R4 — «Sin categoría» en el listado,** escrito tal cual.
- **R5 — Duplicados:** se detectan contra lo ya guardado y contra las líneas anteriores del mismo archivo.

Quedaron dos puntos que no habíamos hablado y resolví yo. Conviene que los mires:

- **Archivo de reglas inválido (R3.8, R3.9):** puede no poder interpretarse o nombrar una categoría que no existe. En los dos casos el comando falla y no importa nada. No lo tomé como un caso de línea con error porque con reglas rotas se categorizaría todo mal.
- **La palabra clave es una subcadena:** `resto` también coincide con `RESTAURANTE`. Me pareció lo que buscás, pero además coincide con cualquier descripción que tenga esas letras en el medio de una palabra.

Los demás supuestos están en su sección del archivo: el comando es `finanzas importar <archivo.csv>`, las líneas con error no cambian el código de salida (0), los ingresos ignorados no aparecen en el resumen, y una descripción con coma se informa como línea con error. No quedan preguntas abiertas.

No pude abrir la plantilla de `requirements.md` ni la referencia de patrones EARS del skill porque se denegó el permiso de lectura. Armé el documento con la estructura que pide el skill (alcance, requisitos numerados, supuestos, enmiendas y encabezado de estado). Si querés que respete la plantilla al pie de la letra, dame acceso y lo ajusto.

Si lo aprobás, marco el encabezado como aprobado, lo commiteo y sigo con la fase 2: el `design.md`, que convierte estos criterios en arquitectura, interfaces, formato del archivo de reglas y mapa de tests. ¿Lo aprobás o hay que cambiar algo?

## Usuario

Aprobado, seguí con el diseño.

## Asistente

- `Edit: {"replace_all": false, "file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-jvbt_wsz/finanzas/docs/2026-09-29-importar-movimientos/requirements.md", "old_string": "> `
- `Bash: {"command": "git add docs/2026-09-29-importar-movimientos/requirements.md && git commit -q -m \"Spec importar-movimientos: requirements aprobado\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.c`
- `Write: {"file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-jvbt_wsz/finanzas/docs/2026-09-29-importar-movimientos/design.md", "content": "# Design — Importar movimientos d`

Marqué `requirements.md` como aprobado y lo commiteé (`3065e8f`). El diseño está en `docs/2026-09-29-importar-movimientos/design.md`.

Antes de escribirlo releí los requisitos buscando contradicciones o huecos y no encontré nada que obligue a sumar criterios. Los detalles que faltaban los resolví en el diseño.

**Qué propone**
- **Separación puro / I/O**, como pide `CLAUDE.md`. Tres módulos puros nuevos:
  - `csvBanco.ts` lee el CSV (R2).
  - `reglas.ts` interpreta las reglas y categoriza (R3).
  - `importar.ts` detecta duplicados y arma los movimientos nuevos (R1.1, R5).
- **Textos aparte:** `presentacion.ts` arma el resumen, los mensajes de error y la línea de `listar`.
- **Comando testeable:** `comandoImportar.ts` orquesta todo y devuelve código de salida y textos, sin llamar a `process.exit` ni a `console`. Así los códigos de salida y los casos de «datos intactos» se prueban con Vitest sobre un directorio temporal, sin compilar. `cli.ts` queda como un adaptador mínimo.
- **Archivo de reglas:** `data/reglas.json` (se puede cambiar con `FINANZAS_REGLAS`). Es un arreglo JSON ordenado donde el orden es la prioridad.
- **Categorías:** el tipo `Categoria` suma `'Sin categoría'`. En `listar`, la columna de categoría pasa de 10 a 13 caracteres para que siga alineada.
- **Mapa de tests:** cada criterio tiene su test asignado. No hay interfaz navegable, así que la feature salta el paso 7 (e2e).
- **Sin dependencias nuevas.**

**Decisiones mías que conviene que mires**
- **Palabra clave vacía:** la trato como archivo de reglas inválido (R3.8), porque si no coincidiría con todas las descripciones.
- **Fecha inexistente:** `31/02/2026` es error de línea, no solo el formato roto.
- **Formato del monto:** tiene que ser exactamente `-1234.50` o parecido. `1e3` y `1.234,50` se rechazan.
- **Varios problemas en una línea:** se informa uno solo, el primero en este orden: campos, fecha, monto, descripción.
- **Tildes:** al comparar sin tildes, la `ñ` se compara como `n`.
- **CSV y reglas:** si el CSV no existe, el comando falla antes de crear el archivo de reglas.

Si lo aprobás, lo marco como aprobado, lo commiteo y el paso siguiente es el skill `planning-tasks`. Ese skill revisa el spec y lanza el workflow `tasks-fanout`: un agente revisor por tarea en paralelo, un reducer que junta los veredictos y un único escritor que genera `tasks.md`. ¿Lo aprobás o hay que cambiar algo?

## Usuario

Aprobado.

## Asistente

- `Edit: {"replace_all": false, "file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-jvbt_wsz/finanzas/docs/2026-09-29-importar-movimientos/design.md", "old_string": "> Estado`
- `Bash: {"command": "git add docs/2026-09-29-importar-movimientos/design.md && git commit -q -m \"Spec importar-movimientos: design aprobado\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\" && git`

Marqué `design.md` como aprobado y lo commiteé (`74ccbf4`). Con eso el spec de «importar movimientos» tiene `requirements.md` y `design.md` aprobados en `docs/2026-09-29-importar-movimientos/`.

No corrí el doctor de Playwright porque la feature es solo de CLI, sin pantalla que Playwright pueda abrir.

El paso siguiente es el skill **`planning-tasks`**. Revisa que el spec esté completo y lanza el workflow `tasks-fanout`, que es el que escribe `tasks.md`. Para arrancarlo, decí «planeemos las tareas».
