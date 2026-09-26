---
name: close-feature
description: "Cierra una feature terminada: si tiene pantalla, pide que la persona la mire —contra su referencia visual, si el design declara una— antes de nada; corre el comando de higiene completo sobre el estado final del repo, comprueba que todos los veredictos de dod-checker sigan siendo ciertos juntos, y hace el commit de cierre. Un rojo baja la tarea afectada a en curso y la devuelve al TDD. Es el paso 8 del ciclo. Usalo cuando la persona diga 'cerremos la feature', 'commiteemos', 'listo para commitear', 'ya terminamos X', o cuando todas las tareas estén en hecho y el ciclo e2e haya cerrado. No repara código, no toca el plan de tareas y no aprueba nada: si algo sale rojo, nombra la tarea que vuelve a en curso y devuelve el arreglo al skill implement-task."
---

# Close Feature

El paso 8, y el último del ciclo. Durante mucho tiempo se mencionó en prosa y no tuvo fila en la
tabla — lo que hacía que pareciera trámite. No lo es, y el nombre del skill lo dice: **no es «hacer
el commit», es cerrar la feature**. El commit es el final; lo que importa es la corrida que va
antes.

## Un veredicto se toma sobre un estado

Es la razón principal de este paso, así que conviene tenerla clara antes del procedimiento. La
otra es más simple: en una feature con pantalla, este es el único momento del ciclo en que alguien
la mira (paso 2 del procedimiento).

`dod-checker` verifica **una tarea, en un momento**. Su `cumple` es cierto para el repo tal como
estaba cuando lo tomó. Nada garantiza que siga siéndolo después, y **una tarea puede volverse
mentira sin que su código cambie una línea**.

Pasó, y el caso vale más que la regla: una tarea se verificó con `end2end/` vacía y su `cumple` era
correcto **entonces**. Dos pasos después el ciclo e2e pobló esa carpeta, el runner de tests unitarios
empezó a levantar los specs de Playwright, y el comando que la tarea declaraba en verde quedó en
rojo. La tarea no se tocó. El veredicto envejeció.

Lo más incómodo del caso: el propio `Objetivo` de esa tarea decía que la carpeta vacía era «el
resultado esperado hasta que `e2e-test-writer` los escriba». **El plan sabía que el estado iba a
cambiar y no había ningún lugar donde usar esa información.** Este paso es ese lugar.

| | Qué pregunta | Sobre qué |
|---|---|---|
| Paso 6 · `dod-checker` | ¿esta tarea cumple los criterios que dice cubrir? | una tarea, en un momento |
| Paso 7 · `verify-e2e` | ¿la feature entera funciona? | la feature, en un momento |
| **Paso 8 · este skill** | **¿todos los veredictos siguen siendo ciertos *juntos*?** | **el repo, en su estado final** |
| **Paso 8 · la persona** | **¿se ve como tenía que verse?** | **la pantalla, al lado de su referencia** |

**Verificar tarea por tarea no garantiza el conjunto.** Es la misma distinción que separa el paso 6
del paso 7, un nivel más arriba.

## Cuándo aplica

- Toda la tabla de `tasks.md` en `hecho`.
- Si la feature tuvo ciclo e2e, cerrado y en verde.

Si queda una tarea en `pendiente` o `en curso`, esto no es el cierre: decilo y parate. No se pierde
nada — cada tarea ya tiene su commit con su id, así que el trabajo hecho está guardado igual.

## El procedimiento

1. **Mirá el estado antes de correr nada.** La tabla de `tasks.md`, y el `e2e-test-report.md` si
   existe. Decí en una línea qué vas a cerrar y cuántas tareas trae.

   **Y mirá si algún `hecho` quedó viejo por una enmienda.** Si `requirements.md` o `design.md`
   dicen `enmendado (…): <ids>`, cruzá esos ids con el `Cubre` de cada tarea `hecho` y con la fecha
   de su `**Verificación:**`. Un `cumple` anterior a la enmienda de un criterio que la tarea cubre se
   tomó sobre un texto que ya no es el vigente: se trata como un rojo, con el mismo ruteo de «Qué
   hacer con un rojo». `implement-task` lo chequea al arrancar; esto es la red para cuando la
   enmienda llegó después de la última tarea.

