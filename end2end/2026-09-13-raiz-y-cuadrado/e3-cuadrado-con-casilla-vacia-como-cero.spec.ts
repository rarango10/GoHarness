import { expect, test } from '@playwright/test'

// Plan: docs/2026-09-13-raiz-y-cuadrado/e2e-tests-plan.md — caso E3
test('E3 (R3.2): elevar al cuadrado con la primera casilla vacía trata el valor como 0', async ({
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

  // Paso 1: click en "Elevar al cuadrado" sin escribir nada en "Primer número".
  await page.getByRole('button', { name: 'Elevar al cuadrado' }).click()

  // Resultado esperado: "Resultado" muestra "0".
  await expect(resultado).toHaveValue('0')
})
