// Sector classification data for common stocks
export const SECTOR_MAP = {
    // Japanese stocks
    '3003.T': { sector: 'Real Estate', sectorJP: '不動産', color: '#8884d8' },
    '9532.T': { sector: 'Utilities', sectorJP: 'エネルギー', color: '#ffc658' },
    '8306.T': { sector: 'Financial', sectorJP: '金融', color: '#82ca9d' },
    '7203.T': { sector: 'Automotive', sectorJP: '自動車', color: '#ff7c43' },
    '6758.T': { sector: 'Technology', sectorJP: 'テクノロジー', color: '#a05195' },
    '9984.T': { sector: 'Technology', sectorJP: 'テクノロジー', color: '#a05195' },
    '6861.T': { sector: 'Technology', sectorJP: 'テクノロジー', color: '#a05195' },

    // US stocks
    'AAPL': { sector: 'Technology', sectorJP: 'テクノロジー', color: '#a05195' },
    'MSFT': { sector: 'Technology', sectorJP: 'テクノロジー', color: '#a05195' },
    'GOOGL': { sector: 'Technology', sectorJP: 'テクノロジー', color: '#a05195' },
    'AMZN': { sector: 'Consumer', sectorJP: '消費財', color: '#d45087' },
    'TSLA': { sector: 'Automotive', sectorJP: '自動車', color: '#ff7c43' },
    'HUM': { sector: 'Healthcare', sectorJP: 'ヘルスケア', color: '#2f4b7c' },
    'JNJ': { sector: 'Healthcare', sectorJP: 'ヘルスケア', color: '#2f4b7c' },
    'JPM': { sector: 'Financial', sectorJP: '金融', color: '#82ca9d' },
    'V': { sector: 'Financial', sectorJP: '金融', color: '#82ca9d' },

    // ETFs / Funds
    'GC=F': { sector: 'Commodities', sectorJP: 'コモディティ', color: '#ffa600' },
    'GLD': { sector: 'Commodities', sectorJP: 'コモディティ', color: '#ffa600' },
    '2558.T': { sector: 'Index Fund', sectorJP: 'インデックス', color: '#665191' },

    // Default
    '_default': { sector: 'Other', sectorJP: 'その他', color: '#999999' },
};

export const SECTOR_COLORS = {
    'テクノロジー': '#a05195',
    '金融': '#82ca9d',
    'ヘルスケア': '#2f4b7c',
    '不動産': '#8884d8',
    'エネルギー': '#ffc658',
    '自動車': '#ff7c43',
    '消費財': '#d45087',
    'コモディティ': '#ffa600',
    'インデックス': '#665191',
    'その他': '#999999',
};

/**
 * Get sector info for a symbol
 */
export function getSectorInfo(symbol) {
    return SECTOR_MAP[symbol] || SECTOR_MAP['_default'];
}

/**
 * Group holdings by sector
 */
export function groupBySector(holdings, getValueFn) {
    const sectors = {};

    for (const holding of holdings) {
        const info = getSectorInfo(holding.symbol);
        const sectorName = info.sectorJP;

        if (!sectors[sectorName]) {
            sectors[sectorName] = {
                name: sectorName,
                nameEN: info.sector,
                color: SECTOR_COLORS[sectorName] || info.color,
                holdings: [],
                totalValue: 0,
            };
        }

        const value = getValueFn ? getValueFn(holding) : (holding.currentValue || 0);
        sectors[sectorName].holdings.push({ ...holding, sectorValue: value });
        sectors[sectorName].totalValue += value;
    }

    return Object.values(sectors).sort((a, b) => b.totalValue - a.totalValue);
}

/**
 * Calculate rebalance suggestions
 */
