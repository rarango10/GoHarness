## Usuario

Ya quedó aprobado del brainstorm el diseño para importar movimientos del banco: parser de CSV de formato fijo (fecha, descripción, monto) de un solo banco, motor de reglas por palabra clave sobre la descripción con las categorías Comida, Transporte, Servicios, Ocio, Salud y Otros, los movimientos que no matchean quedan como "Sin categoría", detección de duplicados por fecha+descripción+monto, y todo se corre como comando de CLI. Escribamos el spec.

## Asistente

- `Skill: {"skill": "goharness:specify"}`
- `Bash: {"command": "cd /private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-g5eehkg6/finanzas; git ls-files; cat package.json; cat src/*.ts 2>/dev/null | head -200; ls docs; cat docs/pend`

Antes de escribir `requirements.md` me faltan algunos datos. Sin ellos no puedo escribir criterios que un test pueda comprobar, y ninguno salió en el brainstorm. Los junto acá para que los contestes de una vez:

**Formato del CSV**
1. **Fecha:** ¿en qué formato viene? (`DD/MM/AAAA`, `AAAA-MM-DD`, …)
2. **Separadores:** ¿el de campos es `,` o `;`? ¿El monto usa coma o punto decimal, y trae separador de miles?
3. **Encabezado:** ¿la primera línea es un encabezado que hay que saltear? ¿La descripción puede venir entre comillas con separadores adentro?
4. **Signo del monto:** en el modelo actual, positivo es un gasto. ¿El banco exporta los gastos como negativos? ¿Qué hacemos con los créditos (sueldo, reintegros): se ignoran, se rechazan o se importan de alguna forma?

**Reglas de categorización**
5. **Dónde viven las palabras clave:** ¿fijas en el código, o en un archivo que puedas editar sin tocar código? ¿Tenés ya una lista inicial por categoría?
6. **Cómo se comparan:** ¿sin distinguir mayúsculas? ¿Con o sin acentos? ¿Por subcadena (`"UBER"` matchea `"UBER *TRIP"`)?
7. **Varias reglas a la vez:** si una descripción coincide con palabras de dos categorías, ¿cuál gana? Por ejemplo, la primera según el orden de las reglas.

**Duplicados y errores**
8. **Contra qué se compara:** ¿solo contra lo que ya está guardado, o también dentro del mismo archivo? Dos cafés iguales el mismo día en el mismo CSV, ¿son dos movimientos o un duplicado?
9. **Fila inválida** (fecha mala, monto no numérico): ¿se saltea, se informa y sigue, o aborta todo el archivo sin guardar nada?
10. **Resumen al terminar:** ¿querés ver cuántos se importaron, cuántos se saltearon por duplicado y cuántos por inválidos? ¿Importa el código de salida, por ejemplo para usarlo desde un script?

**"Sin categoría"**
11. Hoy las categorías posibles son las seis del brainstorm y `agregar` usa `Otros` por defecto. Entiendo que "Sin categoría" es un valor nuevo, distinto de `Otros`, y que `listar` lo muestra tal cual. ¿Es así? ¿Hace falta después una forma de recategorizar esos movimientos, o eso queda fuera de esta feature?

Si alguna no te importa, decímelo: elijo lo razonable y lo anoto en **Supuestos**. La ruta del archivo de datos, por ejemplo, la asumo igual que hoy.

## Usuario

No sé bien todo eso, elegí vos lo más simple y anotalo en Supuestos.

## Asistente

- `Bash: {"command": "mkdir -p /private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-g5eehkg6/finanzas/docs/2026-09-30-importar-csv-banco"}`
- `Write: {"file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-g5eehkg6/finanzas/docs/2026-09-30-importar-csv-banco/requirements.md", "content": "# Requirements — Importar mov`

Escribí el borrador del spec en `docs/2026-09-30-importar-csv-banco/requirements.md`. Todavía no está commiteado. Lo repasé buscando criterios compuestos: cada uno describe un solo comportamiento.

