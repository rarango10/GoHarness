import { expect, test } from '@playwright/test'

// Plan: docs/2026-09-06-calculadora-suma/e2e-tests-plan.md — caso E2
test('E2 (R2.2): una casilla vacía se trata como 0 al calcular', async ({
  page,
}) => {
  // Paso 1: navegar a `/`.
  await page.goto('/')

  const primerNumero = page.getByRole('textbox', { name: 'Primer número' })
  const segundoNumero = page.getByRole('textbox', { name: 'Segundo número' })
  const resultado = page.getByRole('textbox', { name: 'Resultado' })

  // Paso 2: escribir "7" en "Primer número"; dejar "Segundo número" vacía.
  await primerNumero.fill('7')
  await expect(segundoNumero).toHaveValue('')

  // Paso 3: hacer click en "Sumar".
  await page.getByRole('button', { name: 'Sumar' }).click()

  // Resultado esperado: "Resultado" muestra "7" — la casilla vacía se sumó como 0,
  // sin mensaje de error visible y sin bloquear el cálculo.
  await expect(resultado).toHaveValue('7')
  await expect(page.getByRole('alert')).toHaveCount(0)
})
