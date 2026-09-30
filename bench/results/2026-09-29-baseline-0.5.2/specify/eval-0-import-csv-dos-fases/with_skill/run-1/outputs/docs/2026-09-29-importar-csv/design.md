# Design — Importar movimientos del banco

> Requirements: [`./requirements.md`](./requirements.md)
> Estado: aprobado (2026-09-29)

## Resumen de la solución

Un comando nuevo, `finanzas importar <archivo.csv>`, lee el extracto y lo pasa por tres funciones
puras en cadena:

1. un **parser** convierte el texto en filas normalizadas y filas inválidas con su motivo;
2. un **planificador** separa los ingresos, descarta lo que ya está guardado y categoriza el resto
   con la tabla de reglas;
3. un **formateador** arma el resumen que se imprime.

La lectura y escritura de archivos queda en una capa delgada de comando, que devuelve la salida y el
código de salida en vez de imprimir y terminar el proceso. Así se prueba con archivos temporales,
sin levantar un subproceso. No se agregan dependencias: el formato es fijo y un `split(',')`
alcanza. «Sin categoría» entra como un valor más del tipo `Categoria`.

## Superficie

- **No navegable** — es una CLI. No hay nada que Playwright pueda abrir, así que `verify-e2e`
  (paso 7) no aplica: cuando todas las tareas estén en `hecho`, la feature pasa directo al paso 8.

## Arquitectura

| Unidad | Responsabilidad | Depende de | Cubre |
|--------|-----------------|------------|-------|
| `src/extracto.ts` (nuevo, puro) | Texto del CSV → filas con fecha ISO, descripción recortada y monto con signo, más las filas inválidas con número de línea y motivo | — | R1.1–R1.6, R2.1–R2.5 |
| `src/reglas.ts` (nuevo, puro) | La Tabla de reglas como dato y `categorizar(descripcion)` | `movimientos.ts` (tipo) | R4.1–R4.5 |
| `src/importacion.ts` (nuevo, puro) | Filas + movimientos guardados → movimientos nuevos, cuántos duplicados, cuántos ingresos. También el formateo del resumen | `reglas.ts`, `extracto.ts` (tipos) | R1.3, R3.1, R5.1, R5.2, R2.6, R2.7, R3.2, R5.4, R6.1, R6.2 |
| `src/comando-importar.ts` (nuevo, E/S) | Valida argumentos, lee el CSV, compone las funciones puras y guarda. Devuelve `{ salida, errores, codigo }` | `almacen.ts`, las tres unidades puras | R1.7–R1.10, R2.8, R5.3, R6.3, R6.5 |
| `src/movimientos.ts` (cambia) | Agrega `'Sin categoría'` a `Categoria` y la función pura `formatearMovimiento(m)` para el listado | — | R4.5, R6.4 |
| `src/cli.ts` (cambia) | Rama `importar`, que imprime lo que devuelve el comando y termina con su código. `listar` pasa a usar `formatearMovimiento`. Se actualiza el texto de uso | `comando-importar.ts`, `movimientos.ts` | R1.9, R6.4 |

`almacen.ts` no cambia: la importación usa los mismos `leer` y `guardar` que `agregar`, sobre la
misma ruta (`FINANZAS_DATOS` o `data/movimientos.json`).

## Flujo de datos

1. `cli.ts` recibe `importar <ruta>` y llama a `comandoImportar(args, RUTA)`.
2. Si falta `<ruta>`, el comando devuelve el texto de uso en `errores` y `codigo: 1` (R1.9, R1.10).
3. Si el archivo no existe, devuelve `No se encontró el archivo: <ruta>` y `codigo: 1` (R1.7, R1.8).
   No lee ni escribe el almacén.
4. Lee el archivo como UTF-8 y llama a `parsearExtracto(texto)`:
   - parte en líneas por `/\r?\n/` (R1.5);
   - descarta la línea 1, que es el encabezado (R1.1);
   - salta las líneas vacías o que tienen solo espacios, sin reportarlas (R1.6);
   - a cada línea restante le aplica las validaciones en este orden, y la primera que falla da el
     motivo: columnas (R2.1), fecha (R2.2), descripción (R2.5), monto (R2.3, R2.4);
   - si pasa todas, produce `{ linea, fecha: 'AAAA-MM-DD', descripcion: recortada, monto: con signo }`
     (R1.2, R1.4).
