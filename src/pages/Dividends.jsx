import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Trash2, DollarSign, TrendingUp } from 'lucide-react';
import { useDividends } from '@/hooks/useDividends';
import { useHoldings } from '@/hooks/useHoldings';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const MONTHS_JP = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

const DividendForm = ({ symbols, onAdd, onCancel }) => {
    const [form, setForm] = useState({
        symbol: symbols[0] || '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        currency: 'JPY',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.amount) { toast.error('金額を入力してください'); return; }
        onAdd({ ...form, amount: parseFloat(form.amount) });
        toast.success('配当を記録しました');
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-muted/30 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <label className="text-sm font-medium">銘柄</label>
                    <select value={form.symbol} onChange={(e) => setForm(p => ({ ...p, symbol: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-background">
                        {symbols.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium">金額</label>
                    <input type="number" value={form.amount} onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))}
                        placeholder="1000" className="w-full mt-1 px-3 py-2 border rounded-md bg-background" step="any" />
                </div>
                <div>
                    <label className="text-sm font-medium">通貨</label>
                    <select value={form.currency} onChange={(e) => setForm(p => ({ ...p, currency: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-background">
                        <option value="JPY">JPY (¥)</option>
                        <option value="USD">USD ($)</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium">受取日</label>
                    <input type="date" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-background" />
                </div>
            </div>
            <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={onCancel}>キャンセル</Button>
                <Button type="submit"><Plus className="w-4 h-4 mr-1" /> 記録</Button>
            </div>
        </form>
    );
};

const Dividends = () => {
    const { dividends, addDividend, deleteDividend, getUpcomingDividends, getTotalDividends } = useDividends();
    const { holdings } = useHoldings();
    const [isAdding, setIsAdding] = useState(false);

    const symbols = holdings.map(h => h.symbol);
    const upcoming = getUpcomingDividends(holdings);
    const totalReceived = getTotalDividends();

    // Group upcoming by month
    const byMonth = upcoming.reduce((acc, d) => {
        const key = `${d.year}-${String(d.month).padStart(2, '0')}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(d);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Calendar className="w-6 h-6" /> 配当カレンダー
                    </h1>
                    <p className="text-muted-foreground">配当金の記録と予測</p>
                </div>
                <Button onClick={() => setIsAdding(true)}>
                    <Plus className="w-4 h-4 mr-1" /> 配当記録
                </Button>
            </div>

            {isAdding && (
                <Card>
                    <CardHeader><CardTitle>配当金を記録</CardTitle></CardHeader>
                    <CardContent>
                        <DividendForm symbols={symbols} onAdd={(d) => { addDividend(d); setIsAdding(false); }} onCancel={() => setIsAdding(false)} />
                    </CardContent>
                </Card>
            )}

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">累計配当金</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">¥{totalReceived.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">今年の配当</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ¥{dividends.filter(d => d.date?.startsWith(new Date().getFullYear().toString())).reduce((s, d) => s + (d.amount || 0), 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">配当予定</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{upcoming.length}回</div>
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming Dividends Calendar */}
            <Card>
                <CardHeader><CardTitle>今後の配当予定</CardTitle><CardDescription>保有銘柄の配当スケジュール（推定）</CardDescription></CardHeader>
                <CardContent>
                    {Object.keys(byMonth).length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">配当予定のある銘柄がありません</p>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(byMonth).map(([key, items]) => {
                                const [year, month] = key.split('-');
                                return (
                                    <div key={key}>
                                        <h3 className="font-medium mb-2 text-sm text-muted-foreground">{year}年 {MONTHS_JP[parseInt(month) - 1]}</h3>
                                        <div className="space-y-2">
                                            {items.map((item, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 font-bold text-xs">¥</div>
                                                        <div>
                                                            <p className="font-medium text-sm">{item.name}</p>
                                                            <p className="text-xs text-muted-foreground">{item.symbol} · {item.quantity}株</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{item.date}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Received Dividends */}
            <Card>
                <CardHeader><CardTitle>受取済み配当金 ({dividends.length}件)</CardTitle></CardHeader>
                <CardContent>
                    {dividends.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">配当記録がありません</p>
                            <Button onClick={() => setIsAdding(true)}><Plus className="w-4 h-4 mr-1" /> 最初の配当を記録</Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {dividends.map(d => (
                                <div key={d.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <p className="font-medium text-sm">{d.symbol}</p>
                                        <p className="text-xs text-muted-foreground">{d.date}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="font-medium text-green-600">{d.currency === 'JPY' ? '¥' : '$'}{d.amount?.toLocaleString()}</p>
                                        <Button variant="ghost" size="icon" onClick={() => deleteDividend(d.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Dividends;
