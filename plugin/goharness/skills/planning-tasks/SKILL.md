---
name: planning-tasks
description: Verifica que el spec de una feature esté completo y aprobado y, si lo está, lanza el workflow "tasks-fanout" que crea o itera su tasks.md. Pregunta antes de lanzar. No planifica ni escribe tasks.md por su cuenta. Es el único camino al plan de tareas: usalo cuando la persona diga "planeemos las tareas", "desglosemos las tareas", "armemos el plan de implementación", "generá el plan de implementación", "iteremos tasks.md", "revisemos las tareas del spec", o pregunte cuál es el siguiente paso después de aprobar el design. Si requirements.md o design.md no existen o todavía no están aprobados, este skill no aplica — remití a "specify" primero.
---

# Planning Tasks

Verificar los insumos, preguntar, lanzar. El plan de tareas lo arma el workflow `tasks-fanout`;
este skill solo comprueba que pueda correr y lo dispara.

## 1. Verificá los insumos

La carpeta del spec es `docs/AAAA-MM-DD-<feature>/`. Si hay varias y no está claro cuál,
preguntá. Ahí adentro:

- `requirements.md` existe y su encabezado de estado dice `aprobado`.
- `design.md` existe y su encabezado de estado dice `aprobado`.

Si falta cualquiera de los dos, o están en `pendiente de aprobación`, **pará acá**: decíselo a la
persona y remitila al skill `specify`. No lances igual ni completes vos lo que falte.

## 2. Preguntá

Una línea con la carpeta y, si `tasks.md` ya existe, cuántas tareas tiene hoy — el workflow lanza
un agente por tarea, así que ese número es lo que hace que la pregunta signifique algo.

Esperá el sí. Una confirmación corta («dale», «va») alcanza.

## 3. Lanzá

Llamá al tool `Workflow` con el workflow guardado `tasks-fanout` y `args` igual a la ruta de la
carpeta del spec:

```
Workflow(tasks-fanout, args: "docs/AAAA-MM-DD-<feature>")
```

`args` también acepta un objeto, para acotar las rondas o forzar un spec sin aprobar:
`{"specDir": "docs/AAAA-MM-DD-<feature>", "maxRounds": 2}`.

**El nombre puede venir con prefijo.** Si el harness está empaquetado como plugin, el workflow se
registra como `<nombre-del-plugin>:tasks-fanout` y el nombre pelado no resuelve. Lanzá el pelado
igual: si no existe, el error lista los nombres disponibles y de ahí sacás el correcto — está
explicado abajo. No inventes el prefijo antes de tener esa lista.

### Si algo falla al lanzar

Son dos fallas distintas y se arreglan distinto — y la segunda tiene, a su vez, dos causas.

**El tool `Workflow` no existe.** Los workflows dinámicos son opt-in en el plan Pro: si
`enableWorkflows` no está en `~/.claude/settings.json`, el tool ni se ofrece. Pedile que lo
active (`/config` → Dynamic workflows, o la clave a mano) y que abra una **sesión nueva** — el
toolset se arma al arrancar.

**El tool existe pero dice `Workflow "tasks-fanout" not found`.** Ese error trae consigo la
solución: termina con `Available: <lista de nombres>`. **Leé esa lista antes de hacer nada más**,
porque distingue las dos causas posibles.

*El workflow está, con otro nombre.* Si en `Available` aparece una entrada que **termina en
`:tasks-fanout`** —por ejemplo `mi-harness:tasks-fanout`—, el workflow se cargó desde un plugin.
Los plugins registran sus workflows namespaceados con el nombre del plugin, así que el nombre
pelado no resuelve. Relanzá con el nombre completo tal como figura en la lista:

```
Workflow(<lo-que-figura-en-Available>, args: "docs/AAAA-MM-DD-<feature>")
```

No hardcodees el prefijo ni lo adivines: tomalo de la lista. El nombre del plugin cambia según
cómo esté instalado, y una copia local del workflow convive con la del plugin bajo nombres
distintos —para workflows no hay shadowing—, así que la lista es la única fuente confiable de
cuál existe de verdad.

*El workflow no está en ninguna forma.* Si no aparece ninguna entrada que termine en
`:tasks-fanout`, el registro no lo tiene. Se arma al arrancar la sesión, así que un workflow
creado o editado a mitad de sesión se cae de ahí. No ofrezcas `/tasks-fanout`: ese comando sale
del mismo registro y tampoco va a existir. Lanzalo por ruta, que no depende del registro:

```
Workflow(scriptPath: "<ruta absoluta de tasks-fanout.js>",
         args: "docs/AAAA-MM-DD-<feature>")
```

La ruta es `plugin/goharness/workflows/tasks-fanout.js` dentro del repo semilla si el harness vive ahí,
o `workflows/tasks-fanout.js` dentro del directorio del plugin si vino empaquetado. Si no sabés
cuál, buscalo con `Glob` en vez de suponer.

Lo que nunca hagas, pase lo que pase, es armar el plan por afuera: el workflow existe para que la
tabla de tareas tenga un único escritor. (El `Estado` y el `Registro` de cada tarea son otra
región, y los escribe quien implementa — eso no es planificar.)
