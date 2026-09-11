import { expect, test } from '@playwright/test'

// Plan: docs/2026-09-07-calculadora-operaciones/e2e-tests-plan.md — caso E3
test('E3 (R4.3): un divisor no numérico también muestra "Error"', async ({
  page,
}) => {
  // Paso 1: navegar a `/`.
  await page.goto('/')

  const primerNumero = page.getByRole('textbox', { name: 'Primer número' })
  const segundoNumero = page.getByRole('textbox', { name: 'Segundo número' })
  const resultado = page.getByRole('textbox', { name: 'Resultado' })

  // Paso 2: escribir "8" en "Primer número" y "abc" en "Segundo número".
  await primerNumero.fill('8')
  await segundoNumero.fill('abc')

  // Paso 3: hacer click en "Dividir".
  await page.getByRole('button', { name: 'Dividir' }).click()

  // Resultado esperado: "Resultado" muestra "Error" — el divisor no numérico se trató como 0,
  // mismo resultado visible que dividir por el "0" literal de E2.
  await expect(resultado).toHaveValue('Error')
})
