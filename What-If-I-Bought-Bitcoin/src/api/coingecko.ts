import axios from 'axios';

const API_KEY = 'd0b04bde4d21bb576ce93fd1cd231cca2a71672a64c98885fce8ec1ef0eefd8c';
const BASE_URL = 'https://min-api.cryptocompare.com/data';

// Returns BTC price in the given currency for a given date (YYYY-MM-DD)
export async function getBtcPriceOnDate(date: string, currency: 'USD' | 'JPY' = 'USD'): Promise<number> {
  const timestamp = Math.floor(new Date(date + 'T00:00:00Z').getTime() / 1000);
  const url = `${BASE_URL}/pricehistorical?fsym=BTC&tsyms=${currency}&ts=${timestamp}&api_key=${API_KEY}`;
  const { data } = await axios.get(url);
  const price = data?.BTC?.[currency];
  if (!price) throw new Error('No price data for this date');
  return price;
}

// Returns current BTC price in the given currency
export async function getCurrentBtcPrice(currency: 'USD' | 'JPY' = 'USD'): Promise<number> {
  const url = `${BASE_URL}/price?fsym=BTC&tsyms=${currency}&api_key=${API_KEY}`;
  const { data } = await axios.get(url);
  const price = data?.[currency];
  if (!price) throw new Error('No current price data');
  return price;
}

// Returns a predicted BTC price for a given future date and currency using ARK's bull case ($2,400,000 by 2030)
export async function getPredictedBtcPrice(futureDate: string, currency: 'USD' | 'JPY' = 'USD'): Promise<number> {
  const now = new Date();
  const target = new Date(futureDate + 'T00:00:00Z');
  if (target <= now) throw new Error('Prediction only for future dates');
  const current = await getCurrentBtcPrice(currency);

  // ARK bull case: $2,400,000 per BTC by Jan 1, 2030 (in USD)
  const targetYear = 2030;
  const targetMonth = 0; // January
  const targetDay = 1;
  const futureTargetDate = new Date(Date.UTC(targetYear, targetMonth, targetDay));
  const yearsToTarget = (futureTargetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const yearsToPrediction = (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

  // Get the target price in the selected currency
  let targetPrice = 2400000;
  if (currency === 'JPY') {
    // Get USD/JPY rate from CryptoCompare
    const fxUrl = `${BASE_URL}/price?fsym=USD&tsyms=JPY&api_key=${API_KEY}`;
    const { data: fxData } = await axios.get(fxUrl);
    const usdJpy = fxData?.JPY;
    if (!usdJpy) throw new Error('Failed to get USD/JPY rate');
    targetPrice = 2400000 * usdJpy;
  }

  // Calculate CAGR needed to go from current to targetPrice in yearsToTarget
  const cagr = Math.pow(targetPrice / current, 1 / yearsToTarget) - 1;
  // Project price for yearsToPrediction
  const predicted = current * Math.pow(1 + cagr, yearsToPrediction);
  return predicted;
} 