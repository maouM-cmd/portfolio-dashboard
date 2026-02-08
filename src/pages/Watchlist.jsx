import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Plus, Trash2, TrendingUp, TrendingDown, Search } from 'lucide-react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { fetchMultipleQuotes, fetchStockQuote } from '@/lib/stockApi';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const AddToWatchlistForm = ({ onAdd, onCancel }) => {
    const [symbol, setSymbol] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!symbol.trim()) {
            toast.error('シンボルを入力してください');
            return;
        }

        setIsSearching(true);
        try {
            const quote = await fetchStockQuote(symbol.trim().toUpperCase());
            if (quote.error) {
                toast.error('銘柄が見つかりませんでした');
            } else {
                onAdd({
                    symbol: quote.symbol,
                    name: quote.name,
                });
                toast.success(`${quote.name} をウォッチリストに追加しました`);
                setSymbol('');
            }
        } catch (error) {
            toast.error('エラーが発生しました');
        }
        setIsSearching(false);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-muted/30 space-y-4">
            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="text-sm font-medium">銘柄シンボル</label>
                    <div className="relative mt-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}
                            placeholder="例: AAPL, 7203.T, BTC-USD"
                            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
                        />
                    </div>
                </div>
            </div>
            <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={onCancel}>キャンセル</Button>
                <Button type="submit" disabled={isSearching}>
                    {isSearching ? '検索中...' : <><Plus className="w-4 h-4 mr-1" /> 追加</>}
                </Button>
            </div>
        </form>
    );
};

const Watchlist = () => {
    const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
    const [isAdding, setIsAdding] = useState(false);
    const [quotes, setQuotes] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadQuotes = async () => {
            if (watchlist.length === 0) return;
            setIsLoading(true);
            const symbols = watchlist.map(w => w.symbol);
            const data = await fetchMultipleQuotes(symbols);
            setQuotes(data);
            setIsLoading(false);
        };
        loadQuotes();
        const interval = setInterval(loadQuotes, 60 * 1000);
        return () => clearInterval(interval);
    }, [watchlist.length]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Eye className="w-6 h-6" /> ウォッチリスト
                    </h1>
                    <p className="text-muted-foreground">気になる銘柄を監視</p>
                </div>
                <Button onClick={() => setIsAdding(true)}>
                    <Plus className="w-4 h-4 mr-1" /> 銘柄追加
                </Button>
            </div>

            {isAdding && (
                <Card>
                    <CardHeader>
                        <CardTitle>ウォッチリストに追加</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AddToWatchlistForm
                            onAdd={(data) => { addToWatchlist(data); setIsAdding(false); }}
                            onCancel={() => setIsAdding(false)}
                        />
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>監視中の銘柄 ({watchlist.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {watchlist.length === 0 ? (
                        <div className="text-center py-8">
                            <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">ウォッチリストが空です</p>
                            <Button onClick={() => setIsAdding(true)}>
                                <Plus className="w-4 h-4 mr-1" /> 最初の銘柄を追加
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {watchlist.map(item => {
                                const quote = quotes[item.symbol];
                                const isUp = quote?.change >= 0;
                                return (
                                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                                                isUp ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                                    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                            )}>
                                                {item.name?.[0] || item.symbol?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-medium">{item.name || item.symbol}</p>
                                                <p className="text-sm text-muted-foreground">{item.symbol}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {isLoading ? (
                                                <div className="animate-pulse">
                                                    <div className="h-5 bg-muted rounded w-16 mb-1" />
                                                    <div className="h-4 bg-muted rounded w-12" />
                                                </div>
                                            ) : quote ? (
                                                <>
                                                    <p className="font-medium">${quote.price?.toFixed(2)}</p>
                                                    <p className={cn("text-sm flex items-center justify-end",
                                                        isUp ? 'text-green-600' : 'text-red-600'
                                                    )}>
                                                        {isUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                                        {isUp ? '+' : ''}{quote.changePercent?.toFixed(2)}%
                                                    </p>
                                                </>
                                            ) : (
                                                <span className="text-muted-foreground">N/A</span>
                                            )}
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => removeFromWatchlist(item.id)}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Watchlist;
