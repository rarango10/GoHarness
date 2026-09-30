# Requirements — Dashboard de presupuesto

> Estado: aprobado (2026-09-29) · enmendado (2026-09-29): R1.6, R1.7

## Contexto

Hoy `finanzas` registra gastos y los lista por mes, pero no hay forma de ver cuánto se gastó
en cada categoría frente a cuánto se pensaba gastar. Esta feature agrega un comando que, para un
mes, compara el gasto de cada categoría con un presupuesto fijo, avisa cuando una categoría se
pasa y marca las categorías en las que falta el gasto o el presupuesto.

## Alcance

**Entra:**

- Leer presupuestos por categoría de un archivo JSON que la persona edita a mano. El monto de cada
  categoría es fijo y vale igual para todos los meses.
- Un comando `finanzas dashboard [AAAA-MM]` que muestra, por categoría, lo gastado, lo
  presupuestado y el % usado, y agrega una alerta si se pasa del presupuesto.
- Categorías con gasto pero sin presupuesto, o con presupuesto pero sin gasto, marcadas «sin definir».

**Queda afuera por ahora:**

- Un comando para cargar o editar presupuestos (se editan a mano en el JSON).
- Presupuestos distintos por mes.
- Categorías nuevas o configurables (se usa la lista fija actual).
- Comparar varios meses, mostrar tendencias o exportar el dashboard.

## Requisitos

### R1 — Presupuestos desde archivo

Como persona que usa `finanzas`, quiero escribir mis presupuestos en un archivo, para no tener que
cargarlos de nuevo cada mes.

- **R1.1** WHEN se ejecuta el dashboard, THE SYSTEM SHALL tomar como presupuesto de cada categoría
  el monto que figura para ella en el archivo de presupuestos, el mismo sea cual sea el mes pedido.
- **R1.2** IF el archivo de presupuestos no existe, THEN THE SYSTEM SHALL tratar todas las
  categorías como sin presupuesto.
- **R1.3** IF el archivo de presupuestos no es JSON válido, THEN THE SYSTEM SHALL mostrar un mensaje
  de error que nombre el archivo.
- **R1.4** IF el archivo de presupuestos tiene para alguna categoría un monto que no es un número
  mayor que 0, THEN THE SYSTEM SHALL mostrar un mensaje de error que nombre esa categoría.
- **R1.5** IF el archivo de presupuestos nombra una categoría que no está en la lista de
  categorías, THEN THE SYSTEM SHALL mostrar un mensaje de error que nombre esa categoría.
- **R1.6** IF el archivo de presupuestos cae en alguno de los errores de R1.3, R1.4, R1.5 o R1.7,
  THEN THE SYSTEM SHALL terminar con código de salida distinto de 0.
- **R1.7** IF el archivo de presupuestos es JSON válido pero su contenido no es un objeto de
  categoría a monto, THEN THE SYSTEM SHALL mostrar un mensaje de error que nombre el archivo.

### R2 — Cálculo por categoría

Como persona que usa `finanzas`, quiero ver en qué categorías me estoy pasando, para corregir el
gasto antes de fin de mes.

- **R2.1** WHEN se calcula el dashboard de un mes, THE SYSTEM SHALL tomar como gastado de cada
  categoría la suma de los montos de sus movimientos con fecha en ese mes.
- **R2.2** WHEN una categoría tiene presupuesto, THE SYSTEM SHALL calcular su % usado como
  gastado ÷ presupuesto × 100, redondeado al entero más cercano.
- **R2.3** IF el gastado de una categoría supera a su presupuesto, THEN THE SYSTEM SHALL marcar la
  categoría con una alerta de presupuesto excedido.
- **R2.4** WHEN el gastado de una categoría es menor o igual a su presupuesto, THE SYSTEM SHALL no
  marcar alerta en esa categoría.
- **R2.5** IF una categoría tiene gasto en el mes pero no tiene presupuesto, THEN THE SYSTEM SHALL
  marcarla «sin definir».
- **R2.6** IF una categoría tiene presupuesto pero no tiene gasto en el mes, THEN THE SYSTEM SHALL
  marcarla «sin definir».
- **R2.7** IF una categoría no tiene gasto en el mes ni presupuesto, THEN THE SYSTEM SHALL omitirla
  del dashboard.

### R3 — Comando `dashboard`

Como persona que usa `finanzas`, quiero pedir el dashboard de un mes desde la terminal, para
consultarlo en el momento.

- **R3.1** WHEN la persona ejecuta `finanzas dashboard AAAA-MM`, THE SYSTEM SHALL mostrar una
  fila por cada categoría no omitida, con su gastado, su presupuestado y su % usado.
- **R3.2** WHEN la persona ejecuta `finanzas dashboard` sin mes, THE SYSTEM SHALL mostrar el
  dashboard del mes actual.
- **R3.3** WHEN una categoría no tiene presupuesto, THE SYSTEM SHALL mostrar «—» en su % usado.
- **R3.4** WHEN una categoría no tiene presupuesto, THE SYSTEM SHALL mostrar «—» en su presupuestado.
- **R3.5** WHEN una fila tiene alerta de presupuesto excedido o marca «sin definir», THE SYSTEM SHALL
  mostrar esa marca en la misma fila.
- **R3.6** IF el mes pasado al comando no tiene la forma `AAAA-MM` con un mes entre 01 y 12, THEN
  THE SYSTEM SHALL mostrar un mensaje de error que indique el formato esperado.
- **R3.7** IF el mes pasado al comando no tiene la forma `AAAA-MM` con un mes entre 01 y 12, THEN
  THE SYSTEM SHALL terminar con código de salida distinto de 0.
- **R3.8** IF el mes pedido no tiene ninguna categoría para mostrar, THEN THE SYSTEM SHALL mostrar un
  mensaje que diga que no hay datos para ese mes.

## Restricciones

- El cálculo del dashboard (R2) va en una función pura, sin lectura de archivos ni impresión, como
  pide `CLAUDE.md`. Así R2 se testea sin tocar disco ni consola.
- Sin dependencias nuevas.

## Supuestos

- Se muestra «—» en el presupuestado (R3.4) igual que en el % (R3.3). El brainstorm lo pidió solo para
  el %, pero es la misma ausencia.
- La alerta se decide sobre los montos, no sobre el % redondeado (R2.3). Así, 100,4 % se muestra
  como `100%` pero alerta, y exactamente 100 % no alerta.
- Una categoría con presupuesto y sin gasto muestra gastado 0 y 0 % (se desprende de R2.1 y R2.2),
  además de la marca «sin definir».
- Un nombre de categoría desconocido en el archivo de presupuestos es un error (R1.5) y no se
  muestra como una categoría más. Así, un error de tipeo («comida» por «Comida») no pasa
  desapercibido.
- Las filas van en el orden de la lista de categorías del proyecto (Comida, Transporte, Servicios,
  Ocio, Salud, Otros). Los montos se muestran con 2 decimales, como en `listar`.
- La ruta y la forma del archivo de presupuestos las decide el design, siguiendo el patrón de
  `FINANZAS_DATOS`.
- El «mes actual» (R3.2) es el de la fecha local de la máquina.

## Enmiendas

- 2026-09-29 — R1.7 nuevo (archivo de presupuestos con JSON válido pero sin forma de objeto) y R1.6
  ampliado para incluirlo. Salió del repaso previo al design (fase 2).
