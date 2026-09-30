# Requirements — Importar movimientos del banco

> Estado: aprobado (2026-09-29)

## Contexto

Hoy cada gasto se carga a mano con `finanzas agregar`. El banco permite exportar los movimientos de
la cuenta como CSV; esta feature los incorpora de un saque, les asigna categoría con reglas por
palabra clave que la persona mantiene en un archivo, y evita cargar dos veces el mismo movimiento.

## Alcance

**Incluye**

- Un comando de CLI que importa un CSV del banco (un solo banco, formato fijo).
- Categorización automática por palabra clave sobre la descripción, con reglas en un archivo
  editable.
- El valor «Sin categoría» para lo que ninguna regla reconoce, visible en el listado.
- Detección de duplicados contra lo ya guardado y dentro del mismo archivo.
- Importación parcial: las líneas válidas entran aunque haya líneas con error.

**Fuera de alcance por ahora**

- Otros bancos u otros formatos de CSV (comillas, otro separador, otro formato de fecha).
- Registrar ingresos: se ignoran.
- Recategorizar a mano un movimiento ya importado.
- Administrar las reglas desde la CLI: se editan en el archivo.
- Reglas por expresión regular, por monto o por cualquier cosa que no sea la descripción.
- Deshacer una importación.

## Formato del CSV del banco

- Primera línea: encabezado.
- Campos separados por coma, en este orden: fecha, descripción, monto. Sin comillas.
- Fecha `DD/MM/AAAA`.
- Monto con punto decimal; los gastos vienen en negativo y los ingresos en positivo.

## Requisitos

### R1 — Comando de importación

- **R1.1** WHEN la persona ejecuta el comando de importación con la ruta de un CSV del banco, THE
  SYSTEM SHALL agregar a los movimientos guardados cada línea válida y no duplicada del archivo.
- **R1.2** WHEN termina una importación, THE SYSTEM SHALL mostrar la cantidad de movimientos
  importados.
- **R1.3** WHEN termina una importación, THE SYSTEM SHALL mostrar la cantidad de líneas descartadas
  por duplicadas.
- **R1.4** WHEN termina una importación, THE SYSTEM SHALL mostrar cuántos de los movimientos
  importados quedaron en «Sin categoría».
- **R1.5** IF el archivo indicado no existe o no se puede leer, THEN THE SYSTEM SHALL informar el
  error, terminar con código de salida distinto de 0 y dejar los movimientos guardados sin cambios.
- **R1.6** IF el comando de importación se ejecuta sin ruta de archivo, THEN THE SYSTEM SHALL
  mostrar cómo se usa y terminar con código de salida distinto de 0.

### R2 — Lectura del CSV

- **R2.1** THE SYSTEM SHALL tratar la primera línea del archivo como encabezado y no importarla.
- **R2.2** WHEN una línea trae la fecha `DD/MM/AAAA`, THE SYSTEM SHALL guardar el movimiento con esa
  misma fecha en el formato `AAAA-MM-DD` que usa el resto de la aplicación, de modo que
  `finanzas listar AAAA-MM` lo encuentre en su mes.
- **R2.3** WHEN una línea trae un monto negativo, THE SYSTEM SHALL importarla como gasto con el
  valor absoluto de ese monto.
- **R2.4** WHEN una línea trae un monto positivo, THE SYSTEM SHALL ignorarla sin importarla y sin
  informarla como error.
- **R2.5** WHEN una línea está vacía, THE SYSTEM SHALL ignorarla sin informarla como error.
- **R2.6** IF una línea no tiene exactamente tres campos, THEN THE SYSTEM SHALL no importarla e
  informarla con su número de línea.
- **R2.7** IF una línea tiene una fecha que no es una fecha `DD/MM/AAAA` válida, THEN THE SYSTEM
  SHALL no importarla e informarla con su número de línea.
- **R2.8** IF una línea tiene un monto que no es un número o que es 0, THEN THE SYSTEM SHALL no
  importarla e informarla con su número de línea.
