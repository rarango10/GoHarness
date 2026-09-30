## Usuario

Ya quedó aprobado del brainstorm el diseño para importar movimientos del banco: parser de CSV de formato fijo (fecha, descripción, monto) de un solo banco, motor de reglas por palabra clave sobre la descripción con las categorías Comida, Transporte, Servicios, Ocio, Salud y Otros, los movimientos que no matchean quedan como "Sin categoría", detección de duplicados por fecha+descripción+monto, y todo se corre como comando de CLI. Escribamos el spec.

## Asistente

- `Skill: {"skill": "goharness:specify"}`
- `Bash: {"command": "git ls-files && cat package.json && ls docs; cat docs/pendientes.md 2>/dev/null; find docs -type f | head; cat src/*.ts 2>/dev/null | head -300"}`
- `Bash: {"command": "cd /var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-wgn6snsk/plugin/skills/specify && cat assets/requirements-template.md references/ears-patterns.md"}`

Antes de escribir `requirements.md` me faltan unos datos. Sin ellos no puedo escribir criterios que un test pueda verificar. Leí el código actual: hoy un movimiento es `fecha AAAA-MM-DD`, `descripción`, `monto > 0 = gasto` y una de las 6 categorías, y se guarda en un JSON local. Estas son las preguntas:

**Formato del CSV del banco**
1. ¿Qué **separador** usa: coma o punto y coma? ¿La primera línea es un **encabezado**?
2. ¿En qué **formato viene la fecha**: `DD/MM/AAAA`, `AAAA-MM-DD` u otro?
3. ¿Cómo viene el **monto**? Necesito saber el separador decimal (`1234.50` o `1234,50`), si usa separador de miles, y qué **signo** tiene un gasto (¿viene negativo, como en muchos extractos?).
4. ¿El extracto trae también **ingresos o créditos**? La app hoy solo modela gastos. Si los trae, ¿se ignoran y se informan, o se rechazan?

**Reglas de categorización**
5. ¿Las palabras clave son **fijas** (definidas en el programa) o **configurables** por vos en un archivo? Si son fijas, pasame algunas por categoría, por ejemplo `supermercado → Comida`, `uber → Transporte`. Si no, propongo una lista inicial y la anoto como supuesto.
6. Si una descripción matchea palabras de **dos categorías**, ¿cuál gana? Por ejemplo, la primera regla en orden, o una prioridad fija.
7. «Sin categoría» es algo distinto de «Otros», ¿correcto? Es decir, «Otros» queda como una categoría que se asigna a propósito.

**Duplicados y errores**
8. Los duplicados, ¿se detectan solo contra lo **ya guardado** o también **dentro del mismo archivo**? Si el extracto trae dos cafés iguales el mismo día, esos podrían ser dos gastos reales.
9. Si una **fila es inválida** (fecha o monto que no se puede leer), ¿se omite esa fila, se informa y se importa el resto, o se aborta todo el archivo sin guardar nada?

Si alguna te da igual, decime «elegí vos». En ese caso tomo lo razonable y lo dejo anotado en **Supuestos**. Con las respuestas escribo `docs/2026-09-29-importar-csv/requirements.md` y te lo traigo para aprobar.

## Usuario

1. Con coma y sí tiene encabezado. 2. DD/MM/AAAA. 3. Con punto decimal, sin separador de miles, y los gastos vienen negativos. 4. Sí trae ingresos, elegí vos qué hacer con eso. 5. Fijas, elegí vos la lista. 6. Elegí vos. 7. Sí, correcto. 8. Elegí vos. 9. Que se omita esa fila y se avise, y se importe el resto.

## Asistente

- `Write: {"file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-wgn6snsk/finanzas/docs/2026-09-29-importar-csv/requirements.md", "content": "# Requirements — Importar movimient`

Escribí `docs/2026-09-29-importar-csv/requirements.md` con los criterios ya separados, un comportamiento por criterio. Todavía no lo commiteé; queda en `pendiente de aprobación`.

