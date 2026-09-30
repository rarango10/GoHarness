# Design — Importar movimientos del banco

> Estado: aprobado (2026-09-29)

Requisitos: [`requirements.md`](requirements.md) (aprobado 2026-09-29).

## Resumen

Un comando nuevo, `finanzas importar <archivo.csv>`, que lee el CSV del banco y el archivo de reglas,
arma los movimientos nuevos con funciones puras y los agrega al mismo `movimientos.json` de siempre.
La feature no tiene superficie navegable: es una CLI, así que no tiene paso 7 (e2e) y pasa directo
del paso 6 al 8.

## Arquitectura

Se sigue la regla del proyecto: los cálculos van en funciones puras, separados de la lectura de
archivos y de la impresión en consola.

```
cli.ts ──► comandoImportar.ts ──► almacen.ts        (I/O: leer/escribir archivos)
   │              │
   │              ├──► csvBanco.ts   (puro: texto → líneas del banco + errores)       R2
   │              ├──► reglas.ts     (puro: interpretar reglas, categorizar)          R3
   │              ├──► importar.ts   (puro: duplicados + armado de movimientos)       R1.1, R5
   │              └──► presentacion.ts (puro: textos del resumen y de los errores)    R1.2–R1.4
   └──► presentacion.ts (formato de la línea de `listar`)                             R4.1
```

| Módulo | Nuevo / cambia | Responsabilidad |
|---|---|---|
| `src/movimientos.ts` | cambia | Amplía `Categoria` con `'Sin categoría'`; exporta la lista de categorías asignables por regla. |
| `src/csvBanco.ts` | nuevo | Parsear el texto del CSV del banco. Puro. |
| `src/reglas.ts` | nuevo | Reglas iniciales, interpretar el contenido del archivo de reglas, categorizar una descripción. Puro. |
| `src/importar.ts` | nuevo | Dadas las líneas, los movimientos guardados y las reglas: movimientos nuevos y conteos. Puro. |
| `src/presentacion.ts` | nuevo | Formatear el resumen, los errores de línea y la línea de `listar`. Puro. |
| `src/almacen.ts` | cambia | Suma lectura de texto y lectura/creación del archivo de reglas. |
| `src/comandoImportar.ts` | nuevo | Orquesta el comando: I/O + funciones puras. Devuelve código de salida y textos; no llama a `process.exit` ni a `console`. |
| `src/cli.ts` | cambia | Rama `importar` que delega en `comandoImportar` e imprime; `listar` usa `presentacion.ts`. |

`comandoImportar` existe para que el comportamiento de la CLI de punta a punta (códigos de salida,
archivos que no cambian, archivo de reglas creado) se pruebe con Vitest sobre un directorio
temporal, sin compilar ni lanzar un proceso. `cli.ts` queda como un adaptador de tres líneas.

## Interfaces

```ts
// src/movimientos.ts
export const CATEGORIAS_DE_REGLA = ['Comida', 'Transporte', 'Servicios', 'Ocio', 'Salud', 'Otros'] as const
export type CategoriaDeRegla = (typeof CATEGORIAS_DE_REGLA)[number]
export const SIN_CATEGORIA = 'Sin categoría'
export type Categoria = CategoriaDeRegla | typeof SIN_CATEGORIA

// src/csvBanco.ts
export interface LineaBanco { linea: number; fecha: string /* AAAA-MM-DD */; descripcion: string; monto: number /* > 0 */ }
export interface ErrorLinea { linea: number; motivo: string }
export function parsearCsvBanco(texto: string): { lineas: LineaBanco[]; errores: ErrorLinea[] }

// src/reglas.ts
export interface Regla { palabra: string; categoria: CategoriaDeRegla }
export const REGLAS_INICIALES: Regla[]
export function interpretarReglas(contenido: string): { reglas: Regla[] } | { error: string }
export function categorizar(descripcion: string, reglas: Regla[]): Categoria

// src/importar.ts
export interface ResultadoImportacion { nuevos: Movimiento[]; duplicados: number; sinCategoria: number }
export function importar(guardados: Movimiento[], lineas: LineaBanco[], reglas: Regla[]): ResultadoImportacion

// src/presentacion.ts
export function formatearResumen(r: ResultadoImportacion): string[]
export function formatearErrorLinea(e: ErrorLinea): string
export function formatearMovimiento(m: Movimiento): string

// src/comandoImportar.ts
export interface Rutas { datos: string; reglas: string }
export interface SalidaComando { codigo: number; salida: string[]; errores: string[] }
export function ejecutarImportar(args: string[], rutas: Rutas): SalidaComando
```

## Modelos de datos

### Movimiento

Sin cambios de forma. `categoria` ahora admite `'Sin categoría'` (R3.7), y se guarda así, literal,
en `movimientos.json`. `validarMovimiento` no mira la categoría y sigue igual.

### Archivo de reglas

