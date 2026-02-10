/**
 * Backup and Restore utilities for portfolio data
 */

const STORAGE_KEYS = [
    'portfolio_holdings',
    'portfolio_alerts',
    'portfolio_watchlist',
    'portfolio_transactions',
    'portfolio_dividends',
    'portfolio_goals',
    'target_allocation',
    'portfolio_lang',
];

/**
 * Export all portfolio data as a JSON file
 */
export function exportBackup() {
    const backup = {};
    for (const key of STORAGE_KEYS) {
        const value = localStorage.getItem(key);
        if (value) {
            try {
                backup[key] = JSON.parse(value);
            } catch {
                backup[key] = value;
            }
        }
    }

    backup._meta = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        itemCount: Object.keys(backup).length - 1,
    };

    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
}

/**
 * Import portfolio data from a JSON backup file
 */
export function importBackup(jsonText) {
    try {
        const data = JSON.parse(jsonText);

        if (!data._meta) {
            return { success: false, error: 'バックアップファイルの形式が正しくありません' };
        }

        let restored = 0;
        for (const key of STORAGE_KEYS) {
            if (data[key] !== undefined) {
                localStorage.setItem(key, typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]));
                restored++;
            }
        }

        return {
            success: true,
            restored,
            exportedAt: data._meta.exportedAt,
        };
    } catch (e) {
        return { success: false, error: 'JSONの解析に失敗しました' };
    }
}
