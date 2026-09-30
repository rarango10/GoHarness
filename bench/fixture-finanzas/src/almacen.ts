import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname } from 'node:path'
import type { Movimiento } from './movimientos.js'

export function leer(ruta: string): Movimiento[] {
  if (!existsSync(ruta)) return []
  return JSON.parse(readFileSync(ruta, 'utf8')) as Movimiento[]
}

export function guardar(ruta: string, movs: Movimiento[]): void {
  mkdirSync(dirname(ruta), { recursive: true })
  writeFileSync(ruta, JSON.stringify(movs, null, 2))
}