- **Ubicación:** `reglas.json` en la misma carpeta que el archivo de datos (por defecto
  `data/reglas.json`), con el override `FINANZAS_REGLAS` para apuntarlo a otro lado. `data/` ya está
  en `.gitignore`: las reglas son personales, igual que los movimientos.
- **Formato:** un arreglo JSON ordenado; el orden del arreglo es el orden de prioridad (R3.6).

```json
[
  { "palabra": "SUBE", "categoria": "Transporte" },
  { "palabra": "colectivo", "categoria": "Transporte" },
  { "palabra": "farmacia", "categoria": "Salud" },
  { "palabra": "supermercado", "categoria": "Comida" },
  { "palabra": "resto", "categoria": "Comida" }
]
```

Ese es el contenido de `REGLAS_INICIALES`, que se escribe con indentación de 2 espacios cuando el
archivo no existe (R3.2).

**Interpretable** (R3.8) quiere decir: JSON válido, un arreglo, y cada elemento un objeto con
`palabra` string no vacía (después de `trim`) y `categoria` string. Una palabra vacía se rechaza
porque, al ser subcadena de todo, capturaría todas las descripciones. Una `categoria` string que no
está en `CATEGORIAS_DE_REGLA` es el error de R3.9, con un mensaje que nombra la categoría inválida.

### CSV del banco

Formato fijado en `requirements.md`. Detalles de lectura:

- Se parte por `/\r?\n/`: el banco puede exportar con fin de línea de Windows.
- Línea 1 = encabezado, se descarta sin mirarla (R2.1, R2.11).
- Una línea con solo espacios cuenta como vacía (R2.5).
- Se parte por `,` y se aplica `trim` a cada campo. Si no son exactamente 3 campos, es error (R2.6).
- **Fecha** (R2.7): tiene que cumplir `^\d{2}/\d{2}/\d{4}$` y ser una fecha real del calendario
  (`31/02/2026` es error). Se valida construyendo el `Date` UTC y comprobando que día, mes y año
  vuelvan iguales. Se guarda como `AAAA-MM-DD` (R2.2).
- **Monto** (R2.8): tiene que cumplir `^[+-]?\d+(\.\d+)?$`. Así quedan afuera `""`, `"1e3"` y
  `"1.234,50"`, que `Number()` aceptaría o leería mal. `0` es error; si es negativo, entra con
  `Math.abs` (R2.3); si es positivo, la línea se descarta en silencio (R2.4).
- **Descripción** (R2.9): vacía después de `trim` es error.
- Si una línea tiene varios problemas, se informa uno solo, el primero en este orden: campos, fecha,
  monto, descripción. Una línea con error se informa una vez.

### Categorización

`normalizar(s) = s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()`. Una regla aplica si
`normalizar(descripcion).includes(normalizar(palabra))` (R3.3, R3.4, R3.5). Se recorre `reglas` en
orden y gana la primera que aplica (R3.6); si ninguna aplica, `SIN_CATEGORIA` (R3.7). Efecto lateral
aceptado: `ñ` se compara como `n`.

### Duplicados

La clave es `` `${fecha}|${descripcion}|${monto}` `` sobre valores ya normalizados (fecha
`AAAA-MM-DD`, monto positivo, descripción con `trim`). `importar` arranca un `Set` con las claves de
`guardados` (R5.1) y va sumando la de cada movimiento que acepta, así que una línea repetida dentro
del mismo archivo también se descarta (R5.2). Los montos se comparan como `number`: el mismo texto
del CSV da el mismo número, y lo guardado a mano con `agregar` pasa por el mismo `Number()`.

## Flujo de `ejecutarImportar`

1. Sin `args[0]` → código 1, `errores` = texto de uso (R1.6).
2. Leer el CSV. Si falla → código 1, `No se pudo leer <ruta>: <causa>` (R1.5). Nada se escribió
   todavía.
3. Si el archivo de reglas no existe, crearlo con `REGLAS_INICIALES` (R3.2). Leerlo e interpretarlo
   (R3.1). Si el resultado es `{ error }` → código 1, mensaje en `errores`, sin tocar datos (R3.8,
   R3.9).
4. `parsearCsvBanco` → `lineas`, `errores de línea`.
5. `importar(leer(datos), lineas, reglas)`.
6. Si hay `nuevos`, `guardar(datos, [...guardados, ...nuevos])` (R1.1, R2.10). Con una sola
   escritura al final, cualquier error de los pasos 1–3 deja los datos intactos.
7. Código 0. `errores` = una línea `Línea N: <motivo>` por cada error de línea; `salida` =
   `formatearResumen` (R1.2–R1.4):

```
Importados: 12
Duplicados: 3
Sin categoría: 2
```

`cli.ts` imprime `salida` con `console.log`, `errores` con `console.error`, y sale con `codigo`.

## `listar` (R4.1)

