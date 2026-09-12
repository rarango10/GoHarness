---
name: implement-task
description: "Implementa UNA tarea del tasks.md de una feature, de punta a punta: la marca en curso, escribe el primer test en rojo, implementa lo mínimo para el verde, invoca a dod-checker sin preguntar, asienta el veredicto en el Registro y commitea con el id de la tarea en el mensaje. Es el paso 5 del ciclo. Usalo cuando la persona diga 'implementemos T3', 'hagamos T5', 'arranquemos con la implementación', 'seguimos con la que sigue', o cuando un tasks.md aprobado tenga tareas en pendiente. No escribe el plan de tareas —eso lo hace únicamente el workflow tasks-fanout— ni verifica la feature entera —eso es verify-e2e—. Si no hay un tasks.md con la tarea que te piden, este skill no aplica: ese pedido entra al ciclo por brainstorming o specify."
---

# Implement Task

El paso 5 del ciclo, y el único que durante mucho tiempo no tuvo dueño: la tabla decía «TDD, a
mano». Los pasos con skill se comportan igual siempre; el que no lo tenía improvisaba, y se le fue
acumulando la mayor cantidad de reglas no escritas del harness.

**La unidad de este paso es la tarea, no la fase.** Un `tasks.md` con once tareas son once ciclos, no
uno largo. Y **una tarea no termina con código: termina con un veredicto.** Implementar y verificar
son el mismo acto — una tarea implementada y sin verificar queda en `en curso`, que es
indistinguible de «a medio hacer». No es un punto de reposo del ciclo: es un limbo donde nadie sabe
si el trabajo sirve.

## Modo, y cómo se dice

Por defecto hay **una compuerta por tarea**: al terminar cada una parás y esperás el sí antes de
arrancar la siguiente.

Esa compuerta se puede renunciar, y **solo de una forma**: que la invocación traiga literalmente
`--modo corrido`. Nada más la activa.

**No la infieras.** «Implementemos T3, T4 y T5» **es una lista, no una renuncia** — dice qué tareas
hay que hacer, no que se pueda saltear el sí entre ellas. Tampoco la activan la prisa, el tono, un
«dale con todo», ni que las tareas se parezcan entre sí. Si la persona quiso ir de corrido y no usó
el vocabulario, el costo de preguntarlo es una línea; el de suponerlo es que la compuerta se vuelve
opinable, que es exactamente lo que este skill viene a cerrar.

**Lo que no se renuncia nunca, ni en `--modo corrido`:**

- **Cada tarea se verifica.** Verificar no se batchea jamás. Si alguna vez te descubrís proponiendo
  implementar tres tareas de corrido pero verificarlas de a una, **tratá esa asimetría como la señal
  de que la propuesta está mal**: si se confía lo bastante para correr tres tareas sin mirar, se
  confiaría también para verificarlas juntas. Una precaución puesta de un lado y no del otro no es
  un diseño, es desconfianza mal repartida.
- **La regla de corte.** Si un veredicto vuelve distinto de `cumple`, **pará ahí**: la tarea queda en
  `en curso`, lo asentás, avisás, y no arrancás la siguiente. Renunciar a la aprobación intermedia es
  acelerar; renunciar al corte es cambiar lo que significa terminar. `hecho` significa verificado, y
  eso no lo mueve ningún modo.

**Decí al arrancar qué modo entendiste**, en una línea, antes de tocar nada. Si la persona se
equivocó al escribirlo, ese es el único momento barato para descubrirlo.

## Antes de arrancar

La carpeta del spec es `docs/AAAA-MM-DD-<feature>/`. Si hay varias y no está claro cuál, preguntá.
Leé `tasks.md`, `requirements.md`, `design.md` y el `CLAUDE.md` del proyecto — de ahí salen los
comandos, que son los del proyecto en el que estés y no una lista fija.

Cuatro comprobaciones, antes de la primera tarea:

1. **El encabezado de `tasks.md` dice `aprobado`.** Si dice `pendiente de aprobación`, el plan puede
   estar aprobado igual y sin asentar: `task-writer` tiene prohibido tocar ese encabezado, así que
   el sí ocurrió en el chat y no aterrizó en el archivo. **Preguntá en una línea si el plan está
   aprobado, y con el sí escribí `> Estado: aprobado (AAAA-MM-DD)` en el acto.** Ese encabezado es
   registro durable: lo lee `planning-tasks` para decidir si el spec está listo, y el scout del
   workflow en la corrida siguiente. Un plan aprobado que figura como pendiente se trata como no
   aprobado. Si la respuesta es que no está aprobado, pará y remití a `planning-tasks`.

