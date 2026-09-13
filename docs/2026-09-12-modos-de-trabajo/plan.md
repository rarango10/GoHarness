# Plan — Dos modos de trabajo

> **Ejecutado el 2026-09-12.** Produjo [`EMPEZAR-ACA.md`](../../EMPEZAR-ACA.md),
> [`HARNESS.md`](../../HARNESS.md), los punteros en `CLAUDE.md` y `README.md`, y el tag
> `semilla-v1`.
>
> Queda como el **porqué** de esos archivos. No se reabre: un ciclo nuevo escribe su propio plan en
> `docs/AAAA-MM-DD-<nombre>/`.

## Context

El 2026-09-12 se publicó la semilla como `rarango10/GoHarness`, `10X-mis-finanzas` quedó archivado y
los dos repos quedaron limpios y en sincronía.

El riesgo al parar no era perder código: era perder **contexto**. La conversación que produjo todo
esto no sobrevive, y el repo solo le hablaba a un lector — quien construye la calculadora. Quien
viene a **evolucionar el harness** no tenía de dónde agarrarse: nada decía que la fuente vive en
`plugin/goharness/`, cuál es el ciclo de desarrollo, ni cómo se verifica.

Se evaluó **partir el repo en dos**, uno por audiencia, y se descartó. Son separables sin tocar
código —cero acoplamiento entre los dos lados—, pero el comando de instalación quedaría apuntando a
un repo sin evidencia adentro, que es exactamente el problema que la mudanza desde 10X vino a
resolver. Y el loop de mejora —editar → sincronizar → **correr un ciclo real en el ejemplo** →
anotar la lección— cruzaría dos repos en cada vuelta, que es fricción sobre la operación más
frecuente del proyecto.

**Objetivo:** que una sesión nueva, en frío, sepa en treinta segundos en qué modo está y qué hacer.

## Los dos archivos, y por qué son dos

Se reparten el trabajo para no pisarse — escribir lo mismo en dos lados es [[L42]].

| Archivo | Qué es | Qué NO es |
|---|---|---|
| `EMPEZAR-ACA.md` | El **ruteo**: en qué modo estás, qué tocás y qué no, a dónde vas | No explica procedimientos: enruta |
| `HARNESS.md` | El **contrato del mantenedor**: fuente, ciclo de desarrollo, verificaciones | No repite las reglas del método, que viven en `CLAUDE.md` y en la plantilla |

`CLAUDE.md` no cambió de dueño: sigue siendo el contrato del **ejemplo**. Solo sumó un puntero, y
está ahí porque es el único archivo que toda sesión carga sola.

## Por qué un puntero y no una sección más

El `CLAUDE.md` de este repo **ya resuelve así un caso idéntico**: delega el ruteo de skills al plugin
en vez de duplicarlo («Este archivo no duplica la tabla de ruteo»). Delegar con un puntero es el
idioma de este repo. Y mantiene el `CLAUDE.md` como ejemplo limpio de contrato, que es una de las dos
razones por las que se conserva — la otra es que sin él el ejemplo no es ejecutable.

Va además en la dirección de [[L14]]: el contrato de un proyecto no debe meterse en territorio ajeno.

## Cuándo sí convendría partir el repo

Anotado para que la decisión quede fechada y no se relitigue. Tres señales:

- que la calculadora deje de ser ejemplo y tome vida propia;
- que aparezca gente de afuera contribuyendo al harness y el ruido del ejemplo moleste;
- que el ejemplo crezca tanto que clonar la semilla para leerla se vuelva caro.

Si ese día llega, `HARNESS.md` ya escrito se convierte en el README del repo del mantenedor. No se
tira nada.

## Lo que sigue

**El lote siguiente**, con el arreglo ya redactado en cada entrada de `lecciones.md`: **L36** (que
`planning-tasks` nombre `/workflows` al lanzar), **L39** (que el modo revisión de `harness-init` lea
el archivo entero buscando afirmaciones falsas, las que están y las que propone) y **L40** (que la
segunda ronda de una tarea espere el sí). Más el arreglo barato de **L9**: escribir la prohibición
de `dod-checker` sobre la **ejecución** y no sobre el efecto neto.

Los cuatro son prosa, viven en el plugin y se verifican con los mismos comandos.

**Después, la prueba real:** una feature nueva en la calculadora con el harness corregido. El ruteo
del ciclo e2e sigue con cero pruebas y es lo que más falta ejercitar.