2. **Si la feature es navegable, que la persona la mire antes de la higiene.** Leé `## Superficie` y
   `## Referencia visual` de `design.md`. Si la superficie es navegable, este paso no es opcional:
   **es el único punto del ciclo donde alguien ve lo que se construyó**. `dod-checker` verifica
   código contra criterios, `verify-e2e` verifica comportamiento y la higiene verifica que el repo
   esté sano. Ninguno contesta «¿esto se ve como tenía que verse?». Pasó: un rediseño cerró con
   todo en verde y la persona lo vio por primera vez después del commit de cierre, muy lejos del
   mockup que tenía que respetar.

   Decile cómo abrirla —lo dice `## Superficie`— y contra qué mirarla:

   - **Referencia normativa con un skill de fuente:** invocá el skill y pasale su lista de chequeo,
     para recorrerla con la app al lado de la referencia.
   - **Referencia normativa con un archivo de fuente:** la lista es la tabla adoptar / adaptar /
     descartar de `## Referencia visual`. Que abra el archivo al lado de la app.
   - **Orientativa o ninguna:** alcanza con mirarla y preguntarse si se la mostraría a quien pidió
     la feature.

   **Quien decide es la persona, y esperás su respuesta antes de seguir.** Si podés sacar capturas,
   ayudan, pero no reemplazan su mirada. Un design escrito antes de que existiera la sección
   `## Referencia visual` no la tiene: preguntá si había algo a lo que tenía que parecerse.

   Lo que aparezca **no se arregla acá**, y se rutea según qué criterio lo cubre:

   - **Contradice un criterio que una tarea cubre** → es un rojo como cualquier otro: la tarea baja
     a `en curso`. Ver «Qué hacer con un rojo».
   - **No lo cubre ningún criterio** —el caso típico: una pieza de la referencia que nunca llegó al
     spec— → no hay tarea que reabrir, y este paso no crea tareas. Es un hueco del spec. Nombrá
     `specify` para sumar el criterio (una enmienda) y `planning-tasks` para el plan, y parate. Si
     la persona decide dejarlo para otra feature, anotalo en `## Pendientes` de `tasks.md` con
     destinatario `[backlog]` y seguí: el paso «El backlog», más abajo, lo mueve al cerrar.

   Una feature no navegable saltea este paso.

3. **Corré el comando de higiene, completo, una vez.** El que `CLAUDE.md` declara como tal — no el de
   corrección, que es el del paso 6.

   Dos atajos que hay que no tomar, porque los dos anulan el paso entero: **no lo acotes** a los
   tests de esta feature, y **no lo saltees** porque cada tarea ya corrió lo suyo. Cada tarea corrió
   sobre *su* estado; ninguna corrió sobre *este*. Que las partes hayan pasado por separado es
   exactamente la afirmación que este paso viene a comprobar, así que no puede ser también su
   justificación para no comprobarla.

   Si alguna pata del comando de higiene no aplica hoy —un runner e2e sin app que navegar, una
   dependencia sin instalar— decilo explícitamente en vez de dejarla correr y contar el fallo como
   hallazgo. Un rojo de andamiaje ausente no reabre ninguna tarea.

4. **Verde → contrato, dependencias, backlog y commit de cierre.** Secciones de abajo, en ese
   orden.

5. **Rojo → ruteo.** Sección de abajo. **Presentá el rojo y qué pensás hacer con él antes de tocar
   `tasks.md`**: bajar una tarea de `hecho` muta el único registro durable de qué está terminado, y
   eso no se hace sin un sí.

## Qué hacer con un rojo

