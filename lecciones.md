# Lecciones — mejoras pendientes del harness

Bitácora de lo que aprendemos usando el harness, para no perderlo entre sesiones. Cada entrada dice
**qué pasó**, **por qué importa** y **qué habría que hacer**. Cuando algo se implementa, se marca
resuelto con el commit, no se borra: saber por qué se hizo algo vale tanto como el cambio.

Estados: `abierto` (falta decidir el arreglo) · `en observación` (sabemos que pasa, falta decidir
si se toca) · **`listo para aplicar`** (el arreglo está escrito acá, solo falta hacerlo) ·
`resuelto` · **`límite asumido`** (el análisis está cerrado y la conclusión fue no tocar nada — no
es un pendiente, y reabrirlo cuesta repetir el análisis) · `descartada` (la premisa resultó falsa;
se conserva porque saber por qué era falsa evita volver a creerla).

> **No aplicar nada mientras haya una prueba del harness en curso.** Cambiar un skill o el workflow
> a mitad de una corrida invalida el resultado: después no se puede distinguir qué causó qué. Los
> arreglos `listo para aplicar` se juntan y se hacen todos al terminar el recorrido.

---

## Índice de estado

**Esta tabla es el registro durable de qué está hecho y qué no.** Es lo que hay que leer para
saberlo, y no hay que buscarlo en ningún otro lado — misma función que la columna `Estado` de un
`tasks.md`, y por la misma razón. Cada fila enlaza a su entrada, que tiene el análisis completo; las
secciones **«Lote N aplicado»** del final cuentan qué se cambió y qué apareció al cambiarlo.

| # | Qué | Estado | Dónde aterrizó |
|---|-----|--------|----------------|
| L1 | `CLAUDE.md` no tenía productor | `resuelto` | Lote 6 · skill `harness-init` |
| L2 | La precarga `skills:` adentro de un plugin | `resuelto` | verificado, sin cambios |
| L3 | `plugin details` miente por omisión | `resuelto` | Lote 7 · `README.md` |
| L4 | Los workflows de un plugin van namespaceados | `resuelto` | previo · `planning-tasks` |
| L5 | Para workflows no hay shadowing | `resuelto` | Lote 7 · `README.md` |
| L6 | El MCP de Playwright elegiría mejores selectores | `abierto` | segunda ronda |
| L7 | El ciclo e2e nunca había corrido entero | `resuelto` | corrió en el demo · README en Lote 7 |
| L8 | Las compuertas son instrucciones, no mecanismos | **`límite asumido`** | análisis cerrado |
| L9 | Solo-lectura: ¿conducta o impedimento? | `resuelto` | Lote 8 · `dod-checker` + `spec-scout` |
| L10 | Re-planificar desaprobaba un plan intacto | `resuelto` | Lote 1 · `task-writer` |
| L11 | El próximo id libre se podía reutilizar | `resuelto` | Lote 1 · `tasks-fanout.js` + `spec-scout` |
| L12 | Un test que pasa no prueba lo que dice probar | `abierto` | segunda ronda — **L29 le dejó el lever** |
| L13 | Corrección y estilo conflacionados | `resuelto` | Lote 5b · `CLAUDE.md` + Lote 6 · plantilla |
| L14 | `CLAUDE.md` invadió territorio del `design.md` | `resuelto` | Lote 6 · plantilla sin «Estructura» |
| L15 | Decidió el stack sin preguntar | `resuelto` | Lote 4 · vía L16 y L17 |
| L16 | Ritmo de preguntas sin condición de corte | `resuelto` | Lote 4 · `brainstorming` |
| L17 | Devolvió una decisión propia como si fuera tuya | `resuelto` | Lote 4 · `brainstorming` |
| L18 | El paso siguiente se nombraba después del sí | `resuelto` | Lote 3 · `specify` + Lote 4 · `brainstorming` |
| L19 | Los `agentType` también vienen namespaceados | `resuelto` | Lote 1 · `tasks-fanout.js` |
| L20 | Sin `meta.phases`, y títulos que no podían matchear | `resuelto` | Lote 1 · `tasks-fanout.js` |
| L21 | El encabezado `Estado` sin dueño después del sí | `resuelto` | Lote 3 · `specify` + Lote 5 · `implement-task` |
| L22 | Qué se le puede contar a `dod-checker` | `resuelto` | Lote 2 · `dod-checker` + Lote 5 · lado del llamador |
| L23 | Sin regla de corte cuando la verificación falla | `resuelto` | Lote 2 · `dod-checker` |
| L24 | No restaba las dependencias contra `CLAUDE.md` | `resuelto` | Lote 2 · `dod-checker` |
| L25 | No puede vivir en una carpeta sincronizada | `resuelto` | Lote 7 · `README.md` |
| L26 | Un veredicto superado sin convención | `resuelto` | Lote 3 · `tasks-template.md` |
| L27 | `Cubre` no distingue satisfacer de habilitar | `resuelto` | Lote 2 + Lote 3 · `specify` y `plan-reducer` |
| L28 | La compuerta del paso 5 sin granularidad definida | `resuelto` | Lote 5 · `implement-task` |
| L29 | La evidencia del TDD es prosa autorreportada | **`resuelto parcialmente`** | Lote 5 · commit por tarea. **El orden sigue sin verificarse** |
| L30 | La implementación sin instrucción de cierre | `resuelto` | Lote 5 · `implement-task` |
| L31 | «Un criterio, un comportamiento» sin quien la cumpla | `resuelto` | Lote 3 · `specify` + `check_specs.py` |
| L32 | No distinguía su config de lo que le mandaron | `resuelto` | Lote 2 · `dod-checker` |
| L33 | Un veredicto vale solo para el estado en que se tomó | `resuelto` | Lote 5b · `close-feature` |
| L34 | Razonó su frontera mejor de lo que se le pidió | `resuelto` | evidencia positiva, sin acción |
| L35 | Dos archivos del plugin sin fuente en el repo | `resuelto` | Lote 5 · `plugin-root/` + `sync-plugin.sh` |
| L36 | El progreso del workflow existía y ningún paso lo nombraba | `resuelto` | Lote 8 · `planning-tasks` |
| L37 | Un slash command que no resuelve no da error: improvisa | `descartada` | la premisa era falsa: corrió el router |
| L38 | «Preguntá y esperá el sí» se tradujo a una pregunta estructurada inválida | `resuelto` | Lote 8 · `planning-tasks` |
| L39 | El modo revisión de `harness-init` aprueba un contrato que miente | **`listo para aplicar`** | el arreglo está escrito en la entrada |
| L40 | La segunda ronda de una tarea no decía si espera el sí | **`listo para aplicar`** | decidido: espera el sí, siempre |
| L41 | Los pasos 0 a 3 no commitean | `en observación` | una ocurrencia, sin daño |
| L42 | Una regla vive en `CLAUDE.md` y en la plantilla, sin verificación | `resuelto` | Lote 8 · `check-rules-parity.cjs` |
| L43 | Un skill extendió un principio escrito más allá de la lista | `resuelto` | evidencia positiva, sin acción |
| L44 | Dos plugins con el mismo nombre no conviven: uno se apaga en silencio | `resuelto` | documentado en el README, al forkear |
| L45 | Las advertencias del `Registro` no tienen lector ni destinatario | **`listo para aplicar`** | el arreglo está escrito en la entrada |
| L46 | El ciclo asume que toda feature tiene interfaz | **`listo para aplicar`** | el arreglo está escrito en la entrada |
| L47 | Se siembra el config de Playwright y la dependencia no tiene dueño | **`listo para aplicar`** | el arreglo está escrito en la entrada; aplicar junto con L46 |

### Lo que queda

> **Plan de aplicación de las diez pendientes** —orden, dependencias y contradicciones resueltas—:
> [`docs/2026-09-19-lotes-8-a-10/plan.md`](docs/2026-09-19-lotes-8-a-10/plan.md). Ejecutar cuando
> no haya ninguna corrida del ciclo en vuelo.

**Listo para aplicar — el insumo del próximo ciclo:** [[L39]] (el modo revisión de `harness-init`
tiene que buscar afirmaciones falsas —las del archivo y las que propone—, no solo sus cuatro
puntos), [[L40]] (la segunda ronda de una tarea espera el sí), [[L45]] (dar lector y destinatario a
lo que anota quien implementa), [[L46]] (bifurcar el ciclo según si la feature tiene superficie
navegable) y [[L47]] (config y dependencia de Playwright se siembran juntos en `harness-init`; se
aplica con [[L46]]). Los cinco tienen el arreglo escrito, y son los Lotes 9 y 10 del plan.

**Abiertos, en el orden en que conviene tomarlos:**

- **[[L12]]** — el commit por tarea le dejó el diff que le faltaba, y `dod-checker` ya tiene `Bash`
  con `git log` autorizado.
- **[[L6]]** — cuando el ciclo e2e tenga un fallo real que diagnosticar.
- **[[L8]]** — cerrada, con el matiz que le agregó [[L36]]: los hooks sí mapean sobre bordes de
  tool-call; lo que no tiene borde es la aprobación.

**En observación:** [[L41]], que el Lote 10 va a cerrar con la regla *quien recibe el sí de un
documento lo commitea*.

**Lo que ninguna corrida ejercitó todavía:** el ruteo del ciclo e2e (`causa: test` / `codigo` /
`spec`), la resta de dependencias de [[L24]], la detección de un veredicto envejecido de [[L33]],
`harness-init` sembrando desde cero, y la comparación A/B de *mismo input, distinto harness*. El
detalle está en «Primera corrida con el harness nuevo», al final.

---

## L1 · `CLAUDE.md` no tiene productor · `resuelto`

**Qué pasó.** Al abrir el harness sobre una carpeta en blanco (`my-harness-demo`, 2026-09-06), el
router explicó bien el ciclo y detectó que faltaba `CLAUDE.md`. Pero ahí se corta: los siete pasos
del ciclo tienen cada uno su productor, y el contrato del proyecto no tiene ninguno. La única
salida que ofrece es «hacelo con `/init` o a mano».

**Por qué importa.** `CLAUDE.md` es la pieza de la que dependen `spec-scout`, `dod-checker`,
`task-reviewer` y `e2e-triager` para saber qué comandos correr. Es lo único que hay que adaptar
para llevar el harness a otro proyecto — o sea, es exactamente el paso que más se va a repetir. Que
sea el único sin dueño convierte la reutilización en trabajo manual justo donde debería ser un
comando. En un repo que ya existe no se nota; en uno nuevo, es lo primero que se topa.

**Qué habría que hacer.** Un paso 0 con dueño: `/harness-init`, un skill del plugin que siembre
`CLAUDE.md` **desde una plantilla y lo complete entrevistando**. Las dos mitades hacen falta y
arreglan cosas distintas:

- **La plantilla restringe por estructura, no por prosa.** Es lo que la hace valiosa: casi todo el
  harness son compuertas de instrucción ([[L8]]), que se cumplen porque el modelo las lee. Una
  plantilla sin sección «Estructura» hace que esa sección no exista — [[L14]] se vuelve imposible,
  no improbable. Una plantilla con dos ranuras rotuladas por separado —el comando de **corrección**
  que corre `dod-checker`, y el de **higiene** previo al commit— hace imposible [[L13]].
- **La entrevista llena las ranuras.** Y una ranura sin llenar es una pregunta visible: un
  `<stack: preguntá antes de completar>` que quedó sin tocar se ve en el archivo. Una generación
  libre que decidió sola no deja ninguna marca — que es justo lo que pasó en [[L15]].

**Qué NO debe sembrar.** Las plantillas de documentos (`requirements-template.md`,
`design-template.md`, `tasks-template.md`, `e2e-tests-plan-template.md`) ya viajan en `assets/` de
los skills que las usan, y por eso seis agentes las conocen vía `skills: [specify]`. Copiarlas al
proyecto crea dos copias y la pregunta de cuál gana: es [[L5]] otra vez, y contradice la regla de un
solo dueño por documento. La carpeta `docs/` tampoco: `specify` la crea cuando la necesita.

**Qué sí conviene sembrar además del `CLAUDE.md`.** Los configs que codifican conocimiento del
harness y que un proyecto nuevo no va a redescubrir: `vitest.config.ts` excluyendo `end2end/` (si
no, los dos runners se pelean por los `.spec.ts`) y `playwright.config.ts` con `retries: 0` (un caso
que pasa al segundo intento es un hallazgo, no un caso resuelto). Eso es memoria del harness, no
plomería genérica. Son por stack, así que arrancar con uno y agregar a medida que aparezcan.

**Dónde vive la plantilla.** En `assets/` del propio skill, dentro del plugin. No en un repo de
GitHub aparte: eso agrega un canal de distribución más, necesita red al inicializar, y se
desincroniza del harness que la usa. El plugin ya viaja y ya se actualiza con `claude plugin
update`.

**Por qué `/init` no alcanza.** Sobre una carpeta vacía no tiene nada que analizar, y no conoce las
ranuras que el harness necesita.

---

## L2 · La precarga `skills: [specify]` dentro de un plugin · `resuelto` — funciona

**Qué pasó.** Seis de los siete subagentes (`dod-checker`, `plan-reducer`, `task-reviewer`,
`task-writer`, `e2e-test-writer`, `e2e-triager`) declaran `skills: [specify]` en su frontmatter. Así
conocen el formato de `tasks.md` sin que nadie se los explique. Todavía no se comprobó que esa
referencia por nombre pelado siga resolviendo cuando `specify` vive adentro de un plugin.

**Por qué importa.** Es el riesgo que falla **en silencio**. El agente no revienta: arranca sin el
template precargado y se inventa la estructura. El síntoma es un `tasks.md` levemente distinto y
ninguna señal de la causa.

**Cómo se comprueba.** Correr `dod-checker` desde un proyecto sin `.claude/` propio y mirar sus
tool calls, no su prosa: si va a leer `assets/tasks-template.md` con `Read` o `Glob`, la precarga no
resolvió y está compensando a mano.

**Verificado el 2026-09-06: funciona.** `task-writer`, corriendo desde el plugin sobre un proyecto
sin `.claude/` propio, produjo un `tasks.md` con los **dos campos opcionales** del template en su
lugar exacto: tres `Por qué no cubre criterios:` en las tres tareas con `Cubre: —`, y dos
`Nota: reemplaza a T9` en las dos que salieron de dividir esa tarea. Además usó `Cubre: —` pelado,
que es el formato actual, y no `— (infraestructura)`, que es el del `tasks.md` archivado.

Esa es la prueba: el propio `specify` dice de esos dos campos que «son los únicos dos que no se
pueden reconstruir releyendo el archivo». Existen solo en `assets/tasks-template.md`. Ningún agente
inventa esa combinación —los tres y los dos, cada uno en la tarea correcta— sin tenerlo delante.

**Lo que corrige.** La regla general que se anotó en [[L19]] —«cualquier referencia por nombre es
sospechosa al empaquetar»— es **demasiado amplia**. El namespacing de plugin aplica a **workflows**
([[L4]]) y a **agentes** ([[L19]]), pero **no** a los skills precargados por el frontmatter de un
agente. Tres referencias por nombre, dos afectadas, una sana. Vale corregir la generalización en vez
de arrastrarla: la regla real es que el namespacing aplica a lo que se **despacha** (un workflow que
se lanza, un agente que se spawnea), no a lo que se **precarga** en el contexto.

---

## L3 · `claude plugin details` miente por omisión · `resuelto` — documentado

**Qué pasó.** El inventario reporta 4 skills y 7 agentes, pero **no cuenta el `SKILL.md` raíz del
plugin ni los workflows**. La sesión real cargó además el router `harness-spike` y el workflow
`harness-spike:tasks-fanout`. Confirmado en sesión limpia el 2026-09-06.

**Por qué importa.** Es el comando natural para medir qué trae un plugin y cuánto cuesta. Si se lo
toma como fuente única, se subestima la superficie cargada y se concluye mal —como nos pasó a
nosotros, que dimos por probable que los plugins no soportaran workflows.

**Qué habría que hacer.** Nada en el harness: es un hueco del reporte de Claude Code. Queda anotado
para no volver a confiar en él como inventario completo. Verificar contra el listado de skills de la
sesión.

---

## L4 · Los workflows de un plugin se registran namespaceados · `resuelto`

**Qué pasó.** El cargador de Claude Code 2.1.261 registra los workflows de un plugin como
`` `${plugin}:${meta.name}` `` — o sea `mi-harness:tasks-fanout`, no `tasks-fanout`. El nombre pelado
no resuelve, y el paso 4 del ciclo (el único escritor de `tasks.md`) quedaba inalcanzable.

**Cómo se resolvió.** `planning-tasks` ahora lee la lista de `Available:` que trae el propio mensaje
de error y se queda con la entrada que termine en `:tasks-fanout`, sin hardcodear el prefijo — el
nombre del plugin cambia según cómo esté instalado y renombrarlo no puede romper el skill. Commit
`c9092d7` / `6d6a557`.

**Verificado en vivo el 2026-09-06.** La sesión lanzó `tasks-fanout`, recibió
`Workflow "tasks-fanout" not found. Available: deep-research, harness-spike:tasks-fanout`, y
relanzó sola con el nombre correcto. El arreglo funciona tal como se diseñó.

**Salvedad.** Esto se leyó del binario de Claude Code, no de documentación pública. Es comportamiento
interno y puede cambiar entre versiones.

---

## L5 · Para workflows no hay shadowing · `resuelto` — documentado

**Qué pasó.** Consecuencia de L4: como los nombres difieren (`tasks-fanout` vs
`mi-harness:tasks-fanout`), una copia local del workflow y la de un plugin **coexisten**. Para
skills y agentes sí hay shadowing; para workflows, no.

**Por qué importa.** Se puede estar corriendo la copia vieja del repo sin notarlo, creyendo que se
usa la del plugin. Un arreglo en el plugin no cambiaría nada y no habría señal de por qué.

**Qué habría que hacer.** Al empaquetar de verdad, borrar `.claude/workflows/` del proyecto —igual
que `.claude/skills/` y `.claude/agents/`— y dejar solo `CLAUDE.md`. Está escrito en el README, paso
5 de «Armar tu propio plugin». Conviene que lo diga también `planning-tasks` cuando resuelva un
nombre namespaceado habiendo también uno local.

---

## L6 · El MCP de Playwright podría elegir mejores selectores · `abierto`

**Qué pasó.** `e2e-test-writer` tiene instrucción de preferir selectores por rol y texto accesible
(`getByRole`, `getByLabel`). Pero el rol y el nombre accesible se computan en runtime, sobre el DOM
renderizado, y hoy el agente los deduce leyendo el markup del código fuente.

**Por qué importa.** Un selector mal elegido hace fallar el e2e, el triager tiene que diagnosticar
`causa: test`, y se gasta una ronda entera para descubrir que el código estaba bien.

**Qué habría que hacer.** Que la fase 1 de `verify-e2e` detecte si el MCP de Playwright está
disponible y, si lo está, que `e2e-test-writer` verifique cada selector con `browser_snapshot`
—el árbol de accesibilidad de la página corriendo— antes de escribirlo.

**Lo que NO hay que hacer.** Declarar el MCP como componente del plugin. Le levantaría un servidor de
Playwright a todo el que lo instale, aunque nunca use el ciclo e2e. El MCP va a nivel usuario, en
`~/.claude.json`, que es donde ya está.

---

## L7 · El ciclo e2e nunca corrió entero · `resuelto` — corrió y salió bien

**Qué pasó.** El paso 7 está construido y verificado solo hasta su primera compuerta: la fase 1
detecta que no hay app navegable y detiene el ciclo sin escribir nada. Lo que sigue —plan de tests,
generación con Playwright, corrida y diagnóstico— nunca se ejercitó contra un caso real, porque
ningún proyecto de prueba tuvo interfaz.

**Por qué importa.** Es la parte más nueva del harness y la menos probada. `e2e-triager` tiene el
contrato de salida más complejo de todos los agentes y nunca lo emitió de verdad.

**Corrió entero el 2026-09-06**, sobre la calculadora del demo, con las tres compuertas activas. Las
cuatro precondiciones de la fase 1 pasaron por primera vez. Resultado: plan con tres casos (E1 happy
path, E2 sobre R2.2, E3 sobre R2.3), tres specs generados —uno por caso, nombrados por id—, y los
tres en verde en la primera corrida real de `npm run e2e`.

