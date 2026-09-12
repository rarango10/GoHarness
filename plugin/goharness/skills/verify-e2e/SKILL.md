---
name: verify-e2e
description: "Verifica una feature ya implementada de punta a punta, en dos fases: escribe e2e-tests-plan.md con 3 casos (1 happy path y 2 de fallo) a partir del spec aprobado, y después orquesta la generación de los tests de Playwright y su corrida, hasta un e2e-test-report.md que rutea cada fallo. Usalo cuando la persona diga 'verifiquemos e2e', 'probemos de punta a punta', 'armemos los tests end to end', 'corramos el e2e', o cuando todas las tareas de un tasks.md ya estén en hecho y falte comprobar que la feature completa funciona. Es el paso siguiente a la verificación por tarea de dod-checker: dod-checker verifica una tarea contra sus criterios, este skill verifica la feature entera contra el spec. No escribe los tests ni el reporte por su cuenta — eso lo hacen los subagentes e2e-test-writer y e2e-triager."
---

# Verify E2E

`dod-checker` responde «¿T7 cumple R3.2?». Este skill responde otra pregunta: **¿la feature entera funciona?** Son verificaciones distintas y ninguna reemplaza a la otra — 29 tareas en `hecho`, cada una verificada contra sus criterios, siguen sin decir nada sobre si el flujo completo camina de principio a fin.

El workflow del proyecto es: brainstorm → requirements + design → plan de tareas → implementación TDD (`implement-task`) → verificación por tarea (`dod-checker`) → **verificación end-to-end (este skill)** → cierre (`close-feature`). Este skill es el paso 7 y se detiene ahí.

Producís vos un solo documento: `e2e-tests-plan.md`. Los otros dos productos del ciclo tienen cada uno su propio dueño, y no sos vos: los scripts los escribe el subagente `e2e-test-writer` y el reporte lo escribe el subagente `e2e-triager`. Es la misma regla de un solo productor por documento que rige el resto del proyecto.

## Modos y compuertas

Hay tres compuertas, y **por defecto las tres están activas**. El modo se dice al invocar; no hay archivo de configuración, y no lo agregues: el default vive acá, en este archivo, que es el único lugar que manda sobre este paso.

| id | Dónde para | Qué protege |
|---|---|---|
| `plan` | Después de escribir `e2e-tests-plan.md`, antes de generar scripts | Un plan malo produce tres tests malos. Revisarlo es leer un markdown de tres casos. |
| `scripts` | Después de generar los tests, antes de correrlos | Que no se ejecute código generado sin que nadie lo haya mirado. |
| `ruteo` | Después del reporte, antes de actuar sobre él | Es la única que muta estado durable: baja una tarea de `hecho` a `en curso` en `tasks.md`. |

Vocabulario exacto, tal como puede venir en la invocación:

- sin nada → las tres activas
- `--modo autonomo` → ninguna; el ciclo corre del spec al reporte sin parar
- `--sin plan`, `--sin scripts`, `--sin ruteo` → desactiva esa y solo esa
- se combinan: `--sin scripts --sin ruteo`

Dos cuidados. **Desactivá exactamente lo que te dijeron y nada más**: un `--sin scripts` no autoriza a saltear la compuerta de `ruteo`, aunque las dos estén en el mismo ciclo. Y **decí al arrancar qué modo entendiste**, en una línea, antes de hacer nada. Si la persona se equivocó al escribirlo, ese es el único momento barato para descubrirlo.

## Fase 1 — Entender el proceso y verificar precondiciones

La carpeta del spec es `docs/AAAA-MM-DD-<feature>/`. Si hay varias y no está claro cuál, preguntá.

Leé, en este orden: `requirements.md` (los criterios numerados son la materia prima del plan), `design.md` (de ahí sale cuál es la superficie de la app y cómo se levanta) y `tasks.md` (la columna `Estado` dice qué está realmente implementado).

Después comprobá cuatro cosas, y **paralo todo si falla cualquiera**:

1. **`requirements.md` y `design.md` dicen `aprobado`** en su encabezado. Si no, remití al skill `specify`. Un plan de tests e2e escrito sobre un spec sin aprobar prueba una feature que todavía puede cambiar.
2. **Hay algo implementado que valga la pena probar.** Si toda la tabla de `tasks.md` está en `pendiente`, no hay nada que verificar de punta a punta todavía. Si algunas tareas están en `hecho` y otras no, decilo y preguntá si vale la pena igual: un e2e sobre una feature a medias falla por diseño, y esos fallos no significan nada.
3. **Existe una app navegable.** Esto es lo que hace posible el resto: Playwright necesita una URL que abrir. Buscá un script `dev`/`start`/`serve` en `package.json`, un `index.html`, un servidor, un `baseURL` en `playwright.config.ts`. **Si no hay ninguno, pará y decilo con todas las letras**: sin superficie navegable no hay e2e que generar, y el remedio no es inventarlo ni caer a tests de unidad disfrazados —para eso ya está Vitest— sino construir la interfaz como una feature aparte, con su propio brainstorming. No escribas ningún archivo cuando pares acá.
4. **Playwright está instalado y con browser.** `@playwright/test` en `devDependencies` y el browser bajado. Si falta, reportalo con el comando que lo arregla (`npm i -D @playwright/test`, `npx playwright install chromium`) y esperá: instalar dependencias o bajar un browser de cientos de megas es una decisión de la persona, no tuya.

