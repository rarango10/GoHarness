# Plan de mejoras del harness

> Backlog de origen: [`lecciones.md`](../../lecciones.md)
> Estado: **lotes 1 a 7 aplicados** (2026-09-07). Queda la corrida final de verificación, abajo.
> Lo aplicado de cada lote —y lo que apareció al aplicarlo, que no siempre estaba acá— se registra
> en las secciones «Lote N aplicado» de `lecciones.md`.

## Por qué existe este documento

El 2026-09-06 se llevó el harness completo —4 skills, 7 subagentes, 1 workflow— desde el repo donde
nació hasta un plugin instalado, y de ahí a un proyecto nuevo en blanco (`my-harness-demo`) donde
recorrió sus siete pasos: brainstorming → requirements → design → plan con fan-out → 11 tareas en
TDD → 11 veredictos de `dod-checker` → ciclo e2e de punta a verde.

**Funcionó.** Y dejó 34 lecciones. Ninguna se habría encontrado leyendo los archivos: todas salieron
de usarlo en un proyecto que no sabía nada del método.

Este documento las organiza en lotes ejecutables, **por archivo a tocar** y no por número de lección,
porque así es como se implementa.

### Por qué no se llama `tasks.md`

`CLAUDE.md` fija que el plan de tareas lo escribe únicamente el workflow `tasks-fanout`, nunca a
mano. Un `tasks.md` escrito a mano en el documento que viene a arreglar el harness rompería su regla
central en el acto.

Esto es **insumo** del ciclo, no su producto. Si se decide ejecutarlo con el método, entra por
`specify` y sale como `tasks.md` por el camino de siempre.

---

## Los tres patrones que cruzan varias lecciones

Valen más que cualquier arreglo puntual, porque son **reglas de redacción para todo el harness**.

**«Ritmo sin condición de corte»** — L16, L23. Dos agentes distintos, el mismo defecto: la instrucción
dice cada cuánto hacer algo pero no cuándo parar. `brainstorming` no sabe cuándo dejar de preguntar;
`dod-checker` no sabe cuándo dejar de diagnosticar.

**«Lo que no es un paso, no se hace»** — L24. La restricción sobre dependencias existía, escrita, en
`## Límites`. Falló dos de dos porque no estaba en el procedimiento. Una regla mencionada no es una
regla ejecutada.

**«La independencia se protegió en la salida y quedó abierta en la entrada»** — L22. Está escrito por
qué `dod-checker` no escribe. No está escrito qué se le puede contar.

Y un cuarto, que es el diagnóstico de fondo del verificador: **tres veces detectó bien un problema y
no lo dejó llegar al veredicto** (L24, L27, L31). El juicio está; falla la traducción del hallazgo a
la escala de veredictos. El arreglo no es enseñarle a detectar mejor: es cerrarle la salida de
escape.

---

## Lote 1 · `tasks-fanout.js` — desbloquea el empaquetado

**Es el único que hoy bloquea.** Sin L19 el workflow falla en su primer paso corriendo desde un
plugin, y hay que parchear el script a mano en cada corrida.

### L19 · Los `agentType` vienen namespaceados

Adentro de un plugin, `spec-scout` se registra como `<plugin>:spec-scout`. Son cinco referencias en
el script y fallan todas. Hardcodear el prefijo se rompe al renombrar el plugin.

Helper al tope del archivo; las cinco llamadas pasan de `agent(` a `agentP(`:

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

Mismo patrón que ya se aplicó a `planning-tasks` para el nombre del workflow: **descubrir el prefijo
del error en vez de asumirlo**. El scout corre primero y solo, así que el prefijo queda resuelto
antes del `parallel()` de los revisores.

### L20 · `meta.phases` y títulos estáticos

El script llama a `phase()` cinco veces y no declara ninguna, así que la vista de `/workflows` no
tiene contra qué mostrar avance. Y tres títulos están interpolados con `${round}`, así que **nunca
podrían matchear** un `meta` que debe ser literal puro.

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

El número de ronda pasa al `label`, que sí es dinámico. **Lección general:** lo que varía por corrida
va en el `label`; lo que estructura el workflow va en el `title`.

### L11 · El próximo id libre

