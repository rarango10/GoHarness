# Design — Dashboard de presupuestos

> Requirements: [`./requirements.md`](./requirements.md)
> Estado: aprobado (2026-09-29)

## Resumen de la solución

Dos subcomandos nuevos en la CLI existente: `presupuesto` carga el monto de una categoría para un
mes, y `dashboard` muestra la comparación del mes. Los presupuestos viven en un segundo archivo
JSON, al lado del de movimientos, y no se toca el formato de este último. Todo el cálculo —validar
una carga, reemplazar un presupuesto, armar las filas del dashboard, decidir alerta y «sin
definir»— son funciones puras. Una capa fina de comandos las orquesta contra un almacén y un reloj
inyectados, así los criterios de consola (mensajes, códigos de salida, «no se guardó nada») se
testean sin disco ni proceso. `cli.ts` solo arma el almacén real, llama al comando e imprime.

## Superficie

- **No navegable** — es una CLI. No hay nada que Playwright pueda abrir, así que `verify-e2e` no
  aplica: la feature salta al paso 8 cuando sus tareas están en `hecho`.

## Arquitectura

| Unidad | Responsabilidad | Depende de | Cubre |
|--------|-----------------|------------|-------|
| `movimientos.ts` (cambio chico) | Exporta `CATEGORIAS`, la lista ordenada de las categorías, y deriva de ella el tipo `Categoria` | — | R1.6, R2.3 |
| `presupuestos.ts` (nuevo, puro) | Tipo `Presupuesto`, `esMes`, `validarPresupuesto` y `cargarPresupuesto` (alta o reemplazo) | `movimientos.ts` | R1.1, R1.4, R1.5, R1.6, R1.7, R2.13 |
| `dashboard.ts` (nuevo, puro) | `calcularDashboard` (movimientos + presupuestos + mes → filas) y `formatearDashboard` (filas → líneas de texto) | `movimientos.ts`, `presupuestos.ts` | R2.1–R2.11, R2.14, R2.15 |
| `comandos.ts` (nuevo) | `comandoPresupuesto` y `comandoDashboard`: parsean argumentos, usan el almacén y el reloj inyectados, y devuelven salida, errores y código | `presupuestos.ts`, `dashboard.ts` | R1.2, R1.8, R2.12, R2.13, R2.14 |
| `almacen.ts` (ampliado) | `leerPresupuestos` y `guardarPresupuestos`, con el mismo mecanismo que los movimientos | `node:fs` | R1.3 |
| `cli.ts` (ampliado) | Despacha `presupuesto` y `dashboard`, imprime el `Resultado` y hace `process.exit(codigo)`. Actualiza el texto de uso | `comandos.ts`, `almacen.ts` | — (cableado) |

## Flujo de datos

**Cargar presupuesto** — `finanzas presupuesto 2026-09 Comida 50000`

1. `cli.ts` arma un `Entorno` con el almacén de archivos y `hoy = () => new Date()`, y llama a
   `comandoPresupuesto(args, entorno)`.
2. `comandoPresupuesto` convierte el monto con `Number(texto)` y llama a `validarPresupuesto`.
3. Si hay errores, devuelve `{ errores, codigo: 1 }` **sin llamar a `guardarPresupuestos`** (R1.8).
4. Si no hay errores, `cargarPresupuesto(almacen.leerPresupuestos(), nuevo)` devuelve la lista con
   el nuevo reemplazando al de la misma categoría y mes, si existía. El comando la guarda y devuelve
   la confirmación con `codigo: 0`.

**Dashboard** — `finanzas dashboard [2026-09]`

1. El mes es el argumento, o `mesDe(entorno.hoy())` si no vino ninguno (R2.12). Si no pasa `esMes`,
   el comando devuelve error con `codigo: 1` (R2.13).
2. `calcularDashboard(leerMovimientos(), leerPresupuestos(), mes)` filtra por mes, suma el gasto
   por categoría y cruza con los presupuestos del mes.
