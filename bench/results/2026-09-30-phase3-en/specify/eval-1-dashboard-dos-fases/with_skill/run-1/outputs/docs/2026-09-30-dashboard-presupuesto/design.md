# Design — Dashboard de presupuesto por categoría

> Requirements: [`./requirements.md`](./requirements.md)
> Estado: aprobado (2026-09-30)

## Resumen de la solución

Dos comandos nuevos en la CLI: `finanzas presupuesto <categoría> <monto>` guarda el presupuesto en
un JSON aparte, `presupuestos.json`, en la misma carpeta que `movimientos.json`. `finanzas dashboard [AAAA-MM]` lee
movimientos y presupuestos, arma las filas con una **función pura** (`calcularDashboard`), las
convierte en líneas de texto con otra función pura (`formatearDashboard`) y recién ahí imprime. La
orquestación de cada comando (leer, validar, calcular, guardar o imprimir y decidir el código de
salida) va en `src/comandos.ts` y recibe su contexto inyectado: rutas, fecha de hoy y funciones de
salida. Así los criterios de persistencia, código de salida y mes actual se prueban sin levantar un
proceso ni depender del reloj. `cli.ts` queda como un cableado fino.

## Superficie

- **No navegable** — es una CLI. No hay nada que Playwright pueda abrir, y `verify-e2e` no aplica:
  la feature termina en el paso 8 en cuanto sus tareas estén en `hecho`.

## Arquitectura

| Unidad | Responsabilidad | Depende de | Cubre |
|--------|-----------------|------------|-------|
| `src/movimientos.ts` (cambio) | Agrega la lista en tiempo de ejecución `CATEGORIAS` y deriva de ella el tipo `Categoria`, que hoy es solo un tipo | — | R1.3 |
| `src/presupuestos.ts` (nuevo, puro) | Validar un pedido de presupuesto y devolver los presupuestos con el nuevo aplicado | `movimientos.ts` | R1.2, R1.3, R1.4 |
| `src/dashboard.ts` (nuevo, puro) | Calcular las filas del mes, validar el mes, obtener el mes de una fecha y formatear las filas como líneas | `movimientos.ts` | R2.1–R2.9, R3.1–R3.5, R4.1, R4.2 |
| `src/almacen.ts` (cambio) | Leer y guardar `presupuestos.json` | `node:fs` | R1.1 |
| `src/comandos.ts` (nuevo) | Orquestar `presupuesto` y `dashboard`: leer, validar, calcular, escribir la salida y devolver el código de salida | los cuatro de arriba | R1.1, R1.5, R4.1, R4.3 |
| `src/cli.ts` (cambio) | Despachar los comandos nuevos con el contexto real (`process.env`, `new Date()`, `console`), fijar `process.exitCode` y actualizar el texto de uso | `comandos.ts` | — |

`agregar` y `listar` no cambian.

## Flujo de datos

**`finanzas presupuesto <categoría> <monto>`**

1. `cli.ts` arma el contexto y llama a `comandoPresupuesto(args, ctx)`.
2. `validarPresupuesto(categoria, Number(monto))` devuelve la lista de errores. Si no está vacía,
   se escribe cada error por `ctx.error`, no se toca el disco y se devuelve 1 (R1.3, R1.4, R1.5).
3. Si no hay errores: `leerPresupuestos` → `fijarPresupuesto` → `guardarPresupuestos`. Se escribe
   «Presupuesto guardado.» y se devuelve 0 (R1.1, R1.2).

**`finanzas dashboard [AAAA-MM]`**

1. `cli.ts` arma el contexto y llama a `comandoDashboard(args, ctx)`.
2. El mes es `args[0]` o, si no viene, `mesDe(ctx.hoy)` (R4.1).
3. Si `!mesValido(mes)`: se escribe el error por `ctx.error` y se devuelve 1 (R4.2, R4.3).
4. `leer(rutaMovimientos)` y `leerPresupuestos(rutaPresupuestos)`.
5. `calcularDashboard(movs, presupuestos, mes)` devuelve las filas `FilaDashboard[]`.
6. `formatearDashboard(mes, filas)` devuelve las líneas. Se escribe cada una por `ctx.salida` y se
   devuelve 0.

