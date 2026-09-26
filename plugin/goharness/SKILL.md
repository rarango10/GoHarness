---
name: goharness
description: "Explica el ciclo de desarrollo asistido de este harness y enruta a la pieza que corresponde en cada paso. Usalo cuando la persona pregunte cómo se trabaja acá, cuál es el paso siguiente, qué skill le toca a lo que quiere hacer, o cuando pida arrancar una feature y no esté claro en qué punto del ciclo está. No produce ningún documento por su cuenta: nombra al skill que sí lo produce."
---

# Harness — el ciclo y su ruteo

Este plugin trae un ciclo de desarrollo de nueve pasos, contando el paso 0 que prepara el proyecto. Cada paso produce un artefacto, se
detiene y espera aprobación humana. **Ningún paso arranca al que le sigue: lo nombra.**

| # | Producto | Lo produce | Se pide diciendo |
|---|----------|------------|------------------|
| 0 | el `CLAUDE.md` del proyecto | skill `harness-init` | «preparemos el proyecto», «no hay CLAUDE.md» |
| 1 | diseño acordado (en el chat) | skill `brainstorming` | «quiero agregar X», «cómo construimos Y» |
| 2 | `requirements.md` | skill `specify`, fase 1 | «escribamos el spec» |
| 3 | `design.md` | skill `specify`, fase 2 | «pasemos al diseño» |
| 4 | `tasks.md` | skill `planning-tasks` → workflow `tasks-fanout` | «planeemos las tareas» |
| 5 | código + tests | skill `implement-task` (TDD) | «implementemos T3», «seguimos con la que sigue» |
| 6 | veredicto por tarea (en el chat) | subagente `dod-checker` | «verificá T3» |
| 7 | `e2e-tests-plan.md` + `e2e-test-report.md` — **condicional** | skill `verify-e2e` | «verifiquemos e2e» |
| 8 | corrida de higiene + commit de cierre | skill `close-feature` | «cerremos la feature», «commiteemos» |

**El paso 7 no es de todas las features.** Aplica solo si el `design.md` de la feature declara
superficie navegable — algo que Playwright pueda abrir. Una feature sin interfaz (una CLI, una
librería, un job) termina sus tareas en `hecho` y salta directo al paso 8: no es una excepción, es
el camino para ese tipo de feature.

Todo el papeleo de una feature vive en `docs/AAAA-MM-DD-<feature>/`.

**Cada documento tiene un solo productor.** Si una frase te deja dudando entre dos skills, gana
esta tabla. Y si el `CLAUDE.md` del proyecto trae su propia tabla de ruteo, **gana la del
proyecto**: este skill describe el ciclo por defecto, no lo impone sobre un repo que ya decidió.

## Lo que el harness espera del proyecto

Los skills y los subagentes no saben qué stack usás. Leen el `CLAUDE.md` del proyecto, que tiene
que declarar al menos:

- **Comandos de verificación** — de ahí sacan qué correr `spec-scout`, `dod-checker`,
  `task-reviewer` y `e2e-triager`. Sin esa sección no saben cómo comprobar nada. Conviene que
  distinga dos ranuras: el comando de **corrección** (typecheck + tests), que es el de los pasos 5
  y 6, y el de **higiene** (lint, formato, build, e2e), que es el del paso 8. Con lint adentro del
  primero, una queja de formato hace fallar la verificación de una tarea por una razón ajena a su
  criterio.
- **Stack y reglas** — el contrato del proyecto, que `specify` respeta al diseñar.

Si el proyecto no tiene `CLAUDE.md`, **no lo inventes ni asumas `npm`**: ese archivo tiene
productor, y es el skill `harness-init` del paso 0. Nombralo y parate ahí — sembrarlo a mano es
justo lo que hacía que llevar el harness a otro repo fuera trabajo manual.

## Las cuatro reglas que sostienen el ciclo

1. **Un solo productor por documento.** El plan de `tasks.md` lo escribe únicamente el workflow
   `tasks-fanout`; los tests e2e, únicamente `e2e-test-writer`; el reporte e2e, únicamente
   `e2e-triager`. Nunca a mano, nunca con otro subagente.

2. **El avance lo escribe quien implementa**, y solo en las regiones de la tarea que está
   haciendo: su celda de `Estado` y su bloque de `Registro` — más el encabezado de aprobación de
   `tasks.md`, una vez, cuando la persona confirma el plan. No es una excepción a la regla
   anterior — son regiones distintas con dueños distintos. Lo único prohibido es implementar
   mientras hay una corrida de `tasks-fanout` en vuelo.

3. **La unidad del paso 5 es la tarea, no la fase.** Once tareas son once ciclos, cada uno
   cerrado por un veredicto de `dod-checker` y su aprobación. La compuerta entre tareas se
   renuncia solo con el vocabulario de `implement-task` (`--modo corrido`), nunca por inferencia;
   la verificación de cada tarea y el corte ante un veredicto menor no se renuncian nunca. Y la
   segunda ronda de una misma tarea —cuando un veredicto salió menor que `cumple`— también espera
   el sí, siempre: no es «la tarea siguiente», así que `--modo corrido` no la alcanza.

