import { useState, useEffect, useCallback } from 'react';

const GOALS_STORAGE_KEY = 'portfolio_goals';

/**
 * Custom hook for managing investment goals
 */
export function useGoals() {
    const [goals, setGoals] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(GOALS_STORAGE_KEY);
        if (stored) {
            try {
                setGoals(JSON.parse(stored));
            } catch (e) {
                setGoals([]);
            }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
        }
    }, [goals, isLoaded]);

    const addGoal = useCallback((goal) => {
        const newGoal = {
            ...goal,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
        };
        setGoals(prev => [...prev, newGoal]);
        return newGoal;
    }, []);

    const updateGoal = useCallback((id, updates) => {
        setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    }, []);

    const deleteGoal = useCallback((id) => {
        setGoals(prev => prev.filter(g => g.id !== id));
    }, []);

    return { goals, isLoaded, addGoal, updateGoal, deleteGoal };
}