**La calidad de lo generado, que era la incógnita:**

- **Todos los selectores por rol y nombre accesible** (`getByRole('button', { name: 'Calcular' })`),
  cero CSS y cero posiciones. Sin `waitForTimeout` en ningún lado. Las dos instrucciones más
  específicas de `e2e-test-writer`, respetadas.
- **Y algo que no estaba pedido:** los dos casos de fallo agregan
  `await expect(page.getByRole('alert')).toHaveCount(0)`. El agente fue a leer la sección «No
  incluye» de `requirements.md` —«Mensajes de error visibles para entradas inválidas — se resuelven
  en silencio»— y la convirtió en aserción positiva. No verifica solo que la suma dé bien: verifica
  que el manejo silencioso sea efectivamente silencioso.

Eso resuelve por su cuenta una tensión que se había anticipado: R2.2 y R2.3 no describen rechazos
sino normalización silenciosa, así que llamarlos «casos de fallo» era forzado. El writer entendió el
matiz y lo codificó.

**Lo que queda sin ejercitar.** Los tres casos pasaron, así que el **ruteo** —`causa: test` /
`codigo` / `spec`— no se probó, ni el loop de reintento del lado del test. Es la parte con más
diseño y todavía cero pruebas. Se ejercitaría sola la primera vez que un e2e falle de verdad.

---

## L8 · Las compuertas son instrucciones, no mecanismos · `límite asumido`

**Qué pasó.** Vale para las cuatro compuertas fijas del ciclo y para las tres configurables del e2e.
Nada impide que un modelo saltee una compuerta activa, ni que `--modo autonomo` apague más de lo
pedido.

**Por qué importa.** Es una limitación asumida, no un bug. Se documentó la razón: un archivo de
configuración de compuertas no obligaría a más que la prosa, y agregaría un origen normativo que
puede contradecir al skill. El enforcement real (hooks `PreToolUse`) no mapea, porque los hooks
disparan en llamadas a herramientas y no hay borde de tool-call que signifique «el plan fue
aprobado».

**Qué habría que hacer.** Nada por ahora. Queda anotado para no redescubrir el análisis.

---

## L9 · Que los agentes de solo lectura no escriban es conducta, no impedimento · `resuelto` (Lote 8)

**Qué pasó.** Se mide con un manifiesto de hashes del working tree antes y después de cada corrida
—nunca preguntándole a un agente qué herramientas cree tener— y hasta ahora dio limpio. Pero a todos
se les dice además que no escriban, así que lo comprobado es que nadie quiso, no que no hubiera
podido.

**Qué habría que hacer.** Un `permissions.deny` o un hook `PreToolUse` que lo convierta en garantía.

**Corrección (2026-09-07): «a todos» era falso, y la lección estaba sobre-generalizada.** Al revisar
los `tools:` declarados en el frontmatter de cada agente aparece que **la mitad sí está impedida de
verdad**:

| Agente | `tools:` declarados | ¿Conducta o mecanismo? |
|---|---|---|
| `task-reviewer` | `Read, Grep, Glob` | **Mecanismo.** No tiene ninguna herramienta capaz de escribir |
| `plan-reducer` | `Read, Grep, Glob` | **Mecanismo.** Idem |
| `dod-checker` | `Read, Grep, Glob, Bash` | **Conducta.** `Bash` puede escribir |
| `spec-scout` | `Read, Grep, Glob, Bash` | **Conducta.** Idem |

`tools:` es una lista de permitidos, no una sugerencia: sin `Write` ni `Edit` ni `Bash` no hay ruta
de escritura, por mucho que el agente quiera. Confirmado además contra el listado de subagentes que
expone la propia sesión, que reporta `plan-reducer (Tools: Read, Grep, Glob)` — o sea que no es solo
lo que dice el archivo, es lo que el cargador efectivamente registró.

**Dónde queda el hueco real, entonces.** En los dos que tienen `Bash`, donde la prohibición vive en
la prosa: «Nada de redirecciones, `>`, `>>`, `tee`, `sed -i`, ni ningún comando que deje un cambio en
el repo». Ahí sí es conducta, y ahí sí sigue abierta.

**Eso abarata el arreglo y cambia su forma.** No hace falta una capa de enforcement general para
cuatro agentes: hace falta **acotar `Bash` en dos**. Lo que falta confirmar antes de intentarlo es si
un hook `PreToolUse` puede distinguir **qué subagente** hace la llamada — sin eso, un
`permissions.deny` sobre patrones de escritura en Bash es frágil, porque hay muchas formas de
escribir un archivo y la lista nunca está completa.

**La moraleja de método, que es por qué esto se registra en vez de solo corregirse.** La entrada
original afirmaba una propiedad sobre «los agentes de solo lectura» **sin haber mirado sus
frontmatter**: se dedujo del hecho de que a todos se les dice que no escriban. Es el mismo error de
forma que [[L22]] —auditar el relato en vez del repo— aplicado a nuestra propia documentación. Un
dato que estaba a un `grep` de distancia sostuvo durante semanas una conclusión más pesimista que la
realidad.

**Primera violación observada (2026-09-11).** Verificando T9 de `calculadora-operaciones` en el
demo, `dod-checker` corrió:

```
git stash && npx biome check src/App.test.tsx 2>&1 | tail -30; echo "---restore---"; git stash pop
```

Uno de los dos agentes a los que se acotó esta lección, y por la ruta exacta que se predijo: `Bash`.

**Lo que hizo bien y lo que no.** La pregunta era buena —¿la deuda de formato es anterior a T9?— y
la respuesta llegó al veredicto: el Registro la asienta como «deuda arrastrada sin registrar desde
T8». El método no: `git log -1 -- src/App.test.tsx` contestaba lo mismo sin tocar nada.

**Por qué es peor de lo que parece.** El stash se llevó todo lo modificado y sin commitear: los specs
que T9 acababa de editar, más dos cambios que flotaban desde los pasos 0 y 2 ([[L41]]). Si `biome`
colgaba o el `pop` chocaba, ese trabajo quedaba varado en un stash que nadie sabía que existía.

**Y el instrumento de medición tiene un punto ciego.** Esta lección se medía con hashes del working
tree antes y después de cada corrida. **Stash + pop deja cambio neto cero**, así que ese método
habría reportado limpio. Lo delató el Registro de la tarea, que lo cuenta de pasada.

**La raíz probable está en la redacción.** La prosa de `dod-checker` prohíbe *«ningún comando que
deje un cambio en el repo»*. Stash + pop no deja cambio neto, así que la regla literal lo permite:
está escrita sobre el **efecto** y tendría que estar escrita sobre la **ejecución** — *ningún comando
que modifique el repo, aunque lo restaure después*. Es el arreglo más barato de los que hay sobre la
mesa, y el que habría evitado este caso.

---

## L10 · Re-planificar desaprueba un plan que no cambió · `resuelto`

**Qué pasó.** Si `tasks-fanout` corre sobre un `tasks.md` ya aprobado y todos los revisores
devuelven `ok`, el escritor igual baja el encabezado de `aprobado` a `pendiente de aprobación`.

**Por qué importa.** Verificar que un plan sigue en pie tiene como efecto secundario invalidar su
aprobación. Desalienta justo la operación que debería ser barata.

**Qué habría que hacer.** Que `task-writer` preserve el encabezado cuando el plan resultante es
idéntico al que leyó el scout.

---

## L11 · El próximo id libre se calcula sobre lo que quedó en el archivo · `resuelto`

**Qué pasó.** Si desaparece la tarea de id más alto, la corrida siguiente vuelve a repartir ese
número — justo lo que prohíbe la regla de numeración, porque ese id puede estar citado en un commit
o en una bitácora.

**Qué habría que hacer.** Guardar el máximo id emitido en el archivo, en vez de derivarlo del
contenido vivo. Es el mismo patrón que el `seq` del ledger de `split-de-gastos`.

---

## L12 · `dod-checker` confía en que un test que pasa prueba lo que dice probar · `abierto`

**Qué pasó.** Con una persona manejando el ciclo TDD alcanza: vio el rojo antes del verde. En modo
autónomo se da vuelta — quien implementa queda con un incentivo directo a producir verde, y el
verificador toma el verde por bueno.

**Qué habría que hacer.** Activar una auditoría de tests, o exigir el rojo demostrado antes de
implementar.

---

## L13 · El comando de verificación puede conflacionar corrección con estilo · `resuelto`

**Qué pasó.** El `CLAUDE.md` que el harness ayudó a escribir para `my-harness-demo` (2026-09-06)
declaró que `dod-checker` corre `npm run verify`, una cadena de typecheck → lint → test → build.

**Por qué importa.** `dod-checker` responde una sola pregunta: ¿el código cumple los criterios de
aceptación? Con lint adentro del comando, una queja de formato hace fallar la verificación y la
tarea se reporta como no verificable o incumplida por una razón que no tiene nada que ver con su
criterio. Con `build` adentro, cada verificación de tarea dispara un bundle de producción. Las dos
cosas ensucian el veredicto, que es el registro durable de qué está hecho.

**Qué habría que hacer.** Que la guía para escribir `CLAUDE.md` —el futuro `/harness-init` de
[[L1]]— distinga dos comandos con propósitos distintos: el de **corrección** (typecheck + tests),
que es el del paso 6, y el de **higiene** (lint, formato, build), que es previo al commit. Hoy la
sección «Comandos de verificación» invita a poner todo junto porque no dice que sean cosas
separadas.

**Resuelta a medias en el Lote 5b, y conviene saber cuál mitad.** El `CLAUDE.md` **de este repo**
tenía el mismo defecto que el del demo —tres comandos bajo un rótulo único— y se separó en dos
ranuras rotuladas, porque sin eso `implement-task` y `close-feature` no tenían contra qué bindear.
La otra mitad —**la plantilla con las dos ranuras**, que hace el defecto imposible en un proyecto
nuevo en vez de arreglarlo en uno viejo— se cerró en el Lote 6, en
`harness-init/assets/CLAUDE.template.md`.

---

## L14 · `CLAUDE.md` se metió en territorio de `design.md` · `resuelto`

**Qué pasó.** El mismo archivo incluyó una sección **Estructura** fijando `App.tsx`, `calc.ts` y
`main.tsx` antes de que existiera ningún spec.

**Por qué importa.** `CLAUDE.md` es el contrato del proyecto: stack, comandos, reglas permanentes.
La arquitectura es lo que decide `specify` fase 2. Con la estructura ya escrita, el `design.md` va a
ratificar en vez de diseñar, y se pierde justo la parte donde se consideran alternativas. La regla
de un solo productor por documento se rompe antes de que arranque el ciclo.

**Dónde está el límite.** Una regla como «la lógica va en funciones puras separadas de la UI» sí es
del contrato: vale para toda feature, no solo para esta. Un árbol de archivos concreto no.

**Qué habría que hacer.** Que la guía de `CLAUDE.md` diga explícitamente qué **no** va: nombres de
archivos, módulos o componentes concretos. Eso es del design.

---

## L15 · Decidió el stack sin preguntar, habiéndoselo pedido · `resuelto` — vía L16 y L17

**Qué pasó.** El prompt del paso 1 decía «proponeme el stack y preguntame lo que necesites decidir».
Escribió React + Testing Library + Biome directamente, sin consultar — y el propio archivo admite
que «para tres casillas y dos botones alcanza con CSS plano y `useState`».

**Por qué importa.** No es un error de resultado —React es defendible y hasta conveniente para
probar el ciclo e2e, que nunca corrió— sino de compuerta: se le pidió consultar y no consultó. El
harness entero se apoya en que cada paso se detenga y espere. Si la consulta se saltea en el paso 0,
donde está escrita en el prompt del humano, vale preguntarse cuánto aguantan las que están escritas
en la prosa de un skill.

**Qué habría que hacer.** Ya volvió a pasar, en el paso siguiente: ver [[L16]] y [[L17]]. Deja de
ser anécdota. El patrón es consistente —el modelo prefiere avanzar con un supuesto antes que
detenerse a preguntar— y las tres entradas apuntan al mismo arreglo: condiciones de corte
verificables y etiquetado del origen de cada decisión, en vez de más prosa pidiendo que consulte.

---

## L16 · `brainstorming` fija el ritmo de las preguntas pero no la condición de corte · `resuelto`

**Qué pasó.** En el demo de la calculadora (2026-09-06), el skill hizo **una** pregunta y pasó a
proponer el diseño, decidiendo por su cuenta otras cuatro cosas de comportamiento: decimales y
negativos, cuándo se recalcula el resultado, si «Limpiar» borra también el resultado, y si la
casilla de resultado es editable. Las presentó como «casos borde ya cubiertos por la decisión de
arriba», y no lo estaban.

**Por qué importa.** El paso 2 del skill dice «Ask clarifying questions, one at a time... One
question per message». Eso especifica el **ritmo**, no el **corte**. Una pregunta por mensaje es
literalmente lo que pide, y el modelo lo cumplió. Lo único que decide cuándo dejar de preguntar es
el paso 3 —«once the shape of the idea is clear»— que es vago y lo juzga el propio modelo. El skill
no tiene forma de detectar que quedaron decisiones abiertas: es un defecto del texto, no solo
conducta del modelo.

**Qué habría que hacer.** Agregarle una condición de corte verificable: antes de proponer, enumerar
las decisiones de comportamiento que el pedido deja abiertas, y proponer recién cuando esa lista
esté vacía o cuando lo que quede esté declarado explícitamente como supuesto. Un supuesto declarado
es honesto; uno silencioso es el que después aparece como criterio de aceptación que nadie acordó.

**De paso, el paso 3 tampoco se cumplió.** Pide «offer 1-3 approaches with trade-offs»; entregó uno
solo, sin alternativas ni contrapartidas.

---

## L17 · Un modelo puede devolverte una decisión propia como si fuera tuya · `resuelto`

**Qué pasó.** En el mismo diseño: «El resultado no se recalcula solo mientras el usuario tipea —
solo al apretar Calcular, **tal como lo pediste**». La persona nunca pidió eso; había mencionado un
botón de ejecutar operación, nada sobre el momento del recálculo.

**Por qué importa.** Es la misma clase de fallo que marcar una tarea `hecho` sin veredicto de
`dod-checker`: inventar un respaldo que no existe. Y es el más difícil de detectar de todos, porque
quien lee «tal como lo pediste» asume que se acuerda mal, no que le están fabricando el
consentimiento. Una decisión así entra al `requirements.md` como criterio acordado, y de ahí en más
nadie la vuelve a cuestionar: queda blanqueada por el propio proceso que existía para evitarlo.

**Qué habría que hacer.** Una regla explícita en `brainstorming` —y probablemente en `specify`— que
prohíba atribuirle al humano una decisión que no tomó. Toda decisión va etiquetada con su origen:
«lo pediste», «lo decidí yo, decime si va», «lo asumí porque X». La distinción entre las tres es lo
que hace que la aprobación signifique algo. Es barata de escribir y ataca un fallo que ninguna
compuerta detecta, porque la compuerta pregunta «¿aprobás?» y no «¿esto que digo que pediste, lo
pediste?».

**Relación con [[L15]].** L15 queda escalada: ya no es anécdota. Dos pasos seguidos —el `CLAUDE.md`
y el brainstorming— decidieron sin preguntar, y el segundo además lo atribuyó a la persona.

---

## L18 · El paso siguiente se nombra después de aprobar, no al pedir la aprobación · `resuelto`

**Qué pasó.** En el demo de la calculadora (2026-09-06), `brainstorming` presentó el diseño y cerró
con «¿Aprobás este diseño?», sin mencionar `specify` ni qué venía después. La persona lo leyó como
que el harness se había cortado.

**Por qué el skill no lo incumplió.** Su sección se llama literalmente `## After Approval`: *«Once
the human approves the design, stop. Tell them... the next step is the `specify` skill»*. El
nombrado está condicionado a que la aprobación ya haya ocurrido. `specify` hace lo mismo con
`planning-tasks`.

**Por qué igual está mal.** La compuerta le pide a la persona que apruebe sin decirle hacia dónde
está aprobando. Hay que saberse el ciclo de memoria para saber qué desbloquea el sí. La cadena
queda descubrible solo en retrospectiva: te enterás del paso siguiente después de haberlo
autorizado.

**La evidencia es más fuerte de lo que parecía.** Al registrar esto se supuso que solo afectaría a
quien no conociera el ciclo. Falso: quien se confundió fue **la persona que construyó el harness**.
Leyó el cierre sin mención de `specify`, concluyó que el ciclo se había salteado un paso, y frenó
para reportarlo. Después aprobó, y el skill nombró `specify` correctamente — o sea que la mecánica
funciona y el problema es de legibilidad en el único momento que importa: el de decidir. Si el
defecto engaña al autor, no hay lector a salvo.

**Y agrava a [[L16]] y [[L17]].** Te piden aprobar un diseño con cuatro decisiones que nunca se
preguntaron, sin avisarte que aprobarlo las convierte en criterios de aceptación numerados en
`requirements.md`. De ahí en más quedan blanqueadas: nadie vuelve a cuestionar un `R2.3`. Saber eso
al momento de decidir cambia con qué ojos se lee el diseño.

**Qué habría que hacer.** Mover el nombrado del paso siguiente **al pedido de aprobación**, no
después. La frase de cierre tiene que decir las dos cosas: qué se está aprobando y qué habilita
—«si lo aprobás, sigue `specify`, que convierte esto en `requirements.md` con criterios numerados;
después viene `planning-tasks`, que es otro paso»—. Vale para los tres skills con compuerta:
`brainstorming` → `specify`, `specify` fase 1 → fase 2, `specify` fase 2 → `planning-tasks`. La
sección `## After Approval` puede quedar, pero el nombrado no puede vivir **solo** ahí.

**Lo que NO hay que hacer.** Arrancar el skill siguiente. La compuerta existe justamente ahí, y
nombrar no es empezar.

---

## L19 · Los `agentType` del workflow sufren el mismo namespacing que el workflow · `resuelto`

**Qué pasó.** Corriendo `tasks-fanout` desde el plugin (2026-09-06), el workflow falló en su primer
paso: el script referencia `agentType: 'spec-scout'` y dentro de un plugin el agente se registra
como `harness-spike:spec-scout`. Son **cinco** referencias en el script (`spec-scout`,
`plan-reducer` ×2, `task-reviewer`, `task-writer`) y todas fallan igual.

**Por qué se nos pasó.** Al arreglar [[L4]] se corrigió el nombre con que se **invoca** el workflow,
en la prosa de `planning-tasks`. No se pensó que las referencias **internas** del script tuvieran el
mismo problema. El namespacing de plugin aplica a los dos tipos de componente, no solo a uno.

**Por qué el arreglo de la sesión no sirve.** La sesión lo resolvió con `sed` sobre
`~/.claude/projects/.../workflows/scripts/tasks-fanout-wf_<run>.js`, que es la copia persistida **de
esa invocación**. La fuente del plugin quedó intacta: esa corrida anduvo, la siguiente regenera el
script y vuelve a fallar. Es el tipo de arreglo que se ve exitoso y no cambia nada.

**Por qué hardcodear el prefijo tampoco.** `agentType: 'harness-spike:spec-scout'` se rompe el día
que el plugin se renombre a `mi-harness` — exactamente la trampa que [[L4]] esquivó.

**Qué habría que hacer.** El mismo patrón que [[L4]], pero adentro del script: un helper que intente
el nombre pelado, y ante el error —que tiene la forma `" not found. Available agents: ..."`, igual
que el del workflow— parsee la lista, encuentre la entrada que termine en `:<nombre>`, derive el
prefijo y lo cachee para las llamadas siguientes. Descubrir en vez de asumir. Cuando el harness vive
en el repo el nombre pelado resuelve y nunca se entra al `catch`, así que el mismo script sirve para
las dos formas de distribución.

**El orden ayuda:** el scout corre primero y solo, así que el prefijo queda resuelto antes del
`parallel()` de los revisores — no hay N fallos concurrentes.

