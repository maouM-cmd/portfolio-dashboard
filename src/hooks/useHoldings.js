import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_HOLDINGS } from '@/lib/stockApi';

const STORAGE_KEY = 'portfolio_holdings';

/**
 * Custom hook for managing portfolio holdings with localStorage persistence
 */
export function useHoldings() {
    const [holdings, setHoldings] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load holdings from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setHoldings(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse stored holdings:', e);
                setHoldings(DEFAULT_HOLDINGS);
            }
        } else {
            // Use default holdings if nothing stored
            setHoldings(DEFAULT_HOLDINGS);
        }
        setIsLoaded(true);
    }, []);

    // Save holdings to localStorage whenever they change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
        }
    }, [holdings, isLoaded]);

    // Add a new holding
    const addHolding = useCallback((holding) => {
        const newHolding = {
            ...holding,
            id: Date.now().toString(),
        };
        setHoldings(prev => [...prev, newHolding]);
        return newHolding;
    }, []);

    // Update an existing holding
    const updateHolding = useCallback((id, updates) => {
        setHoldings(prev =>
            prev.map(h => h.id === id ? { ...h, ...updates } : h)
        );
    }, []);

    // Delete a holding
    const deleteHolding = useCallback((id) => {
        setHoldings(prev => prev.filter(h => h.id !== id));
    }, []);

    // Reset to default holdings
    const resetToDefaults = useCallback(() => {
        setHoldings(DEFAULT_HOLDINGS);
    }, []);

    return {
        holdings,
        isLoaded,
        addHolding,
        updateHolding,
        deleteHolding,
        resetToDefaults,
    };
}
