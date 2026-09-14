import { expect, test } from 'vitest'
import { add, divide, multiply, square, squareRoot, subtract } from './calc'

test('suma dos enteros bien formados', () => {
  expect(add('2', '3')).toBe(5)
})

test('una entrada vacía vale 0', () => {
  expect(add('', '3')).toBe(3)
})

test('una entrada de solo espacios vale 0', () => {
  expect(add('  ', '3')).toBe(3)
})

test('texto no numérico vale 0', () => {
  expect(add('abc', '3')).toBe(3)
})

test('un número con coma decimal no es válido y vale 0', () => {
  expect(add('3,5', '1')).toBe(1)
})

test('los espacios alrededor de un número válido se recortan', () => {
  expect(add(' 4 ', '1')).toBe(5)
})

test('los negativos y los decimales con punto se suman con su signo y su parte decimal', () => {
  expect(add('-2.5', '1')).toBe(-1.5)
})

test('la coma decimal sigue sin ser válida tras aceptar signo y punto', () => {
  expect(add('3,5', '1')).toBe(1)
})

test('el resultado no muestra el ruido de representación binaria', () => {
  expect(add('0.1', '0.2')).toBe(0.3)
})

test('los decimales legítimos no se truncan al redondear', () => {
  expect(add('1.234', '2.111')).toBe(3.345)
})

test('resta dos enteros bien formados', () => {
  expect(subtract('5', '3')).toBe(2)
})

test('la resta puede dar un resultado negativo', () => {
  expect(subtract('3', '5')).toBe(-2)
})

test('un operando inválido en la resta vale 0', () => {
  expect(subtract('abc', '5')).toBe(-5)
})

test('multiplica dos enteros bien formados', () => {
  expect(multiply('4', '3')).toBe(12)
})

test('un operando vacío en la multiplicación vale 0', () => {
  expect(multiply('', '5')).toBe(0)
})

test('la multiplicación no muestra ruido de punto flotante', () => {
  expect(multiply('0.1', '3')).toBe(0.3)
})

test('divide dos enteros bien formados', () => {
  expect(divide('10', '2')).toBe(5)
})

test('la división preserva el signo', () => {
  expect(divide('-9', '3')).toBe(-3)
})

test('dividir por un divisor literal 0 devuelve null', () => {
  expect(divide('5', '0')).toBeNull()
})

test('un divisor vacío se trata como 0 y devuelve null', () => {
  expect(divide('5', '')).toBeNull()
})

test('un divisor de solo espacios se trata como 0 y devuelve null', () => {
  expect(divide('5', '   ')).toBeNull()
})

test('un divisor no numérico se trata como 0 y devuelve null', () => {
  expect(divide('5', 'abc')).toBeNull()
})

test('la raíz cuadrada de un cuadrado perfecto da un entero', () => {
  expect(squareRoot('9')).toBe(3)
})

test('la raíz cuadrada de 0 es 0', () => {
  expect(squareRoot('0')).toBe(0)
})

test('la raíz cuadrada no muestra ruido de punto flotante', () => {
  expect(squareRoot('2')).toBe(1.4142135624)
})

test('un operando vacío en la raíz cuadrada vale 0', () => {
  expect(squareRoot('')).toBe(0)
})

test('un operando no numérico en la raíz cuadrada vale 0', () => {
  expect(squareRoot('abc')).toBe(0)
})

test('la raíz cuadrada de un número negativo devuelve null', () => {
  expect(squareRoot('-4')).toBeNull()
})

test('el cuadrado de un entero bien formado', () => {
  expect(square('4')).toBe(16)
})

test('el cuadrado de un negativo es positivo', () => {
  expect(square('-4')).toBe(16)
})

test('el cuadrado no muestra ruido de punto flotante', () => {
  expect(square('0.1')).toBe(0.01)
})

test('un operando vacío en el cuadrado vale 0', () => {
  expect(square('')).toBe(0)
})

test('un operando no numérico en el cuadrado vale 0', () => {
  expect(square('abc')).toBe(0)
})