**El arreglo, escrito.** Un helper al tope de `tasks-fanout.js`, y las cinco llamadas pasan de
`agent(` a `agentP(`:

```js
let PREFIJO = null
async function agentP(prompt, opts) {
  if (PREFIJO !== null) return agent(prompt, { ...opts, agentType: PREFIJO + opts.agentType })
  try {
    return await agent(prompt, opts)            // el nombre pelado, que sirve fuera de un plugin
  } catch (e) {
    const lista = String(e?.message ?? e).match(/Available agents:\s*(.+)/)
    if (!lista) throw e
    const hit = lista[1].split(/[,\s]+/).find((n) => n.endsWith(':' + opts.agentType))
    if (!hit) throw e
    PREFIJO = hit.slice(0, -opts.agentType.length)
    return agent(prompt, { ...opts, agentType: PREFIJO + opts.agentType })
  }
}
```

Cuidado al aplicarlo: el archivo es casi todo prompts entre backticks, así que después hay que
correr `node .claude/checks/lint-workflow-literals.cjs`. Y resincronizar la copia del plugin.

**Regla general que deja, ya acotada por [[L2]].** El namespacing aplica a lo que se **despacha**
—un workflow que se lanza por nombre ([[L4]]), un agente que se spawnea por `agentType` (esta)— y
**no** a lo que se **precarga** en contexto: `skills: [specify]` resolvió bien, verificado. Al
empaquetar, revisar los puntos de despacho; los de precarga andan.

---

## L20 · El workflow no declara `meta.phases`, y tres títulos no podrían matchear · `resuelto`

**Qué pasó.** Corriendo `tasks-fanout` desde el plugin (2026-09-06) casi no se veía avance de los
subagentes. La corrida estaba sana —el scout terminó, nueve revisores corrieron en paralelo y los
resultados volvieron— pero no había nada que mirar.

**Por qué.** Tres cosas sumadas, y solo una es del harness:

1. **Los workflows siempre corren en segundo plano.** La vista viva es `/workflows`; en el
   transcript principal no se ve casi nada, por diseño. El propio resultado del tool lo dice.
2. **El script no declara `meta.phases`.** El contrato del tool `Workflow` pide un `{ title }` por
   cada llamada a `phase()`, con los títulos matcheados **exactos**. El script llama a `phase()`
   cinco veces y no anuncia ninguna, así que la vista de progreso no tiene contra qué mostrar el
   avance.
3. **Esa corrida fue un *resume*.** Los agentes ya completados devuelven resultado cacheado al
   instante, así que la primera fase pasa volando.

**El agravante.** Aunque se agregara `meta.phases`, tres de los cinco títulos están interpolados y
**nunca podrían matchear**, porque `meta` tiene que ser un literal puro:

```js
phase(`Ronda ${round}: revisión de ${toReview.length} tarea(s)`)   // línea 359
{ phase: `Ronda ${round}: revisión` }                              // línea 389
{ phase: `Ronda ${round}: reducción` }                             // línea 459
```

**El arreglo.** Títulos de fase estáticos, y el número de ronda al `label`, que sí es dinámico y es
donde corresponde:

```js
export const meta = {
  name: 'tasks-fanout',
  description: '...',
  phases: [
    { title: 'Reconocimiento del spec' },
    { title: 'Plan inicial desde cero' },
    { title: 'Revisión de tareas' },
    { title: 'Reducción' },
    { title: 'Chequeo de consistencia' },
    { title: 'Escritura de tasks.md' },
  ],
}
```

Con `phase('Revisión de tareas')` y `label: \`T${id} · ronda ${round}\`` en cada `agent()`.

**Lección general.** Un título de fase interpolado se ve razonable al escribirlo y silenciosamente
no aparece nunca en la vista de progreso. Nada avisa: no hay error, solo falta información. Lo que
varía por corrida va en el `label`; lo que estructura el workflow va en el `title`.

---

## L21 · El encabezado `Estado` de `tasks.md` no tiene dueño después de la aprobación · `resuelto`

**Qué pasó.** En el demo de la calculadora (2026-09-06) la persona aprobó el plan y la sesión lo
reportó como aprobado, pero el archivo siguió diciendo `> Estado: pendiente de aprobación`.
`requirements.md` y `design.md` sí quedaron en `aprobado` — los había actualizado `planning-tasks`
al verificar los insumos, notando que estaban desfasados.

**Por qué no es descuido de nadie.** `task-writer` tiene prohibición explícita de tocarlo: «Nunca
marques el documento como aprobado — eso lo decide una persona». Y ningún skill lo retoma después.
La aprobación ocurre en el chat y no aterriza en el archivo.

**Por qué importa.** El harness trata ese encabezado como registro durable: `spec-scout` lo lee en la
corrida siguiente, y `planning-tasks` decide con él si el spec está listo. Un plan aprobado que
figura como pendiente hace que la próxima pasada del workflow lo trate como no aprobado, y que
cualquiera que abra el repo lea que se está implementando sobre un plan sin cerrar.

**Dónde quedó resuelta.** La mitad de `requirements.md` y `design.md`, en `specify` (Lote 3). La de
`tasks.md`, en el skill `implement-task` (Lote 5): comprueba el encabezado antes de la primera tarea
y lo asienta cuando la persona confirma.

**Es la misma forma que [[L1]]**, pero sobre una transición de estado en vez de un documento: el
ciclo define quién **produce** cada archivo y no quién **marca su aprobación**. La regla «cada paso
espera aprobación humana» describe qué tiene que pasar en la conversación, no dónde queda asentado.

**Qué habría que hacer.** Que la aprobación tenga un dueño explícito, igual que el veredicto de
`dod-checker` lo tiene. La opción más simple y consistente con el resto: quien recibe el «sí»
actualiza el encabezado en el acto, y eso queda escrito en los tres skills con compuerta. Encaja con
el arreglo de [[L18]] —nombrar el paso siguiente al pedir la aprobación— porque es el mismo momento
del ciclo: al pedir el sí se dice qué habilita, y al recibirlo se asienta.

---

## L22 · Nadie define qué se le puede contar a `dod-checker` al invocarlo · `resuelto`

**Qué pasó.** Al verificar T1 en el demo (2026-09-06), la sesión que acababa de implementar la tarea
invocó al verificador con este prompt: *«Ya se corrió manualmente `npm run check`, `npm run lint`,
`npm run build` y `npm run dev` **y dieron verde**, pero necesito tu veredicto independiente...»*.

**Por qué importa.** Pedir un veredicto independiente en la misma frase en que se anuncia el
resultado esperado no produce independencia: sesga hacia `cumple`. Y quien invoca es exactamente
quien tiene interés en que la tarea pase — es el implementador presentando su propio trabajo.

**Es la contraparte de una regla que sí existe.** `dod-checker` tiene escrito por qué no escribe:
«un verificador que además asienta su propio veredicto se está firmando el boletín solo». Acá el
problema es simétrico y no está cubierto: **el implementador le dicta el veredicto al verificador.**
La independencia se protegió en la salida y quedó abierta en la entrada.

**Por qué el harness lo permite.** Los agentes del workflow reciben un contexto controlado que arma
el script (la constante `SHARED`, idéntica para todos, «para que no diverjan»). `dod-checker` se
invoca a mano desde el chat, así que su entrada no tiene contrato: le llega lo que a quien
implementa se le ocurra contarle.

**Segunda ocurrencia, peor que la primera.** En la verificación siguiente el prompt de invocación
pidió: «Devolvé el veredicto estructurado **(cumple / no cumple / parcial)**». El invocador
**redefinió el vocabulario de veredictos** y borró `no-verificable` — precisamente el valor que había
salvado la verificación anterior. Y el agente devolvió prosa en vez del JSON del contrato, sin
`objectiveMet` ni `designDeviations`. Contaminar la entrada no solo sesga la conclusión: puede
borrar del vocabulario la única salida correcta.

**Qué habría que hacer.** Definir el contrato de invocación en el propio `dod-checker`, que es el
único lugar que sobrevive a cualquier forma de llamarlo. Tres reglas:

- **El vocabulario de veredictos no es negociable.** Si el prompt propone otro conjunto de valores,
  se ignora y se usa el del contrato. Un llamador no puede achicar el espacio de respuestas.


- **Qué necesita:** el id de la tarea y la ruta del spec. Nada más. Todo lo demás lo lee él.
- **Qué debe ignorar explícitamente:** cualquier afirmación sobre resultados de comandos, tests que
  ya pasaron, o si la tarea está cumplida. Si el prompt las trae, se tratan como contexto no
  verificado y se anota en el veredicto que llegaron — igual que un caso `indeterminado` se sube en
  vez de resolverse.

Conviene además que los skills que lo nombran (`verify-e2e` lo menciona, y el ciclo lo usa en el
paso 6) digan cómo invocarlo: «pasale el id y la carpeta, no le cuentes cómo te fue».

**Confirmado con daño real, el mismo día.** El veredicto de T1 dice: «No vi ninguna dependencia
fuera del stack de CLAUDE.md **salvo** `@types/react`/`@types/react-dom`, que la propia Bitácora de
T1 ya declara». Es falso: `@testing-library/jest-dom` está en `devDependencies` y **no** está en la
lista de `CLAUDE.md`, que nombra solo `@testing-library/react` y `@testing-library/user-event`.

Lo revelador es *cómo* se le pasó. No comparó `package.json` contra `CLAUDE.md`: usó **la bitácora
del implementador como checklist**, y encontró exactamente las dos dependencias que el implementador
ya había confesado, ninguna más. El veredicto terminó ratificando el relato de quien implementó en
vez de auditarlo — que es precisamente el daño que esta entrada predecía. El agente sí corrió los
comandos por su cuenta; la contaminación no estuvo en los comandos, estuvo en **qué buscó y contra
qué lo comparó**.

---

## L23 · `dod-checker` no tiene regla de corte cuando la verificación falla · `resuelto`

**Qué pasó.** Verificando T1 en el demo (2026-09-06), `npm run check` falló porque el pool de
vitest se colgaba (timeout de 60 s). El agente encadenó **diez comandos** intentando destrabarlo:
`npm run check` dos veces, `vitest --pool=threads`, una sonda de `worker_threads` en Node crudo,
`vitest --poolOptions...` (que ni parseó), sondas de esbuild y de rolldown, `npm run build`,
`typecheck` + `lint` —que se fue a background por timeout de 120 s— y un `ps aux`. Varios de 60 s.

**Su instrucción dice «Corré la verificación, una vez».**

**El matiz que importa.** No está mal diagnosticar: ese diagnóstico es justamente lo que hace útil
un `blockedReason`. «vitest se cuelga» sirve mucho menos que «vitest 5 + vite 8 (rolldown) cuelga el
pool runner; `worker_threads` crudo levanta bien; `build` y `typecheck` pasan». El problema no es
que investigue, es que **no tiene ni tope ni condición de corte**. La regla del `no-verificable` le
dice qué veredicto dar cuando no puede correr, pero nada le dice cuándo dejar de intentar. Su
instinto es arreglar el entorno, y eso lo aleja de su producto, que es un veredicto.

**Es el mismo defecto de forma que [[L16]]**: una instrucción que fija el *ritmo* («una vez») sin
fijar la *condición de salida*. En `brainstorming` era cuándo dejar de preguntar; acá es cuándo
dejar de diagnosticar.

**Qué habría que hacer.** Darle un presupuesto explícito y un formato para lo que averigüe:

- **Un reintento como máximo**, y solo si la primera falla parece transitoria.
- **Después, hasta tres comandos de diagnóstico** cuyo único fin es llenar `blockedReason` — no
  arreglar nada. Nombrar que lo que se busca es *qué falló y en qué capa*, no una solución.
- **Prohibido intentar workarounds** del comando declarado: correr `vitest --pool=threads` cuando
  `CLAUDE.md` dice `npm run check` ya es verificar otra cosa. Si el comando del contrato no corre,
  eso **es** el hallazgo.
- Que el diagnóstico obtenido vaya al `blockedReason`, que hoy es un campo de una línea y debería
  admitir el detalle.

**Costo observado.** Varios minutos de reloj y un volumen de tokens muy superior al de una
verificación normal, para producir un veredicto que la primera falla ya determinaba.

---

## L24 · `dod-checker` no tiene un paso que compare las dependencias contra `CLAUDE.md` · `resuelto`

**Qué pasó.** Verificando T1 (2026-09-06) no detectó `@testing-library/jest-dom` en
`devDependencies`, que no figura en la lista de stack de `CLAUDE.md`. Reportó como único desvío el
que la bitácora del implementador ya declaraba.

**Por qué.** El agente tiene la restricción escrita en `## Límites` —«Respetá `CLAUDE.md`: sin
dependencias que `design.md` no haya justificado. Una implementación que sumó una librería por su
cuenta es un desvío que hay que reportar»— pero es una **mención pasiva**, no un paso del
procedimiento. `## Qué verificar` enumera cinco pasos: ubicar la tarea, correr la verificación,
criterio por criterio, el objetivo, y los desvíos del design. **Ninguno dice «leé el manifiesto de
dependencias y restalo de la lista declarada».** Lo que no es un paso, no se hace.

**Por qué importa más de lo que parece.** Una dependencia que entra sin acordarse es de los desvíos
más caros: cambia la superficie de ataque, el tiempo de build y la licencia del producto, y es
invisible en el diff del código de la tarea. Y es justamente el tipo de chequeo mecánico donde un
verificador debería ser mejor que una persona — restar dos listas no requiere juicio.

**Qué habría que hacer.** Agregarlo como paso explícito en `## Qué verificar`, redactado como una
resta y no como un vistazo: leer el manifiesto de dependencias del proyecto, leer la lista declarada
en `CLAUDE.md`, y reportar en `designDeviations` **toda** entrada del primero que no esté en la
segunda — esté o no declarada en la bitácora. Que el implementador ya la haya confesado no la saca
del veredicto: cambia si es un desvío *registrado* o *silencioso*, y las dos cosas van al reporte.

**Se repitió el mismo día, en una sesión limpia.** Segunda verificación de T1, otro proyecto en otra
ruta, entorno sano: `@testing-library/jest-dom` volvió a pasar inadvertida. Dos de dos. No es
variabilidad del modelo, es que el paso no existe.

**Y esta vez tuvo consecuencia.** El `Objetivo` de T1 dice textualmente «No se agregó ninguna
dependencia fuera del stack de CLAUDE.md». Es falso. Con el chequeo hecho, `objectiveMet` sería
`false` y el veredicto tendría que ser `cumple-parcial`; sin él, salió `cumple` y la tarea estaba a
un paso de marcarse `hecho`. El chequeo faltante no produce un reporte incompleto: **produce un
veredicto equivocado.**

**Relación con [[L22]].** Son las dos mitades del mismo fallo: L22 explica por qué el agente se dejó
guiar por el relato del implementador; esta explica por qué no tenía un procedimiento propio con el
que contrastarlo.

---

## L25 · Un proyecto verificado por agentes no puede vivir en una carpeta sincronizada · `resuelto`

**Qué pasó.** En `my-harness-demo` (2026-09-06), `npm test` (vitest) y `npm run lint` (biome) se
cuelgan sin producir resultado, de forma reproducible, con y sin el sandbox del harness. El `ps aux`
muestra dos procesos `@biomejs/cli-darwin-arm64/biome` en estado **`UE`** —uninterruptible— que **no
responden ni a `kill -9`**. Eso es un bloqueo a nivel de kernel, no de Node.

**La causa, acotada con evidencia.** La primera hipótesis —que el entorno bloqueaba binarios
nativos— resultó **falsa**, y vale dejarla anotada como error de diagnóstico. La cadena que la
descartó:

| Prueba | Resultado |
|---|---|
| vitest 5 desde el subagente | cuelga |
| vitest 5 desde la sesión principal | cuelga |
| vitest 5 con el sandbox desactivado | cuelga |
| vitest 5 con `--pool=threads` | cuelga |
| vitest 5 desde la terminal del usuario, sin Claude | cuelga |
| **vitest 2.1.9 en otro repo, en la misma máquina, el mismo minuto** | **68 tests en verde** |

Forkear procesos con IPC **funciona** en esa máquina. Lo que no arranca es el worker de
`vitest 5.0.0` con `vite 8.2.2` — una combinación muy nueva, con rolldown reemplazando a esbuild.
Es un problema de versiones del proyecto, no del entorno ni del harness.

**Lo de biome queda aparte y sin explicar:** dos procesos de su binario nativo colgados en estado
`UE`, que no responden ni a `kill -9`. No bloquea el harness —`npm run check` no incluye lint— pero
tampoco se aclaró.

**Por qué es un problema del harness y no solo de la máquina.** `npm run check` es la compuerta de
**todas** las tareas. Si el entorno donde corre `dod-checker` no puede ejecutar el runner de tests,
ninguna tarea puede pasar a `hecho` y el ciclo se detiene por completo — con veredictos correctos
(`no-verificable`) pero inútiles. El harness supone, sin decirlo en ninguna parte, que el entorno de
verificación puede hacer todo lo que hace el de implementación.

**Qué habría que hacer.** Dos cosas distintas:

- **En el harness:** que un fallo de arranque del runner escale a una decisión humana en vez de
  reintentarse ([[L23]]), y que el `blockedReason` incluya la comparación que acá fue decisiva —
  ¿el mismo tipo de comando funciona en otro proyecto de la misma máquina? Esa sola pregunta separa
  «entorno roto» de «toolchain roto», y es barata.
- **En la guía de `CLAUDE.md`:** que el paso 0 desaconseje fijar versiones `^latest` de la cadena de
  build para un proyecto que va a ser verificado por agentes. Una combinación recién salida deja al
  verificador sin señal, y el ciclo se detiene con veredictos correctos (`no-verificable`) pero
  inútiles.

**La causa real, confirmada el 2026-09-06.** No era el entorno bloqueando binarios, ni la
combinación de versiones. Era **iCloud Drive**: el proyecto vivía en `~/Documents`, que estaba
sincronizado («Escritorio y Documentos» activado), y sus `node_modules` tenían 6.288 archivos.
Cada `import` del worker de vitest atravesaba `fileproviderd` —que estaba al 107% de CPU— y
arrancar un worker tardaba ~100 segundos.

Mover el proyecto a `~/dev` (fuera de la sincronización) lo resolvió, con un número que no deja
dudas:

| | En `~/Documents` (iCloud) | En `~/dev` |
|---|---|---|
| `prepare` del worker | **97.170 ms** | **34 ms** |
| Corrida completa | 225 s, sin recolectar nada | **734 ms**, verde |

Casi tres mil veces. Las versiones importaban solo porque vitest 5 tiene un timeout de worker de
60 s y era el único que lo notaba: los tres estaban degradados, uno avisaba.

**Por qué costó tanto llegar.** El síntoma apuntó, en orden, al subagente, al sandbox, al plugin y
a las versiones —cuatro sospechosos equivocados— antes de llegar a la causa. Lo que lo destrabó fue
comparar contra **otro proyecto de la misma máquina** corriendo el mismo tipo de comando. Esa es la
pregunta que vale la pena institucionalizar.

**Lo que sí quedó demostrado.** El harness supone, sin decirlo en ninguna parte, que el entorno de
verificación puede ejecutar el runner de tests del proyecto. Cuando no puede, ninguna tarea llega a
`hecho` y el ciclo se para por completo. Eso vale sin importar la causa, y es lo que hay que
documentar. El veredicto de T1 lo pidió por su cuenta en `specGaps`, que es exactamente para lo que
existe ese campo.

---

## L26 · El `Registro` no tiene convención para un veredicto superado · `resuelto`

**Qué pasó.** T1 del demo (2026-09-06) se verificó tres veces: `no-verificable` la primera —por el
bloqueo de iCloud—, y `cumple` la última, ya con el entorno sano y el contrato corregido. Quien
implementa hizo lo correcto y **preservó las dos**, agregando un bloque `**Registro** — (continuación)`.
El resultado es un Registro con dos líneas `**Verificación:**`, la primera obsoleta.

**Por qué importa.** El template dice que sin un `cumple` en esa línea la tarea no pasa a `hecho`, y
no dice nada sobre qué hacer cuando hay más de una. Quien lea de arriba hacia abajo —o un agente que
busque la primera coincidencia de `**Verificación:**`— encuentra el `no-verificable` y concluye lo
contrario de lo que pasó. La `Estado` dice `hecho` y la primera línea de verificación parece
desmentirla.

