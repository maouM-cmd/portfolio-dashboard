// Currency exchange rate utilities
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Cache exchange rates for 1 hour
let rateCache = { rates: {}, timestamp: 0 };
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Fetch USD/JPY exchange rate
 * @returns {Promise<number>} USD to JPY rate
 */
export async function fetchUsdJpyRate() {
    const now = Date.now();
    if (rateCache.rates['USDJPY'] && (now - rateCache.timestamp) < CACHE_DURATION) {
        return rateCache.rates['USDJPY'];
    }

    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/USDJPY=X?interval=1d&range=1d`;
        const response = await fetch(CORS_PROXY + encodeURIComponent(url));
        const data = await response.json();
        const rate = data.chart.result[0].meta.regularMarketPrice;

        rateCache = { rates: { 'USDJPY': rate }, timestamp: now };
        return rate;
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        return 150; // Fallback rate
    }
}

/**
 * Convert amount between currencies
 * @param {number} amount - Amount to convert
 * @param {string} from - Source currency (USD or JPY)
 * @param {string} to - Target currency (USD or JPY)
 * @param {number} rate - USD/JPY rate
 * @returns {number} Converted amount
 */
export function convertCurrency(amount, from, to, rate) {
    if (from === to) return amount;
    if (from === 'USD' && to === 'JPY') return amount * rate;
    if (from === 'JPY' && to === 'USD') return amount / rate;
    return amount;
}

/**
 * Format currency with proper symbol and locale
 * @param {number} value - Amount
 * @param {string} currency - Currency code
 * @returns {string} Formatted string
 */
export function formatCurrency(value, currency = 'JPY') {
    if (value === undefined || value === null || isNaN(value)) return 'N/A';

    if (currency === 'JPY') {
        return `¥${Math.round(value).toLocaleString('ja-JP')}`;
    }
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