Se calcula sobre lo que quedó en el archivo, así que si desaparece la tarea de id más alto ese número
se vuelve a repartir — justo lo que prohíbe la regla de numeración. Guardar el máximo emitido en el
archivo, como el `seq` del ledger de `split-de-gastos`.

### L10 · Re-planificar no debe desaprobar un plan intacto

En `task-writer`: preservar el encabezado `aprobado` cuando el plan resultante es idéntico al que
leyó el scout. Hoy verificar que un plan sigue en pie tiene como efecto invalidar su aprobación.

**Verificación del lote:** `node .claude/checks/lint-workflow-literals.cjs .claude/workflows/tasks-fanout.js`
y una corrida real desde el plugin **sin parchear el script**.

> `node --check` sobre ese archivo no sirve: usa `return` de nivel superior, que es como lo ejecuta el
> runtime de workflows.

---

## Lote 2 · `dod-checker.md` — que los hallazgos lleguen al veredicto

### L24 · Falta el paso de restar dependencias

La restricción existe en `## Límites` como mención pasiva. Los cinco pasos de `## Qué verificar` no
la incluyen, y falló **dos de dos**. Agregar un paso redactado como una resta:

> Leé el manifiesto de dependencias del proyecto. Leé la lista declarada en `CLAUDE.md`. Reportá en
> `designDeviations` **toda** entrada del primero que no esté en la segunda — esté o no declarada en
> la bitácora. Que el implementador ya la haya confesado no la saca del veredicto: cambia si es un
> desvío *registrado* o *silencioso*, y las dos cosas van al reporte.

**No es un reporte incompleto: es un veredicto equivocado.** Sin el chequeo T1 salió `cumple`; con
él, `cumple-parcial`.

### L22 + L32 · Contrato de invocación

- **Qué necesita:** el id de la tarea y la ruta del spec. Nada más.
- **Qué ignora:** afirmaciones sobre resultados de comandos, veredictos previos, o si la tarea está
  cumplida. Si el prompt las trae, se anota en el veredicto que llegaron.
- **El vocabulario no es negociable.** Si el llamador propone otro conjunto de valores, se ignora y se
  usa el del contrato. Un llamador no puede achicar el espacio de respuestas — pasó, y borró
  `no-verificable`, que es el valor que había salvado la verificación anterior.
- **L32 acota lo anterior:** decir explícitamente que **los skills precargados por frontmatter son
  parte de su configuración y se usan**. `e2e-triager` descartó `specify` creyéndolo contaminación
  externa. Nombrar lo propio es más seguro que enumerar lo ajeno.

### L23 · Regla de corte al fallar

Encadenó diez comandos, varios de 60 s, intentando destrabar un entorno roto. Su instrucción dice
«corré la verificación, una vez».

- **Un reintento** como máximo, y solo si la primera falla parece transitoria.
- **Hasta tres comandos de diagnóstico**, cuyo único fin es llenar `blockedReason` — no arreglar nada.
- **Prohibido probar workarounds del comando declarado.** Correr `vitest --pool=threads` cuando
  `CLAUDE.md` dice `npm run check` ya es verificar otra cosa. **Si el comando del contrato no corre,
  eso es el hallazgo.**
- **Una pregunta que vale oro y cuesta una corrida:** ¿el mismo tipo de comando funciona en otro
  proyecto de la misma máquina? Separa «entorno roto» de «toolchain roto». En el demo, cuatro
  sospechosos equivocados se descartaron con eso.

### L27 + L31 · Cerrar la salida de escape

Regla general, y es la más importante del lote:

> Un hallazgo que toca un criterio se expresa **en el veredicto de ese criterio**, y *además* en una
> nota. La nota no cambia el `tasks.md`; el veredicto sí.

Casos concretos: si un criterio tiene varias cláusulas y solo algunas tienen test, es `sin-evidencia`,
no `cumple` con nota. Si un criterio no se puede evaluar porque la tarea implementa solo una parte,
es un hallazgo del plan que va a `specGaps` **y** baja el criterio a `sin-evidencia`.

---

## Lote 3 · `specify` — atajar los problemas en el origen

