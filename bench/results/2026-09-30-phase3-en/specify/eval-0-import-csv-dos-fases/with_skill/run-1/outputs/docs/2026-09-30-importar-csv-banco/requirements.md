# Requirements — Importar movimientos del banco

> Estado: aprobado (2026-09-30) · enmendado (2026-09-30): R1.16

## Introducción

Hoy cada gasto se carga a mano con `agregar`, uno por uno, eligiendo su categoría. El banco ya
tiene esos mismos movimientos y los exporta como CSV, así que cargarlos a mano es tedioso y es
fácil equivocarse o saltearse alguno.

Con esta feature, la persona le pasa a la CLI el CSV exportado por su banco y los gastos quedan
guardados junto a los que ya tenía, cada uno con una categoría asignada según palabras clave de su
descripción. Si importa el mismo archivo dos veces, o dos archivos que se solapan, no se le
duplican los movimientos. Al terminar ve un resumen de lo que pasó.

## Alcance

**Incluye**
- Un comando de CLI que importa un archivo CSV con el formato fijo de un solo banco (fecha,
  descripción, monto).
- Categorización automática por palabras clave en la descripción, con las categorías Comida,
  Transporte, Servicios, Ocio, Salud y Otros.
- La categoría "Sin categoría" para los movimientos que no coinciden con ninguna regla.
- Detección de duplicados por fecha + descripción + monto contra lo ya guardado.
- Un resumen al terminar la importación.

**No incluye (por ahora)**
- Formatos de otros bancos o detección automática de formato: el brainstorm acotó a un solo banco.
- Editar las reglas sin tocar código: por ahora son fijas (ver Supuestos).
- Recategorizar movimientos ya guardados, incluidos los "Sin categoría": es otra feature.
- Importar créditos (sueldo, reintegros, transferencias recibidas): el modelo actual solo registra
  gastos.
- Importación parcial de un archivo con filas inválidas: el archivo se acepta entero o se rechaza
  entero.

## Requirements

### R1 — Leer el CSV del banco

**User story:** Como persona que registra sus gastos, quiero importar el CSV que exporta mi banco,
para no tener que cargar cada gasto a mano.

#### Criterios de aceptación

1. WHEN la persona corre la importación con la ruta de un CSV válido
   THE SYSTEM SHALL guardar un movimiento por cada fila de gasto del archivo.
2. WHEN la persona corre la importación
   THE SYSTEM SHALL tratar la primera línea del archivo como encabezado y no importarla.
3. WHEN una fila tiene la fecha en formato `DD/MM/AAAA`
   THE SYSTEM SHALL guardar el movimiento con esa misma fecha en formato `AAAA-MM-DD`.
4. WHEN una fila tiene un monto negativo
   THE SYSTEM SHALL guardarla como gasto con el valor absoluto de ese monto.
5. IF una fila tiene un monto positivo o cero
   THEN THE SYSTEM SHALL no importarla.
6. IF el archivo tiene líneas vacías
   THEN THE SYSTEM SHALL ignorarlas sin considerarlas inválidas.
7. WHEN la importación termina
   THE SYSTEM SHALL conservar todos los movimientos que ya estaban guardados antes de importar.
8. WHEN la importación termina
   THE SYSTEM SHALL mostrar los movimientos importados al listar el mes de su fecha.
9. IF el archivo no existe en la ruta indicada
   THEN THE SYSTEM SHALL terminar con un mensaje de error que muestre esa ruta.
10. IF una fila no tiene exactamente tres campos
    THEN THE SYSTEM SHALL rechazar el archivo entero sin guardar ninguno de sus movimientos.
11. IF una fila tiene una fecha que no es una fecha válida en formato `DD/MM/AAAA`
    THEN THE SYSTEM SHALL rechazar el archivo entero sin guardar ninguno de sus movimientos.
12. IF una fila tiene un monto que no es numérico
    THEN THE SYSTEM SHALL rechazar el archivo entero sin guardar ninguno de sus movimientos.
13. IF una fila tiene la descripción vacía
    THEN THE SYSTEM SHALL rechazar el archivo entero sin guardar ninguno de sus movimientos.
14. IF el archivo se rechaza por una fila inválida
    THEN THE SYSTEM SHALL mostrar el número de línea de la primera fila inválida.
15. IF el archivo no existe o se rechaza
    THEN THE SYSTEM SHALL terminar con un código de salida distinto de 0.
16. IF la persona corre la importación sin indicar la ruta de un archivo
    THEN THE SYSTEM SHALL mostrar el uso del comando y terminar con un código de salida distinto de 0.

### R2 — Categorizar por palabras clave

**User story:** Como persona que registra sus gastos, quiero que los movimientos importados lleguen
ya categorizados, para poder consultarlos por categoría sin clasificarlos uno por uno.

