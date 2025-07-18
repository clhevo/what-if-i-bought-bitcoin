import './App.css'
import InputForm from './components/InputForm'
import { useState } from 'react'
import { getBtcPriceOnDate, getCurrentBtcPrice, getPredictedBtcPrice } from './api/coingecko'

interface Result {
  btcAmount: number
  valueToday: number
  roiPercent: number
  roiAbsolute: number
  buyPrice: number
  currentPrice: number
  currency: 'USD' | 'JPY'
  isPrediction: boolean
  sellDate: string
}

function App() {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFormSubmit = async (
    buyDate: string,
    amount: number,
    currency: 'USD' | 'JPY',
    sellType: 'today' | 'future',
    futureDate?: string
  ) => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      let buyPrice = 0, currentPrice = 0, isPrediction = false, sellDate = '';
      if (sellType === 'future' && futureDate) {
        buyPrice = await getBtcPriceOnDate(buyDate, currency);
        currentPrice = await getPredictedBtcPrice(futureDate, currency);
        isPrediction = true;
        sellDate = futureDate;
      } else {
        buyPrice = await getBtcPriceOnDate(buyDate, currency);
        currentPrice = await getCurrentBtcPrice(currency);
        isPrediction = false;
        sellDate = new Date().toISOString().split('T')[0];
      }
      const btcAmount = amount / buyPrice
      const valueToday = btcAmount * currentPrice
      const roiAbsolute = valueToday - amount
      const roiPercent = (roiAbsolute / amount) * 100
      setResult({ btcAmount, valueToday, roiPercent, roiAbsolute, buyPrice, currentPrice, currency, isPrediction, sellDate })
    } catch (e: any) {
      setError(e.message || 'Failed to fetch BTC price')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number, currency: 'USD' | 'JPY') => {
    return value.toLocaleString(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    })
  }

  return (
    <div className="app-container">
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
        <span role="img" aria-label="bitcoin" style={{ fontSize: 64, display: 'block', color: '#ff9900', filter: 'drop-shadow(0 2px 8px #ff990044)' }}>₿</span>
      </div>
      <h1 style={{ textAlign: 'center' }}>
        What If I Bought Bitcoin Back Then?
      </h1>
      <InputForm onSubmit={handleFormSubmit} />
      {loading && <p style={{ marginTop: 24 }}>Calculating...</p>}
      {error && <p style={{ color: '#ff7675', marginTop: 24 }}>{error}</p>}
      {result && (
        <div
          style={{
            marginTop: 40,
            background: '#181a20',
            borderRadius: 18,
            padding: 32,
            textAlign: 'center',
            color: '#ffe082',
            boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
            position: 'relative',
            overflow: 'hidden',
            animation: 'pop-in 0.7s cubic-bezier(.68,-0.55,.27,1.55)'
          }}
        >
          <style>{`
            @keyframes pop-in {
              0% { transform: scale(0.8); opacity: 0; }
              80% { transform: scale(1.05); opacity: 1; }
              100% { transform: scale(1); opacity: 1; }
            }
            .gradient-text {
              background: linear-gradient(90deg, #ffb800 20%, #ff9900 80%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              text-fill-color: transparent;
            }
          `}</style>
          <div style={{ fontSize: 44, fontWeight: 800, marginBottom: 10, lineHeight: 1.1 }} className="gradient-text">
            🎉 {result.isPrediction ? 'Estimated Value' : 'Your Investment'} 🎉
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, margin: '18px 0 10px 0', letterSpacing: 1 }} className="gradient-text">
            {formatCurrency(result.valueToday, result.currency)}
          </div>
          <div style={{ fontSize: 20, marginBottom: 18, color: '#fff3e0', fontWeight: 500 }}>
            {result.isPrediction ? `on ${result.sellDate}` : 'today'}
          </div>
          <div style={{ fontSize: 18, marginBottom: 8 }}>
            You could have bought <b>{result.btcAmount.toFixed(6)} BTC</b>
          </div>
          <div style={{ fontSize: 16, marginBottom: 8 }}>
            Buy price: <b>{formatCurrency(result.buyPrice, result.currency)}</b> &rarr; {result.isPrediction ? `Predicted (${result.sellDate}):` : 'Now:'} <b>{formatCurrency(result.currentPrice, result.currency)}</b>
          </div>
          <div style={{ fontSize: 22, marginTop: 18, fontWeight: 700 }}>
            <span style={{ color: result.roiAbsolute >= 0 ? '#00e676' : '#ff7675', fontSize: 28 }}>
              {result.roiAbsolute >= 0 ? '▲' : '▼'} {formatCurrency(result.roiAbsolute, result.currency)}
            </span>
            <span style={{ color: result.roiAbsolute >= 0 ? '#00e676' : '#ff7675', fontSize: 22, marginLeft: 12 }}>
              ({result.roiPercent.toFixed(2)}%)
            </span>
          </div>
          {result.isPrediction && (
            <div style={{ color: '#ffb800', fontWeight: 600, marginTop: 18, fontSize: 16 }}>
              <span role="img" aria-label="crystal ball">🔮</span> This result uses a prediction for the future BTC price.
            </div>
          )}
          <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <span style={{ position: 'absolute', left: '10%', top: '10%', fontSize: 32, opacity: 0.18 }}>🎉</span>
            <span style={{ position: 'absolute', right: '12%', top: '18%', fontSize: 28, opacity: 0.13 }}>🪙</span>
            <span style={{ position: 'absolute', left: '20%', bottom: '12%', fontSize: 28, opacity: 0.13 }}>🟧</span>
            <span style={{ position: 'absolute', right: '18%', bottom: '10%', fontSize: 36, opacity: 0.13 }}>🎉</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

