# Requirements — Raíz cuadrada y cuadrado

> Estado: aprobado (2026-09-13)

## Introducción

La calculadora hoy tiene cuatro botones de operación binaria (sumar, restar, multiplicar,
dividir) que actúan sobre las dos casillas de entrada. Esta feature agrega dos botones de
operación unaria —raíz cuadrada y elevar al cuadrado— que actúan solo sobre la primera casilla de
entrada, mostrando el resultado en la misma casilla de solo lectura que ya existe.

## Alcance

**Incluye**
- Un botón de raíz cuadrada y un botón de elevar al cuadrado, ubicados debajo de los cuatro
  botones de operación existentes.
- Ambos botones operan exclusivamente sobre el valor de la primera casilla de entrada.
- Un comportamiento explícito de error cuando la raíz cuadrada no está definida (número
  negativo).
- El mismo look and feel (estilo visual) que los cuatro botones de operación existentes.

**No incluye (por ahora)**
- Cualquier cambio a los cuatro botones de operación binaria existentes o al botón "Limpiar".
- Cualquier uso de la segunda casilla de entrada por parte de estos dos botones nuevos — su
  contenido se ignora sin validarse ni deshabilitar nada en función de él.
- Encadenar operaciones (usar el resultado como entrada de un cálculo siguiente).
- Mensajes de error distintos según la causa — se reutiliza el mismo texto "Error" ya usado por
  la división por cero.

## Requirements

### R1 — Mostrar los botones de raíz cuadrada y cuadrado

**User story:** Como usuario, quiero ver un botón de raíz cuadrada y uno de elevar al cuadrado,
para poder aplicar esa operación al número que escribí.

#### Criterios de aceptación

1. THE SYSTEM SHALL mostrar un botón para raíz cuadrada y un botón para elevar al cuadrado,
   ambos debajo de los cuatro botones de operación existentes (sumar, restar, multiplicar,
   dividir) y arriba del botón "Limpiar".
2. THE SYSTEM SHALL exponer "Raíz cuadrada" y "Elevar al cuadrado" como el nombre accesible de
   cada botón nuevo, respectivamente.

### R2 — Raíz cuadrada

**User story:** Como usuario, quiero presionar "Raíz cuadrada" para obtener la raíz cuadrada del
primer número, para ver el resultado en la casilla de resultado.

#### Criterios de aceptación

1. WHEN el usuario presiona "Raíz cuadrada" con la primera casilla conteniendo un número mayor o
   igual a 0, THE SYSTEM SHALL mostrar en la casilla de resultado la raíz cuadrada de ese número.
2. IF el valor interpretado de la primera casilla es negativo al presionar "Raíz cuadrada", THEN
   THE SYSTEM SHALL mostrar "Error" en la casilla de resultado en lugar de un valor numérico.
3. IF la primera casilla está vacía, contiene solo espacios, o contiene texto que no es un número
   válido al presionar "Raíz cuadrada", THEN THE SYSTEM SHALL tratar su valor como 0 y mostrar el
   resultado de la raíz cuadrada de 0.

### R3 — Elevar al cuadrado

**User story:** Como usuario, quiero presionar "Elevar al cuadrado" para obtener el cuadrado del
primer número, para ver el resultado en la casilla de resultado.

#### Criterios de aceptación

1. WHEN el usuario presiona "Elevar al cuadrado", THE SYSTEM SHALL mostrar en la casilla de
   resultado el cuadrado del valor de la primera casilla de entrada, incluyendo cuando ese valor
   es negativo.
2. IF la primera casilla está vacía, contiene solo espacios, o contiene texto que no es un número
   válido al presionar "Elevar al cuadrado", THEN THE SYSTEM SHALL tratar su valor como 0 y
   mostrar el resultado del cuadrado de 0.

### R4 — Reglas compartidas por los botones nuevos

**User story:** Como usuario, quiero que estos dos botones se comporten de forma consistente con
el resto de la calculadora, para no tener que aprender reglas distintas.

#### Criterios de aceptación

1. WHEN el usuario presiona "Raíz cuadrada" o "Elevar al cuadrado", THE SYSTEM SHALL ignorar por
   completo el contenido de la segunda casilla de entrada, sin leerlo ni validarlo.
2. WHEN el usuario presiona "Raíz cuadrada" o "Elevar al cuadrado", THE SYSTEM SHALL reemplazar
   el valor de la casilla de resultado por el de ese cálculo, sin acumular ni conservar el
   resultado de un cálculo anterior.
3. WHEN el resultado de raíz cuadrada o cuadrado produce un error de representación binaria de
   punto flotante, THE SYSTEM SHALL mostrar el resultado matemáticamente correcto sin dígitos de
   error visibles.

## Supuestos

- El resultado se sigue mostrando en la misma casilla de solo lectura que ya existe; no se agrega
  ninguna casilla nueva.
- "Error" es el único texto de error posible, igual que en la feature de operaciones binarias
  (`docs/2026-09-07-calculadora-operaciones/requirements.md`).
- La interpretación de la primera casilla (vacío/inválido → 0, decimales con punto) reutiliza las
  mismas reglas ya vigentes para los operandos de las operaciones binarias.

## Preguntas abiertas

Ninguna. El operando único (primera casilla), el comportamiento ante raíz de negativo ("Error") y
la irrelevancia del contenido de la segunda casilla se acordaron con el usuario en el
brainstorming previo a este documento.