`formatearMovimiento` reproduce la línea actual, con la columna de categoría ensanchada de 10 a 13
caracteres (`'Sin categoría'.length`) para que la columna quede alineada. El texto se imprime tal
cual, sin abreviar.

## Manejo de errores

| Situación | Criterio | Resultado |
|---|---|---|
| Sin ruta | R1.6 | uso por stderr, código 1 |
| CSV inexistente o ilegible | R1.5 | mensaje por stderr, código 1, datos y reglas intactos |
| Reglas no interpretables | R3.8 | mensaje por stderr, código 1, datos intactos |
| Regla con categoría desconocida | R3.9 | mensaje con la categoría por stderr, código 1, datos intactos |
| Línea mal formada | R2.6–R2.9 | `Línea N: <motivo>` por stderr, se sigue con las demás, código 0 |
| Ingreso / línea vacía | R2.4, R2.5 | se saltea sin mensaje |
| `movimientos.json` corrupto | — | comportamiento actual de `leer` (excepción); fuera de alcance |

## Estrategia de testing

Todo es Vitest. La feature no tiene JavaScript de cliente ni criterios de efecto en pantalla: no hace
falta un DOM de pruebas y ningún criterio queda «solo e2e».

- **Unidad, funciones puras:** la mayoría de los criterios, con entradas en memoria.
- **Integración de comando:** `ejecutarImportar` sobre un directorio de `fs.mkdtempSync(os.tmpdir())`
  con archivos reales. Cubre lo que depende de I/O: códigos de salida, archivos intactos, reglas
  creadas y leídas del disco.

| Criterio | Test |
|---|---|
| R1.1 | `test/importar.test.ts` (nuevos = válidos no duplicados) · `test/comandoImportar.test.ts` (quedan en `movimientos.json`) |
| R1.2, R1.3, R1.4 | `test/importar.test.ts` (conteos) · `test/presentacion.test.ts` (texto del resumen) |
| R1.5 | `test/comandoImportar.test.ts` (ruta inexistente: código ≠ 0, datos idénticos byte a byte) |
| R1.6 | `test/comandoImportar.test.ts` (sin args: código ≠ 0, texto de uso) |
| R2.1, R2.3, R2.4, R2.5, R2.6, R2.7, R2.8, R2.9, R2.11 | `test/csvBanco.test.ts`, un `it` por criterio |
| R2.2 | `test/csvBanco.test.ts` (`15/09/2026` → `2026-09-15`, y `delMes(..., '2026-09')` lo encuentra) |
| R2.10 | `test/csvBanco.test.ts` (líneas buenas junto a malas) · `test/comandoImportar.test.ts` (se guardan las buenas) |
| R3.1 | `test/comandoImportar.test.ts` (regla editada en el archivo → categoría aplicada) |
| R3.2 | `test/comandoImportar.test.ts` (sin archivo de reglas → se crea con las 5 iniciales, en orden) |
| R3.3, R3.4, R3.5, R3.6, R3.7 | `test/reglas.test.ts` (`categorizar`), un `it` por criterio |
| R3.8 | `test/reglas.test.ts` (`interpretarReglas`: JSON roto, no arreglo, palabra vacía) · `test/comandoImportar.test.ts` (código ≠ 0, datos intactos) |
| R3.9 | `test/reglas.test.ts` (error que nombra la categoría) · `test/comandoImportar.test.ts` (código ≠ 0, datos intactos) |
| R4.1 | `test/presentacion.test.ts` (`formatearMovimiento` contiene `Sin categoría` completo) |
| R5.1, R5.2 | `test/importar.test.ts` |

Los tests existentes (`test/movimientos.test.ts`) no cambian.

## Dependencias

Ninguna nueva. El CSV del banco no tiene comillas, así que un `split(',')` alcanza y una librería de
CSV no se justifica. Las reglas en JSON se leen con `JSON.parse`.

## Alternativas descartadas

- **Reglas en texto plano (`palabra=Categoría` por línea):** es un poco más cómodo de editar, pero
  obliga a un parser propio y a reglas de escape. JSON es consistente con `movimientos.json` y
  valida la estructura gratis.
- **Reglas agrupadas por categoría (`{ "Comida": ["supermercado", …] }`):** pierde el orden global
  entre reglas de categorías distintas, que es justo lo que define la prioridad (R3.6).
- **Reglas fijas en el código:** contradice R3.1.
- **Probar la CLI lanzando `node dist/cli.js`:** exigiría compilar dentro del comando de corrección,
  que el proyecto limita a typecheck + tests. `ejecutarImportar` da la misma cobertura sin build.
- **Validar el monto con `Number()`:** acepta `""` como 0 y `"1e3"` como 1000. La regex fija el
  formato del banco.
- **Guardar a medida que se procesa cada línea:** complica garantizar «datos intactos» ante errores
  de archivo. Una sola escritura al final es más simple.

## Enmiendas

Ninguna.
