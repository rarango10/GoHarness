import { expect, test } from '@playwright/test'

// Plan: docs/2026-09-06-calculadora-suma/e2e-tests-plan.md — caso E1
test('E1 (R1.1, R1.2, R1.3, R2.1, R2.6, R3.1, R4.1, R4.2): calcular, recalcular tras cambiar una entrada, y limpiar', async ({
  page,
}) => {
  // Paso 1: navegar a `/` y comprobar que las tres casillas están vacías.
  await page.goto('/')

  const primerNumero = page.getByRole('textbox', { name: 'Primer número' })
  const segundoNumero = page.getByRole('textbox', { name: 'Segundo número' })
  const resultado = page.getByRole('textbox', { name: 'Resultado' })
  const calcular = page.getByRole('button', { name: 'Calcular' })
  const limpiar = page.getByRole('button', { name: 'Limpiar' })

  await expect(primerNumero).toHaveValue('')
  await expect(segundoNumero).toHaveValue('')
  await expect(resultado).toHaveValue('')

  // Paso 2: escribir "2" en "Primer número" y "3" en "Segundo número".
  await primerNumero.fill('2')
  await segundoNumero.fill('3')

  // Paso 3: hacer click en "Calcular".
  await calcular.click()

  // Resultado esperado tras el paso 3: "Resultado" muestra "5".
  await expect(resultado).toHaveValue('5')

  // Paso 4: cambiar "Primer número" a "10".
  await primerNumero.fill('10')

  // Paso 5: hacer click en "Calcular" de nuevo.
  await calcular.click()

  // Resultado esperado tras el paso 5: "Resultado" muestra "13" (reemplaza al "5", no acumula).
  await expect(resultado).toHaveValue('13')

  // Paso 6: hacer click en "Limpiar".
  await limpiar.click()

  // Resultado esperado tras el paso 6: las tres casillas quedan vacías.
  await expect(primerNumero).toHaveValue('')
  await expect(segundoNumero).toHaveValue('')
  await expect(resultado).toHaveValue('')
})
