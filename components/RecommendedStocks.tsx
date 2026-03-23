'use client';
import { useState, useEffect } from 'react';
import { Recommendation, Stock, Timeframe } from '@/types';
import { getRecommendations } from '@/lib/api';
import StockCard from './StockCard';
import { Sparkles, ArrowUpDown } from 'lucide-react';

type SortMode = 'default' | 'profit' | 'bullish';

const TIMEFRAMES: Timeframe[] = ['1D', '1W', '1M', '3M', 'YTD', '1Y'];

export default function RecommendedStocks({ onCalculate, onSelect }: {
  onCalculate: (stock: Stock) => void;
  onSelect: (ticker: string) => void;
}) {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortMode>('default');
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');

  useEffect(() => {
    getRecommendations()
      .then(setRecs)
      .catch(() => {})
      .finally(() => setLoading(false));

    const interval = setInterval(() => {
      getRecommendations().then(setRecs).catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const sorted = [...recs].sort((a, b) => {
    if (sort === 'profit') {
      // Score = AI probability (forward-looking) weighted with period momentum
      // Higher probability + better momentum = higher potential profit
      const aChange = a.stock.changesByPeriod?.[timeframe] ?? a.stock.changePercent;
      const bChange = b.stock.changesByPeriod?.[timeframe] ?? b.stock.changePercent;
      const aScore = a.probability * (1 + aChange / 100);
      const bScore = b.probability * (1 + bChange / 100);
      return bScore - aScore;
    }
    if (sort === 'bullish') return b.probability - a.probability;
    return 0;
  });

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--sp-blue)]" />
          <h2 className="text-lg font-semibold">Recommended Stocks</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[var(--sp-card)] border border-white/10 rounded-lg p-1">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  timeframe === tf
                    ? 'bg-[var(--sp-blue)] text-white'
                    : 'text-silver hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-silver" />
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortMode)}
              className="bg-[var(--sp-card)] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-silver focus:outline-none focus:border-[var(--sp-blue)]/40 cursor-pointer"
            >
              <option value="default">Default</option>
              <option value="profit">Potential Profit</option>
              <option value="bullish">Most Bullish</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="glass rounded-xl p-5">
              <div className="h-6 w-20 bg-white/5 rounded animate-shimmer mb-3" />
              <div className="h-4 w-32 bg-white/5 rounded animate-shimmer mb-3" />
              <div className="h-2 w-full bg-white/5 rounded animate-shimmer mb-3" />
              <div className="h-16 w-full bg-white/5 rounded animate-shimmer mb-3" />
              <div className="h-10 w-full bg-white/5 rounded animate-shimmer" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((rec, i) => (
            <StockCard
              key={`${rec.stock.ticker}-${sort}-${timeframe}`}
              rec={rec}
              index={i}
              timeframe={timeframe}
              onCalculate={() => onCalculate(rec.stock)}
              onSelect={() => onSelect(rec.stock.ticker)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