## Interfaces

```ts
// src/movimientos.ts
export const CATEGORIAS = ['Comida', 'Transporte', 'Servicios', 'Ocio', 'Salud', 'Otros'] as const
export type Categoria = (typeof CATEGORIAS)[number]

// src/presupuestos.ts
export function validarPresupuesto(categoria: string | undefined, monto: number): string[]
//   'categoría desconocida' si no está en CATEGORIAS; 'monto inválido' si !isFinite o <= 0.
export function fijarPresupuesto(p: Presupuestos, categoria: Categoria, monto: number): Presupuestos
//   devuelve un objeto nuevo, no muta el recibido.

// src/dashboard.ts
export function mesValido(mes: string): boolean          // /^\d{4}-(0[1-9]|1[0-2])$/
export function mesDe(fecha: Date): string               // AAAA-MM en hora local
export function calcularDashboard(movs: Movimiento[], presupuestos: Presupuestos, mes: string): FilaDashboard[]
export function formatearDashboard(mes: string, filas: FilaDashboard[]): string[]

// src/almacen.ts
export function leerPresupuestos(ruta: string): Presupuestos       // {} si el archivo no existe
export function guardarPresupuestos(ruta: string, p: Presupuestos): void

// src/comandos.ts
export interface Contexto {
  rutaMovimientos: string
  rutaPresupuestos: string
  hoy: Date
  salida: (linea: string) => void
  error: (linea: string) => void
}
export function comandoPresupuesto(args: string[], ctx: Contexto): number  // código de salida
export function comandoDashboard(args: string[], ctx: Contexto): number
```

**CLI:**
- `finanzas presupuesto <categoría> <monto>`
- `finanzas dashboard [AAAA-MM]`

`rutaPresupuestos` es `join(dirname(RUTA), 'presupuestos.json')`, donde `RUTA` es la ruta de
movimientos que ya existe (`FINANZAS_DATOS` o `data/movimientos.json`).

**Formato de salida** (columnas con `padEnd`/`padStart`, como hace hoy `listar`):

```
Dashboard 2026-09
Categoría      Gastado  Presupuesto      % usado
Comida        62000.00     50000.00         124%  ⚠ excedido
Ocio              0.00     10000.00  sin definir
Servicios     15000.00     20000.00          75%
Transporte     8000.00            —  sin definir
```

Un mes sin filas muestra solo las dos líneas de encabezado. No quedan
espacios al final de ninguna línea.

## Modelos de datos

```ts
// src/presupuestos.ts
export type Presupuestos = Partial<Record<Categoria, number>>
// Invariante: todo valor es finito y > 0 (lo garantiza validarPresupuesto antes de guardar).

// src/dashboard.ts
export interface FilaDashboard {
  categoria: string          // string y no Categoria: `agregar` hoy acepta cualquier texto
  gastado: number            // suma de los montos del mes; 0 si no hay movimientos
  presupuesto: number | null // null = sin presupuesto definido
  porcentaje: number | null  // null = «sin definir»; si no, Math.round(gastado / presupuesto * 100)
  alerta: boolean            // presupuesto !== null && gastado > presupuesto
}
```

Reglas de `calcularDashboard`:
- **Cuándo una categoría «tiene gasto»:** tiene al menos un movimiento del mes. El mes se filtra con
  el `delMes` que ya existe.
- **Qué categorías entran:** la unión de las que tienen gasto y las que tienen presupuesto (R2.1).
  Ninguna otra entra (R2.2).
- **`porcentaje`:** es `null` cuando falta presupuesto o falta gasto (R3.1, R3.3). En cualquier otro
  caso se calcula con redondeo (R2.5).