3. Si no hay filas, el comando devuelve `no hay datos para <mes>` con `codigo: 0` (R2.14). Si hay,
   devuelve `formatearDashboard(filas)` con `codigo: 0`.

## Interfaces

**Comandos de CLI**

```
finanzas presupuesto <AAAA-MM> <categoría> <monto>
finanzas dashboard [AAAA-MM]
```

El monto usa punto decimal, igual que en `agregar`. La categoría se escribe exactamente como en
`CATEGORIAS` (`Comida`, `Transporte`, …).

**Funciones puras**

```ts
// movimientos.ts
export const CATEGORIAS = ['Comida', 'Transporte', 'Servicios', 'Ocio', 'Salud', 'Otros'] as const
export type Categoria = (typeof CATEGORIAS)[number]

// presupuestos.ts
export function esMes(texto: string): boolean                // /^\d{4}-(0[1-9]|1[0-2])$/
export function validarPresupuesto(p: { mes: string; categoria: string; monto: number }): string[]
  // errores posibles: 'mes inválido', 'categoría desconocida', 'monto inválido'
export function cargarPresupuesto(existentes: Presupuesto[], nuevo: Presupuesto): Presupuesto[]
  // no muta `existentes`; reemplaza el de igual (mes, categoria) o agrega al final

// dashboard.ts
export function calcularDashboard(movs: Movimiento[], presupuestos: Presupuesto[], mes: string): FilaDashboard[]
export function formatearDashboard(filas: FilaDashboard[]): string[]
export function mesDe(fecha: Date): string                   // 'AAAA-MM' en hora local
```

**Capa de comandos**

```ts
// comandos.ts
export interface Almacen {
  leerMovimientos(): Movimiento[]
  leerPresupuestos(): Presupuesto[]
  guardarPresupuestos(p: Presupuesto[]): void
}
export interface Entorno { almacen: Almacen; hoy: () => Date }
export interface Resultado { salida: string[]; errores: string[]; codigo: 0 | 1 }

export function comandoPresupuesto(args: string[], entorno: Entorno): Resultado
export function comandoDashboard(args: string[], entorno: Entorno): Resultado
```

**Almacén de archivos**

```ts
// almacen.ts — se agregan, con la misma forma que leer/guardar
export function leerPresupuestos(ruta: string): Presupuesto[]   // [] si el archivo no existe
export function guardarPresupuestos(ruta: string, p: Presupuesto[]): void
```

`cli.ts` toma la ruta de `FINANZAS_PRESUPUESTOS`, con default `data/presupuestos.json`, igual que
hace con `FINANZAS_DATOS`.

**Formato de salida del dashboard** (ilustrativo; los tests fijan los marcadores, no el ancho de
las columnas):

```
Categoría      Gastado  Presupuesto      %
Comida        52000.00     50000.00   104%  EXCEDIDO
Transporte     8000.00     10000.00    80%
Ocio           3000.00            —   sin definir
Salud             0.00      5000.00   sin definir
```

## Modelos de datos

```ts
// presupuestos.ts
export interface Presupuesto {
  mes: string          // 'AAAA-MM'
  categoria: Categoria
  monto: number        // > 0, en pesos
}
// Invariante del archivo: a lo sumo un Presupuesto por (mes, categoria). Lo garantiza cargarPresupuesto.

// dashboard.ts
export interface FilaDashboard {
  categoria: Categoria
  gastado: number               // suma de los movimientos del mes; 0 si no hay
  presupuestado: number | null  // null si no hay presupuesto para ese mes
  porcentaje: number | null     // Math.round(gastado / presupuestado * 100); null si sinDefinir
  sinDefinir: boolean           // gastado === 0 || presupuestado === null
  alerta: boolean               // !sinDefinir && centavos(gastado) > centavos(presupuestado)
}
```

Invariantes de `calcularDashboard`:
- Las filas salen en el orden de `CATEGORIAS` (R2.3).
- No hay fila con `gastado === 0` y `presupuestado === null` a la vez (R2.2).
- `sinDefinir` implica `porcentaje === null` y `alerta === false` (R2.10, R2.11, R2.15).

