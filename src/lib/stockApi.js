// Stock API wrapper using Yahoo Finance
// Note: This uses a CORS proxy for client-side requests

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// User's holdings configuration
export const DEFAULT_HOLDINGS = [
    {
        id: '1',
        symbol: 'GC=F',
        name: '金（ゴールド）',
        quantity: 1,
        purchasePrice: 2000,
        purchaseDate: '2024-01-15',
        currency: 'USD'
    },
    {
        id: '2',
        symbol: '^GSPC',
        name: 'eMAXIS Slim S&P500',
        quantity: 100,
        purchasePrice: 4500,
        purchaseDate: '2024-02-01',
        currency: 'USD'
    },
    {
        id: '3',
        symbol: 'HUM',
        name: 'ヒューマナ',
        quantity: 10,
        purchasePrice: 350,
        purchaseDate: '2024-03-01',
        currency: 'USD'
    },
    {
        id: '4',
        symbol: '3003.T',
        name: 'ヒューリック',
        quantity: 100,
        purchasePrice: 1200,
        purchaseDate: '2024-01-20',
        currency: 'JPY'
    },
    {
        id: '5',
        symbol: '9532.T',
        name: '大阪瓦斯',
        quantity: 100,
        purchasePrice: 2800,
        purchaseDate: '2024-02-15',
        currency: 'JPY'
    },
];

/**
 * Fetch stock quote from Yahoo Finance
 * @param {string} symbol - Stock symbol (e.g., 'AAPL', '9532.T')
 * @returns {Promise<object>} Stock quote data
 */
export async function fetchStockQuote(symbol) {
    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
        const response = await fetch(CORS_PROXY + encodeURIComponent(url));

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const result = data.chart.result[0];
        const meta = result.meta;
        const quote = result.indicators.quote[0];

        return {
            symbol: meta.symbol,
            name: meta.shortName || meta.longName || symbol,
            price: meta.regularMarketPrice,
            previousClose: meta.previousClose || meta.chartPreviousClose,
            change: meta.regularMarketPrice - (meta.previousClose || meta.chartPreviousClose),
            changePercent: ((meta.regularMarketPrice - (meta.previousClose || meta.chartPreviousClose)) / (meta.previousClose || meta.chartPreviousClose)) * 100,
            currency: meta.currency,
            timestamp: new Date(meta.regularMarketTime * 1000),
        };
    } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
        // Return mock data on error
        return {
            symbol,
            name: symbol,
            price: Math.random() * 1000 + 100,
            previousClose: 100,
            change: Math.random() * 10 - 5,
            changePercent: Math.random() * 5 - 2.5,
            currency: 'USD',
            timestamp: new Date(),
            error: true,
        };
    }
}

/**
 * Fetch historical data for a stock
 * @param {string} symbol - Stock symbol
 * @param {string} range - Time range (1d, 5d, 1mo, 3mo, 6mo, 1y, 5y)
 * @returns {Promise<array>} Historical price data
 */
export async function fetchHistoricalData(symbol, range = '1y') {
    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=${range}`;
        const response = await fetch(CORS_PROXY + encodeURIComponent(url));

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const result = data.chart.result[0];
        const timestamps = result.timestamp;
        const quotes = result.indicators.quote[0];

        return timestamps.map((ts, i) => ({
            date: new Date(ts * 1000).toISOString().split('T')[0],
            open: quotes.open[i],
            high: quotes.high[i],
            low: quotes.low[i],
            close: quotes.close[i],
            volume: quotes.volume[i],
        })).filter(d => d.close !== null);
    } catch (error) {
        console.error(`Error fetching historical data for ${symbol}:`, error);
        return [];
    }
}

/**
 * Fetch multiple stock quotes at once
 * @param {string[]} symbols - Array of stock symbols
 * @returns {Promise<object>} Map of symbol to quote data
 */
export async function fetchMultipleQuotes(symbols) {
    const quotes = await Promise.all(symbols.map(fetchStockQuote));
    return Object.fromEntries(quotes.map(q => [q.symbol, q]));
}

/**
 * Calculate portfolio value and P&L
 * @param {array} holdings - Array of holding objects
 * @param {object} quotes - Map of symbol to quote data
 * @returns {object} Portfolio summary
 */
export function calculatePortfolioSummary(holdings, quotes) {
    let totalValue = 0;
    let totalCost = 0;
    const holdingsWithValues = [];

    for (const holding of holdings) {
        const quote = quotes[holding.symbol];
        if (!quote) continue;

        const currentValue = holding.quantity * quote.price;
        const costBasis = holding.quantity * holding.purchasePrice;
        const pnl = currentValue - costBasis;
        const pnlPercent = (pnl / costBasis) * 100;

        totalValue += currentValue;
        totalCost += costBasis;

        holdingsWithValues.push({
            ...holding,
            currentPrice: quote.price,
            currentValue,
            costBasis,
            pnl,
            pnlPercent,
            dayChange: quote.change,
            dayChangePercent: quote.changePercent,
            currency: quote.currency,
        });
    }

    return {
        totalValue,
        totalCost,
        totalPnl: totalValue - totalCost,
        totalPnlPercent: ((totalValue - totalCost) / totalCost) * 100,
        holdings: holdingsWithValues,
    };
}
