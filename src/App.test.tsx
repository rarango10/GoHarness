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
  expect(screen.getByRole('button', { name: 'Multiplicar' })).toBeInTheDocument()
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

  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue('Error')
})

test('el botón Dividir muestra "Error" cuando el divisor está vacío', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByRole('textbox', { name: 'Primer número' }), '10')
  await user.click(screen.getByRole('button', { name: 'Dividir' }))

  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue('Error')
})

test('el botón Dividir muestra "Error" cuando el divisor tiene solo espacios', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByRole('textbox', { name: 'Primer número' }), '10')
  await user.type(screen.getByRole('textbox', { name: 'Segundo número' }), '   ')
  await user.click(screen.getByRole('button', { name: 'Dividir' }))

  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue('Error')
})

test('el botón Dividir muestra "Error" cuando el divisor no es numérico', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByRole('textbox', { name: 'Primer número' }), '10')
  await user.type(screen.getByRole('textbox', { name: 'Segundo número' }), 'abc')
  await user.click(screen.getByRole('button', { name: 'Dividir' }))

  expect(screen.getByRole('textbox', { name: 'Resultado' })).toHaveValue('Error')
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