4. **`hecho` significa verificado, y sobre un estado.** Una tarea pasa a `hecho` solo cuando
   `dod-checker` devolvió `cumple` y ese veredicto quedó asentado en su `Registro`; cualquier
   resultado menor la deja en `en curso`. Y ese `cumple` vale para el repo tal como estaba al
   tomarlo: puede volverse falso sin que la tarea cambie, así que el paso 8 lo vuelve a comprobar
   sobre el estado final y un rojo ahí reabre la tarea. La columna `Estado` es el registro durable
   de qué está terminado de verdad.

## Cuando algo cambia a mitad de camino

El ciclo de arriba va hacia adelante. Esta sección es el camino de vuelta: qué se hace cuando, a
mitad de una feature, aparece algo que obliga a tocar el spec, el plan o lo ya implementado.

**La regla, en una línea:** *un cambio entra por el documento más alto que toca, baja en cascada
por sus productores, y todo veredicto que se apoyaba en lo cambiado deja de valer.*

**1. Parar y clasificar.** Quien lo detecta —`implement-task`, `dod-checker`, `e2e-triager`,
`close-feature`— no lo arregla donde lo encontró. Lo asienta en el `Registro` de la tarea en curso
(o en el reporte de su paso), lo pone en una clase y nombra el camino:

| Clase | Pregunta que la distingue | Camino |
|---|---|---|
| Bug en la tarea en curso | ¿Lo rompe o le falta a lo que estoy haciendo? | TDD de la misma tarea |
| Bug en otra tarea `hecho` de esta feature | ¿Contradice el `cumple` de otra tarea? | Esa tarea baja a `en curso`, con el sí, y vuelve a `implement-task` |
| Cambió el *cómo*, no el *qué* | ¿Los criterios siguen igual y `design.md` ya no describe lo que existe? | Enmienda de `design.md` con `specify` |
| Cambió el *qué* | ¿Hay que corregir, agregar o volver obsoleto un criterio? | Enmienda de `requirements.md` con `specify`, y cascada |
| El plan está mal, el spec no | ¿Falta una tarea, sobra, o un `Cubre` está mal? | `planning-tasks` |
| Hace falta una decisión ya | ¿No se puede seguir sin que la persona elija? | `[decidir ya]` en `Pendientes` |
| Le corresponde a otra feature | ¿Es código de otra feature, o algo transversal: toolchain, runner, dependencias? | `[backlog]` en `Pendientes`, y `close-feature` lo mueve al backlog del proyecto |
| Cambió la feature misma | ¿Cambió el problema que resuelve, o la enmienda deja sin propósito buena parte del plan? | `brainstorming`; la persona decide si esta feature cierra con lo que tiene |

Ante la duda entre dos clases, **la más alta**: tratar un criterio mal como un bug lo tapa con
código; tratar un bug como un criterio mal cuesta una enmienda corta.

**Un salto mayor del runner o del toolchain es siempre de otra feature.** Invalida todos los
veredictos existentes a la vez, y su verificación es otra: que la suite completa siga en verde con
la herramienta nueva. Hecho a mitad de una feature, la contamina.

**2. La enmienda.** La hace `specify`, sobre un documento ya aprobado: se presenta **solo lo que
cambió**, se espera el sí y se commitea aparte. El encabezado queda `aprobado (…) · enmendado (…):
<ids>` y el documento suma una línea en `## Enmiendas`. No se renumera nada: un criterio que cambia
de sentido se marca obsoleto y nace con id nuevo.

**3. Lo que deja de valer.** Un `cumple` vale para el estado del código en que se tomó, y también
para el texto del criterio que verificó. Una tarea `hecho` cuyo `Cubre` tiene un id enmendado
**después** de su verificación deja de estar verificada: vuelve a `en curso`, con el sí de la
persona, y la baja quien implementa, porque `Estado` y `Registro` son su región. Lo detectan el
arranque de `implement-task` y, como red de seguridad, `close-feature`.

**4. El re-plan.** Si la enmienda agregó, quitó o volvió obsoletos criterios, el plan se rehace con
`planning-tasks`; sus revisores ven `## Enmiendas`. Un plan que cambia vuelve a pedir aprobación.

**5. Reanudar** con `implement-task`. Mientras una enmienda o un re-plan están abiertos, no se
implementa: es la misma razón por la que no se implementa con `tasks-fanout` en vuelo.

**El backlog del proyecto** es `docs/pendientes.md`, salvo que el `CLAUDE.md` nombre otro lugar (un
tracker). Lo que le corresponde a otra feature vive ahí, con id `P<n>` que no se reusa. Lo escribe
`close-feature` al cerrar cada feature (mueve las líneas `[backlog]` y resuelve las que la feature
tomó), lo marca `specify` cuando una feature toma una entrada, y lo lee `brainstorming` antes de
explorar una idea nueva. `dod-checker` no lo lee a propósito: un verificador con una lista de
«fallas conocidas» aprende a descartar rojos.

## Requisito de entorno

El paso 4 usa un workflow dinámico. Si el tool `Workflow` no existe, hay que activar
`"enableWorkflows": true` en `~/.claude/settings.json` (o `/config` → Dynamic workflows) y abrir
**sesión nueva**: el registro de workflows se arma al arrancar. Sin eso, `planning-tasks` no
puede lanzar nada — y el camino correcto es destrabarlo, no planificar el `tasks.md` a mano.