«Tiene gasto» es «tiene al menos un movimiento en el mes». Como `validarMovimiento` exige monto
mayor que 0, eso equivale a `gastado > 0`.

## Manejo de errores

| Situación | Comportamiento | Cubre |
|-----------|----------------|-------|
| `presupuesto` con mes que no pasa `esMes` | stderr `mes inválido`, código 1, no guarda | R1.5, R1.8 |
| `presupuesto` con categoría fuera de `CATEGORIAS` | stderr `categoría desconocida` más la lista válida, código 1, no guarda | R1.6, R1.8 |
| `presupuesto` con monto no numérico, 0, negativo o ausente | stderr `monto inválido`, código 1, no guarda | R1.7, R1.8 |
| Varios de los anteriores a la vez | Se informan todos los errores, uno por línea | R1.5–R1.7 |
| `dashboard` con mes que no pasa `esMes` | stderr `mes inválido`, código 1 | R2.13 |
| `dashboard` de un mes sin gastos ni presupuestos | stdout `no hay datos para AAAA-MM`, código 0 | R2.14 |
| Archivo de presupuestos inexistente | Se trata como lista vacía, igual que el de movimientos | R1.3 |

## Estrategia de testing

Todo con Vitest y sin dependencias nuevas. Los criterios de consola se prueban sobre
`comandoPresupuesto` y `comandoDashboard` con un almacén en memoria y un reloj fijo. La
persistencia se prueba con archivos reales en un directorio temporal. `cli.ts` queda como cableado
sin lógica, y no se prueba lanzando procesos.

| Archivo | Test | Qué verifica | Cubre |
|---------|------|--------------|-------|
| `presupuestos.test.ts` | acepta mes, categoría y monto válidos | `validarPresupuesto` devuelve `[]` | R1.1 |
| `presupuestos.test.ts` | rechaza `2026-9`, `09-2026`, `2026-13` | `esMes` false; `validarPresupuesto` da `mes inválido` | R1.5, R2.13 |
| `presupuestos.test.ts` | rechaza `comida` y `Ropa` | `categoría desconocida` | R1.6 |
| `presupuestos.test.ts` | rechaza `NaN`, 0 y -5 | `monto inválido` | R1.7 |
| `presupuestos.test.ts` | agrega a una lista vacía | la lista resultante tiene el nuevo | R1.1 |
| `presupuestos.test.ts` | reemplaza el de igual mes y categoría | un solo elemento, con el monto nuevo; no muta la entrada | R1.4 |
| `presupuestos.test.ts` | no toca los de otro mes u otra categoría | se conservan | R1.4 |
| `dashboard.test.ts` | una fila por categoría con gasto o presupuesto | categorías esperadas | R2.1 |
| `dashboard.test.ts` | sin fila para categorías sin nada | ausentes | R2.2 |
| `dashboard.test.ts` | datos cargados en desorden | filas en el orden de `CATEGORIAS` | R2.3 |
| `dashboard.test.ts` | suma varios movimientos e ignora los de otro mes | `gastado` correcto | R2.4 |
| `dashboard.test.ts` | categoría con presupuesto | `presupuestado` es su monto | R2.5 |
| `dashboard.test.ts` | gasto en el mes y presupuesto solo en otro mes | `presupuestado` null; sin gasto, la categoría no tiene fila | R2.6 |
| `dashboard.test.ts` | 52000/50000 y 1/3 | `porcentaje` 104 y 33 | R2.7 |
| `dashboard.test.ts` | gastado > presupuestado, incluido 100,40/100 | `alerta` true (porcentaje 100) | R2.8 |
| `dashboard.test.ts` | gastado == presupuestado, incluido 33,33+33,33+33,34 contra 100 | `alerta` false | R2.9 |
| `dashboard.test.ts` | gastado < presupuestado | `alerta` false | R2.9 |
| `dashboard.test.ts` | gasto sin presupuesto | `sinDefinir` true | R2.10 |
| `dashboard.test.ts` | presupuesto sin gasto | `sinDefinir` true, `gastado` 0 | R2.11 |
| `dashboard.test.ts` | gasto sin presupuesto muy alto | `alerta` false, `porcentaje` null | R2.15 |
| `dashboard.test.ts` | `formatearDashboard` | la fila con alerta contiene `EXCEDIDO`; la «sin definir» contiene `sin definir` y no `EXCEDIDO`; hay una línea por fila más el encabezado | R2.5, R2.7, R2.8, R2.10, R2.11, R2.15 |
| `dashboard.test.ts` | `mesDe(new Date(2026, 8, 29))` | `'2026-09'` | R2.12 |
| `comandos.test.ts` | `presupuesto` válido | guarda en el almacén, mensaje de confirmación, código 0 | R1.1, R1.2 |
| `comandos.test.ts` | `presupuesto` inválido (mes, categoría, monto) | código 1, errores en `errores`, `guardarPresupuestos` no se llamó | R1.5–R1.8 |
| `comandos.test.ts` | `dashboard` sin mes, con reloj fijo en 2026-09-29 | muestra el dashboard de 2026-09 | R2.12 |
| `comandos.test.ts` | `dashboard 2026-13` | código 1, `mes inválido` | R2.13 |
| `comandos.test.ts` | `dashboard` de mes vacío (con datos de otro mes) | `no hay datos para 2026-07`, código 0 | R2.14 |
| `almacen.test.ts` | guardar y volver a leer en un directorio temporal | los presupuestos vuelven iguales | R1.3 |
| `almacen.test.ts` | leer sin archivo | `[]` | R1.3 |

