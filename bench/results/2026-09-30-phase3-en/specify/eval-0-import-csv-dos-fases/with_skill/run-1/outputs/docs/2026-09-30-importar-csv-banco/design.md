# Design — Importar movimientos del banco

> Requirements: [`./requirements.md`](./requirements.md)
> Estado: aprobado (2026-09-30)

## Resumen de la solución

Un comando nuevo, `finanzas importar <archivo.csv>`, lee el archivo entero y se lo pasa a tres
funciones puras en cadena. La primera parsea y valida todas las filas: ante la primera inválida
devuelve el error y no se guarda nada. La segunda decide qué hacer con cada fila: la omite si es
crédito o duplicado, y si no, la convierte en movimiento con su categoría. La tercera arma el texto
del resumen. La CLI solo lee el archivo, guarda una vez al final e imprime.

Para poder probar la CLI (códigos de salida, mensajes, `listar`) sin compilar ni lanzar procesos, la
lógica de `src/cli.ts` pasa a una función `ejecutar` que recibe los argumentos y devuelve el código
de salida. `cli.ts` queda como un envoltorio de tres líneas. `agregar` y `listar` se mueven sin
cambiar su comportamiento.

## Superficie

- **No navegable** — es un comando de CLI. `verify-e2e` no aplica: la feature pasa al paso 8 en
  cuanto sus tareas están en `hecho`.

## Referencia visual

No aplica (feature no navegable).

## Arquitectura

| Unidad | Responsabilidad | Depende de | Cubre |
|--------|-----------------|------------|-------|
| `src/csvBanco.ts` — `parsearCsvBanco` (pura) | Del texto del CSV a filas tipadas: saltea el encabezado y las líneas vacías, valida los campos, convierte la fecha y devuelve la primera fila inválida con su número de línea | — | R1.2, R1.3, R1.6, R1.10–R1.14 |
| `src/categorias.ts` — `REGLAS`, `categorizar` (pura) | Tabla ordenada de reglas y asignación de categoría por subcadena sin distinguir mayúsculas | `movimientos.ts` (tipo `Categoria`) | R2.1–R2.4 |
| `src/importacion.ts` — `planificarImportacion`, `formatearResumen` (puras) | Omite créditos y duplicados, construye los movimientos nuevos y cuenta cada caso; arma el texto del resumen | `categorias.ts`, `movimientos.ts` | R1.1, R1.4, R1.5, R3.1–R3.3, R4.1–R4.3 |
| `src/app.ts` — `ejecutar` (E/S) | Despacha los subcomandos, lee el CSV, llama a las funciones puras, guarda una sola vez e imprime; devuelve el código de salida | `almacen.ts`, las tres anteriores, `node:fs` | R1.7–R1.9, R1.15, R1.16, R2.5, R4.4 |
| `src/cli.ts` (E/S) | Punto de entrada: resuelve la ruta de datos, llama a `ejecutar` y asigna `process.exitCode` | `app.ts` | — |
| `src/movimientos.ts` (cambio) | `Categoria` suma `'Sin categoría'` | — | R2.4 |

`almacen.ts` no cambia. Los movimientos importados se guardan en el mismo archivo que usan `agregar`
y `listar` (`FINANZAS_DATOS` o `data/movimientos.json`).

## Flujo de datos

1. `ejecutar(['importar', ruta], rutaDatos, salida)`. Sin `ruta`: imprime el uso por `err` y
   devuelve 1 (R1.16).
2. Si `ruta` no existe: `err("No existe el archivo: <ruta>")` y devuelve 1 (R1.9, R1.15).
3. Lee el texto (UTF-8) → `parsearCsvBanco(texto)`.
   - Separa por `\r?\n`, descarta la línea 1 (encabezado) y las líneas en blanco.
   - Por cada línea restante, separa por `,` y recorta espacios de cada campo. Valida la cantidad
     de campos, la fecha, el monto y la descripción, en ese orden.
   - Ante la primera línea inválida devuelve `{ ok: false, linea, motivo }`.
4. Si falla: `err("Línea <n>: <motivo>. No se importó nada.")` y devuelve 1, **sin llamar a
   `guardar`** (R1.10–R1.15).
