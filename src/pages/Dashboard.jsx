import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, DollarSign, RefreshCw, FileSpreadsheet, FileText, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHoldings } from '@/hooks/useHoldings';
import { fetchMultipleQuotes, calculatePortfolioSummary, fetchHistoricalData } from '@/lib/stockApi';
import { exportToExcel } from '@/lib/exportExcel';
import { exportSummaryToPdf } from '@/lib/exportPdf';
import { fetchUsdJpyRate, convertCurrency, formatCurrency } from '@/lib/currency';

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c43', '#a05195', '#665191'];

const StatsCard = ({ title, value, change, icon: Icon, trend, isLoading }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-24 mb-1" />
                    <div className="h-4 bg-muted rounded w-32" />
                </div>
            ) : (
                <>
                    <div className="text-2xl font-bold">{value}</div>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                        {trend === 'up' ? (
                            <ArrowUpRight className="text-green-500 h-4 w-4 mr-1" />
                        ) : (
                            <ArrowDownRight className="text-red-500 h-4 w-4 mr-1" />
                        )}
                        <span className={trend === 'up' ? 'text-green-500' : 'text-red-500'}>{change}</span>
                    </p>
                </>
            )}
        </CardContent>
    </Card>
);

const Dashboard = () => {
    const { holdings, isLoaded } = useHoldings();
    const [quotes, setQuotes] = useState({});
    const [portfolioSummary, setPortfolioSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [historicalData, setHistoricalData] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [displayCurrency, setDisplayCurrency] = useState('JPY');
    const [usdJpyRate, setUsdJpyRate] = useState(150);

    const loadData = async () => {
        if (!isLoaded || holdings.length === 0) return;

        setIsLoading(true);
        try {
            const symbols = holdings.map(h => h.symbol);
            const quotesData = await fetchMultipleQuotes(symbols);
            setQuotes(quotesData);

            const summary = calculatePortfolioSummary(holdings, quotesData);
            setPortfolioSummary(summary);

            // Fetch exchange rate
            const rate = await fetchUsdJpyRate();
            setUsdJpyRate(rate);

            // Load historical data for portfolio chart
            if (symbols.length > 0) {
                const history = await fetchHistoricalData('^GSPC', '6mo');
                setHistoricalData(history.map(d => ({
                    name: d.date.slice(5),
                    sp500: d.close,
                    portfolio: d.close * (summary.totalValue / (history[history.length - 1]?.close || 1)),
                })));
            }

            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error loading data:', error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [isLoaded, holdings]);

    // Convert all values to display currency
    const convertValue = (value, fromCurrency) => {
        if (!value) return 0;
        return convertCurrency(value, fromCurrency || 'USD', displayCurrency, usdJpyRate);
    };

    const totalValueInDisplayCurrency = portfolioSummary?.holdings?.reduce((sum, h) => {
        return sum + convertValue(h.currentValue, h.currency);
    }, 0) || 0;

    const totalCostInDisplayCurrency = portfolioSummary?.holdings?.reduce((sum, h) => {
        return sum + convertValue(h.cost * h.quantity, h.currency);
    }, 0) || 0;

    const totalPnlInDisplayCurrency = totalValueInDisplayCurrency - totalCostInDisplayCurrency;
    const totalPnlPercent = totalCostInDisplayCurrency > 0 ? (totalPnlInDisplayCurrency / totalCostInDisplayCurrency * 100) : 0;

    const allocationData = portfolioSummary?.holdings?.map((h, i) => ({
        name: h.name,
        value: convertValue(h.currentValue, h.currency),
        color: CHART_COLORS[i % CHART_COLORS.length],
    })) || [];

    const handleExportExcel = () => {
        if (portfolioSummary) exportToExcel(portfolioSummary);
    };

    const handleExportPdf = () => {
        if (portfolioSummary) exportSummaryToPdf(portfolioSummary);
    };

    return (
        <div id="dashboard-content" className="space-y-6">
            {/* Header with actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">ポートフォリオダッシュボード</h1>
                    <div className="flex items-center gap-3 mt-1">
                        {lastUpdated && (
                            <p className="text-sm text-muted-foreground">
                                最終更新: {lastUpdated.toLocaleTimeString('ja-JP')}
                            </p>
                        )}
                        <span className="text-xs text-muted-foreground">
                            USD/JPY: ¥{usdJpyRate.toFixed(2)}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {/* Currency Toggle */}
                    <Button
                        variant="outline" size="sm"
                        onClick={() => setDisplayCurrency(prev => prev === 'JPY' ? 'USD' : 'JPY')}
                    >
                        <Globe className="w-4 h-4 mr-1" />
                        {displayCurrency}
                    </Button>
                    <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
                        <RefreshCw className={cn("w-4 h-4 mr-1", isLoading && "animate-spin")} />
                        更新
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={!portfolioSummary}>
                        <FileSpreadsheet className="w-4 h-4 mr-1" />
                        Excel
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={!portfolioSummary}>
                        <FileText className="w-4 h-4 mr-1" />
                        PDF
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="総資産価値"
                    value={formatCurrency(totalValueInDisplayCurrency, displayCurrency)}
                    change={`${totalPnlPercent.toFixed(2)}%`}
                    trend={totalPnlInDisplayCurrency >= 0 ? 'up' : 'down'}
                    icon={Wallet}
                    isLoading={isLoading}
                />
                <StatsCard
                    title="総損益"
                    value={formatCurrency(totalPnlInDisplayCurrency, displayCurrency)}
                    change={`${totalPnlPercent.toFixed(2)}%`}
                    trend={totalPnlInDisplayCurrency >= 0 ? 'up' : 'down'}
                    icon={TrendingUp}
                    isLoading={isLoading}
                />
                <StatsCard
                    title="総取得コスト"
                    value={formatCurrency(totalCostInDisplayCurrency, displayCurrency)}
                    change="basis"
                    trend="up"
                    icon={DollarSign}
                    isLoading={isLoading}
                />
                <StatsCard
                    title="保有銘柄数"
                    value={holdings.length.toString()}
                    change={`${holdings.length} 銘柄`}
                    trend="up"
                    icon={PieChart}
                    isLoading={isLoading}
                />
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>ポートフォリオ推移</CardTitle>
                        <CardDescription>S&P 500 vs ポートフォリオ（過去6ヶ月）</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        {isLoading ? (
                            <div className="h-[300px] flex items-center justify-center">
                                <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={historicalData}>
                                    <defs>
                                        <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false}
                                        tickFormatter={(v) => displayCurrency === 'JPY' ? `¥${(v / 1000).toFixed(0)}k` : `$${v.toFixed(0)}`} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="sp500" stroke="#8884d8" name="S&P 500" dot={false} strokeWidth={2} />
                                    <Line type="monotone" dataKey="portfolio" stroke="#82ca9d" name="ポートフォリオ" dot={false} strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>資産配分</CardTitle>
                        <CardDescription>現在のポートフォリオ構成（{displayCurrency}換算）</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="h-[300px] flex items-center justify-center">
                                <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie data={allocationData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {allocationData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                            formatter={(value) => formatCurrency(value, displayCurrency)}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex flex-wrap justify-center gap-3 mt-2">
                                    {allocationData.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-xs text-muted-foreground">{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Holdings Table */}
            <Card>
                <CardHeader>
                    <CardTitle>保有銘柄明細</CardTitle>
                    <CardDescription>リアルタイム株価情報（{displayCurrency}換算）</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <div key={i} className="animate-pulse flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-muted rounded-full" />
                                        <div>
                                            <div className="h-4 bg-muted rounded w-24 mb-1" />
                                            <div className="h-3 bg-muted rounded w-16" />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="h-4 bg-muted rounded w-20 mb-1" />
                                        <div className="h-3 bg-muted rounded w-12" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            portfolioSummary?.holdings?.map((holding) => {
                                const displayValue = convertValue(holding.currentValue, holding.currency);
                                const displayPrice = convertValue(holding.currentPrice, holding.currency);
                                const displayPnl = convertValue(holding.pnl, holding.currency);
                                return (
                                    <div
                                        key={holding.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                                                holding.pnl >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                                    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                            )}>
                                                {holding.name?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-medium">{holding.name}</p>
                                                <p className="text-sm text-muted-foreground">{holding.symbol}</p>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-medium">{holding.quantity} 株</p>
                                            <p className="text-sm text-muted-foreground">
                                                @ {formatCurrency(displayPrice, displayCurrency)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{formatCurrency(displayValue, displayCurrency)}</p>
                                            <p className={cn(
                                                "text-sm",
                                                holding.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                                            )}>
                                                {holding.pnl >= 0 ? '+' : ''}{formatCurrency(displayPnl, displayCurrency)} ({holding.pnlPercent?.toFixed(2)}%)
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Dashboard;
