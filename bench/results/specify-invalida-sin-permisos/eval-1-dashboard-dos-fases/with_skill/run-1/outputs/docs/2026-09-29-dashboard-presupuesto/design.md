# Design — Dashboard de presupuesto

> Estado: aprobado (2026-09-29)

Requisitos: [`requirements.md`](requirements.md) (R1–R3).

## Resumen

Tres capas, siguiendo la regla de `CLAUDE.md` de separar cálculo, archivos y consola:

1. **Funciones puras** que validan el JSON de presupuestos, calculan las filas del dashboard, las
   formatean como líneas de texto y validan el mes.
2. **Un orquestador del comando** (`comandoDashboard`) que recibe todo lo externo inyectado —
   movimientos, resultado de leer el archivo de presupuestos, fecha de hoy— y devuelve líneas,
   errores y código de salida. No toca disco ni consola, así que los criterios de código de salida
   se testean sin levantar un proceso.
3. **`cli.ts`**, que solo lee archivos, llama al orquestador, imprime y hace `process.exit`.

No hay superficie navegable: es una CLI. La feature salta el paso 7 (`verify-e2e`) y va del último
`hecho` al paso 8.

## Arquitectura

```
cli.ts ──lee──▶ almacen.ts (leer movimientos, leerPresupuestos)
   │
   └──▶ dashboard-comando.ts: comandoDashboard(args, deps)
            ├─ fechas.ts:       esMesValido, mesActual
            ├─ presupuestos.ts: validarPresupuestos
            └─ dashboard.ts:    calcularDashboard, formatearDashboard
```

| Archivo | Nuevo / cambia | Qué hace | Criterios |
|---|---|---|---|
| `src/movimientos.ts` | cambia | exporta `CATEGORIAS` (lista ordenada) y deriva `Categoria` de ella | R1.5, orden de filas |
| `src/presupuestos.ts` | nuevo | `validarPresupuestos(datos: unknown)` — puro | R1.4, R1.5, R1.7 |
| `src/dashboard.ts` | nuevo | `calcularDashboard`, `formatearDashboard` — puros | R2.*, R3.1, R3.3–R3.5, R3.8 |
| `src/fechas.ts` | nuevo | `esMesValido`, `mesActual` — puros | R3.2, R3.6 |
| `src/dashboard-comando.ts` | nuevo | `comandoDashboard` — orquesta, sin E/S | R1.6, R3.2, R3.6, R3.7 |
| `src/almacen.ts` | cambia | suma `leerPresupuestos(ruta)` | R1.2, R1.3 |
| `src/cli.ts` | cambia | rama `dashboard` y línea de uso | cableado |

## Interfaces

### `src/movimientos.ts`

```ts
export const CATEGORIAS = ['Comida', 'Transporte', 'Servicios', 'Ocio', 'Salud', 'Otros'] as const
export type Categoria = (typeof CATEGORIAS)[number]
```

El tipo queda idéntico al actual. Solo pasa a existir también como valor, para validar nombres
(R1.5) y ordenar filas.

### `src/presupuestos.ts`

```ts
export type Presupuestos = Partial<Record<Categoria, number>>

export type ResultadoPresupuestos =
  | { ok: true; presupuestos: Presupuestos }
  | { ok: false; errores: string[] }

export function validarPresupuestos(datos: unknown, ruta: string): ResultadoPresupuestos
```

- Si `datos` no es un objeto plano (es `null`, un array o un primitivo), devuelve
  `presupuesto inválido en <ruta>: se espera un objeto { "Categoría": monto }` (R1.7).
- Por cada clave que no está en `CATEGORIAS`: `categoría desconocida en presupuestos: <clave>` (R1.5).
- Por cada valor que no es `number` finito mayor que 0: `presupuesto inválido para <clave>` (R1.4).
- Junta todos los errores de clave y valor en vez de cortar en el primero, igual que
  `validarMovimiento`.

### `src/dashboard.ts`

```ts
export interface FilaDashboard {
  categoria: Categoria
  gastado: number            // suma del mes, 0 si no hubo gasto
  presupuesto: number | null // null = sin presupuesto
  porcentaje: number | null  // entero; null si presupuesto es null
  excedido: boolean
  sinDefinir: boolean
}

export function calcularDashboard(movs: Movimiento[], presupuestos: Presupuestos, mes: string): FilaDashboard[]
export function formatearDashboard(filas: FilaDashboard[], mes: string): string[]
```