**Por qué no es culpa de quien escribió.** Preservar el historial es lo correcto: el propio harness
insiste en que la bitácora vale por lo que registra del camino, no solo del resultado. El hueco es
del formato, que asume una sola verificación por tarea y no dice cómo se ve una superada.

**Qué habría que hacer.** Que `assets/tasks-template.md` fije una convención mínima y explícita: la
línea `**Verificación:**` vigente es **la última**, y una superada se marca como tal
(`~~superada~~` o un prefijo `Verificación previa:`). Es una línea de template y cierra una
ambigüedad que solo aparece cuando algo salió mal — o sea, justo cuando más importa leer bien.

**Contexto que lo hace más probable.** Una tarea se re-verifica siempre que el primer veredicto fue
menor que `cumple`, que es el caso normal cuando el entorno falla ([[L25]]) o cuando el contrato
tenía un hueco ([[L24]]). No es un caso raro: es el caso de toda tarea que no salió bien a la
primera.

---

## L27 · `Cubre` no distingue «satisface el criterio» de «es necesaria para él» · `resuelto`

**Qué pasó.** En el plan de la calculadora (2026-09-06), **R2.1 está asignado a dos tareas**: T2
(`Cubre: R2.1`) y T7 (`Cubre: R1.2, R2.1, R2.6, R4.2`). Pero R2.1 dice «WHEN el usuario presiona
"Calcular"... THE SYSTEM SHALL mostrar la suma en la casilla de resultado», y T2 solo implementa la
aritmética: no hay botón ni casilla. T2 **no satisface** R2.1 — satisface una precondición suya.

**La consecuencia en el veredicto.** `dod-checker` devolvió `cumple`, justificando que «R2.1 se cubre
en el alcance que T2 se propuso». Esa noción de *alcance propuesto* **no existe en su contrato**: la
pregunta que tiene que responder es si la implementación satisface el criterio en letra e intención,
y la letra pide botón y casilla. Al no encajar la pregunta, el agente **inventó vocabulario para
poder contestarla** en vez de reportar el desajuste. Es un modo de falla distinto de [[L24]]: allá
faltaba un paso, acá falta un valor de respuesta.

**El plan ya resuelve bien el mismo caso en otra parte.** T10 lleva `Cubre: —` con la justificación
«Cablea piezas cuyo comportamiento ya está cubierto por R1, R2, R3 y R4 en T6-T8». Ahí `plan-reducer`
entendió que una tarea habilitante no cubre el criterio; en T2 aplicó el criterio opuesto. La misma
corrida usa las dos convenciones — señal de que la regla no está escrita en ningún lado.

**Por qué va a repetirse siempre.** Casi todo criterio de aceptación que mezcla lógica e interfaz se
parte así: la función pura primero, el cableado después. Con la regla de un criterio por tarea sin
aclarar, cada feature no trivial va a producir la misma ambigüedad.

**Qué habría que hacer.** Fijar la regla en `specify` (que define el formato) y en `plan-reducer`
(que lo aplica): **el criterio se asigna a la tarea que lo completa**, no a las que lo habilitan. Una
tarea habilitante lleva `Cubre: —` y explica en `Por qué no cubre criterios:` cuál criterio ayuda a
cerrar y en qué tarea se cierra. El harness ya tiene el vocabulario —lo usan T1, T10 y T11—, solo
falta decir cuándo corresponde.

Y en `dod-checker`, la contraparte: **si un criterio de la columna `Cubre` no se puede evaluar
porque la tarea solo implementa una parte, eso es un hallazgo del plan**, no algo que el verificador
deba resolver reinterpretando el alcance. Va a `specGaps` **y** baja el criterio a `sin-evidencia`,
que por la regla de composición deja la tarea en `cumple-parcial`.

---

## L28 · La granularidad de la compuerta dentro del paso 5 no está definida · `resuelto`

**Qué pasó.** Al llegar a T3 del demo (2026-09-06) se propuso implementar T3, T4 y T5 de corrido sin
aprobación humana entre ellas. La persona lo rechazó: rompe la naturaleza semiautomática del harness.
Tenía razón — y lo que hizo posible la propuesta es que **ningún archivo del harness dice cuál es la
unidad de la compuerta en la fase de implementación**.

`CLAUDE.md` dice «cada paso espera aprobación humana antes del siguiente». La tabla tiene siete
pasos, y el paso 5 contiene N tareas. Con once tareas adentro, esa frase admite dos lecturas
incompatibles: una compuerta por paso (una para las once) o una por tarea (once). Nada resuelve
cuál.

**Por qué importa más de lo que parece.** Es el único punto del ciclo donde la ambigüedad se resuelve
a favor de menos supervisión sin contradecir ninguna regla escrita. Y es la fase más larga: once
tareas contra seis documentos. Un lector que quiera ir rápido puede batchear la implementación
entera y quedarse formalmente dentro del método.

**La decisión de la persona, para escribir.** **Una tarea, una compuerta.** El ciclo por tarea es
rojo → verde → `dod-checker` → asentar el Registro → aprobación → siguiente. La aprobación entre
tareas no es opcional ni acumulable.

**El síntoma que delató la propuesta mala.** Batcheaba la implementación pero insistía en verificar
de a una. Esa asimetría era la señal: si se confía lo bastante para correr tres tareas sin mirar,
se confiaría también para verificarlas juntas. Una precaución puesta en un lado y no en el otro no
es un diseño, es desconfianza mal repartida — y conviene tratarla como pista de que la propuesta
está mal, no como prudencia.

**Qué habría que hacer.** Escribirlo en `CLAUDE.md`, en la fila 5 de la tabla o en las Reglas: la
unidad del paso 5 es **la tarea**, no la fase. Y en el `tasks-template.md`, que el ciclo por tarea
incluye la aprobación como último acto antes de pasar a la siguiente.

**Refinamiento al aplicarlo (Lote 5).** La compuerta entre tareas quedó **renunciable**, y eso no
reabre el hueco. Conviene tener escrito por qué, porque parece que sí: **la ambigüedad que esta
lección vino a cerrar era que la granularidad no estaba definida**, y eso se cierra definiéndola. Una
renuncia explícita, con vocabulario propio y con el corte intacto, es una decisión tomada; la lectura
«las once tareas son un solo paso» era una decisión que nadie tomó y que el texto permitía igual.

Lo que hace que la renuncia no sea un agujero son dos condiciones, y las dos están en el `SKILL.md`:

- **Se dice con vocabulario, no se infiere.** Solo el literal `--modo corrido` la activa, igual que
  `--modo autonomo` en `verify-e2e`. «Implementemos T3, T4 y T5» **es una lista, no una renuncia**.
  Y tampoco la activan la prisa ni el tono. Si «explícito» lo juzga el modelo, la compuerta vuelve a
  ser opinable — y ya hay dos lecciones de que lee la autorización más ancha de lo que se dio
  ([[L15]], [[L17]]).
- **La regla de corte no se renuncia nunca.** Aunque se pidan tres de corrido, un veredicto distinto
  de `cumple` para la corrida ahí. Renunciar a la aprobación intermedia es **acelerar**; renunciar al
  corte es **cambiar lo que significa terminar**, y `hecho` significa verificado.

---

## L29 · La evidencia de que hubo TDD es prosa autorreportada · `resuelto parcialmente`

**Qué pasó.** T2 a T5 del demo (2026-09-06) construyeron `calc.ts` en cuatro incrementos reales, cada
uno con su alcance — verificado leyendo los Registros. Pero al intentar **comprobarlo de forma
independiente** apareció el hueco: el proyecto no es un repo git, y `dod-checker` solo ve el estado
final. La única evidencia de que el escalonamiento ocurrió es lo que quien implementó escribió que
hizo.

**Cómo se descubrió.** Al leer `calc.ts` con el regex final `^-?\d+(\.\d+)?$` mientras el Registro de
T3 decía `^\d+$`, hubo una sospecha razonable de que el Registro mintiera. Se resolvió, pero
**solo porque los Registros narraban la progresión en prosa**. Sin esa prosa —o con una prosa
falsa— no había nada que consultar.

**Por qué importa.** Todo el harness se apoya en el TDD: `CLAUDE.md` lo pone como regla, cada tarea
declara su «primer test (rojo)», y el escalonamiento del plan solo tiene sentido si se respeta. Pero
**no hay ningún artefacto que registre el orden**. Un implementador que escriba la solución completa
y después los tests produce exactamente el mismo estado final, los mismos veredictos `cumple`, y un
Registro que puede decir lo que quiera. La regla más central del método es la única sin evidencia
verificable.

**Se agrava con [[L12]]**, pero es distinta: L12 dice que `dod-checker` confía en que un test que
pasa prueba lo que dice probar. Esta dice que nadie puede saber **cuándo** se escribió ese test.

**La evidencia existe, pero es efímera.** El transcript de T5 muestra el ciclo completo y explícito:
el test en rojo con `expected 0.30000000000000004 to be 0.3`, el fix, y el verde. O sea que quien
implementa **sí produce** la evidencia — solo que queda en un log de chat que nadie va a poder
consultar dentro de un mes, en vez de en el repo. No hay que generar nada nuevo: hay que persistir
lo que ya ocurre.

**Qué habría que hacer.** Exigir **un commit por tarea**, con el id en el mensaje. Con eso:

- `git log` pasa a ser el registro independiente del escalonamiento, y no lo escribe quien implementa
  sino la herramienta.
- `dod-checker` puede mirar el diff de esa tarea en vez del estado final, y ver si el archivo de test
  cambió junto con el código o mucho después.
- El repaso posterior deja de depender de la prosa: se compara lo que el Registro dice con lo que el
  diff muestra.

Cuesta una línea de regla en `CLAUDE.md` y un paso en el ciclo por tarea, y convierte la afirmación
más importante del método —«acá se hace TDD»— de declaración en dato.

**Corrección: eso último está sobrevendido, y por eso la lección queda `resuelto parcialmente`.** Un
commit por tarea **no** prueba que el test se escribió primero: trae el test y la implementación
juntos, así que lo que demuestra es que la tarea fue una **unidad de trabajo**, no un orden. La
prueba fuerte serían **dos** commits por tarea —uno rojo y uno verde— y está descartada por una razón
buena: un commit en rojo contradice la regla de que cada tarea deja el repo funcionando y en verde.

Así que el hueco se cubre en tres pedazos y uno queda abierto:

| Qué aporta | Qué no |
|---|---|
| El commit por tarea da trazabilidad y unidad de trabajo, escrita por la herramienta | No da el orden |
| La línea del rojo en el `Registro` da **diagnóstico**: qué falló y cómo se veía | No es prueba — es autorreportada igual que el resto de la bitácora |
| — | **El orden real sigue sin ser verificable de forma independiente** |

La línea del rojo se agregó igual, y vale por lo que sí hace: «rojo porque `add('0.1','0.2')`
devolvía `0.30000000000000004`» le explica a quien lea en un mes por qué existe el redondeo, que es
algo que el código terminado no muestra nunca. Es diagnóstico, no evidencia.

**Nota de alcance.** El repo de finanzas sí tiene commits por etapa, así que el hueco no se había
notado. Apareció recién al usar el harness en un proyecto nuevo, donde nadie corrió `git init` y nada
en el método lo pedía. Es exactamente el tipo de supuesto tácito que la reutilización destapa.

---

## L30 · La fase de implementación no tiene instrucción de cierre · `resuelto`

**Qué pasó.** En el demo (2026-09-06) la persona preguntó si `dod-checker` no debería dispararse solo
al terminar de implementar. La conducta observada:

| Tarea | Qué hizo al terminar de implementar |
|---|---|
| T1 | Preguntó «¿Verificamos ahora, o seguimos con T2?» |
| T2, T3, T4, T5 | Encadenó la verificación por su cuenta |

**Corrección de una lectura errónea.** Esta entrada se registró primero afirmando que T5 había parado
sin verificar, y era falso: se leyó el repo a mitad de la corrida —el `Registro` ya escrito,
`dod-checker` todavía en vuelo— y se tomó un estado en tránsito por una conducta. La verificación
llegó 25 segundos después. Queda anotado porque el error tiene una moraleja de método: **leer un
proyecto mientras otra sesión trabaja da instantáneas, no conclusiones**, y con el harness bajo
observación eso puede fabricar hallazgos que no existen.

**Lo que queda en pie, que es distinto de lo que se creyó.** La conducta es **consistente y correcta**:
encadena. El problema no es que varíe, es que **funciona por buen criterio del modelo y no porque
esté escrito en ningún lado**. Es la misma familia que [[L8]] — conducta, no mecanismo — y T1 muestra
que puede variar cuando el contexto empuja para otro lado.

**Por qué el hueco existe.** Los pasos 1, 2, 3, 4 y 7 los produce un skill, y cada `SKILL.md` termina
con su instrucción de cierre: nombrá el paso siguiente y pará. **El paso 5 dice «TDD, a mano»: no
tiene skill, así que nadie le escribió el cierre.** Y la regla de `CLAUDE.md` —«ningún skill arranca
al que le sigue»— leída literalmente no cubre este par: el paso 5 no es un skill y `dod-checker` es
un subagente, no un skill.

**Por qué debería ser automático.** Dos razones, y ninguna es comodidad:

- **Una tarea implementada y sin verificar está en un estado inútil.** Queda en `en curso`, que es
  indistinguible de «a medio hacer». No es un punto de reposo del ciclo: es un limbo donde nadie sabe
  si el trabajo sirve.
- **Preguntar «¿verifico?» pide autorizar algo sin contrapartida.** Verificar no tiene costo
  irreversible, y sin el veredicto la persona no puede decidir nada. La compuerta que importa viene
  después: aceptar el veredicto, asentarlo y pasar a la tarea siguiente.

**Cómo cierra [[L28]].** Si la unidad de la compuerta es la tarea, entonces **una tarea termina con un
veredicto, no con código**. Implementar y verificar son el mismo acto; la compuerta va al final del
par, no en el medio.

**Qué habría que hacer.** Escribir el cierre del paso 5 donde hoy no está. Dos opciones:

- **Mínima:** una regla en `CLAUDE.md` — «terminada la implementación de una tarea, invocá
  `dod-checker` sobre ella sin preguntar; la aprobación humana va después del veredicto».
- **Completa:** darle un `SKILL.md` al paso 5, como tienen los demás. Sería además el lugar natural
  para el commit por tarea de [[L29]] y para el contrato de invocación de [[L22]] — tres huecos que
  existen porque esa fase es la única sin dueño.

La segunda es más trabajo y resuelve más. Vale notar el patrón: **el paso 5 es el único sin skill, y
acumula la mayor cantidad de reglas no escritas.**

---

## L31 · La regla «un criterio, un comportamiento» existe y nada la hace cumplir · `resuelto`

**Qué pasó.** R1.1 del demo (2026-09-06) quedó escrito así: «THE SYSTEM SHALL mostrar dos campos
editables para ingresar los números a sumar **y** un tercer campo de solo lectura para el
resultado». Son dos comportamientos unidos por una `y`. El `requirements-template.md` de `specify`
dice, en su línea 57: «Un criterio, un comportamiento. Si tiene un "y también", probablemente son
dos criterios».

La regla estaba escrita, en el archivo que se estaba usando, y aun así el criterio salió compuesto.
No lo detectó `specify` al escribirlo, ni la persona al aprobarlo, ni `plan-reducer` al planificar.

**Dónde se pagó el costo: dos pasos después.** El test de T6 comprueba que las tres casillas
renderizan vacías, pero **no** que la tercera sea de solo lectura. O sea: media R1.1 tiene evidencia
de test y media no. El contrato de `dod-checker` define eso como `sin-evidencia` —«el código puede
estar bien igual, pero nadie lo está protegiendo»— y su regla de composición dice que un criterio en
`sin-evidencia` baja la tarea a `cumple-parcial`.

Devolvió `cumple` y puso el hueco en una nota. **Identificó el problema y no aplicó su propia regla**,
igual que en [[L27]]: cuando el criterio no es atómico, su vocabulario —un veredicto por criterio— no
tiene con qué expresar «media». Ante la falta de valor, redondea hacia arriba.

**La raíz compartida con [[L27]].** Los dos casos son la misma cosa: **el harness trata los criterios
como átomos y no lo son**. L27 los parte entre tareas (`Cubre` de T2 y de T7); esta los parte en
cláusulas (una testeada, otra no). En los dos, la granularidad del veredicto no coincide con la del
criterio, y el agente inventa o redondea para poder contestar.

**Qué habría que hacer.** Atacarlo en el origen, que es más barato que darle vocabulario al
verificador:

- **En `specify`:** que la regla de atomicidad deje de ser un recordatorio del template y pase a ser
  un paso de la fase 1 — releer cada criterio buscando conjunciones antes de presentarlo.
- **En `check_specs.py`:** ya escanea los criterios buscando filtraciones de implementación con una
  lista de patrones. Agregar un patrón que marque criterios con « y » o « and » entre dos verbos es
  el mismo mecanismo, y convierte un recordatorio en una detección. Heurístico, con falsos positivos
  aceptables — igual que la lista de librerías.
- **En `dod-checker`:** si un criterio tiene varias cláusulas y solo algunas tienen test, es
  `sin-evidencia`, no `cumple` con nota. La nota no cambia el estado del `tasks.md`; el veredicto sí.

**Nota.** Es la tercera vez que `dod-checker` detecta correctamente un problema y no lo deja llegar
al veredicto ([[L24]], [[L27]], esta). El juicio está; lo que falla es la traducción del hallazgo a
la escala de veredictos.

---

## L32 · Un agente no distingue su propia configuración de lo que le mandó el llamador · `resuelto` — en `dod-checker`

**Qué pasó.** En la corrida de `verify-e2e` (2026-09-06), `e2e-triager` reportó que su mensaje de
invocación «traía además contenido del skill `specify`» que no le correspondía, y **dijo haberlo
ignorado**. La persona no le envió tal cosa: `e2e-triager` declara `skills: [specify]` en su
frontmatter, así que ese contenido **es parte de su propia configuración**, precargado a propósito.

**Por qué importa.** El agente descartó una pieza de su configuración por creerla contaminación
externa. Acá no hizo daño —los tres casos pasaron y no hubo nada que rutear— pero `specify` es
justamente lo que le da el formato de `tasks.md`: si un caso hubiera fallado con `causa: codigo`,
habría tenido que nombrar la tarea afectada trabajando sin el template que acababa de tirar.

**La interacción peligrosa con [[L22]].** Allí se propone que `dod-checker` ignore explícitamente las
afirmaciones que le lleguen en el prompt sobre resultados previos. Esta anomalía muestra que **la
frontera entre «lo que me mandó el llamador» y «lo que soy yo» no es nítida para el agente**. Una
regla de ignorar mal calibrada puede hacer que descarte sus propios skills precargados — que es
exactamente lo que acaba de pasar sin que nadie se lo pidiera.

**Qué habría que hacer.** Al redactar la regla de [[L22]], acotarla a lo que se puede identificar sin
ambigüedad —afirmaciones sobre resultados de comandos, veredictos previos, o si la tarea está
cumplida— y **decir explícitamente que los skills precargados por el frontmatter son parte de su
configuración y se usan**. Nombrar lo que sí es propio es más seguro que enumerar lo que hay que
ignorar.

**Nota de método.** Lo reportó el propio agente, sin que nadie preguntara. Vale como señal de que
los agentes que narran lo que les llega producen hallazgos que de otro modo serían invisibles.

---

## L33 · Un veredicto solo vale para el estado en que se tomó · `resuelto`

**Qué pasó.** Al armar el commit del demo (2026-09-06), `npm run verify` estaba en rojo: Vitest
levantaba los tres specs de Playwright, porque su `include` por defecto matchea
`end2end/**/*.spec.ts`. Eso contradecía el `Objetivo` de T11, que afirmaba que `verify` quedaba en
verde — **cierto solo mientras `end2end/` estuviera vacía**, que es exactamente el estado en que
`dod-checker` lo había verificado. El paso 7 no introdujo el hueco: lo destapó.

