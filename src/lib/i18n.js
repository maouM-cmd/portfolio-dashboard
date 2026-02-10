/**
 * Internationalization (i18n) support
 */

const translations = {
    ja: {
        // Navigation
        'nav.dashboard': 'ダッシュボード',
        'nav.holdings': '保有銘柄',
        'nav.alerts': 'アラート',
        'nav.watchlist': 'ウォッチリスト',
        'nav.transactions': '取引履歴',
        'nav.dividends': '配当カレンダー',
        'nav.goals': '投資目標',
        'nav.news': 'ニュース',
        'nav.comparison': '比較分析',
        'nav.sectors': 'セクター分析',
        'nav.tax': '税金計算',
        'nav.settings': '設定',

        // Dashboard
        'dashboard.title': 'ポートフォリオダッシュボード',
        'dashboard.totalValue': '総資産価値',
        'dashboard.totalPnl': '総損益',
        'dashboard.totalCost': '総取得コスト',
        'dashboard.holdingsCount': '保有銘柄数',
        'dashboard.lastUpdated': '最終更新',
        'dashboard.refresh': '更新',
        'dashboard.portfolioChart': 'ポートフォリオ推移',
        'dashboard.allocation': '資産配分',
        'dashboard.holdingsDetail': '保有銘柄明細',
        'dashboard.shares': '株',

        // Sectors
        'sectors.title': 'セクター分析',
        'sectors.distribution': 'セクター別配分',
        'sectors.rebalance': 'リバランス提案',
        'sectors.aiAnalysis': 'AI分析',

        // Tax
        'tax.title': '税金計算',
        'tax.realized': '実現損益',
        'tax.unrealized': '含み損益',
        'tax.taxAmount': '推定税額',
        'tax.taxRate': '税率',

        // Common
        'common.add': '追加',
        'common.edit': '編集',
        'common.delete': '削除',
        'common.save': '保存',
        'common.cancel': 'キャンセル',
        'common.search': '検索',
        'common.loading': '読み込み中...',
        'common.noData': 'データがありません',
        'common.currency': '通貨',
        'common.language': '言語',
    },
    en: {
        // Navigation
        'nav.dashboard': 'Dashboard',
        'nav.holdings': 'Holdings',
        'nav.alerts': 'Alerts',
        'nav.watchlist': 'Watchlist',
        'nav.transactions': 'Transactions',
        'nav.dividends': 'Dividends',
        'nav.goals': 'Goals',
        'nav.news': 'News',
        'nav.comparison': 'Comparison',
        'nav.sectors': 'Sector Analysis',
        'nav.tax': 'Tax Calculator',
        'nav.settings': 'Settings',

        // Dashboard
        'dashboard.title': 'Portfolio Dashboard',
        'dashboard.totalValue': 'Total Value',
        'dashboard.totalPnl': 'Total P&L',
        'dashboard.totalCost': 'Total Cost',
        'dashboard.holdingsCount': 'Holdings',
        'dashboard.lastUpdated': 'Last Updated',
        'dashboard.refresh': 'Refresh',
        'dashboard.portfolioChart': 'Portfolio Performance',
        'dashboard.allocation': 'Asset Allocation',
        'dashboard.holdingsDetail': 'Holdings Detail',
        'dashboard.shares': 'shares',

        // Sectors
        'sectors.title': 'Sector Analysis',
        'sectors.distribution': 'Sector Distribution',
        'sectors.rebalance': 'Rebalance Suggestions',
        'sectors.aiAnalysis': 'AI Analysis',

        // Tax
        'tax.title': 'Tax Calculator',
        'tax.realized': 'Realized Gains',
        'tax.unrealized': 'Unrealized Gains',
        'tax.taxAmount': 'Estimated Tax',
        'tax.taxRate': 'Tax Rate',

        // Common
        'common.add': 'Add',
        'common.edit': 'Edit',
        'common.delete': 'Delete',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.search': 'Search',
        'common.loading': 'Loading...',
        'common.noData': 'No data',
        'common.currency': 'Currency',
        'common.language': 'Language',
    },
};

const LANG_KEY = 'portfolio_lang';

export function getLanguage() {
    return localStorage.getItem(LANG_KEY) || 'ja';
}

export function setLanguage(lang) {
    localStorage.setItem(LANG_KEY, lang);
}

export function t(key) {
    const lang = getLanguage();
    return translations[lang]?.[key] || translations['ja']?.[key] || key;
}

export function toggleLanguage() {
    const current = getLanguage();
    const next = current === 'ja' ? 'en' : 'ja';
    setLanguage(next);
    return next;
}
