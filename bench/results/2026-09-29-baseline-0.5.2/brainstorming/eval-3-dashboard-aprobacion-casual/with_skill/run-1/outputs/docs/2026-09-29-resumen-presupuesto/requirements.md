# Requirements — Resumen de gastos contra presupuesto

> Estado: pendiente de aprobación

## Contexto

Hoy la CLI registra movimientos y los lista por mes, pero no hay forma de saber cuánto se lleva
gastado en cada categoría respecto de lo que uno se propuso gastar. Esta feature agrega presupuestos
por categoría y un resumen del mes que los compara con lo gastado.

## Alcance

Incluye:

- Cargar y reemplazar el presupuesto mensual de una categoría desde la CLI.
- Un resumen por categoría de un mes (por defecto, el mes en curso): gastado, presupuesto, restante,
  porcentaje consumido y una barra de texto, con una fila de total.

Queda afuera por ahora:

- Presupuestos distintos por mes (el presupuesto es fijo y vale para todos los meses).
- Borrar un presupuesto ya cargado.
- Una interfaz gráfica o web.
- Validar la categoría en `agregar` (anotado en el backlog como P1).

## Supuestos

- Los presupuestos persisten entre ejecuciones, en un archivo local aparte del de movimientos.
- Los montos se muestran con dos decimales, igual que `listar`.
- El porcentaje se redondea al entero más cercano.
- La barra tiene 10 caracteres; cada uno representa un 10 % del presupuesto.
- Las filas salen en el orden fijo de las categorías: Comida, Transporte, Servicios, Ocio, Salud, Otros.
- El «mes en curso» se toma de la fecha local del sistema.
- Los errores de uso terminan con código de salida distinto de 0, igual que `agregar`.
- Un archivo de presupuestos malformado no se valida al leerlo (mismo trato que el de movimientos).
- Un movimiento con una categoría fuera de las seis (posible hoy por P1) no aparece en el resumen ni
  suma al total.

## Requisitos

### R1 — Cargar un presupuesto

**Historia:** Como usuario, quiero fijar cuánto pienso gastar por mes en una categoría, para poder
compararlo después con lo que gasto.

- **R1.1** WHEN el usuario ejecuta `finanzas presupuesto <categoría> <monto>` con una categoría
  válida y un monto mayor que 0, THE SYSTEM SHALL guardar ese monto como presupuesto de la categoría.
- **R1.2** WHEN el usuario carga un presupuesto para una categoría que ya tenía uno, THE SYSTEM SHALL
  reemplazar el monto anterior por el nuevo.
- **R1.3** WHEN el usuario carga un presupuesto para una categoría, THE SYSTEM SHALL conservar sin
  cambios los presupuestos de las demás categorías.
- **R1.4** IF la categoría no es una de Comida, Transporte, Servicios, Ocio, Salud u Otros, THEN THE
  SYSTEM SHALL rechazar la carga con el mensaje «categoría inválida» sin modificar los presupuestos.
- **R1.5** IF el monto no es un número mayor que 0, THEN THE SYSTEM SHALL rechazar la carga con el
  mensaje «monto inválido» sin modificar los presupuestos.
- **R1.6** WHEN el usuario ejecuta la aplicación otra vez después de cargar un presupuesto, THE SYSTEM
  SHALL seguir usando ese presupuesto.

### R2 — Elegir el mes del resumen

**Historia:** Como usuario, quiero ver el resumen del mes en curso sin escribir la fecha, y poder
mirar otro mes si lo necesito.

- **R2.1** WHEN el usuario ejecuta `finanzas resumen` sin argumento, THE SYSTEM SHALL resumir los
  movimientos del mes en curso.
- **R2.2** WHEN el usuario ejecuta `finanzas resumen <AAAA-MM>`, THE SYSTEM SHALL resumir los
  movimientos de ese mes.
- **R2.3** IF el argumento no tiene el formato AAAA-MM, THEN THE SYSTEM SHALL rechazarlo con el
  mensaje «mes inválido».

### R3 — Contenido del resumen por categoría

**Historia:** Como usuario, quiero ver por categoría cuánto gasté y cuánto me queda, para saber
dónde estoy pasado.

- **R3.1** THE SYSTEM SHALL mostrar, para cada categoría del resumen, el total gastado en el mes.
- **R3.2** WHERE una categoría tiene presupuesto, THE SYSTEM SHALL mostrar su presupuesto.
- **R3.3** WHERE una categoría tiene presupuesto, THE SYSTEM SHALL mostrar el restante como
  presupuesto menos gastado.
- **R3.4** WHERE una categoría tiene presupuesto, THE SYSTEM SHALL mostrar el porcentaje del
  presupuesto consumido.
- **R3.5** WHERE una categoría tiene presupuesto, THE SYSTEM SHALL mostrar una barra de 10
  caracteres con un carácter lleno por cada 10 % consumido.
- **R3.6** WHERE una categoría tiene gasto en el mes pero no tiene presupuesto, THE SYSTEM SHALL
  mostrar «—» en presupuesto, restante y porcentaje.
- **R3.7** WHERE una categoría tiene presupuesto pero ningún gasto en el mes, THE SYSTEM SHALL
  mostrarla con gastado 0 y porcentaje 0 %.
- **R3.8** WHERE una categoría no tiene gasto en el mes ni presupuesto, THE SYSTEM SHALL omitirla del
  resumen.
- **R3.9** THE SYSTEM SHALL listar las categorías en el orden Comida, Transporte, Servicios, Ocio,
  Salud, Otros.

### R4 — Presupuesto excedido

**Historia:** Como usuario, quiero que el resumen me marque cuándo me pasé, para no tener que
calcularlo.

- **R4.1** IF el gasto de una categoría supera su presupuesto, THEN THE SYSTEM SHALL mostrar el
  restante como número negativo.
- **R4.2** IF el gasto de una categoría supera su presupuesto, THEN THE SYSTEM SHALL mostrar la
  barra completa, sin superar los 10 caracteres.
- **R4.3** IF el gasto de una categoría supera su presupuesto, THEN THE SYSTEM SHALL agregar la
  marca «EXCEDIDO» a su fila.

### R5 — Total

**Historia:** Como usuario, quiero ver el total del mes contra el total presupuestado.

- **R5.1** THE SYSTEM SHALL mostrar una fila de total con la suma de lo gastado en todas las
  categorías del resumen.
- **R5.2** THE SYSTEM SHALL mostrar en la fila de total la suma de los presupuestos de las
  categorías que tienen uno.
- **R5.3** THE SYSTEM SHALL mostrar en la fila de total el restante como total presupuestado menos
  total gastado.
- **R5.4** THE SYSTEM SHALL mostrar en la fila de total el porcentaje consumido del total
  presupuestado.
- **R5.5** IF ninguna categoría tiene presupuesto, THEN THE SYSTEM SHALL mostrar «—» en presupuesto,
  restante y porcentaje de la fila de total.

### R6 — Mes vacío

- **R6.1** IF el mes no tiene movimientos y no hay ningún presupuesto cargado, THEN THE SYSTEM SHALL
  mostrar el mensaje «Sin movimientos ni presupuestos para <AAAA-MM>.» en lugar de la tabla.
