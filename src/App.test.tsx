import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { App } from './App'

test('las tres casillas se renderizan vacías', () => {
  render(<App />)

  expect(screen.getByRole('textbox', { name: 'Primer número' })).toHaveValue('')
  expect(
    screen.getByRole('textbox', { name: 'Primer número' }),
  ).not.toHaveAttribute('readonly')
  expect(screen.getByRole('textbox', { name: 'Segundo número' })).toHaveValue(
    '',
  )
  expect(
    screen.getByRole('textbox', { name: 'Segundo número' }),
  ).not.toHaveAttribute('readonly')
  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue('')
  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveAttribute(
    'readonly',
  )
})

test('no existe ningún control con nombre accesible "Calcular", y los cuatro botones de operación sí', () => {
  render(<App />)

  expect(screen.queryByRole('button', { name: 'Calcular' })).toBeNull()
  expect(screen.getByRole('button', { name: 'Sumar' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Restar' })).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Multiplicar' }),
  ).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Dividir' })).toBeInTheDocument()
})

test('el botón Sumar muestra la suma de las dos casillas', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByRole('textbox', { name: 'Primer número' }), '2')
  await user.type(screen.getByRole('textbox', { name: 'Segundo número' }), '3')
  await user.click(screen.getByRole('button', { name: 'Sumar' }))

  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue('5')
})

test('un segundo cálculo tras cambiar una entrada reemplaza el resultado anterior', async () => {
  const user = userEvent.setup()
  render(<App />)

  const opA = screen.getByRole('textbox', { name: 'Primer número' })
  const opB = screen.getByRole('textbox', { name: 'Segundo número' })
  const sumar = screen.getByRole('button', { name: 'Sumar' })

  await user.type(opA, '2')
  await user.type(opB, '3')
  await user.click(sumar)
  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue('5')

  await user.clear(opA)
  await user.type(opA, '10')
  await user.click(sumar)
  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue('13')
})

test('presionar otra operación reemplaza el resultado, no lo acumula', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByRole('textbox', { name: 'Primer número' }), '2')
  await user.type(screen.getByRole('textbox', { name: 'Segundo número' }), '3')
  await user.click(screen.getByRole('button', { name: 'Sumar' }))
  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue('5')

  await user.click(screen.getByRole('button', { name: 'Restar' }))
  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue('-1')
})

test('el botón Restar muestra la diferencia de las dos casillas', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByRole('textbox', { name: 'Primer número' }), '2')
  await user.type(screen.getByRole('textbox', { name: 'Segundo número' }), '3')
  await user.click(screen.getByRole('button', { name: 'Restar' }))

  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue('-1')
})

test('el botón Multiplicar muestra el producto de las dos casillas', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByRole('textbox', { name: 'Primer número' }), '4')
  await user.type(screen.getByRole('textbox', { name: 'Segundo número' }), '3')
  await user.click(screen.getByRole('button', { name: 'Multiplicar' }))

  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue('12')
})

test('el botón Dividir muestra el cociente cuando el divisor no es 0', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByRole('textbox', { name: 'Primer número' }), '10')
  await user.type(screen.getByRole('textbox', { name: 'Segundo número' }), '2')
  await user.click(screen.getByRole('button', { name: 'Dividir' }))

  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue('5')
})

test('el botón Dividir muestra "Error" cuando el divisor es 0', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByRole('textbox', { name: 'Primer número' }), '10')
  await user.type(screen.getByRole('textbox', { name: 'Segundo número' }), '0')
  await user.click(screen.getByRole('button', { name: 'Dividir' }))

  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue(
    'Error',
  )
})

test('el botón Dividir muestra "Error" cuando el divisor está vacío', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByRole('textbox', { name: 'Primer número' }), '10')
  await user.click(screen.getByRole('button', { name: 'Dividir' }))

  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue(
    'Error',
  )
})

test('el botón Dividir muestra "Error" cuando el divisor tiene solo espacios', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByRole('textbox', { name: 'Primer número' }), '10')
  await user.type(
    screen.getByRole('textbox', { name: 'Segundo número' }),
    '   ',
  )
  await user.click(screen.getByRole('button', { name: 'Dividir' }))

  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue(
    'Error',
  )
})

test('el botón Dividir muestra "Error" cuando el divisor no es numérico', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByRole('textbox', { name: 'Primer número' }), '10')
  await user.type(
    screen.getByRole('textbox', { name: 'Segundo número' }),
    'abc',
  )
  await user.click(screen.getByRole('button', { name: 'Dividir' }))

  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue(
    'Error',
  )
})

test('el botón Raíz cuadrada muestra la raíz de la primera casilla', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByRole('textbox', { name: 'Primer número' }), '9')
  await user.click(screen.getByRole('button', { name: 'Raíz cuadrada' }))

  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue('3')
})

