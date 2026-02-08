import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, RefreshCw, ExternalLink, Clock } from 'lucide-react';
import { useHoldings } from '@/hooks/useHoldings';

// Note: Due to CORS, we'll use a proxy for news
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

const fetchNews = async (symbol) => {
    try {
        const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(symbol)}&newsCount=5`;
        const response = await fetch(CORS_PROXY + encodeURIComponent(url));
        const data = await response.json();
        return data.news || [];
    } catch (error) {
        console.error('Error fetching news:', error);
        return [];
    }
};

const News = () => {
    const { holdings } = useHoldings();
    const [news, setNews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSymbol, setSelectedSymbol] = useState('all');

    const symbols = holdings.map(h => h.symbol);

    useEffect(() => {
        loadNews();
    }, [selectedSymbol]);

    const loadNews = async () => {
        setIsLoading(true);
        try {
            let allNews = [];

            if (selectedSymbol === 'all') {
                // Fetch news for all holdings
                const newsPromises = symbols.slice(0, 5).map(fetchNews);
                const results = await Promise.all(newsPromises);
                allNews = results.flat();
            } else {
                allNews = await fetchNews(selectedSymbol);
            }

            // Remove duplicates and sort by date
            const uniqueNews = allNews.reduce((acc, item) => {
                if (!acc.find(n => n.uuid === item.uuid)) {
                    acc.push(item);
                }
                return acc;
            }, []);

            // Sort by publish time
            uniqueNews.sort((a, b) => b.providerPublishTime - a.providerPublishTime);

            setNews(uniqueNews.slice(0, 20));
        } catch (error) {
            console.error('Error loading news:', error);
        }
        setIsLoading(false);
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 1) return '1時間以内';
        if (hours < 24) return `${hours}時間前`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}日前`;
        return date.toLocaleDateString('ja-JP');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Newspaper className="w-6 h-6" /> マーケットニュース
                    </h1>
                    <p className="text-muted-foreground">保有銘柄に関連するニュース</p>
                </div>
                <Button onClick={loadNews} disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                    更新
                </Button>
            </div>

            {/* Symbol Filter */}
            <div className="flex gap-2 flex-wrap">
                <Button
                    variant={selectedSymbol === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSymbol('all')}
                >
                    すべて
                </Button>
                {symbols.map(s => (
                    <Button
                        key={s}
                        variant={selectedSymbol === s ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedSymbol(s)}
                    >
                        {s}
                    </Button>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>最新ニュース</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="animate-pulse p-4 border rounded-lg">
                                    <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                                    <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                                    <div className="h-3 bg-muted rounded w-1/4" />
                                </div>
                            ))}
                        </div>
                    ) : news.length === 0 ? (
                        <div className="text-center py-8">
                            <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">ニュースが見つかりませんでした</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {news.map((item, index) => (
                                <a
                                    key={item.uuid || index}
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
                                >
                                    <div className="flex gap-4">
                                        {item.thumbnail?.resolutions?.[0]?.url && (
                                            <img
                                                src={item.thumbnail.resolutions[0].url}
                                                alt=""
                                                className="w-24 h-16 object-cover rounded"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                                                {item.title}
                                                <ExternalLink className="inline w-3 h-3 ml-1 opacity-50" />
                                            </h3>
                                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                                <span>{item.publisher}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(item.providerPublishTime)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default News;