Cerrá la fase contando en una línea qué encontraste: la superficie de la app, cómo se levanta, y cuántas tareas hay en `hecho`.

## Fase 2 — El plan de tests e2e

Escribí `e2e-tests-plan.md` en la carpeta del spec, siguiendo `assets/e2e-tests-plan-template.md`.

**Son exactamente tres casos: uno de happy path y dos de fallo.** No cuatro porque encontraste otro flujo interesante, ni dos porque el tercero se parecía. El número es fijo a propósito: un plan e2e que crece sin techo termina siendo una segunda suite de tests unitarios, lenta y frágil, que nadie corre.

- **El happy path (`E1`)** es el recorrido completo que le da sentido a la feature, de la primera pantalla al resultado observable. Si tenés que elegir entre dos, quedate con el que cruza más criterios de aceptación.
- **Los dos de fallo (`E2`, `E3`)** salen de los criterios que ya describen un rechazo o un error en `requirements.md` —los `IF ... THEN`— y se citan por id. **No los inventes.** Un caso de fallo inventado prueba una decisión de producto que nadie tomó, y cuando falla no se sabe si el bug está en el código o en el supuesto.
- Si en `requirements.md` no hay dos criterios de error, decilo: es un hueco del spec, va a **Pendientes** del plan, y lo decide una persona. No lo tapes eligiendo cualquier cosa.

Cada caso lleva id, título, criterios que cubre, precondiciones, pasos numerados en términos de lo que hace un usuario (no de selectores CSS: eso lo resuelve quien escribe el script) y resultado esperado observable.

**Compuerta `plan`:** presentá los tres títulos y los criterios que cubren, decí dónde quedó el archivo, y parate. No sigas sin un sí.

## Generar los scripts

Invocá al subagente **`e2e-test-writer`**, uno solo, pasándole la ruta del plan aprobado y la carpeta destino `end2end/AAAA-MM-DD-<feature>/`. Es el único que escribe ahí; no toques vos los archivos que produce, ni siquiera para un arreglo chico.

**Compuerta `scripts`:** contá qué archivos generó y parate antes de correrlos.

## Correr y diagnosticar

Invocá al subagente **`e2e-triager`**. Corre los tests, diagnostica cada fallo y escribe `e2e-test-report.md` en la carpeta del spec. Te devuelve además un veredicto estructurado en JSON, que es lo que usás para rutear.

No corras vos los tests antes de invocarlo: la corrida es suya, y una segunda corrida por afuera solo agrega un resultado que después hay que reconciliar.

**Compuerta `ruteo`:** presentá el resumen del reporte y qué pensás hacer con cada fallo, y esperá el sí antes de tocar nada.

## Ruteo

El campo `ruteo` del veredicto tiene tres destinos, y cada uno es un camino distinto:

- **`aFase2`** — el test estaba mal escrito. Volvé a la fase 2, corregí **solo esos casos** del plan, y rehacé el ciclo desde ahí. **Máximo dos rondas.** A la tercera, pará y subilo a la persona: un caso que no se estabiliza en dos intentos no es un test mal escrito, es una ambigüedad del spec disfrazada.
- **`aTDD`** — el fallo es del código. La tarea nombrada vuelve a `en curso` en `tasks.md` y el fallo e2e queda asentado en su `Registro` como el punto de partida. Eso **lo escribís vos**, no el triager: `Estado` y `Registro` son la región de quien implementa, y en este ciclo quien implementa es esta sesión. A partir de ahí el arreglo es el TDD de siempre, con el skill `implement-task`, y la tarea vuelve a `hecho` solo cuando `dod-checker` devuelva `cumple`. El ciclo e2e termina acá; no arranques la reparación en el mismo mensaje.
- **`aSpecify`** — el test y el código hacen lo que dicen, y lo que está mal es el criterio. Nombrá al skill `specify` y pará. No corrijas `requirements.md` vos.

Un caso en `indeterminado` no se rutea a ningún lado: se cuenta y se sube. Adivinar el destino de un fallo ambiguo cuesta más que preguntarlo.

Si todo dio verde, decilo y nombrá el **paso 8**, el skill `close-feature`: corre la higiene
completa sobre el estado final y hace el commit de cierre. No lo arranques vos. Y decilo al cerrar,
no después, porque este ciclo es justo el que puede invalidar un veredicto viejo — poblar `end2end/`
ya dejó una vez en rojo el comando que una tarea declaraba en verde, sin que esa tarea cambiara nada.
El reporte queda como el registro durable de esta corrida.

## Por qué no hay un agente que repare el código

Porque ya existe uno y es el TDD del proyecto. Un fallo e2e cuya causa es el código es un bug en una tarea ya implementada: una tarea que vuelve a `en curso`, con un test rojo de partida que encima ya está escrito. Un agente que editara `src/` para poner el e2e en verde sería un segundo escritor del código, saltearía el ciclo TDD que `CLAUDE.md` fija como regla, y podría cerrar el síntoma dejando la causa. El loop automático de este skill es el del lado del test; el lado del código sale del loop a propósito.

## Archivos de este skill

- `assets/e2e-tests-plan-template.md` — estructura de `e2e-tests-plan.md`
