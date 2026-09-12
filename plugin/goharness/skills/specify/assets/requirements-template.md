# Requirements — <Nombre de la feature>

> Estado: pendiente de aprobación | aprobado (AAAA-MM-DD)

## Introducción

<Uno o dos párrafos: qué problema resuelve esta feature, para quién, y cómo se ve el resultado
cuando está funcionando. Escribí el problema, no la solución — el "cómo" va en design.md.>

## Alcance

**Incluye**
- <capacidad concreta que sí entra>
- <...>

**No incluye (por ahora)**
- <lo que deliberadamente queda afuera, y en una frase por qué>
- <...>

## Requirements

### R1 — <título corto y descriptivo>

**User story:** Como <rol>, quiero <capacidad>, para <beneficio>.

#### Criterios de aceptación

1. WHEN <condición o evento observable>
   THE SYSTEM SHALL <comportamiento verificable>
2. IF <condición no deseada o caso borde>
   THEN THE SYSTEM SHALL <respuesta esperada>
3. <...>

### R2 — <título corto y descriptivo>

**User story:** Como <rol>, quiero <capacidad>, para <beneficio>.

#### Criterios de aceptación

1. WHEN <...>
   THE SYSTEM SHALL <...>
2. <...>

## Supuestos

- <cosas que estás dando por ciertas y que, si resultan falsas, cambian el spec>

## Preguntas abiertas

- <lo que quedó sin decidir, con quién lo tiene que decidir y qué bloquea si no se decide>

<!--
Recordatorios al escribir:

- Numeración: los criterios se citan como R1.1, R1.2 desde design.md y desde los tests.
  Si insertás un requisito nuevo en el medio, revisá qué referencias quedan desfasadas.
- Un criterio, un comportamiento. Si tiene un "y", un "y también" o un "además", casi seguro son
  dos criterios — partilo. La fase 1 tiene un paso dedicado a releer buscando conjunciones, y
  existe porque esta regla se saltea sola: el criterio compuesto se lee natural al escribirlo y el
  costo aparece dos pasos después, cuando una cláusula queda con test y la otra sin, y el
  verificador no tiene cómo decir "medio cumplido" porque su veredicto es por criterio.
- Verificable: alguien tiene que poder escribir un test automatizado que falle si no se cumple.
  "El sistema debe ser rápido" no es verificable; "THE SYSTEM SHALL responder en menos de 2 s
  para archivos de hasta 5.000 filas" sí.
- Sin implementación: nada de nombres de funciones, archivos ni librerías acá. Si te sale
  escribirlo, es material para design.md.
- Los patrones EARS completos están en ../references/ears-patterns.md
-->
