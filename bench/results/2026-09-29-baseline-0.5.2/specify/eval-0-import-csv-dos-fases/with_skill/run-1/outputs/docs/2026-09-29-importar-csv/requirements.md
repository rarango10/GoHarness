# Requirements — Importar movimientos del banco

> Estado: aprobado (2026-09-29)

## Introducción

Hoy cada gasto se carga a mano, uno por uno, con el comando `agregar`. El banco ya entrega esos
mismos gastos en un extracto CSV, así que tipearlos de nuevo es lento y abre la puerta a errores y
olvidos.

Esta feature permite importar ese extracto desde la línea de comandos. Cada gasto del archivo queda
registrado como un movimiento, con una categoría asignada automáticamente según palabras clave de su
descripción. Lo que no se reconoce queda como «Sin categoría». Importar dos veces el mismo extracto
no duplica nada. Al terminar, el comando informa qué importó, qué omitió y por qué.

## Alcance

**Incluye**
- Leer el extracto CSV de un único banco, con formato fijo: fecha, descripción y monto.
- Registrar los gastos del extracto e ignorar los ingresos.
- Categorizar con un conjunto fijo de reglas por palabra clave.
- Detectar movimientos ya guardados, para no duplicarlos.
- Omitir las filas inválidas, informarlas y seguir con el resto.

**No incluye (por ahora)**
- Extractos de otros bancos u otros formatos: se acordó un solo banco.
- Reglas configurables por la persona: las palabras clave son fijas en esta versión.
- Recategorizar a mano los movimientos «Sin categoría»: es otra capacidad, sobre datos ya guardados.
- Registrar ingresos: la app modela solo gastos.
- Campos entre comillas o descripciones con comas (ver Supuestos).
- Vista previa sin guardar, o deshacer una importación.

## Tabla de reglas

Una descripción pertenece a una categoría si **contiene** alguna de sus palabras clave. El orden de
las filas es la prioridad: si hay coincidencias con más de una categoría, gana la que aparece más
arriba. «Otros» no tiene palabras clave: solo se asigna a mano.

| Prioridad | Categoría  | Palabras clave |
|-----------|------------|----------------|
| 1 | Comida     | supermercado, carrefour, coto, jumbo, restaurante, rappi, pedidosya, panaderia, verduleria |
| 2 | Transporte | uber, cabify, didi, sube, ypf, shell, axion, peaje, estacionamiento |
| 3 | Servicios  | edenor, edesur, metrogas, aysa, telecentro, movistar, claro, fibertel, expensas |
| 4 | Ocio       | netflix, spotify, disney, hbo, steam, cine, teatro |
| 5 | Salud      | farmacia, farmacity, osde, swiss medical, medico, laboratorio, odontolog |

## Requirements

### R1 — Leer el extracto del banco

**User story:** Como usuario, quiero importar el extracto CSV de mi banco, para no cargar a mano cada gasto.

#### Criterios de aceptación

1. WHEN se ejecuta el comando de importación sobre un archivo CSV con el formato del banco
   THE SYSTEM SHALL tratar cada línea posterior a la primera como una fila con fecha, descripción y monto, separados por coma.
2. WHEN una fila trae la fecha en formato DD/MM/AAAA
   THE SYSTEM SHALL registrar el movimiento con esa misma fecha en formato AAAA-MM-DD.
3. WHEN una fila trae un monto negativo
   THE SYSTEM SHALL registrar el movimiento como gasto por el valor absoluto de ese monto.
4. WHEN una fila trae espacios al principio o al final de la descripción
   THE SYSTEM SHALL registrar la descripción sin esos espacios.
5. WHEN el archivo usa fines de línea de Windows (CRLF)
   THE SYSTEM SHALL leer sus filas igual que con fines de línea LF.
6. WHEN el archivo contiene líneas vacías
   THE SYSTEM SHALL ignorarlas sin reportarlas como inválidas.
7. IF el archivo no existe en la ruta indicada
   THEN THE SYSTEM SHALL terminar con un mensaje que indique la ruta buscada.
8. IF el archivo no existe en la ruta indicada
   THEN THE SYSTEM SHALL terminar con un código de salida distinto de cero.
9. IF se ejecuta el comando de importación sin indicar la ruta de un archivo
   THEN THE SYSTEM SHALL mostrar cómo se usa el comando.
10. IF se ejecuta el comando de importación sin indicar la ruta de un archivo
    THEN THE SYSTEM SHALL terminar con un código de salida distinto de cero.

### R2 — Filas inválidas

**User story:** Como usuario, quiero que una fila rota no me impida importar el resto, para no tener que corregir el extracto a mano antes de usarlo.

#### Criterios de aceptación

1. IF una fila no tiene exactamente tres columnas
   THEN THE SYSTEM SHALL omitirla como inválida.
2. IF la fecha de una fila no tiene formato DD/MM/AAAA o no es una fecha del calendario (por ejemplo, 31/02/2026)
   THEN THE SYSTEM SHALL omitirla como inválida.
3. IF el monto de una fila no es un número, entero o con punto decimal (por ejemplo, `-45` o `-45.50`)
   THEN THE SYSTEM SHALL omitirla como inválida.
