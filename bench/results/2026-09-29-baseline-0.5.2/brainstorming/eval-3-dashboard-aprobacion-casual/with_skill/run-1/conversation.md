## Usuario

Quiero que la app tenga un dashboard donde vea cuánto llevo gastado por categoría este mes comparado con mi presupuesto.

## Asistente

- `Skill: {"skill": "goharness:brainstorming", "args": "Dashboard: cuánto llevo gastado por categoría este mes comparado con mi presupuesto"}`
- `Bash: {"command": "git ls-files | grep -v node_modules && cat package.json && cat docs/pendientes.md 2>/dev/null; ls docs", "description": "List project files, package.json and backlog"}`
- `Bash: {"command": "cat src/*.ts test/*.ts", "description": "Show source and test files"}`

Revisé el repo antes de preguntarte nada. Esto es lo que hay:

- **Finanzas es solo una CLI**, con dos comandos: `agregar` y `listar [AAAA-MM]`. Los datos viven en `data/movimientos.json`.
- **Las categorías son fijas**: Comida, Transporte, Servicios, Ocio, Salud y Otros.
- **Todavía no existe el concepto de presupuesto.** No hay dónde guardarlo ni cómo cargarlo, así que hay que diseñar esa parte desde cero.
- **No hay backlog** (`docs/pendientes.md` no existe), así que no hay nada pendiente que pise esta idea.

La primera decisión es qué entendés por «dashboard», porque cambia bastante la feature:

1. **Un comando nuevo en la terminal**, por ejemplo `finanzas resumen`. Imprime una tabla por categoría con lo gastado, el presupuesto, lo que queda y quizás una barra de texto (`████░░ 68%`). No suma dependencias ni interfaz, y sigue el estilo de lo que ya existe.
2. **Una página web local**, por ejemplo `finanzas dashboard` levanta un servidor o genera un HTML que abrís en el navegador, con gráficos. Es más vistoso, pero es la primera interfaz del proyecto: suma servidor o build, probablemente dependencias, y los tests e2e con Playwright (el paso 7).

Te recomiendo la **1**: responde lo que pediste (lo gastado por categoría contra el presupuesto de este mes) con el menor costo, y la opción 2 siempre se puede agregar después sobre los mismos cálculos. Esta recomendación es mía, no algo que hayas pedido.

¿Cuál preferís? Después te pregunto cómo querés definir y cargar los presupuestos.

## Usuario

Prefiero la 1, un comando nuevo en la terminal.

## Asistente

Listo: un comando nuevo en la terminal.

Ahora, **¿cómo se cargan los presupuestos?**

1. **Con un comando**, por ejemplo `finanzas presupuesto Comida 80000`. Se guarda en un archivo aparte (`data/presupuestos.json`), valida la categoría y el monto igual que `agregar`, y si repetís el comando para una categoría ya cargada, reemplaza el monto.
2. **Editando el JSON a mano.** No hace falta un comando nuevo, pero un error de tipeo recién aparece cuando corrés el resumen, y el comando tendría que validar el archivo al leerlo.

Te recomiendo la **1**: sigue el patrón de `agregar` y los errores aparecen en el momento de cargar.

## Usuario

Prefiero la 1, con un comando para cargar los presupuestos.

## Asistente

Hecho: los presupuestos se cargan con `finanzas presupuesto <categoría> <monto>`.

La siguiente pregunta es **si el presupuesto es el mismo todos los meses o cambia de un mes a otro**:

1. **Fijo**: `finanzas presupuesto Comida 80000` vale para todos los meses hasta que lo cambies. Es simple y alcanza para «este mes contra mi presupuesto». La contra es que, si mirás un mes pasado, se compara con el presupuesto de hoy.
2. **Por mes**: `finanzas presupuesto 2026-09 Comida 80000`. Cada mes tiene sus propios montos, y un mes sin cargar queda sin presupuesto (o hereda del anterior, que sería otra decisión más).

Te recomiendo la **1**: pediste ver *este mes*, y el presupuesto por mes suma carga y reglas que por ahora no necesitás.

## Usuario

Prefiero la 1, fijo para todos los meses.

## Asistente

Anotado: el presupuesto es fijo y vale para todos los meses.

Quedaban algunas decisiones chicas de comportamiento. En vez de preguntarte una por una, las resolví en el diseño y las marqué para que las revises. Esta es la propuesta completa:

## Diseño: resumen de gastos contra presupuesto

**Comandos nuevos**

- **`finanzas presupuesto <categoría> <monto>`** (lo pediste vos). Guarda el presupuesto en `data/presupuestos.json`, que es un mapa de categoría a monto. Si la categoría ya tenía presupuesto, lo reemplaza. Da error si la categoría no es una de las seis o si el monto no es un número mayor que 0.
- **`finanzas resumen [AAAA-MM]`**. Sin argumento muestra el mes en curso, porque pediste ver «este mes». El argumento opcional para mirar otro mes lo agregué yo, porque sale casi gratis con `delMes`. Decime si lo querés.

**Qué muestra el resumen**

Una fila por categoría con: gastado, presupuesto, lo que queda, el porcentaje y una barra de texto. Al final, una fila de total.

```
Categoría     Gastado   Presupuesto    Restante    %
Comida       54400.00      80000.00    25600.00   68%  ██████░░░░
Ocio         32000.00      25000.00    -7000.00  128%  ██████████ EXCEDIDO
Salud         3000.00             —           —    —
Total        89400.00     105000.00    15600.00   85%
```

**Casos borde**

Todos estos los decidí yo, así que decime si alguno no te sirve:

