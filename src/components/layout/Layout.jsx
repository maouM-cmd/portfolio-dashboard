import React from 'react';
import { LayoutDashboard, PieChart, Settings, Menu, X, Bell, Briefcase, BarChart3, Eye, History, Newspaper, Calculator, Calendar, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-provider';

const SidebarItem = ({ icon: Icon, label, active, onClick, badge }) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg relative group transition-all duration-200",
            active
                ? "sidebar-item-active"
                : "text-muted-foreground sidebar-item-hover"
        )}
    >
        <Icon className={cn("w-4.5 h-4.5 mr-3 transition-colors", active && "text-[hsl(263,80%,72%)]")} />
        <span className="truncate">{label}</span>
        {badge && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-destructive text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center dot-pulse">
                {badge}
            </span>
        )}
    </button>
);

const Layout = ({ children, activeTab, setActiveTab, alertCount = 0 }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'ダッシュボード' },
        { id: 'holdings', icon: Briefcase, label: '保有銘柄' },
        { id: 'alerts', icon: Bell, label: 'アラート', badge: alertCount > 0 ? alertCount : null },
        { id: 'watchlist', icon: Eye, label: 'ウォッチリスト' },
        { id: 'transactions', icon: History, label: '取引履歴' },
        { id: 'dividends', icon: Calendar, label: '配当カレンダー' },
        { id: 'goals', icon: Target, label: '投資目標' },
        { id: 'sectors', icon: PieChart, label: 'セクター分析' },
        { id: 'tax', icon: Calculator, label: '税金計算' },
        { id: 'news', icon: Newspaper, label: 'ニュース' },
        { id: 'comparison', icon: BarChart3, label: '比較分析' },
        { id: 'settings', icon: Settings, label: '設定' },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed lg:static inset-y-0 left-0 z-50 w-64 border-r border-border/50 transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col",
                "bg-card/50 backdrop-blur-xl",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-border/50">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(263,70%,58%)] to-[hsl(210,100%,65%)] flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-lg font-bold">
                            <span className="gradient-text-brand">Portfolio</span>
                            <span className="text-muted-foreground">.ai</span>
                        </h1>
                    </div>
                    <button
                        className="ml-auto lg:hidden p-1 hover:bg-accent rounded-md"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav Items */}
                <div className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2">メイン</p>
                    {navItems.slice(0, 3).map((item) => (
                        <SidebarItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            active={activeTab === item.id}
                            badge={item.badge}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsMobileMenuOpen(false);
                            }}
                        />
                    ))}

                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2 mt-3">トラッキング</p>
                    {navItems.slice(3, 7).map((item) => (
                        <SidebarItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            active={activeTab === item.id}
                            badge={item.badge}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsMobileMenuOpen(false);
                            }}
                        />
                    ))}

                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2 mt-3">分析</p>
                    {navItems.slice(7, 11).map((item) => (
                        <SidebarItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            active={activeTab === item.id}
                            badge={item.badge}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsMobileMenuOpen(false);
                            }}
                        />
                    ))}

                    <div className="pt-2 mt-2 border-t border-border/50">
                        {navItems.slice(11).map((item) => (
                            <SidebarItem
                                key={item.id}
                                icon={item.icon}
                                label={item.label}
                                active={activeTab === item.id}
                                badge={item.badge}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setIsMobileMenuOpen(false);
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* User Area */}
                <div className="p-4 border-t border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(263,70%,58%)] to-[hsl(280,80%,50%)] flex items-center justify-center text-white text-sm font-bold">
                            P
                        </div>
                        <div className="text-sm">
                            <p className="font-medium">Portfolio</p>
                            <p className="text-xs text-muted-foreground">プロプラン</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-14 border-b border-border/50 flex items-center justify-between px-4 lg:px-8 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 -ml-2 hover:bg-accent rounded-md"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h2 className="text-base font-semibold">
                            {navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Button variant="ghost" size="icon" className="relative hover:bg-accent" onClick={() => setActiveTab('alerts')}>
                            <Bell className="w-4.5 h-4.5" />
                            {alertCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full dot-pulse" />
                            )}
                        </Button>
                    </div>
                </header>

                <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
