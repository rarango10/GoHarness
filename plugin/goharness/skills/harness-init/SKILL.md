---
name: harness-init
description: "Siembra el CLAUDE.md de un proyecto para que el harness pueda trabajar ahí: parte de una plantilla y completa sus ranuras entrevistando, nunca decidiendo solo. Es el paso 0 del ciclo. Usalo cuando la persona diga 'armemos el contrato', 'preparemos el proyecto', 'iniciemos el harness acá', 'no hay CLAUDE.md', o cuando quiera arrancar una feature en un repo que todavía no tiene uno. Si ya existe un CLAUDE.md, no lo pisa: lo revisa contra lo que el harness necesita y propone los arreglos. Siembra además los configs que codifican memoria del harness (excluir end2end/ del runner de unidad, retries 0 en Playwright), y no siembra las plantillas de documentos, que viajan en los skills que las usan."
---

# Harness Init

El paso 0, y durante mucho tiempo el único sin dueño. Los siete pasos del ciclo tienen cada uno su
productor; **el contrato del proyecto no tenía ninguno**, y la única salida que ofrecía el router
era «hacelo con `/init` o a mano».

Eso lo volvía trabajo manual justo donde debería ser un comando: `CLAUDE.md` es lo único que hay que
adaptar para llevar el harness a otro repo, o sea **el paso que más se va a repetir**. En un proyecto
que ya existe no se nota; en uno nuevo es lo primero que se topa.

`/init` no alcanza: sobre una carpeta vacía no tiene nada que analizar, y no conoce las ranuras que
el harness necesita.

## Las dos mitades, y por qué hacen falta las dos

**La plantilla restringe por estructura, no por prosa.** Es lo que la hace valiosa: casi todo el
harness son compuertas de instrucción, que se cumplen porque el modelo las lee. La plantilla no.

- No tiene sección «Estructura», así que esa sección **no existe** — y meter un árbol de archivos en
  el contrato, que es territorio del `design.md`, pasa de improbable a imposible.
- Tiene **dos ranuras de comandos rotuladas por separado**, corrección e higiene, así que
  conflacionarlas también deja de estar disponible.

**La entrevista llena las ranuras.** Y acá está el mecanismo que importa: **una ranura sin llenar es
una pregunta visible.** Un `<stack: preguntá antes de completar>` que quedó sin tocar se ve en el
archivo, y cualquiera que lo abra sabe que falta algo. Una generación libre que decidió sola no deja
ninguna marca — y ya pasó: se escribió un stack entero sin preguntar, con la consulta pedida
explícitamente en el prompt, y el archivo resultante no tenía forma de delatarlo.

## Si ya existe un `CLAUDE.md`

**No lo pises.** Este skill no es «regenerá el contrato»; sobre un repo que ya tiene uno, su trabajo
es revisarlo contra lo que el harness necesita y **proponer** los arreglos, uno por uno, para que la
persona decida. Mirá cuatro cosas:

1. **Las dos ranuras de comandos** están rotuladas y separadas. Si hay una sola lista de comandos,
   ese es el hallazgo más caro de los cuatro: sin la separación, `implement-task` y `close-feature`
   no tienen contra qué bindear, y un lint adentro del comando de corrección hace fallar la
   verificación de una tarea por una queja de formato.
2. **No hay sección de estructura** ni nombres de archivos concretos.
3. **La tabla del ciclo** nombra a los productores actuales de cada paso.
4. **Los configs** de la sección «Qué sembrar» existen y dicen lo que tienen que decir.

Un cambio al `CLAUDE.md` de un proyecto que ya trabaja es un cambio de contrato: se propone y se
espera el sí. No lo apliques de corrido.

## La entrevista

Antes de preguntar nada, **mirá lo que ya está**: `package.json`, `pyproject.toml`, `go.mod`, un
`Makefile`, los archivos que haya. Una pregunta cuya respuesta está en el repo es una pregunta que
gasta la paciencia de la persona sin comprar nada.

**Primera ronda — lo que no depende de nada:**

- Nombre del proyecto y qué es, en una línea.
- **El stack.** Esta es la que nunca se saltea, ni siquiera cuando la respuesta parece obvia. Si
  tenés una recomendación, dala — pero **etiquetada**: «lo decidí yo, decime si va». Lo que no se
  puede es escribirla en el archivo como si la hubieran pedido.

**Segunda ronda — lo que depende del stack:**

