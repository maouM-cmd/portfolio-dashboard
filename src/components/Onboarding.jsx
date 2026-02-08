import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft, Wallet, Bell, Eye, History, BarChart3, FileSpreadsheet } from 'lucide-react';

const ONBOARDING_KEY = 'portfolio_onboarding_complete';

const steps = [
    {
        icon: Wallet,
        title: 'ようこそ！',
        description: 'ポートフォリオダッシュボードへようこそ！\nあなたの投資を一目で管理できます。',
    },
    {
        icon: BarChart3,
        title: 'ダッシュボード',
        description: '総資産価値、損益、資産配分をリアルタイムで確認できます。\n5分ごとに自動更新されます。',
    },
    {
        icon: Bell,
        title: '株価アラート',
        description: '目標価格を設定すると、到達時に通知します。\n買い時・売り時を逃しません。',
    },
    {
        icon: Eye,
        title: 'ウォッチリスト',
        description: '気になる銘柄を追加して監視できます。\n購入検討中の銘柄を整理しましょう。',
    },
    {
        icon: History,
        title: '取引履歴',
        description: 'すべての売買・配当を記録できます。\n投資の振り返りに役立ちます。',
    },
    {
        icon: FileSpreadsheet,
        title: 'エクスポート',
        description: 'Excel・PDFでレポートを出力できます。\n確定申告や記録保存に便利です。',
    },
];

export const Onboarding = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const currentStep = steps[step];
    const Icon = currentStep.icon;

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-4"
                        onClick={onComplete}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-center">{currentStep.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground whitespace-pre-line mb-6">
                        {currentStep.description}
                    </p>

                    {/* Progress dots */}
                    <div className="flex justify-center gap-2 mb-6">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-muted'
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setStep(s => s - 1)}
                            disabled={step === 0}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            戻る
                        </Button>
                        {step < steps.length - 1 ? (
                            <Button
                                className="flex-1"
                                onClick={() => setStep(s => s + 1)}
                            >
                                次へ
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        ) : (
                            <Button
                                className="flex-1"
                                onClick={onComplete}
                            >
                                始める！
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export function useOnboarding() {
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        const completed = localStorage.getItem(ONBOARDING_KEY);
        if (!completed) {
            setShowOnboarding(true);
        }
    }, []);

    const completeOnboarding = () => {
        localStorage.setItem(ONBOARDING_KEY, 'true');
        setShowOnboarding(false);
    };

    const resetOnboarding = () => {
        localStorage.removeItem(ONBOARDING_KEY);
        setShowOnboarding(true);
    };

    return {
        showOnboarding,
        completeOnboarding,
        resetOnboarding,
    };
}
