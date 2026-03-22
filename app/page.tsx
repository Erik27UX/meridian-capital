'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ArrowLeft } from 'lucide-react';
import { Stock, Investment } from '@/types';
import SearchBar from '@/components/SearchBar';
import RecommendedStocks from '@/components/RecommendedStocks';
import PortfolioTracker from '@/components/PortfolioTracker';
import InvestmentCalculator from '@/components/InvestmentCalculator';
import StockChart from '@/components/StockChart';
import NewsPanel from '@/components/NewsPanel';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useStockPrice } from '@/hooks/useStockPrice';

function StockDetail({ ticker, onBack }: { ticker: string; onBack: () => void }) {
  const { quote } = useStockPrice(ticker);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-silver hover:text-[var(--sp-blue)] transition-colors mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="flex items-center gap-4">
        <span className="font-mono-num text-2xl font-bold text-[var(--sp-blue)]">{ticker}</span>
        {quote && (
          <>
            <span className="font-mono-num text-3xl font-bold">${quote.price.toFixed(2)}</span>
            <span className={`font-mono-num text-lg ${quote.changePercent >= 0 ? 'text-gain' : 'text-loss'}`}>
              {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%)
            </span>
            <span className="flex items-center gap-1 text-xs text-silver">
              <span className="w-2 h-2 rounded-full bg-[var(--sp-green)] animate-pulse-live" />
              Live
            </span>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <StockChart ticker={ticker} />
        <NewsPanel ticker={ticker} />
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [calcStock, setCalcStock] = useState<Stock | null>(null);
  const { addInvestment } = usePortfolio();

  function goHome() {
    setSelectedTicker(null);
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={goHome} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Activity className="w-7 h-7 text-[var(--sp-blue)]" />
          <h1 className="text-2xl font-bold tracking-tight">StockPulse</h1>
        </button>
      </div>

      <div className="mb-10">
        <SearchBar
          onSelectStock={setSelectedTicker}
          onCalculate={setCalcStock}
        />
      </div>

      <AnimatePresence mode="wait">
        {selectedTicker ? (
          <div key="detail" className="mb-10">
            <StockDetail ticker={selectedTicker} onBack={goHome} />
          </div>
        ) : (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-10">
              <RecommendedStocks onCalculate={setCalcStock} onSelect={setSelectedTicker} />
            </div>

            <div className="mb-10">
              <PortfolioTracker />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="text-center py-6 border-t border-white/5">
        <p className="text-xs text-[var(--sp-muted)]">
          Not financial advice. For informational purposes only. Past performance does not guarantee future results.
        </p>
      </footer>

      <AnimatePresence>
        {calcStock && (
          <InvestmentCalculator
            stock={calcStock}
            onClose={() => setCalcStock(null)}
            onTrack={(inv: Investment) => {
              addInvestment(inv);
              setCalcStock(null);
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