2. **El repo es un repo git.** Si no lo es, decilo y ofrecé `git init` antes de empezar. No es
   trámite: sin repo no hay commits por tarea, y con eso se pierde el único registro del avance que
   no escribe quien implementa. Pasó — un proyecto entero se hizo sin repo porque nadie lo corrió y
   nada en el método lo pedía.

3. **No hay una corrida de `tasks-fanout` en vuelo.** Es lo único que este paso tiene prohibido
   hacer en paralelo: entre que el scout lee y el escritor guarda, tu `hecho` se pierde.

4. **Cuál es la tarea.** La que te nombren; si no te nombran ninguna, la primera en `pendiente`
   siguiendo el orden de la tabla. Ese orden no es decorativo: cada tarea debería dejar el repo
   funcionando y en verde, y saltearse una rompe esa propiedad. Si querés hacer otra, decí por qué.

Si lo que te piden no es una tarea de un `tasks.md`, este skill no aplica: nombrá el paso del ciclo
que corresponde y parate.

## El ciclo por tarea

1. **Abrí la tarea.** Poné `en curso` en su celda de `Estado` y decí en dos líneas su `Objetivo`, su
   `Cubre` y su `Primer test (rojo)`, tal como los dejó el plan. Empezar leyendo lo que la tarea dice
   que hay que lograr evita el modo de falla más común de esta fase: implementar lo que uno recuerda
   del design en vez de lo que la tarea pide.

2. **Escribí el primer test y corrélo en rojo.** El que declara la tarea. **Correlo y mirá el
   fallo** — un test que nunca se vio fallar no prueba nada, porque un test que pasa desde el
   principio pasa también con el código roto.

   Guardá el mensaje de fallo literal: va a la bitácora en el paso 6. **Es diagnóstico, no prueba.**
   La línea del rojo es autorreportada igual que el resto del `Registro`, y no demuestra que el test
   se escribió primero. Lo que aporta es otra cosa, y es real: dice **qué** falló y **cómo se veía**.
   «Rojo porque `add('0.1','0.2')` devolvía `0.30000000000000004`» le explica a quien lea dentro de
   un mes por qué existe el redondeo — algo que el código terminado no muestra nunca.

3. **Implementá lo mínimo para el verde.** Lo que no está en el `Objetivo` de esta tarea no se
   escribe acá, aunque lo veas venir y aunque sea barato: entra como una tarea del plan o como una
   línea en `Pendientes`. Alcance de más en una tarea es alcance que nadie planificó y que ningún
   criterio cubre.

4. **Corré el comando de corrección** que declara `CLAUDE.md` — typecheck y tests. **No el de
   higiene** (lint, formato, build): ese es del paso 8, antes del commit final del conjunto. Meter
   lint acá hace que una queja de formato se lea como una tarea incumplida, y ensucia el veredicto,
   que es el registro durable de qué está hecho.

5. **Invocá a `dod-checker`. Sin preguntar.** Terminaste de implementar: verificar es el resto del
   mismo acto, no una decisión aparte. Preguntar «¿verifico?» pide autorizar algo que no tiene costo
   irreversible y sin cuyo resultado la persona no puede decidir nada. La compuerta que importa viene
   después, con el veredicto ya en la mano. Cómo invocarlo está en la sección siguiente, y el cómo es
   la mitad del asunto.

6. **Asentá el veredicto y movés el `Estado`.** En el bloque `Registro` de esa tarea, siguiendo el
   formato de `assets/tasks-template.md` del skill `specify`:

   - La línea `**Verificación:**` con el veredicto, los criterios y el resultado de los tests.
   - La línea del rojo del paso 2, con el mensaje literal.
   - Las decisiones que hubo que tomar y que el design no fijaba, y los desvíos si los hubo.

   Y en la tabla: **`cumple` → `hecho`. Cualquier otro veredicto la deja en `en curso`**, con lo que
   faltó anotado — `cumple-parcial`, `no-cumple` y `no-verificable` son todos «todavía no». Si esta
   no es la primera verificación de la tarea, la línea vigente es **la última**, y la anterior se
   marca `**Verificación previa (superada):**` en vez de borrarse.

