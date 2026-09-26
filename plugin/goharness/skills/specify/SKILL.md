---
name: specify
description: "Escribe el spec de una feature en dos fases, cada una con su compuerta de aprobación: requirements.md con criterios de aceptación en notación EARS, y design.md con arquitectura, interfaces, modelos de datos, errores y estrategia de testing. El plan de tareas (tasks.md) NO lo hace este skill: es el paso siguiente y lo hace el skill planning-tasks. Usá este skill apenas haya un diseño aprobado en brainstorming, o cuando la persona diga 'escribamos el spec', 'documentemos los requisitos', 'hagamos el spec de X', 'pasemos a la spec', 'definamos los criterios de aceptación', 'pasemos al diseño' o pida dejar por escrito qué tiene que hacer una feature antes de programarla. Es el paso siguiente al brainstorming y previo al plan de tareas — documenta qué hay que construir y cómo, pero no escribe código ni planifica las tareas."
---

# Specify

Convertir una idea ya clarificada en un spec ejecutable: primero **qué** tiene que hacer el sistema (`requirements.md`), después **cómo** se construye (`design.md`). **En qué orden se hace** (`tasks.md`) viene después y no es trabajo de este skill: lo arma el skill `planning-tasks` con el workflow `tasks-fanout`.

El workflow del proyecto es: brainstorm → **requirements + design (este skill)** → plan de tareas (`planning-tasks`) → implementación TDD → verificación → commit. Este skill cubre las dos primeras fases del spec y se detiene ahí.

## Antes de empezar

Este skill parte de una idea ya conversada y acordada. Si llegás sin eso —la persona tiró una idea suelta, el alcance sigue ambiguo, o todavía no se acordó un enfoque— no inventes los requisitos: proponé pasar primero por el brainstorming. Un spec construido sobre supuestos propios se ve prolijo y aun así documenta la feature equivocada, y el costo de descubrirlo aparece recién en la implementación.

Si el diseño ya viene aprobado de un brainstorm, no vuelvas a preguntar lo que ya se decidió: leelo de la conversación y usalo. Hacer repetir decisiones ya tomadas es la forma más rápida de que el spec se sienta burocracia.

Lo inverso también vale: un brainstorm fija la forma de la feature, no todos los detalles que hacen falta para escribir criterios verificables. Formato de fecha, separador decimal, si el CSV trae encabezado, dónde se persisten los datos, qué código de salida devuelve el comando — nada de eso suele discutirse al diseñar, y sin embargo sin eso ningún criterio se puede testear. Cuando falte algo así, preguntá **antes** de escribir y todo junto en un mismo mensaje: acá no estás explorando la idea (esa parte ya pasó), estás cerrando huecos puntuales, y una lista corta se responde de una sentada.

El criterio para saber si preguntar o no: **¿podés escribir un test que falle sin ese dato?** Si no podés, preguntá. Si el dato no cambia ningún criterio, elegí lo razonable, seguí, y anotalo en **Supuestos** — para eso está esa sección. Para lo visual, la pregunta equivalente es **¿podés señalar la diferencia abriendo la pantalla al lado de la referencia?**

**Si el brainstorming acordó una referencia visual normativa**, cada pieza que su tabla marca `adoptar` o `adaptar` tiene que terminar como criterio en `requirements.md` —de inventario, estructura, componente o token, ver «Criterios de apariencia» en `references/ears-patterns.md`—, y la tabla entera se copia a la sección `## Referencia visual` de `design.md`. Una pieza adoptada que no llega a un criterio es invisible para el resto del ciclo: nadie la implementa a propósito y nadie nota que falta.

Ojo con qué hacés después con esas respuestas. Van a llegarte a nivel implementación —"en `data/movimientos.json`", "código de salida 2"— y un criterio de aceptación describe comportamiento observable, no mecanismo. Antes de transcribirla, preguntate si a la persona le importa **ese valor concreto** o solamente que el comportamiento ocurra. Si lo que necesita es que los movimientos sigan estando la próxima vez que abre la app, eso es el criterio; la ruta del archivo es un supuesto ahora y una decisión del design después. Si en cambio el valor exacto **es** el requisito, porque algo externo depende de él, entonces sí va en el criterio — y decí de qué depende, para que se entienda por qué está fijado.

## Por qué requirements antes que design