L27 y L31 comparten raíz: **el harness trata los criterios como átomos y no lo son.** Arreglarlo en el
spec es más barato que darle vocabulario al verificador.

### L31 · La regla de atomicidad existe y nada la hace cumplir

`requirements-template.md` dice en su línea 57: «Un criterio, un comportamiento. Si tiene un "y
también", probablemente son dos criterios». R1.1 del demo salió igual como dos comportamientos unidos
por una `y`, y el costo se pagó dos pasos después: media R1.1 con evidencia de test y media sin.

- **En el `SKILL.md`:** la atomicidad pasa de recordatorio del template a **paso de la fase 1** —
  releer cada criterio buscando conjunciones antes de presentarlo.
- **En `evals/check_specs.py`:** un patrón que marque criterios con « y » / « and » entre dos verbos.
  Mismo mecanismo que ya usa `IMPL_PATTERNS` para detectar filtraciones de implementación,
  heurístico y con falsos positivos aceptables.

### L27 · `Cubre` no distingue satisfacer de habilitar

R2.1 quedó asignado a T2 y a T7, y T2 no lo satisface: implementa una precondición suya. El mismo plan
lo resuelve bien en T10 (`Cubre: —` porque solo cablea piezas ya cubiertas) — usa las dos convenciones
en la misma corrida, señal de que la regla no está escrita.

> **El criterio se asigna a la tarea que lo completa**, no a las que lo habilitan. Una tarea
> habilitante lleva `Cubre: —` y explica en `Por qué no cubre criterios:` cuál criterio ayuda a cerrar
> y en qué tarea se cierra.

Va en `specify` (define el formato) y en `plan-reducer` (lo aplica). El vocabulario ya existe: lo usan
T1, T10 y T11. Falta decir cuándo corresponde.

### L26 · Un veredicto superado

T1 terminó con dos líneas `**Verificación:**`, la primera obsoleta. Quien lea de arriba hacia abajo
encuentra el `no-verificable` con la tarea en `hecho`. En `assets/tasks-template.md`: la línea vigente
es **la última**, y una superada se marca como tal. No es un caso raro — es el de toda tarea que no
salió bien a la primera.

### L18 + L21 · La compuerta se lee al decidir, no después

**L18:** el nombrado del paso siguiente vive en `## After Approval`, o sea que llega **después** del
sí. La persona aprueba sin saber hacia dónde. La evidencia de que importa: quien se confundió fue el
autor del harness. Mover el nombrado **al pedido de aprobación** — «si lo aprobás, sigue `specify`,
que convierte esto en `requirements.md` con criterios numerados».

**L21:** quien recibe el sí **asienta el encabezado `Estado` en el acto**. Hoy la aprobación ocurre en
el chat y no aterriza en el archivo: `task-writer` tiene prohibido tocarlo y ningún skill lo retoma.
Es el mismo momento del ciclo que L18 — al pedir el sí se dice qué habilita, y al recibirlo se
asienta.

---

## Lote 4 · `brainstorming.md` — condición de corte y honestidad

### L16 · Ritmo sin condición de corte

«Ask clarifying questions, one at a time... One question per message» fija el **ritmo**, no el
**corte**. Preguntó una y decidió cuatro cosas por su cuenta, presentándolas como cubiertas por la
primera.

> Antes de proponer, enumerá las decisiones de comportamiento que el pedido deja abiertas. Proponé
> recién cuando esa lista esté vacía, o cuando lo que quede esté declarado explícitamente como
> supuesto.

Un supuesto declarado es honesto; uno silencioso es el que después aparece como criterio de aceptación
que nadie acordó. **Y el paso 3 tampoco se cumplió:** pide «1-3 approaches with trade-offs», entregó
uno solo.

### L17 · Fabricación de consentimiento

Escribió «el resultado no se recalcula solo... **tal como lo pediste**» sobre algo que la persona
nunca pidió. Es la misma clase de fallo que marcar `hecho` sin veredicto: inventar un respaldo que no
existe. Y el más difícil de detectar, porque quien lee asume que se acuerda mal.

> Prohibido atribuirle al humano una decisión que no tomó. Toda decisión va etiquetada con su origen:
> «lo pediste» · «lo decidí yo, decime si va» · «lo asumí porque X».

