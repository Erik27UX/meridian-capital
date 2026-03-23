'use client';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ArrowLeft, Calculator, Briefcase, CheckCircle, Star } from 'lucide-react';
import useSWR from 'swr';
import { Timeframe } from '@/types';
import { Stock, Investment } from '@/types';
import SearchBar from '@/components/SearchBar';
import RecommendedStocks from '@/components/RecommendedStocks';
import FavouriteStocks from '@/components/FavouriteStocks';
import AIMarketFeed from '@/components/AIMarketFeed';
import PortfolioTracker from '@/components/PortfolioTracker';
import InvestmentCalculator from '@/components/InvestmentCalculator';
import StockChart from '@/components/StockChart';
import NewsPanel from '@/components/NewsPanel';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useStockPrice } from '@/hooks/useStockPrice';
import { useFavourites } from '@/contexts/FavouritesContext';

const DETAIL_TIMEFRAMES: Timeframe[] = ['1D', '1W', '1M', '3M', 'YTD', '1Y'];
const fetcher = (url: string) => fetch(url).then(r => r.json());

function StockDetail({ ticker, onBack, onCalculate }: { ticker: string; onBack: () => void; onCalculate: (stock: Stock) => void }) {
  const { quote } = useStockPrice(ticker);
  const { data: fullStock } = useSWR(`/api/stocks?ticker=${ticker}&full=true`, fetcher, { refreshInterval: 60000 });
  const { isFavourite, addFavourite, removeFavourite } = useFavourites();
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const fav = isFavourite(ticker);

  const periodChange: number = fullStock?.changesByPeriod?.[timeframe] ?? quote?.changePercent ?? 0;
  const periodDollar: number = quote ? (quote.price * periodChange / 100) : 0;

  function handleCalculate() {
    if (!quote) return;
    onCalculate({
      ticker: quote.ticker,
      name: fullStock?.name ?? quote.ticker,
      price: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
      volume: quote.volume,
      marketCap: fullStock?.marketCap ?? 0,
    });
  }

  function handleFavourite() {
    if (fav) removeFavourite(ticker);
    else addFavourite(ticker, fullStock?.name ?? quote?.ticker ?? ticker);
  }

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

      <div className="flex items-center gap-4 flex-wrap">
        <span className="font-mono-num text-2xl font-bold text-[var(--sp-blue)]">{ticker}</span>
        {quote && (
          <>
            <span className="font-mono-num text-3xl font-bold">${quote.price.toFixed(2)}</span>
            <span className={`font-mono-num text-lg ${periodChange >= 0 ? 'text-gain' : 'text-loss'}`}>
              {periodDollar >= 0 ? '+' : ''}{periodDollar.toFixed(2)} ({periodChange >= 0 ? '+' : ''}{periodChange.toFixed(2)}%)
            </span>
            <span className="flex items-center gap-1 text-xs text-silver">
              <span className="w-2 h-2 rounded-full bg-[var(--sp-green)] animate-pulse-live" />
              Live
            </span>
          </>
        )}
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {/* Timeframe selector */}
          <div className="flex items-center gap-1 bg-[var(--sp-card)] border border-white/10 rounded-lg p-1">
            {DETAIL_TIMEFRAMES.map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  timeframe === tf ? 'bg-[var(--sp-blue)] text-white' : 'text-silver hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
          <button
            onClick={handleFavourite}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              fav
                ? 'bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20'
                : 'bg-white/5 text-[var(--sp-muted)] hover:text-yellow-400 hover:bg-yellow-400/10'
            }`}
          >
            <Star className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
            {fav ? 'Favourited' : 'Favourite'}
          </button>
          <button
            onClick={handleCalculate}
            disabled={!quote}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--sp-blue)]/10 text-[var(--sp-blue)] text-sm font-semibold hover:bg-[var(--sp-blue)]/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Calculator className="w-4 h-4" />
            Calculate Returns
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <StockChart ticker={ticker} />
        <NewsPanel ticker={ticker} />
      </div>
    </motion.div>
  );
}

function Toast({ ticker }: { ticker: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl bg-[var(--sp-card)] border border-[var(--sp-green)]/30 shadow-xl shadow-black/40"
    >
      <CheckCircle className="w-5 h-5 text-[var(--sp-green)] shrink-0" />
      <div>
        <span className="font-semibold text-sm">{ticker}</span>
        <span className="text-sm text-silver"> added to My Investments</span>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [calcStock, setCalcStock] = useState<Stock | null>(null);
  const [toastTicker, setToastTicker] = useState<string | null>(null);
  const [scrollToPortfolio, setScrollToPortfolio] = useState(false);
  const portfolioRef = useRef<HTMLDivElement>(null);
  const { addInvestment, investments } = usePortfolio();

  function goHome() {
    setSelectedTicker(null);
  }

  function handleMyInvestments() {
    if (selectedTicker) {
      setSelectedTicker(null);
      setScrollToPortfolio(true);
    } else {
      portfolioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  useEffect(() => {
    if (!selectedTicker && scrollToPortfolio) {
      setScrollToPortfolio(false);
      setTimeout(() => {
        portfolioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedTicker, scrollToPortfolio]);

  function handleTrack(inv: Investment) {
    addInvestment(inv);
    setCalcStock(null);
    setToastTicker(inv.ticker);
    setTimeout(() => setToastTicker(null), 3000);
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between gap-3 mb-8">
        <button onClick={goHome} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Activity className="w-7 h-7 text-[var(--sp-blue)]" />
          <h1 className="text-2xl font-bold tracking-tight">StockPulse</h1>
        </button>
        <button
          onClick={handleMyInvestments}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-silver hover:text-white hover:bg-white/10 transition-all"
        >
          <Briefcase className="w-4 h-4" />
          My Investments
          {investments.length > 0 && (
            <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-[var(--sp-blue)] text-white text-[10px] font-bold leading-none">
              {investments.length}
            </span>
          )}
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
            <StockDetail ticker={selectedTicker} onBack={goHome} onCalculate={setCalcStock} />
          </div>
        ) : (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-10">
              <FavouriteStocks onSelect={setSelectedTicker} />
            </div>

            <div className="mb-10">
              <AIMarketFeed onSelect={setSelectedTicker} onCalculate={setCalcStock} />
            </div>

            <div className="mb-10">
              <RecommendedStocks onCalculate={setCalcStock} onSelect={setSelectedTicker} />
            </div>

            <div className="mb-10" ref={portfolioRef}>
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
            onTrack={handleTrack}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastTicker && <Toast ticker={toastTicker} />}
      </AnimatePresence>
    </main>
  );
}
