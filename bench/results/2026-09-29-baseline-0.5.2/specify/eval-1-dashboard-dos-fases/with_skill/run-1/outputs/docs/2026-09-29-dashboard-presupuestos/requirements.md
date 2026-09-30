# Requirements — Dashboard de presupuestos

> Estado: aprobado (2026-09-29)

## Introducción

Hoy la CLI registra gastos y los lista por mes, pero no hay forma de saber si en un mes se está
gastando de más en alguna categoría: no existen los presupuestos, y comparar a mano el listado con
un monto en la cabeza no escala.

Esta feature agrega dos cosas: cargar un presupuesto mensual por categoría, y un dashboard que, para
un mes dado, muestra por categoría cuánto se gastó, cuánto se había presupuestado, qué porcentaje se
usó y una alerta cuando se pasó del presupuesto. Las categorías a las que les falta uno de los dos
lados (gasto sin presupuesto, o presupuesto sin gasto) aparecen igual, marcadas como «sin definir».

## Alcance

**Incluye**
- Un comando para cargar el presupuesto de una categoría en un mes.
- Un comando que muestra el dashboard de un mes.

**No incluye (por ahora)**
- Borrar presupuestos o listarlos sueltos: el dashboard alcanza para verlos, y para corregir uno se
  lo vuelve a cargar.
- Presupuestos recurrentes o copiados de un mes a otro: cada mes se carga por su cuenta.
- Fila de totales del mes.
- Ingresos: el sistema sigue registrando solo gastos.

## Requirements

### R1 — Cargar el presupuesto de una categoría en un mes

**User story:** Como persona que registra sus gastos, quiero fijar cuánto pienso gastar en cada
categoría en un mes, para después poder compararlo con lo que gasté de verdad.

#### Criterios de aceptación

1. WHEN el usuario carga un presupuesto con un mes `AAAA-MM`, una categoría conocida y un monto
   positivo
   THE SYSTEM SHALL guardar ese monto como presupuesto de esa categoría para ese mes.
2. WHEN el usuario carga un presupuesto válido
   THE SYSTEM SHALL confirmarlo con un mensaje por consola.
3. WHEN el usuario vuelve a ejecutar la aplicación después de cargar un presupuesto
   THE SYSTEM SHALL seguir teniendo ese presupuesto disponible.
4. WHEN el usuario carga un presupuesto para una categoría y un mes que ya tenían uno
   THE SYSTEM SHALL reemplazar el monto anterior por el nuevo.
5. IF el mes no tiene el formato `AAAA-MM`
   THEN THE SYSTEM SHALL terminar con un mensaje de error y un código de salida distinto de 0.
6. IF la categoría no es una de las categorías conocidas
   THEN THE SYSTEM SHALL terminar con un mensaje de error y un código de salida distinto de 0.
7. IF el monto no es un número mayor que 0
   THEN THE SYSTEM SHALL terminar con un mensaje de error y un código de salida distinto de 0.
8. IF la carga termina con error
   THEN THE SYSTEM SHALL dejar sin cambios los presupuestos ya guardados.

### R2 — Dashboard de un mes

**User story:** Como persona que registra sus gastos, quiero ver de un vistazo, para un mes, cuánto
llevo gastado contra lo presupuestado en cada categoría, para detectar dónde me pasé.

#### Criterios de aceptación

1. WHEN el usuario pide el dashboard de un mes
   THE SYSTEM SHALL mostrar una fila por cada categoría que tenga gasto o presupuesto en ese mes.
2. WHEN el usuario pide el dashboard de un mes
   THE SYSTEM SHALL omitir las categorías que no tienen ni gasto ni presupuesto en ese mes.
3. THE SYSTEM SHALL mostrar las filas en el orden fijo de las categorías (Comida, Transporte,
   Servicios, Ocio, Salud, Otros).
4. THE SYSTEM SHALL mostrar en cada fila el total gastado en la categoría durante ese mes, contando
   solo los movimientos de ese mes.
5. WHERE la categoría tiene presupuesto para ese mes
   THE SYSTEM SHALL mostrar en su fila el monto presupuestado.
6. THE SYSTEM SHALL ignorar los presupuestos cargados para otros meses.
7. WHERE la categoría tiene gasto y presupuesto en ese mes
   THE SYSTEM SHALL mostrar el porcentaje usado (gastado / presupuestado × 100) redondeado al
   entero más cercano.
8. IF la categoría tiene gasto y presupuesto en el mes, y lo gastado es estrictamente mayor que lo
   presupuestado
   THEN THE SYSTEM SHALL mostrar una alerta en esa fila.
9. IF la categoría tiene gasto y presupuesto en el mes, y lo gastado es menor o igual que lo
   presupuestado
   THEN THE SYSTEM SHALL no mostrar alerta en esa fila.
10. IF la categoría tiene gasto en el mes pero no tiene presupuesto
    THEN THE SYSTEM SHALL marcar su fila como «sin definir».
11. IF la categoría tiene presupuesto en el mes pero no tiene gasto
    THEN THE SYSTEM SHALL marcar su fila como «sin definir».
12. WHEN el usuario pide el dashboard sin indicar un mes
    THE SYSTEM SHALL mostrar el dashboard del mes actual.
13. IF el mes indicado no tiene el formato `AAAA-MM`
    THEN THE SYSTEM SHALL terminar con un mensaje de error y un código de salida distinto de 0.
14. IF el mes no tiene ni gastos ni presupuestos
    THEN THE SYSTEM SHALL mostrar el mensaje «no hay datos para AAAA-MM» (con el mes pedido) y
    terminar con código de salida 0.
15. IF la fila de una categoría está marcada como «sin definir»
    THEN THE SYSTEM SHALL no mostrar alerta en esa fila.

## Supuestos

- Las categorías conocidas son las seis que ya usa el registro de movimientos; esta feature no
  agrega ni permite categorías nuevas.
- Los presupuestos se guardan en el mismo lugar local que los movimientos (la ubicación concreta la
  decide el design), y sobreviven entre ejecuciones igual que ellos.
- Recargar un presupuesto existente lo reemplaza (R1.4): es la única forma de corregirlo mientras no
  exista un comando para borrar.
- La alerta se decide comparando los montos, no el porcentaje redondeado (R2.8, R2.9): un 100,4 %
  se muestra como «100 %» pero sí alerta, porque el gasto supera al presupuesto.
- Montos en pesos, como los movimientos.

## Preguntas abiertas

- Ninguna.

## Enmiendas
