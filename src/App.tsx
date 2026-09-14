import { useState } from 'react'
import './App.css'
import { add, divide, multiply, squareRoot, subtract } from './calc'

export function App() {
  const [opA, setOpA] = useState('')
  const [opB, setOpB] = useState('')
  const [result, setResult] = useState('')

  function showResult(value: number | null) {
    setResult(value === null ? 'Error' : String(value))
  }

  return (
    <div className="app-shell">
      <div className="calculator">
        <div className="header-bar">
          <span className="header-deco header-deco--star" aria-hidden="true">
            ★
          </span>
          <span className="brand">CALC-3000</span>
          <span className="header-deco header-deco--diamond" aria-hidden="true">
            ◈
          </span>
        </div>

        <div className="display-screen">
          <label htmlFor="result" className="visually-hidden">
            Resultado
          </label>
          <input
            id="result"
            className="display-value"
            value={result}
            readOnly
          />
        </div>

        <div className="controls">
          <div className="input-row">
            <label htmlFor="opA" className="input-caption">
              Primer número
            </label>
            <div className="input-box">
              <input
                id="opA"
                value={opA}
                onChange={(e) => setOpA(e.target.value)}
              />
            </div>
          </div>

          <div className="input-row">
            <label htmlFor="opB" className="input-caption">
              Segundo número
            </label>
            <div className="input-box">
              <input
                id="opB"
                value={opB}
                onChange={(e) => setOpB(e.target.value)}
              />
            </div>
          </div>

          <div className="operators-row">
            <button
              type="button"
              aria-label="Sumar"
              className="op-btn op-add"
              onClick={() => setResult(String(add(opA, opB)))}
            >
              +
            </button>
            <button
              type="button"
              aria-label="Restar"
              className="op-btn op-sub"
              onClick={() => setResult(String(subtract(opA, opB)))}
            >
              −
            </button>
            <button
              type="button"
              aria-label="Multiplicar"
              className="op-btn op-mul"
              onClick={() => setResult(String(multiply(opA, opB)))}
            >
              ×
            </button>
            <button
              type="button"
              aria-label="Dividir"
              className="op-btn op-div"
              onClick={() => showResult(divide(opA, opB))}
            >
              ÷
            </button>
          </div>

          <div className="unary-operators-row">
            <button
              type="button"
              aria-label="Raíz cuadrada"
              className="op-btn op-sqrt"
              onClick={() => showResult(squareRoot(opA))}
            >
              √
            </button>
          </div>

          <button
            type="button"
            className="clear-btn"
            onClick={() => {
              setOpA('')
              setOpB('')
              setResult('')
            }}
          >
            <span aria-hidden="true">✕</span>
            Limpiar
          </button>
        </div>
      </div>
    </div>
  )
}
