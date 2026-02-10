import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Brain, ArrowRight, AlertTriangle, CheckCircle, Info, BarChart3 } from 'lucide-react';
import { useHoldings } from '@/hooks/useHoldings';
import { fetchMultipleQuotes, calculatePortfolioSummary } from '@/lib/stockApi';
import { groupBySector, calculateRebalance, generatePortfolioAnalysis, SECTOR_COLORS } from '@/lib/sectorAnalysis';
import { fetchUsdJpyRate, convertCurrency, formatCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';

const DEFAULT_TARGET = {
    'テクノロジー': 25,
    '金融': 15,
    'ヘルスケア': 15,
    'コモディティ': 15,
    '不動産': 10,
    'エネルギー': 10,
    'インデックス': 10,
};

const SectorAnalysis = () => {
    const { holdings, isLoaded } = useHoldings();
    const [sectorData, setSectorData] = useState([]);
    const [rebalance, setRebalance] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [targetAllocation, setTargetAllocation] = useState(() => {
        const stored = localStorage.getItem('target_allocation');
        return stored ? JSON.parse(stored) : DEFAULT_TARGET;
    });

    useEffect(() => {
        const load = async () => {
            if (!isLoaded || holdings.length === 0) { setIsLoading(false); return; }
            setIsLoading(true);
            try {
                const symbols = holdings.map(h => h.symbol);
                const quotes = await fetchMultipleQuotes(symbols);
                const summary = calculatePortfolioSummary(holdings, quotes);
                const rate = await fetchUsdJpyRate();

                const getVal = (h) => {
                    const val = h.currentValue || 0;
                    return h.currency === 'USD' ? val * rate : val;
                };

                const sectors = groupBySector(summary.holdings, getVal);
                setSectorData(sectors);

                const totalValue = sectors.reduce((s, sec) => s + sec.totalValue, 0);
                const rb = calculateRebalance(summary.holdings, targetAllocation, getVal);
                setRebalance(rb);

                const ai = generatePortfolioAnalysis(summary.holdings, sectors, totalValue);
                setAnalysis(ai);
            } catch (e) { console.error(e); }
            setIsLoading(false);
        };
        load();
    }, [isLoaded, holdings]);

    const totalValue = sectorData.reduce((s, sec) => s + sec.totalValue, 0);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="w-6 h-6" /> セクター分析
            </h1>

            {/* Sector Pie Chart */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>セクター別配分</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={sectorData.map(s => ({ name: s.name, value: s.totalValue }))}
                                    cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                                    {sectorData.map((s, i) => <Cell key={i} fill={s.color} />)}
                                </Pie>
                                <Tooltip formatter={(v) => formatCurrency(v, 'JPY')} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap justify-center gap-3 mt-2">
                            {sectorData.map((s, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                                    <span className="text-xs">{s.name} ({(s.totalValue / totalValue * 100).toFixed(1)}%)</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Sector Bar Chart */}
                <Card>
                    <CardHeader><CardTitle>セクター別金額</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={sectorData.map(s => ({ name: s.name, value: s.totalValue }))}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="name" fontSize={11} />
                                <YAxis tickFormatter={v => `¥${(v / 10000).toFixed(0)}万`} fontSize={11} />
                                <Tooltip formatter={(v) => formatCurrency(v, 'JPY')} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {sectorData.map((s, i) => <Cell key={i} fill={s.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Rebalance Suggestions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" /> リバランス提案</CardTitle>
                    <CardDescription>目標配分と現状の乖離</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {rebalance.map((r, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm">{r.sector}</span>
                                        <span className={cn("text-sm font-medium",
                                            r.diffPercent > 2 ? "text-green-600" : r.diffPercent < -2 ? "text-red-600" : "text-muted-foreground"
                                        )}>
                                            {r.action}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(r.currentPercent, 100)}%` }} />
                                        </div>
                                        <span className="text-xs text-muted-foreground w-20 text-right">
                                            {r.currentPercent.toFixed(1)}% → {r.targetPercent}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* AI Analysis */}
            {analysis && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5" /> AI ポートフォリオ分析</CardTitle>
                        <CardDescription>ルールベースAIによる自動分析</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {analysis.warnings.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm flex items-center gap-2 text-red-600">
                                    <AlertTriangle className="w-4 h-4" /> 警告
                                </h4>
                                {analysis.warnings.map((w, i) => (
                                    <p key={i} className="text-sm p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">{w}</p>
                                ))}
                            </div>
                        )}
                        {analysis.insights.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm flex items-center gap-2 text-blue-600">
                                    <Info className="w-4 h-4" /> 分析結果
                                </h4>
                                {analysis.insights.map((ins, i) => (
                                    <p key={i} className="text-sm p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">{ins}</p>
                                ))}
                            </div>
                        )}
                        {analysis.recommendations.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm flex items-center gap-2 text-green-600">
                                    <CheckCircle className="w-4 h-4" /> 推奨アクション
                                </h4>
                                {analysis.recommendations.map((r, i) => (
                                    <p key={i} className="text-sm p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">{r}</p>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default SectorAnalysis;
