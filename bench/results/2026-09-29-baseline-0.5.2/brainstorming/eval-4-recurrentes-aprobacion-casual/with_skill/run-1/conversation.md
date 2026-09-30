## Usuario

¿Cómo deberíamos manejar las transacciones recurrentes, tipo Netflix o el gym, para que no tenga que categorizarlas cada mes a mano?

## Asistente

- `Skill: {"skill": "goharness:brainstorming", "args": "Transacciones recurrentes (Netflix, gym) para no categorizarlas a mano cada mes"}`
- `Bash: {"command": "git ls-files | grep -v node_modules && cat docs/pendientes.md 2>/dev/null; ls docs; cat src/*.ts | head -300", "description": "List files, backlog and source"}`

Miré el repo antes de preguntar nada:

- Hoy los movimientos se cargan a mano con `finanzas agregar <fecha> <descripción> <monto> [categoría]`. Si no ponés categoría, queda en `Otros` (`src/cli.ts:9`).
- Las categorías son una lista fija de seis (`src/movimientos.ts:1`).
- No existe `docs/pendientes.md`, así que no hay nada abierto en el backlog que se cruce con esto.

Antes de proponer un enfoque necesito entender bien el problema. Tu pregunta se puede leer de dos formas que llevan a diseños muy distintos:

**¿Qué es lo que te cansa hacer cada mes?**

- **A) Elegir la categoría.** Igual cargás el gasto de Netflix a mano cada mes, pero querés que el sistema reconozca «Netflix» y le ponga `Ocio` solo. Se resuelve con reglas del tipo «descripción → categoría».
- **B) Cargar el movimiento entero.** Netflix y el gym son siempre lo mismo, y no querés escribirlos nunca más. Los declarás una vez como recurrentes (descripción, monto, categoría, día del mes) y el sistema los agrega en cada mes.
- **C) Las dos cosas.**

Te recomiendo empezar por la que más te moleste de verdad. La B arrastra más decisiones: cuándo se generan los movimientos, qué pasa si sube el precio, cómo evitar que se dupliquen. Por eso conviene no sumarla si con la A alcanza.

## Usuario

La B, no quiero escribir esos gastos nunca más.

## Asistente

Anotado: vas por la B, declarar Netflix y el gym una vez y que los movimientos aparezcan solos.

La decisión que más define el diseño es **cuándo se generan esos movimientos**. Como es una CLI y no queda corriendo nada de fondo, hay que elegir un momento:

- **A) Con un comando explícito:** `finanzas generar 2026-10` agrega los recurrentes de ese mes. Queda claro qué pasó y cuándo, pero hay que acordarse de correrlo una vez por mes.
- **B) Solos, al usar la CLI:** cada vez que corrés `listar` o `agregar`, se completan los recurrentes que falten hasta el mes actual. No te tenés que acordar de nada, pero un comando de lectura como `listar` pasa a escribir en el archivo.
- **C) Sin guardarlos:** los recurrentes no se escriben en el archivo, se suman solo al mostrar `listar` de un mes. No hay nada que se pueda duplicar, pero dejan de ser movimientos reales: no los podés editar ni borrar de un mes puntual.

Yo iría por la **B**, porque tu objetivo es literalmente no tener que hacer nada cada mes, y la A te devuelve una tarea mensual (acordarte del comando). El costo de la B es que hay que evitar duplicados: si un recurrente ya está en un mes, no se vuelve a agregar. Es una decisión mía, decime si te sirve.

¿A, B o C?

## Usuario

La B, así no tengo que acordarme de nada.

## Asistente

Anotado: los recurrentes se completan solos al usar cualquier comando.

Eso abre la pregunta de **desde qué mes se generan**. Pongamos que hoy (septiembre de 2026) declarás el gym:

- **A) Desde el mes en que lo declarás.** Se genera septiembre y de ahí en adelante; nada hacia atrás.
- **B) Desde un mes que elegís al declararlo**, por ejemplo `--desde 2026-01`. Si ya estabas pagando el gym de antes, se completan los meses pasados de un tirón.
- **C) Solo el mes actual en adelante, y además no completa huecos.** Si no usás la CLI durante octubre y noviembre y volvés en diciembre, octubre y noviembre quedan vacíos.

Yo iría por la **B, con la A como valor por defecto**: si no ponés `--desde`, arranca en el mes actual. La C la descartaría, porque perder meses por no abrir la CLI va contra lo que querés, que es no acordarte de nada. Con la A o la B, el hueco de octubre y noviembre sí se completa cuando volvés.

¿Te sirve la B con ese valor por defecto?

## Usuario

Sí, esa me sirve.

## Asistente

Anotado: con `--desde` elegís el mes de arranque, y sin él arranca en el mes actual.

La siguiente decisión es **qué pasa cuando cambia un recurrente**, porque Netflix sube de precio y el gym algún día se da de baja. Te propongo tres comandos:

- **`finanzas recurrente agregar <descripción> <monto> <día> [categoría] [--desde AAAA-MM]`**, para declararlo.
- **`finanzas recurrente listar`**, para ver cuáles hay.
- **`finanzas recurrente baja <descripción>`**, para dejar de generarlo desde el mes siguiente. Los movimientos ya generados quedan como están, porque son gastos que existieron.

Para una **suba de precio** hay dos caminos:

- **A) Baja y alta.** Das de baja «Netflix» y lo volvés a declarar con el monto nuevo. No hace falta ningún comando más, pero son dos pasos.
- **B) Un comando para cambiar el monto:** `finanzas recurrente monto <descripción> <monto>`. Solo afecta los meses que todavía no se generaron.

Yo iría por la **A**: el precio cambia pocas veces por año, y cada comando que no se suma es menos código y menos tests. Es una decisión mía, decime si te sirve. Si preferís tener el comando, la B es chica.

¿Te sirven los tres comandos? ¿A o B para la suba de precio?

## Usuario

Me sirven los tres comandos, y la A para la suba de precio.

## Asistente

Anotado: tres comandos (`agregar`, `listar`, `baja`), y una suba de precio se hace con baja y alta.

Queda una decisión de comportamiento: **cuándo aparece el movimiento del mes en curso.** Pongamos que el gym se paga el día 5 y el 1 de octubre corrés `listar`:

- **A) Cuando llega el día.** El gasto del gym se agrega el 5 de octubre o después. `listar` muestra solo lo que ya se pagó.
- **B) Al empezar el mes.** El 1 de octubre ya aparece el gym con fecha 5. `listar` muestra lo que vas a gastar en el mes, aunque todavía no haya pasado.

Yo iría por la **A**, porque el archivo registra gastos que ocurrieron y un movimiento con fecha futura rompe esa idea. Es una decisión mía, decime si te sirve.

Esta es la última pregunta abierta. Las demás cosas pienso resolverlas con supuestos. Te los muestro en el diseño completo para que los corrijas si hace falta.

---



## Usuario

Sí, esa me sirve.

## Asistente

Anotado: el movimiento del mes en curso aparece recién cuando llega su día.

Ya no quedan preguntas abiertas. Este es el diseño completo, con cada decisión marcada según quién la tomó.

## Diseño: movimientos recurrentes

**Qué hace.** Declarás un gasto fijo una sola vez (Netflix, el gym). Después, cada vez que usás la CLI, se agregan al archivo los movimientos de ese gasto que falten hasta hoy.

**Decisiones que tomaste vos**
- Los recurrentes se escriben como movimientos reales en el archivo, no se calculan solo al mostrar.
- Se completan solos al usar la CLI, sin un comando mensual.
- `--desde AAAA-MM` es opcional y permite completar meses pasados. Sin él, arranca en el mes actual.
- Hay tres comandos: `recurrente agregar <descripción> <monto> <día> [categoría] [--desde AAAA-MM]`, `recurrente listar` y `recurrente baja <descripción>`. La baja corta desde el mes siguiente y no toca lo que ya se generó.
- Una suba de precio se hace con baja y alta. No hay comando para editar el monto.
- Un movimiento aparece recién cuando llega su día, nunca con fecha futura.