No hay JavaScript de cliente ni criterios de efecto: no hace falta DOM de pruebas y ningún
criterio queda «solo e2e».

## Decisiones y alternativas descartadas

| Decisión | Alternativa considerada | Por qué se descartó |
|----------|-------------------------|---------------------|
| Archivo aparte `data/presupuestos.json` | Meter presupuestos y movimientos en un solo JSON `{ movimientos, presupuestos }` | Rompe el formato del archivo existente y obliga a migrar datos reales. |
| Capa `comandos.ts` con almacén y reloj inyectados | Testear la CLI lanzando `node dist/cli.js` | Requiere el build dentro del comando de corrección, que el `CLAUDE.md` excluye. Además es más lento y más frágil. |
| Capa `comandos.ts` con almacén y reloj inyectados | Dejar la lógica de consola en `cli.ts` sin tests | R1.2, R1.8, R2.12–R2.14 quedarían sin cobertura automatizada. |
| Alerta comparando centavos enteros (`Math.round(x * 100)`) | Comparar los `number` directamente | El error de punto flotante hace que 33,33+33,33+33,34 > 100 dé verdadero y alerte, en contra de R2.9. |
| Alerta sobre los montos, porcentaje solo para mostrar | Alertar si `porcentaje > 100` | El redondeo esconde excesos chicos (100,4 % → 100), en contra de R2.8. |
| `esMes` exige mes 01–12 | Solo chequear `\d{4}-\d{2}` | `2026-13` tiene la forma pero no es un mes. Interpretamos «formato AAAA-MM» como «un mes válido». |
| `CATEGORIAS` como constante de la que se deriva el tipo | Mantener solo la unión de tipos y duplicar la lista | Una sola fuente para validar (R1.6) y ordenar (R2.3). |
| Sin dependencias nuevas | Una librería de tablas para la consola | `padStart` / `padEnd` alcanzan, y el `CLAUDE.md` pide no sumar dependencias sin necesidad. |

## Riesgos y preguntas abiertas

- `mesDe` usa hora local: cerca de la medianoche del último día del mes, el «mes actual» depende de
  la zona horaria de la máquina. Para un uso personal y local es lo esperado.
- `leer` de movimientos no valida el JSON. Si el archivo de presupuestos se edita a mano y queda
  mal formado, el comando falla con la excepción de `JSON.parse`. Es el mismo comportamiento que
  hoy tienen los movimientos, y queda fuera de alcance.

## Enmiendas
