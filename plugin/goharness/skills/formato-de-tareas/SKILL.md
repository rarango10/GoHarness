---
name: formato-de-tareas
description: "Referencia de formato del tasks.md de una feature: la plantilla, qué es una tarea, cómo se asignan los criterios al Cubre, los campos opcionales y para qué sirve la bitácora. No es un paso del ciclo y no produce ningún documento: lo precargan los agentes que leen o escriben tasks.md (task-writer, task-reviewer, plan-reducer, dod-checker). Para escribir el plan, el camino es el skill planning-tasks; para implementar una tarea, implement-task."
user-invocable: false
---

# Formato de `tasks.md`

**Esto es una referencia, no una instrucción de trabajo.** Describe cómo es el archivo. Qué te toca
hacer con él lo dice tu propio rol: el prompt que te invocó, o el skill o el agente que sos. Si
llegaste acá buscando escribir el plan, ese camino es `planning-tasks`; si buscabas implementar una
tarea, `implement-task`.

El **plan** de `tasks.md` —qué tareas hay, sus ids, su orden, su `Cubre`— lo escribe el workflow dinámico `tasks-fanout`, y nada más; lo dispara el skill `planning-tasks`, que antes verifica el spec y confirma el costo. (El `Estado` y el `Registro` de cada tarea son la otra región del archivo, y los escribe quien implementa; ver `CLAUDE.md`.) No escribas el plan a mano turno por turno ni lo delegues a un subagente con permiso de escritura: el workflow existe para que el plan tenga un único escritor, y planificar por afuera reintroduce el segundo planificador que esa arquitectura elimina. Si el workflow no está disponible, el paso correcto es destrabarlo, no improvisar el plan.

Lo que sigue son las **reglas de formato** del archivo, no un procedimiento. La plantilla es `assets/tasks-template.md`, en este mismo skill.

1. **El archivo es `tasks.md`**, en la carpeta del spec (`docs/AAAA-MM-DD-<feature>/`), siguiendo `assets/tasks-template.md`.
2. **Una tarea, un ciclo de TDD**: test que falla → implementar → test que pasa, del tamaño que se pueda terminar de una sentada. Si una tarea necesita tres tests distintos para tener sentido, probablemente sean tres tareas.
3. **Ordenalas para poder parar en cualquier punto**: cada tarea debería dejar el repo funcionando y en verde. Un plan que solo sirve si se completa entero no sirve como plan.
4. **Un criterio se asigna a la tarea que lo completa**, no a las que lo habilitan. Si un criterio dice «al presionar Calcular, mostrar la suma en la casilla de resultado», la tarea que escribe la función de suma **no lo cubre**: implementa una precondición suya. Esa tarea lleva `Cubre: —` y explica en `Por qué no cubre criterios:` cuál criterio ayuda a cerrar y en qué tarea se cierra.

   Repartir un mismo criterio entre dos tareas parece más trazable y es lo contrario: ninguna de las dos lo satisface, las dos dicen cubrirlo, y el verificador queda sin forma de responder su propia pregunta —¿esta tarea cumple el criterio que dice cubrir?— sobre algo que solo cumple a medias. Ante la duda de si una tarea completa o habilita: ¿si esta tarea estuviera terminada y ninguna otra, el criterio se podría comprobar de punta a punta? Si la respuesta es no, habilita.

5. **Cerrá la cadena de trazabilidad**: cada tarea dice qué criterios cubre. Después mirá el cruce en las dos direcciones — una tarea que no cubre ningún criterio es alcance que nadie pidió, y un criterio sin ninguna tarea es o un olvido o algo que hay que declarar fuera de alcance explícitamente. Ese cruce es la razón de numerar los criterios desde la fase 1.
6. **El plan se presenta y espera aprobación**, como cada documento del ciclo. El workflow lo deja en `pendiente de aprobación` y no lo aprueba solo; quien recibe el sí lo asienta en el encabezado.

Al planificar, cada tarea tiene solo objetivo, criterios que cubre y primer test — más dos
campos opcionales que solo aparecen cuando aplican: `Por qué no cubre criterios:` (cuando `Cubre`
es `—`) y `Nota:` (ej. `reemplaza a T4`). Son los únicos dos que no se pueden reconstruir
releyendo el archivo, así que si el workflow los produce y no quedan escritos, se pierden. **La bitácora se completa durante la implementación, no al planificar**: el plan deja la estructura preparada, no el relato de un trabajo que todavía no ocurrió.

## Para qué sirve la bitácora

Es la parte del spec que más se subestima. El código terminado muestra el resultado y nunca la alternativa descartada; a los seis meses nadie se acuerda de por qué algo quedó así, y se termina rediscutiendo lo mismo o —peor— revirtiendo una decisión que tenía una buena razón.

**La escribe quien implementa, no el workflow.** `tasks-fanout` es dueño del plan —qué tareas hay,
sus ids, su orden, su `Cubre`— y quien implementa es dueño de dos regiones de la tarea que está
haciendo: su celda de `Estado` y su bloque de `Registro`. Son partes distintas del archivo, con
dueños distintos, y no se escriben a la vez. En ese Registro va también la línea de
**Verificación** con el veredicto de `dod-checker`: sin un `cumple` asentado ahí, la tarea no pasa
a `hecho`.

De lo que se anota, hay una categoría que no puede quedar en silencio: **el desvío respecto del design**. Si la implementación terminó haciendo algo distinto de lo diseñado, se registra en la tarea y `design.md` se enmienda con el skill `specify`, no a mano desde la tarea. Un desvío sin registrar rompe la trazabilidad sin que se note, porque el documento sigue leyéndose como si describiera lo que existe.

## Archivos de este skill

- `assets/tasks-template.md` — estructura de `tasks.md` (plan + bitácora + pendientes)
