## Usuario

Necesito poder importar mis movimientos bancarios desde un CSV y que la app intente categorizarlos automáticamente.

## Asistente

- `Skill: {"skill": "goharness:brainstorming", "args": "Importar movimientos bancarios desde un CSV y categorizarlos automáticamente."}`
- `Bash: {"command": "git ls-files && cat docs/pendientes.md 2>/dev/null; cat package.json; for f in $(git ls-files src); do echo \"== $f\"; cat $f; done; ls docs", "description": "Explore project files, backl`

Revisé el repo antes de preguntar. Esto es lo que hay:

- `src/movimientos.ts`: `Movimiento` tiene `fecha` (AAAA-MM-DD), `descripcion`, `monto` (positivo = gasto) y `categoria`, que es una de 6 fijas: Comida, Transporte, Servicios, Ocio, Salud, Otros. `validarMovimiento` rechaza montos ≤ 0.
- `src/cli.ts`: comandos `agregar` y `listar [AAAA-MM]`. Si no se indica categoría, se usa `Otros`.
- `src/almacen.ts`: lee y escribe el JSON completo.
- No hay `docs/pendientes.md` todavía, así que no hay nada del backlog que se cruce con esto.

Quedan varias decisiones abiertas: el formato del CSV, cómo se decide la categoría, qué pasa con los ingresos (el modelo hoy solo acepta gastos), duplicados si importás dos veces el mismo archivo, filas inválidas y si hay vista previa antes de guardar. Voy de a una.

**Pregunta 1: ¿de dónde sale el CSV?**

- **A)** Exportás de **un solo banco** siempre. Si es así, pegame las primeras 3 o 4 líneas (con los datos cambiados si querés) para ver columnas, separador, formato de fecha y de decimales.
- **B)** Usás **varios bancos** con formatos distintos, y la app tendría que soportar más de uno.
- **C)** **Un formato propio y fijo** (por ejemplo `fecha,descripcion,monto`) al que vos adaptás el archivo antes de importarlo.

Yo recomiendo **A** si es tu caso: un único formato concreto es lo más chico de construir. Lo de varios bancos se puede agregar después si hace falta.

## Usuario

A, uso siempre el mismo banco.

## Asistente

Perfecto. Para diseñar el parser sobre tu archivo real y no sobre uno supuesto, pegame el **encabezado y 3 o 4 filas** de un CSV exportado de ese banco. Podés cambiar descripciones y montos, pero dejá tal cual:

- el separador (`,` o `;`)
- el formato de la fecha (`31/12/2025`, `2025-12-31`, etc.)
- el formato de los montos (`1.234,56` o `1234.56`, y si los gastos vienen con signo negativo o en una columna aparte)
- si hay líneas extra antes del encabezado (título, número de cuenta, saldo)

Si podés, incluí **una fila de ingreso** (sueldo, transferencia recibida). Así veo cómo aparece, porque hoy la app solo registra gastos y eso es la próxima decisión.

## Usuario

No tengo un archivo a mano ahora mismo, ¿podés seguir con lo que te parezca más común para un banco argentino típico?

## Asistente

Sí, sigo. Pero dejo esto escrito como **supuesto mío**, no como algo que vos dijiste, porque los bancos argentinos no exportan todos igual:

> **Supuesto (lo asumo porque no hay archivo de muestra):** encabezado en la primera línea, separador `;`, columnas `Fecha;Descripción;Importe`, fecha `DD/MM/AAAA`, importe con formato `-1.234,56` (punto de miles, coma decimal) y **gastos con signo negativo**, ingresos con signo positivo. Codificación UTF-8.

Para que equivocarme no salga caro, **lo decido así (decime si te sirve):** todo lo que depende del formato del banco queda en una sola función pura, `parsearCsvBanco(texto) → filas`. Si cuando tengas el archivo real no coincide, se cambia esa función y sus tests, y el resto (categorización, duplicados, guardado) no se toca. Además, antes de cerrar la feature conviene probarlo con un export real. Lo anoto como condición de cierre, salvo que prefieras otra cosa.

**Pregunta 2: ¿qué hacemos con los ingresos del extracto?** (sueldo, transferencias recibidas, reintegros: las filas con importe positivo)

- **A)** **Ignorarlos.** Se importan solo los gastos, y el resumen dice «N filas de ingreso omitidas». El modelo actual (`monto > 0` = gasto) no cambia.
- **B)** **Importarlos también**, lo que obliga a ampliar el modelo para distinguir ingreso de gasto y a revisar cómo los muestra `listar`.

Recomiendo **A**: la app hoy es de gastos, y B es una feature en sí misma que puede ir al backlog.

## Usuario

A, ignoramos los ingresos por ahora.