5. `leer(RUTA)` trae los movimientos guardados.
6. `planificarImportacion(filas, existentes)`:
   - si el monto es positivo, suma un ingreso y no registra la fila (R3.1);
   - si el monto es negativo, arma un candidato con `monto = |monto|` (R1.3);
   - si el candidato tiene la misma clave `fecha|descripcion|monto` que un movimiento de `existentes`,
     suma un duplicado (R5.1). Solo se compara contra `existentes`, nunca contra los candidatos del
     mismo archivo (R5.2);
   - al resto le asigna `categoria = categorizar(descripcion)` y lo agrega a `nuevos`.
7. Si `nuevos` no está vacío, `guardar(RUTA, [...existentes, ...nuevos])`, con una sola escritura al
   final (R6.3).
8. `formatearResumen(...)` produce las líneas de salida y el comando devuelve `codigo: 0` (R6.5).
   `cli.ts` imprime `salida` por stdout y `errores` por stderr.

## Interfaces

```ts
// src/extracto.ts
export interface FilaExtracto {
  linea: number        // número de línea en el archivo, desde 1 (la 1 es el encabezado)
  fecha: string        // AAAA-MM-DD
  descripcion: string  // sin espacios al principio ni al final, nunca vacía
  monto: number        // con el signo del extracto: negativo = gasto, positivo = ingreso; nunca 0
}
export interface FilaInvalida {
  linea: number
  motivo: string       // p. ej. 'se esperaban 3 columnas y hay 4', 'fecha inválida', 'monto inválido', 'monto cero', 'descripción vacía'
}
export function parsearExtracto(texto: string): { filas: FilaExtracto[]; invalidas: FilaInvalida[] }

// src/reglas.ts
export const REGLAS: ReadonlyArray<{ categoria: Categoria; palabras: readonly string[] }>  // en orden de prioridad
export function categorizar(descripcion: string): Categoria  // 'Sin categoría' si no hay coincidencia

// src/importacion.ts
export interface PlanImportacion {
  nuevos: Movimiento[]
  duplicados: number
  ingresos: number
}
export function planificarImportacion(filas: FilaExtracto[], existentes: Movimiento[]): PlanImportacion
export function formatearResumen(plan: PlanImportacion, invalidas: FilaInvalida[]): string[]

// src/comando-importar.ts
export interface ResultadoComando { salida: string[]; errores: string[]; codigo: 0 | 1 }
export function comandoImportar(args: string[], rutaDatos: string): ResultadoComando

// src/movimientos.ts
export function formatearMovimiento(m: Movimiento): string
```

**Uso del comando**: `finanzas importar <archivo.csv>`.

**Formato del resumen** (se imprimen todos los contadores siempre, incluso en cero; el detalle de
inválidas solo si hay alguna):

```
Importados: 12 (3 sin categoría)
Duplicados omitidos: 2
Ingresos omitidos: 1
Filas inválidas: 2
  línea 5: fecha inválida
  línea 9: monto inválido
```

## Modelos de datos

```ts
// src/movimientos.ts — único cambio al modelo
export type Categoria = 'Comida' | 'Transporte' | 'Servicios' | 'Ocio' | 'Salud' | 'Otros' | 'Sin categoría'
```

`Movimiento` no cambia. Un movimiento importado tiene la misma forma que uno cargado con `agregar`,
así que `listar` y `delMes` lo tratan igual (R6.4).

Invariantes y reglas de parseo:

- **Fecha**: `/^(\d{2})\/(\d{2})\/(\d{4})$/` y además tiene que ser una fecha real. Se comprueba
  armando `Date.UTC(a, m-1, d)` y verificando que día, mes y año no cambien, lo que rechaza
  `31/02/2026` (R2.2).
- **Monto**: `/^-?\d+(\.\d+)?$/` sobre el campo recortado. Acepta `-45` y `-45.50`; rechaza `-45,50`,
  `1,234.50` y `+45` (R2.3). Un monto que vale 0 es inválido (R2.4).
- **Descripción**: se recorta; si queda vacía, la fila es inválida (R2.5).
- **Clave de duplicado**: `fecha|descripcion|monto`, calculada sobre los valores ya normalizados
  (fecha ISO, descripción recortada, monto en valor absoluto). La descripción se compara exacta, con
  mayúsculas y tildes.
- **Normalización para reglas**: `texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()`, que
  se aplica tanto a la descripción como a las palabras clave (R4.2, R4.3). La coincidencia es por
  subcadena (R4.1).
- **Prioridad**: `REGLAS` se recorre en orden y gana la primera categoría que tenga alguna palabra
  contenida en la descripción (R4.4).

`listar` hoy alinea la categoría a 10 caracteres. `formatearMovimiento` la alinea a 13, el largo de
«Sin categoría», para que la columna no se corra.

## Manejo de errores

