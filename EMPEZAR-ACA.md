# Empezá acá

Este repo es **dos cosas a la vez**, y se trabaja de dos formas que no se mezclan.

1. **GoHarness**, un ciclo de desarrollo asistido por agentes para Claude Code, empaquetado como
   plugin instalable. El código fuente del plugin vive en `plugin/goharness/`.
2. **Una calculadora**, construida enteramente con ese ciclo. Es el ejemplo: existe para mostrar el
   método funcionando, con todo su rastro documental en `docs/`.

De ahí salen dos modos de trabajo. **Averiguá en cuál estás antes de tocar nada.**

## Los dos modos

| | **Consumidor** | **Mantenedor** |
|---|---|---|
| Qué querés | construir software con el harness | mejorar el harness |
| Dónde trabajás | en **tu** proyecto, no en este repo | en este repo |
| Cómo lo obtenés | `claude plugin install goharness@goharness` | clonás este repo |
| Qué leés | [`README.md`](README.md) | [`HARNESS.md`](HARNESS.md) |
| Qué editás | tu código y tus `docs/` | `plugin/goharness/` y `lecciones.md` |
| Qué **no** tocás | nada del plugin: se actualiza con `plugin update` | el ciclo del ejemplo a mano |
| Cómo verificás | los comandos de **tu** `CLAUDE.md` | `validate`, el linter y una instalación de prueba |

## Cómo saber en cuál estás

Dos preguntas, y con una alcanza:

- **¿La carpeta donde estoy parado es este repo, o es un proyecto mío?** Si es un proyecto tuyo, sos
  consumidor y este repo no debería estar clonado ahí.
- **¿Lo que voy a editar está adentro de `plugin/goharness/`?** Si la respuesta es sí, sos
  mantenedor, y aplican las reglas de [`HARNESS.md`](HARNESS.md).

## Las dos puertas

**Consumidor** — en tu proyecto, no acá:

```bash
claude plugin marketplace add rarango10/GoHarness
claude plugin install goharness@goharness
```

Después abrí una sesión en tu proyecto y pedí el paso 0: **«preparemos el proyecto»**. El resto lo
explica el [`README.md`](README.md).

**Mantenedor** — en este repo:

> «Vengo a mejorar el harness. Leé `HARNESS.md` y después el índice de estado de `lecciones.md`.»

**¿Y si querés el harness sin instalar el plugin?** Es el caso de quien forkea para publicar su
propia versión o para usarla sin pasar por este marketplace: la receta está en
[«Forkearlo y publicar el tuyo»](README.md#forkearlo-y-publicar-el-tuyo) del README. En cualquier
caso, **no copies el `CLAUDE.md` de la raíz**: es el contrato de la calculadora, con las decisiones
de ese proyecto. El de tu proyecto lo arma `harness-init` desde la plantilla, en el paso 0.

## La regla que cruza los dos modos

**No se edita el harness mientras hay una corrida del ciclo en vuelo.** Cambiar un skill a mitad de
camino invalida el resultado: después no se puede distinguir qué causó qué. Está en el encabezado de
[`lecciones.md`](lecciones.md), y es la única regla que vale para los dos lados.

## Si volvés después de meses

Leé en este orden, y con los tres primeros alcanza para saber qué tocar:

1. **Este archivo** — en qué modo estás.
2. **El índice de estado de [`lecciones.md`](lecciones.md)** — qué está hecho, qué queda, y cuáles
   arreglos ya tienen la solución escrita (`listo para aplicar`).
3. **[`HARNESS.md`](HARNESS.md)** — dónde está la fuente, cómo se itera y cómo se verifica.
4. **[`docs/2026-09-12-modos-de-trabajo/plan.md`](docs/2026-09-12-modos-de-trabajo/plan.md)** — el
   plan que produjo estos archivos, por si hace falta el porqué y no solo el qué.