## Asistente

Anotado: los ingresos se omiten y el resumen informa cuántos (**lo pediste vos**, opción A). También sumo al backlog «importar ingresos (ampliar modelo)» como candidato a una feature futura. Lo cargará `specify`.

**Pregunta 3: ¿cómo decide la app la categoría?** Esta es la parte central de lo que pediste.

- **A)** **Reglas por palabra clave que editás vos.** Un archivo `data/reglas.json` con pares del tipo `"UBER" → Transporte`, `"FARMACITY" → Salud`, `"COTO" → Comida`. Se compara sin distinguir mayúsculas/minúsculas ni tildes contra la descripción, gana la primera regla que coincide y, si ninguna coincide, queda en `Otros`. Viene con un set inicial de reglas para comercios argentinos comunes, que podés editar.
- **B)** **Reglas fijas en el código.** Lo mismo que A, pero para cambiar una regla hay que tocar el código.
- **C)** **Aprender del historial.** Si ya existe un movimiento con una descripción parecida, se usa su categoría. Es más «automático», pero menos predecible, y hoy tenés pocos datos de los que aprender.

Recomiendo **A**: es predecible, lo ajustás sin tocar código y la lógica de coincidencia queda como una función pura fácil de testear. C se puede agregar encima más adelante.

## Usuario

A, con reglas que pueda editar yo.

## Asistente

Anotado (**lo pediste vos**): reglas editables en `data/reglas.json`, primera coincidencia gana y, si no hay ninguna, `Otros`. Para el caso en que el archivo de reglas no existe, **decido esto (decime si te sirve):** la primera vez que importás se crea con el set inicial, así queda a la vista para editarlo.

**Pregunta 4: ¿qué pasa si importás dos veces el mismo movimiento?** Pasa seguido: bajás el extracto de septiembre y después uno de septiembre y octubre juntos, que se superponen.

- **A)** **Se saltean los duplicados.** Un movimiento se considera duplicado si ya existe uno con la misma fecha, el mismo monto y la misma descripción. El resumen informa «N duplicados omitidos».
- **B)** **Se importa todo igual**, y evitar la superposición queda a tu cargo.

Recomiendo **A**. Tiene un borde que te aviso ahora: dos compras realmente idénticas el mismo día (dos cafés de $2.500 en el mismo local) se verían como duplicado. **Decido esto (decime si te sirve):** la comparación se hace por cantidad. Si el CSV trae dos filas idénticas y el JSON tiene una, se importa una. Así un reimport no duplica, pero tampoco se pierden compras repetidas legítimas.

## Usuario

A, me parece bien así.

## Asistente

Anotado (**lo pediste vos**): se saltean duplicados por fecha, monto y descripción, comparando por cantidad.

**Pregunta 5: ¿qué pasa con las filas que no se pueden leer?** Por ejemplo, fecha rota, importe que no es un número o una columna faltante.

- **A)** **Todo o nada.** Si hay alguna fila inválida, no se importa nada, y se lista cada fila con su número de línea y el motivo. Corregís el archivo (o se corrige el parser) y volvés a importar.
- **B)** **Se importan las válidas** y se informan las inválidas (línea y motivo) en el resumen.

Recomiendo **A**. Con un formato que por ahora es un supuesto, una fila inválida probablemente indica que el parser no entiende tu banco, y en ese caso prefiero no dejar una importación a medias en el JSON. Como los duplicados se saltean, reintentar no tiene costo.

## Usuario

A, me parece bien así.

## Asistente

Anotado (**lo pediste vos**): todo o nada, con cada error listado por línea y motivo.

**Pregunta 6, la última: ¿querés ver el resultado antes de que se guarde?**

- **A)** **Se guarda directo.** `finanzas importar extracto.csv` guarda y muestra un resumen: importados por categoría, duplicados omitidos e ingresos omitidos. Si una categoría no te gusta, corregís la regla. Por ahora no hay comando para editar un movimiento ya guardado.
- **B)** **Con `--simular`.** El mismo comando con `--simular` muestra cada movimiento con la categoría que le tocaría y el resumen, pero no guarda. Sin el flag, guarda como en A.

Recomiendo **B**. Mientras afinás las reglas vas a querer probar varias veces sin ensuciar el JSON, y como hoy no hay forma de editar ni borrar un movimiento, equivocarse al guardar cuesta caro. El costo es chico: la misma función, sin la escritura final.

## Usuario

B, con simular.

## Asistente

Con eso se cierran las preguntas. Te presento el diseño completo. Cada decisión dice de dónde salió: **(vos)** = lo pediste, **(yo)** = lo decidí yo y espero tu ok, **(supuesto)** = nadie lo decidió y yo llené el hueco.

