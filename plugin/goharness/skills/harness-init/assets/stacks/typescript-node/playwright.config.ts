import { defineConfig, devices } from '@playwright/test'

/**
 * Configuración de los tests end-to-end del ciclo `verify-e2e`.
 *
 * Queda listo antes de que exista una interfaz. Mientras no la haya, la fase 1 de `verify-e2e`
 * detecta la falta de superficie navegable y detiene el ciclo antes de generar ningún test.
 *
 * La URL base y el comando que levanta la app se leen del entorno en vez de estar fijos: cuando
 * aparezca la interfaz se completan acá o se pasan por variable, sin tocar los tests.
 *
 * Si la superficie es estática (un HTML generado por un script, sin servidor) no hace falta
 * `webServer`: dejá `E2E_WEB_SERVER` sin definir y que los specs abran el archivo directo con
 * `file://` — no hay nada que levantar ni que esperar.
 */

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:5173'
const webServerCommand = process.env.E2E_WEB_SERVER

export default defineConfig({
  // Un directorio por spec: end2end/AAAA-MM-DD-<feature>/e1-<tema>.spec.ts
  testDir: 'end2end',

  // Sin reintentos, a propósito. Un caso que pasa en el segundo intento es un hallazgo —el test
  // es inestable— y el `e2e-triager` lo tiene que ver como tal, no como un caso resuelto.
  retries: 0,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,

  // El reporte que lee el triager para diagnosticar: `list` en consola y el JSON con el detalle
  // por caso. No abre el reporte HTML solo, que en una corrida de agente cuelga el proceso.
  reporter: [['list'], ['json', { outputFile: 'end2end/.results/results.json' }]],

  use: {
    baseURL,
    // 'retain-on-failure' y no 'on-first-retry': con retries: 0 arriba, un reintento nunca ocurre,
    // así que 'on-first-retry' nunca graba nada — el triager termina diagnosticando sin trace. Acá
    // se graba en el primer y único intento si falla.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  // Se activa solo si E2E_WEB_SERVER dice cómo levantar la app. Mientras no exista, Playwright no
  // intenta arrancar nada y el fallo es claro en vez de un timeout de dos minutos.
  ...(webServerCommand
    ? { webServer: { command: webServerCommand, url: baseURL, reuseExistingServer: !process.env.CI } }
    : {}),
})
