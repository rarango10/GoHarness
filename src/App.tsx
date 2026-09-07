import { useState } from 'react'
import { add } from './calc'

export function App() {
  const [opA, setOpA] = useState('')
  const [opB, setOpB] = useState('')
  const [result, setResult] = useState('')

  return (
    <div>
      <label htmlFor="opA">Primer número</label>
      <input id="opA" value={opA} onChange={(e) => setOpA(e.target.value)} />

      <label htmlFor="opB">Segundo número</label>
      <input id="opB" value={opB} onChange={(e) => setOpB(e.target.value)} />

      <label htmlFor="result">Resultado</label>
      <input id="result" value={result} readOnly />

      <button type="button" onClick={() => setResult(String(add(opA, opB)))}>
        Calcular
      </button>
      <button
        type="button"
        onClick={() => {
          setOpA('')
          setOpB('')
          setResult('')
        }}
      >
        Limpiar
      </button>
    </div>
  )
}
