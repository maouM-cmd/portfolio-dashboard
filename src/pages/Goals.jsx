import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Plus, Trash2, Trophy, TrendingUp } from 'lucide-react';
import { useGoals } from '@/hooks/useGoals';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const GoalForm = ({ onAdd, onCancel }) => {
    const [form, setForm] = useState({
        title: '',
        targetAmount: '',
        currency: 'JPY',
        deadline: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title || !form.targetAmount) {
            toast.error('タイトルと目標金額を入力してください');
            return;
        }
        onAdd({ ...form, targetAmount: parseFloat(form.targetAmount) });
        toast.success('目標を設定しました');
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-muted/30 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">目標タイトル</label>
                    <input type="text" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                        placeholder="例: 老後資金 1000万円" className="w-full mt-1 px-3 py-2 border rounded-md bg-background" />
                </div>
                <div>
                    <label className="text-sm font-medium">目標金額</label>
                    <input type="number" value={form.targetAmount} onChange={(e) => setForm(p => ({ ...p, targetAmount: e.target.value }))}
                        placeholder="10000000" className="w-full mt-1 px-3 py-2 border rounded-md bg-background" step="any" />
                </div>
                <div>
                    <label className="text-sm font-medium">通貨</label>
                    <select value={form.currency} onChange={(e) => setForm(p => ({ ...p, currency: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-background">
                        <option value="JPY">JPY (¥)</option>
                        <option value="USD">USD ($)</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium">目標期日（任意）</label>
                    <input type="date" value={form.deadline} onChange={(e) => setForm(p => ({ ...p, deadline: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-background" />
                </div>
            </div>
            <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={onCancel}>キャンセル</Button>
                <Button type="submit"><Plus className="w-4 h-4 mr-1" /> 設定</Button>
            </div>
        </form>
    );
};

const ProgressBar = ({ current, target, currency }) => {
    const percent = Math.min((current / target) * 100, 100);
    const symbol = currency === 'JPY' ? '¥' : '$';
    const formatVal = (v) => currency === 'JPY' ? `¥${Math.round(v).toLocaleString()}` : `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">現在: {formatVal(current)}</span>
                <span className="font-medium">{percent.toFixed(1)}%</span>
            </div>
            <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-500",
                        percent >= 100 ? "bg-green-500" : percent >= 50 ? "bg-blue-500" : "bg-primary"
                    )}
                    style={{ width: `${percent}%` }}
                />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatVal(0)}</span>
                <span>目標: {formatVal(target)}</span>
            </div>
        </div>
    );
};

const Goals = ({ portfolioValue = 0 }) => {
    const { goals, addGoal, deleteGoal } = useGoals();
    const [isAdding, setIsAdding] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Target className="w-6 h-6" /> 投資目標
                    </h1>
                    <p className="text-muted-foreground">目標を設定して進捗を追跡</p>
                </div>
                <Button onClick={() => setIsAdding(true)}>
                    <Plus className="w-4 h-4 mr-1" /> 目標追加
                </Button>
            </div>

            {isAdding && (
                <Card>
                    <CardHeader><CardTitle>新しい目標</CardTitle></CardHeader>
                    <CardContent>
                        <GoalForm onAdd={(g) => { addGoal(g); setIsAdding(false); }} onCancel={() => setIsAdding(false)} />
                    </CardContent>
                </Card>
            )}

            {goals.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">目標を設定しましょう</h3>
                        <p className="text-muted-foreground mb-6">投資目標を設定して、進捗を可視化しましょう</p>
                        <Button onClick={() => setIsAdding(true)}>
                            <Plus className="w-4 h-4 mr-1" /> 最初の目標を設定
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {goals.map(goal => {
                        const percent = Math.min((portfolioValue / goal.targetAmount) * 100, 100);
                        const isComplete = percent >= 100;

                        return (
                            <Card key={goal.id} className={cn(isComplete && "border-green-500")}>
                                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            {isComplete && <Trophy className="w-5 h-5 text-green-500" />}
                                            {goal.title}
                                        </CardTitle>
                                        {goal.deadline && (
                                            <CardDescription className="mt-1">期日: {goal.deadline}</CardDescription>
                                        )}
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => { deleteGoal(goal.id); toast.success('目標を削除しました'); }}>
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <ProgressBar current={portfolioValue} target={goal.targetAmount} currency={goal.currency} />
                                    {isComplete && (
                                        <p className="text-green-500 font-medium text-sm mt-3 flex items-center gap-1">
                                            <Trophy className="w-4 h-4" /> 目標達成おめでとうございます！🎉
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Goals;