**Requisitos**
- **R1 — Leer el extracto del banco** (8 criterios): se saltea el encabezado, la fecha DD/MM/AAAA pasa a AAAA-MM-DD y el monto negativo se guarda como gasto en valor absoluto. Se recortan los espacios de la descripción, se aceptan fines de línea CRLF y se ignoran las líneas vacías. Si el archivo no existe, el comando avisa con la ruta y termina con código distinto de cero.
- **R2 — Filas inválidas** (8): una fila se omite si no tiene 3 columnas, si la fecha es inválida (incluidas fechas que no existen, como 31/02), si el monto no es numérico o es cero, o si la descripción está vacía. Se informa la línea y el motivo de cada una y se importa el resto.
- **R3 — Ingresos** (2): los montos positivos se omiten y se informan aparte de las filas inválidas.
- **R4 — Categorización** (5): una descripción cae en una categoría si contiene alguna de sus palabras clave. No distingue mayúsculas ni tildes. Si coincide con más de una categoría, gana la de mayor prioridad; si no coincide con ninguna, queda como «Sin categoría».
- **R5 — Duplicados** (4): se comparan contra lo ya guardado. Dos filas iguales dentro del mismo archivo se registran las dos. Importar dos veces el mismo archivo no agrega nada, y se informa cuántos duplicados se omitieron.
- **R6 — Resultado** (5): el comando informa cuántos movimientos importó y cuántos quedaron sin categoría. No pierde lo que ya estaba guardado, `listar` muestra lo importado con su categoría y el comando termina con código 0 aunque haya omitido filas.

**Lo que elegí yo (anotado en Supuestos, revisalo)**
- **Ingresos:** se omiten y se cuentan en el resumen.
- **Palabras clave:** armé una lista fija de comercios argentinos, que está en la **Tabla de reglas** del documento. La prioridad es el orden de la tabla: Comida > Transporte > Servicios > Ocio > Salud. «Otros» no tiene palabras clave; solo se asigna a mano.
- **Duplicados:** se comparan solo contra lo guardado. Tiene un límite: si se superponen dos extractos y hay dos gastos idénticos el mismo día, uno de ellos puede perderse.
- **Encabezado:** se descarta sin validar su contenido. También asumí que las descripciones no traen comas ni comillas; una fila así se omite como inválida.

No quedaron preguntas abiertas que bloqueen.

**Qué habilita tu sí:** marco el documento como `aprobado (2026-09-29)`, lo commiteo y paso a la fase 2, que convierte estos criterios en `design.md`: arquitectura, módulos, cómo encaja «Sin categoría» en el modelo actual y qué test cubre cada criterio. ¿Lo aprobás, o querés cambiar algo, por ejemplo la lista de palabras clave?

## Usuario

Aprobado, seguí con el diseño.

## Asistente

- `Bash: {"command": "sed -i '' 's/^> Estado: pendiente de aprobación$/> Estado: aprobado (2026-09-29)/' docs/2026-09-29-importar-csv/requirements.md && head -3 docs/2026-09-29-importar-csv/requirements.md && `
- `Edit: {"replace_all": false, "file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-wgn6snsk/finanzas/docs/2026-09-29-importar-csv/requirements.md", "old_string": "3. IF el m`
- `Edit: {"replace_all": false, "file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-wgn6snsk/finanzas/docs/2026-09-29-importar-csv/requirements.md", "old_string": "   THEN TH`

Aprobé `requirements.md` y lo commiteé (`447f0e0`). Todavía no escribí `design.md`: al releer los requisitos aprobados antes del diseño aparecieron dos huecos. Ya puse los cambios en el archivo, pero no los commiteé; necesito que los confirmes.

1. **R2.3 era ambiguo.** Decía «un número con punto decimal», y eso se puede leer como que un monto entero (`-45`) es inválido. Los extractos suelen traer montos redondos sin decimales, así que corregí la redacción en el mismo lugar: ahora vale tanto un entero como un número con punto decimal (`-45` o `-45.50`). Si tu intención era rechazar los enteros, decímelo.
2. **Faltaba qué pasa si corrés el comando sin archivo.** Ningún criterio lo cubría. Agregué dos al final de R1, sin renumerar nada:
   - **R1.9** — sin ruta de archivo, el comando muestra cómo se usa.
   - **R1.10** — sin ruta de archivo, el comando termina con código distinto de cero.

