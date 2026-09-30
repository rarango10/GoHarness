import { describe, it, expect } from 'vitest'
import { validarMovimiento, delMes, type Movimiento } from '../src/movimientos.js'

const base: Movimiento = { fecha: '2026-09-03', descripcion: 'Supermercado', monto: 5200, categoria: 'Comida' }

describe('validarMovimiento', () => {
  it('acepta un movimiento completo', () => {
    expect(validarMovimiento(base)).toEqual([])
  })
  it('rechaza un monto cero o negativo', () => {
    expect(validarMovimiento({ ...base, monto: 0 })).toContain('monto inválido')
  })
  it('rechaza una fecha con otro formato', () => {
    expect(validarMovimiento({ ...base, fecha: '03/09/2026' })).toContain('fecha inválida')
  })
})

describe('delMes', () => {
  it('se queda solo con los movimientos del mes pedido', () => {
    const otro = { ...base, fecha: '2026-08-30' }
    expect(delMes([base, otro], '2026-09')).toEqual([base])
  })
})
