import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

/**
 * Financial term explanations for beginners
 */
const TERM_EXPLANATIONS = {
    totalValue: {
        title: '総資産価値',
        short: '今持っている株の合計金額',
        detail: '保有している全銘柄の「現在の株価 × 株数」を合計した金額です。株価は常に変動するため、この数字も日々変わります。',
    },
    totalPnl: {
        title: '総損益（そうそんえき）',
        short: '儲かっているか損しているかの合計',
        detail: '買った時の金額と今の金額の差です。プラス（緑）なら利益が出ている、マイナス（赤）なら損をしている状態です。株を売らない限り「含み益」「含み損」と呼ばれ、確定はしていません。',
    },
    totalCost: {
        title: '総取得コスト',
        short: '株を買うのに使った合計金額',
        detail: '全銘柄を購入した時の「購入価格 × 株数」の合計です。この金額と現在の価値を比べることで、投資成績がわかります。',
    },
    pnlPercent: {
        title: '損益率（%）',
        short: '何パーセント増えた（減った）か',
        detail: '投資した金額に対して何%の利益or損失かを示します。例：10万円投資して1万円の利益なら「+10%」です。',
    },
    sector: {
        title: 'セクター',
        short: '業種・業界のグループ分け',
        detail: 'テクノロジー、金融、ヘルスケアなど、会社の事業内容による分類です。1つのセクターに集中投資するとリスクが高くなります。複数のセクターに分散させましょう。',
    },
    rebalance: {
        title: 'リバランス',
        short: '資産配分のバランスを調整すること',
        detail: '例えばテクノロジー株が値上がりして全体の70%になってしまった場合、一部を売って他のセクターを買い増し、理想の配分に戻すことです。',
    },
    dividend: {
        title: '配当（はいとう）',
        short: '会社から株主に支払われるお金',
        detail: '会社が利益の一部を株主に還元するもの。年に1〜4回もらえることが多いです。株を持っているだけでもらえるので「不労所得」とも言えます。',
    },
    unrealizedGain: {
        title: '含み益（ふくみえき）',
        short: 'まだ売っていない利益',
        detail: '株を持ったまま値上がりした分の利益です。まだ売却していないため「含み」と呼ばれます。売却して初めて「確定利益（実現利益）」になります。',
    },
    unrealizedLoss: {
        title: '含み損（ふくみぞん）',
        short: 'まだ売っていない損失',
        detail: '株を持ったまま値下がりした分の損失です。売却しない限りは確定しないので、値上がりを待つこともできます。',
    },
    taxRate: {
        title: '税率 20.315%',
        short: '株の利益にかかる税金の割合',
        detail: '日本では株の利益に約20%の税金がかかります（所得税15.315% + 住民税5%）。特定口座（源泉徴収あり）なら自動で引かれるので確定申告は不要です。',
    },
    allocation: {
        title: '資産配分',
        short: 'お金をどこに分けて置いているか',
        detail: '「卵は1つのカゴに盛るな」という格言の通り、投資先を分散させることでリスクを減らせます。円グラフで自分のお金がどう分かれているか確認しましょう。',
    },
    watchlist: {
        title: 'ウォッチリスト',
        short: '気になる銘柄をメモしておくリスト',
        detail: 'まだ買っていないけど気になる銘柄を登録しておく機能です。株価の変動を見て、買い時だと思ったら購入を検討できます。',
    },
    alert: {
        title: 'アラート',
        short: '株価が条件に達したら通知する機能',
        detail: '例えば「AAPL（Apple）が200ドル以下になったら通知」と設定できます。相場を常に見ていなくても、チャンスを逃しません。',
    },
};

/**
 * Inline help tooltip component - shows a ? icon that reveals explanation on click
 */
export const HelpTip = ({ termKey, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const term = TERM_EXPLANATIONS[termKey];

    if (!term) return null;

    return (
        <span className={`relative inline-flex items-center ${className}`}>
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className="ml-1 p-0.5 rounded-full hover:bg-muted transition-colors"
                aria-label={`${term.title}の説明`}
            >
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute z-50 left-0 top-6 w-72 p-3 bg-card border rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-start justify-between mb-1">
                            <h4 className="font-bold text-sm text-primary">{term.title}</h4>
                            <button onClick={() => setIsOpen(false)} className="p-0.5 hover:bg-muted rounded">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                        <p className="text-sm font-medium mb-1">{term.short}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{term.detail}</p>
                    </div>
                </>
            )}
        </span>
    );
};

/**
 * Welcome Guide component - shown when user has no holdings
 */
export const WelcomeGuide = ({ onAddStock, onImportCSV }) => (
    <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="text-center mb-8">
            <div className="text-6xl mb-4">🚀</div>
            <h1 className="text-3xl font-bold mb-2">Portfolio.ai へようこそ！</h1>
            <p className="text-muted-foreground text-lg">
                あなたの投資を「見える化」して、賢い投資家になりましょう
            </p>
        </div>

        <div className="space-y-4">
            <div className="p-5 border rounded-xl hover:border-primary/50 transition-colors">
                <div className="flex items-start gap-4">
                    <div className="text-2xl">📝</div>
                    <div className="flex-1">
                        <h3 className="font-bold mb-1">ステップ1: 銘柄を追加する</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            持っている株を1つずつ登録できます。株のシンボル（例：AAPL, 7203.T）、購入株数、購入価格を入力するだけ！
                        </p>
                        <button
                            onClick={onAddStock}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition"
                        >
                            銘柄を追加する →
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-5 border rounded-xl hover:border-primary/50 transition-colors">
                <div className="flex items-start gap-4">
                    <div className="text-2xl">📂</div>
                    <div className="flex-1">
                        <h3 className="font-bold mb-1">または: CSVでまとめてインポート</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            証券会社からダウンロードしたCSVファイルがあれば、一括で読み込めます
                        </p>
                        <label className="px-4 py-2 bg-muted text-foreground rounded-md text-sm font-medium cursor-pointer hover:bg-muted/80 transition inline-block">
                            CSVを選択
                            <input type="file" accept=".csv" onChange={onImportCSV} className="hidden" />
                        </label>
                    </div>
                </div>
            </div>

            <div className="p-5 border rounded-xl bg-muted/30">
                <div className="flex items-start gap-4">
                    <div className="text-2xl">💡</div>
                    <div>
                        <h3 className="font-bold mb-1">初心者向けヒント</h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• 📊 ダッシュボードで全体の資産状況がわかります</li>
                            <li>• 🔔 アラートで株価の上下を通知できます</li>
                            <li>• 📈 セクター分析でリスクの偏りをチェック</li>
                            <li>• 🎯 目標設定で投資のゴールを管理</li>
                            <li>• 各数値の横にある <HelpCircle className="w-3 h-3 inline" /> をクリックすると用語解説が見れます</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default TERM_EXPLANATIONS;
