import React from 'react';
import { LayoutDashboard, PieChart, Settings, Menu, X, Bell, Briefcase, BarChart3, Eye, History, Newspaper, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-provider';

const SidebarItem = ({ icon: Icon, label, active, onClick, badge }) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center w-full px-4 py-3 text-sm font-medium transition-colors rounded-lg relative",
            active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
    >
        <Icon className="w-5 h-5 mr-3" />
        {label}
        {badge && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
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
                "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-16 flex items-center px-6 border-b">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        Portfolio<span className="text-primary">.ai</span>
                    </h1>
                    <button
                        className="ml-auto lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
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

                <div className="p-4 border-t">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            U
                        </div>
                        <div className="text-sm">
                            <p className="font-medium">User</p>
                            <p className="text-xs text-muted-foreground">Pro Plan</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-16 border-b flex items-center justify-between px-4 lg:px-8 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 -ml-2 hover:bg-accent rounded-md"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h2 className="text-lg font-semibold">
                            {navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Button variant="ghost" size="icon" className="relative" onClick={() => setActiveTab('alerts')}>
                            <Bell className="w-5 h-5" />
                            {alertCount > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                            )}
                        </Button>
                    </div>
                </header>

                <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
