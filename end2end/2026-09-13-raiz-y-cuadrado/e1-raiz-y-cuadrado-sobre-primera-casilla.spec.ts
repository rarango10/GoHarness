import { expect, test } from '@playwright/test'

// Plan: docs/2026-09-13-raiz-y-cuadrado/e2e-tests-plan.md — caso E1
test('E1 (R1.1, R1.2, R2.1, R3.1, R4.1, R4.2): raíz cuadrada y elevar al cuadrado operan sobre la primera casilla y reemplazan el resultado anterior', async ({
  page,
}) => {
  await page.goto('/')

  const primerNumero = page.getByRole('textbox', { name: 'Primer número' })
  const segundoNumero = page.getByRole('textbox', { name: 'Segundo número' })
  const resultado = page.getByRole('textbox', { name: 'Resultado' })
  const raizCuadrada = page.getByRole('button', { name: 'Raíz cuadrada' })
  const elevarAlCuadrado = page.getByRole('button', {
    name: 'Elevar al cuadrado',
  })

  // Precondición declarada en el plan: app recién cargada, las tres casillas vacías.
  await expect(primerNumero).toHaveValue('')
  await expect(segundoNumero).toHaveValue('')
  await expect(resultado).toHaveValue('')

  // Paso 1: escribir "9" en "Primer número" y "999" en "Segundo número".
  await primerNumero.fill('9')
  await segundoNumero.fill('999')

  // Paso 2: click en "Raíz cuadrada".
  await raizCuadrada.click()

  // Resultado esperado del paso 2: "Resultado" muestra "3" — el contenido de
  // "Segundo número" no influyó.
  await expect(resultado).toHaveValue('3')

  // Paso 3: cambiar "Primer número" a "4", sin tocar "Segundo número".
  await primerNumero.fill('4')
  await expect(segundoNumero).toHaveValue('999')

  // Paso 4: click en "Elevar al cuadrado".
  await elevarAlCuadrado.click()

  // Resultado esperado del paso 4: "Resultado" muestra "16", reemplazando por
  // completo al "3" anterior.
  await expect(resultado).toHaveValue('16')
})