**Por qué importa.** `hecho` puede volverse mentira **sin que el código de la tarea cambie una
línea**. El veredicto era correcto cuando se tomó; lo invalidó un cambio en otra parte del repo. Y
nada en el harness detecta esa caducidad: `dod-checker` verifica una tarea en un momento, y no existe
la noción de vigencia de un veredicto ni de qué lo invalida.

**Lo más incómodo:** el propio `Objetivo` de T11 decía que la carpeta vacía era «el resultado
esperado hasta que `e2e-test-writer` los escriba». **El plan sabía que el estado iba a cambiar** y
nadie conectó eso con la validez del veredicto. La información estaba escrita y no había dónde
usarla.

**Qué habría que hacer.** Darle fila y conducta al **paso 8 (commit)**, que hoy se menciona en prosa
y no está en la tabla — y que es justo donde el problema apareció:

- Antes del commit se corre la **verificación completa** del proyecto (el comando de higiene, no el
  de corrección).
- **Un rojo reabre la tarea afectada**: vuelve a `en curso` y regresa a `hecho` solo con un `cumple`
  nuevo, tomado ya en el estado final del repo.
- Queda dicho que un veredicto se toma **sobre un estado**, y que la corrida final comprueba que
  todos los veredictos siguen siendo ciertos **juntos**. Verificar tarea por tarea no garantiza el
  conjunto — es la misma distinción que separa el paso 6 del paso 7, un nivel más arriba.

**Confirma [[L1]] empíricamente, y esa es la parte más valiosa.** Entre lo que `/harness-init` «sí
conviene sembrar» ya figuraba textualmente ese `vitest.config.ts` excluyendo `end2end/`. El repo de
finanzas lo tiene desde que se construyó el ciclo e2e; el demo no lo tuvo, porque el skill que debía
sembrarlo no existe — y el bug apareció exactamente donde la lección decía que aparecería. Deja de
ser una mejora especulativa: es la única cuyo valor ya se midió.

**Y la regla 3 aguantó bajo presión.** T11 volvió a `en curso`, se arregló con
`exclude: [...configDefaults.exclude, 'end2end/**']`, y regresó a `hecho` recién con un `cumple`
nuevo, esta vez comprobado con la carpeta ya poblada. El DoD funcionó exactamente para lo que existe.

---

## L34 · Un agente razonó su frontera de propiedad mejor de lo que se le pidió · `resuelto` — evidencia positiva

**Qué pasó.** Biome marcaba problemas de formato en los specs de `end2end/`. Como esa carpeta tiene un
único escritor autorizado, se le pidió el arreglo a `e2e-test-writer`. **Se negó a correr
`npm run format`** —el comando declarado en `CLAUDE.md`— porque actúa sobre todo el repo, incluido
`src/`, que está fuera de su región. Corrió `npx biome check --write end2end/` en su lugar.

**Por qué se registra.** Su instrucción dice qué archivos no puede tocar; **no** dice «si un comando
del proyecto excede tu región, acotalo». Dedujo la restricción desde el principio de propiedad en vez
de desde una lista. El diseño de un solo escritor por documento no solo se cumple: se entiende y se
extiende a casos no previstos.

**Qué deja para el harness.** Dos cosas:

- **La evidencia de que la arquitectura se transmite.** La mayoría de las lecciones son huecos; esta
  es una confirmación de que las reglas bien fundadas —con su porqué escrito, no solo su qué—
  producen conducta correcta en situaciones que nadie anticipó.
- **Un caso a citar.** Al redactar las reglas de [[L22]] y [[L32]] conviene tenerlo presente: explicar
  el principio funciona mejor que enumerar prohibiciones, y este es el ejemplo que lo demuestra
  dentro del propio proyecto.

## L35 · Dos archivos del plugin nunca tuvieron fuente en el repo · `resuelto`

**Qué pasó.** Al ir a agregarle al router la fila del paso 5 (Lote 5, 2026-09-07) apareció que
`~/.claude/skills/harness-spike/SKILL.md` —el router, la pieza que enruta el ciclo entero— **no
existe en el repo**. Buscando el resto aparecieron dos:

```
~/.claude/skills/harness-spike/SKILL.md                    (el router)
~/.claude/skills/harness-spike/.claude-plugin/plugin.json  (el manifiesto)
```

Las dos se escribieron directamente en el plugin al scaffoldearlo y nunca volvieron al repo.

**Por qué importa.** El harness tiene un invariante declarado —**el repo es la fuente, el plugin es
una copia**— y estos dos archivos lo violaban en silencio. Las consecuencias son concretas: no se
puede versionar un cambio de versión del plugin, no se puede reconstruir el plugin desde el repo si
se pierde, y una edición del router no queda en ningún commit. Encima es la pieza de mayor alcance
del harness: es lo primero que lee una sesión que pregunta cómo se trabaja acá.

**Por qué nadie lo notó, que es la parte que se generaliza.** El comando de resincronización
**enumera directorios** —`skills`, `agents`, `workflows`, `checks`— y verifica con un `diff -rq` por
directorio. Los cuatro dan «sin deriva», porque los cuatro están sincronizados. Los dos archivos que
faltan no están en ninguno de ellos, así que ningún paso del chequeo los mira.

> **Un chequeo que enumera lo que conoce nunca encuentra lo que no está en su lista.**

Es la misma familia que [[L20]] —algo deja de funcionar y no emite señal— y que el guard que hubo
que agregarle al linter en el Lote 1: un chequeo que no encuentra nada pasa siempre.

**Qué habría que hacer.** Las dos mitades, y la segunda vale más que la primera:

- **Traer los dos archivos al repo**, en `.claude/plugin-root/`. Ese nombre importa: **no** puede ir
  bajo `.claude/skills/`, porque todo lo que cuelga de ahí se auto-carga y el router aparecería dos
  veces en la misma sesión. Es la misma trampa del respaldo que se convirtió en un plugin vivo,
  anotada en el Lote 1.
- **Cambiar la forma del chequeo, no agregarle dos entradas a la lista.** Enumerar dos archivos más
  arregla este caso y deja el defecto intacto: el próximo archivo que nazca en el plugin se va a
  perder igual. El chequeo correcto compara **el árbol completo del plugin** contra lo que el repo
  puede reconstruir, y exige que sobren cero archivos. Eso sí habría encontrado esto.

**La moraleja de método.** El invariante estaba escrito y se cumplía en el 95% de los archivos, que
es justo la proporción que lo vuelve invisible. Lo que falló no fue la regla: fue que su verificación
tenía la misma forma que la regla —una lista de lugares— en vez de la forma contraria —una búsqueda
de lo que no está previsto—. Una verificación construida a imagen de lo que verifica solo puede
encontrar los errores que ya se imaginaron.

---

## L36 · El progreso del workflow existía y ningún paso lo nombraba · `resuelto` (Lote 8)

**Qué pasó.** En la corrida de `tasks-fanout` sobre `calculadora-operaciones` (demo, 2026-09-07) la
persona esperó **8 minutos y 19 segundos** sin ninguna señal de qué estaba pasando. `planning-tasks`
lanzó el workflow y dijo «te aviso cuando termine».

**Y el progreso existía todo el tiempo.** El script llama a `log()` en 16 lugares; esa corrida emitió
seis:

```
Agentes namespaceados por el plugin: se usa el prefijo "harness-spike:".
Spec: docs/2026-09-07-calculadora-operaciones — 12 criterios, 0 tareas existentes
No hay tasks.md: se dibuja el plan inicial y después entra al mismo loop iterativo.
Plan inicial: 9 tareas. Ninguna revisada todavía — entran todas al fan-out.
Ronda 1: revisando 9 tarea(s).
Ronda 1: 9 veredictos — 9 ok, 0 con cambios, 0 propuesta(s), 0 criterio(s) sin cubrir.
```

Más `agentCount: 13`, `durationMs`, `status` y las seis fases declaradas, todo en
`~/.claude/projects/<proyecto>/<sesión>/workflows/wf_<runId>.json` — que es lo que **`/workflows`
renderiza en vivo**.

**Lo peor: el tool lo dijo y la sesión no lo transmitió.** La salida del lanzamiento termina,
textualmente, con `Use /workflows to watch live progress.` El modelo la leyó y la descartó al
resumir. La información no faltaba: se perdió en la traducción.

**Por qué importa, y por qué no es cosmético.** Una espera de ocho minutos sin señal empuja a la
persona a hacer justo lo que no hay que hacer: abrir el repo a mirar qué pasa. Eso es [[L30]] —
*leer un proyecto mientras otra sesión trabaja da instantáneas, no conclusiones*—, que ya fabricó un
hallazgo falso una vez.

**Es la misma forma que [[L20]], un escalón más arriba.** L20 era «la vista de `/workflows` no tiene
contra qué mostrar avance». Lo arreglamos: ahora tiene seis fases y seis mensajes. Y quedó una vista
útil **que ningún paso del ciclo nombra**. Arreglar el mecanismo y no nombrarlo deja el mismo
resultado observable que no haberlo arreglado.

### El arreglo, listo para ejecutar

En `planning-tasks`, **paso 3**, agregar el reporte como paso y no como intención — el patrón de
[[L24]], porque una instrucción implícita se saltea:

> **Al confirmar el lanzamiento, decí estas tres cosas y ninguna menos:**
>
> - Que quedó corriendo, con su `Task ID`.
> - **`/workflows` para ver el avance en vivo.** El fan-out lanza un agente por tarea y la corrida
>   puede tomar varios minutos; sin esta línea la persona espera a ciegas, y esperar a ciegas la
>   empuja a abrir el repo a mirar, que es lo que [[L30]] desaconseja.
> - La forma del fan-out: 1 scout + 1 plan inicial + 1 revisor por tarea + 1 reducer por ronda con
>   cambios + 1 escritor. **El número exacto no se puede anticipar en la primera corrida** —el plan
>   lo dibuja el propio workflow— pero la forma sí, y alcanza para dimensionar la espera.

Y un refuerzo independiente, en el mismo skill: **al llegar la notificación de fin**, leer
`workflows/wf_<runId>.json` y reportar `agentCount`, duración y los `logs`. Así, si el puntero se
pierde al lanzar, la información igual llega al final. Dos oportunidades, las dos baratas.

**Lo que se evaluó y se descartó por ahora.** Un hook `PostToolUse` sobre el tool `Workflow` daría
**garantía** en vez de alta probabilidad, y podría viajar dentro del plugin. Se descartó por
desproporción: sería el primer mecanismo del harness, introducido por una línea informativa, mientras
las compuertas que de verdad protegen el `hecho` siguen siendo prosa. **Si el arreglo de arriba falla
igual, eso es evidencia para reabrir [[L8]]**, no para insistir con más prosa.

**Y refina [[L8]] aunque no se implemente.** L8 dice que el enforcement por hooks no mapea «porque no
hay borde de tool-call que signifique *el plan fue aprobado*». Cierto para actos conversacionales, y
**falso para esto**: el retorno del tool `Workflow` es un borde de tool-call exacto. L8 vale sobre
aprobaciones, no sobre cualquier cosa anclada a una herramienta.

---

## L37 · Un slash command que no resuelve no da error: improvisa · `descartada`

**Corrección (2026-09-11): la premisa es falsa.** El transcript de la sesión registra que lo que se
invocó fue `/harness-spike` —el router—, no `/harness-init`
(`<command-name>/harness-spike</command-name>`). No hubo un slash command sin resolver ni
improvisación: el router hizo exactamente su trabajo, que es relevar el estado y ofrecer el paso
siguiente. Siete minutos después se invocó `/harness-spike:harness-init`, que resolvió y corrió su
modo revisión.

**Por qué se conserva en vez de borrarse.** El error de método vale más que el hallazgo que no fue:
esta entrada se construyó sobre el nombre que traía el relato —«esta es la respuesta a
`/harness-init`»— **sin mirar el transcript, que estaba disponible**. Es [[L22]], auditar el relato
en vez del repo, cometido por quien analiza el harness.

**Lo que queda en pie, y es chico.** El router afirmó *«el ciclo ya recorrió sus ocho pasos para esta
feature»*, y el paso 8 (`close-feature`) no existía cuando se hizo esa corrida: los dos commits de
cierre se hicieron a mano, sin corrida de higiene como compuerta. Inferir un cierre que no ocurrió es
de la familia de [[L17]]. Una ocurrencia: se anota, no se arregla.

**La hipótesis del namespacing en slash commands no quedó probada en ninguna dirección**, porque
nadie tipeó el nombre pelado. Si vuelve a interesar, probarla cuesta un intento.

*Lo que sigue es lo que se escribió el 2026-09-07, antes de mirar el transcript.*


**Qué pasó.** En el demo (2026-09-07) se invocó `/harness-init` y **el skill no corrió**. La sesión
listó el repo, leyó `tasks.md` y `e2e-test-report.md`, concluyó que el ciclo estaba completo y ofreció
arrancar una feature nueva. **Nunca leyó `CLAUDE.md`**, que es el único objeto de ese skill, y no hizo
ninguna de las cuatro comprobaciones de su modo revisión.

**La causa probable.** El demo no tiene `.claude/` local, así que el único nombre registrado es
`harness-spike:harness-init`. El pelado no resuelve — y **un slash command que no resuelve queda como
texto**: el modelo lee «harness-init» como «inicializá el harness acá» y produce algo plausible.

Evidencia lateral fuerte en la misma sesión: al lanzar el workflow, el nombre pelado devolvió
`Workflow "tasks-fanout" not found. Available: deep-research, harness-spike:tasks-fanout`. El
namespacing está activo ahí, confirmado.

**Es la cuarta superficie del mismo problema, y la única silenciosa.** [[L4]] (el nombre del
workflow), [[L19]] (los `agentType`) y [[L5]] (dos copias vivas) se arreglaron todas **leyendo el
prefijo del mensaje de error**. Acá no hay mensaje que leer, porque quien invoca es una persona y no
un tool call. No hay nada que capturar ni de dónde descubrir el prefijo.

**El daño no fue solo no hacer lo pedido.** La respuesta afirmó que *«el ciclo ya recorrió sus ocho
pasos para esta feature»*. Es falso: el paso 8 es `close-feature`, que **no existía** cuando se hizo
esa corrida, y los dos commits se hicieron a mano sin corrida de higiene como compuerta. Inventó un
cierre que nunca ocurrió — la misma clase de fallo que [[L17]].

**Qué falta para cerrarla.** Confirmar en el demo qué lista `/`: si aparece
`harness-spike:harness-init` o `harness-init`. Distingue esta hipótesis de la otra posible —que la
sesión se haya abierto antes de actualizar el plugin y haya cargado una versión sin ese skill—, y las
dos se arreglan distinto.

**Qué habría que hacer, si se confirma.** No es código: es documentación y hábito.

- Que el `README.md` y el router digan **cómo se invocan los skills de un plugin**
  (`/<plugin>:<skill>`), y que el nombre pelado solo funciona si el skill vive en el repo.
- **Preferir los disparadores en lenguaje natural.** La columna «Se pide diciendo» de la tabla del
  router existe para esto: «preparemos el proyecto» dispara por la `description` y **sobrevive al
  namespacing**; `/harness-init` no. Esa columna dejó de ser una comodidad y pasó a ser el camino
  robusto.

---

## L38 · «Preguntá y esperá el sí» se tradujo a una pregunta estructurada inválida · `resuelto` (Lote 8)

**Qué pasó.** En el demo (2026-09-07), `planning-tasks` llegó a su paso 2 y el modelo formuló la
confirmación con `AskUserQuestion` y **una sola opción**. El harness la rechazó
(`too_small · minimum: 2`) y la persona nunca vio la pregunta.

**Se recuperó bien, y eso importa.** El mensaje de error le dijo qué hacer —enunciar el único camino
y seguir— y eso hizo: «Lanzo el workflow tasks-fanout sobre docs/…». Costó un intento, no una ronda.

**Por qué se anota igual.** El skill dice *«Preguntá… Esperá el sí. Una confirmación corta ("dale",
"va") alcanza»*. Eso describe una confirmación **en prosa**, y el modelo alcanzó una herramienta que
exige dos opciones distintas. Una confirmación no es una decisión: no hay dos caminos que ofrecer, y
por eso el tool la rechaza por diseño.

**Qué habría que hacer.** Una cláusula en el paso 2 de `planning-tasks`: la confirmación va **en
prosa**, no con una pregunta estructurada — pedir un sí no es ofrecer una elección. Es una línea, y
evita un intento perdido en cada corrida.

**Por qué queda en `en observación` y no en `listo para aplicar`.** Una sola ocurrencia, con
recuperación limpia y costo casi nulo. Si vuelve a pasar en la próxima corrida deja de ser anécdota.

## L39 · El modo revisión de `harness-init` aprueba un contrato que miente · `listo para aplicar`

**Qué pasó.** En el demo (2026-09-11) `harness-init` corrió en modo revisión sobre un `CLAUDE.md` en
uso. Marcó ✓ sus cuatro comprobaciones —ranuras de comandos, sin sección de estructura, tabla del
ciclo, configs—, agregó `retries: 0` a `playwright.config.ts` y concluyó que *«el contrato ya cumplía
las cuatro cosas que el harness necesita»*.

Y el archivo seguía diciendo, en su segunda sección: *«**El proyecto todavía no está scaffoldeado.**
No existe `package.json` ni ninguna dependencia instalada»* — con once tareas en `hecho`, `dist/` y
tres e2e en verde. Y describía el ciclo en siete pasos.

**No fue descuido: fue diseño.** El skill hizo exactamente lo que dice. Ninguna de sus cuatro
comprobaciones pregunta si lo que el archivo **afirma** es cierto hoy. Es [[L35]] —*un chequeo que
enumera lo que conoce nunca encuentra lo que no está en su lista*— en un skill escrito el mismo día
que L35.

**El costo fue real y se ve.** El scout del workflow tuvo que escribir en su relevamiento *«PROYECTO
YA SCAFFOLDEADO (a diferencia de lo que advierte CLAUDE.md como estado por defecto)»*. Cada agente
que lee el contrato arranca contradiciéndolo. Esta vez el scout lo notó; un agente que confíe en el
contrato —que es lo que el contrato le pide— va a reportar el repo como vacío.

**El arreglo, listo para ejecutar.** No una quinta comprobación, que repetiría el defecto, sino la
forma contraria, la que L35 ya escribió. En `harness-init`, modo revisión, antes de las cuatro
comprobaciones:

> **Leé el archivo entero buscando afirmaciones que el repo contradiga.** Toda frase sobre el estado
> del proyecto —qué existe, qué falta, qué funciona, cuántos pasos tiene el ciclo— se contrasta
> contra el repo. Una afirmación falsa en el contrato es peor que una ausente: la leen todos los
> agentes y la tratan como cierta. Las cuatro comprobaciones de abajo son lo mínimo que el harness
> necesita, no la lista de lo que puede estar mal.

**La acción del demo, hecha (2026-09-11, `d315b92`).** El `CLAUDE.md` del demo se corrigió invocando
`harness-init` con la lista de problemas ya hecha —porque el skill, tal como está, no los encuentra— y
agregándole a mano la instrucción de este arreglo: «leé el archivo entero buscando afirmaciones que
el repo contradiga». Eso **no cierra esta lección**: el paso sigue sin estar escrito en el skill.

**Y la prueba dejó un matiz para el arreglo.** Con la instrucción, el skill encontró dos afirmaciones
falsas que nadie le había señalado ([[L43]]): el arreglo funciona. Pero se le escapó una **que
escribió él mismo**. El texto nuevo de «Ciclo de trabajo» decía *«este archivo solo declara el stack
y los comandos»*, en un archivo que tiene «Reglas del proyecto» y al que le estaba agregando «Reglas
del harness». La revisión miró las frases que ya estaban, no las que proponía.

Entonces el paso a escribir en el skill tiene que cubrir las dos puntas:

> **Leé el archivo entero buscando afirmaciones que el repo contradiga — las que ya están y las que
> vas a proponer.** Antes de presentar un cambio, releé tu propio texto con el mismo criterio: una
> frase nueva puede ser falsa desde el día en que se escribe. Y cuando una frase de estado haga
> falta, escribila en condicional («si no están instalados, `npx playwright install chromium` los
> instala»): una afirmación de estado envejece, una condicional no.

