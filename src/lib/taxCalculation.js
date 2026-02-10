/**
 * Tax calculation utilities for Japanese stock investments
 * Based on Japanese tax rules for 特定口座 (specific account) and 一般口座 (general account)
 */

const TAX_RATE_JAPAN = 0.20315; // 20.315% (所得税15.315% + 住民税5%)

/**
 * Calculate capital gains tax for realized transactions
 */
export function calculateCapitalGainsTax(transactions) {
    const realized = transactions.filter(t => t.type === 'sell');

    let totalGain = 0;
    let totalLoss = 0;
    const details = [];

    for (const tx of realized) {
        const gain = (tx.price - (tx.costBasis || tx.price)) * tx.quantity;
        if (gain >= 0) {
            totalGain += gain;
        } else {
            totalLoss += Math.abs(gain);
        }
        details.push({
            ...tx,
            gain,
            isGain: gain >= 0,
        });
    }

    const netGain = totalGain - totalLoss;
    const taxAmount = netGain > 0 ? netGain * TAX_RATE_JAPAN : 0;
    const lossCarryover = netGain < 0 ? Math.abs(netGain) : 0;

    return {
        totalGain,
        totalLoss,
        netGain,
        taxRate: TAX_RATE_JAPAN,
        taxAmount,
        lossCarryover,
        details,
    };
}

/**
 * Calculate unrealized gains/losses
 */
export function calculateUnrealizedGains(holdings) {
    let totalUnrealizedGain = 0;
    let totalUnrealizedLoss = 0;
    const details = [];

    for (const h of holdings) {
        const gain = (h.currentValue || 0) - (h.cost * h.quantity);
        if (gain >= 0) {
            totalUnrealizedGain += gain;
        } else {
            totalUnrealizedLoss += Math.abs(gain);
        }
        details.push({
            symbol: h.symbol,
            name: h.name,
            gain,
            gainPercent: h.pnlPercent || 0,
            potentialTax: gain > 0 ? gain * TAX_RATE_JAPAN : 0,
        });
    }

    return {
        totalUnrealizedGain,
        totalUnrealizedLoss,
        netUnrealized: totalUnrealizedGain - totalUnrealizedLoss,
        potentialTax: totalUnrealizedGain * TAX_RATE_JAPAN,
        details: details.sort((a, b) => b.gain - a.gain),
    };
}

/**
 * Generate annual tax summary
 */
export function generateTaxSummary(transactions, holdings, year) {
    const yearTx = transactions.filter(t => t.date?.startsWith(year?.toString()));
    const realized = calculateCapitalGainsTax(yearTx);
    const unrealized = calculateUnrealizedGains(holdings);

    return {
        year: year || new Date().getFullYear(),
        realized,
        unrealized,
        totalTaxLiability: realized.taxAmount,
        effectiveTaxRate: realized.netGain > 0 ? TAX_RATE_JAPAN * 100 : 0,
    };
}
