export type Categoria = 'Comida' | 'Transporte' | 'Servicios' | 'Ocio' | 'Salud' | 'Otros'

export interface Movimiento {
  fecha: string // AAAA-MM-DD
  descripcion: string
  monto: number // positivo = gasto, en pesos
  categoria: Categoria
}

export function validarMovimiento(m: Movimiento): string[] {
  const errores: string[] = []
  if (!/^\d{4}-\d{2}-\d{2}$/.test(m.fecha)) errores.push('fecha inválida')
  if (m.descripcion.trim() === '') errores.push('descripción vacía')
  if (!Number.isFinite(m.monto) || m.monto <= 0) errores.push('monto inválido')
  return errores
}

export function delMes(movs: Movimiento[], mes: string): Movimiento[] {
  return movs.filter((m) => m.fecha.startsWith(`${mes}-`))
}
