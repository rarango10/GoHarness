import { expect, test } from '@playwright/test'

// Plan: docs/2026-09-13-raiz-y-cuadrado/e2e-tests-plan.md — caso E2
test('E2 (R2.2): la raíz cuadrada de un número negativo muestra "Error"', async ({
  page,
}) => {
  await page.goto('/')

  const primerNumero = page.getByRole('textbox', { name: 'Primer número' })
  const segundoNumero = page.getByRole('textbox', { name: 'Segundo número' })
  const resultado = page.getByRole('textbox', { name: 'Resultado' })

  // Precondición declarada en el plan: app recién cargada, las tres casillas vacías.
  await expect(primerNumero).toHaveValue('')
  await expect(segundoNumero).toHaveValue('')
  await expect(resultado).toHaveValue('')

  // Paso 1: escribir "-4" en "Primer número".
  await primerNumero.fill('-4')

  // Paso 2: click en "Raíz cuadrada".
  await page.getByRole('button', { name: 'Raíz cuadrada' }).click()

  // Resultado esperado: "Resultado" muestra "Error", no un valor numérico.
  await expect(resultado).toHaveValue('Error')
})