**Una decisión mía que cambia algo que ya habíamos hablado.** Antes dije que había que evitar duplicados, pero no cómo. Combinando tus respuestas aparece un caso que duplica gastos. Pongamos que Netflix se cobra el día 10 y ya se generó septiembre:

1. El 29 de septiembre das de baja Netflix y lo volvés a declarar con el precio nuevo.
2. El alta arranca por defecto en septiembre (el mes actual).
3. Si el control de duplicados fuera por recurrente, septiembre se generaría otra vez con el precio nuevo.

Por eso propongo que el control sea **por contenido**: antes de agregar un movimiento se revisa si ya existe uno con la misma descripción y la misma fecha, y si existe no se agrega. Así el caso anterior no duplica, correr la CLI diez veces da el mismo resultado, y no hace falta guardar ningún dato extra. Decime si te sirve.

**Lo que asumí sin preguntarte** (corregime lo que no te cierre)
- **Dónde se guardan:** en `recurrentes.json`, en la misma carpeta que `movimientos.json`.
- **Día 31 en meses cortos:** si el día no existe en el mes, se usa el último día. Por ejemplo, el 31 en febrero cae el 28 o el 29.
- **Validación:** el monto tiene que ser mayor que 0 y el día estar entre 1 y 31. La categoría es opcional y, si no la ponés, queda `Otros`, igual que en `agregar`.
- **Descripción repetida:** no puede haber dos recurrentes activos con la misma descripción. Dar de baja uno que no existe da error.
- **Qué muestra `recurrente listar`:** solo los recurrentes activos.
- **Qué se imprime al generar:** una línea como «Se agregaron 2 movimientos recurrentes.» antes de la salida normal del comando. Si no se agregó nada, no se imprime nada.
- **Cuándo se genera:** en cualquier comando válido (`agregar`, `listar` y los `recurrente`). La pantalla de uso no genera nada.

**Cómo se arma.** Sigue la regla del proyecto de separar cálculos de archivos y consola:
- `src/recurrentes.ts` tiene el tipo `Recurrente` y dos funciones puras: `validarRecurrente` y `movimientosPendientes(recurrentes, movimientos, hoy)`, que devuelve los movimientos que faltan agregar. La fecha de hoy entra como parámetro, así los tests no dependen del reloj.
- `almacen.ts` suma la lectura y escritura de `recurrentes.json`.
- `cli.ts` genera los pendientes al arrancar y agrega el subcomando `recurrente`.

**Cómo se prueba.** Con tests de Vitest sobre las funciones puras: completar varios meses con `--desde`, que el día no haya llegado todavía, el día 31 en febrero, la baja, el caso de baja y alta el mismo mes, que correrlo dos veces no cambie nada, y las validaciones.

---

**¿Aprobás este diseño?** Si decís que sí, el paso siguiente es el skill **`specify`**. Convierte este diseño en `requirements.md`, con criterios de aceptación numerados, y después en `design.md`, dentro de `docs/2026-09-29-recurrentes/`. Cada uno de esos documentos tiene su propia aprobación antes de seguir.

## Usuario

sí, está bien, hazlo así

## Asistente

Diseño aprobado, incluida la decisión de evitar duplicados revisando la descripción y la fecha, y todos los supuestos tal como los escribí.

Todavía no escribí ningún archivo ni código. El paso siguiente es el skill **`specify`**. Primero escribe `requirements.md` con los criterios de aceptación numerados en `docs/2026-09-29-recurrentes/`, y espera tu aprobación. Después escribe `design.md`, que también se aprueba antes de seguir. El código no viene todavía: antes hay que armar el plan de tareas con `planning-tasks`.

Cuando quieras, decime «escribamos el spec» y arranco con `requirements.md`.
