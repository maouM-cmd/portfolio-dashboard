import { useState, useEffect, useCallback } from 'react';

const DIVIDENDS_STORAGE_KEY = 'portfolio_dividends';

// Known dividend months for common stocks (approximation)
const DIVIDEND_SCHEDULES = {
    '3003.T': { months: [3, 9], name: 'ヒューリック' },
    '9532.T': { months: [3, 9], name: '大阪瓦斯' },
    'HUM': { months: [1, 4, 7, 10], name: 'ヒューマナ' },
};

/**
 * Custom hook for managing dividend tracking
 */
export function useDividends() {
    const [dividends, setDividends] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(DIVIDENDS_STORAGE_KEY);
        if (stored) {
            try {
                setDividends(JSON.parse(stored));
            } catch (e) {
                setDividends([]);
            }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(DIVIDENDS_STORAGE_KEY, JSON.stringify(dividends));
        }
    }, [dividends, isLoaded]);

    const addDividend = useCallback((dividend) => {
        const newDividend = {
            ...dividend,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
        };
        setDividends(prev => [...prev, newDividend]);
        return newDividend;
    }, []);

    const deleteDividend = useCallback((id) => {
        setDividends(prev => prev.filter(d => d.id !== id));
    }, []);

    // Generate upcoming dividend predictions based on holdings
    const getUpcomingDividends = useCallback((holdings) => {
        const now = new Date();
        const upcoming = [];

        for (const holding of holdings) {
            const schedule = DIVIDEND_SCHEDULES[holding.symbol];
            if (!schedule) continue;

            for (const month of schedule.months) {
                // Check next 12 months
                for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
                    const year = now.getFullYear() + yearOffset;
                    const date = new Date(year, month - 1, 25); // Approximate date

                    if (date > now && date < new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)) {
                        upcoming.push({
                            symbol: holding.symbol,
                            name: schedule.name || holding.name,
                            date: date.toISOString().split('T')[0],
                            month,
                            year,
                            quantity: holding.quantity,
                        });
                    }
                }
            }
        }

        return upcoming.sort((a, b) => a.date.localeCompare(b.date));
    }, []);

    // Get total dividends received
    const getTotalDividends = useCallback(() => {
        return dividends.reduce((sum, d) => sum + (d.amount || 0), 0);
    }, [dividends]);

    return {
        dividends,
        isLoaded,
        addDividend,
        deleteDividend,
        getUpcomingDividends,
        getTotalDividends,
    };
}