5. `existentes = leer(rutaDatos)` → `planificarImportacion(filas, existentes)`. Por cada fila:
   - `monto >= 0` → cuenta en `noGastos` (R1.5);
   - con `monto = -fila.monto`, si la clave `fecha|descripcion|monto` está en el conjunto armado
     **solo** con `existentes` → cuenta en `duplicados` (R3.1). El conjunto no se amplía con las
     filas del archivo (R3.2);
   - si no → `nuevos.push({ fecha, descripcion, monto, categoria: categorizar(descripcion) })`.
6. `guardar(rutaDatos, [...existentes, ...nuevos])` (R1.7, R1.8).
7. `out(formatearResumen(resumen))` y devuelve 0 (R4.1–R4.4).

## Interfaces

```ts
// src/csvBanco.ts
export interface FilaBanco {
  fecha: string       // AAAA-MM-DD, ya convertida
  descripcion: string // recortada, no vacía
  monto: number       // con el signo del banco: negativo = gasto
}
export type ResultadoParseo =
  | { ok: true; filas: FilaBanco[] }
  | { ok: false; linea: number; motivo: string } // linea: 1-based, contando el encabezado
export function parsearCsvBanco(texto: string): ResultadoParseo

// src/categorias.ts
export interface Regla { categoria: Exclude<Categoria, 'Sin categoría'>; palabras: string[] }
export const REGLAS: readonly Regla[]
export function categorizar(descripcion: string, reglas?: readonly Regla[]): Categoria

// src/importacion.ts
export interface ResumenImportacion { importados: number; duplicados: number; noGastos: number }
export function planificarImportacion(
  filas: FilaBanco[],
  existentes: Movimiento[],
): { nuevos: Movimiento[]; resumen: ResumenImportacion }
export function formatearResumen(r: ResumenImportacion): string

// src/app.ts
export interface Salida { out(linea: string): void; err(linea: string): void }
export function ejecutar(args: string[], rutaDatos: string, salida: Salida): number
```

`categorizar` recibe las reglas como parámetro opcional (por defecto `REGLAS`). Así los tests de
R2.1–R2.3 no dependen de la lista real de palabras, que se va a ajustar con el uso.

**Uso de la CLI:**

```
finanzas importar <archivo.csv>
```

Resumen en caso de éxito (stdout):

```
Importados: 12
Omitidos por duplicados: 3
Omitidos por no ser gastos: 2
```

## Modelos de datos

```ts
// src/movimientos.ts
export type Categoria =
  'Comida' | 'Transporte' | 'Servicios' | 'Ocio' | 'Salud' | 'Otros' | 'Sin categoría'
```

`Movimiento` no cambia. Invariante de lo importado: `monto > 0` (valor absoluto del gasto) y
`fecha` en `AAAA-MM-DD`, con lo que todo movimiento importado pasa `validarMovimiento`.

**Formato de entrada** (ver Supuestos de `requirements.md`):

```
Fecha,Descripción,Monto
03/09/2026,SUPERMERCADO COTO,-5200.00
05/09/2026,TRANSFERENCIA RECIBIDA,150000.00
```

**Validación por fila:**

| Campo | Regla | Motivo del error |
|-------|-------|------------------|
| cantidad | exactamente 3 campos tras separar por `,` | `se esperaban 3 campos` |
| fecha | `^\d{2}/\d{2}/\d{4}$` y fecha real de calendario (se descarta `31/02/2026` verificando el ida y vuelta con `Date.UTC`) | `fecha inválida` |
| monto | `^-?\d+(\.\d+)?$`. Se descartan `""`, `1e3`, `1.234,50` y `Infinity`, que `Number()` aceptaría o convertiría mal | `monto no numérico` |
| descripción | no vacía tras recortar | `descripción vacía` |

**Reglas iniciales** (`REGLAS`, en este orden; palabras en minúscula y sin acentos):