export function calculateRebalance(holdings, targetAllocation, getValueFn) {
    const totalValue = holdings.reduce((sum, h) => sum + (getValueFn ? getValueFn(h) : h.currentValue || 0), 0);
    if (totalValue === 0) return [];

    const sectors = groupBySector(holdings, getValueFn);
    const suggestions = [];

    for (const [sectorName, targetPercent] of Object.entries(targetAllocation)) {
        const sector = sectors.find(s => s.name === sectorName);
        const currentValue = sector?.totalValue || 0;
        const currentPercent = (currentValue / totalValue) * 100;
        const targetValue = totalValue * (targetPercent / 100);
        const diff = targetValue - currentValue;

        suggestions.push({
            sector: sectorName,
            currentPercent: currentPercent,
            targetPercent: targetPercent,
            diffPercent: targetPercent - currentPercent,
            diffValue: diff,
            action: diff > 0 ? '買い増し' : diff < 0 ? '売却検討' : '適正',
            color: SECTOR_COLORS[sectorName] || '#999',
        });
    }

    // Add sectors not in target
    for (const sector of sectors) {
        if (!targetAllocation[sector.name]) {
            suggestions.push({
                sector: sector.name,
                currentPercent: (sector.totalValue / totalValue) * 100,
                targetPercent: 0,
                diffPercent: -(sector.totalValue / totalValue) * 100,
                diffValue: -sector.totalValue,
                action: '目標配分なし',
                color: sector.color,
            });
        }
    }

    return suggestions.sort((a, b) => Math.abs(b.diffPercent) - Math.abs(a.diffPercent));
}

/**
 * Generate AI-style portfolio analysis (no API needed)
 */
export function generatePortfolioAnalysis(holdings, sectorGroups, totalValue) {
    const insights = [];
    const warnings = [];
    const recommendations = [];

    if (holdings.length === 0) {
        return { insights: ['保有銘柄がありません'], warnings: [], recommendations: ['まずは銘柄を追加しましょう'] };
    }

    // Concentration analysis
    const maxHolding = holdings.reduce((max, h) => (h.currentValue || 0) > (max.currentValue || 0) ? h : max, holdings[0]);
    const maxPercent = totalValue > 0 ? ((maxHolding.currentValue || 0) / totalValue * 100) : 0;

    if (maxPercent > 40) {
        warnings.push(`⚠️ ${maxHolding.name}が全体の${maxPercent.toFixed(1)}%を占めています。集中リスクが高い状態です。`);
        recommendations.push(`${maxHolding.name}のウェイトを30%以下にリバランスすることを検討してください。`);
    } else if (maxPercent > 25) {
        insights.push(`📊 ${maxHolding.name}が最大保有(${maxPercent.toFixed(1)}%)です。やや集中気味です。`);
    } else {
        insights.push(`✅ 保有銘柄は比較的分散されています（最大${maxPercent.toFixed(1)}%）。`);
    }

    // Sector diversity
    if (sectorGroups.length === 1) {
        warnings.push(`⚠️ 全銘柄が「${sectorGroups[0].name}」セクターに集中しています。セクター分散を検討してください。`);
    } else if (sectorGroups.length <= 2) {
        insights.push(`📋 ${sectorGroups.length}セクターに投資中。3セクター以上への分散を推奨します。`);
    } else {
        insights.push(`✅ ${sectorGroups.length}セクターに分散投資できています。`);
    }

    // Holdings count
    if (holdings.length < 3) {
        recommendations.push(`銘柄数が${holdings.length}と少なめです。5～10銘柄程度の分散を検討してください。`);
    } else if (holdings.length > 15) {
        recommendations.push(`銘柄数が${holdings.length}と多いです。管理しやすい10銘柄程度に絞ることも有効です。`);
    }

    // PnL analysis
    const losers = holdings.filter(h => (h.pnl || 0) < 0);
    const winners = holdings.filter(h => (h.pnl || 0) > 0);

    if (losers.length > 0) {
        const biggestLoser = losers.reduce((max, h) => (h.pnlPercent || 0) < (max.pnlPercent || 0) ? h : max, losers[0]);
        if ((biggestLoser.pnlPercent || 0) < -20) {
            warnings.push(`📉 ${biggestLoser.name}が${biggestLoser.pnlPercent?.toFixed(1)}%の含み損です。損切りラインの設定を検討してください。`);
        }
    }

    if (winners.length > 0) {
        const biggestWinner = winners.reduce((max, h) => (h.pnlPercent || 0) > (max.pnlPercent || 0) ? h : max, winners[0]);
        if ((biggestWinner.pnlPercent || 0) > 50) {
            insights.push(`🎉 ${biggestWinner.name}が+${biggestWinner.pnlPercent?.toFixed(1)}%の含み益！利確のタイミングを検討してもよいかもしれません。`);
        }
    }

    // General recommendations
    if (recommendations.length === 0) {
        recommendations.push('現在のポートフォリオは良好な状態です。定期的なリバランスを心がけましょう。');
    }

    return { insights, warnings, recommendations };
}