El resto de los criterios no tiene contradicciones.

Si confirmás, commiteo estos cambios y escribo `design.md` con los módulos, cómo entra «Sin categoría» en el modelo actual, las alternativas que descarté y qué test cubre cada criterio. Después te lo traigo para aprobar. ¿Van?

## Usuario

Sí, van los dos cambios, dale para adelante con el diseño.

## Asistente

- `Bash: {"command": "git commit -q -am \"Requirements importar-csv: aclara R2.3, agrega R1.9 y R1.10\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\" && git log --oneline -1 && cat /var/folders/nf`
- `Write: {"file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-wgn6snsk/finanzas/docs/2026-09-29-importar-csv/design.md", "content": "# Design — Importar movimientos del banco`

Commiteé los dos cambios a los requirements (`445eed8`) y escribí el diseño en `docs/2026-09-29-importar-csv/design.md`. Todavía no lo commiteé; queda en `pendiente de aprobación`.

**Cómo queda armado**
- **Tres funciones puras en cadena**, cada una en su archivo:
  - `extracto.ts` lee el CSV: devuelve las filas normalizadas y las inválidas, con su línea y el motivo.
  - `reglas.ts` asigna la categoría con la tabla de palabras clave.
  - `importacion.ts` separa ingresos y duplicados, y arma el resumen.
- **Una capa de comando** (`comando-importar.ts`) lee y escribe los archivos. En vez de imprimir y cortar el proceso, devuelve la salida y el código de salida, así que se prueba con archivos temporales, sin build ni subproceso.
- **Cambios chicos en lo que ya existe:**
  - `'Sin categoría'` pasa a ser un valor más del tipo `Categoria`.
  - `listar` usa una función de formato que se puede testear, con la columna de categoría a 13 caracteres para que «Sin categoría» quede alineada.
  - `cli.ts` suma la rama `finanzas importar <archivo.csv>`.
- **Sin dependencias nuevas.** El formato es fijo, así que alcanza con partir cada línea por comas.
- **Se guarda una sola vez, al final**, para no dejar datos a medio importar.

**Cosas a revisar**
- **No hay superficie navegable:** es una CLI, así que el paso 7 (e2e) no aplica y la feature pasa directo al cierre cuando las tareas estén en `hecho`.
- **Todos los criterios (R1.1 a R6.5) tienen un test asignado** en la tabla de testing. Ninguno queda «solo e2e» y no hace falta DOM de pruebas.
- **Riesgo:** como la coincidencia es por subcadena, hay falsos positivos posibles, por ejemplo `claro` dentro de `DECLARO`. Corregirlo sería una enmienda a la tabla de reglas.
- **Algo que ya estaba:** `agregar` hoy no valida la categoría. No lo toco en esta feature; si querés, lo anotamos en el backlog.

**Qué habilita tu sí:** marco `design.md` como aprobado y lo commiteo. El paso siguiente es el skill **`planning-tasks`**, que revisa el spec y lanza el workflow `tasks-fanout` para armar `tasks.md`: un revisor por tarea en paralelo, un reducer que junta los veredictos y un único escritor. Ese paso no lo arranco yo. ¿Aprobás el diseño?

## Usuario

Aprobado.

## Asistente

- `Bash: {"command": "sed -i '' 's/^> Estado: pendiente de aprobación$/> Estado: aprobado (2026-09-29)/' docs/2026-09-29-importar-csv/design.md && sed -n 3,4p docs/2026-09-29-importar-csv/design.md && git add `

Marqué `design.md` como `aprobado (2026-09-29)` y lo commiteé (`216eade`). Con esto quedan aprobados los dos documentos del spec en `docs/2026-09-29-importar-csv/`: `requirements.md` y `design.md`. El árbol de trabajo está limpio.

Como es una CLI sin interfaz, no hace falta revisar Playwright y la feature salta el paso 7 (e2e).

El paso siguiente es el skill **`planning-tasks`**. Comprueba que el spec esté completo y lanza el workflow `tasks-fanout`, que arma `tasks.md`. No lo arranco yo: cuando quieras, decime «planeemos las tareas».