| # | Categoría | Palabras clave |
|---|-----------|----------------|
| 1 | Comida | `uber eats`, `pedidosya`, `rappi`, `supermercado`, `coto`, `carrefour`, `jumbo`, `verduleria`, `carniceria`, `panaderia`, `restaurant`, `cafe` |
| 2 | Transporte | `uber`, `cabify`, `didi`, `sube`, `ypf`, `shell`, `axion`, `peaje`, `estacionamiento` |
| 3 | Servicios | `edenor`, `edesur`, `metrogas`, `aysa`, `telecentro`, `fibertel`, `movistar`, `internet`, `expensas` |
| 4 | Ocio | `netflix`, `spotify`, `disney`, `cine`, `teatro`, `steam`, `ticketek` |
| 5 | Salud | `farmacia`, `farmacity`, `osde`, `swiss medical`, `laboratorio`, `odontolog` |
| 6 | Otros | `kiosco`, `correo`, `regalo` |

Comida va antes que Transporte para que `UBER EATS` caiga en Comida y `UBER` a secas en Transporte
(R2.3). La lista es un punto de partida: **ajustala al aprobar este diseño**. Cambiarla después es
editar la tabla, sin tocar ningún criterio.

## Manejo de errores

| Situación | Comportamiento | Cubre |
|-----------|----------------|-------|
| `importar` sin ruta | Uso por stderr, código 1 | R1.16 |
| El archivo no existe | `No existe el archivo: <ruta>` por stderr, código 1, no se guarda nada | R1.9, R1.15 |
| Fila con ≠ 3 campos | `Línea <n>: se esperaban 3 campos. No se importó nada.`, código 1, no se guarda nada | R1.10, R1.14, R1.15 |
| Fecha inválida | Ídem con `fecha inválida` | R1.11, R1.14, R1.15 |
| Monto no numérico | Ídem con `monto no numérico` | R1.12, R1.14, R1.15 |
| Descripción vacía | Ídem con `descripción vacía` | R1.13, R1.14, R1.15 |
| Línea en blanco (incluida la final) | Se ignora | R1.6 |
| Crédito (monto ≥ 0) | No se importa; cuenta en `Omitidos por no ser gastos` | R1.5, R4.3 |
| Duplicado de lo guardado | No se importa; cuenta en `Omitidos por duplicados` | R3.1, R4.2 |
| Archivo solo con encabezado | Éxito con los tres contadores en 0 | — |

Se valida el archivo entero antes de tocar los datos, así que un error nunca deja una importación a
medias. Los errores de E/S inesperados (permisos, JSON de datos corrupto) no se manejan: se propagan
como hoy en `agregar`.

## Estrategia de testing

Todo con Vitest, sin dependencias nuevas. Las funciones puras se prueban directo. `ejecutar` se
prueba en proceso, con un directorio temporal (`mkdtempSync(os.tmpdir())`) para el CSV y para el
archivo de datos, y una `Salida` que acumula líneas. No hay JavaScript de cliente, así que no hay
criterios de efecto ni DOM de pruebas, y no queda ningún criterio «solo e2e».

Orden sugerido para el TDD: `csvBanco` → `categorias` → `importacion` → `app`.

