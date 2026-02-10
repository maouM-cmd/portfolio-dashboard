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
import SectorAnalysis from "@/pages/SectorAnalysis"
import TaxCalculator from "@/pages/TaxCalculator"
import { useAlerts } from '@/hooks/useAlerts';
import { useHoldings } from '@/hooks/useHoldings';
import { TermList } from '@/components/Tooltip';
import { WelcomeGuide } from '@/components/HelpTooltip';
import { fetchMultipleQuotes, calculatePortfolioSummary } from '@/lib/stockApi';
import { fetchUsdJpyRate } from '@/lib/currency';
import { parseCSV, autoDetectColumns, convertToHoldings, generateSampleCSV } from '@/lib/csvImport';
import { exportBackup, importBackup } from '@/lib/backup';
import { getLanguage, toggleLanguage } from '@/lib/i18n';
import toast from 'react-hot-toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { showOnboarding, completeOnboarding, resetOnboarding } = useOnboarding();
  const { alerts } = useAlerts();
  const { holdings, addHolding } = useHoldings();
  const [portfolioValueJPY, setPortfolioValueJPY] = useState(0);
  const [lang, setLang] = useState(getLanguage());

  const activeAlertCount = alerts.filter(a => !a.triggered).length;

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

  // Browser notification handler
  const enableNotifications = async () => {
    if (!('Notification' in window)) {
      toast.error('このブラウザは通知に対応していません');
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      toast.success('通知が有効になりました！');
      new Notification('Portfolio.ai', { body: '通知テスト成功！アラートが発動すると通知されます。' });
    } else {
      toast.error('通知が拒否されました');
    }
  };

  // CSV import handler
  const handleCSVImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const { headers, rows, error } = parseCSV(event.target.result);
        if (error) { toast.error(error); return; }

        const mapping = autoDetectColumns(headers);
        const { holdings: imported, errors } = convertToHoldings(rows, mapping);

        if (errors.length > 0) {
          toast.error(`${errors.length}件のエラー: ${errors[0]}`);
        }

        let count = 0;
        for (const h of imported) {
          addHolding(h);
          count++;
        }
        toast.success(`${count}件の銘柄をインポートしました`);
      } catch (err) {
        toast.error('CSVの読み込みに失敗しました');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Download sample CSV
  const downloadSampleCSV = () => {
    const csv = generateSampleCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_holdings.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleLang = () => {
    const next = toggleLanguage();
    setLang(next);
    toast.success(next === 'en' ? 'Switched to English' : '日本語に切り替えました');
    window.location.reload();
  };

  // Backup handlers
  const handleBackup = () => {
    exportBackup();
    toast.success('バックアップをダウンロードしました');
  };

  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = importBackup(event.target.result);
      if (result.success) {
        toast.success(`${result.restored}項目を復元しました。リロードします...`);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error(result.error);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const renderPage = () => {
    // Show welcome guide if no holdings on dashboard
    if (activeTab === 'dashboard' && holdings.length === 0) {
      return (
        <WelcomeGuide
          onAddStock={() => setActiveTab('holdings')}
          onImportCSV={handleCSVImport}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'holdings': return <Holdings />;
      case 'alerts': return <Alerts />;
      case 'watchlist': return <Watchlist />;
      case 'transactions': return <Transactions />;
      case 'dividends': return <Dividends />;
      case 'goals': return <Goals portfolioValue={portfolioValueJPY} />;
      case 'sectors': return <SectorAnalysis />;
      case 'tax': return <TaxCalculator />;
      case 'news': return <News />;
      case 'comparison': return <Comparison />;
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">設定</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 border rounded-lg">
                <h3 className="font-medium mb-4">📚 オンボーディング</h3>
                <p className="text-sm text-muted-foreground mb-3">初回チュートリアルをもう一度見る</p>
                <button onClick={resetOnboarding} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                  チュートリアルを再表示
                </button>
              </div>
              <div className="p-6 border rounded-lg">
                <h3 className="font-medium mb-4">🌐 言語 / Language</h3>
                <p className="text-sm text-muted-foreground mb-3">表示言語を切り替え</p>
                <button
                  onClick={handleToggleLang}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
                >
                  {lang === 'ja' ? 'Switch to English' : '日本語に切替'}
                </button>
              </div>
              <div className="p-6 border rounded-lg">
                <h3 className="font-medium mb-4">🔔 ブラウザ通知</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  株価アラートが発動した際にブラウザ通知でお知らせ
                </p>
                <button onClick={enableNotifications} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                  通知を有効にする
                </button>
              </div>
              <div className="p-6 border rounded-lg">
                <h3 className="font-medium mb-4">📂 CSVインポート</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  証券会社のCSVから保有銘柄を一括取り込み
                </p>
                <div className="flex gap-2">
                  <label className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm cursor-pointer">
                    CSVを選択
                    <input type="file" accept=".csv,.tsv,.txt" onChange={handleCSVImport} className="hidden" />
                  </label>
                  <button onClick={downloadSampleCSV} className="px-4 py-2 border rounded-md text-sm hover:bg-muted">
                    サンプル
                  </button>
                </div>
              </div>
              <div className="p-6 border rounded-lg">
                <h3 className="font-medium mb-4">💾 バックアップ / 復元</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  全データをJSONファイルに書き出し、または復元
                </p>
                <div className="flex gap-2">
                  <button onClick={handleBackup} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                    バックアップ
                  </button>
                  <label className="px-4 py-2 border rounded-md text-sm cursor-pointer hover:bg-muted">
                    復元
                    <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
                  </label>
                </div>
              </div>
              <div className="p-6 border rounded-lg">
                <h3 className="font-medium mb-4">📖 用語集</h3>
                <p className="text-sm text-muted-foreground mb-3">投資でよく使う用語の解説</p>
                <TermList />
              </div>
            </div>
          </div>
        );
      default: return <Dashboard />;
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
