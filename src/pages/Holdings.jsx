import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, Save, X, RotateCcw } from 'lucide-react';
import { useHoldings } from '@/hooks/useHoldings';
import { cn } from '@/lib/utils';

const HoldingForm = ({ holding, onSave, onCancel }) => {
    const [form, setForm] = useState({
        symbol: holding?.symbol || '',
        name: holding?.name || '',
        quantity: holding?.quantity || '',
        purchasePrice: holding?.purchasePrice || '',
        purchaseDate: holding?.purchaseDate || new Date().toISOString().split('T')[0],
        currency: holding?.currency || 'JPY',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...form,
            quantity: parseFloat(form.quantity),
            purchasePrice: parseFloat(form.purchasePrice),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">シンボル</label>
                    <input
                        type="text"
                        value={form.symbol}
                        onChange={(e) => setForm(prev => ({ ...prev, symbol: e.target.value }))}
                        placeholder="例: 9532.T, HUM"
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                        required
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">銘柄名</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="例: 大阪瓦斯"
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                        required
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">保有数量</label>
                    <input
                        type="number"
                        value={form.quantity}
                        onChange={(e) => setForm(prev => ({ ...prev, quantity: e.target.value }))}
                        placeholder="100"
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                        required
                        min="0"
                        step="any"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">取得単価</label>
                    <input
                        type="number"
                        value={form.purchasePrice}
                        onChange={(e) => setForm(prev => ({ ...prev, purchasePrice: e.target.value }))}
                        placeholder="2800"
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                        required
                        min="0"
                        step="any"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">取得日</label>
                    <input
                        type="date"
                        value={form.purchaseDate}
                        onChange={(e) => setForm(prev => ({ ...prev, purchaseDate: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                        required
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">通貨</label>
                    <select
                        value={form.currency}
                        onChange={(e) => setForm(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    >
                        <option value="JPY">JPY (円)</option>
                        <option value="USD">USD (ドル)</option>
                    </select>
                </div>
            </div>
            <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    <X className="w-4 h-4 mr-1" /> キャンセル
                </Button>
                <Button type="submit">
                    <Save className="w-4 h-4 mr-1" /> 保存
                </Button>
            </div>
        </form>
    );
};

const Holdings = () => {
    const { holdings, addHolding, updateHolding, deleteHolding, resetToDefaults } = useHoldings();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const handleAdd = (data) => {
        addHolding(data);
        setIsAdding(false);
    };

    const handleUpdate = (id) => (data) => {
        updateHolding(id, data);
        setEditingId(null);
    };

    const handleDelete = (id) => {
        if (window.confirm('この銘柄を削除しますか？')) {
            deleteHolding(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">保有銘柄管理</h1>
                    <p className="text-muted-foreground">あなたのポートフォリオを編集・管理</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={resetToDefaults}>
                        <RotateCcw className="w-4 h-4 mr-1" /> リセット
                    </Button>
                    <Button onClick={() => setIsAdding(true)}>
                        <Plus className="w-4 h-4 mr-1" /> 銘柄追加
                    </Button>
                </div>
            </div>

            {isAdding && (
                <Card>
                    <CardHeader>
                        <CardTitle>新規銘柄追加</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <HoldingForm onSave={handleAdd} onCancel={() => setIsAdding(false)} />
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                {holdings.map((holding) => (
                    <Card key={holding.id}>
                        <CardContent className="p-4">
                            {editingId === holding.id ? (
                                <HoldingForm
                                    holding={holding}
                                    onSave={handleUpdate(holding.id)}
                                    onCancel={() => setEditingId(null)}
                                />
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                            {holding.name?.[0] || holding.symbol?.[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{holding.name}</h3>
                                            <p className="text-sm text-muted-foreground">{holding.symbol}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{holding.quantity} 株</p>
                                        <p className="text-sm text-muted-foreground">
                                            取得単価: {holding.currency === 'JPY' ? '¥' : '$'}{holding.purchasePrice?.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => setEditingId(holding.id)}>
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(holding.id)}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {holdings.length === 0 && !isAdding && (
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground mb-4">まだ銘柄が登録されていません</p>
                        <Button onClick={() => setIsAdding(true)}>
                            <Plus className="w-4 h-4 mr-1" /> 最初の銘柄を追加
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default Holdings;