La distinción entre las tres es lo que hace que la aprobación signifique algo. Ninguna compuerta lo
detecta, porque la compuerta pregunta «¿aprobás?» y no «¿esto que digo que pediste, lo pediste?».

### L18 · Mismo cambio que en `specify`

L15 —decidir el stack sin preguntar habiéndoselo pedido— se cierra con estos: era el síntoma.

---

## Lote 5 · Un `SKILL.md` para el paso 5

**El paso 5 es el único del ciclo sin skill, y acumula la mayor cantidad de reglas no escritas.** Los
pasos con skill se comportan igual siempre; el que no lo tiene improvisó.

| | Qué escribe |
|---|---|
| **L30** | **Instrucción de cierre:** terminada la implementación, invocar `dod-checker` sin preguntar. Una tarea implementada y sin verificar está en un limbo indistinguible de «a medio hacer», y preguntar «¿verifico?» pide autorizar algo sin contrapartida. **La compuerta va después del veredicto.** |
| **L28** | **La unidad del paso 5 es la tarea**, no la fase. Una tarea termina con un veredicto, no con código. La aprobación entre tareas no es opcional ni acumulable. |
| **L29** | **Un commit por tarea**, con el id en el mensaje. |
| **L22** | El contrato de invocación de `dod-checker`, del lado de quien llama: pasale el id y la carpeta, no le cuentes cómo te fue. |

Sobre L29, el punto que lo justifica: **la evidencia del TDD existe pero es efímera.** El transcript
de T5 muestra el rojo con `expected 0.30000000000000004 to be 0.3`, el fix, y el verde. Quien
implementa **sí produce** la evidencia — queda en un log de chat que nadie va a consultar en un mes.
No hay que generar nada nuevo: hay que persistir lo que ya ocurre. Con commits por tarea, `git log`
pasa a ser el registro independiente del escalonamiento, y lo escribe la herramienta, no quien
implementa.

Requiere una fila nueva en la tabla de `CLAUDE.md` y en el router del plugin.

---

## Lote 5b · El paso 8 (commit) existe y verifica el conjunto

**L33** es la lección con la que se cerró la jornada, y descubre el único modo de falla donde el
estado durable miente sin que nadie haya hecho nada mal.

Un veredicto de `dod-checker` vale para el estado del repo **en el momento en que se tomó**. T11 se
verificó con `end2end/` vacía y el `cumple` era correcto entonces; el paso 7 pobló la carpeta y el
veredicto quedó falso **sin que T11 cambiara una línea**. Lo más incómodo: el propio objetivo de T11
decía que la carpeta vacía era «el resultado esperado hasta que `e2e-test-writer` los escriba». El
plan sabía que el estado iba a cambiar y no había dónde usar esa información.

El commit hoy se menciona en prosa y no tiene fila en la tabla. Darle una, con su conducta:

- Antes del commit se corre la **verificación completa** del proyecto (el comando de higiene, no el de
  corrección).
- **Un rojo reabre la tarea afectada**: vuelve a `en curso` y regresa a `hecho` solo con un `cumple`
  nuevo, tomado ya en el estado final.
- Queda dicho que **un veredicto se toma sobre un estado**, y que la corrida final comprueba que todos
  los veredictos siguen siendo ciertos **juntos**. Verificar tarea por tarea no garantiza el conjunto
  — es la misma distinción que separa el paso 6 del paso 7, un nivel más arriba.

---

## Lote 6 · `/harness-init` — el paso 0 que no existe

**L1** es la lección más grande, y **L13, L14 y L15 se resuelven adentro de ella.**

Los siete pasos del ciclo tienen productor. El contrato del proyecto —`CLAUDE.md`— no tiene ninguno. Y
es la única pieza que hay que adaptar para llevar el harness a otro repo, o sea el paso que más se va
a repetir. En un repo que ya existe no se nota; en uno nuevo es lo primero que se topa.

### Plantilla **más** entrevista, no una en vez de la otra

**La plantilla restringe por estructura, no por prosa.** Es lo que la hace valiosa: casi todo el
harness son compuertas de instrucción, que se cumplen porque el modelo las lee.

