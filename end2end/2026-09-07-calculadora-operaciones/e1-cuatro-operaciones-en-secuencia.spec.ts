import { expect, test } from '@playwright/test'

// Plan: docs/2026-09-07-calculadora-operaciones/e2e-tests-plan.md — caso E1
test('E1 (R1.1, R1.2, R1.3, R2.1, R3.1, R4.1, R5.1): sumar, restar, multiplicar y dividir en secuencia, reemplazando el resultado en cada paso', async ({
  page,
}) => {
  // Paso 1: navegar a `/`; no debe existir el botón "Calcular" y sí los cuatro de operación.
  await page.goto('/')

  const primerNumero = page.getByRole('textbox', { name: 'Primer número' })
  const segundoNumero = page.getByRole('textbox', { name: 'Segundo número' })
  const resultado = page.getByRole('textbox', { name: 'Resultado' })
  const sumar = page.getByRole('button', { name: 'Sumar' })
  const restar = page.getByRole('button', { name: 'Restar' })
  const multiplicar = page.getByRole('button', { name: 'Multiplicar' })
  const dividir = page.getByRole('button', { name: 'Dividir' })
  const limpiar = page.getByRole('button', { name: 'Limpiar' })

  await expect(page.getByRole('button', { name: 'Calcular' })).toHaveCount(0)
  await expect(sumar).toBeVisible()
  await expect(restar).toBeVisible()
  await expect(multiplicar).toBeVisible()
  await expect(dividir).toBeVisible()

  // Estado de partida declarado en el plan: las tres casillas arrancan vacías.
  await expect(primerNumero).toHaveValue('')
  await expect(segundoNumero).toHaveValue('')
  await expect(resultado).toHaveValue('')

  // Paso 2: escribir "10" en "Primer número" y "4" en "Segundo número".
  await primerNumero.fill('10')
  await segundoNumero.fill('4')

  // Paso 3: click en "Sumar" → "Resultado" muestra "14".
  await sumar.click()
  await expect(resultado).toHaveValue('14')

  // Paso 4: click en "Restar" → muestra "6", reemplazando al "14" anterior.
  await restar.click()
  await expect(resultado).toHaveValue('6')

  // Paso 5: click en "Multiplicar" → muestra "40".
  await multiplicar.click()
  await expect(resultado).toHaveValue('40')

  // Paso 6: click en "Dividir" → muestra "2.5".
  await dividir.click()
  await expect(resultado).toHaveValue('2.5')

  // Paso 7: click en "Limpiar" → las tres casillas quedan vacías.
  await limpiar.click()
  await expect(primerNumero).toHaveValue('')
  await expect(segundoNumero).toHaveValue('')
  await expect(resultado).toHaveValue('')
})