## Diseño: importar movimientos desde CSV con categorización automática

**Uso:** `finanzas importar <archivo.csv> [--simular]`

**Flujo:** leer el CSV → parsear → descartar ingresos → categorizar → quitar duplicados → guardar (o, con `--simular`, solo mostrar) → imprimir el resumen.

**Unidades.** Siguiendo la regla del proyecto, los cálculos van en funciones puras, separados del I/O:

| Unidad | Qué hace | Tipo |
|---|---|---|
| `src/csvBanco.ts` → `parsearCsvBanco(texto)` | Devuelve `{ filas, errores }`. Aísla todo lo que es propio del banco. | pura |
| `src/categorias.ts` → `categorizar(descripcion, reglas)` y `REGLAS_INICIALES` | Primera regla que coincide; si ninguna coincide, `Otros`. | pura |
| `src/importacion.ts` → `planificarImportacion(texto, existentes, reglas)` | Arma los movimientos a agregar y un resumen (por categoría, duplicados, ingresos omitidos) o los errores. | pura |
| `src/almacen.ts` → `leerReglas` / `guardarReglas` | I/O de `data/reglas.json` | I/O |
| `src/cli.ts` → comando `importar` | Conecta todo e imprime | I/O |

**Decisiones:**

1. **Formato del CSV (supuesto, porque no hay archivo de muestra):** `;` como separador, encabezado `Fecha;Descripción;Importe`, fecha `DD/MM/AAAA` convertida a `AAAA-MM-DD`, importe `-1.234,56`, gastos con signo negativo y UTF-8. Queda aislado en `parsearCsvBanco` para cambiarlo sin tocar lo demás. **(yo)** Probarlo con un export real es condición para cerrar la feature.
2. **Ingresos** (importe positivo): se omiten y se cuentan en el resumen. **(vos)** Los importes en 0 también se omiten y se cuentan aparte. **(supuesto:** no son gasto, y no deberían bloquear la importación como si fueran filas inválidas).
3. **Monto guardado:** el valor absoluto del gasto, para cumplir con el modelo actual (`monto > 0`). **(supuesto**, se deriva de lo anterior).
4. **Categorización:** reglas `{ "texto": "UBER", "categoria": "Transporte" }` en `data/reglas.json`. Coincidencia por «contiene», sin distinguir mayúsculas/minúsculas ni tildes; la primera que coincide gana y, si ninguna coincide, `Otros`. **(vos)**
5. **Reglas iniciales:** si `data/reglas.json` no existe, se crea con un set de comercios argentinos comunes. **(yo)** Con `--simular` no se crea: se usa el set en memoria, porque simular no escribe nada. **(supuesto**, por coherencia con el punto 7).
6. **Reglas inválidas:** si una regla nombra una categoría que no existe, se muestra un error y no se importa nada. **(supuesto:** si no, iría a parar a `Otros` en silencio).
7. **Duplicados:** misma fecha, monto y descripción, comparados por cantidad (dos filas iguales en el CSV contra una en el JSON → se importa una). **(vos**, con el criterio de cantidad propuesto por mí y aceptado por vos).
8. **Filas inválidas:** todo o nada. Se lista cada una con número de línea y motivo, y se sale con código 1. **(vos)** Un archivo que no existe o que no tiene el encabezado esperado también es error y sale con código 1. **(supuesto)**
9. **CSV sin filas de datos:** no es error; el resumen dice «0 importados». **(supuesto)**
10. **`--simular`:** lista cada movimiento con la categoría asignada más el resumen, y no escribe nada. **(vos)**

**Qué no toca:** `agregar`, `listar` y el modelo `Movimiento` quedan igual. No se agregan dependencias: el parseo del CSV es a mano, y alcanza porque el formato es fijo y sin comillas. **(supuesto:** si tu banco usa comillas con `;` adentro, se revisa en el punto 1).

**Tests:** Vitest sobre las tres funciones puras (formatos de fecha e importe, filas inválidas con número de línea, ingresos, tildes y mayúsculas en las reglas, duplicados por cantidad), más un test de `leerReglas` con archivo ausente y con archivo inválido.

**Backlog:** se crea `docs/pendientes.md` con dos entradas que salieron de esta charla: **P1** importar ingresos (ampliar el modelo) y **P2** editar o borrar un movimiento guardado.

---

**¿Aprobás este diseño?** Si decís que sí, el paso siguiente es el skill **`specify`**. Convierte esto en `requirements.md`, con criterios de aceptación numerados, y después en `design.md`, dentro de `docs/2026-09-30-importar-csv/`, con su propia aprobación en cada fase. Si algo de lo marcado como **(yo)** o **(supuesto)** no te cierra, decímelo y lo ajusto antes.