**Requisitos:**
- **R1 — Leer el CSV del banco** (15 criterios): lectura del archivo, conversión de fecha y signo, qué pasa con los movimientos que ya estaban guardados, archivo inexistente y rechazo del archivo por filas inválidas.
- **R2 — Categorizar por palabras clave** (5): coincidencia sin distinguir mayúsculas, gana la primera regla, "Sin categoría" y cómo se ve en `listar`.
- **R3 — No duplicar movimientos** (3).
- **R4 — Resumen de la importación** (4): importados, duplicados y omitidos por no ser gastos, más el código de salida.

**Lo que elegí por vos (está en Supuestos):**
- **Formato:** fecha `DD/MM/AAAA`, campos separados por `,`, con encabezado, sin comillas y con punto decimal.
- **Signo:** los gastos vienen negativos. Los créditos no se importan, pero se cuentan en el resumen.
- **Fila inválida:** una sola rechaza el archivo entero, y el mensaje dice en qué línea está.
- **Reglas:** fijas en el código. La coincidencia es por subcadena y sin distinguir mayúsculas; los acentos no se normalizan.
- **Duplicados:** se comparan solo contra lo ya guardado. Dos filas iguales dentro del mismo archivo se importan las dos.
- **"Sin categoría":** es un valor nuevo, distinto de "Otros". Recategorizar queda fuera de esta feature.

**Preguntas abiertas:** ninguna bloquea.
- La lista concreta de palabras clave la propone `design.md` y la ajustás al aprobar el diseño.
- El formato del CSV lo elegí sin ver uno real. Conviene compararlo con un export del banco antes de implementar R1: si no coincide, no se importa nada. Si difiere, se corrige con una enmienda.

**Qué habilita tu sí:** anoto `aprobado` en el encabezado, commiteo el archivo y paso a la fase 2. Ahí convierto estos criterios en `design.md`, con las interfaces, el modelo de datos, la tabla de errores y qué test cubre cada criterio. ¿Lo aprobás, o querés cambiar algo?

## Usuario

Aprobado, seguí con el diseño.

## Asistente

- `Bash: {"command": "sed -i '' 's/^> Estado: pendiente de aprobación$/> Estado: aprobado (2026-09-30)/' docs/2026-09-30-importar-csv-banco/requirements.md && head -3 docs/2026-09-30-importar-csv-banco/require`

Dejé el spec en `aprobado (2026-09-30)` y lo commiteé (`50661c4`).

Antes de escribir el diseño releí los requisitos buscando problemas y encontré un hueco: ningún criterio dice qué pasa si corrés la importación **sin indicar el archivo**. Hoy la CLI, ante algo que no reconoce, muestra el uso y termina con código 0. Eso sirve para `finanzas` a secas, pero para un comando al que le falta un dato necesario terminar con 0 es engañoso: un script lo tomaría como éxito.

Propongo agregar este criterio al final de R1:

> 16. IF la persona corre la importación sin indicar la ruta de un archivo
>     THEN THE SYSTEM SHALL mostrar el uso del comando y terminar con un código de salida distinto de 0.

No encontré contradicciones ni otras ambigüedades.

Si decís que sí, agrego R1.16 al `requirements.md`, lo anoto en `## Enmiendas` y escribo `design.md`. ¿Va?

## Usuario

Dale, va.

## Asistente

- `Bash: {"command": "git status --short && git diff && cat docs/2026-09-30-importar-csv-banco/requirements.md | sed -n 1,5p && grep -n \"15\\.\\|Enmiendas\" -A3 docs/2026-09-30-importar-csv-banco/requirements`
- `Bash: {"command": "cd /private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-g5eehkg6/finanzas/docs/2026-09-30-importar-csv-banco && python3 - <<'EOF'\np='requirements.md'\ns=open(p).read(`
- `Bash: {"command": "cd /private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-g5eehkg6/finanzas && git add docs && git commit -q -m \"Enmienda importar-csv-banco: R1.16\n\nCo-Authored-By: C`
- `Write: {"file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-g5eehkg6/finanzas/docs/2026-09-30-importar-csv-banco/design.md", "content": "# Design — Importar movimientos del`

