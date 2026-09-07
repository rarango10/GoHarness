import { expect, test } from 'vitest'
import { add } from './calc'

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
