---
name: close-feature
description: "Cierra una feature terminada: corre el comando de higiene completo sobre el estado final del repo, comprueba que todos los veredictos de dod-checker sigan siendo ciertos juntos, y hace el commit de cierre. Un rojo baja la tarea afectada a en curso y la devuelve al TDD. Es el paso 8 del ciclo. Usalo cuando la persona diga 'cerremos la feature', 'commiteemos', 'listo para commitear', 'ya terminamos X', o cuando todas las tareas estén en hecho y el ciclo e2e haya cerrado. No repara código, no toca el plan de tareas y no aprueba nada: si algo sale rojo, nombra la tarea que vuelve a en curso y devuelve el arreglo al skill implement-task."
---

# Close Feature

El paso 8, y el último del ciclo. Durante mucho tiempo se mencionó en prosa y no tuvo fila en la
tabla — lo que hacía que pareciera trámite. No lo es, y el nombre del skill lo dice: **no es «hacer
el commit», es cerrar la feature**. El commit es el final; lo que importa es la corrida que va
antes.

## Un veredicto se toma sobre un estado

Esta es la única razón por la que este paso existe, así que conviene tenerla clara antes del
procedimiento.

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

2. **Corré el comando de higiene, completo, una vez.** El que `CLAUDE.md` declara como tal — no el de
   corrección, que es el del paso 6.

   Dos atajos que hay que no tomar, porque los dos anulan el paso entero: **no lo acotes** a los
   tests de esta feature, y **no lo saltees** porque cada tarea ya corrió lo suyo. Cada tarea corrió
   sobre *su* estado; ninguna corrió sobre *este*. Que las partes hayan pasado por separado es
   exactamente la afirmación que este paso viene a comprobar, así que no puede ser también su
   justificación para no comprobarla.

   Si alguna pata del comando de higiene no aplica hoy —un runner e2e sin app que navegar, una
   dependencia sin instalar— decilo explícitamente en vez de dejarla correr y contar el fallo como
   hallazgo. Un rojo de andamiaje ausente no reabre ninguna tarea.

3. **Verde → commit de cierre.** Sección de abajo.

4. **Rojo → ruteo.** Sección de abajo. **Presentá el rojo y qué pensás hacer con él antes de tocar
   `tasks.md`**: bajar una tarea de `hecho` muta el único registro durable de qué está terminado, y
   eso no se hace sin un sí.

## Qué hacer con un rojo

**No lo arregles acá.** Por la misma razón por la que el ciclo e2e no repara código: sería un segundo
escritor de `src/`, saltearía el TDD que el proyecto fija como regla, y puede cerrar el síntoma
dejando la causa. Este paso diagnostica y rutea.

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

## El commit de cierre

Trae lo que las tareas no commitearon: los documentos del paso 7 (`e2e-tests-plan.md`,
`e2e-test-report.md`), los specs de `end2end/`, y los ajustes de configuración que hayan salido de
este paso. **No reemplaza ni aplasta los commits por tarea** — cada uno tiene su id y su diff, y ese
escalonamiento es lo que hace que `git log` sirva de registro. El mensaje de este nombra la feature,
no una tarea.

**Si no quedó nada sin commitear, decilo y terminá.** No fabriques un commit vacío para tener uno: el
valor de este paso es la corrida, no el commit. Un cierre legítimo puede consistir en «la higiene dio
verde y no había nada pendiente de commitear».

## Lo que este paso no hace

- **No repara código ni tests.** Rutea a `implement-task`.
- **No toca el plan.** Qué tareas existen y sus ids son del workflow `tasks-fanout`. Este paso mueve
  `Estado` y escribe `Registro`, que son la región de quien implementa — y en este momento del ciclo,
  quien implementa es esta sesión.
- **No aprueba nada.** Si un documento del spec quedó sin aprobar, es un hallazgo para reportar, no
  algo que se asiente acá.
- **No decide que la feature está bien.** Decide que el repo está sano con ella adentro, que es una
  pregunta más chica y la única que este paso puede contestar.

## Al terminar

Con el commit hecho —o con la constancia de que no hacía falta— la feature está cerrada. Decilo,
nombrá lo que quedó en `Pendientes` de `tasks.md` si hay algo, y parate. La feature siguiente
arranca por el paso 1, con `brainstorming`.