Escribí el diseño en `docs/2026-09-30-importar-csv-banco/design.md`. Todavía no está commiteado ni aprobado.

**Enmienda previa:** agregué R1.16 (importar sin indicar archivo muestra el uso y termina con código distinto de 0). Quedó anotada en `## Enmiendas` y commiteada aparte (`a69f155`).

**Cómo se arma:**
- **Comando:** `finanzas importar <archivo.csv>`.
- **Tres funciones puras en cadena:**
  - `parsearCsvBanco` valida todo el archivo antes de guardar nada; ante la primera fila inválida devuelve el número de línea.
  - `planificarImportacion` saltea créditos y duplicados, categoriza el resto y cuenta cada caso.
  - `formatearResumen` arma el texto final.
- **Categorías:** `categorizar` recorre una tabla ordenada de reglas fija en el código. Pongo Comida antes que Transporte para que `UBER EATS` quede en Comida y `UBER` a secas en Transporte.
- **Cambio a código existente:** la lógica de `cli.ts` pasa a una función `ejecutar(args, rutaDatos, salida)` que devuelve el código de salida. Así los códigos de salida, los mensajes y `listar` se prueban en el mismo proceso, sin compilar. `agregar` y `listar` se mueven sin cambiar lo que hacen.
- **Sin dependencias nuevas.** Descarté las librerías de CSV y el archivo de reglas editable.
- **No es navegable:** el paso de e2e no aplica. Todos los criterios tienen un test asignado en la estrategia de testing y ninguno depende del e2e.

**Te toca revisar:**
- **La lista inicial de palabras clave**, en la tabla de *Reglas iniciales*. Es un punto de partida; ajustala con los nombres que aparecen en tus extractos.
- **Riesgos anotados:**
  - El formato del CSV sigue sin comprobarse contra un export real. Es el riesgo principal.
  - Las coincidencias por subcadena dan falsos positivos (`cine` coincide con `MEDICINE`).
  - En `listar`, "Sin categoría" es más largo que el ancho de la columna y esas líneas salen desalineadas. Es cosmético.
  - Mover la lógica a `ejecutar` toca `agregar` y `listar`, que hoy no tienen tests de CLI.

**Qué habilita tu sí:** anoto `aprobado` en `design.md` y lo commiteo. El paso siguiente es el skill `planning-tasks`: revisa el spec y lanza el workflow `tasks-fanout`, que arma `tasks.md` con un agente revisor por tarea en paralelo, un reductor y un único escritor. Lo nombro, pero no lo arranco sin que me lo pidas.

¿Aprobás el diseño, o querés cambiar algo (por ejemplo, las palabras clave)?

## Usuario

Aprobado.

## Asistente

- `Bash: {"command": "git status --short && git diff docs/2026-09-30-importar-csv-banco/requirements.md"}`
- `Bash: {"command": "sed -i '' 's/^> Estado: pendiente de aprobación$/> Estado: aprobado (2026-09-30)/' docs/2026-09-30-importar-csv-banco/design.md && sed -n 1,4p docs/2026-09-30-importar-csv-banco/design.md`

El diseño quedó aprobado y commiteado (`4ab5635`). Como la feature no tiene interfaz navegable, no hace falta revisar Playwright.

`docs/2026-09-30-importar-csv-banco/` tiene los dos documentos aprobados:
- `requirements.md`: aprobado, con la enmienda R1.16.
- `design.md`: aprobado.

El siguiente paso es el skill **`planning-tasks`**. Revisa el spec y lanza el workflow `tasks-fanout`, que arma `tasks.md` con un agente revisor por tarea en paralelo, un reductor y un único escritor. No lo arranco por mi cuenta: cuando quieras seguir, decime «planeemos las tareas».

Antes de implementar la primera tarea conviene conseguir un CSV real del banco. El formato que asumí no se comprobó contra ningún export, y si no coincide no se importa nada.
