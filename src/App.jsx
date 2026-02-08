import { useState } from 'react';
import { ThemeProvider } from "@/components/theme-provider"
import Layout from "@/components/layout/Layout"
import Dashboard from "@/pages/Dashboard"
import Holdings from "@/pages/Holdings"
import Comparison from "@/pages/Comparison"

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'holdings':
        return <Holdings />;
      case 'comparison':
        return <Comparison />;
      case 'settings':
        return (
          <div className="p-8 text-center text-muted-foreground">
            <h2 className="text-2xl font-bold mb-4">設定</h2>
            <p>設定ページは準備中です...</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderPage()}
      </Layout>
    </ThemeProvider>
  )
}

export default App
