import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    // Los specs de end2end/ son de Playwright, no de Vitest: su patrón include por
    // defecto los levantaría y fallarían al colectar.
    exclude: [...configDefaults.exclude, 'end2end/**'],
  },
})