- **`alerta`:** no mira el % redondeado, compara los montos (R2.6, R2.7). Como un presupuesto
  siempre es > 0, una fila sin gasto nunca tiene alerta, y una sin presupuesto tampoco (R3.5).
- **Orden:** `a.categoria.localeCompare(b.categoria, 'es')` (R2.8).

`presupuestos.json` es un objeto `{ "Comida": 50000, "Ocio": 10000 }`.

## Manejo de errores

| Situación | Comportamiento | Cubre |
|-----------|----------------|-------|
| Categoría ausente o fuera de `CATEGORIAS` | Escribe `categoría desconocida` por stderr, no escribe el archivo y devuelve 1 | R1.3, R1.5 |
| Monto ausente, no numérico, 0 o negativo | Escribe `monto inválido` por stderr, no escribe el archivo y devuelve 1 | R1.4, R1.5 |
| Mes que no cumple `AAAA-MM` con mes 01–12 | Escribe `mes inválido: <valor> (se espera AAAA-MM)` por stderr, no imprime el dashboard y devuelve 1 | R4.2, R4.3 |
| No existe `presupuestos.json` | Se toma como `{}`: todas las categorías con gasto salen «sin definir» | R2.1, R3.1 |
| No existe `movimientos.json` | Lo mismo que hace hoy `leer`: `[]` | R2.1 |

Un JSON corrupto no está en ningún criterio. Se comporta como hoy con `movimientos.json`: la
excepción de `JSON.parse` sube y corta el proceso.

## Estrategia de testing

Todo con Vitest. No hay JavaScript de cliente: todos los criterios son de estado, así que no hace
falta DOM de pruebas y ningún criterio queda «solo e2e».

Las funciones puras se prueban directo. Los criterios de persistencia, código de salida y mes
actual se prueban llamando a `comandoPresupuesto` / `comandoDashboard` con un `Contexto` de prueba:
rutas en un directorio temporal (`mkdtempSync(os.tmpdir())`), un `hoy` fijo y `salida`/`error`
que juntan las líneas en arrays. No hay subproceso, ni build previo, ni dependencias nuevas.

| Test | Qué verifica | Cubre |
|------|--------------|-------|
| `comandoPresupuesto` válido, después `leerPresupuestos` del mismo archivo | El monto quedó guardado en disco | R1.1 |
| `fijarPresupuesto` sobre una categoría que ya tiene uno | Devuelve el monto nuevo y no muta el original | R1.2 |
| `validarPresupuesto('Viajes', 100)` y con categoría `undefined` | Contiene `categoría desconocida` | R1.3 |
| `comandoPresupuesto` con categoría desconocida sobre un archivo existente | El contenido del archivo no cambió | R1.3 |
| `validarPresupuesto('Comida', x)` con x = 0, -5, NaN | Contiene `monto inválido` | R1.4 |
| `comandoPresupuesto` con monto inválido sobre un archivo existente | El contenido del archivo no cambió | R1.4 |
| `comandoPresupuesto` con categoría inválida y con monto inválido | Devuelve 1 | R1.5 |
| `calcularDashboard` con gasto en A, presupuesto en B y nada en C | Filas A y B | R2.1 |
| Ídem | C no aparece | R2.2 |
| Movimientos del mes y de otros meses en la misma categoría | `gastado` suma solo los del mes | R2.3 |
| Mismo presupuesto consultado en dos meses distintos | `presupuesto` es igual en los dos | R2.4 |
| Gastado 62000, presupuesto 50000; y 1 sobre 3 | `porcentaje` 124 y 33 | R2.5 |
| Gastado 50001, presupuesto 50000 | `alerta` true | R2.6 |
| Gastado igual al presupuesto, y menor | `alerta` false | R2.7 |
| Categorías cargadas desordenadas | Filas en orden alfabético | R2.8 |
| `formatearDashboard` con gastado 1234.5 y presupuesto 2000 | La línea contiene `1234.50` y `2000.00` | R2.9 |
| Gasto sin presupuesto | `porcentaje` null; la línea formateada dice `sin definir` | R3.1 |
| `formatearDashboard` de una fila sin presupuesto | La columna presupuestado dice `—` | R3.2 |
| Presupuesto sin gasto | `porcentaje` null; la línea formateada dice `sin definir` | R3.3 |
| Presupuesto sin gasto | `gastado` 0 y la línea dice `0.00` | R3.4 |
| Filas «sin definir» de los dos tipos | `alerta` false; la línea no dice `excedido` | R3.5 |
| `comandoDashboard([], ctx)` con `hoy` = 2026-09-15 y datos en 2026-09 y 2026-08 | La salida es la de 2026-09; además `mesDe(new Date(2026, 8, 30, 23, 59))` es `2026-09` | R4.1 |
| `mesValido` con `2026-13`, `2026-9`, `09-2026`, `abc`; `comandoDashboard(['2026-13'])` | false; el error se escribe y no se escribe ninguna salida | R4.2 |
| `comandoDashboard(['2026-13'])` | Devuelve 1 | R4.3 |

