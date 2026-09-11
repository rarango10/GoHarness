import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './end2end',

  // Sin reintentos, a propósito. Un caso que pasa en el segundo intento es un hallazgo —el test
  // es inestable— y el `e2e-triager` lo tiene que ver como tal, no como un caso resuelto.
  retries: 0,

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:5173',
  },
})
