import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchHistoricalData } from '@/lib/stockApi';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

const BENCHMARKS = [
    { symbol: '^GSPC', name: 'S&P 500', color: '#8884d8' },
    { symbol: 'VT', name: 'VT (全世界株式)', color: '#82ca9d' },
    { symbol: '^N225', name: '日経225', color: '#ffc658' },
];

const Comparison = () => {
    const [benchmarkData, setBenchmarkData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRange, setSelectedRange] = useState('1y');
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        loadBenchmarkData();
    }, [selectedRange]);

    const loadBenchmarkData = async () => {
        setIsLoading(true);
        try {
            const data = {};
            for (const benchmark of BENCHMARKS) {
                const history = await fetchHistoricalData(benchmark.symbol, selectedRange);
                data[benchmark.symbol] = history;
            }
            setBenchmarkData(data);

            // Normalize and combine data for chart
            const combinedData = normalizeData(data);
            setChartData(combinedData);
        } catch (error) {
            console.error('Error loading benchmark data:', error);
        }
        setIsLoading(false);
    };

    const normalizeData = (data) => {
        // Get the shortest dataset length
        const lengths = Object.values(data).map(d => d.length);
        const minLength = Math.min(...lengths.filter(l => l > 0));

        if (minLength === 0) return [];

        // Create normalized data (100 = starting value)
        const result = [];
        const symbols = Object.keys(data);
        const baseValues = {};

        // Get base values from first data point
        symbols.forEach(sym => {
            if (data[sym]?.[0]?.close) {
                baseValues[sym] = data[sym][0].close;
            }
        });

        // Create normalized data points
        for (let i = 0; i < minLength; i++) {
            const point = { date: data[symbols[0]]?.[i]?.date || '' };

            symbols.forEach(sym => {
                if (data[sym]?.[i]?.close && baseValues[sym]) {
                    point[sym] = (data[sym][i].close / baseValues[sym]) * 100;
                }
            });

            result.push(point);
        }

        return result;
    };

    const calculatePerformance = (symbol) => {
        const data = benchmarkData[symbol];
        if (!data || data.length < 2) return null;

        const first = data[0]?.close;
        const last = data[data.length - 1]?.close;
        if (!first || !last) return null;

        const change = ((last - first) / first) * 100;
        return change;
    };

    const ranges = [
        { value: '1mo', label: '1ヶ月' },
        { value: '3mo', label: '3ヶ月' },
        { value: '6mo', label: '6ヶ月' },
        { value: '1y', label: '1年' },
        { value: '5y', label: '5年' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">ベンチマーク比較</h1>
                    <p className="text-muted-foreground">主要指数との比較分析</p>
                </div>
                <Button onClick={loadBenchmarkData} disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                    更新
                </Button>
            </div>

            {/* Performance Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                {BENCHMARKS.map((benchmark) => {
                    const perf = calculatePerformance(benchmark.symbol);
                    return (
                        <Card key={benchmark.symbol}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: benchmark.color }} />
                                    {benchmark.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    {perf !== null ? (
                                        <>
                                            {perf >= 0 ? (
                                                <TrendingUp className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <TrendingDown className="w-5 h-5 text-red-500" />
                                            )}
                                            <span className={`text-2xl font-bold ${perf >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {perf >= 0 ? '+' : ''}{perf.toFixed(2)}%
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-muted-foreground">Loading...</span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {selectedRange === '1mo' ? '過去1ヶ月' :
                                        selectedRange === '3mo' ? '過去3ヶ月' :
                                            selectedRange === '6mo' ? '過去6ヶ月' :
                                                selectedRange === '1y' ? '過去1年' : '過去5年'}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Range Selector */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>パフォーマンス推移</CardTitle>
                            <CardDescription>各指数を100として正規化</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            {ranges.map((range) => (
                                <Button
                                    key={range.value}
                                    variant={selectedRange === range.value ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedRange(range.value)}
                                >
                                    {range.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="h-[400px] flex items-center justify-center">
                            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickFormatter={(value) => {
                                        const date = new Date(value);
                                        return `${date.getMonth() + 1}/${date.getDate()}`;
                                    }}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    domain={['auto', 'auto']}
                                    tickFormatter={(value) => `${value.toFixed(0)}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: 'var(--radius)'
                                    }}
                                    labelFormatter={(value) => new Date(value).toLocaleDateString('ja-JP')}
                                    formatter={(value, name) => {
                                        const benchmark = BENCHMARKS.find(b => b.symbol === name);
                                        return [`${value.toFixed(2)}`, benchmark?.name || name];
                                    }}
                                />
                                <Legend
                                    formatter={(value) => {
                                        const benchmark = BENCHMARKS.find(b => b.symbol === value);
                                        return benchmark?.name || value;
                                    }}
                                />
                                {BENCHMARKS.map((benchmark) => (
                                    <Line
                                        key={benchmark.symbol}
                                        type="monotone"
                                        dataKey={benchmark.symbol}
                                        stroke={benchmark.color}
                                        strokeWidth={2}
                                        dot={false}
                                        name={benchmark.symbol}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Analysis Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>分析サマリー</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 text-sm">
                        <p>
                            <strong>S&P 500</strong>: 米国大型株500社で構成される代表的な株価指数。
                            テック企業の比率が高く、米国経済の動向を反映。
                        </p>
                        <p>
                            <strong>VT (全世界株式)</strong>: 先進国・新興国を含む全世界の株式に投資。
                            世界経済全体の成長を捉える分散投資向けベンチマーク。
                        </p>
                        <p>
                            <strong>日経225</strong>: 東京証券取引所プライム市場に上場する代表的な225銘柄。
                            日本経済の動向を反映。
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Comparison;