Separar el "qué" del "cómo" mantiene honesto al diseño: si arrancás por la solución, los requisitos terminan escritos para justificar lo que ya decidiste construir. Escritos primero, y en forma de condición → comportamiento observable, los criterios de aceptación se convierten directamente en los tests de la fase siguiente — que es justo lo que necesita un proyecto que trabaja con TDD.

## Fase 1 — Requirements

1. **Elegí la carpeta**: `docs/AAAA-MM-DD-<feature-en-kebab-case>/`, con la fecha de hoy y un nombre corto y descriptivo (`docs/2026-09-04-importar-csv/`). Un spec enfocado por feature, no un documento monolítico.
2. **Escribí `requirements.md`** siguiendo `assets/requirements-template.md`.
3. **Redactá los criterios en EARS**: prosa en español, palabras clave en inglés (`WHEN`, `IF`/`THEN`, `WHILE`, `WHERE`, `THE SYSTEM SHALL`). Funcionan como vocabulario formal, igual que las palabras clave de SQL. Los patrones, ejemplos y errores típicos están en `references/ears-patterns.md` — leelo si dudás de cuál corresponde o cómo formular algo que no encaja en el patrón simple.
4. **Numerá todo**: requisitos `R1`, `R2`… y criterios `R1.1`, `R1.2`… El design y los tests van a referenciarlos, y esa trazabilidad es lo que después permite verificar que no quedó nada sin cubrir.
5. **Acotá el alcance**: incluí solo lo que se acordó, y dejá explícito lo que queda afuera por ahora. Un requisito de más es una feature de más que alguien va a construir.
6. **Releé cada criterio buscando conjunciones, antes de presentar.** Un criterio, un comportamiento: si dice «mostrar dos campos editables **y** un tercero de solo lectura», son dos criterios, no uno. Es una pasada corta y hay que hacerla explícitamente, porque el costo de saltearla no se paga acá sino dos pasos después: un criterio compuesto se cubre a medias —una cláusula con test y la otra sin— y el verificador se queda sin forma de decirlo, porque su vocabulario tiene un veredicto por criterio y no por cláusula. Terminás con un `cumple` sobre algo que solo está medio probado.
7. **Presentá y esperá aprobación**: contá en el chat qué requisitos quedaron (los títulos alcanzan, no repitas el archivo entero), dónde está el archivo, y qué supuestos o preguntas abiertas anotaste. **Decí también qué habilita ese sí**: si lo aprueba, sigue la fase 2, que convierte estos criterios en `design.md`. Después parate.

   Nombrar el paso siguiente **al pedir** la aprobación y no después no es un detalle de cortesía: quien aprueba tiene que saber hacia dónde está aprobando. Si el nombre del paso llega recién con el «listo, aprobado», la cadena queda descubrible solo en retrospectiva — te enterás de qué autorizaste después de haberlo autorizado.

No pases a diseño hasta tener un sí. Si la respuesta trae cambios, ajustá el archivo y volvé a pedir aprobación.

**Cuando llegue el sí, asentalo en el archivo en el acto**: el encabezado de `requirements.md` pasa a `> Estado: aprobado (AAAA-MM-DD)`. La aprobación ocurre en el chat y el chat se pierde; lo que queda es el encabezado, y es lo que van a leer `planning-tasks` para decidir si el spec está listo y el scout del workflow en la corrida siguiente. Un documento aprobado que figura como pendiente se trata como no aprobado. **Commiteá ese cambio ahí mismo**: quien recibe el sí de un documento lo commitea, y sin eso el archivo queda flotando hasta el commit de la primera tarea, mezclado con trabajo de otro paso.

## Fase 2 — Design

Antes de escribir nada, **releé los requisitos aprobados buscando problemas**: ambigüedades, criterios que se contradicen, huecos entre lo que se pide y lo que haría falta para que funcione. Si encontrás algo, decilo y resolvelo con la persona en vez de taparlo con una decisión propia — es mucho más barato acá que a mitad de la implementación.

Cuando de ese repaso sale un criterio nuevo —pasa seguido, es justamente para lo que sirve— agregalo a `requirements.md` con dos cuidados:

- **Numerá al final, nunca renumeres.** Los ids ya se citan en lo que se escribió hasta ahora y van a terminar en los nombres de los tests. Si un criterio quedó mal, corregilo o marcalo como obsoleto en su lugar; reusar su número rompe referencias en silencio.
- **Decí qué cambió y confirmalo.** La aprobación fue sobre lo que la persona leyó. Nombrá los criterios que agregaste y esperá un sí antes de seguir con el design — es un intercambio corto, no una re-aprobación completa del documento, pero sin él el documento aprobado y el que existe dejan de ser el mismo.

Después:

1. **Escribí `design.md`** en la misma carpeta, siguiendo `assets/design-template.md`.
2. **Referenciá los requisitos**: cada decisión de diseño existe para satisfacer algo. Enlazá secciones con los ids (`R1.2`) y, en la estrategia de testing, mapeá qué test cubre qué criterio. **Separá los criterios de estado de los de efecto**: si la feature tiene JavaScript de cliente, los de efecto —lo que cambia en pantalla al interactuar— necesitan un DOM de pruebas declarado en el design, y «lo confirma el e2e» no sirve para un criterio que una tarea va a cubrir. Descartar el DOM de pruebas es una decisión válida solo si ningún criterio de efecto queda en el `Cubre` de una tarea; si se descarta, decí cuáles quedan «solo e2e». Esa consecuencia aparece recién en el paso 6, dos pasos después de esta aprobación, y por eso hay que nombrarla acá.
3. **Diseñá para lo que hay**: seguí los patrones del código existente y las reglas que declara `CLAUDE.md` — su stack, sus comandos de verificación, y las restricciones que se haya puesto el proyecto (por ejemplo, no agregar dependencias sin necesidad). Si una dependencia o una capa nueva parece necesaria, justificá por qué el requisito no se puede satisfacer sin ella.
4. **Dejá registro de lo descartado**: qué alternativas consideraste y por qué no. Eso evita rediscutir lo mismo en tres semanas.
5. **Presentá y esperá aprobación**, igual que en la fase 1: al pedir el sí, decí también qué habilita —el plan de tareas, que arma `planning-tasks` lanzando un workflow con un agente por tarea— para que quien aprueba sepa qué está autorizando y a qué costo. Y cuando el sí llegue, **asentá `> Estado: aprobado (AAAA-MM-DD)` en el encabezado de `design.md` en el acto, y commiteá el cambio**, por la misma razón que en la fase 1.

**Si el design recién aprobado declara superficie navegable**, antes de nombrar el paso siguiente corré el doctor de Playwright (`node <ruta-de-verify-e2e>/scripts/e2e-doctor.cjs`, con la ruta del proyecto). Puede ser la primera feature del proyecto que necesita una interfaz: si el doctor falla, no lo arregles vos — nombrá el skill `harness-init` **en modo revisión** (siembra `playwright.config.ts`, pide el sí para instalar la dependencia y suma la pata `e2e` al comando de higiene) y esperá a que vuelva antes de seguir con `planning-tasks`. Detectarlo acá, con el design recién aprobado, cuesta una revisión corta; detectarlo en el paso 7 cuesta la feature entera ya implementada.

Una vez aprobado el design (y, si aplica, con el doctor en verde), decí que el paso siguiente es el skill **`planning-tasks`**, que comprueba el spec y lanza el workflow dinámico `tasks-fanout`: un revisor por tarea en paralelo, un reducer que sintetiza los veredictos y un único escritor al final. Nombralo, no lo arranques: igual que el propio `brainstorming` nombra a `specify` sin invocarlo, encadenarlo acá se saltearía la compuerta de aprobación del design que acaba de pasar. Que `planning-tasks` ahora sepa disparar el workflow por su cuenta no cambia eso — hace más fácil encadenar de más, no más aceptable.

## El formato de `tasks.md` no es de este skill

El **plan** de `tasks.md` —qué tareas hay, sus ids, su orden, su `Cubre`— lo escribe únicamente el workflow `tasks-fanout`, que dispara `planning-tasks`; el `Estado` y el `Registro` de cada tarea los escribe quien implementa. No escribas el plan a mano ni lo delegues a un subagente con permiso de escritura: el workflow existe para que el plan tenga un único escritor. Si el workflow no está disponible, el paso correcto es destrabarlo, no improvisar el plan.