Casos borde sin criterio propio, que igual conviene cubrir:
- Un movimiento con una categoría que no está en `CATEGORIAS` (`agregar` la acepta) aparece como
  fila «sin definir».
- Un mes sin datos devuelve `[]` y el formateo deja solo el encabezado.
- 100,4% se muestra como «100%» y tiene alerta: es lo que dicen R2.5 y R2.6 juntos.

## Decisiones y alternativas descartadas

| Decisión | Alternativa considerada | Por qué se descartó |
|----------|-------------------------|---------------------|
| `presupuestos.json` aparte, en la carpeta de movimientos | Guardar los presupuestos dentro de `movimientos.json` | Cambia el formato de un archivo con datos reales y rompe `leer`, que espera un array |
| Ruta derivada de la carpeta de `FINANZAS_DATOS` | Una variable de entorno nueva `FINANZAS_PRESUPUESTOS` | Con la variable existente alcanza. Una segunda es otra cosa que configurar sin necesidad (YAGNI) |
| Objeto `{ categoría: monto }` | Array de `{ categoria, monto }` | Con el objeto, el reemplazo de R1.2 es una asignación y no hay duplicados posibles |
| `porcentaje: null` en la fila; el texto «sin definir» lo pone el formateo | Poner el string `'sin definir'` dentro del cálculo | Mezcla presentación con cálculo, y la regla del proyecto pide separarlos |
| `formatearDashboard` como función pura aparte de la impresión | Formatear directo en `cli.ts` con `console.log` | R2.9 y R3.2 no se podrían probar sin capturar la consola |
| `comandos.ts` con `Contexto` inyectado | Probar la CLI en un subproceso sobre `dist/` o con `tsx` | Con `dist/`, los tests dependen de un build previo. Con `tsx`, es una dependencia nueva. Con `hoy` inyectado, R4.1 es determinístico |
| La alerta compara los montos | Alerta si el % redondeado es > 100 | R2.6 habla de montos. Con el redondeo, 100,4% no tendría alerta aunque se haya pasado |
| `mesDe` con hora local (`getFullYear`/`getMonth`) | `toISOString().slice(0, 7)` | Usa UTC: el último día del mes a la noche, en Argentina, daría el mes siguiente |
| No refactorizar `agregar`/`listar` a `comandos.ts` | Mover todo al patrón nuevo | Está fuera del alcance. Queda como candidato al backlog si molesta la asimetría |

## Riesgos y preguntas abiertas

- El cambio de `Categoria` a un tipo derivado de `CATEGORIAS` tiene que dejar compilando el código
  existente sin tocarlo. Lo comprueba `npm run typecheck` en la primera tarea que lo haga.
- «—» (raya, U+2014) en una terminal sin UTF-8 podría verse mal. Se acepta: el uso es personal y
  la terminal actual lo soporta.

## Enmiendas