**No lo arregles acá.** Por la misma razón por la que el ciclo e2e no repara código: sería un segundo
escritor de `src/`, saltearía el TDD que el proyecto fija como regla, y puede cerrar el síntoma
dejando la causa. Este paso diagnostica y rutea.

**Antes de buscar la tarea, mirá si el rojo ya es conocido.** Si falla un test que **coincide con
una entrada abierta del backlog** —`docs/pendientes.md`, o una línea `[backlog]` de esta feature—,
no es de esta feature: reintentá esa pata una vez, asentá el resultado literal en la entrada
existente (no en una nueva), y no reabras ninguna tarea. Si el test no está en el backlog, es un
rojo como cualquier otro: **no asumas que es lo conocido** porque se parece. La coincidencia es por
el nombre del test o el archivo, no por el aire de familia.

1. **Identificá la tarea afectada.** El fallo apunta a un criterio, a un archivo o a un comando; la
   tarea es la que lo cubre. Si el rojo no es de ninguna tarea en particular —configuración del
   proyecto, un runner que levanta lo que no le toca— **la tarea afectada es la que declaró que ese
   comando quedaba en verde**. Si sigue sin estar claro, preguntá: adivinar cuál baja de `hecho`
   cuesta más que preguntarlo.

2. **Bajala a `en curso`** en su celda de `Estado`, y asentá en su `Registro` qué rojo la reabrió,
   con el fallo literal. La línea de verificación anterior **se marca**
   `**Verificación previa (superada):**`, no se borra: era correcta cuando se tomó, y eso es
   precisamente lo que este paso enseña. Un veredicto que envejeció no es un veredicto que estuvo
   mal.

3. **Devolvela al paso 5** nombrando `implement-task`, y parate. El arreglo es el TDD de siempre, y
   la tarea vuelve a `hecho` **solo con un `cumple` nuevo, tomado ya sobre el estado final**. No
   arranques la reparación en el mismo mensaje.

4. **Cuando vuelva, este paso se rehace entero.** No alcanza con que el rojo puntual se ponga verde:
   la corrida de higiene se corre de nuevo, completa, porque el arreglo cambió el estado otra vez.

## El contrato, releído

`CLAUDE.md` se escribió antes de esta feature, y la feature pudo volver falsa alguna de sus frases
sin tocarlo: pasó con un «el repo no tiene una copia del sistema» que se volvió mentira el día que
una tarea portó el sistema al código, y nadie lo vio, porque ninguna tarea toca el contrato y ningún
verificador lee su prosa. Una frase falsa ahí es peor que una ausente: la leen todos los agentes.

Releé las frases **de estado** —el Stack, las reglas propias del proyecto, las fuentes que nombra—
contra el repo final. No las del método, que no dependen de la feature. Si alguna quedó falsa, **no
la arregles acá**: nombrá `harness-init` en modo revisión, que es su productor, y parate hasta que
vuelva. Si todas siguen siendo ciertas, decilo en una línea y seguí.

## Las dependencias

Si `CLAUDE.md` declara un auditor de dependencias, corrélo sobre el estado final. **Es informativo,
y bloquea solo lo que esta feature trajo.** Para distinguirlo, mirá el diff del manifiesto desde
antes del primer commit de la feature (`git log --oneline -- <manifiesto>` y `git diff`, solo
lectura):

- **Una vulnerabilidad en un paquete que la feature agregó o subió** es de la feature. Es un rojo:
  la tarea que trajo ese paquete baja a `en curso`, con el ruteo de «Qué hacer con un rojo».
- **Una vulnerabilidad heredada** —el paquete ya estaba, con esa versión, antes de la feature— se
  informa y no bloquea. Si no está en el backlog, va como entrada nueva en el paso siguiente.
  Casi siempre su arreglo es un salto de versión del toolchain, y eso es una feature propia: hecho
  acá, invalidaría todos los veredictos de esta.

Si el contrato dice «ninguno» o no tiene la ranura, decilo en una línea y seguí: la ranura faltante
es un hallazgo para `harness-init`, no un rojo de esta feature.

