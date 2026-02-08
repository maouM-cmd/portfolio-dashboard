import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const ALERTS_STORAGE_KEY = 'portfolio_alerts';

/**
 * Custom hook for managing stock price alerts
 */
export function useAlerts() {
    const [alerts, setAlerts] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load alerts from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(ALERTS_STORAGE_KEY);
        if (stored) {
            try {
                setAlerts(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse stored alerts:', e);
                setAlerts([]);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save alerts to localStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
        }
    }, [alerts, isLoaded]);

    // Add a new alert
    const addAlert = useCallback((alert) => {
        const newAlert = {
            ...alert,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            triggered: false,
        };
        setAlerts(prev => [...prev, newAlert]);
        toast.success(`アラート設定: ${alert.symbol} が ${alert.condition === 'above' ? '以上' : '以下'} ${alert.targetPrice}`);
        return newAlert;
    }, []);

    // Delete an alert
    const deleteAlert = useCallback((id) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
        toast.success('アラートを削除しました');
    }, []);

    // Check alerts against current prices
    const checkAlerts = useCallback((quotes) => {
        const triggeredAlerts = [];

        setAlerts(prev => prev.map(alert => {
            if (alert.triggered) return alert;

            const quote = quotes[alert.symbol];
            if (!quote) return alert;

            const currentPrice = quote.price;
            const shouldTrigger =
                (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
                (alert.condition === 'below' && currentPrice <= alert.targetPrice);

            if (shouldTrigger) {
                triggeredAlerts.push({ ...alert, currentPrice });
                return { ...alert, triggered: true, triggeredAt: new Date().toISOString() };
            }

            return alert;
        }));

        // Show notifications for triggered alerts
        triggeredAlerts.forEach(alert => {
            toast.success(
                `🔔 ${alert.symbol} が目標価格 ${alert.targetPrice} に到達！\n現在価格: ${alert.currentPrice}`,
                { duration: 10000 }
            );
        });

        return triggeredAlerts;
    }, []);

    // Clear triggered alerts
    const clearTriggered = useCallback(() => {
        setAlerts(prev => prev.filter(a => !a.triggered));
    }, []);

    return {
        alerts,
        isLoaded,
        addAlert,
        deleteAlert,
        checkAlerts,
        clearTriggered,
    };
}
