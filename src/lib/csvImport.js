/**
 * CSV Import utilities for parsing brokerage trade history CSVs
 * Supports common Japanese and international broker formats
 */

/**
 * Parse CSV text into structured data
 */
export function parseCSV(text) {
    const lines = text.trim().split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length < 2) return { headers: [], rows: [], error: '行数が不足しています' };

    // Detect delimiter
    const delimiter = lines[0].includes('\t') ? '\t' : ',';

    const headers = lines[0].split(delimiter).map(h => h.replace(/"/g, '').trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(delimiter).map(v => v.replace(/"/g, '').trim());
        if (values.length === headers.length) {
            const row = {};
            headers.forEach((h, j) => row[h] = values[j]);
            rows.push(row);
        }
    }

    return { headers, rows, error: null };
}

/**
 * Map CSV columns to holding fields
 * Tries to auto-detect column mappings
 */
export function autoDetectColumns(headers) {
    const mapping = {
        symbol: null,
        name: null,
        quantity: null,
        cost: null,
        date: null,
        type: null,
        price: null,
    };

    const symbolPatterns = ['symbol', 'ticker', '銘柄コード', 'コード', 'シンボル'];
    const namePatterns = ['name', '銘柄名', '銘柄', '名称'];
    const quantityPatterns = ['quantity', 'qty', 'shares', '数量', '株数'];
    const costPatterns = ['cost', 'price', 'avg', '取得価格', '取得単価', '平均取得価格', '単価'];
    const datePatterns = ['date', '日付', '約定日', '取引日'];
    const typePatterns = ['type', 'side', '売買', '取引種別', '区分'];

    for (const header of headers) {
        const lower = header.toLowerCase();
        if (!mapping.symbol && symbolPatterns.some(p => lower.includes(p.toLowerCase()))) mapping.symbol = header;
        if (!mapping.name && namePatterns.some(p => lower.includes(p.toLowerCase()))) mapping.name = header;
        if (!mapping.quantity && quantityPatterns.some(p => lower.includes(p.toLowerCase()))) mapping.quantity = header;
        if (!mapping.cost && costPatterns.some(p => lower.includes(p.toLowerCase()))) mapping.cost = header;
        if (!mapping.date && datePatterns.some(p => lower.includes(p.toLowerCase()))) mapping.date = header;
        if (!mapping.type && typePatterns.some(p => lower.includes(p.toLowerCase()))) mapping.type = header;
    }

    return mapping;
}

/**
 * Convert mapped rows into holdings format
 */
export function convertToHoldings(rows, mapping) {
    const holdings = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
            const symbol = mapping.symbol ? row[mapping.symbol] : null;
            const name = mapping.name ? row[mapping.name] : symbol || `銘柄${i + 1}`;
            const quantity = mapping.quantity ? parseFloat(row[mapping.quantity]?.replace(/,/g, '')) : 0;
            const cost = mapping.cost ? parseFloat(row[mapping.cost]?.replace(/,/g, '')) : 0;

            if (!symbol && !name) {
                errors.push(`行${i + 2}: 銘柄が不明です`);
                continue;
            }
            if (isNaN(quantity) || quantity <= 0) {
                errors.push(`行${i + 2}: 数量が無効です`);
                continue;
            }

            holdings.push({
                symbol: symbol || name,
                name: name || symbol,
                quantity,
                cost: isNaN(cost) ? 0 : cost,
                currency: symbol?.includes('.T') ? 'JPY' : 'USD',
            });
        } catch (e) {
            errors.push(`行${i + 2}: パース中にエラーが発生しました`);
        }
    }

    return { holdings, errors };
}

/**
 * Generate sample CSV for download
 */
export function generateSampleCSV() {
    return `銘柄コード,銘柄名,数量,取得単価
3003.T,ヒューリック,100,1250
9532.T,大阪瓦斯,50,3100
HUM,ヒューマナ,10,350
GC=F,ゴールド,5,2000
2558.T,eMAXIS Slim S&P500,200,22500`;
}