`calcularDashboard`:
- Filtra por mes reusando `delMes` y suma por categoría (R2.1).
- Recorre `CATEGORIAS` en orden y omite las que no tienen gasto ni presupuesto (R2.7).
- `porcentaje = Math.round(gastado / presupuesto * 100)` (R2.2).
- `excedido` se decide **en centavos enteros**: `Math.round(gastado*100) > Math.round(presupuesto*100)`
  (R2.3, R2.4). Así una suma como 0,1 + 0,2 no «supera» un presupuesto de 0,3 por error de punto
  flotante.
- `sinDefinir = (gastado === 0) !== (presupuesto === null)`: hay una de las dos cosas y no la otra
  (R2.5, R2.6).

`formatearDashboard` devuelve las líneas de la tabla:

```
Dashboard 2026-09
Categoría       Gastado  Presupuesto  Usado
Comida         85000.00     80000.00   106%  ⚠ excedido
Transporte     12000.00     20000.00    60%
Ocio            3000.00            —      —  sin definir
Salud              0.00     10000.00     0%  sin definir
```

- Montos con `toFixed(2)` y alineados con `padStart`, como `listar`.
- «—» en presupuestado y en % cuando `presupuesto === null` (R3.3, R3.4).
- La marca va al final de la fila: `⚠ excedido` o `sin definir` (R3.5).
- Sin filas, devuelve una sola línea: `Sin datos para 2026-09.` (R3.8).

### `src/fechas.ts`

```ts
export function esMesValido(mes: string): boolean  // /^\d{4}-(0[1-9]|1[0-2])$/
export function mesActual(hoy: Date): string       // AAAA-MM con getFullYear/getMonth locales
```

### `src/dashboard-comando.ts`

```ts
export type LecturaPresupuestos = { ok: true; datos: unknown } | { ok: false; error: string }

export interface DepsDashboard {
  movimientos: Movimiento[]
  presupuestos: LecturaPresupuestos
  hoy: Date
}

export interface SalidaComando { lineas: string[]; errores: string[]; codigo: number }

export function comandoDashboard(args: string[], deps: DepsDashboard): SalidaComando
```

El flujo va en este orden y corta en el primer error:

1. Toma `mes = args[0] ?? mesActual(deps.hoy)` (R3.2).
2. Si el mes no es válido, devuelve `Mes inválido: <mes>. Formato esperado: AAAA-MM` con código 1
   (R3.6, R3.7).
3. Si falló la lectura de presupuestos, devuelve ese error con código 1 (R1.3, R1.6).
4. Si falló la validación de presupuestos, devuelve esos errores con código 1 (R1.4, R1.5, R1.7,
   R1.6).
5. Si todo está bien, devuelve `formatearDashboard(calcularDashboard(...))` con código 0.

### `src/almacen.ts`

```ts
export function leerPresupuestos(ruta: string): LecturaPresupuestos
```

- Si el archivo no existe, devuelve `{ ok: true, datos: {} }` (R1.2).
- Si `JSON.parse` falla, devuelve `{ ok: false, error: 'presupuestos: <ruta> no es JSON válido' }`
  (R1.3).
- Si no, devuelve `{ ok: true, datos }` sin validar la forma: eso lo hace `validarPresupuestos`.

### `src/cli.ts`

```ts
const RUTA_PRESUPUESTOS = process.env.FINANZAS_PRESUPUESTOS ?? 'data/presupuestos.json'
// comando === 'dashboard':
const r = comandoDashboard(args, { movimientos: leer(RUTA), presupuestos: leerPresupuestos(RUTA_PRESUPUESTOS), hoy: new Date() })
r.lineas.forEach((l) => console.log(l)); r.errores.forEach((e) => console.error(e)); process.exit(r.codigo)
```

La línea de uso suma `finanzas dashboard [AAAA-MM]`.

## Modelo de datos

`data/presupuestos.json` va junto a `data/movimientos.json`. `data/` ya está en `.gitignore`: son
datos personales. La ruta se puede cambiar con la variable de entorno `FINANZAS_PRESUPUESTOS`,
igual que `FINANZAS_DATOS`. El archivo se edita a mano:

```json
{ "Comida": 80000, "Transporte": 20000, "Salud": 10000 }
```

Las categorías que no aparecen no tienen presupuesto. El archivo no cambia de forma según el mes,
porque el presupuesto es fijo (R1.1).

## Errores

| Situación | Mensaje (stderr) | Código | Criterio |
|---|---|---|---|
| Mes con formato inválido | `Mes inválido: <mes>. Formato esperado: AAAA-MM` | 1 | R3.6, R3.7 |
| Archivo de presupuestos no es JSON | `presupuestos: <ruta> no es JSON válido` | 1 | R1.3, R1.6 |
| JSON que no es objeto | `presupuesto inválido en <ruta>: se espera un objeto { "Categoría": monto }` | 1 | R1.7, R1.6 |
| Categoría desconocida | `categoría desconocida en presupuestos: <clave>` | 1 | R1.5, R1.6 |
| Monto no positivo o no numérico | `presupuesto inválido para <clave>` | 1 | R1.4, R1.6 |
| Archivo de presupuestos ausente | — (no es error) | 0 | R1.2 |
| Mes sin datos | stdout: `Sin datos para <mes>.` | 0 | R3.8 |

