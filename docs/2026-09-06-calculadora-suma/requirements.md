# Requirements — Calculadora de suma

> Estado: aprobado (2026-09-06)

## Introducción

Una calculadora web muy básica que suma dos números. La persona escribe un valor en cada una de
dos casillas, aprieta un botón para calcular, y ve el resultado en una tercera casilla. Un
segundo botón le permite borrar todo y empezar de nuevo. No hay más operaciones que la suma en
esta primera versión.

## Alcance

**Incluye**
- Dos casillas editables para ingresar los números a sumar.
- Una tercera casilla de solo lectura que muestra el resultado.
- Un botón que ejecuta la suma y actualiza el resultado.
- Un botón que vacía las tres casillas.
- Tratar una casilla vacía o con texto no numérico como 0 al calcular.
- Soportar números negativos y decimales, usando punto como separador decimal.

**No incluye (por ahora)**
- Otras operaciones aritméticas (resta, multiplicación, división) — es una calculadora de una
  sola operación.
- Interpretar la coma como separador decimal.
- Persistencia del resultado o de un historial entre sesiones.
- Atajos de teclado (por ejemplo, Enter para calcular).
- Mensajes de error visibles para entradas inválidas — se resuelven en silencio tratándolas
  como 0.

## Requirements

### R1 — Mostrar la calculadora

**User story:** Como usuario, quiero ver dos casillas para ingresar números y una tercera con el
resultado, junto con los botones de acción, para poder hacer una suma simple.

#### Criterios de aceptación

1. THE SYSTEM SHALL mostrar dos campos editables para ingresar los números a sumar y un tercer
   campo de solo lectura para el resultado.
2. THE SYSTEM SHALL mostrar un botón "Calcular" y un botón "Limpiar".
3. WHEN la página carga por primera vez, THE SYSTEM SHALL mostrar las tres casillas vacías.

### R2 — Calcular la suma

**User story:** Como usuario, quiero que al presionar "Calcular" se sumen los valores de las dos
casillas de entrada, para ver el resultado en la tercera.

#### Criterios de aceptación

1. WHEN el usuario presiona "Calcular" con dos números válidos en las casillas de entrada, THE
   SYSTEM SHALL mostrar la suma de ambos en la casilla de resultado.
2. IF una casilla de entrada está vacía (o queda vacía después de recortar espacios) al
   presionar "Calcular", THEN THE SYSTEM SHALL tratar su valor como 0 para el cálculo.
3. IF una casilla de entrada contiene texto que no es un número válido al presionar "Calcular"
   —incluido un número con coma como separador decimal, por ejemplo "3,5"— THEN THE SYSTEM SHALL
   tratar su valor como 0 para el cálculo.
4. WHEN una casilla de entrada contiene un número negativo o con decimales usando punto, THE
   SYSTEM SHALL incluirlo en la suma con su signo y su parte decimal.
5. WHEN la suma de dos decimales produce un error de representación binaria de punto flotante
   (por ejemplo, 0.1 + 0.2), THE SYSTEM SHALL mostrar el resultado matemáticamente correcto, sin
   dígitos de error visibles (0.3, no 0.30000000000000004).
6. WHEN el usuario presiona "Calcular" después de haber cambiado el contenido de alguna casilla
   de entrada desde el cálculo anterior, THE SYSTEM SHALL reemplazar el resultado mostrado por
   el de la nueva suma.

### R3 — Limpiar los valores

**User story:** Como usuario, quiero un botón que borre todo lo que ingresé, para empezar una
nueva cuenta sin borrar cada casilla a mano.

#### Criterios de aceptación

1. WHEN el usuario presiona "Limpiar", THE SYSTEM SHALL vaciar las dos casillas de entrada y la
   casilla de resultado.

### R4 — Accesibilidad de los controles

**User story:** Como persona que verifica la funcionalidad de forma automatizada, o que usa
tecnología de asistencia, quiero que cada casilla y cada botón tengan un nombre accesible, para
poder identificarlos sin depender de su posición visual o de clases CSS.

#### Criterios de aceptación

1. THE SYSTEM SHALL asociar cada una de las tres casillas con una etiqueta que describa su
   propósito ("Primer número", "Segundo número", "Resultado").
2. THE SYSTEM SHALL exponer "Calcular" y "Limpiar" como el nombre accesible del botón
   correspondiente.

## Supuestos

- El mecanismo concreto para eliminar el error de punto flotante de R2.5 (por ejemplo, redondear
  a una cantidad fija de decimales) lo define `design.md`; acá solo se fija el comportamiento
  observable.
- Los espacios en blanco alrededor de un número (por ejemplo, " 5 ") se recortan antes de
  evaluarlo. Si después de recortar la casilla queda vacía, se aplica R2.2.
- No hay un límite explícito de magnitud: un número que exceda la precisión segura de
  JavaScript queda fuera de alcance de esta primera versión.

## Preguntas abiertas

Ninguna. El separador decimal (solo punto) y el manejo del error de punto flotante en R2.5 se
acordaron con el usuario antes de escribir este documento.

## Vigencia

La cláusula "botón Calcular" de **R1.2** y el nombre accesible "Calcular" de **R4.2** quedaron
superados por `docs/2026-09-07-calculadora-operaciones/requirements.md` (R1), que reemplaza ese
botón único por cuatro botones de operación. El resto de este documento (R2, R3, R4.1) sigue
vigente: describe la lógica de suma y las reglas de interpretación de operandos, que la feature
nueva hereda sin cambios.