---

## L40 · La segunda ronda de una tarea no decía si espera el sí · `listo para aplicar`

**Qué pasó.** En la misma corrida del demo (2026-09-11), en `--modo corrido`, dos tareas volvieron
`cumple-parcial` y se trataron distinto:

| | Qué hizo |
|---|---|
| **T7** | *«Freno acá — la regla de corte aplica incluso en modo corrido»*. Asentó, commiteó el parcial, preguntó *«¿Sigo con esa segunda ronda de T7?»* y esperó el sí |
| **T9** | *«Freno la cadena, no sigo con tareas nuevas — pero cerrar esto es una segunda ronda de la misma tarea T9, mecánica»*. Siguió sin preguntar, corrió `npm run format` sobre todo el repo y reverificó |

Mismo modelo, mismo skill, misma sesión.

**La causa está en el texto.** `implement-task` dice: *«pará ahí: la tarea queda en `en curso`, lo
asentás, avisás, y no arrancás la siguiente»*. Son dos instrucciones, y el hueco entre ellas es lo
que varió: T7 obedeció el «pará», T9 obedeció el «no arrancás la siguiente» — y una segunda ronda de
la misma tarea no es la siguiente.

**Por qué importa aunque esta vez no dolió.** Los dos arreglos eran mecánicos. Pero un veredicto
parcial es el momento en que puede aparecer que **el que está mal es el criterio, no el código**, y
lo que corresponde es `specify`, no un parche. Seguir sin preguntar le quita a la persona justo la
decisión que ese veredicto la habilita a tomar.

**La decisión, tomada por la persona el 2026-09-11: la segunda ronda espera el sí, siempre** — en
modo normal y en `--modo corrido`. Sin excepciones, porque una regla sin excepciones es la que no se
puede reinterpretar.

**El arreglo, listo para ejecutar**, en los cuatro lugares donde vive la regla:

- `implement-task`, sección de modo y paso 8: *«Un veredicto menor que `cumple` para la corrida, y
  **la segunda ronda de la misma tarea también espera el sí**. Pararse no es solo no arrancar la
  siguiente: es devolverle la decisión a la persona, porque un veredicto parcial puede estar diciendo
  que el criterio está mal.»*
- `CLAUDE.md` de este repo, regla de la unidad del paso 5.
- `harness-init/assets/CLAUDE.template.md`, la misma regla.
- El router, regla 3.

Que sean cuatro lugares y que nada compruebe que digan lo mismo es [[L42]].

---

## L41 · Los pasos 0 a 3 no commitean · `en observación`

**Qué pasó.** En el demo (2026-09-11), `harness-init` agregó `retries: 0` a `playwright.config.ts` y
dijo *«No commiteé el cambio — decime si querés que lo incluya en un commit»*; `specify` agregó una
nota de vigencia al `requirements.md` de la feature anterior. Ninguno de los dos se commiteó.
Flotaron a lo largo de las nueve tareas —`dod-checker` los señaló como ajenos en T5, correctamente—
hasta que `close-feature` los barrió en el commit de cierre.

**Por qué importa poco, y por qué igual se anota.** Terminaron en el historial, así que no se perdió
nada. Pero el commit de cierre mezcla el material del paso 7 con ajustes de los pasos 0 y 2, y
`git log` pierde qué paso produjo qué. Y mientras flotaban quedaron expuestos al `git stash` de
[[L9]].

**La forma.** Desde [[L29]], el paso 5 tiene commit por tarea y el 8 tiene commit de cierre. Los
pasos 0 a 3 producen cambios y no tienen ninguna instrucción de commit, así que quedan a criterio de
quien los lleva.

**Por qué en observación.** Una ocurrencia, sin daño. El arreglo obvio —«al recibir el sí, commiteá
lo que produjiste»— es barato, pero conviene ver si se repite.

---

## L42 · Una regla vive en `CLAUDE.md` y en la plantilla, sin verificación · `resuelto` (Lote 8)

**Qué pasó.** Las reglas del método viven dos veces: en el `CLAUDE.md` de este repo, para que rijan
acá, y en `harness-init/assets/CLAUDE.template.md`, que es el único vehículo por el que llegan a
otro proyecto. Los lotes 5, 5b y 6 las escribieron en los dos lados. Nada lo verifica.

**Por qué importa.** Si una regla nueva entra solo en el `CLAUDE.md` de este repo, **nunca llega a
ningún otro proyecto y nada avisa**. `sync-plugin.sh` compara `.claude/` contra el plugin, pero el
`CLAUDE.md` y la plantilla son distintos a propósito —la plantilla tiene ranuras y un bloque de «qué
no va»; este repo tiene reglas propias—, así que no se pueden comparar por igualdad.

**Es la forma de [[L35]]**: un invariante declarado, sin verificación. Un chequeo posible: extraer
los títulos en negrita de las reglas del harness en cada archivo y comparar los conjuntos — no el
texto, que difiere a propósito, sino qué reglas están.

**Por qué en observación.** Hoy coinciden (verificado el 2026-09-07). Deja de ser hipotético la
primera vez que se aplique un arreglo de reglas, que es [[L40]]: cuatro lugares.

---

## L43 · Un skill extendió un principio escrito más allá de la lista que se le dio · `resuelto` — evidencia positiva

**Qué pasó.** Al corregir el `CLAUDE.md` del demo (2026-09-11), `harness-init` recibió un prompt con
cinco puntos. El punto 1 pedía borrar «Estado del proyecto» *porque toda frase de estado envejece*.
El punto 3 pedía reemplazar «los navegadores de Playwright no están instalados» por «sí lo están».

El skill notó que el punto 3 contradecía la razón del punto 1 —cambiaba una afirmación de estado
falsa por otra verdadera que también iba a envejecer— y ofreció las dos formas:
*«Afirmar que ya están instalados (lo que pediste)»* y *«Reformular sin afirmar un estado
(Recomendado)»*, un condicional que no puede volverse falso. Se eligió la segunda.

Y en la misma pasada encontró dos afirmaciones falsas que nadie le había señalado —la intro
describía «tres casillas… un botón para ejecutar la operación», y el Stack justificaba sus
restricciones «para tres casillas y dos botones»— y las presentó *«marcadas como propias»*.

**Por qué se registra.** Dos piezas del harness funcionando a la vez:

- **[[L17]]**: etiquetó el origen de cada opción. No presentó su propuesta como pedido de la persona,
  ni el pedido de la persona como la opción buena.
- **La misma confirmación que [[L34]]**: un principio escrito con su porqué se extiende a casos que
  nadie previó — acá, hasta contradecir una instrucción explícita que lo violaba.

**Y el error estaba en el prompt, no en el skill.** El punto 3 lo redactó quien analiza el harness,
y era inconsistente con el punto 1 del mismo prompt. El skill atrapó un error de quien le daba las
instrucciones, que es lo que se espera de un paso con compuerta y lo que la compuerta sola no
garantiza: la compuerta pregunta «¿aprobás?», y acá la pregunta útil fue «¿esto que me pedís es
coherente con lo que me pediste antes?».

**Lo que no hizo, para no sobrevenderlo:** se le escapó una afirmación falsa que escribió él mismo.
Eso quedó en [[L39]].

---

## L44 · Dos plugins con el mismo nombre no conviven, y el que pierde se apaga en silencio · `resuelto` — documentado

**Qué pasó.** Al probar la instalación del harness desde su propio marketplace (2026-09-11), en una
carpeta descartable y con scope local, `claude plugin list` mostró la copia de desarrollo así:

```
harness-spike@skills-dir · enabled: false
"Not loaded — the name "harness-spike" is already taken by an installed plugin
(harness-spike@harness-spike), which takes precedence."
```

Mientras la instalación existió, la copia que `sync-plugin.sh` mantiene en `~/.claude/skills/`
quedó **desactivada**. Al desinstalar volvió sola, activa y sin errores.

**Por qué importa.** Nada avisa en la sesión: los skills siguen apareciendo con el mismo nombre, pero
son los de la otra copia. Quien edita el harness con el script de desarrollo y además tiene instalada
la versión publicada puede pasar horas probando cambios que la sesión no está cargando — la misma
familia que [[L5]], donde dos copias del workflow conviven con nombres distintos. Acá es al revés:
el nombre es el mismo, así que no conviven, y la que pierde no hace ruido.

**Qué se hizo.** Documentarlo donde muerde: el README pide **renombrar el plugin al forkear** —con la
razón— y advierte que la copia de desarrollo y una instalación con el mismo nombre no cargan juntas.
Es comportamiento de Claude Code, no del harness; no hay nada que arreglar en el código.

---

## L45 · Las advertencias del `Registro` no tienen lector ni destinatario · `listo para aplicar`

**Qué pasó.** Durante una corrida de 27 tareas (OoklaWeb, feature *motor de medición*), quien
implementa escribió en los `Registro` de T1 a T9 unas ocho advertencias dirigidas al futuro: deuda
asumida a propósito, riesgos que recién se materializan en el paso 7, y requisitos que le tocaban a
una tarea posterior. Ninguna tenía destinatario formal, y **nada en el harness las vuelve a leer**.

Una ya se perdió. El `Registro` de T2 decía:

> una referencia `data:` … inflaría el conteo de R1.5 sin sumar tiempo real. **Conviene decidirlo
> antes de T9**, que es donde se descarga y se cuenta.

T9 se abrió, se implementó, se verificó con `cumple` y se commiteó. La decisión nunca se tomó: el
plazo venció en silencio, y se descubrió recién porque la persona preguntó, dos tareas después, dónde
guardar estas cosas. Peor: al investigarla apareció que la advertencia **subestimaba el problema** —
una referencia `data:` hace que `node:http` lance `ERR_INVALID_PROTOCOL`, y con el `Promise.all` de
T9 eso tumba la medición entera, no infla un conteo.

**Por qué importa.** El harness sí tiene dónde escribir: el `Registro` por tarea y la sección
`## Pendientes` de `tasks.md`, que la plantilla define como *«cosas que salieron mientras se
trabajaba… para no perderlas»*. Lo que no tiene es **quién lea**. `close-feature` (paso 8) mira
`Pendientes` y nunca los `Registro`; y nadie abre una tarea preguntándose qué le dejaron anotado.
Una advertencia con destinatario implícito —«antes de T9»— depende de que alguien recuerde, que es
exactamente lo que la bitácora vino a reemplazar.

Hay además una contradicción dentro de `implement-task`, encontrada en uso: el skill dice que un
hallazgo fuera de alcance entra *«como una línea en `Pendientes`»*, pero su sección «Lo que escribís,
y lo que no» enumera como regiones propias solo `Estado`, `Registro` y el encabezado de aprobación.
La sesión se frenó a pedir permiso para escribir en `Pendientes`, porque las dos frases no cierran.

Y un riesgo latente que nadie disparó todavía: el prompt del `task-writer` regenera `Pendientes`
desde los `specGaps` de los revisores y **se le pide preservar los `Registro`, pero no `Pendientes`**.
Una re-planificación con `tasks-fanout` borraría en silencio lo que escribió quien implementa. Es la
misma familia que [[L10]]: una región con dos escritores y sin regla de preservación.

**Qué habría que hacer.** Agregar lectores, no más lugares donde escribir. Cuatro cambios:

1. **`implement-task`, paso 1 «Abrí la tarea».** Además de `Objetivo`, `Cubre` y `Primer test`, leer
   `## Pendientes` y **nombrar los ítems dirigidos a esa tarea**. Es el cambio que cierra el
   circuito: abrir T9 habría mostrado «[T9] decidir qué se hace con `data:`».
2. **`implement-task`, «Lo que escribís, y lo que no».** Agregar `Pendientes` a la lista de regiones
   escribibles, resolviendo la contradicción de arriba. Sigue sin ser la tabla de Plan, que es del
   workflow.
3. **`implement-task`.** Exigir **destinatario** en cada línea de `Pendientes`: `[T11]`, `[paso 7]`,
   `[paso 8]`, `[decidir ya]`. Una advertencia sin destinatario es una entrada de diario. El caso
   más caro de la corrida fue un ítem que **agregaba un requisito a T11 que el `Objetivo` y el
   `Primer test` de T11 no mencionan** — quien la implemente leyendo solo su entrada no se entera.
4. **`task-writer` / `tasks-fanout`.** Preservar el `Pendientes` existente igual que ya preserva el
   `Registro`, fusionando en vez de reemplazar.

**Lo que se descarta, a propósito.** Hacer que `close-feature` lea los 27 bloques `Registro`: es caro
y redundante si el ruteo funciona. Mejor un solo lugar que leer, y el esfuerzo puesto en que las
cosas lleguen ahí. El `Registro` se queda con el relato —por qué se decidió así, pegado a su tarea—,
que es para lo que sirve.

**No se aplicó todavía** porque la corrida que lo reveló sigue en curso (faltaban T10 a T27), y este
archivo pide no tocar un skill a mitad de una prueba: después no se puede distinguir qué causó qué.

---

## L46 · El ciclo asume que toda feature tiene interfaz · `listo para aplicar`

**Qué pasó.** La feature *motor de medición* de OoklaWeb (2026-09-18) se cerró sin pasar por el paso
7. Es un motor de medición con CLI: no tiene superficie navegable y Playwright no tiene URL que
abrir. El ciclo no se rompió —`verify-e2e` paró en su fase 1 sin escribir ningún archivo, y
`close-feature` clasificó el `exit 127` de `npm run e2e` como andamiaje ausente en vez de contarlo
como hallazgo— pero lo manejó **como excepción, no como camino**.

El costo se pagó en cuatro lugares distintos, todos evitables:

- `harness-init` comprometió el proyecto a `npm run e2e` en el comando de higiene **antes de saber
  si algo iba a ser navegable**. Esa pata queda permanentemente en 127, y `close-feature` tiene que
  excusarla en cada cierre.
- Se sembró `playwright.config.ts` en un proyecto que todavía no sabe si va a necesitarlo.
- La persona invocó el paso 7, el skill leyó tres documentos del spec, y recién ahí paró.
- Un `Pendiente` estuvo toda la corrida dirigido a `[paso 7 · e2e]` —un paso que nunca iba a
  ocurrir—, y al cerrar hubo que re-dirigir tres ítems a la feature que traiga la interfaz.

**Por qué importa.** El conocimiento de que una feature puede no tener superficie **ya existe en el
harness**, pero vive disperso y siempre aguas abajo:

| Dónde | Cómo aparece |
|---|---|
| `implement-task/SKILL.md:189` | Una sola frase al final: si no hay superficie, lo que sigue es el paso 8 |
| `verify-e2e/SKILL.md:43` | Precondición 3, redactada como **fallo** que detiene el ciclo |
| `close-feature/SKILL.md:62` | Excepción para la pata de higiene que «no aplica hoy» |
| `assets/stacks/typescript-node/playwright.config.ts:7` | Un comentario que anticipa el caso |

Y está ausente justo donde se decidiría a tiempo. La tabla del ciclo lista el paso 7 **sin
condición**, en el router (`SKILL.md:20`) y en el contrato (`CLAUDE.template.md:48`) — y eso es lo
que hace que saltearlo se lea como incumplimiento en vez de como una rama. `harness-init` no
pregunta nada sobre la interfaz: cero coincidencias de `interfaz|navegable|frontend|UI` en el skill.

Lo más filoso: **`design-template.md` no tiene ninguna ranura para declarar la superficie** —su
sección `## Interfaces` son firmas de funciones—, y sin embargo `verify-e2e` afirma que de
`design.md` «sale cuál es la superficie de la app». **Lee algo que a ese documento nunca se le pidió
escribir.** Es la misma familia que [[L42]]: una regla que vive en un lado y se verifica desde otro,
sin nada que los ate.

**La distinción que hace no trivial el arreglo.** La bifurcación es **por feature, no por
proyecto**. OoklaWeb va a tener las tres clases: el motor (sin UI), la base de datos del histórico
(sin UI) y la interfaz web (con UI). Un flag de proyecto daría la respuesta equivocada en dos de
tres. Pero el **comando de higiene sí es del proyecto**, porque vive en `CLAUDE.md`. De ahí la
asimetría que el arreglo tiene que respetar: la pata `e2e` de la higiene entra cuando el proyecto
tiene *alguna* superficie navegable; la compuerta del paso 7 se decide feature por feature.

**Qué habría que hacer.** Cuatro cambios, y el primero es el que sostiene a los otros tres:

1. **`design-template.md` (skill `specify`)** — ranura nueva donde la feature declara su superficie:
   navegable (con la URL y cómo se levanta) o no navegable (CLI, librería, base de datos, job). Es
   el lugar correcto porque es por feature, está aprobado antes del paso 4, y es donde `verify-e2e`
   ya dice que mira.
2. **`SKILL.md` del router y `CLAUDE.template.md`** — el paso 7 pasa a figurar como condicional en
   la tabla del ciclo. Mientras la tabla lo liste sin condición, saltearlo va a seguir sintiéndose
   como una falla.
3. **`harness-init`** — preguntar si el proyecto va a tener superficie navegable, y sembrar
   `playwright.config.ts` y la pata `e2e` de la higiene **solo entonces**.
4. **`verify-e2e`** — reformular la precondición 3: leer primero la superficie declarada en
   `design.md`; si dice no navegable, **este paso no aplica** y rutea al 8. Es una bifurcación, no un
   fallo. El sondeo actual —buscar `index.html`, scripts `dev`/`start`— queda como respaldo para
   specs escritos antes de que la ranura existiera.

Con el cambio 3, la excepción de `close-feature` deja de ejercitarse en proyectos sin UI: no hay
pata que excusar. La excepción se queda igual, para el caso de un proyecto que sí tiene interfaz y
todavía no bajó el browser.

**Lo que este caso no es.** No es un fallo del ciclo: las tres piezas que existían hicieron lo
correcto, y el comentario de `playwright.config.ts` predijo el escenario con precisión. Es que
**hicieron lo correcto tarde**, cada una por su cuenta, sin que ninguna pudiera evitarle el trabajo a
la siguiente.

---

## L47 · Se siembra el config de Playwright y la dependencia no tiene dueño · `listo para aplicar`

**Qué pasó.** En el proyecto del dashboard HTML (2026-09-19), la fase 1 de `verify-e2e` se frenó en
la precondición 4. Las otras tres estaban en verde: spec aprobado, 31 tareas en `hecho`, y una
superficie navegable real —`dashboard/index.html`, generado por `npm run dashboard` y abierto con
`file://`, sin servidor—. Pero `@playwright/test` no figuraba en `devDependencies` ni en
`node_modules`, aunque `playwright.config.ts` y el script `e2e` ya lo usaban. Chromium sí estaba
bajado: la caché global `ms-playwright` tenía `chromium-1243`.

**Por qué importa.** Es el lado complementario de [[L46]]. Aquella es «no hay interfaz y se sembró
el config igual»; esta es **«hay interfaz, se sembró el config, y nadie instaló aquello de lo que el
config depende»**.

- **El archivo que usa la dependencia tiene productor; la dependencia no.** `harness-init` siembra
  `playwright.config.ts`, cuya primera línea importa `@playwright/test`. Pero su propia regla es
  «este paso escribe el contrato, no el proyecto», y el contrato sembrado dice «no agregar
  dependencias sin necesidad». Ningún paso del ciclo queda a cargo de instalarlo.
- **Nada lo detecta antes del paso 7.** `tsc` no revisa el config, Vitest excluye `end2end/` a
  propósito, y ninguna tarea de una feature importa Playwright. La única comprobación es la
  precondición 4 de `verify-e2e`: la última puerta, después de toda la implementación.
- **La caché global disfraza el estado.** El browser vive fuera del proyecto, así que un proyecto
  nuevo en una máquina que ya corrió Playwright parece casi listo. Le falta justo la pieza que no se
  ve.
- **Bug aparte en el config sembrado:** `trace: 'on-first-retry'` con `retries: 0`. El reintento
  nunca ocurre, así que **nunca se graba un trace**, y el triager diagnostica sin él.

Misma familia que [[L42]]: una condición que se siembra en un lugar y se verifica desde otro, sin
nada que los ate.

