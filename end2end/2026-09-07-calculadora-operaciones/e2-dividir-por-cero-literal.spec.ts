import { expect, test } from '@playwright/test'

// Plan: docs/2026-09-07-calculadora-operaciones/e2e-tests-plan.md — caso E2
test('E2 (R4.2): dividir por el literal "0" muestra "Error"', async ({
  page,
}) => {
  // Paso 1: navegar a `/`.
  await page.goto('/')

  const primerNumero = page.getByRole('textbox', { name: 'Primer número' })
  const segundoNumero = page.getByRole('textbox', { name: 'Segundo número' })
  const resultado = page.getByRole('textbox', { name: 'Resultado' })

  // Paso 2: escribir "8" en "Primer número" y "0" en "Segundo número".
  await primerNumero.fill('8')
  await segundoNumero.fill('0')

  // Paso 3: hacer click en "Dividir".
  await page.getByRole('button', { name: 'Dividir' }).click()

  // Resultado esperado: "Resultado" muestra "Error", sin ningún valor numérico.
  await expect(resultado).toHaveValue('Error')
})