4. IF el monto de una fila es cero
   THEN THE SYSTEM SHALL omitirla como inválida.
5. IF la descripción de una fila está vacía o tiene solo espacios
   THEN THE SYSTEM SHALL omitirla como inválida.
6. WHEN se omitió al menos una fila inválida
   THE SYSTEM SHALL informar, por cada una, su número de línea en el archivo.
7. WHEN se omitió al menos una fila inválida
   THE SYSTEM SHALL informar, por cada una, el motivo por el que se omitió.
8. WHEN el archivo tiene filas inválidas y filas válidas
   THE SYSTEM SHALL registrar las filas válidas.

### R3 — Ingresos

**User story:** Como usuario, quiero que los ingresos del extracto no se registren como gastos, para que mis totales por mes no se inflen.

#### Criterios de aceptación

1. IF una fila trae un monto positivo
   THEN THE SYSTEM SHALL omitirla sin registrarla.
2. WHEN se omitió al menos un ingreso
   THE SYSTEM SHALL informar cuántos ingresos omitió, separados de las filas inválidas.

### R4 — Categorización por palabra clave

**User story:** Como usuario, quiero que cada gasto importado llegue con una categoría, para no tener que clasificarlos uno por uno.

#### Criterios de aceptación

1. WHEN la descripción de un gasto importado contiene una palabra clave de la Tabla de reglas
   THE SYSTEM SHALL asignarle la categoría de esa palabra clave.
2. WHEN la descripción coincide con una palabra clave salvo por mayúsculas y minúsculas
   THE SYSTEM SHALL considerarla una coincidencia.
3. WHEN la descripción coincide con una palabra clave salvo por tildes
   THE SYSTEM SHALL considerarla una coincidencia.
4. WHEN la descripción contiene palabras clave de más de una categoría
   THE SYSTEM SHALL asignar la categoría de mayor prioridad según la Tabla de reglas.
5. IF la descripción no contiene ninguna palabra clave de la Tabla de reglas
   THEN THE SYSTEM SHALL asignarle la categoría «Sin categoría».

### R5 — Duplicados

**User story:** Como usuario, quiero poder importar un extracto que se superpone con uno anterior, para no tener que recortarlo a mano.

#### Criterios de aceptación

1. IF una fila tiene la misma fecha, descripción y monto que un movimiento ya guardado antes de la importación
   THEN THE SYSTEM SHALL omitirla sin registrarla.
2. WHEN dos filas del mismo archivo tienen la misma fecha, descripción y monto, y ninguna coincide con un movimiento ya guardado
   THE SYSTEM SHALL registrar las dos.
3. WHEN se importa por segunda vez el mismo archivo
   THE SYSTEM SHALL no registrar ningún movimiento nuevo.
4. WHEN se omitió al menos un duplicado
   THE SYSTEM SHALL informar cuántos duplicados omitió.

### R6 — Resultado de la importación

**User story:** Como usuario, quiero saber qué pasó con cada importación y encontrar después lo importado, para confiar en que mis datos están completos.

#### Criterios de aceptación

1. WHEN termina una importación
   THE SYSTEM SHALL informar cuántos movimientos registró.
2. WHEN termina una importación
   THE SYSTEM SHALL informar cuántos de los movimientos registrados quedaron como «Sin categoría».
3. WHEN termina una importación
   THE SYSTEM SHALL conservar todos los movimientos que estaban guardados antes de importar.
4. WHEN se listan los movimientos de un mes que incluye movimientos importados
   THE SYSTEM SHALL mostrarlos con la categoría que se les asignó, incluida «Sin categoría».
5. WHEN una importación termina sobre un archivo existente, aunque haya omitido filas
   THE SYSTEM SHALL terminar con código de salida cero.

## Supuestos

- **Ingresos** (elegido): las filas con monto positivo se omiten y se informa cuántas fueron (R3). No se tratan como error.
- **Palabras clave** (elegido): la Tabla de reglas es una lista inicial pensada para comercios argentinos. Se evitaron palabras cortas que aparecen dentro de otras (`dia`, `super`, `personal`). Una coincidencia es la palabra contenida en cualquier parte de la descripción, no necesariamente una palabra completa.
- **Prioridad entre categorías** (elegido): gana la categoría que aparece primero en la tabla (R4.4).
- **Duplicados** (elegido): se comparan contra lo ya guardado, no dentro del mismo archivo (R5.2). Así, dos gastos iguales el mismo día cuentan como dos. Hay un límite conocido: si un extracto nuevo trae dos gastos iguales y uno de ellos ya había entrado con un extracto anterior, los dos se toman como duplicados. La comparación también alcanza a los movimientos cargados con `agregar`.
- La primera línea del archivo es siempre el encabezado y se descarta sin validar su contenido. Si el archivo no es del banco, lo detectan las filas inválidas (R2).
- Las descripciones no contienen comas ni comillas. Una fila con más de tres columnas se omite como inválida (R2.1).
- El archivo está en UTF-8 y los montos están en pesos, como el resto de la app.
- Los movimientos se guardan en el mismo almacén local que usan `agregar` y `listar`.

## Preguntas abiertas

- Ninguna bloqueante.

## Enmiendas
