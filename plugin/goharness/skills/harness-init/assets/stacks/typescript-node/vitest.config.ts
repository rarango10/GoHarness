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
  },
})