#### Criterios de aceptación

1. WHEN la descripción de un movimiento importado contiene una palabra clave de una categoría
   THE SYSTEM SHALL asignarle esa categoría.
2. WHEN compara la descripción con las palabras clave
   THE SYSTEM SHALL ignorar la diferencia entre mayúsculas y minúsculas.
3. IF la descripción contiene palabras clave de más de una categoría
   THEN THE SYSTEM SHALL asignar la categoría de la primera regla que coincide, según el orden de
   las reglas.
4. IF la descripción no contiene ninguna palabra clave
   THEN THE SYSTEM SHALL asignarle la categoría "Sin categoría".
5. WHEN la persona lista un mes que tiene movimientos "Sin categoría"
   THE SYSTEM SHALL mostrarlos con la categoría "Sin categoría".

### R3 — No duplicar movimientos

**User story:** Como persona que importa el CSV de su banco cada tanto, quiero que no se me
dupliquen los movimientos, para poder importar un archivo que se solapa con uno anterior sin
inflar mis gastos.

#### Criterios de aceptación

1. IF una fila tiene la misma fecha, la misma descripción y el mismo monto que un movimiento ya
   guardado
   THEN THE SYSTEM SHALL no importarla.
2. WHEN dos filas del mismo archivo tienen la misma fecha, descripción y monto, y no hay un
   movimiento guardado igual
   THE SYSTEM SHALL importar las dos.
3. WHEN la persona importa dos veces el mismo archivo
   THE SYSTEM SHALL no guardar ningún movimiento nuevo en la segunda importación.

### R4 — Resumen de la importación

**User story:** Como persona que importa el CSV de su banco, quiero ver qué hizo la importación,
para saber si entró todo lo que esperaba.

#### Criterios de aceptación

1. WHEN la importación termina sin rechazar el archivo
   THE SYSTEM SHALL informar cuántos movimientos importó.
2. WHEN la importación termina sin rechazar el archivo
   THE SYSTEM SHALL informar cuántas filas omitió por duplicadas.
3. WHEN la importación termina sin rechazar el archivo
   THE SYSTEM SHALL informar cuántas filas omitió por no ser gastos.
4. WHEN la importación termina sin rechazar el archivo
   THE SYSTEM SHALL terminar con código de salida 0.

## Supuestos

La persona no tenía definidos estos detalles y pidió elegir lo más simple. Cada uno se puede cambiar
con una enmienda. Los del formato conviene comprobarlos contra un CSV real del banco antes de
implementar, porque si alguno está mal no se importa nada.

- **Fecha `DD/MM/AAAA`.** Es el formato habitual en bancos de habla hispana. Se guarda como
  `AAAA-MM-DD`, igual que los movimientos cargados a mano.
- **Formato del archivo:** separador de campos `,`, la primera línea es un encabezado, codificación
  UTF-8, sin campos entre comillas (la descripción no trae comas), monto con punto decimal y sin
  separador de miles.
- **Signo del monto:** el banco exporta los gastos como negativos y los créditos como positivos.
  Los créditos no se importan, pero se cuentan en el resumen (R4.3).
- **Una fila inválida rechaza el archivo entero.** Evita importaciones a medias y deja un solo
  camino claro: corregir el archivo y volver a importar. Las filas de crédito también se validan.
- **Las reglas son fijas en el código.** Cambiarlas requiere tocar el código. La lista inicial de
  palabras clave por categoría la propone `design.md`.
- **Comparación de palabras clave:** por subcadena, sin distinguir mayúsculas. Los acentos no se
  normalizan (`café` no coincide con `cafe`). Si hay varias coincidencias, gana la primera regla.
- **"Otros" es una categoría con reglas propias,** distinta de "Sin categoría". "Sin categoría" es
  un valor nuevo que solo asigna la importación. `agregar` sigue usando "Otros" por defecto.
- **Duplicados:** se comparan solo contra lo ya guardado, no dentro del mismo archivo. Dos compras
  idénticas el mismo día pueden ser reales. La descripción se compara exacta, y el monto por su
  valor ya convertido a gasto.
- **Mismos datos que `agregar` y `listar`:** los movimientos importados se guardan en el mismo
  lugar que los cargados a mano.

## Preguntas abiertas

- **Lista concreta de palabras clave:** no bloquea el spec. `design.md` propone una inicial y la
  persona la ajusta al aprobar el diseño.
- **Validar el formato con un export real del banco:** no bloquea el spec, pero conviene hacerlo
  antes de implementar R1. Si el formato real difiere, se corrigen R1.3–R1.5 con una enmienda.

## Enmiendas

- 2026-09-30 · R1.16 · se agrega: correr la importación sin archivo muestra el uso y sale con código distinto de 0 (antes no estaba cubierto) · revisión previa al diseño (fase 2)
