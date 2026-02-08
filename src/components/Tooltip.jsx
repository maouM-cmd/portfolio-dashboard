import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

// Term definitions
const TERMS = {
    '総資産価値': '現在保有しているすべての銘柄の合計金額です。株価×保有数量の合計で計算されます。',
    '損益': '利益または損失のことです。(現在価値 - 取得コスト)で計算されます。プラスなら利益、マイナスなら損失です。',
    '取得コスト': '銘柄を購入した時の金額の合計です。購入価格×購入数量で計算されます。',
    'P&L': 'Profit and Loss（損益）の略です。投資でどれだけ儲かったか・損したかを表します。',
    '配分比率': 'ポートフォリオ全体に対する各銘柄の割合です。分散投資のバランスを確認できます。',
    'シンボル': '銘柄を識別するコードです。例：AAPL（Apple）、9532.T（大阪瓦斯）',
};

export const Tooltip = ({ term, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const definition = TERMS[term];

    if (!definition) return children;

    return (
        <span className="relative inline-flex items-center gap-1">
            {children}
            <button
                className="text-muted-foreground hover:text-foreground transition-colors"
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                onClick={() => setIsOpen(!isOpen)}
            >
                <HelpCircle className="w-3 h-3" />
            </button>
            {isOpen && (
                <div className="absolute left-0 bottom-full mb-2 z-50 w-64 p-3 bg-popover text-popover-foreground border rounded-lg shadow-lg text-sm">
                    <p className="font-medium mb-1">{term}</p>
                    <p className="text-muted-foreground">{definition}</p>
                </div>
            )}
        </span>
    );
};

export const TermList = () => (
    <div className="space-y-4">
        <h3 className="font-medium text-lg">用語集</h3>
        {Object.entries(TERMS).map(([term, definition]) => (
            <div key={term} className="p-3 border rounded-lg">
                <p className="font-medium">{term}</p>
                <p className="text-sm text-muted-foreground">{definition}</p>
            </div>
        ))}
    </div>
);
