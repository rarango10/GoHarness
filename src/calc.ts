const SIGNED_DECIMAL = /^-?\d+(\.\d+)?$/

function parseOperand(value: string): number {
  const trimmed = value.trim()
  return SIGNED_DECIMAL.test(trimmed) ? Number(trimmed) : 0
}

export function add(a: string, b: string): number {
  const sum = parseOperand(a) + parseOperand(b)
  return Number(sum.toFixed(10))
}

export function subtract(a: string, b: string): number {
  const difference = parseOperand(a) - parseOperand(b)
  return Number(difference.toFixed(10))
}

export function multiply(a: string, b: string): number {
  const product = parseOperand(a) * parseOperand(b)
  return Number(product.toFixed(10))
}
