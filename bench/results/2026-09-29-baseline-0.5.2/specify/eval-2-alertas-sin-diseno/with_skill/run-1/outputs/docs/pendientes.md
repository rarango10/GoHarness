# Pendientes del proyecto

## P1 · `agregar` no valida la categoría · `abierto`

- **Estado:** `abierto`
- **De dónde salió:** brainstorming de `docs/2026-09-29-alertas-presupuesto/` (2026-09-29)
- **Evidencia:** en `src/cli.ts`, `agregar` castea el cuarto argumento a `Categoria` sin
  comprobarlo, y `validarMovimiento` (`src/movimientos.ts`) no revisa la categoría. Un
  `finanzas agregar 2026-09-03 Super 5200 comida` se guarda con categoría `comida`.
- **Lo que se sabe:** un movimiento con una categoría mal escrita queda fuera de las seis
  categorías. Con las alertas de presupuesto, ese gasto nunca suma para el presupuesto de la
  categoría que se quiso poner.
- **Lo que no se sabe:** si ya hay movimientos guardados con categorías inválidas en los datos
  reales. Validar a partir de ahora no los corrige.
- **Qué no hacer:** no arreglarlo dentro de alertas de presupuesto. Cambia el comportamiento de
  `agregar` y queda fuera del diseño aprobado.
- **Para quién:** una feature chica sobre el registro de movimientos (`validarMovimiento`).
