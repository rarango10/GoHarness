#!/usr/bin/env node
import { leer, guardar } from './almacen.js'
import { validarMovimiento, delMes, type Categoria } from './movimientos.js'

const RUTA = process.env.FINANZAS_DATOS ?? 'data/movimientos.json'
const [comando, ...args] = process.argv.slice(2)

if (comando === 'agregar') {
  const [fecha, descripcion, monto, categoria = 'Otros'] = args
  const mov = { fecha, descripcion, monto: Number(monto), categoria: categoria as Categoria }
  const errores = validarMovimiento(mov)
  if (errores.length > 0) {
    console.error(errores.join('\n'))
    process.exit(1)
  }
  guardar(RUTA, [...leer(RUTA), mov])
  console.log('Movimiento agregado.')
} else if (comando === 'listar') {
  const movs = args[0] ? delMes(leer(RUTA), args[0]) : leer(RUTA)
  for (const m of movs) console.log(`${m.fecha}  ${m.categoria.padEnd(10)}  ${m.monto.toFixed(2).padStart(10)}  ${m.descripcion}`)
} else {
  console.log('Uso: finanzas agregar <AAAA-MM-DD> <descripción> <monto> [categoría]\n     finanzas listar [AAAA-MM]')
}