| Situación | Comportamiento | Cubre |
|-----------|----------------|-------|
| `importar` sin ruta | Texto de uso por stderr, código 1, no toca el almacén | R1.9, R1.10 |
| El archivo no existe | `No se encontró el archivo: <ruta>` por stderr, código 1, no toca el almacén | R1.7, R1.8 |
| Fila con ≠ 3 columnas | Se omite con el motivo `se esperaban 3 columnas y hay N` | R2.1 |
| Fecha mal formada o inexistente | Se omite con el motivo `fecha inválida` | R2.2 |
| Descripción vacía | Se omite con el motivo `descripción vacía` | R2.5 |
| Monto no numérico | Se omite con el motivo `monto inválido` | R2.3 |
| Monto cero | Se omite con el motivo `monto cero` | R2.4 |
| Monto positivo | No es un error: se cuenta como ingreso omitido | R3.1, R3.2 |
| Ya guardado | No es un error: se cuenta como duplicado omitido | R5.1, R5.4 |
| Hay filas omitidas de cualquier tipo | Se importan igual las válidas y el comando termina con código 0 | R2.8, R6.5 |

Queda fuera de esta feature: un `data/movimientos.json` corrupto hace fallar a `leer`, igual que hoy
con `listar` y `agregar`.

## Estrategia de testing

Todo con Vitest. No hay JavaScript de cliente, así que no hace falta DOM de pruebas. Todos los
criterios se cubren con tests unitarios o de integración en el paso 5; ninguno queda «solo e2e».

Las unidades puras se prueban sin disco. `comandoImportar` se prueba con archivos reales en un
directorio temporal (`fs.mkdtempSync(os.tmpdir())`), pasando `rutaDatos` explícita, sin subproceso
ni build. En TDD conviene seguir el orden de la tabla: parser → reglas → planificador → resumen →
comando.

| Test | Qué verifica | Cubre |
|------|--------------|-------|
| `extracto.test.ts` — descarta la primera línea y lee las siguientes | Un CSV de 3 líneas da 2 filas con sus tres campos | R1.1 |
| `extracto.test.ts` — convierte la fecha | `03/09/2026` → `2026-09-03` | R1.2 |
| `extracto.test.ts` — recorta la descripción | `'  Coto  '` → `'Coto'` | R1.4 |
| `extracto.test.ts` — acepta CRLF | El mismo CSV con `\r\n` da las mismas filas que con `\n` | R1.5 |
| `extracto.test.ts` — ignora líneas vacías | Líneas vacías, incluida una al final, no aparecen ni como filas ni como inválidas | R1.6 |
| `extracto.test.ts` — columnas de más o de menos | 2 y 4 columnas → inválida, con su línea | R2.1, R2.6 |
| `extracto.test.ts` — fecha inválida | `2026-09-03`, `3/9/2026` y `31/02/2026` → inválidas | R2.2 |
| `extracto.test.ts` — monto no numérico | `abc`, `-45,50` → inválidas; `-45` y `-45.50` → válidas | R2.3 |
| `extracto.test.ts` — monto cero | `0` y `0.00` → inválidas | R2.4 |
| `extracto.test.ts` — descripción vacía | `''` y `'   '` → inválidas | R2.5 |
| `extracto.test.ts` — motivo por fila | Cada inválida trae un motivo distinto según la causa | R2.7 |
| `reglas.test.ts` — palabra clave | `'COMPRA SUPERMERCADO X'` → Comida; una por categoría | R4.1 |
| `reglas.test.ts` — mayúsculas | `'NETFLIX.COM'` → Ocio | R4.2 |
| `reglas.test.ts` — tildes | `'Panadería La Espiga'`, `'MÉDICO'` → Comida, Salud | R4.3 |
| `reglas.test.ts` — prioridad | `'UBER EATS SUPERMERCADO'` → Comida (Comida está antes que Transporte) | R4.4 |
| `reglas.test.ts` — sin coincidencia | `'TRANSFERENCIA 123'` → Sin categoría | R4.5 |
| `importacion.test.ts` — gasto en valor absoluto | Fila `-45.5` → movimiento con `monto: 45.5` | R1.3 |
| `importacion.test.ts` — ingreso | Fila `+1000` no está en `nuevos` y `ingresos === 1` | R3.1 |
| `importacion.test.ts` — duplicado contra lo guardado | Fila igual a un existente no está en `nuevos` y `duplicados === 1` | R5.1 |
| `importacion.test.ts` — iguales en el mismo archivo | Dos filas idénticas y nada guardado → las dos en `nuevos` | R5.2 |
| `importacion.test.ts` — asigna categoría | Los `nuevos` traen la categoría de `categorizar` | R4.1 |
| `importacion.test.ts` — resumen: importados | `formatearResumen` incluye `Importados: N` | R6.1 |
| `importacion.test.ts` — resumen: sin categoría | Incluye `(K sin categoría)` | R6.2 |
| `importacion.test.ts` — resumen: ingresos, aparte de inválidas | Líneas separadas `Ingresos omitidos: N` y `Filas inválidas: M` | R3.2 |
| `importacion.test.ts` — resumen: duplicados | Incluye `Duplicados omitidos: N` | R5.4 |
| `importacion.test.ts` — resumen: detalle de inválidas | Una línea por inválida con `línea N` | R2.6 |
| `importacion.test.ts` — resumen: motivo | Esa línea incluye el motivo | R2.7 |
| `comando-importar.test.ts` — sin ruta: uso | `errores` contiene el uso del comando | R1.9 |
| `comando-importar.test.ts` — sin ruta: código | `codigo === 1` | R1.10 |
| `comando-importar.test.ts` — archivo inexistente: mensaje | `errores` contiene la ruta buscada | R1.7 |
| `comando-importar.test.ts` — archivo inexistente: código | `codigo === 1` | R1.8 |
| `comando-importar.test.ts` — válidas e inválidas | Las válidas quedan guardadas | R2.8 |
| `comando-importar.test.ts` — importar dos veces | La segunda corrida no cambia el almacén e informa `Importados: 0` | R5.3 |
| `comando-importar.test.ts` — conserva lo previo | Los movimientos que ya estaban siguen estando, idénticos | R6.3 |
| `comando-importar.test.ts` — código 0 con omisiones | Un archivo con inválidas, ingresos y duplicados → `codigo === 0` | R6.5 |
| `movimientos.test.ts` + `comando-importar.test.ts` — listado | `formatearMovimiento` muestra `Sin categoría`, y un importado recuperado con `delMes(leer(...))` se formatea con su categoría | R6.4 |

