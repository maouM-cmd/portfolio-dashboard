import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Plus, Trash2, TrendingUp, TrendingDown, Check } from 'lucide-react';
import { useAlerts } from '@/hooks/useAlerts';
import { useHoldings } from '@/hooks/useHoldings';
import { fetchMultipleQuotes } from '@/lib/stockApi';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const AlertForm = ({ symbols, onAdd, onCancel }) => {
    const [form, setForm] = useState({
        symbol: symbols[0] || '',
        condition: 'above',
        targetPrice: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.targetPrice) {
            toast.error('目標価格を入力してください');
            return;
        }
        onAdd({
            ...form,
            targetPrice: parseFloat(form.targetPrice),
        });
        setForm({ symbol: symbols[0] || '', condition: 'above', targetPrice: '' });
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-muted/30 space-y-4">
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="text-sm font-medium">銘柄</label>
                    <select
                        value={form.symbol}
                        onChange={(e) => setForm(prev => ({ ...prev, symbol: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    >
                        {symbols.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium">条件</label>
                    <select
                        value={form.condition}
                        onChange={(e) => setForm(prev => ({ ...prev, condition: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    >
                        <option value="above">以上になったら</option>
                        <option value="below">以下になったら</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium">目標価格</label>
                    <input
                        type="number"
                        value={form.targetPrice}
                        onChange={(e) => setForm(prev => ({ ...prev, targetPrice: e.target.value }))}
                        placeholder="100.00"
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                        step="any"
                        required
                    />
                </div>
            </div>
            <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={onCancel}>キャンセル</Button>
                <Button type="submit"><Plus className="w-4 h-4 mr-1" /> 追加</Button>
            </div>
        </form>
    );
};

const Alerts = () => {
    const { alerts, addAlert, deleteAlert, checkAlerts, clearTriggered } = useAlerts();
    const { holdings } = useHoldings();
    const [isAdding, setIsAdding] = useState(false);
    const [quotes, setQuotes] = useState({});

    const symbols = holdings.map(h => h.symbol);

    useEffect(() => {
        const loadQuotes = async () => {
            if (symbols.length > 0) {
                const data = await fetchMultipleQuotes(symbols);
                setQuotes(data);
                checkAlerts(data);
            }
        };
        loadQuotes();
        const interval = setInterval(loadQuotes, 60 * 1000); // Check every minute
        return () => clearInterval(interval);
    }, [symbols.join(',')]);

    const activeAlerts = alerts.filter(a => !a.triggered);
    const triggeredAlerts = alerts.filter(a => a.triggered);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Bell className="w-6 h-6" /> 株価アラート
                    </h1>
                    <p className="text-muted-foreground">目標価格に達したら通知します</p>
                </div>
                <Button onClick={() => setIsAdding(true)}>
                    <Plus className="w-4 h-4 mr-1" /> アラート追加
                </Button>
            </div>

            {isAdding && (
                <Card>
                    <CardHeader>
                        <CardTitle>新規アラート</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AlertForm
                            symbols={symbols}
                            onAdd={(data) => { addAlert(data); setIsAdding(false); }}
                            onCancel={() => setIsAdding(false)}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Active Alerts */}
            <Card>
                <CardHeader>
                    <CardTitle>有効なアラート ({activeAlerts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {activeAlerts.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">アラートがありません</p>
                    ) : (
                        <div className="space-y-3">
                            {activeAlerts.map(alert => {
                                const quote = quotes[alert.symbol];
                                return (
                                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center",
                                                alert.condition === 'above' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                                            )}>
                                                {alert.condition === 'above' ? (
                                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                                ) : (
                                                    <TrendingDown className="w-5 h-5 text-red-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">{alert.symbol}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {alert.condition === 'above' ? '以上' : '以下'}: {alert.targetPrice}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">現在: {quote?.price?.toFixed(2) || 'N/A'}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => deleteAlert(alert.id)}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Triggered Alerts */}
            {triggeredAlerts.length > 0 && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Check className="w-5 h-5 text-green-500" />
                            発動したアラート ({triggeredAlerts.length})
                        </CardTitle>
                        <Button variant="outline" size="sm" onClick={clearTriggered}>
                            クリア
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {triggeredAlerts.map(alert => (
                                <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                                    <div>
                                        <p className="font-medium">{alert.symbol}</p>
                                        <p className="text-sm text-muted-foreground">
                                            目標: {alert.targetPrice} → 発動: {new Date(alert.triggeredAt).toLocaleString('ja-JP')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default Alerts;