- Una plantilla **sin sección «Estructura»** hace que esa sección no exista → **L14** se vuelve
  imposible, no improbable.
- Una plantilla con **dos ranuras rotuladas por separado** —el comando de **corrección** que corre
  `dod-checker`, y el de **higiene** previo al commit— hace imposible **L13**, la conflación que hacía
  fallar una verificación por una queja de formato.

**La entrevista llena las ranuras.** Y una ranura sin llenar es una pregunta visible: un
`<stack: preguntá antes de completar>` que quedó sin tocar se ve en el archivo. Una generación libre
que decidió sola no deja ninguna marca — que es exactamente **L15**.

### Qué siembra y qué no

**Sí:** el `CLAUDE.md`, y los configs que codifican memoria del harness —`vitest.config.ts`
excluyendo `end2end/`, `playwright.config.ts` con `retries: 0`—. Son por stack: arrancar con uno y
agregar a medida que aparezcan.

**No:** las plantillas de documentos. Ya viajan en `assets/` de los skills que las usan, y seis
agentes las conocen vía `skills: [specify]`. Copiarlas al proyecto crea dos copias y la pregunta de
cuál gana. La carpeta `docs/` tampoco: `specify` la crea cuando la necesita.

**Dónde vive la plantilla:** en `assets/` del propio skill, dentro del plugin. No en un repo de GitHub
aparte — eso agrega un canal de distribución, necesita red al inicializar, y se desincroniza del
harness que la usa.

### Este lote ya tiene prueba empírica, y es la más fuerte del plan

El `vitest.config.ts` con `exclude: ['end2end/**']` estaba listado en L1 **desde antes de que el bug
ocurriera**. El repo de finanzas lo tiene; el demo no lo tuvo porque el skill que debía sembrarlo no
existe — y el bug apareció exactamente donde la lección decía. **No es una mejora especulativa: es la
única cuyo valor ya se midió en horas de diagnóstico.**

---

## Lote 7 · `README.md` — cómo usarlo en otro proyecto

Conocimiento que no cambia código pero cuesta horas si falta.

**L25 · Un proyecto verificado por agentes no puede vivir en una carpeta sincronizada.** El demo vivía
en `~/Documents` con iCloud activo y 6.288 archivos en `node_modules`. Cada `import` del worker
atravesaba `fileproviderd` al 107% de CPU.

| | En `~/Documents` (iCloud) | En `~/dev` |
|---|---|---|
| `prepare` del worker | **97.170 ms** | **34 ms** |
| Corrida completa | 225 s, sin recolectar nada | **734 ms**, verde |

Vale además la moraleja: el síntoma apuntó a cuatro sospechosos equivocados —el subagente, el sandbox,
el plugin, las versiones— antes de llegar a la causa.

**L5 · Para workflows no hay shadowing.** La copia del proyecto (`tasks-fanout`) y la del plugin
(`<plugin>:tasks-fanout`) coexisten bajo nombres distintos: quedan las dos vivas y se puede correr la
vieja sin notarlo. Al empaquetar, borrar `.claude/workflows/` del proyecto igual que `skills/` y
`agents/`.

**L3 · `claude plugin details` miente por omisión.** No cuenta el `SKILL.md` raíz del plugin ni los
workflows. Verificar contra el listado de skills de la sesión.

**L7 · El ciclo e2e ya corrió.** Tres casos planificados, tres specs generados, tres en verde. Lo que
sigue sin ejercitarse es el **ruteo**.

---

## Lo que queda sin acción, con su razón escrita

**L8** (las compuertas son instrucciones, no mecanismos) y **L9** (que los agentes de solo lectura no
escriban es conducta, no impedimento) son límites asumidos: el análisis está escrito para no
redescubrirlo.

**L12** (`dod-checker` confía en que un test que pasa prueba lo que dice) y **L6** (usar el MCP de
Playwright para verificar selectores) quedan para una segunda ronda. Sobre L6: el `e2e-test-writer`
eligió bien los selectores sin ayuda —todos por rol y nombre accesible, cero CSS— así que es mejora,
no arreglo.