Las reglas de formato del archivo y su plantilla viven en el skill de referencia `formato-de-tareas`. Están separadas de este skill a propósito: los agentes que las necesitan las precargan sin cargar también el mandato de escribir un spec.

## Después de la aprobación de las tasks

Pará ahí. Decí que el spec quedó completo —`requirements.md`, `design.md` y `tasks.md`— y que el paso siguiente es la implementación con TDD, empezando por el primer test rojo de T1. No la arranques: es otro paso del workflow, no parte de este skill.

Una aprobación corta o informal ("dale", "va", "listo") aprueba el documento que presentaste, nada más. No la leas como permiso para encadenar la fase siguiente en el mismo mensaje: aprobar los requirements no es aprobar el design, aprobar el design no es aprobar las tasks, y aprobar las tasks no es pedir código.

## Enmiendas: cuando el spec cambia después de aprobado

Llegás acá desde otro paso: `implement-task` encontró un criterio mal o un design que ya no describe lo que existe, `verify-e2e` ruteó `aSpecify`, `close-feature` encontró algo que ningún criterio cubre. Es el camino de vuelta del ciclo, y las clases que lo disparan están en el router, en «Cuando algo cambia a mitad de camino».

**Escribís solo `requirements.md` y `design.md`.** Nunca `tasks.md`, aunque la enmienda deje una tarea sin propósito o pida una nueva: el plan lo rehace `planning-tasks`, y el `Estado` de una tarea lo mueve quien implementa. Un documento que quedó describiendo requisitos viejos es peor que no tenerlo, porque se lee como si estuviera vigente — por eso la enmienda nombra todo lo que queda afectado, aunque no lo toque.

1. **Empezá por el documento más alto que toca.** Si cambia un criterio, es `requirements.md`, y después preguntás si arrastra al design. Si solo cambió el cómo —los criterios siguen igual—, es `design.md` y nada más.
2. **Mismas reglas de numeración que en la fase 2:** los criterios nuevos van al final y nada se renumera. Un criterio que **cambia de sentido** no se reescribe en su lugar: se marca `(obsoleto — ver R3.5)` y nace con id nuevo. Corregir la redacción sin cambiar el comportamiento (una errata, una ambigüedad que no mueve ningún test) se hace en su lugar y se enmienda igual.
3. **Asentá la enmienda en el documento.** Una línea en `## Enmiendas` —fecha, ids, qué cambió, de dónde salió (`T7`, paso 7, cierre)— y el encabezado pasa a `> Estado: aprobado (AAAA-MM-DD) · enmendado (AAAA-MM-DD): R3.2, R3.5`. Si ya tenía enmiendas, la lista de ids se acumula.
4. **Presentá solo lo que cambió y esperá el sí.** Es una aprobación corta, no una re-aprobación del documento. Al pedirla, decí qué habilita: qué tareas `hecho` cubren los ids enmendados y van a volver a `en curso`, y si hace falta re-planificar (hace falta si se agregaron, quitaron o volvieron obsoletos criterios). Con el sí, **commiteá la enmienda aparte**: `Enmienda <feature>: R3.2, R3.5`.
5. **Nombrá el paso siguiente y parate.** `planning-tasks` si el conjunto de criterios cambió; si no, `implement-task`, que al arrancar detecta las tareas a reabrir. No reabras tareas vos: `Estado` y `Registro` no son tu región.

**Si la enmienda redefine la feature** —cambia el problema que resuelve, o deja sin propósito buena parte del plan—, no es una enmienda: decilo y nombrá `brainstorming`. La persona decide si esta feature cierra con lo que tiene y lo otro es una feature nueva.

## Si la feature toma entradas del backlog

Si el brainstorming acordó que esta feature resuelve entradas de `docs/pendientes.md` (o del tracker que nombre `CLAUDE.md`), nombralas en `## Alcance` de `requirements.md` por su id (`P2`), y al commitear la aprobación de `requirements.md` pasá su estado a `en <carpeta-de-la-feature>` en el backlog. Solo esa celda: el resto de la entrada es de quien la escribió. `close-feature` las pasa a `resuelto` al cerrar.

## Archivos de este skill

- `assets/requirements-template.md` — estructura de `requirements.md`
- `assets/design-template.md` — estructura de `design.md`
- `references/ears-patterns.md` — los 5 patrones EARS, ejemplos del dominio y errores típicos
