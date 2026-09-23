# Trabajar sobre el harness

El contrato de **quien edita GoHarness**. Si venís a construir software *con* el harness, este
archivo no es para vos: leé [`README.md`](README.md). Si no sabés en qué modo estás,
[`EMPEZAR-ACA.md`](EMPEZAR-ACA.md) lo resuelve en treinta segundos.

Las reglas del **método** —qué significa `hecho`, quién escribe el plan, la unidad del paso 5— no
están acá: viven en [`CLAUDE.md`](CLAUDE.md) y en la plantilla que el harness siembra. Esto es
mantenimiento del producto, no el método.

## Dónde vive la fuente

```
.claude-plugin/marketplace.json   el repo como marketplace: apunta a ./plugin/goharness
plugin/goharness/                 EL PLUGIN. Esto es lo que se instala
├── .claude-plugin/plugin.json    nombre, versión, licencia
├── SKILL.md                      el router: explica el ciclo y enruta al paso que toca
├── skills/                       los 7 skills, uno por paso con dueño
├── agents/                       los 7 subagentes
├── workflows/tasks-fanout.js     el único escritor de tasks.md
└── checks/                       el linter de literales, la guarda de paridad y el sync
```

**No está en `.claude/` a propósito.** Ahí este repo cargaría sus propios skills *además* del plugin
instalado, y quedarían dos versiones vivas de cada uno. Fuera de `.claude/`, el repo puede seguir
siendo su propio banco de pruebas.

## El ciclo de desarrollo

1. **Editar** la fuente en `plugin/goharness/`.
2. **Sincronizar** a la copia que Claude Code auto-carga:
   ```bash
   bash plugin/goharness/checks/sync-plugin.sh
   ```
   Copia y después compara los dos árboles completos en las dos direcciones. Tiene que decir
   **«sin deriva»**; falla si sobra o falta un archivo.
3. **Sesión nueva** para que tome los cambios.
4. **Probar** el cambio en el ejemplo de este repo, corriendo el paso del ciclo que tocaste.
5. **Anotar** lo que aprendiste en `lecciones.md`. Eso no es burocracia: es el activo.

**Una instalación desde el marketplace es una copia en caché.** Editar el repo no cambia lo que
carga la sesión hasta que corras `claude plugin update` y reinicies. Por eso existe el paso 2.

## Las verificaciones

Los cinco comandos, y ninguno es opcional antes de un commit al plugin:

```bash
claude plugin validate . --strict                  # el marketplace
claude plugin validate plugin/goharness --strict   # el plugin
node plugin/goharness/checks/lint-workflow-literals.cjs plugin/goharness/workflows/tasks-fanout.js
node plugin/goharness/checks/check-rules-parity.cjs # reglas y tabla del ciclo, sin deriva
bash plugin/goharness/checks/sync-plugin.sh        # tiene que decir "sin deriva"
```

Y antes de publicar, **una instalación real en una carpeta descartable** — es lo único que prueba lo
que va a ver otra persona:

```bash
cd $(mktemp -d)
claude plugin marketplace add rarango10/GoHarness --scope local
claude plugin install goharness@goharness --scope local
claude plugin list --json          # 7 skills, 7 agentes, el workflow y el router
claude plugin uninstall goharness@goharness --scope local
claude plugin marketplace remove goharness --scope local
```

**`check-rules-parity.cjs` cuida una duplicación que no se puede eliminar.** Las reglas del método
viven en el `CLAUDE.md` de este repo y otra vez en `CLAUDE.template.md`, la que `harness-init`
siembra en cualquier proyecto; la tabla del ciclo vive en el router y otra vez en esa plantilla. No
son copias redundantes —una habla de este repo y la otra del proyecto que nace—, pero tienen que
nombrar las mismas reglas y los mismos productores. Arreglar una regla de un solo lado no rompe
nada visible: el próximo proyecto sembrado nace con la versión vieja. El chequeo compara los
títulos en negrita de cada regla y el productor de cada paso, no la prosa, que difiere a propósito.

El linter parece de más y no lo es: `tasks-fanout.js` es casi todo prompts entre backticks, y uno de
más cierra el literal y abre otro. El archivo sigue siendo JavaScript válido y el prompt quedó
destruido. `node --check` no sirve — ese archivo usa `return` de nivel superior, que es como lo
ejecuta el runtime de workflows.

## El backlog

Está en el **índice de estado** al tope de [`lecciones.md`](lecciones.md). Los estados que importan:

- **`listo para aplicar`** — el arreglo ya está redactado en la entrada. Se ejecuta sin volver a
  razonarlo. Es por donde se empieza.
- **`abierto`** — falta decidir el arreglo.
- **`en observación`** — pasó una vez, sin daño; se aplica si se repite.
- **`límite asumido`** — el análisis está cerrado y la conclusión fue no tocar nada. No lo reabras
  sin evidencia nueva.

## Las reglas del mantenedor

- **El repo es la fuente; todo lo demás es una copia.** Si encontrás un archivo en el plugin que no
  existe en el repo, traelo — no lo edites allá.
- **No edites el harness con una corrida del ciclo en vuelo.** Después no se puede distinguir qué
  causó qué.
- **Dos plugins con el mismo nombre no conviven, y el que pierde se apaga en silencio.** Si instalás
  `goharness` desde el marketplace teniendo la copia de desarrollo en `~/.claude/skills/goharness`,
  esta última queda desactivada y solo se ve en `claude plugin list`. Mientras editás, no la
  instales.
- **El plan de un ciclo nuevo va en `docs/AAAA-MM-DD-<nombre>/`.** Los planes viejos no se reabren:
  quedan como registro de lo que se decidió y por qué.
- **En `lecciones.md` no se borra nada.** Una lección que resultó falsa se marca `descartada` con la
  corrección al lado — el error de análisis vale tanto como el hallazgo.

## Publicar una versión

1. Subir `version` en `plugin/goharness/.claude-plugin/plugin.json`.
2. `claude plugin tag` — arma el tag `goharness--v{version}` y valida de paso que el manifiesto y la
   entrada del marketplace coincidan.
3. Push del tag. Del otro lado se actualiza con `claude plugin update goharness@goharness`.