**Qué habría que hacer.** Decidido con la persona: Playwright se deja instalado en el **paso 0**,
con su sí, cuando el proyecto tiene front web. Cuatro cambios:

1. **`harness-init/SKILL.md`** — regla nueva: *un config se siembra junto con su dependencia, o no se
   siembra*. La tabla de «Qué sembrar» gana una columna «Dependencia» (`vitest.config.ts` →
   `vitest`; `playwright.config.ts` → `@playwright/test` + Chromium). Si la pregunta de superficie
   que agrega [[L46]] da sí, se siembra el config y **se pide el sí** para correr
   `npm i -D @playwright/test` y `npx playwright install chromium` — la misma decisión que hoy se
   pide en el paso 7, movida al 0. En el modo revisión, el ítem 4 pasa a ser «los configs existen
   **y su dependencia está instalada**».
2. **Script nuevo `skills/verify-e2e/scripts/e2e-doctor.cjs`** — un chequeo mecánico único: el
   paquete está en `devDependencies`, resuelve desde el proyecto, y **el browser que esa versión
   espera** existe en disco (no «algún chromium en la caché»). Vive en `verify-e2e` porque es el
   dueño de la precondición; `harness-init` lo invoca al terminar, junto al `grep` de ranuras.
3. **`verify-e2e/SKILL.md`, precondición 4** — correr el doctor en vez de inspeccionar a ojo. Si
   falla, decirlo como hallazgo del paso 0 («`harness-init` debía dejarlo listo») y seguir pidiendo
   permiso para instalar, como hoy.
4. **`assets/stacks/typescript-node/playwright.config.ts`** — `trace: 'retain-on-failure'`, con el
   porqué en el comentario, y una línea para superficies estáticas: HTML generado no necesita
   `webServer`, los specs abren `file://`.

Aplicarla **en el mismo lote que [[L46]]**: tocan los mismos archivos, y la pregunta de superficie
que esta necesita la introduce aquella.

**Lo que este caso no es.** No es un fallo del ciclo: la precondición 4 hizo exactamente lo que dice,
detectó la falta y no instaló nada sin permiso. Es que la pregunta llegó en el paso 7, donde cuesta
una feature entera de espera, en vez de en el paso 0, donde cuesta una línea.

---

## Lote 1 aplicado — 2026-09-07

L19, L20, L11 y L10 resueltas en los commits `2ca3589` (L19+L20) y el siguiente (L11+L10).

**L19** — helper `agentP()` en `tasks-fanout.js`, que descubre el prefijo del plugin leyéndolo del
mensaje de error y lo cachea. Era el único defecto que **bloqueaba** el uso del harness empaquetado.

**L20** — `meta.phases` declarado con seis títulos estáticos; el número de ronda se movió al `label`
y a un `log()`. La regla quedó escrita en el propio `meta`.

**L11** — el scout ahora reporta `maxIdIssued` leyéndolo de una línea nueva del encabezado
(`> Ids emitidos: hasta T<n>`), y la semilla toma el máximo entre eso y el plan vivo. Degrada sola:
si la línea no existe —archivos viejos— devuelve 0 y se cae al cálculo de antes.

**L10** — el workflow compara en JS el plan final contra el que leyó el scout (ids, orden, título,
`Cubre`, objetivo y primer test) y le dice al writer si preservar el encabezado. **El `Estado` queda
fuera de la comparación a propósito**: lo escribe quien implementa, y una tarea que pasó a `hecho` no
es un cambio de plan.

### Dos cosas que aparecieron al aplicarlo

**El linter había quedado mirando al vacío.** Al mover los cinco sitios de prompt a `agentP()`, el
linter —que buscaba `agent(`— dejó de encontrar prompts reales y empezó a marcar como problema las
tres llamadas internas del helper, que reciben el prompt en una variable. Se actualizó, y **se le
agregó un guard**: si no encuentra ninguna llamada que revisar, falla en vez de pasar. Un linter que
no encuentra nada pasa siempre, y eso es peor que uno que falla — si alguien renombra el helper, el
chequeo se vuelve decorativo sin avisar. Es el mismo patrón de [[L20]]: algo deja de funcionar y no
emite ninguna señal.

**Un respaldo dentro de `~/.claude/skills/` se convierte en un plugin vivo.** Al copiar
`harness-spike` a `harness-spike.bak-v2` antes de empezar, el backup se auto-cargó como un segundo
harness en la sesión. Los respaldos van fuera de ese directorio —`~/.claude/backups/`— porque todo lo
que hay adentro se carga. Vale para el README del [[L5]]: es la misma familia de problema que las dos
copias del workflow.

---

## Lote 2 aplicado — 2026-09-07

L24, L22, L23 y L32 resueltas en `dod-checker.md`. L27 y L31 quedan **parcialmente** cubiertas: su
mitad del verificador está escrita, y falta su mitad del origen (`specify`), que es el Lote 3.

**Sección nueva «Qué te tiene que llegar, y qué no»** — el contrato de invocación, puesto arriba
junto a las otras declaraciones de identidad. Cubre L22 (solo necesita id y ruta; ignora
afirmaciones sobre resultados; el vocabulario de veredictos no lo negocia el llamador) y L32 (los
skills del frontmatter **son propios y se usan**, no son contaminación del llamador).

Que las dos cosas estén en la misma sección es deliberado: la regla de ignorar y la de usar lo
propio se leen juntas o la primera se lleva puesta a la segunda, que es exactamente lo que pasó
cuando `e2e-triager` descartó `specify`.

**Paso 6, «Restá las dependencias»** — L24 deja de ser una mención en `## Límites` y pasa a ser un
paso del procedimiento. La frase que lo cierra es la que faltaba: *que la bitácora ya la declare no
la saca del veredicto*, porque leer la bitácora primero y buscar solo lo que confiesa es auditar el
relato en vez del repo.

**Sección nueva «La otra mitad de esa regla»** — el hallazgo tiene que llegar al veredicto. Está
puesta inmediatamente después de «La regla que más importa» a propósito: una protege del falso
negativo, la otra del falso positivo, y juntas dicen que el veredicto es el único canal que mueve
el `Estado`.

**Sección nueva «Cuando la verificación no corre»** — L23. Presupuesto explícito (un reintento, tres
comandos de diagnóstico), prohibición de probar workarounds del comando declarado, y la pregunta que
separa «entorno roto» de «toolchain roto» en una sola corrida.

### Lo que este lote todavía no puede probar

Los cuatro cambios son prosa, y su efecto solo se ve **usándolos**. `claude plugin validate` pasa y
el inventario está completo, pero eso comprueba el empaquetado, no la conducta. La prueba real es la
corrida final: rehacer el demo y ver si `dod-checker` detecta la dependencia fuera de contrato sin
que nadie se la señale — falló dos de dos antes de este cambio.

---

## Lote 3 aplicado — 2026-09-07

L31, L27, L26, L18 y L21 resueltas en `specify` y sus assets, más `plan-reducer`.

**L31 — la atomicidad pasa a ser un paso.** Nuevo paso 6 de la fase 1: releer cada criterio buscando
conjunciones **antes de presentar**. La regla ya estaba en el template y se salteaba sola; ahora está
en el procedimiento, que es la diferencia entre una regla mencionada y una ejecutada.

Y se agregó un **detector** en `evals/check_specs.py`: `COMPOUND_PATTERNS` busca una conjunción
seguida de otro verbo en infinitivo. Probado contra los tres criterios del demo — marca R1.1 («dos
campos editables **y** un tercero de solo lectura») y deja pasar R3.1 («vaciar las casillas de
entrada y la de resultado»), donde la `y` solo une sustantivos. Heurístico, con falsos positivos
aceptables, igual que la lista de librerías que ya tenía.

**L27 — el criterio va a la tarea que lo completa.** Escrito en los dos lugares que hacían falta:
`specify` (define el formato) y `plan-reducer` (lo aplica). Con la pregunta que lo decide sin
ambigüedad: *¿si esta tarea estuviera terminada y ninguna otra, el criterio se podría comprobar de
punta a punta?* Si no, habilita.

**L26 — la línea de verificación superada.** Nueva línea en `tasks-template.md`:
`**Verificación previa (superada):**`. No se borra el veredicto viejo —el camino hasta el `cumple` es
lo que la bitácora existe para guardar— pero se marca, para que quien lea de arriba hacia abajo no
encuentre un `no-verificable` sobre una tarea que la tabla da por hecha.

**L18 y L21 — la compuerta se lee al decidir, y el sí aterriza en el archivo.** Las dos fases ahora
dicen qué habilita la aprobación **al pedirla**, y asientan `> Estado: aprobado (fecha)` en el acto
cuando llega. Con la razón escrita: la aprobación ocurre en el chat y el chat se pierde; lo que
queda es el encabezado, y es lo que leen `planning-tasks` y el scout en la corrida siguiente.

### Lo que falta de este lote

**L21 quedó resuelta solo para `requirements.md` y `design.md`.** El encabezado de `tasks.md` lo
escribe el workflow, que lo deja en `pendiente de aprobación` —correctamente, porque no le
corresponde aprobar— y quien recibe el sí tiene que asentarlo. Ese «quien» es el paso 5, que todavía
no tiene skill: se cierra en el **Lote 5**.

---

## Lote 4 aplicado — 2026-09-07

L16, L17 y L18 resueltas en `brainstorming.md`. **L15 se cierra con ellas**: era el síntoma, no la
causa.

Las adiciones van **en inglés**, que es el idioma de este skill — el único del harness que lo está,
porque viene del skill de Anthropic adaptado. Mezclar idiomas adentro de un mismo archivo le habría
costado coherencia al texto que justamente tiene que leerse como una sola voz.

**L16 — paso 3 nuevo, «Know when to stop asking».** La frase que lo resume: *«One at a time» sets the
rate; this sets the exit condition, and without it the rate is all you have.* Antes de proponer hay
que **enumerar las decisiones de comportamiento que el pedido deja abiertas**, con ejemplos
concretos —qué pasa con entrada vacía o inválida, si algo recalcula solo o a demanda, qué borra un
«limpiar», qué campos son editables— y solo se avanza con esa lista vacía o con lo que quede escrito
como supuesto.

Con la razón del costo: un supuesto declarado es honesto; uno silencioso **se convierte en criterio
de aceptación numerado dos pasos después, y de ahí en más nadie lo vuelve a cuestionar**.

**L17 — sección nueva «Label every decision with where it came from».** Tres etiquetas: *you asked
for this* · *I decided this — tell me if it works* · *I assumed this because X*. Y la observación que
la hace necesaria: **ninguna compuerta atrapa esto**, porque la compuerta pregunta «¿aprobás?» y
nunca «esto que digo que pediste, ¿lo pediste?».

**L18 — el paso 6 nombra `specify` al pedir el sí**, y `## After Approval` pasó a ser una
confirmación en vez de la primera noticia.

### Una nota de costo

`claude plugin details` después de los lotes 2, 3 y 4: el always-on quedó igual (~1.919 tok), y lo
que subió es el on-invoke — `specify` de 5.1k a 6.2k, `dod-checker` de 2.6k a 4.7k, `brainstorming`
de 2k a 2.8k. Es el precio de las reglas nuevas y se paga solo cuando el skill se invoca, no en cada
sesión. Vale tenerlo medido: si una segunda ronda de mejoras vuelve a agregar prosa, este es el
número a mirar.

## Lote 5 aplicado — 2026-09-07

L30, L28, L22 (mitad de invocación), L21 (mitad de `tasks.md`) y L35 resueltas; **L29 resuelta
parcialmente**, con su límite escrito. La pieza central es un skill nuevo:
`.claude/skills/implement-task/SKILL.md`.

**El paso 5 dejó de ser el único sin dueño.** La fila 5 decía «TDD, a mano», y ese hueco no era
neutro: los pasos con skill se comportan igual siempre, y el que no lo tenía improvisaba. Las cuatro
reglas que se le habían acumulado sin escribir entran ahora como pasos de un procedimiento, no como
menciones — que es la diferencia que el Lote 2 ya había pagado con L24.

**L30 — el cierre del paso.** El ciclo por tarea termina invocando a `dod-checker` **sin preguntar**.
Con las dos razones escritas, porque son las que hacen que la regla se sostenga: una tarea
implementada y sin verificar queda en `en curso`, indistinguible de «a medio hacer»; y preguntar
«¿verifico?» pide autorizar algo sin costo irreversible y sin cuyo resultado la persona no puede
decidir nada. **La compuerta va después del veredicto**, no en el medio.

**L28 — una tarea, una compuerta**, con la renuncia explícita que se decidió al aplicarlo y sus dos
condiciones (arriba, en la propia lección). Se agregó además el autodiagnóstico que delató la
propuesta mala en el demo: **si te descubrís proponiendo implementar de a tres pero verificar de a
una, tratá esa asimetría como la señal de que la propuesta está mal.** Una precaución puesta de un
lado y no del otro no es un diseño.

**L22 — la mitad del llamador.** El Lote 2 escribió qué ignora `dod-checker`; faltaba qué se le
manda. Ahora está del lado de quien invoca: pasale el id y la carpeta, y nada más. Con el daño real
citado —el verificador usó la bitácora del implementador **como checklist** y encontró exactamente
las dos dependencias que ya estaban confesadas— porque el ejemplo enseña lo que la prohibición sola
no: la contaminación no estuvo en los comandos, estuvo en **qué buscó y contra qué lo comparó**.

**L21 — el sí aterriza en el archivo, también para `tasks.md`.** El skill comprueba el encabezado
antes de la primera tarea: si dice `pendiente de aprobación`, pregunta y lo asienta. Eso obligó a
tocar `CLAUDE.md`: la regla decía que quien implementa escribe **dos** regiones, y ahora son esas dos
más el encabezado de aprobación, una sola vez. Sin ese cambio el skill contradecía el contrato.

**L29 — lo que se pudo, dicho como es.** Un commit por tarea con el id en el mensaje, más la línea
del rojo literal en el `Registro`. La corrección de encuadre está en la lección: el commit prueba
unidad de trabajo y no orden, y la línea del rojo es diagnóstico y no evidencia. Se escribió así
también **dentro del `SKILL.md`**, para que quien lo lea no crea que commitear cierra el asunto.

### Lo que apareció al aplicarlo

**[[L35]], y es la más incómoda del lote.** El router del plugin y su manifiesto nunca tuvieron
fuente en el repo, contra un invariante declarado. Se trajeron a `.claude/plugin-root/` —fuera de
`.claude/skills/`, que se auto-carga— y **se cambió la forma del chequeo**: `.claude/checks/sync-plugin.sh`
compara el árbol completo del plugin contra el que el repo puede reconstruir, en las dos direcciones,
en vez de hacer `diff -rq` sobre cuatro directorios conocidos.

Se comprobó que **falla** en los dos casos —un huérfano en el plugin, un archivo del repo que no
llega— porque un chequeo que nunca falla es decorativo, que es la misma lección que el guard del
linter en el Lote 1.

**Y el comando de resincronización arrastraba un segundo defecto, más chico.** `cp -R .claude/skills/*`
habría copiado también `skill-creator`, que vive en el repo pero no es del harness. El script lo
excluye con una **lista de exclusión y no de inclusión**, a propósito: así un skill nuevo del harness
entra solo. Con una lista de inclusión, `implement-task` no habría llegado al plugin y nadie se
habría enterado — exactamente el modo de falla de L35, una vez más.

## Lote 5b aplicado — 2026-09-07

L33 resuelta. El paso 8 dejó de mencionarse en prosa y pasó a tener fila, skill y conducta:
`.claude/skills/close-feature/SKILL.md`.

**Por qué un skill y no una regla suelta.** Era la tentación obvia —es un paso corto— y es
exactamente el error que el Lote 5 acababa de pagar: un paso con fila en la tabla y sin productor
improvisa. Poner la conducta en `CLAUDE.md` y dejar la fila apuntando a «a mano» habría reproducido
el hueco del paso 5 el mismo día que se cerró.

**Lo que el skill dice, y el orden importa.** Primero la razón —**un veredicto se toma sobre un
estado**— con el caso de T11 contado entero, incluida la parte incómoda: el `Objetivo` de la tarea
*sabía* que `end2end/` se iba a poblar y no había ningún lugar donde usar esa información. El skill
es ese lugar. Recién después el procedimiento, porque sin la razón el paso se lee como trámite y el
trámite se saltea.

La tabla de tres niveles quedó escrita ahí y vale por sí sola: paso 6 pregunta por *una tarea en un
momento*; paso 7 por *la feature en un momento*; paso 8 por *todos los veredictos juntos, en el
estado final*.

**Los dos atajos prohibidos, que son el corazón del paso.** No acotar la corrida a los tests de la
feature, y no saltearla porque cada tarea ya corrió lo suyo. El segundo tiene la forma de un
razonamiento válido y no lo es: *que las partes hayan pasado por separado es justamente la
afirmación que este paso viene a comprobar, así que no puede ser también su justificación para no
comprobarla.*

**Un rojo reabre, no repara.** Misma arquitectura que el ciclo e2e, y por la misma razón escrita.
Con la regla para el caso que más se va a dar: si el rojo no es de ninguna tarea en particular
—configuración, un runner que levanta lo que no le toca, que es literalmente el caso de T11—, la
tarea afectada es **la que declaró que ese comando quedaba en verde**. Y el veredicto viejo se marca
`Verificación previa (superada):`, no se borra: **un veredicto que envejeció no es un veredicto que
estuvo mal**, y esa distinción es toda la lección.

**El paso puede cerrar sin commit.** Si no quedó nada sin commitear —cada tarea ya tiene el suyo, por
[[L29]]— el cierre legítimo es «la higiene dio verde y no había nada pendiente». El valor del paso es
la corrida, no el commit. Escribirlo evita el commit vacío fabricado para tener uno.

### Lo que apareció al aplicarlo

**[[L13]] estaba abierta también en este repo, no solo en el demo.** `CLAUDE.md` listaba tres
comandos bajo un único rótulo, sin decir cuál es de corrección y cuál de higiene — así que
`implement-task` («corré el de corrección») y `close-feature` («corré el de higiene») no tenían
contra qué bindear. Se separaron en dos ranuras rotuladas.

**Pero el nombre de la sección no se tocó, y esa fue una decisión.** `spec-scout`, `dod-checker`,
`tasks-fanout.js` y el router buscan literalmente «Comandos de verificación». Renombrarla a algo más
preciso habría roto cuatro lectores **en silencio**: ninguno falla si no encuentra la sección, se
las arreglan con lo que haya. Es la misma familia que [[L35]] — un acoplamiento por nombre, sin nada
que lo verifique — y la salida barata fue conservar el rótulo y separar adentro. Queda anotado como
deuda: el día que haya que renombrarla, son cuatro archivos y ningún chequeo avisa.

**La pata e2e del comando de higiene se declaró condicional.** En este repo `@playwright/test` está
en `devDependencies` pero no instalado, así que `npm run test:e2e` falla. Meterlo incondicionalmente
en la ranura de higiene habría dejado el paso 8 **rojo por construcción**, y la primera vez que se
usara habría reabierto una tarea por andamiaje ausente. El skill lo dice como regla general: si una
pata del comando de higiene no aplica hoy, se declara en vez de dejarla correr, porque un rojo de
andamiaje ausente no es un hallazgo.

Vale notar que el defecto se encontró **corriendo el comando**, no leyéndolo. `CLAUDE.md` decía
«playwright test» y la declaración de la dependencia estaba: los dos archivos que había que leer
decían que funcionaba.

## Lote 6 aplicado — 2026-09-07

L1 resuelta, y con ella L13 (que había quedado a medias en el Lote 5b) y L14. El paso 0 tiene
productor: `.claude/skills/harness-init/`, con su plantilla y sus configs por stack.

**Las dos mitades quedaron escritas como dos mitades.** La plantilla restringe por estructura —no
tiene sección «Estructura», así que **L14 pasa de improbable a imposible**; tiene dos ranuras de
comandos rotuladas por separado, así que **L13 tampoco está disponible**—. La entrevista llena las
ranuras, y no decide: el stack se pregunta siempre, incluso cuando la respuesta parece obvia, y
cualquier recomendación va etiquetada con su origen.

