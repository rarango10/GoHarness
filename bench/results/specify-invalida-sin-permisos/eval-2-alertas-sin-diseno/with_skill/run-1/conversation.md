## Usuario

che, hagamos el spec de las alertas de presupuesto

## Asistente

- `Skill: {"skill": "goharness:specify", "args": "alertas de presupuesto"}`
- `Bash: {"command": "ls -R docs src 2>/dev/null; cat docs/pendientes.md 2>/dev/null; grep -ril presupuesto . --exclude-dir=node_modules", "description": "Look for existing docs and budget mentions"}`

Todavía no puedo escribir el spec de las alertas de presupuesto, porque no hay un diseño acordado del que partir. Revisé el repo: no aparece «presupuesto» en ningún lado, no hay carpeta de feature en `docs/` ni un `docs/pendientes.md` donde esté descripta, y en esta conversación no hubo brainstorming.

Si lo escribo ahora, tendría que inventar yo las decisiones que definen la feature, por ejemplo:

- **Alcance del presupuesto:** ¿es un tope mensual total, uno por categoría, o los dos? Hoy los movimientos ni siquiera tienen categoría.
- **Cuándo salta la alerta:** ¿al registrar un gasto que pasa el tope, al consultar el mes, o con un comando aparte?
- **Umbrales:** ¿avisa solo al pasarse, o también antes (por ejemplo, al llegar al 80 %)?
- **Cómo se configura y si se guarda:** ¿se define por comando y se guarda en el JSON, o de otra forma?

El `requirements.md` quedaría prolijo pero podría describir la feature equivocada, y eso se descubriría recién al implementar.

El paso que corresponde es el **brainstorming** (paso 1): cerramos esas decisiones conversando y, con el diseño aprobado, recién ahí paso al spec. Si querés arrancar, decime «quiero agregar alertas de presupuesto» o contame directamente cómo te las imaginás.

## Usuario

dale, quiero que la app me avise cuando el gasto de una categoría pase su presupuesto del mes

## Asistente

- `Skill: {"skill": "goharness:brainstorming", "args": "alertas de presupuesto: avisar cuando el gasto de una categoría pase su presupuesto del mes"}`
- `Bash: {"command": "cat src/*.ts && ls && cat package.json && ls tests test 2>/dev/null", "description": "Read source files and project layout"}`

Buenísimo. Miré el código primero: los movimientos ya tienen categoría (Comida, Transporte, Servicios, Ocio, Salud, Otros; si no pasás ninguna, cae en Otros). Todavía no existe ningún concepto de presupuesto, y no hay backlog (`docs/pendientes.md`) con entradas relacionadas.

Voy a ir de a una pregunta. La primera es la que más define la forma de la feature:

**¿En qué momento querés que la app te avise?**

- **A)** Al registrar un gasto con `finanzas agregar`: si ese movimiento hace que la categoría pase su presupuesto del mes, el aviso sale ahí mismo, después de «Movimiento agregado.».
- **B)** Al consultar: con un comando nuevo (algo como `finanzas presupuesto 2026-09`) que muestra, por categoría, gastado contra presupuesto y marca las que se pasaron.
- **C)** Las dos cosas.

Te recomiendo la **A**, porque es la única que te avisa sin que tengas que ir a mirar, y eso es lo que pediste. La B sirve más para revisar el mes después. Si la querés también, se puede sumar ahora o dejar para otra feature.

## Usuario

dale, la A me sirve

## Asistente

Anotado: el aviso sale al registrar el gasto (opción A).

Siguiente pregunta: **¿cómo definís el presupuesto de cada categoría?**

- **A)** Con un comando, algo como `finanzas presupuesto Comida 150000`. Queda guardado y vale para todos los meses hasta que lo cambies.
- **B)** Editando a mano un archivo JSON de configuración (por ejemplo `data/presupuestos.json`), sin comando nuevo.
- **C)** Con un comando, pero el presupuesto es de un mes puntual (`finanzas presupuesto 2026-09 Comida 150000`) y cada mes se define aparte.

Te recomiendo la **A**: un presupuesto fijo por categoría es lo más común para uso personal, y el comando te evita editar JSON y romperlo con un typo. La C da más control, pero te obliga a cargar todo de nuevo cada mes, y si te olvidás, ese mes no hay alertas.

## Usuario

dale, la A me sirve

## Asistente

Anotado: presupuesto fijo por categoría, definido con un comando, que vale todos los meses (opción A).

Siguiente: **una vez que una categoría ya se pasó en el mes, ¿qué pasa con los gastos siguientes de esa categoría?**

- **A)** Avisa en cada gasto nuevo mientras siga pasada («Comida: gastaste $162.000 de $150.000, te pasaste por $12.000»).
- **B)** Avisa solo una vez, con el gasto que la hizo cruzar el límite; los siguientes se registran sin aviso.

Te recomiendo la **A**. Además de que te sigue recordando que estás gastando de más, es más simple: no hay que acordarse de si ya se avisó, porque cada vez se compara el total del mes con el presupuesto. La B necesita guardar ese estado o deducirlo, y sale ruidosa en los casos borde (por ejemplo, si registrás un gasto con fecha vieja).
