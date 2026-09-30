# Requirements — Dashboard de presupuesto por categoría

> Estado: aprobado (2026-09-30)

## Introducción

Hoy la CLI registra gastos y los lista por mes, pero no hay forma de saber si en un mes se está
gastando más de lo previsto en alguna categoría. Hay que mirar el listado y sumar a mano, y además
no existe ningún lugar donde anotar cuánto se piensa gastar.

Con esta feature, la persona fija una sola vez cuánto quiere gastar por mes en cada categoría y
después, para cualquier mes, pide un resumen: por categoría ve lo gastado, lo presupuestado, qué
porcentaje del presupuesto usó y una alerta cuando se pasó. Las categorías que tienen gasto pero no
tienen presupuesto (o al revés) aparecen igual, marcadas como «sin definir», para que ningún gasto
quede afuera de la vista.

## Alcance

**Incluye**
- Fijar el presupuesto mensual de una categoría y reemplazarlo si ya existía.
- Un presupuesto por categoría, que vale igual para todos los meses.
- El dashboard de un mes (el indicado, o el actual si no se indica ninguno): una fila por
  categoría con gastado, presupuestado, % usado y alerta si pasa el 100%.
- Las filas «sin definir» para las categorías con gasto y sin presupuesto, y para las que tienen
  presupuesto y no tienen gasto.

**No incluye (por ahora)**
- Presupuestos distintos para cada mes: no se pidió, y uno fijo cubre el uso actual.
- Borrar un presupuesto: no se habló en el brainstorm.
- Fila de totales del mes: no se habló en el brainstorm.
- Validar la categoría en `agregar`, que hoy acepta cualquier texto: es otra feature.

## Requirements

### R1 — Fijar el presupuesto de una categoría

**User story:** Como persona que registra sus gastos, quiero fijar cuánto pienso gastar por mes en
cada categoría, para tener contra qué comparar lo que gasto.

#### Criterios de aceptación

1. WHEN la persona fija un presupuesto con una categoría conocida y un monto mayor que 0
   THE SYSTEM SHALL guardarlo de forma que siga disponible en ejecuciones posteriores.
2. WHEN la persona fija un presupuesto para una categoría que ya tenía uno
   THE SYSTEM SHALL reemplazar el monto anterior por el nuevo.
3. IF la categoría indicada no es una de las categorías conocidas (Comida, Transporte, Servicios,
   Ocio, Salud, Otros)
   THEN THE SYSTEM SHALL rechazar el pedido sin modificar los presupuestos guardados.
4. IF el monto indicado no es un número mayor que 0
   THEN THE SYSTEM SHALL rechazar el pedido sin modificar los presupuestos guardados.
5. WHEN se rechaza un pedido de fijar presupuesto
   THE SYSTEM SHALL terminar con código de salida 1.

### R2 — Dashboard de un mes

**User story:** Como persona que registra sus gastos, quiero ver en un mes cuánto gasté por
categoría contra lo presupuestado, para darme cuenta de dónde me estoy pasando.

#### Criterios de aceptación

1. WHEN la persona pide el dashboard de un mes
   THE SYSTEM SHALL mostrar una fila por cada categoría que tenga gasto en ese mes o un presupuesto
   definido.
2. IF una categoría no tiene gasto en ese mes ni presupuesto definido
   THEN THE SYSTEM SHALL no mostrarla en el dashboard.
3. WHEN la persona pide el dashboard de un mes
   THE SYSTEM SHALL mostrar en cada fila como gastado la suma de los montos de los movimientos de
   esa categoría con fecha dentro de ese mes.
4. WHERE la categoría tiene un presupuesto definido
   THE SYSTEM SHALL mostrar ese monto como presupuestado en el dashboard de cualquier mes.
5. WHERE la categoría tiene gasto en el mes y presupuesto definido
   THE SYSTEM SHALL mostrar como % usado el gastado dividido el presupuestado, por 100, redondeado
   al entero más cercano.
6. WHEN el gastado de una categoría supera estrictamente a su presupuestado
   THE SYSTEM SHALL mostrar una alerta en esa fila.
7. WHEN el gastado de una categoría es menor o igual que su presupuestado
   THE SYSTEM SHALL no mostrar alerta en esa fila.
8. WHEN la persona pide el dashboard de un mes
   THE SYSTEM SHALL ordenar las filas alfabéticamente por nombre de categoría.
9. WHEN la persona pide el dashboard de un mes
   THE SYSTEM SHALL mostrar los montos de gastado y presupuestado con 2 decimales.

### R3 — Categorías «sin definir»

**User story:** Como persona que registra sus gastos, quiero ver también las categorías a las que
les falta el gasto o el presupuesto, para que ningún gasto quede afuera y para notar qué
presupuestos me faltan.

#### Criterios de aceptación

1. WHERE la categoría tiene gasto en el mes y no tiene presupuesto definido
   THE SYSTEM SHALL mostrar «sin definir» en lugar del % usado.
2. WHERE la categoría no tiene presupuesto definido
   THE SYSTEM SHALL mostrar un guion (—) como presupuestado.
3. WHERE la categoría tiene presupuesto definido y no tiene gasto en el mes
   THE SYSTEM SHALL mostrar «sin definir» en lugar del % usado.
4. WHERE la categoría tiene presupuesto definido y no tiene gasto en el mes
   THE SYSTEM SHALL mostrar como gastado 0.00.
5. WHERE una fila muestra «sin definir»
   THE SYSTEM SHALL no mostrar alerta en esa fila.

### R4 — Elección del mes

**User story:** Como persona que registra sus gastos, quiero pedir el dashboard sin escribir el mes
cuando me interesa el actual, para consultarlo rápido.

#### Criterios de aceptación

1. WHEN la persona pide el dashboard sin indicar mes
   THE SYSTEM SHALL usar el mes de la fecha actual del sistema.
2. IF el mes indicado no es un mes válido en formato AAAA-MM (mes entre 01 y 12)
   THEN THE SYSTEM SHALL mostrar un mensaje de error en lugar del dashboard.
3. IF el mes indicado no es un mes válido en formato AAAA-MM
   THEN THE SYSTEM SHALL terminar con código de salida 1.

## Supuestos

- Los nombres de los comandos (el de fijar presupuesto y el del dashboard) y el lugar donde se
  guardan los presupuestos se deciden en `design.md`; acá solo importa que el presupuesto persista
  entre ejecuciones.
- R3.5 cubre el caso de gasto sin presupuesto, que en rigor está «pasado», porque sin presupuesto
  no hay contra qué compararlo. La marca «sin definir» ya lo señala.
- Un mes válido sin gastos ni presupuestos muestra el dashboard sin filas, sin un mensaje especial.
- La separación entre el cálculo (función pura) y la impresión, acordada en el brainstorm, es una
  restricción de diseño y no un comportamiento observable: se fija en `design.md`.
- Esta feature no resuelve entradas de backlog, porque `docs/pendientes.md` todavía no existe.

## Preguntas abiertas

- Ninguna.

## Enmiendas
