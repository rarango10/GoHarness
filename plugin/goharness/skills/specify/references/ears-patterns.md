# Patrones EARS

EARS (Easy Approach to Requirements Syntax) es un conjunto chico de plantillas para escribir
requisitos. La gracia no es la ceremonia: es que obliga a decir **bajo qué condición** el sistema
hace **qué cosa observable**, y eso se traduce casi uno a uno en un test.

En este proyecto la prosa va en español y las palabras clave en inglés (`WHEN`, `IF`/`THEN`,
`WHILE`, `WHERE`, `THE SYSTEM SHALL`), como vocabulario formal reconocible.

## Los 5 patrones

### 1. Ubicuo — siempre vale, sin condición

```
THE SYSTEM SHALL <comportamiento>
```

Para reglas que rigen en todo momento. Si te sale escribir muchos de estos, sospechá: casi
siempre hay una condición implícita que conviene explicitar.

> THE SYSTEM SHALL registrar cada transacción con fecha, monto y categoría.

### 2. Dirigido por evento — `WHEN`

```
WHEN <evento o condición>
THE SYSTEM SHALL <comportamiento>
```

El caso más común: algo pasa, el sistema responde.

> WHEN el usuario ejecuta el comando de importación con un archivo CSV válido
> THE SYSTEM SHALL crear una transacción por cada fila e informar cuántas importó.

### 3. Comportamiento no deseado — `IF` / `THEN`

```
IF <condición no deseada o caso borde>
THEN THE SYSTEM SHALL <respuesta>
```

Para errores, datos inválidos y todo lo que puede salir mal. Es el patrón que después se
convierte en la tabla de manejo de errores del design.

> IF una fila del CSV tiene un monto no numérico
> THEN THE SYSTEM SHALL omitir esa fila, reportarla al final y continuar con el resto.

### 4. Dirigido por estado — `WHILE`

```
WHILE <estado en curso>
THE SYSTEM SHALL <comportamiento>
```

Para lo que vale mientras dura una situación, no en un instante puntual.

> WHILE una importación está en curso
> THE SYSTEM SHALL rechazar una segunda importación sobre el mismo archivo.

### 5. Opcional / condicionado a una capacidad — `WHERE`

```
WHERE <la característica o configuración está presente>
THE SYSTEM SHALL <comportamiento>
```

Para lo que aplica solo si cierta opción está habilitada o cierto dato existe.

> WHERE el usuario definió un presupuesto para la categoría
> THE SYSTEM SHALL mostrar el porcentaje usado junto al monto gastado.

## Combinaciones

Se pueden encadenar cuando el caso lo pide, pero sin pasarse: si un criterio necesita tres
condiciones anidadas para entenderse, probablemente sean varios criterios.

> WHEN el usuario importa un archivo ya importado antes
> IF la detección de duplicados está activa
> THEN THE SYSTEM SHALL omitir los movimientos repetidos e informar cuántos omitió.

## Criterios de apariencia

Solo hacen falta cuando `design.md` va a declarar una referencia visual **normativa** (la tabla
adoptar / adaptar / descartar sale del brainstorming). Sin ellos, la referencia no existe para el
ciclo: nadie la verifica, porque ningún criterio la nombra, y un spec que solo pide «los colores del
sistema» termina con un resultado que cumple todo y no se parece.

«Se ve como el mockup» no es verificable, igual que «el sistema debe ser rápido». La salida es la
misma: bajar la cualidad a algo comprobable. Cada pieza que la tabla marca `adoptar` o `adaptar`
entra en alguno de estos cuatro tipos:

- **Inventario** — qué partes hay y en qué orden.
  > THE SYSTEM SHALL mostrar, en este orden: el cumplimiento del día, el resumen del día y la línea
  > de tiempo.
- **Estructura** — cómo se ubican unas respecto de otras.
  > THE SYSTEM SHALL mostrar el cumplimiento del día y el resumen del día en una misma fila, con el
  > cumplimiento al doble de ancho que el resumen.
- **Componente** — con qué forma se muestra un dato.
  > THE SYSTEM SHALL representar el porcentaje de cumplimiento como un anillo de progreso.
- **Token** — qué vocabulario visual se usa.
  > THE SYSTEM SHALL usar solo colores declarados en la tabla de tokens del sistema de diseño.

Nombrar los tokens o las piezas de un sistema de diseño **no** es «implementación disfrazada de
requisito» (ver abajo): el valor lo fija algo externo, y eso lo hace requisito. Lo que sigue siendo
del design es *cómo* se construye — con qué archivos, funciones o estructura de CSS.

**Y cada criterio de apariencia dice quién lo mira y contra qué.** Un test sobre CSS no distingue
una grilla de doce columnas de una pila de una columna: las dos usan los mismos tokens. Solo el de
token se prueba bien con un test; los otros tres se comprueban **mirando la pantalla al lado de la
referencia**, y eso lo hace `close-feature` antes de cerrar. Si el criterio no lo dice, el
verificador lo termina dando por cumplido leyendo código, que es justo donde la diferencia no se ve.

## Errores típicos

**Comportamiento no observable.** Si no se puede escribir un test que falle cuando no se cumple,
no es un criterio de aceptación.

- ✗ THE SYSTEM SHALL manejar los CSV de forma eficiente.
- ✓ WHEN se importa un archivo de hasta 5.000 filas, THE SYSTEM SHALL completar la importación en menos de 2 segundos.

**Dos comportamientos en un criterio.** El "y además" es la pista.

- ✗ WHEN se importa un CSV, THE SYSTEM SHALL categorizar los movimientos y detectar duplicados y mostrar un resumen.
- ✓ Tres criterios separados, cada uno verificable por su cuenta.

**Implementación disfrazada de requisito.** Nombres de funciones, archivos o librerías son
decisiones de diseño, no necesidades del usuario.

- ✗ THE SYSTEM SHALL usar `csv-parse` para leer el archivo.
- ✓ WHEN el archivo tiene el formato esperado (fecha, descripción, monto), THE SYSTEM SHALL leer todas sus filas. *(qué librería se usa se decide en design.md)*

**Condición vaga.** "Si algo sale mal" no dice cuándo.

- ✗ IF hay un problema con el archivo, THEN THE SYSTEM SHALL avisar.
- ✓ IF el archivo no existe en la ruta indicada, THEN THE SYSTEM SHALL terminar con un mensaje que indique la ruta buscada.

**Requisito sin dueño.** Si no se sabe qué rol lo necesita ni para qué, revisá si hace falta:
puede ser una feature que nadie pidió.
