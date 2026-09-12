#!/usr/bin/env node
// Verifica el invariante que `node --check` no puede ver en tasks-fanout.js:
// que el prompt de cada llamada a agentP() sea UN SOLO template literal.
//
// Por qué existe: el archivo es casi todo prompts entre backticks. Un backtick de más
// dentro de un prompt (escribir `covers` en vez de "covers", por ejemplo) NO rompe la
// sintaxis si el total queda par: cierra el literal, abre otro, y el texto del medio
// pasa a parsearse como expresiones. `assets/tasks-template.md` es división y resta
// entre identificadores; `**Nota:**` es exponenciación. El archivo queda válido y el
// prompt destruido, y recién falla en runtime con "assets is not defined".
//
// Por que agentP() y no agent(): los cinco sitios de prompt del workflow llaman al
// helper agentP(), que resuelve el prefijo del plugin y recien ahi delega en agent().
// Las llamadas a agent() que quedan viven DENTRO de ese helper y reciben el prompt en
// una variable, no en un literal — mirarlas seria ruido. Lo que este linter cuida es el
// sitio donde el prompt se escribe, y ese sitio ahora es agentP().
//
// Uso: node plugin/goharness/checks/lint-workflow-literals.cjs plugin/goharness/workflows/tasks-fanout.js

const fs = require('fs')

const file = process.argv[2]
if (!file) { console.error('uso: lint-workflow-literals.cjs <archivo.js>'); process.exit(2) }
const src = fs.readFileSync(file, 'utf8')

// Devuelve el índice del backtick que cierra el literal abierto en `open`,
// respetando el anidamiento de ${...} (donde puede haber literales internos).
function closeOf(open) {
  let i = open + 1, depth = 0
  while (i < src.length) {
    const c = src[i]
    if (c === '\\') { i += 2; continue }
    if (c === '$' && src[i + 1] === '{') { depth++; i += 2; continue }
    if (c === '}' && depth > 0) { depth--; i++; continue }
    if (c === '`' && depth === 0) return i
    i++
  }
  return -1
}

const problems = []
let checked = 0

for (const m of src.matchAll(/\bagentP\(/g)) {
  // Saltear las menciones en comentarios: solo interesan las llamadas reales.
  const lineStart = src.lastIndexOf('\n', m.index) + 1
  const line = src.slice(lineStart, m.index)
  if (line.trimStart().startsWith('//') || line.trimStart().startsWith('*')) continue
  // Y saltear la declaracion del propio helper, que matchea igual que una llamada.
  if (/\bfunction\s*$/.test(line)) continue

  let i = m.index + m[0].length
  while (/\s/.test(src[i])) i++
  if (src[i] !== '`') {
    problems.push(`offset ${m.index}: el prompt de agentP() no arranca con un template literal`)
    continue
  }
  const close = closeOf(i)
  if (close === -1) {
    problems.push(`offset ${i}: template literal sin cerrar`)
    continue
  }
  // Después del literal solo puede venir una coma y las opciones.
  let j = close + 1
  while (/\s/.test(src[j])) j++
  if (src[j] !== ',' && src[j] !== ')') {
    const peek = JSON.stringify(src.slice(close + 1, close + 40))
    problems.push(
      `offset ${close}: el literal del prompt cierra antes de tiempo — sigue ${peek}.\n` +
      `    Casi siempre es un backtick de más DENTRO del prompt. Usá comillas dobles.`,
    )
    continue
  }
  checked++
}

console.log(`prompts de agentP() verificados: ${checked}`)

// Un linter que no encuentra nada que revisar pasa siempre, y eso es peor que fallar:
// si alguien renombra el helper, este chequeo se vuelve decorativo sin avisar.
if (checked === 0 && problems.length === 0) {
  console.error('\nNo se encontro ninguna llamada a agentP(). O el archivo no es el workflow,')
  console.error('o el helper cambio de nombre y este linter quedo mirando al vacio.')
  process.exit(1)
}
if (problems.length) {
  console.error(`\n${problems.length} problema(s):\n`)
  for (const p of problems) console.error(`  - ${p}`)
  process.exit(1)
}
console.log('OK — cada prompt es un template literal único y bien cerrado.')
