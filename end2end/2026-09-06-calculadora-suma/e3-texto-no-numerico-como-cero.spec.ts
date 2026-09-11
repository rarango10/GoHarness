import { expect, test } from '@playwright/test'

// Plan: docs/2026-09-06-calculadora-suma/e2e-tests-plan.md — caso E3
test('E3 (R2.3): texto no numérico se trata como 0 al calcular', async ({
  page,
}) => {
  // Paso 1: navegar a `/`.
  await page.goto('/')

  const primerNumero = page.getByRole('textbox', { name: 'Primer número' })
  const segundoNumero = page.getByRole('textbox', { name: 'Segundo número' })
  const resultado = page.getByRole('textbox', { name: 'Resultado' })

  // Paso 2: escribir "abc" en "Primer número" y "4" en "Segundo número".
  await primerNumero.fill('abc')
  await segundoNumero.fill('4')

  // Paso 3: hacer click en "Sumar".
  await page.getByRole('button', { name: 'Sumar' }).click()

  // Resultado esperado: "Resultado" muestra "4" — el texto no numérico se sumó como 0,
  // sin mensaje de error visible y sin bloquear el cálculo.
  await expect(resultado).toHaveValue('4')
  await expect(page.getByRole('alert')).toHaveCount(0)
})
