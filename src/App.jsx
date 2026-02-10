import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/components/theme-provider"
import { ToastProvider } from "@/components/ui/toast"
import { Onboarding, useOnboarding } from "@/components/Onboarding"
import Layout from "@/components/layout/Layout"
import Dashboard from "@/pages/Dashboard"
import Holdings from "@/pages/Holdings"
import Comparison from "@/pages/Comparison"
import Alerts from "@/pages/Alerts"
import Watchlist from "@/pages/Watchlist"
import Transactions from "@/pages/Transactions"
import News from "@/pages/News"
import Dividends from "@/pages/Dividends"
import Goals from "@/pages/Goals"
import { useAlerts } from '@/hooks/useAlerts';
import { useHoldings } from '@/hooks/useHoldings';
import { TermList } from '@/components/Tooltip';
import { fetchMultipleQuotes, calculatePortfolioSummary } from '@/lib/stockApi';
import { fetchUsdJpyRate, convertCurrency } from '@/lib/currency';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { showOnboarding, completeOnboarding, resetOnboarding } = useOnboarding();
  const { alerts } = useAlerts();
  const { holdings } = useHoldings();
  const [portfolioValueJPY, setPortfolioValueJPY] = useState(0);

  const activeAlertCount = alerts.filter(a => !a.triggered).length;

  // Calculate total portfolio value for Goals page
  useEffect(() => {
    const calcValue = async () => {
      if (holdings.length === 0) return;
      try {
        const symbols = holdings.map(h => h.symbol);
        const quotes = await fetchMultipleQuotes(symbols);
        const summary = calculatePortfolioSummary(holdings, quotes);
        const rate = await fetchUsdJpyRate();
        const total = summary.holdings.reduce((sum, h) => {
          const val = h.currentValue || 0;
          return sum + (h.currency === 'USD' ? val * rate : val);
        }, 0);
        setPortfolioValueJPY(total);
      } catch (e) { console.error(e); }
    };
    calcValue();
  }, [holdings]);

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'holdings':
        return <Holdings />;
      case 'alerts':
        return <Alerts />;
      case 'watchlist':
        return <Watchlist />;
      case 'transactions':
        return <Transactions />;
      case 'dividends':
        return <Dividends />;
      case 'goals':
        return <Goals portfolioValue={portfolioValueJPY} />;
      case 'news':
        return <News />;
      case 'comparison':
        return <Comparison />;
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">設定</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 border rounded-lg">
                <h3 className="font-medium mb-4">オンボーディング</h3>
                <button
                  onClick={resetOnboarding}
                  className="text-primary hover:underline"
                >
                  チュートリアルを再表示
                </button>
              </div>
              <div className="p-6 border rounded-lg">
                <TermList />
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      {showOnboarding && <Onboarding onComplete={completeOnboarding} />}
      <Layout activeTab={activeTab} setActiveTab={setActiveTab} alertCount={activeAlertCount}>
        {renderPage()}
      </Layout>
      <ToastProvider />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