- **El comando de corrección**: typecheck y tests. Nada más.
- **El comando de higiene**: lint, formato, build, e2e — lo que exista. Si el proyecto todavía no
  tiene ninguno, la ranura se llena repitiendo los de corrección **y se dice que es provisorio**. La
  ranura vacía no se borra: existe porque el paso 8 la va a buscar.

Si el repo ya declara scripts, **proponelos en vez de preguntar en abstracto**: «saqué estos de tu
`package.json`, ¿los confirmás?». Es más rápido y deja el origen a la vista.

**Reglas propias del proyecto:** preguntá si hay alguna que valga para *toda* feature. Si no hay,
la línea se borra en vez de inventarse una.

**Etiquetá el origen de cada cosa que quede escrita**: «lo pediste» · «lo decidí yo, decime si va» ·
«lo asumí porque X». Un supuesto declarado es honesto; uno silencioso se convierte en regla del
contrato y de ahí en más nadie lo vuelve a cuestionar.

## Escribir el archivo

Copiá `assets/CLAUDE.template.md` a `CLAUDE.md` en la raíz del proyecto y completá las ranuras con
lo que salió de la entrevista. La tabla del ciclo y las reglas del harness **vienen ya escritas**:
son memoria del método, no decisiones del proyecto, y no se reabren en cada init.

**El chequeo antes de dar el paso por terminado**, y es mecánico a propósito:

```bash
grep -n "preguntá antes de completar" CLAUDE.md
```

Si devuelve algo, hay una ranura sin llenar. Puede estar bien —a veces falta un dato que la persona
no tiene ahora— pero entonces **decilo con todas las letras** en vez de dejarlo pasar: el archivo
queda con una pregunta abierta y adentro, que es exactamente lo que la plantilla vino a lograr.
Nunca la tapes completando por tu cuenta.

## Qué sembrar además del `CLAUDE.md`

Los configs que codifican conocimiento del harness y que un proyecto nuevo no va a redescubrir.
Están en `assets/stacks/<stack>/`, y hoy hay uno solo, `typescript-node`. **Es a propósito: se
arranca con un stack y se agregan a medida que aparezcan**, en vez de inventar configs para stacks
que nadie usó todavía.

| Archivo | Qué codifica |
|---|---|
| `vitest.config.ts` | Excluye `end2end/` del runner de unidad. Sin esto, los dos runners se pelean por los `.spec.ts` — y el fallo aparece recién cuando el ciclo e2e puebla la carpeta, invalidando veredictos de tareas que nadie tocó. |
| `playwright.config.ts` | `retries: 0`. Un caso que pasa al segundo intento es un hallazgo, no un caso resuelto, y el triager lo tiene que ver así. |

**Copialos con sus comentarios.** Los comentarios *son* el contenido: explican por qué el archivo
existe, y sin ellos el primero que los lea va a borrar la exclusión por parecer arbitraria.

Si el stack no es ninguno de los que hay en `assets/stacks/`, **no improvises los configs**: decí
qué problema resuelven —los dos de la tabla— y dejá que la persona decida cómo se traduce a su
stack. Un config inventado para un runner que no conocés es peor que ninguno.

**Ofrecé `git init` si el repo no lo es.** El método pide un commit por tarea, y sin repo eso no
existe. Pasó: un proyecto entero se hizo sin repo porque nadie lo corrió y nada en el método lo
pedía.

## Qué NO sembrar

- **Las plantillas de documentos** (`requirements-template.md`, `design-template.md`,
  `tasks-template.md`, `e2e-tests-plan-template.md`). Ya viajan en `assets/` de los skills que las
  usan, y varios agentes las conocen por precarga. Copiarlas al proyecto crea dos copias y la
  pregunta de cuál gana, que es la misma trampa de tener el mismo workflow en dos lugares.
- **La carpeta `docs/`.** La crea `specify` cuando la necesita.
- **Código, scaffolding o una app de ejemplo.** Este paso escribe el contrato, no el proyecto.

## Al terminar

Contá en tres líneas qué quedó: el stack acordado, los dos comandos, y qué configs sembraste. Después
nombrá el **paso 1**, el skill `brainstorming`: es por donde entra la primera feature. No lo
arranques vos.

## Archivos de este skill

- `assets/CLAUDE.template.md` — la plantilla del contrato, con sus ranuras.
- `assets/stacks/typescript-node/` — los configs que codifican memoria del harness para ese stack.
