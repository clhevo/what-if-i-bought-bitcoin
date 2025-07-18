import React, { useState } from 'react';

interface InputFormProps {
  onSubmit: (buyDate: string, amount: number, currency: 'USD' | 'JPY', sellType: 'today' | 'future', futureDate?: string) => void;
}

const PRESET_DATES = [
  { label: '🍕 Pizza Day (May 22, 2010)', value: '2010-05-22' },
  { label: '😱 COVID Crash (Mar 12, 2020)', value: '2020-03-12' },
  { label: '🚀 All-Time High (Nov 10, 2021)', value: '2021-11-10' },
];

const InputForm: React.FC<InputFormProps> = ({ onSubmit }) => {
  const [buyDate, setBuyDate] = useState('');
  const [amount, setAmount] = useState(''); // formatted string for input
  const [currency, setCurrency] = useState<'USD' | 'JPY'>('USD');
  const [sellType, setSellType] = useState<'today' | 'future'>('today');
  const [futureDate, setFutureDate] = useState('');

  // Format the input value with thousand separators
  const formatAmount = (value: string) => {
    if (!value) return '';
    // Remove non-numeric except dot
    const cleaned = value.replace(/[^\d.]/g, '');
    if (!cleaned) return '';
    // Split integer and decimal
    const [int, dec] = cleaned.split('.');
    const intFormatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return dec !== undefined ? `${intFormatted}.${dec}` : intFormatted;
  };

  // Handle input change, format with thousand separators as user types
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/,/g, '');
    // Only allow numbers and one dot
    if (!/^\d*\.?\d*$/.test(value)) return;
    setAmount(formatAmount(value));
  };

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyDate || !amount) return;
    if (sellType === 'future' && !futureDate) return;
    // Parse the formatted amount to a number
    const rawAmount = parseFloat(amount.replace(/,/g, ''));
    onSubmit(buyDate, rawAmount, currency, sellType, sellType === 'future' ? futureDate : undefined);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 4 }}>
        {PRESET_DATES.map(preset => (
          <button
            type="button"
            key={preset.value}
            style={{
              background: '#23262f', color: '#ffb800', border: 'none', borderRadius: 8, padding: '6px 12px', fontWeight: 600, cursor: 'pointer', fontSize: 13, marginBottom: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
            }}
            onClick={() => setBuyDate(preset.value)}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <label>
        Buy Date (Past):
        <input
          type="date"
          value={buyDate}
          onChange={e => setBuyDate(e.target.value)}
          max={today}
          required
        />
      </label>
      <label>
        Currency:
        <select value={currency} onChange={e => setCurrency(e.target.value as 'USD' | 'JPY')} style={{ padding: '10px', borderRadius: 8, fontSize: '1rem', background: '#181a20', color: '#f3f3f3', border: '1.5px solid #353945' }}>
          <option value="USD">USD</option>
          <option value="JPY">JPY</option>
        </select>
      </label>
      <label>
        Investment Amount ({currency}):
        <input
          type="text"
          inputMode="decimal"
          min="1"
          value={amount}
          onChange={handleAmountChange}
          placeholder={currency === 'USD' ? 'e.g. 1,000' : 'e.g. 100,000'}
          required
          style={{
            padding: '12px 14px',
            border: '1.5px solid #353945',
            borderRadius: 8,
            fontSize: '1rem',
            background: '#181a20',
            color: '#f3f3f3',
            transition: 'border 0.2s, background 0.2s',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      </label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <span style={{ fontWeight: 500, marginBottom: 2 }}>Sell Date:</span>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 24, alignItems: 'center', marginBottom: 4, justifyContent: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <input
              type="radio"
              name="sellType"
              value="today"
              checked={sellType === 'today'}
              onChange={() => setSellType('today')}
            />
            Today
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <input
              type="radio"
              name="sellType"
              value="future"
              checked={sellType === 'future'}
              onChange={() => setSellType('future')}
            />
            Future
          </label>
        </div>
        {sellType === 'future' && (
          <input
            type="date"
            value={futureDate}
            min={today}
            onChange={e => setFutureDate(e.target.value)}
            required
            style={{ marginTop: 4 }}
          />
        )}
        {sellType === 'future' && (
          <span style={{ fontSize: '0.95em', color: '#aaa', marginTop: 4 }}>
            Future dates will use predictions.
          </span>
        )}
      </div>
      <button type="submit" style={{ padding: 12, fontSize: 16 }}>Calculate</button>
    </form>
  );
};

export default InputForm; 