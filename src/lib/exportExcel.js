import * as XLSX from 'xlsx';

/**
 * Export portfolio data to Excel file
 * @param {object} portfolioSummary - Portfolio summary from calculatePortfolioSummary
 * @param {string} filename - Output filename
 */
export function exportToExcel(portfolioSummary, filename = 'ポートフォリオレポート.xlsx') {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Holdings Summary
    const holdingsData = portfolioSummary.holdings.map(h => ({
        '銘柄': h.name,
        'シンボル': h.symbol,
        '保有数量': h.quantity,
        '取得価格': h.purchasePrice,
        '現在価格': h.currentPrice?.toFixed(2) || 'N/A',
        '取得コスト': h.costBasis?.toFixed(2) || 'N/A',
        '現在価値': h.currentValue?.toFixed(2) || 'N/A',
        '損益': h.pnl?.toFixed(2) || 'N/A',
        '損益率(%)': h.pnlPercent?.toFixed(2) || 'N/A',
        '日次変動(%)': h.dayChangePercent?.toFixed(2) || 'N/A',
        '通貨': h.currency || 'USD',
    }));

    const holdingsSheet = XLSX.utils.json_to_sheet(holdingsData);
    XLSX.utils.book_append_sheet(workbook, holdingsSheet, '保有銘柄');

    // Sheet 2: Portfolio Summary
    const summaryData = [
        { '項目': '総資産価値', '金額': portfolioSummary.totalValue?.toFixed(2) || 'N/A' },
        { '項目': '総取得コスト', '金額': portfolioSummary.totalCost?.toFixed(2) || 'N/A' },
        { '項目': '総損益', '金額': portfolioSummary.totalPnl?.toFixed(2) || 'N/A' },
        { '項目': '総損益率(%)', '金額': portfolioSummary.totalPnlPercent?.toFixed(2) || 'N/A' },
        { '項目': '作成日時', '金額': new Date().toLocaleString('ja-JP') },
    ];

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'サマリー');

    // Sheet 3: Allocation
    const allocationData = portfolioSummary.holdings.map(h => ({
        '銘柄': h.name,
        '現在価値': h.currentValue?.toFixed(2) || 0,
        '配分比率(%)': ((h.currentValue / portfolioSummary.totalValue) * 100).toFixed(2),
    }));

    const allocationSheet = XLSX.utils.json_to_sheet(allocationData);
    XLSX.utils.book_append_sheet(workbook, allocationSheet, '資産配分');

    // Download the file
    XLSX.writeFile(workbook, filename);
}