test('el botón Raíz cuadrada muestra "Error" cuando la primera casilla es negativa', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByRole('textbox', { name: 'Primer número' }), '-4')
  await user.click(screen.getByRole('button', { name: 'Raíz cuadrada' }))

  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue(
    'Error',
  )
})

test('el botón Raíz cuadrada trata la primera casilla vacía como 0', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Raíz cuadrada' }))

  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue('0')
})

test('el botón Elevar al cuadrado muestra el cuadrado de la primera casilla', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByRole('textbox', { name: 'Primer número' }), '4')
  await user.click(screen.getByRole('button', { name: 'Elevar al cuadrado' }))

  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue('16')
})

test('el botón Elevar al cuadrado de un negativo da un resultado positivo', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByRole('textbox', { name: 'Primer número' }), '-4')
  await user.click(screen.getByRole('button', { name: 'Elevar al cuadrado' }))

  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue('16')
})

test('el botón Elevar al cuadrado trata la primera casilla vacía como 0', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Elevar al cuadrado' }))

  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue('0')
})

test('el botón Raíz cuadrada ignora el contenido de la segunda casilla', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByRole('textbox', { name: 'Primer número' }), '5')
  await user.type(
    screen.getByRole('textbox', { name: 'Segundo número' }),
    '999',
  )
  await user.click(screen.getByRole('button', { name: 'Raíz cuadrada' }))

  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue(
    '2.2360679775',
  )
})

test('el botón Elevar al cuadrado ignora el contenido de la segunda casilla', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByRole('textbox', { name: 'Primer número' }), '5')
  await user.type(
    screen.getByRole('textbox', { name: 'Segundo número' }),
    '999',
  )
  await user.click(screen.getByRole('button', { name: 'Elevar al cuadrado' }))

  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue('25')
})

test('presionar Raíz cuadrada tras otra operación reemplaza el resultado anterior', async () => {
  const user = userEvent.setup()
  render(<App />)

  const opA = screen.getByRole('textbox', { name: 'Primer número' })

  await user.type(opA, '7')
  await user.type(screen.getByRole('textbox', { name: 'Segundo número' }), '5')
  await user.click(screen.getByRole('button', { name: 'Sumar' }))
  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue('12')

  await user.clear(opA)
  await user.type(opA, '9')
  await user.click(screen.getByRole('button', { name: 'Raíz cuadrada' }))

  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue('3')
})

test('presionar Elevar al cuadrado tras otra operación reemplaza el resultado anterior', async () => {
  const user = userEvent.setup()
  render(<App />)

  const opA = screen.getByRole('textbox', { name: 'Primer número' })

  await user.type(opA, '7')
  await user.type(screen.getByRole('textbox', { name: 'Segundo número' }), '5')
  await user.click(screen.getByRole('button', { name: 'Sumar' }))
  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue('12')

  await user.clear(opA)
  await user.type(opA, '4')
  await user.click(screen.getByRole('button', { name: 'Elevar al cuadrado' }))

  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue('16')
})

test('el botón Elevar al cuadrado no muestra ruido de punto flotante', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByRole('textbox', { name: 'Primer número' }), '0.1')
  await user.click(screen.getByRole('button', { name: 'Elevar al cuadrado' }))

  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue('0.01')
})

test('el botón Raíz cuadrada no muestra ruido de punto flotante', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByRole('textbox', { name: 'Primer número' }), '2')
  await user.click(screen.getByRole('button', { name: 'Raíz cuadrada' }))

  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue(
    '1.4142135624',
  )
})

test('los botones Raíz cuadrada y Elevar al cuadrado aparecen después de Dividir y antes de Limpiar', () => {
  render(<App />)

  const buttons = screen.getAllByRole('button').map((b) => b.textContent)
  const dividirIdx = buttons.indexOf('÷')
  const sqrtIdx = buttons.findIndex((t) => t?.includes('√'))
  const squareIdx = buttons.findIndex((t) => t?.includes('x²'))
  const limpiarIdx = buttons.findIndex((t) => t?.includes('Limpiar'))

  expect(dividirIdx).toBeGreaterThanOrEqual(0)
  expect(sqrtIdx).toBeGreaterThan(dividirIdx)
  expect(squareIdx).toBeGreaterThan(dividirIdx)
  expect(limpiarIdx).toBeGreaterThan(sqrtIdx)
  expect(limpiarIdx).toBeGreaterThan(squareIdx)
})

test('el botón Limpiar vacía las tres casillas', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByRole('textbox', { name: 'Primer número' }), '2')
  await user.type(screen.getByRole('textbox', { name: 'Segundo número' }), '3')
  await user.click(screen.getByRole('button', { name: 'Sumar' }))
  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue('5')

  await user.click(screen.getByRole('button', { name: 'Limpiar' }))

  expect(screen.getByRole('textbox', { name: 'Primer número' })).toHaveValue('')
  expect(screen.getByRole('textbox', { name: 'Segundo número' })).toHaveValue(
    '',
  )
  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue('')
})
