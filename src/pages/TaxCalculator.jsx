import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';
import { useHoldings } from '@/hooks/useHoldings';
import { useTransactions } from '@/hooks/useTransactions';
import { fetchMultipleQuotes, calculatePortfolioSummary } from '@/lib/stockApi';
import { calculateCapitalGainsTax, calculateUnrealizedGains, generateTaxSummary } from '@/lib/taxCalculation';
import { fetchUsdJpyRate, convertCurrency, formatCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { HelpTip } from '@/components/HelpTooltip';

const TaxCalculator = () => {
    const { holdings, isLoaded } = useHoldings();
    const { transactions } = useTransactions();
    const [taxSummary, setTaxSummary] = useState(null);
    const [unrealized, setUnrealized] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const load = async () => {
            if (!isLoaded) { setIsLoading(false); return; }
            setIsLoading(true);
            try {
                const symbols = holdings.map(h => h.symbol);
                const quotes = await fetchMultipleQuotes(symbols);
                const summary = calculatePortfolioSummary(holdings, quotes);

                const tax = generateTaxSummary(transactions, summary.holdings, selectedYear);
                setTaxSummary(tax);

                const ur = calculateUnrealizedGains(summary.holdings);
                setUnrealized(ur);
            } catch (e) { console.error(e); }
            setIsLoading(false);
        };
        load();
    }, [isLoaded, holdings, transactions, selectedYear]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Calculator className="w-6 h-6" /> 税金計算<HelpTip termKey="taxRate" />
                    </h1>
                    <p className="text-muted-foreground">株を売ったときにかかる税金の目安を確認できます</p>
                </div>
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-3 py-2 border rounded-md bg-background"
                >
                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}年</option>)}
                </select>
            </div>

            {/* Important Notice */}
            <div className="p-4 border rounded-lg bg-muted/30 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                    <p className="font-medium">参考値です</p>
                    <p className="text-muted-foreground">この計算は概算です。正確な税額は税理士または国税庁の確定申告書作成コーナーでご確認ください。税率20.315%（所得税15.315% + 住民税5%）で計算しています。</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">含み益<HelpTip termKey="unrealizedGain" /></CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ¥{Math.round(unrealized?.totalUnrealizedGain || 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">含み損<HelpTip termKey="unrealizedLoss" /></CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            -¥{Math.round(unrealized?.totalUnrealizedLoss || 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">純含み損益</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-2xl font-bold", (unrealized?.netUnrealized || 0) >= 0 ? "text-green-600" : "text-red-600")}>
                            {(unrealized?.netUnrealized || 0) >= 0 ? '' : '-'}¥{Math.round(Math.abs(unrealized?.netUnrealized || 0)).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">推定税額（含み益分）</CardTitle>
                        <Calculator className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ¥{Math.round(unrealized?.potentialTax || 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">売却した場合の税額</p>
                    </CardContent>
                </Card>
            </div>

            {/* Per-Holding Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>銘柄別 含み損益</CardTitle>
                    <CardDescription>各銘柄の未実現損益と売却時の推定税額</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {unrealized?.details?.map((d, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="font-medium text-sm">{d.name}</p>
                                    <p className="text-xs text-muted-foreground">{d.symbol}</p>
                                </div>
                                <div className="text-right">
                                    <p className={cn("font-medium text-sm", d.gain >= 0 ? "text-green-600" : "text-red-600")}>
                                        {d.gain >= 0 ? '+' : ''}¥{Math.round(d.gain).toLocaleString()} ({d.gainPercent?.toFixed(1)}%)
                                    </p>
                                    {d.potentialTax > 0 && (
                                        <p className="text-xs text-muted-foreground">税額: ¥{Math.round(d.potentialTax).toLocaleString()}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Tax Rate Info */}
            <Card>
                <CardHeader><CardTitle>日本の株式譲渡益課税</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="p-4 bg-muted/30 rounded-lg">
                            <p className="text-sm font-medium">所得税</p>
                            <p className="text-2xl font-bold">15.315%</p>
                            <p className="text-xs text-muted-foreground">復興特別所得税含む</p>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-lg">
                            <p className="text-sm font-medium">住民税</p>
                            <p className="text-2xl font-bold">5%</p>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-lg">
                            <p className="text-sm font-medium">合計税率</p>
                            <p className="text-2xl font-bold">20.315%</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TaxCalculator;