Casos borde que vale la pena cubrir aunque no tengan un criterio propio:

- un archivo vacío, o con solo el encabezado → `Importados: 0`, código 0 y sin escritura;
- una fila con varias fallas a la vez → se reporta un único motivo, el primero en el orden de
  validación;
- el almacén todavía no existe → la importación lo crea.

## Decisiones y alternativas descartadas

| Decisión | Alternativa considerada | Por qué se descartó |
|----------|-------------------------|---------------------|
| Parser propio con `split(',')` | Una librería de CSV (`csv-parse`) | Dependencia nueva para un formato fijo sin comillas. `CLAUDE.md` pide no agregar dependencias sin necesidad |
| `'Sin categoría'` como valor de `Categoria` | `categoria` opcional o `null` | Obliga a tratar el caso aparte en `listar` y en el JSON. Un literal más en la unión no cambia nada del código existente |
| El comando devuelve `{ salida, errores, codigo }` | Probar la CLI como subproceso | Necesita build previo o una dependencia como `tsx`. Así se prueba con Vitest directo y archivos temporales |
| Reglas como constante en el código | Archivo de reglas configurable | Fuera de alcance: las reglas son fijas en esta versión |
| Coincidencia por subcadena | Por palabra completa | La descripción del banco pega marcas con otros textos (`PEDIDOSYA*BURGER`, `NETFLIX.COM`). Por palabra completa se perderían |
| Duplicados solo contra lo guardado | Contra lo guardado y dentro del archivo | Decidido en requirements (R5.2): dos gastos iguales el mismo día son dos gastos |
| Una sola escritura al final | Guardar fila por fila | Evita dejar el almacén a medio importar si algo falla en el medio |
| Parser con sus propias validaciones | Reusar `validarMovimiento` | El parser valida el formato del banco (DD/MM/AAAA, signo) y necesita un motivo por fila. Lo que produce ya es válido por construcción |

## Riesgos y preguntas abiertas

- **Falsos positivos por subcadena**: `claro` coincide dentro de `DECLARO`, `cine` dentro de
  `MEDICINE` y `sube` dentro de `SUBESTACION`. Ajustar la tabla es barato, pero es un cambio de
  requisito: entra como enmienda a `requirements.md`.
- **`agregar` no valida la categoría**: el código actual hace un cast del argumento, así que desde
  `agregar` hoy se puede cargar cualquier texto, incluido «Sin categoría». Es anterior a esta feature
  y no se toca acá; va al backlog si molesta.
- **Filas con comas en la descripción**: si el banco llega a exportarlas entre comillas, esas filas
  van a salir como inválidas (R2.1) en vez de romper la importación. Soportarlas sería otra feature.

## Enmiendas
