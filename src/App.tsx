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
        <div style={{ marginTop: 32, background: '#181a20', borderRadius: 12, padding: 24, textAlign: 'center', color: '#ffe082', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
          {result.isPrediction && (
            <div style={{ color: '#ffb800', fontWeight: 600, marginBottom: 10, fontSize: 15 }}>
              <span role="img" aria-label="crystal ball">🔮</span> This result uses a prediction for the future BTC price.
            </div>
          )}
          <div style={{ fontSize: 18, marginBottom: 10 }}>
            You could have bought <b>{result.btcAmount.toFixed(6)} BTC</b>
          </div>
          <div style={{ fontSize: 16, marginBottom: 8 }}>
            That would be worth <b>{formatCurrency(result.valueToday, result.currency)}</b> {result.isPrediction ? `on ${result.sellDate}` : 'today'}
          </div>
          <div style={{ fontSize: 15, marginBottom: 8 }}>
            Buy price: <b>{formatCurrency(result.buyPrice, result.currency)}</b> &rarr; {result.isPrediction ? `Predicted (${result.sellDate}):` : 'Now:'} <b>{formatCurrency(result.currentPrice, result.currency)}</b>
          </div>
          <div style={{ fontSize: 16, marginTop: 12 }}>
            ROI: <b style={{ color: result.roiAbsolute >= 0 ? '#00e676' : '#ff7675' }}>{result.roiPercent.toFixed(2)}%</b> (<b style={{ color: result.roiAbsolute >= 0 ? '#00e676' : '#ff7675' }}>{result.roiAbsolute >= 0 ? '+' : ''}{formatCurrency(result.roiAbsolute, result.currency)}</b>)
          </div>
        </div>
      )}
    </div>
  )
}

export default App
