## Usuario

che, hagamos el spec de las alertas de presupuesto

## Asistente

- `Skill: {"skill": "goharness:specify"}`
- `Bash: {"command": "ls -R docs 2>/dev/null; cat docs/pendientes.md 2>/dev/null; grep -ril presupuesto . --exclude-dir=node_modules 2>/dev/null"}`

Antes de escribir el spec hace falta un paso previo. No encuentro un diseño acordado de las alertas de presupuesto: no hay brainstorming en esta conversación, `docs/` está vacío, no existe `docs/pendientes.md` y la palabra «presupuesto» no aparece en ningún lado del repo.

Si escribo `requirements.md` ahora, voy a tener que inventar el comportamiento. Por ejemplo:

- **Alcance del presupuesto:** ¿es un tope mensual total o uno por categoría? Hoy los movimientos, ¿tienen categoría?
- **Momento del aviso:** ¿al agregar un movimiento que pasa el tope, al listar el mes, o con un comando aparte?
- **Umbrales:** ¿avisa solo al pasar el 100 % o también antes, al 80 %?
- **Configuración:** ¿cómo se fija el presupuesto? ¿Con un comando nuevo, en el mismo JSON de datos?

Quedaría un spec prolijo que igual puede describir otra feature, y el error aparecería recién al implementar.

Te propongo pasar primero por **brainstorming** («quiero agregar alertas de presupuesto») para cerrar la forma de la feature. Con eso acordado, escribo `requirements.md` sin volver a preguntarte lo ya decidido. ¿Arrancamos por ahí?

## Usuario

dale

## Asistente

- `Skill: {"skill": "goharness:brainstorming", "args": "alertas de presupuesto"}`
- `Bash: {"command": "git ls-files | grep -v node_modules && cat package.json && for f in $(git ls-files 'src/*'); do echo \"=== $f\"; cat $f; done"}`

Ya miré el repo. La CLI tiene dos comandos, `agregar` y `listar [AAAA-MM]`. Cada movimiento lleva una de seis categorías fijas: Comida, Transporte, Servicios, Ocio, Salud y Otros. Todo se guarda en `data/movimientos.json` y no hay backlog que tenga relación con esto.

Primera pregunta: **¿sobre qué se define el presupuesto?**

- **A)** Un tope por categoría. Por ejemplo, «Comida: $150.000 por mes».
- **B)** Un solo tope total por mes, para todos los gastos.
- **C)** Las dos cosas: topes por categoría y además un total.

## Usuario

A, un tope por categoría

## Asistente

Anotado: un tope mensual por categoría.

Siguiente pregunta: **¿cuándo tiene que aparecer la alerta?**

- **A)** Al `agregar` un movimiento que hace que su categoría pase el tope de ese mes.
- **B)** Al `listar` un mes, con un resumen de las categorías pasadas.
- **C)** Solo con un comando aparte, por ejemplo `finanzas presupuesto 2026-09`, que muestra gastado contra tope por categoría.
- **D)** Una combinación de las anteriores. Decime cuáles.

## Usuario

A, que avise al agregar un gasto

## Asistente

Perfecto, avisa al agregar.

Siguiente: **¿el aviso es solo al pasar el tope, o también antes?**

- **A)** Solo cuando el gasto acumulado del mes en esa categoría supera el tope.
- **B)** También un aviso previo cuando se acerca, por ejemplo al llegar al 80 %.
