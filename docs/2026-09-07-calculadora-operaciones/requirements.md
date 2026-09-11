# Requirements — Calculadora de operaciones

> Estado: aprobado (2026-09-07)

## Introducción

La calculadora hoy solo suma: un único botón "Calcular" aplica esa operación a las dos casillas
de entrada. Esta feature agrega las otras tres operaciones aritméticas básicas —resta,
multiplicación y división— reemplazando ese botón único por cuatro botones, uno por operación,
que calculan de inmediato al tocarlos. El resultado se sigue mostrando en la misma casilla de
solo lectura que ya existe.

## Alcance

**Incluye**
- Cuatro botones de operación (sumar, restar, multiplicar, dividir) que reemplazan al botón
  "Calcular" existente.
- Cada botón ejecuta su operación de inmediato sobre los valores de las dos casillas de entrada
  existentes y muestra el resultado, reemplazando cualquier resultado anterior.
- Restar y multiplicar los dos números, heredando las mismas reglas de interpretación de
  operandos ya vigentes para la suma (vacío/inválido → 0, signo negativo, decimales con punto,
  eliminación de ruido de punto flotante).
- Dividir los dos números con las mismas reglas de interpretación, más un comportamiento
  explícito para cuando el divisor es 0.
- Un texto de error explícito en la casilla de resultado cuando la división no está definida.

**No incluye (por ahora)**
- Cambios al botón "Limpiar" — sigue vaciando las tres casillas igual que hoy.
- Cambios al formato de operando aceptado — sigue sin admitir coma decimal, notación científica
  ni otros formatos; mismas reglas que la feature de suma.
- Encadenar operaciones (usar el resultado de un cálculo como operando del siguiente) — cada
  botón opera siempre sobre el contenido actual de las dos casillas de entrada.
- Un selector de operación independiente de los botones — se consideró y se descartó en el
  brainstorming a favor de cuatro botones que calculan al toque.
- Mensajes de error distintos según la causa — todo caso no definido muestra el mismo texto
  "Error".

## Requirements

### R1 — Mostrar los botones de operación

**User story:** Como usuario, quiero ver un botón por cada operación aritmética disponible, para
elegir cuál aplicar a los números que escribí.

#### Criterios de aceptación

1. THE SYSTEM SHALL mostrar cuatro botones de operación: uno para sumar, uno para restar, uno
   para multiplicar y uno para dividir.
2. THE SYSTEM SHALL exponer "Sumar", "Restar", "Multiplicar" y "Dividir" como el nombre accesible
   de cada botón de operación, respectivamente.
3. THE SYSTEM SHALL NOT mostrar ningún control con nombre accesible "Calcular".

### R2 — Restar

**User story:** Como usuario, quiero presionar "Restar" para restar el segundo número del
primero, para ver la diferencia en la casilla de resultado.

#### Criterios de aceptación

1. WHEN el usuario presiona "Restar", THE SYSTEM SHALL mostrar en la casilla de resultado el
   valor de la primera casilla de entrada menos el de la segunda.

### R3 — Multiplicar

**User story:** Como usuario, quiero presionar "Multiplicar" para multiplicar los dos números,
para ver el producto en la casilla de resultado.

#### Criterios de aceptación

1. WHEN el usuario presiona "Multiplicar", THE SYSTEM SHALL mostrar en la casilla de resultado
   el producto de las dos casillas de entrada.

### R4 — Dividir

**User story:** Como usuario, quiero presionar "Dividir" para dividir el primer número por el
segundo, para ver el cociente en la casilla de resultado, y enterarme con claridad cuando la
división no tiene sentido matemático.

#### Criterios de aceptación

1. WHEN el usuario presiona "Dividir" con un divisor (segunda casilla) distinto de 0, THE SYSTEM
   SHALL mostrar en la casilla de resultado el valor de la primera casilla de entrada dividido
   por el de la segunda.
2. IF el divisor interpretado de la segunda casilla es 0 (por ejemplo, la casilla contiene
   literalmente "0") al presionar "Dividir", THEN THE SYSTEM SHALL mostrar "Error" en la casilla
   de resultado en lugar de un valor numérico.
3. IF la segunda casilla está vacía, contiene solo espacios, o contiene texto que no es un
   número válido al presionar "Dividir", THEN THE SYSTEM SHALL tratar el divisor como 0 y mostrar
   "Error" en la casilla de resultado, con el mismo comportamiento que R4.2.

### R5 — Reglas compartidas por los botones de operación

**User story:** Como usuario, quiero que las reglas de interpretación y de reemplazo de
resultado sean consistentes sin importar qué botón de operación presione, para no tener que
recordar comportamientos distintos por operación.

#### Criterios de aceptación

1. WHEN el usuario presiona cualquier botón de operación (Sumar, Restar, Multiplicar, Dividir),
   THE SYSTEM SHALL reemplazar el valor de la casilla de resultado por el de ese cálculo, sin
   acumular ni conservar el resultado de un cálculo anterior — incluido el caso de presionar un
   botón de una operación distinta a la del cálculo anterior.
2. IF una casilla de entrada está vacía, contiene solo espacios, o contiene texto que no es un
   número válido al presionar un botón de operación, THEN THE SYSTEM SHALL tratar su valor como 0
   para ese cálculo (excepto el caso del divisor en "Dividir", cubierto por R4.3).
3. WHEN una casilla de entrada contiene un número negativo o con decimales separados por punto,
   THE SYSTEM SHALL incluirlo en el cálculo con su signo y su parte decimal.
4. WHEN el resultado de restar, multiplicar o dividir produce un error de representación binaria
   de punto flotante, THE SYSTEM SHALL mostrar el resultado matemáticamente correcto sin dígitos
   de error visibles.

## Supuestos

- El resultado se sigue mostrando en la misma casilla de solo lectura que ya existe; no se agrega
  ninguna casilla nueva.
- "Error" es el único texto que puede aparecer en la casilla de resultado además de un número; no
  hay mensajes distintos según la causa del error.
- Los cuatro botones de operación reemplazan íntegramente al botón "Calcular": no queda ningún
  control con ese nombre accesible después de esta feature.
- Un resultado negativo (por ejemplo, restar "3" − "5") se muestra con el signo "-" al frente,
  igual que ya se muestra hoy un operando negativo — sin formato especial nuevo.
- R5.2 (operando inválido → 0) es la misma regla ya vigente para la suma (R2.2/R2.3 de
  `docs/2026-09-06-calculadora-suma/requirements.md`), extendida acá a las tres operaciones
  nuevas.

## Preguntas abiertas

Ninguna. El modelo de botones (cuatro botones que calculan al toque, sin selector de operación),
el comportamiento de la división por cero (texto "Error") y los nombres accesibles de los
botones (símbolo visible + aria-label en palabras) se acordaron con el usuario en el
brainstorming previo a este documento.