- **Una categoría con gasto pero sin presupuesto** aparece con «—» en presupuesto, restante y porcentaje. El total de presupuesto suma solo las categorías que tienen uno.
- **Una categoría con presupuesto y sin gastos** aparece en 0 %.
- **Una categoría sin gasto y sin presupuesto** no aparece.
- **Si te pasás del presupuesto**, el restante sale negativo, la barra se corta al 100 % y se agrega la marca «EXCEDIDO».
- **Un mes sin movimientos ni presupuestos** muestra un mensaje en lugar de una tabla vacía.

**Supuestos**

Nadie los decidió todavía; los completé yo:

- **No hay forma de borrar un presupuesto.** Para dejarlo sin efecto, habría que agregarla aparte.
- **Un archivo de presupuestos malformado** se trata igual que hoy se trata el de movimientos, sin validar al leerlo. Lo supuse así para mantener la coherencia con lo que ya existe.

**Cómo se arma**

Siguiendo la regla del proyecto, los cálculos van en funciones puras dentro de un módulo nuevo, `src/presupuesto.ts`:

- `validarPresupuesto`
- `resumenDelMes(movs, presupuestos, mes)`, que devuelve filas y total, no texto.

El formateo de la tabla va en otra función pura, y `almacen.ts` suma la lectura y el guardado de presupuestos. Los tests unitarios con Vitest cubren los cálculos, los casos borde y el formato.

Como no hay interfaz navegable, el paso 7 (e2e) no aplica. Tampoco hacen falta dependencias nuevas.

**Algo que noté y queda afuera:** hoy `agregar` no valida la categoría. `finanzas agregar ... Comidaa` guarda «Comidaa» sin avisar. Propongo registrarlo en `docs/pendientes.md` en vez de arreglarlo acá.

---

**¿Aprobás este diseño?** Si decís que sí, el paso siguiente es el skill **`specify`**, que lo convierte en `requirements.md` con criterios de aceptación numerados, bajo `docs/2026-09-29-<feature>/`. No lo arranco hasta que me lo pidas.

## Usuario

dale, me gusta, arranca con eso

## Asistente

- `Skill: {"skill": "goharness:specify", "args": "Feature: resumen de gastos por categoría contra presupuesto (diseño aprobado en brainstorming, 2026-09-29)"}`
- `Bash: {"command": "cd ~/dev/GoHarness/plugin/goharness/skills/specify && cat assets/requirements-template.md references/ears-patterns.md", "description": "Read requirements templ`
- `Read: {"file_path": "~/dev/GoHarness/plugin/goharness/skills/specify/assets/requirements-template.md"}`
- `Read: {"file_path": "~/dev/GoHarness/plugin/goharness/skills/specify/references/ears-patterns.md"}`
- `Write: {"file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-ts5ij93p/finanzas/docs/2026-09-29-resumen-presupuesto/requirements.md", "content": "# Requirements — Resumen de `
- `Write: {"file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-ts5ij93p/finanzas/docs/pendientes.md", "content": "# Pendientes\n\n| Id | Estado | Origen | Descripción |\n|----`
- `Edit: {"replace_all": false, "file_path": "/private/var/folders/nf/pn_wl51x55dbxmwfqn07tjm40000gn/T/goharness-bench-ts5ij93p/finanzas/docs/2026-09-29-resumen-presupuesto/requirements.md", "old_string": "- U`

Tomé tu «dale» como aprobación del diseño y como pedido de arrancar el spec. Escribí la fase 1: está en `docs/2026-09-29-resumen-presupuesto/requirements.md` y queda pendiente de tu aprobación. Todavía no commiteé nada.

No pude leer la plantilla ni la guía EARS del skill, porque están fuera del directorio del proyecto y el permiso de lectura no se concedió. Seguí la estructura que describe el propio skill; si querés que el archivo calce exacto con la plantilla, dame acceso a esa carpeta.

**Requisitos (37 criterios en total):**
- **R1: Cargar un presupuesto.** Guarda y reemplaza el monto sin tocar las otras categorías, rechaza una categoría o un monto inválidos, y el presupuesto se conserva entre ejecuciones.
- **R2: Elegir el mes.** Sin argumento resume el mes en curso, con `AAAA-MM` resume ese mes, y un formato inválido da error.
- **R3: Contenido por categoría.** Gastado, presupuesto, restante, porcentaje y barra. Una categoría sin presupuesto muestra «—», una sin gasto muestra 0 %, las que no tienen ni gasto ni presupuesto se omiten, y el orden de las filas es fijo.
- **R4: Presupuesto excedido.** El restante sale negativo, la barra se corta en 10 caracteres y la fila lleva la marca «EXCEDIDO».
- **R5: Fila de total.** Suma lo gastado y los presupuestos cargados; si ninguna categoría tiene presupuesto, esas columnas muestran «—».
- **R6: Mes vacío.** Muestra un mensaje en lugar de una tabla vacía.

Dividí los criterios que tenían «y» para que cada uno verifique una sola cosa.

**Supuestos que agregué yo** (no salieron de la charla):
- Los montos se muestran con 2 decimales, como en `listar`.
- El porcentaje se redondea al entero.
- Cada carácter de la barra vale 10 %.
- Un error de uso termina con código de salida distinto de 0.
- El mes en curso sale de la fecha local de la compu.
- Un gasto guardado con una categoría mal escrita no aparece en el resumen ni suma al total. Hoy eso puede pasar porque `agregar` no valida la categoría.

**Backlog:** creé `docs/pendientes.md` con **P1**, que es justamente eso de que `agregar` no valida la categoría. Queda fuera de esta feature, como acordamos.

**¿Aprobás los requirements?** Si decís que sí, marco el archivo como aprobado, lo commiteo junto con el backlog y paso a la fase 2: escribir `design.md` (módulos, funciones, dónde se guardan los datos y qué test cubre cada criterio). Ese documento también espera tu aprobación antes de seguir.
