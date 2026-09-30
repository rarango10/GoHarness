#!/usr/bin/env node
// Checks the invariant `node --check` can't see in tasks-fanout.js:
// that the prompt of each call to agentP() is ONE SINGLE template literal.
//
// Why it exists: the file is almost all prompts between backticks. One backtick too many
// inside a prompt (writing `covers` instead of "covers", for example) does NOT break the
// syntax if the total stays even: it closes the literal, opens another one, and the text in
// between gets parsed as expressions. `assets/tasks-template.md` is division and subtraction
// between identifiers; `**Note:**` is exponentiation. The file stays valid and the prompt
// destroyed, and it only fails at runtime with "assets is not defined".
//
// Why agentP() and not agent(): the workflow's five prompt sites call the agentP() helper,
// which resolves the plugin's prefix and only then delegates to agent(). The agent() calls
// that remain live INSIDE that helper and receive the prompt in a variable, not in a
// literal — looking at them would be noise. What this linter guards is the place where the
// prompt is written, and that place is now agentP().
//
// Usage: node plugin/goharness/checks/lint-workflow-literals.cjs plugin/goharness/workflows/tasks-fanout.js

const fs = require('fs')

const file = process.argv[2]
if (!file) { console.error('usage: lint-workflow-literals.cjs <file.js>'); process.exit(2) }
const src = fs.readFileSync(file, 'utf8')

// Returns the index of the backtick that closes the literal opened at `open`,
// respecting the nesting of ${...} (where there can be inner literals).
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
  // Skip the mentions in comments: only the real calls matter.
  const lineStart = src.lastIndexOf('\n', m.index) + 1
  const line = src.slice(lineStart, m.index)
  if (line.trimStart().startsWith('//') || line.trimStart().startsWith('*')) continue
  // And skip the declaration of the helper itself, which matches just like a call.
  if (/\bfunction\s*$/.test(line)) continue

  let i = m.index + m[0].length
  while (/\s/.test(src[i])) i++
  if (src[i] !== '`') {
    problems.push(`offset ${m.index}: the agentP() prompt doesn't start with a template literal`)
    continue
  }
  const close = closeOf(i)
  if (close === -1) {
    problems.push(`offset ${i}: unclosed template literal`)
    continue
  }
  // After the literal only a comma and the options can come.
  let j = close + 1
  while (/\s/.test(src[j])) j++
  if (src[j] !== ',' && src[j] !== ')') {
    const peek = JSON.stringify(src.slice(close + 1, close + 40))
    problems.push(
      `offset ${close}: the prompt's literal closes too early — it's followed by ${peek}.\n` +
      `    It is almost always one backtick too many INSIDE the prompt. Use double quotes.`,
    )
    continue
  }
  checked++
}

console.log(`agentP() prompts checked: ${checked}`)

// A linter that finds nothing to check always passes, and that is worse than failing:
// if someone renames the helper, this check becomes decorative without warning.
if (checked === 0 && problems.length === 0) {
  console.error('\nNo call to agentP() was found. Either the file is not the workflow,')
  console.error('or the helper was renamed and this linter is left staring at nothing.')
  process.exit(1)
}
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n`)
  for (const p of problems) console.error(`  - ${p}`)
  process.exit(1)
}
console.log('OK — every prompt is a single, properly closed template literal.')