| Test | Qué verifica | Cubre |
|------|--------------|-------|
| `test/csvBanco.test.ts` — encabezado | Un CSV con encabezado y una fila devuelve una sola fila | R1.2 |
| ídem — conversión de fecha | `03/09/2026` → `2026-09-03` | R1.3 |
| ídem — líneas vacías | Líneas en blanco intermedias y la final no fallan ni generan filas | R1.6 |
| ídem — campos de más o de menos | 2 y 4 campos → `ok: false` con la línea correcta | R1.10, R1.14 |
| ídem — fecha inválida | `2026-09-03` y `31/02/2026` → `ok: false` | R1.11, R1.14 |
| ídem — monto no numérico | `abc`, `""`, `1.234,50` → `ok: false` | R1.12, R1.14 |
| ídem — descripción vacía | `"  "` → `ok: false` | R1.13, R1.14 |
| ídem — número de línea | Error en la 4.ª línea física (con una vacía antes) informa `linea: 4` | R1.14 |
| `test/categorias.test.ts` — coincidencia | Descripción con palabra de una regla → esa categoría | R2.1 |
| ídem — mayúsculas | `SUPERMERCADO` coincide con `supermercado` | R2.2 |
| ídem — primera gana | Con dos reglas que coinciden, gana la primera; con `REGLAS`, `UBER EATS` → Comida | R2.3 |
| ídem — sin coincidencia | → `Sin categoría` | R2.4 |
| `test/importacion.test.ts` — una por fila de gasto | 3 gastos → 3 movimientos | R1.1 |
| ídem — valor absoluto | `-5200` → `monto: 5200` | R1.4 |
| ídem — créditos | Montos `> 0` y `0` no se importan | R1.5 |
| ídem — duplicado contra guardado | Fila igual a un existente no se importa | R3.1 |
| ídem — iguales dentro del archivo | Dos filas iguales sin existente → dos movimientos | R3.2 |
| ídem — contadores | `resumen` cuenta importados, duplicados y no gastos | R4.1, R4.2, R4.3 |
| ídem — `formatearResumen` | Contiene las tres líneas con sus números | R4.1, R4.2, R4.3 |
| `test/app.test.ts` — importación válida | Guarda los movimientos del CSV y devuelve 0 | R1.1, R4.4 |
| ídem — conserva lo previo | Un movimiento cargado antes con `agregar` sigue ahí | R1.7 |
| ídem — `listar` muestra lo importado | `ejecutar(['listar','2026-09'])` incluye la descripción importada | R1.8 |
| ídem — `listar` muestra Sin categoría | La línea del movimiento sin coincidencia dice `Sin categoría` | R2.5 |
| ídem — archivo inexistente | stderr contiene la ruta, código ≠ 0 | R1.9, R1.15 |
| ídem — archivo rechazado | Datos sin cambios, stderr con el número de línea, código ≠ 0 | R1.10, R1.14, R1.15 |
| ídem — mismo archivo dos veces | La segunda corrida no agrega nada | R3.3 |
| ídem — sin ruta | stderr con el uso, código ≠ 0 | R1.16 |

## Decisiones y alternativas descartadas

| Decisión | Alternativa considerada | Por qué se descartó |
|----------|-------------------------|---------------------|
| Parser propio con `split(',')` | Librería de CSV (`csv-parse`, `papaparse`) | El formato es fijo y sin comillas; `CLAUDE.md` pide no sumar dependencias sin necesidad. Si el banco resulta usar comillas, se revisa con una enmienda |
| Reglas en una constante del código | Archivo JSON de reglas editable | Supuesto aprobado (lo más simple). La constante queda aislada en `categorias.ts` para migrarla fácil si hace falta |
| `ejecutar` en proceso para testear la CLI | Lanzar `node dist/cli.js` desde los tests | Obliga a compilar antes de testear, y `build` no está en el comando de corrección. Además es más lento y frágil |
| Validar todo el archivo antes de planificar | Validar e importar fila por fila | Con fila por fila, rechazar el archivo entero (R1.10–R1.13) exigiría deshacer cambios |
| Duplicados solo contra lo guardado | También dentro del archivo | R3.2 lo pide explícitamente: dos compras iguales el mismo día pueden ser reales |
| Monto con regex estricta | `Number(campo)` + `isFinite` | `Number` acepta `""` (→ 0), `1e3` y espacios. Con eso, filas mal formadas pasarían como créditos |

## Riesgos y preguntas abiertas

- **El formato no se comprobó contra un export real.** Es el riesgo principal. Conviene conseguir un
  CSV del banco antes de T1. Si difiere (`;`, comillas, coma decimal), se enmienda R1 y esta sección.
- **Falsos positivos por subcadena:** `cine` coincide con `MEDICINE`, `sube` con `SUBEMPRESA`, y así.
  Es aceptable con este alcance (el error se ve al listar), pero conviene elegir las palabras
  pensando en eso.
- **Alineación en `listar`:** hoy la categoría se rellena a 10 caracteres y `Sin categoría` tiene 13,
  así que esas líneas quedan corridas. Es cosmético y ningún criterio lo cubre. Si molesta, va al
  backlog.
- **Mover la lógica de `cli.ts` a `app.ts`** toca `agregar` y `listar`, que hoy no tienen tests de
  CLI. El movimiento es mecánico, pero ningún test lo protege.

## Enmiendas
