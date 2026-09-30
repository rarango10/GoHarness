# Requirements — Alertas de presupuesto

> Estado: pendiente de aprobación

## Introducción

Hoy la CLI registra gastos y los lista por mes, pero no dice nada cuando una categoría se va de
las manos: para darse cuenta de que se gastó de más en Comida hay que listar el mes y sumar a mano.

Con esta feature la persona define cuánto quiere gastar por mes en cada categoría, y al registrar
un gasto la CLI le avisa si con él esa categoría quedó por encima de lo previsto para ese mes.

## Alcance

**Incluye**
- Definir un presupuesto mensual por categoría, que vale igual para todos los meses.
- Redefinirlo (el valor nuevo reemplaza al anterior).
- Avisar, al registrar un gasto, si su categoría superó el presupuesto en el mes del gasto.

**No incluye (por ahora)**
- Presupuestos distintos para cada mes: un único valor por categoría alcanza para el pedido.
- Borrar o listar presupuestos: no se pidió; redefinir cubre el caso de corregir un valor.
- Avisos preventivos al acercarse al límite (por ejemplo, al 80 %): el pedido es avisar al pasarse.
- Mostrar alertas al listar: el aviso ocurre en el momento de registrar el gasto.
- Validar la categoría al registrar un gasto: es un defecto previo del comando de registro, anotado
  en el backlog del proyecto.

## Requirements

### R1 — Definir el presupuesto de una categoría

**User story:** Como persona que registra sus gastos, quiero fijar cuánto quiero gastar por mes en
una categoría, para que la CLI tenga contra qué comparar lo que gasto.

#### Criterios de aceptación

1. WHEN la persona define un presupuesto con una categoría válida y un monto positivo
   THE SYSTEM SHALL confirmar que el presupuesto quedó guardado.
2. WHEN la persona define un presupuesto y después ejecuta la CLI otra vez
   THE SYSTEM SHALL seguir usando ese presupuesto.
3. WHEN la persona define un presupuesto para una categoría que ya tenía uno
   THE SYSTEM SHALL usar el monto nuevo en lugar del anterior.
4. WHEN la persona define el presupuesto de una categoría
   THE SYSTEM SHALL conservar sin cambios los presupuestos de las demás categorías.
5. IF la categoría indicada no es una de las categorías de la CLI
   THEN THE SYSTEM SHALL rechazar el presupuesto con un mensaje de error que indique que la categoría no es válida.
6. IF el monto indicado falta o no es un número mayor que cero
   THEN THE SYSTEM SHALL rechazar el presupuesto con un mensaje de error que indique que el monto no es válido.
7. IF la definición es rechazada
   THEN THE SYSTEM SHALL dejar los presupuestos guardados tal como estaban.
8. IF la definición es rechazada
   THEN THE SYSTEM SHALL terminar con código de salida distinto de cero.

### R2 — Avisar cuando una categoría se pasa del presupuesto

**User story:** Como persona que registra sus gastos, quiero que la CLI me avise al registrar un
gasto que dejó a su categoría por encima del presupuesto del mes, para enterarme en el momento.

#### Criterios de aceptación

1. WHEN la persona registra un gasto y el total de su categoría en el mes de la fecha del gasto, contando ese gasto, supera el presupuesto de la categoría
   THE SYSTEM SHALL mostrar un aviso que nombra la categoría, el mes, el total gastado y el presupuesto.
2. WHEN la persona registra un gasto y el total de su categoría en ese mes es menor o igual al presupuesto
   THE SYSTEM SHALL no mostrar ningún aviso.
3. IF la categoría del gasto no tiene presupuesto definido
   THEN THE SYSTEM SHALL no mostrar ningún aviso.
4. WHEN el total del mes se calcula para el aviso
   THE SYSTEM SHALL contar solo los gastos de esa categoría cuya fecha cae en el mismo mes que el gasto registrado, sin importar el mes en curso.
5. WHEN la persona registra otro gasto en una categoría que ya estaba por encima del presupuesto ese mes
   THE SYSTEM SHALL mostrar el aviso otra vez, con el total actualizado.
6. WHEN se muestra un aviso de presupuesto
   THE SYSTEM SHALL guardar igual el gasto registrado.
7. WHEN se muestra un aviso de presupuesto
   THE SYSTEM SHALL terminar con código de salida cero.

## Supuestos

- «Pasarse» es superar estrictamente el presupuesto: llegar justo al monto no avisa (R2.2).
- El texto exacto del aviso y el formato de los montos no son requisito; alcanza con que el aviso
  contenga los cuatro datos de R2.1. El formato concreto lo fija `design.md`.
- Los presupuestos se guardan en el mismo lugar que los movimientos, en un archivo aparte; la ruta
  la fija `design.md`.
- El monto del presupuesto admite decimales, igual que el de los movimientos.

## Preguntas abiertas

- Ninguna.

## Enmiendas
