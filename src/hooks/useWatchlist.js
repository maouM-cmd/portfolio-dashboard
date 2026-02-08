import { useState, useEffect, useCallback } from 'react';

const WATCHLIST_STORAGE_KEY = 'portfolio_watchlist';

/**
 * Custom hook for managing watchlist
 */
export function useWatchlist() {
    const [watchlist, setWatchlist] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load watchlist from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
        if (stored) {
            try {
                setWatchlist(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse stored watchlist:', e);
                setWatchlist([]);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save watchlist to localStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
        }
    }, [watchlist, isLoaded]);

    // Add to watchlist
    const addToWatchlist = useCallback((item) => {
        const newItem = {
            ...item,
            id: Date.now().toString(),
            addedAt: new Date().toISOString(),
        };
        setWatchlist(prev => [...prev, newItem]);
        return newItem;
    }, []);

    // Remove from watchlist
    const removeFromWatchlist = useCallback((id) => {
        setWatchlist(prev => prev.filter(w => w.id !== id));
    }, []);

    // Check if symbol is in watchlist
    const isInWatchlist = useCallback((symbol) => {
        return watchlist.some(w => w.symbol === symbol);
    }, [watchlist]);

    return {
        watchlist,
        isLoaded,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
    };
}