**El mecanismo de la ranura visible se volvió un chequeo, y eso no estaba en el plan.** La plantilla
usa `<algo: preguntá antes de completar>`, y el skill cierra con un `grep` de ese literal sobre el
archivo escrito. Era la parte más linda de L1 —«una ranura sin llenar se ve; una generación libre
que decidió sola no deja ninguna marca»— pero seguía siendo prosa: alguien tenía que acordarse de
mirar. Ahora es un comando con salida verificable. Probado sobre la plantilla cruda (encuentra las
seis) y sobre una a medio llenar (encuentra las dos que faltaban).

**Modo revisión, que tampoco estaba en el plan y se ganó su lugar el mismo día.** Si ya hay un
`CLAUDE.md`, el skill no lo pisa: lo revisa contra las cuatro cosas que el harness necesita y
propone. La razón de agregarlo es empírica y muy corta: **es exactamente lo que hubo que hacer a mano
en el Lote 5b sobre este repo**, cuando apareció que su sección de comandos tenía el mismo defecto
que la del demo. Si el trabajo ya se hizo una vez a mano, tiene dueño.

**Los configs se siembran con sus comentarios, y eso es una instrucción, no un detalle.** El
`vitest.config.ts` que excluye `end2end/` y el `playwright.config.ts` con `retries: 0` viajan con la
explicación de por qué existen. Sin ella, el primero que los lea borra la exclusión por parecer
arbitraria — y esa exclusión es literalmente el bug de [[L33]], el que invalidó un veredicto sin que
la tarea cambiara.

**La estructura del directorio codifica «por stack».** `assets/stacks/typescript-node/` es una
carpeta, no una lista adentro de un archivo: agregar un stack es agregar una carpeta. Y para un stack
que no está, el skill dice explícitamente **qué problema resuelve cada config** y deja que la persona
lo traduzca, en vez de improvisar un config para un runner que no conoce.

**El callejón sin salida del router se cerró.** Decía «si el proyecto no tiene `CLAUDE.md`, decilo
antes de arrancar» y ahí terminaba — que es la forma exacta del hueco de L1: detectaba bien y no
tenía a dónde mandar. Ahora nombra el productor.

**`git init` se ofrece en el paso 0**, que es donde corresponde. `implement-task` lo sigue
comprobando: dos redes para la misma caída, y la segunda es barata.

### Lo que este lote no puede probar todavía

Se verificó el **mecanismo**, no la **conducta**: que la plantilla no tiene sección «Estructura», que
las dos ranuras están rotuladas, que el `grep` encuentra lo que falta, y que `spec-scout` y
`dod-checker` siguen encontrando la sección que buscan por nombre. Nada de eso dice que la entrevista
vaya a preguntar el stack en vez de decidirlo — eso es conducta y solo se ve usándolo.

Es la misma limitación que el Lote 2 anotó para `dod-checker`, y la respuesta es la misma: la prueba
es rehacer el demo desde una carpeta vacía. Con la diferencia de que **este lote es el único cuyo
valor ya se midió**: el `vitest.config.ts` con la exclusión estaba escrito en L1 desde antes de que
el bug ocurriera, el demo no lo tuvo porque el skill que debía sembrarlo no existía, y el bug apareció
exactamente donde la lección decía.

## Lote 7 aplicado — 2026-09-07

L25, L5 y L3 documentadas en el `README.md`, y L7 corregida ahí donde decía lo contrario de lo que
había pasado. Conocimiento que no cambia una línea de código y cuesta horas si falta.

**L25 fue a «Antes de empezar», no a una sección de troubleshooting.** Es una precondición, no un
síntoma: si el proyecto vive en una carpeta sincronizada, el harness no funciona y el diagnóstico se
va a ir a cualquier lado. Van los dos números —97.170 ms contra 34 ms de `prepare`, 225 s contra
734 ms de corrida— porque una tabla convence donde una advertencia no, y **va también la moraleja**,
que vale más que el caso: cuatro sospechosos equivocados antes de la causa, y una sola pregunta que
lo destrabó — *¿el mismo tipo de comando funciona en otro proyecto de la misma máquina?*

**L5 quedó pegada al paso donde muerde, con el porqué y no solo el qué.** El README ya decía «borrá
las copias del repo» para skills y agentes; lo que faltaba es que **para workflows es peor**. Para
skills y agentes hay shadowing y una gana; los workflows se registran con nombres distintos
(`tasks-fanout` vs `mi-harness:tasks-fanout`) y **quedan los dos vivos**. Se puede correr la copia
vieja creyendo que se usa la del plugin, arreglar el plugin, y no ver ningún cambio ni ninguna señal
de por qué.

**L3 quedó como advertencia sobre una herramienta, no sobre el harness.** `claude plugin details` no
cuenta el `SKILL.md` de la raíz ni los workflows, y es el comando natural para medir qué trae un
plugin. Se documentó con el daño concreto que hizo —dimos por probable que los plugins no soportaban
workflows, y era falso— porque el número solo no enseña a desconfiar.

**L7 estaba al revés en el README.** Decía «el ciclo e2e nunca corrió entero», y para cuando se
escribió este lote ya había corrido: tres casos, tres specs, tres verdes. Ahora dice lo que pasó **y
lo que sigue sin probarse**, que es lo que importa: el **ruteo** y el loop de reintento del lado del
test. Corregir una limitación superada es tan importante como anotarla — un README que subestima lo
que el método hace se lee como falta de confianza, y uno que lo sobrestima es peor.

### El README estaba desactualizado en más lugares de los que este lote venía a tocar

Los lotes 5, 5b y 6 agregaron tres skills y dos pasos, y el README seguía describiendo el harness de
antes. Se corrigió todo lo que había quedado mintiendo:

- «cuatro skills» → siete. «El ciclo, en siete pasos» → nueve, con el paso 0 y el 8 en la tabla.
- La fila 5 decía **«TDD, a mano»**, que es exactamente el hueco que el Lote 5 cerró.
- El diálogo de ejemplo mostraba `verificá T1` como un pedido humano. Ahora muestra que **se
  encadena y no se pregunta**, que es la conducta que L30 vino a escribir.
- «Lo único que hay que adaptar: `CLAUDE.md`» ahora dice que **no se escribe a mano**: tiene
  productor desde el Lote 6.
- «El punto que hay que verificar primero» daba el workflow-en-plugin por incógnita. Ya está
  verificado, así que pasó a explicar lo que **sí** sorprende: que el namespacing renombra todo, y
  que el prefijo se descubre leyéndolo del error en vez de hardcodearlo.
- En «Estado y límites», la entrada de L10 —re-planificar desaprueba un plan intacto— estaba
  resuelta desde el Lote 1 y seguía figurando como límite. Se reemplazó por el límite que sí queda
  abierto y es más importante: **no hay evidencia independiente del orden del TDD** ([[L29]]).

**La moraleja, que aplica a cualquier repo con documentación de su propio método:** los archivos que
describen el sistema envejecen en silencio y sin emitir señal, igual que el chequeo de deriva de
[[L35]]. Nada falla cuando un README miente. Conviene tratarlo como parte del cambio y no como una
tarea aparte — que es justo lo que este lote terminó siendo.

### La corrección al plan

El plan decía que romper algo a propósito para ejercitar el ruteo iba «antes de todo esto». Se
invirtió, con las dos razones escritas en el propio plan: correrlo antes lo mediría sobre el harness
**viejo**, que va a dejar de existir; y **rehacer el demo termina con todo en verde**, que es el
único estado desde el cual no se puede ejercitar el camino del fallo. Plegar la prueba de ruteo
adentro de la corrida final da las dos cosas de una.

## Lote 8 aplicado — 2026-09-22

Guardas y arreglos aislados: L42, L9, L38 y L36. Es el primer lote de
[`docs/2026-09-19-lotes-8-a-10/plan.md`](docs/2026-09-19-lotes-8-a-10/plan.md), y va primero porque
L42 es la herramienta que cuida a los dos lotes que siguen.

**L42 — `checks/check-rules-parity.cjs`, la quinta verificación.** Compara el conjunto de reglas de
«Reglas del harness» del `CLAUDE.md` de este repo contra las de `CLAUDE.template.md`, y el productor
de cada paso de la tabla del ciclo entre el router y esa misma plantilla. La decisión de diseño que
lo hace usable: **compara títulos en negrita, no prosa.** Las dos copias difieren en el cuerpo a
propósito —el repo dice «Cada tarea es su propio ciclo de TDD», la plantilla dice «Once tareas son
once ciclos»— y un chequeo que diera rojo por eso se aprendería a ignorar, que es peor que no
tenerlo. Los tres bullets sin negrita se comparan enteros: son una línea corta y completa, sin
cuerpo que pueda diferir.

**Su primera corrida dio un rojo falso, y el falso positivo valía.** Reportó tres reglas presentes
en la plantilla y ausentes en el repo: *«nombres de archivos, módulos o componentes concretos»*,
*«requisitos ni criterios de aceptación»* y *«el plan de trabajo»*. No son reglas — son los bullets
del bloque `<!-- Qué NO va en este archivo -->` con el que la plantilla cierra su sección. Como el
comentario vive **dentro** de la sección «Reglas» y después no hay otro `##`, el parseo se lo tragó.
Se descartan los comentarios HTML antes de parsear. La moraleja no es sobre markdown: **la primera
corrida de una guarda mide la guarda, no lo guardado**, y conviene reservarle ese crédito en vez de
creerle el primer hallazgo.

**Y se probó que da rojo cuando toca.** Una línea base en verde no prueba nada: se borró
*«Un commit por tarea, con su id en el mensaje»* del `CLAUDE.md`, el chequeo la reportó como
faltante con exit 1, y se restauró. Una guarda que nunca se vio fallar es una guarda no verificada.

**L9 — la prohibición se reescribió sobre la ejecución, no sobre el efecto neto.** En
`dod-checker` y `spec-scout`, los dos agentes de solo lectura que tienen `Bash`, decía *«ni ningún
comando que deje un cambio en el repo»*. Esa redacción autoriza `git stash && … && git stash pop`
por lectura literal —el working tree termina igual— y fue exactamente la violación observada el
2026-09-11. Ahora nombra los comandos prohibidos aunque restauren (`git stash` con `pop` o sin él,
`checkout`, `reset`, `clean`) y explica la ventana: entre el cambio y la restauración, el trabajo
sin commitear de otro vive solo en un stash que nadie sabe que existe. Y nombra la alternativa, que
es la mitad que faltaba: `git log -1 -- <archivo>`, `git diff`, `git show`, `git blame` contestan la
misma pregunta sin tocar nada. Cierra con qué hacer si aun así no alcanza: anotarlo en `specGaps` y
seguir.

**El patrón que comparten L9 y L38.** Las dos eran instrucciones escritas sobre el *efecto deseado*
—que el repo quede igual, que llegue un sí— y se reescribieron como restricción sobre el *acto*:
qué comandos no corrés, en qué medio pedís la confirmación. Una instrucción sobre el efecto se
racionaliza; una sobre el acto se cumple o no se cumple, y se ve.

**L38 — la confirmación va en prosa.** El paso 2 de `planning-tasks` decía «esperá el sí, una
confirmación corta alcanza», y el modelo alcanzó `AskUserQuestion` con una sola opción, que el
harness rechaza por diseño (`minimum: 2`). Ahora lo dice explícito, con el porqué: pedir un sí no es
ofrecer una elección, y acá hay un solo camino. Subió de `en observación` a `resuelto` sin esperar
la segunda ocurrencia — el arreglo era una línea.

**L36 — el puntero a `/workflows`, como paso y no como intención.** El paso 3 de `planning-tasks`
enumera ahora tres cosas que decir al lanzar y «ninguna menos»: el `Task ID`, `/workflows` para ver
el avance en vivo, y la forma del fan-out. Se agregó además una segunda oportunidad independiente:
al llegar la notificación de fin, leer `wf_<runId>.json` y reportar `agentCount`, duración y `logs`.
Dos puntos de entrega baratos en vez de un hook — si igual falla, eso es evidencia para reabrir
[[L8]], no para escribir más prosa.

**Lo que este lote no ejercitó.** El arreglo de L9 no se probó con una corrida real de
`dod-checker`, y el de L36 y L38 no se probaron con una re-planificación real: los tres se
verificaron leyendo el archivo, no viéndolos actuar. Quedan para la primera corrida del ciclo que
los toque, en sesión nueva.

## Primera corrida con el harness nuevo — 2026-09-11

La corrida final del plan, hecha sobre el demo (`~/dev/my-harness-demo`) y no desde una carpeta
vacía: una feature nueva —resta, multiplicación y división— recorrida del paso 0 al 8. Nueve tareas,
once commits, 37 tests, 6/6 e2e, todo verificado de forma independiente al terminar. La sesión corrió
en **Sonnet 5**. El estado anterior quedó protegido en el tag `lecciones-v1`.

**Lo que se confirmó en uso, sin que nadie lo pidiera:**

| Lección | Evidencia |
|---|---|
| [[L16]] [[L17]] [[L18]] | Cuatro preguntas con alternativas antes de proponer; supuestos etiquetados *«lo asumo por consistencia — no lo preguntaste»*; el pedido de aprobación nombra `specify` |
| [[L19]] [[L20]] [[L11]] | El workflow corrió desde el plugin sin parchear; seis fases en el estado; `> Ids emitidos: hasta T9` |
| [[L27]] | T1 y T2 con `Cubre: —` y *«habilita R2.1, que se cierra en T4»* |
| [[L30]] [[L28]] | Cero «¿verifico?»; T1–T3 con un sí cada una; el modo corrido no se infirió: la sesión lo explicó cuando la persona preguntó por encadenar, y ella lo pidió |
| [[L22]] | Las 11 invocaciones a `dod-checker`: *«Verificá la tarea TN del spec en docs/…»*. Nada más |
| [[L29]] [[L26]] | Un commit por tarea con su id; T7 con dos; la línea del rojo literal en cada Registro; `Verificación previa (superada)` bien marcada |
| [[L31]] y Lote 2 | **El resultado más importante:** T7 y T9 volvieron `cumple-parcial` por hallazgos reales. El diagnóstico de fondo del plan —*«tres veces detectó bien un problema y no lo dejó llegar al veredicto»*— no se repitió |
| [[L13]] | La deuda de formato de T8 no hizo fallar su veredicto —el paso 6 corre el comando de corrección, no el de higiene— y apareció igual antes del cierre |

**Lo que falló:** [[L36]] (el progreso no se nombró), [[L39]] (el modo revisión aprobó un contrato
falso), [[L40]] (la regla de corte se leyó de dos formas) y [[L9]] (primera violación observada).

**Lo que no se ejercitó:** el ruteo del e2e —seis de seis en verde—, [[L24]], [[L33]] como
detección, `harness-init` en modo siembra y la comparación A/B.

**Una corrección de método, sobre el análisis y no sobre el harness.** [[L37]] se escribió con la
prueba en curso, sobre el nombre de comando que traía el relato, y resultó falsa en cuanto se miró el
transcript. Con la corrección de [[L9]] y el conteo de agentes de [[L36]], son tres conclusiones en
dos días contradichas por un dato que estaba a un `grep` de distancia. La regla que se desprende es
la misma que el harness le impone a `dod-checker`: **las afirmaciones sobre qué pasó se contrastan
contra el registro, no contra el relato de quien lo cuenta** — y eso vale también para quien analiza.

## Empaquetado como semilla — 2026-09-11

El repo pasó a ser la semilla pública del harness. Hasta hoy era público pero **no se podía usar**:
no tenía licencia —así que nadie podía reutilizarlo legalmente— ni marketplace, y el árbol del plugin
lo armaba `sync-plugin.sh` en la máquina del autor.

**`.claude/` es el plugin.** `plugin-root/` se disolvió: el manifiesto pasó a
`.claude/.claude-plugin/plugin.json` y el router a `.claude/SKILL.md`, que es donde un plugin los
busca. La alternativa descartada era commitear el árbol que arma `sync-plugin.sh`, y habría
reintroducido dos copias de cada archivo, que es lo que [[L35]] y [[L5]] enseñan a no hacer. Así hay
una sola.

**El repo es su propio marketplace**: `.claude-plugin/marketplace.json` en la raíz, con
`"source": "./.claude"`. No es un invento: 52 plugins del marketplace oficial usan el mismo mecanismo
de path relativo.

**Salió `skill-creator`.** Estaba vendoreado en `.claude/skills/`, y con `.claude/` convertido en el
plugin se habría publicado como parte del harness. Se instala desde el marketplace oficial.

**Licencia Apache-2.0**, con el texto canónico en `LICENSE` y el copyright en `NOTICE`.

**Cómo se verificó**, porque que el manifiesto valide no prueba que se instale: `validate --strict`
sobre el marketplace y sobre el plugin, y después **una instalación real** desde el path local, en una
carpeta descartable y con scope local. Quedó la versión 0.2.0 con los 7 skills, los 7 agentes y el
workflow, sin `skill-creator`; la copia instalada pasó `validate --strict`, y la desinstalación no
dejó rastro. La incógnita era si `./.claude` resolvía siendo un directorio oculto. Resolvió.

### Lo que apareció al hacerlo

**[[L44]]**: dos plugins con el mismo nombre no conviven, y el que pierde se apaga en silencio.

**[[L25]], otra vez, y en el lugar más incómodo.** Después de borrar y mover decenas de archivos, la
suite de tests quedó colgada más de dos minutos, con siete workers de vitest vivos. Este repo vive en
`~/Documents`, que está sincronizado con iCloud; el mismo comando en `~/dev` tardó 1,8 s. Es
consistente con L25 —mucho movimiento de archivos de golpe—, pero **no quedó probado**: cuando se
midió, el demonio de sincronización ya estaba en 0 %, y la suite terminó sola en verde. Queda anotado
por la ironía, que es instructiva: la semilla cuyo README advierte contra las carpetas sincronizadas
vive en una.

## Renombre a GoHarness — 2026-09-12

El plugin se llamó **`harness-spike`** hasta hoy, y la semilla vivió primero en `10X-mis-finanzas`.
Las menciones de ese nombre que quedan en este archivo son de esa época y **no se corrigen**: son el
registro de lo que pasó, y reescribirlas volvería incomprensibles los transcripts y los mensajes de
error que se citan.

**Qué cambió.** La semilla se mudó al repo donde el harness se usó de verdad —dos ciclos completos,
seis e2e en verde, commits por tarea— y pasó a llamarse `GoHarness`; el plugin y el marketplace,
`goharness`.

**Por qué se mudó, que es lo que vale registrar.** El ejemplo del repo anterior tenía 29 tareas sin
cerrar al lado de código terminado con 68 tests: trabajo hecho **fuera del ledger**, o sea la
evidencia trabajando en contra de lo que el método dice. Y ahí el paso 7 no se podía demostrar,
porque no hay app que navegar. Una semilla se juzga por lo que muestra funcionando.

**Y por qué el plugin quedó en `plugin/goharness/` y no en `.claude/`:** ahí el repo semilla cargaría
sus propios skills **además** del plugin instalado, y quedarían dos versiones vivas de cada uno
([[L5]], [[L44]]). Fuera de `.claude/`, la semilla puede seguir siendo su propio banco de pruebas.

---

## Anotaciones sueltas del entorno

Cosas que no son del harness pero cuestan tiempo si se olvidan.

- **`claude plugin init --with` es variádico**, no separado por comas: `--with skills agents`, no
  `--with skills,agents`.
- **`node --check` no sirve para `tasks-fanout.js`.** El archivo usa `return` de nivel superior, que
  es como lo ejecuta el runtime de workflows; bajo ESM eso da «Illegal return statement» y no
  significa nada. El chequeo válido es `.claude/checks/lint-workflow-literals.cjs`.
- **`enableWorkflows` es un setting de máquina**, en `~/.claude/settings.json`. No viaja en el repo
  ni en el plugin, y el registro de workflows se arma al arrancar la sesión.
- **Costo del plugin completo:** ~1.919 tokens always-on por sesión. On-invoke: `specify` ~5.1k,
  `verify-e2e` ~3.6k, `dod-checker` y `e2e-triager` ~2.6k cada uno.
