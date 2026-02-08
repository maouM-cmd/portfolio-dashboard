import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Plus, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useHoldings } from '@/hooks/useHoldings';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const TransactionForm = ({ symbols, onAdd, onCancel }) => {
    const [form, setForm] = useState({
        type: 'buy',
        symbol: symbols[0] || '',
        quantity: '',
        price: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.quantity || !form.price) {
            toast.error('数量と価格を入力してください');
            return;
        }
        onAdd({
            ...form,
            quantity: parseFloat(form.quantity),
            price: parseFloat(form.price),
            total: parseFloat(form.quantity) * parseFloat(form.price),
        });
        toast.success('取引を記録しました');
        setForm({
            type: 'buy',
            symbol: symbols[0] || '',
            quantity: '',
            price: '',
            date: new Date().toISOString().split('T')[0],
            notes: '',
        });
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-muted/30 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <label className="text-sm font-medium">種類</label>
                    <select
                        value={form.type}
                        onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    >
                        <option value="buy">買い</option>
                        <option value="sell">売り</option>
                        <option value="dividend">配当</option>
                    </select>
                </div>
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
                    <label className="text-sm font-medium">数量</label>
                    <input
                        type="number"
                        value={form.quantity}
                        onChange={(e) => setForm(prev => ({ ...prev, quantity: e.target.value }))}
                        placeholder="10"
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                        step="any"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">価格</label>
                    <input
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="100.00"
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                        step="any"
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">日付</label>
                    <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">メモ</label>
                    <input
                        type="text"
                        value={form.notes}
                        onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="メモ（任意）"
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    />
                </div>
            </div>
            <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={onCancel}>キャンセル</Button>
                <Button type="submit"><Plus className="w-4 h-4 mr-1" /> 記録</Button>
            </div>
        </form>
    );
};

const Transactions = () => {
    const { transactions, addTransaction, deleteTransaction } = useTransactions();
    const { holdings } = useHoldings();
    const [isAdding, setIsAdding] = useState(false);
    const [filter, setFilter] = useState('all');

    const symbols = holdings.map(h => h.symbol);

    const filteredTransactions = filter === 'all'
        ? transactions
        : transactions.filter(t => t.type === filter);

    const formatCurrency = (value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <History className="w-6 h-6" /> 取引履歴
                    </h1>
                    <p className="text-muted-foreground">すべての売買・配当を記録</p>
                </div>
                <Button onClick={() => setIsAdding(true)}>
                    <Plus className="w-4 h-4 mr-1" /> 取引追加
                </Button>
            </div>

            {isAdding && (
                <Card>
                    <CardHeader>
                        <CardTitle>新規取引</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TransactionForm
                            symbols={symbols}
                            onAdd={(data) => { addTransaction(data); setIsAdding(false); }}
                            onCancel={() => setIsAdding(false)}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Filter */}
            <div className="flex gap-2">
                {[
                    { value: 'all', label: 'すべて' },
                    { value: 'buy', label: '買い' },
                    { value: 'sell', label: '売り' },
                    { value: 'dividend', label: '配当' },
                ].map(f => (
                    <Button
                        key={f.value}
                        variant={filter === f.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter(f.value)}
                    >
                        {f.label}
                    </Button>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>取引一覧 ({filteredTransactions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredTransactions.length === 0 ? (
                        <div className="text-center py-8">
                            <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">取引履歴がありません</p>
                            <Button onClick={() => setIsAdding(true)}>
                                <Plus className="w-4 h-4 mr-1" /> 最初の取引を記録
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredTransactions.map(tx => (
                                <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center",
                                            tx.type === 'buy' ? 'bg-green-100 dark:bg-green-900' :
                                                tx.type === 'sell' ? 'bg-red-100 dark:bg-red-900' :
                                                    'bg-blue-100 dark:bg-blue-900'
                                        )}>
                                            {tx.type === 'buy' ? (
                                                <ArrowDownRight className="w-5 h-5 text-green-600" />
                                            ) : tx.type === 'sell' ? (
                                                <ArrowUpRight className="w-5 h-5 text-red-600" />
                                            ) : (
                                                <span className="text-blue-600 font-bold">¥</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {tx.type === 'buy' ? '買い' : tx.type === 'sell' ? '売り' : '配当'}: {tx.symbol}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {tx.date} {tx.notes && `・${tx.notes}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{formatCurrency(tx.total)}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {tx.quantity}株 @ {formatCurrency(tx.price)}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => deleteTransaction(tx.id)}>
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Transactions;
