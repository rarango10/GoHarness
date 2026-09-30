import { defineConfig } from 'vitest/config'

/**
 * Vitest toma por defecto todo `**\/*.{test,spec}.ts`, lo que incluiría los specs de Playwright
 * de `end2end/`. Correrían bajo el runner equivocado y el comando de tests fallaría por una razón
 * que no tiene nada que ver con el código — y peor: fallaría recién cuando el ciclo e2e poble esa
 * carpeta, invalidando veredictos de tareas que nadie tocó. Los dos runners conviven excluyendo
 * esa carpeta acá, desde el día uno.
 */
export default defineConfig({
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', 'end2end/**'],
    // DOM de pruebas. Si el proyecto tiene JavaScript de cliente con comportamiento —un clic que
    // cambia lo que se ve—, los criterios de *efecto* necesitan un DOM en el paso 5: una función
    // pura probada muestra que la regla está bien, no que el clic haga algo. Default: jsdom (el
    // más fiel a los estándares; el que asume Testing Library). Se instala con `npm i -D jsdom`.
    // Para activarlo en todo el proyecto, descomentá la línea de abajo; para un solo archivo,
    // alcanza con `// @vitest-environment jsdom` en su primera línea. Sin JavaScript de cliente,
    // no hace falta.
    // environment: 'jsdom',
  },
})