**L34** es evidencia positiva y no pide cambios: `e2e-test-writer` se negó a correr `npm run format`
porque excedía su región y acotó el comando por su cuenta. Vale citarla al redactar L22 y L32 —
**explicar el principio funciona mejor que enumerar prohibiciones**, y este es el ejemplo que lo
demuestra dentro del propio proyecto.

---

## Orden de ejecución

1. **Lote 1** primero: es el único que bloquea, y su código ya está escrito.
2. **Lotes 2, 3 y 4**: ediciones de prosa a archivos que ya existen, sin dependencias entre sí.
3. **Lotes 5, 5b y 6**: piezas nuevas, más trabajo, y se benefician de que lo anterior esté estable.
4. **Lote 7** al final, para documentar el estado resultante.

## Verificación

Cada lote tiene su chequeo barato, pero **la prueba real es volver a correr el demo**.

- **Lote 1:** el linter de literales pasa, y `tasks-fanout` corre desde el plugin **sin parchear el
  script a mano** — que es exactamente lo que hoy hay que hacer.
- **Lotes 2–4:** `claude plugin eval` sobre las evals que ya traen `specify` y `brainstorming`.
- **Lotes 5–6:** rehacer la calculadora desde una carpeta vacía y comprobar que las lecciones
  correspondientes **no reaparecen**. Mismo input, mismo modelo, distinto harness: es la comparación
  más limpia posible, y el caso de prueba ya está construido.

**Corrección al aplicar el Lote 7.** Esta línea decía «pendiente aparte, y **antes** de todo esto:
romper algo a propósito en el demo actual y correr `verifiquemos e2e` para ejercitar el ruteo». Se
decidió lo contrario, y es mejor: **la prueba de ruteo se pliega dentro de la corrida final de
verificación**, no antes de los lotes.

Dos razones. Correrla antes la haría sobre el harness **viejo**, así que mediría el ruteo de una
versión que va a dejar de existir — y habría que repetirla igual después. Y romper algo a propósito
es exactamente el insumo que la corrida final necesita: rehacer el demo desde una carpeta vacía
termina con todo en verde, que es el único estado desde el cual **no** se puede ejercitar el camino
del fallo. Plegarla adentro da las dos cosas de una: el ciclo completo con el harness nuevo, y el
ruteo (`causa: test` / `codigo` / `spec`) probado sobre él, que es la única parte del ciclo con
diseño y cero pruebas.

## Nota sobre `lecciones.md`

No se borra nada al implementar. Cada lección resuelta se marca `resuelto` con su commit: saber por
qué se hizo algo vale tanto como el cambio, y varias entradas ya sirvieron para no repetir un análisis
o para corregir una conclusión equivocada.

---

## Cierre

> **Este documento es insumo consumido, no un registro de estado.** El cuerpo de arriba está en
> futuro («agregar un paso», «va en `specify`») porque así se escribió: **no lo leas como un to-do**.
> Qué está hecho y qué queda se lee en el **índice de estado** al tope de
> [`lecciones.md`](../../lecciones.md); el detalle de cada lote, en sus secciones «Lote N aplicado».

**Lo único que este documento puede aportar todavía es cuánto le erró, para el próximo plan.** Le
erró en dos formas: cosas que no existían para él (L35 y el chequeo de deriva mal formado; que el
resync habría empaquetado `skill-creator`; que la pata e2e del comando de higiene no corre en este
repo) y cosas que tenía escritas y estaban mal (daba L13 por problema del demo; daba el Lote 7 por
trámite cuando el README estaba desfasado en seis lugares; tenía al revés la línea de la prueba de
ruteo; sostenía [[L9]] sobre-generalizada y [[L29]] sobrevendida).

**El patrón es uno solo: nada de eso se podía ver leyendo.** Apareció al editar, al escribir el
reemplazo, al **correr el comando** —los dos archivos que había que leer decían que funcionaba— y al
mirar cuatro líneas de frontmatter que estaban a un `grep` de distancia. Es la misma forma que este
plan ya había identificado en su origen —«ninguna de las 34 lecciones se habría encontrado leyendo
los archivos»—, cumplida esta vez sobre el plan mismo. Para el próximo: presupuestar que una parte
del trabajo son cosas que no están planificadas y que aparecen al ejecutar. No es un defecto de este
plan; es la propiedad del terreno.