7. **Commiteá, con el id de la tarea en el mensaje.** `T3: <qué se logró>`. El commit va acá, después
   de asentar, así que arrastra código, tests y bitácora juntos: la tarea entera es una unidad en el
   historial. Si una tarea necesitó dos rondas van dos commits con el mismo id — **el id es lo que
   agrupa, no el conteo**.

   Lo que esto da, y conviene no sobrevenderlo: `git log` pasa a ser un registro del avance que
   escribe la herramienta y no quien implementa, y muestra que la tarea fue una unidad de trabajo.
   **No prueba que el test se escribió antes que el código** — para eso harían falta dos commits por
   tarea, rojo y verde, y eso está descartado porque un commit en rojo rompe la regla de que cada
   tarea deja el repo en verde.

8. **Compuerta: presentá y parate.** El veredicto, qué asentaste, el commit, y cuál sería la tarea
   siguiente. Esperá el sí. En `--modo corrido` esta es la única parte que se saltea, y solo mientras
   el veredicto haya sido `cumple`.

## Cómo invocar a `dod-checker`

**Pasale el id de la tarea y la ruta de la carpeta del spec. Nada más.** Todo lo demás lo lee él.

**No le cuentes cómo te fue.** Que los tests dan verde, que el comando pasó, que la tarea te parece
lista, cuál fue un veredicto anterior: nada de eso va en el prompt. Pedir un veredicto independiente
en la misma frase en que se anuncia el resultado esperado no produce independencia, y quien invoca es
justo la parte interesada — el implementador presentando su propio trabajo.

**No le propongas el vocabulario de veredictos.** Son cuatro y los define él: `cumple`,
`cumple-parcial`, `no-cumple`, `no-verificable`. Un pedido de «decime cumple, no cumple o parcial»
achica el espacio de respuestas y puede borrar la única salida correcta. Ya pasó: dejó afuera
`no-verificable`, que era el veredicto que correspondía.

El daño de contaminar la entrada no es teórico ni se ve venir. En una verificación real el prompt
traía la lista de dependencias que el implementador ya había confesado, y el verificador **usó esa
bitácora como checklist**: encontró exactamente esas dos, ninguna más, y no comparó el manifiesto
contra `CLAUDE.md`. El veredicto terminó ratificando el relato de quien implementó en vez de
auditarlo. La contaminación no estuvo en los comandos —los corrió él— sino en **qué buscó y contra
qué lo comparó**.

Que hayas corrido vos el comando de corrección en el paso 4 no reemplaza que lo corra él; lo único
que no se hace es contárselo.

**Si el nombre no resuelve, el harness está empaquetado.** Dentro de un plugin el agente se registra
como `<nombre-del-plugin>:dod-checker`. Probá el nombre pelado: si falla, el error lista los agentes
disponibles y de ahí sacás el correcto. No inventes el prefijo antes de tener esa lista — cambia
según cómo esté instalado.

## Lo que escribís, y lo que no

Escribís **el código y los tests**, y de `tasks.md` exactamente tres cosas: la **celda `Estado`** y el
**bloque `Registro`** de la tarea que estás haciendo, y el **encabezado de aprobación** cuando recibís
el sí. Nada más de ese archivo.

**La tabla de Plan no es tuya**: qué tareas existen, sus ids, su orden, su título y su `Cubre` los
escribe únicamente el workflow `tasks-fanout`. Si mientras implementás descubrís que falta una tarea,
que sobra, o que un `Cubre` está mal, **no lo arregles**: anotalo, decilo, y que se resuelva con
`planning-tasks`. Retocar el plan desde acá reintroduce el segundo escritor que toda esa arquitectura
existe para eliminar.

Tampoco tocás `requirements.md`. Si un criterio resulta estar mal, es un hallazgo para `specify`, no
una edición al paso. Un desvío respecto del `design.md` sí se registra en la bitácora y se lleva al
documento, que es lo que dice el template: un desvío sin registrar rompe la trazabilidad en silencio.

## Cuando todas las tareas están en `hecho`

Decilo y parate. Lo que sigue es el **paso 7**, la verificación end-to-end del skill `verify-e2e`:
`dod-checker` contestó once veces «¿esta tarea cumple sus criterios?», y ninguna de esas respuestas
dice si la feature entera camina. Son verificaciones distintas y ninguna reemplaza a la otra.

No lo arranques vos: nombralo. Y si la feature no tiene superficie navegable —no hay e2e que
correr—, lo que sigue es el **paso 8**, el skill `close-feature`.

Los commits por tarea **no cierran la feature**. Cada uno guarda una tarea; el cierre es otra cosa,
y es la corrida de higiene sobre el estado final: tu `cumple` de la tarea 3 se tomó sobre un repo que
para entonces ya cambió siete veces.
