import { useState, useEffect, useCallback } from 'react';

const TRANSACTIONS_STORAGE_KEY = 'portfolio_transactions';

/**
 * Custom hook for managing transaction history
 */
export function useTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load transactions from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
        if (stored) {
            try {
                setTransactions(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse stored transactions:', e);
                setTransactions([]);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save transactions to localStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
        }
    }, [transactions, isLoaded]);

    // Add a transaction
    const addTransaction = useCallback((transaction) => {
        const newTransaction = {
            ...transaction,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
        };
        setTransactions(prev => [newTransaction, ...prev]);
        return newTransaction;
    }, []);

    // Delete a transaction
    const deleteTransaction = useCallback((id) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    }, []);

    // Get transactions for a specific symbol
    const getTransactionsForSymbol = useCallback((symbol) => {
        return transactions.filter(t => t.symbol === symbol);
    }, [transactions]);

    return {
        transactions,
        isLoaded,
        addTransaction,
        deleteTransaction,
        getTransactionsForSymbol,
    };
}