- **R2.9** IF una línea tiene la descripción vacía, THEN THE SYSTEM SHALL no importarla e informarla
  con su número de línea.
- **R2.10** WHEN el archivo tiene líneas con error, THE SYSTEM SHALL importar igualmente sus líneas
  válidas y no duplicadas.
- **R2.11** THE SYSTEM SHALL numerar las líneas que informa contando el encabezado como línea 1.

### R3 — Categorización por reglas

- **R3.1** THE SYSTEM SHALL leer las reglas de categorización de un archivo que la persona puede
  editar a mano, en cada importación.
- **R3.2** IF el archivo de reglas no existe al importar, THEN THE SYSTEM SHALL crearlo con las
  reglas iniciales: `SUBE` y `colectivo` → Transporte; `farmacia` → Salud; `supermercado` y
  `resto` → Comida.
- **R3.3** WHEN la descripción de un movimiento importado contiene la palabra clave de una regla,
  THE SYSTEM SHALL asignarle la categoría de esa regla.
- **R3.4** THE SYSTEM SHALL comparar palabra clave y descripción sin distinguir mayúsculas de
  minúsculas.
- **R3.5** THE SYSTEM SHALL comparar palabra clave y descripción sin distinguir letras con y sin
  tilde.
- **R3.6** WHEN la descripción contiene palabras clave de más de una regla, THE SYSTEM SHALL
  asignar la categoría de la primera de esas reglas en el orden del archivo.
- **R3.7** WHEN la descripción no contiene la palabra clave de ninguna regla, THE SYSTEM SHALL
  guardar el movimiento con la categoría «Sin categoría».
- **R3.8** IF el archivo de reglas no se puede interpretar, THEN THE SYSTEM SHALL informar el error,
  terminar con código de salida distinto de 0 y no importar nada.
- **R3.9** IF una regla del archivo nombra una categoría que no es Comida, Transporte, Servicios,
  Ocio, Salud ni Otros, THEN THE SYSTEM SHALL informar el error, terminar con código de salida
  distinto de 0 y no importar nada.

### R4 — «Sin categoría» en el listado

- **R4.1** WHEN la persona lista movimientos, THE SYSTEM SHALL mostrar «Sin categoría», escrito tal
  cual, como categoría de los movimientos que quedaron sin categoría.

### R5 — Duplicados

- **R5.1** IF una línea tiene la misma fecha, descripción y monto que un movimiento ya guardado,
  THEN THE SYSTEM SHALL no importarla y contarla como duplicada.
- **R5.2** IF una línea tiene la misma fecha, descripción y monto que una línea anterior del mismo
  archivo, THEN THE SYSTEM SHALL no importarla y contarla como duplicada.

## Supuestos

- El comando es `finanzas importar <archivo.csv>` y guarda en el mismo archivo de datos que
  `agregar` y `listar` (incluido el override `FINANZAS_DATOS`).
- La ubicación y el formato del archivo de reglas se deciden en el design.
- «Contiene la palabra clave» es contener la subcadena: `resto` matchea `RESTO LA ESQUINA` y también
  `RESTAURANTE`.
- La comparación de duplicados es entre movimientos ya normalizados (fecha `AAAA-MM-DD`, monto
  positivo), con la descripción comparada exacta. Dos gastos idénticos el mismo día cuentan como
  duplicado y el segundo se pierde (aceptado).
- Las líneas con error se informan una por una; los ingresos ignorados no se informan ni se cuentan.
- Si hubo líneas con error pero el archivo se pudo procesar, el comando termina con código 0.
- El archivo viene en UTF-8. Como el CSV no admite comillas, una descripción con coma da una línea
  con más de tres campos, que se informa como error (R2.6).
- `agregar` sigue igual: no ofrece «Sin categoría» como opción.

## Preguntas abiertas

Ninguna.

## Enmiendas

Ninguna.
