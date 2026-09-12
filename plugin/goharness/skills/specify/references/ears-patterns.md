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