## El backlog

Lo que esta feature encontró y le corresponde a otra no se pierde con ella. Con la higiene en verde
y antes del commit de cierre:

1. **Mové cada línea `[backlog]` de `## Pendientes`** al backlog del proyecto —`docs/pendientes.md`,
   salvo que `CLAUDE.md` nombre otro lugar—. Si el archivo no existe, crealo desde
   `assets/pendientes-template.md`. Cada entrada nueva toma el próximo `P<n>`, que no se reusa
   nunca, y lleva lo que dice la plantilla: de dónde salió, la evidencia, lo que se sabe y lo que
   no, y qué **no** hacer. En `Pendientes` la línea queda, con el id al que se movió al final:
   `→ P4`. No la borres: es la región de quien la escribió.
2. **Si la feature tomó entradas del backlog** (las nombra `## Alcance` de `requirements.md`), pasá
   su estado a `resuelto` con la fecha. El hash del commit de cierre no existe todavía: se completa
   con la carpeta de la feature, que alcanza para encontrarlo.
3. **Si el proyecto usa un tracker en vez del archivo**, no lo escribas vos: listá las entradas a
   crear, con su texto listo, y que la persona las cargue. Publicar en un servicio externo no se
   hace sin su sí.

En el backlog escribís solo **entradas nuevas** y el **estado** de las que esta feature tomó. El
resto de cada entrada es de quien la escribió, igual que en `Pendientes`.

## El commit de cierre

Trae lo que las tareas no commitearon: los documentos del paso 7 (`e2e-tests-plan.md`,
`e2e-test-report.md`), los specs de `end2end/`, `docs/pendientes.md` si lo tocaste, y los ajustes
de configuración que hayan salido de este paso. **No reemplaza ni aplasta los commits por tarea** — cada uno tiene su id y su diff, y ese
escalonamiento es lo que hace que `git log` sirva de registro. El mensaje de este nombra la feature,
no una tarea.

**Si no quedó nada sin commitear, decilo y terminá.** No fabriques un commit vacío para tener uno: el
valor de este paso es la corrida, no el commit. Un cierre legítimo puede consistir en «la higiene dio
verde y no había nada pendiente de commitear».

## Lo que este paso no hace

- **No repara código ni tests.** Rutea a `implement-task`.
- **No toca el plan.** Qué tareas existen y sus ids son del workflow `tasks-fanout`. Este paso mueve
  `Estado` y escribe `Registro` y `Pendientes`, que son la región de quien implementa — y en este momento del ciclo,
  quien implementa es esta sesión.
- **No aprueba nada.** Si un documento del spec quedó sin aprobar, es un hallazgo para reportar, no
  algo que se asiente acá.
- **No decide que la feature está bien.** Decide que el repo está sano con ella adentro. Si se ve
  como tenía que verse lo decide la persona, mirándola en el paso 2: este skill le da qué abrir y
  contra qué compararlo, no el veredicto.
- **No crea tareas.** Un hallazgo de la mirada que ningún criterio cubre va a `specify` y a
  `planning-tasks`, no a una tarea inventada acá.
- **No arregla lo que está en el backlog.** Lo registra y lo reconoce; lo resuelve la feature que
  lo elija.
- **No edita `CLAUDE.md`.** Si el contrato quedó mintiendo, lo arregla `harness-init` en modo
  revisión.

## Al terminar

Con el commit hecho —o con la constancia de que no hacía falta— la feature está cerrada. Decilo,
nombrá lo que quedó en `Pendientes` de `tasks.md` y las entradas `P<n>` que se sumaron al backlog,
si hay algo, y parate. La feature siguiente
arranca por el paso 1, con `brainstorming`.

## Archivos de este skill

- `assets/pendientes-template.md` — estructura del backlog del proyecto, con sus reglas de dueño y
  lector. Se copia a `docs/pendientes.md` la primera vez que una feature deja algo para otra.