Si `movimientos.json` está corrupto, se comporta como hoy (excepción de `JSON.parse`), porque
queda fuera del alcance.

## Estrategia de testing

Todo con Vitest y sin procesos hijos. Ningún criterio es de *efecto* en pantalla: no hay JavaScript
de cliente, así que no hace falta DOM de pruebas.

| Test | Archivo | Criterios |
|---|---|---|
| objeto válido → `ok` con los montos | `test/presupuestos.test.ts` | R1.1 |
| monto 0, negativo o string → error que nombra la categoría | `test/presupuestos.test.ts` | R1.4 |
| clave `comida` → error que nombra la categoría | `test/presupuestos.test.ts` | R1.5 |
| `null`, `[]` o `"hola"` → error que nombra la ruta | `test/presupuestos.test.ts` | R1.7 |
| suma solo movimientos del mes y de la categoría | `test/dashboard.test.ts` | R2.1 |
| el mismo presupuesto se usa para dos meses distintos | `test/dashboard.test.ts` | R1.1 |
| % redondeado (2/3 → 67) | `test/dashboard.test.ts` | R2.2 |
| gastado > presupuesto → `excedido` | `test/dashboard.test.ts` | R2.3 |
| gastado = presupuesto → no excedido; 0,1 + 0,2 vs 0,3 → no excedido | `test/dashboard.test.ts` | R2.4 |
| gasto sin presupuesto → `sinDefinir` | `test/dashboard.test.ts` | R2.5 |
| presupuesto sin gasto → `sinDefinir` | `test/dashboard.test.ts` | R2.6 |
| sin gasto ni presupuesto → no hay fila | `test/dashboard.test.ts` | R2.7 |
| una línea por fila con gastado, presupuesto y % | `test/dashboard.test.ts` | R3.1 |
| «—» en % sin presupuesto | `test/dashboard.test.ts` | R3.3 |
| «—» en presupuestado sin presupuesto | `test/dashboard.test.ts` | R3.4 |
| marca `⚠ excedido` / `sin definir` en la fila | `test/dashboard.test.ts` | R3.5 |
| sin filas → `Sin datos para <mes>.` | `test/dashboard.test.ts` | R3.8 |
| `esMesValido` acepta `2026-09` y rechaza `2026-13`, `2026-9`, `09-2026` | `test/fechas.test.ts` | R3.6 |
| `mesActual(new Date(2026, 0, 15))` → `2026-01` | `test/fechas.test.ts` | R3.2 |
| sin mes → usa `mesActual(hoy)` | `test/dashboard-comando.test.ts` | R3.2 |
| mes inválido → mensaje con formato esperado | `test/dashboard-comando.test.ts` | R3.6 |
| mes inválido → código ≠ 0 | `test/dashboard-comando.test.ts` | R3.7 |
| lectura fallida o presupuesto inválido → código ≠ 0 | `test/dashboard-comando.test.ts` | R1.6 |
| archivo ausente → `{ ok: true, datos: {} }` | `test/almacen.test.ts` (tmpdir) | R1.2 |
| archivo con JSON roto → error que nombra la ruta | `test/almacen.test.ts` (tmpdir) | R1.3 |

El cableado de `cli.ts` (imprimir y hacer `process.exit`) no tiene test propio. Son tres líneas sin
lógica, y el paso 8 corre el `build`.

## Alternativas descartadas

- **Guardar los presupuestos dentro de `movimientos.json`.** Cambia el formato de un archivo que ya
  existe y que hoy es un array. Un archivo aparte no toca lo que funciona.
- **Testear la CLI levantando `dist/cli.js` como proceso.** Exige compilar antes de testear y
  mete build en el comando de corrección, justo lo que `CLAUDE.md` separa. El orquestador con
  dependencias inyectadas cubre lo mismo sin proceso.
- **Comparar la alerta con los montos en punto flotante.** Da alertas falsas en sumas con
  decimales. Se compara en centavos.
- **Decidir la alerta con el % redondeado.** Un 100,4 % se mostraría como 100 y no alertaría. Ya
  estaba en los supuestos de requirements.
- **Una librería de tablas para la salida.** El proyecto no agrega dependencias sin necesidad, y
  `padStart`/`padEnd` alcanzan, como en `listar`.
