'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Minus, RefreshCw, AlertCircle, Clock, Star, Calculator } from 'lucide-react';
import type { FeedPick, FeedResult } from '@/app/api/market-feed/route';
import { Stock } from '@/types';
import { useFavourites } from '@/contexts/FavouritesContext';

const TIMEFRAMES = ['1D', '1W', '1M', '3M'] as const;
type TF = typeof TIMEFRAMES[number];

function ActionBadge({ action }: { action: FeedPick['action'] }) {
  const styles = {
    buy: 'bg-[var(--sp-green)]/15 text-gain border-[var(--sp-green)]/25',
    watch: 'bg-[var(--sp-blue)]/15 text-[var(--sp-blue)] border-[var(--sp-blue)]/25',
  };
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-widest ${styles[action]}`}>
      {action}
    </span>
  );
}

function RiskDot({ level }: { level: FeedPick['riskLevel'] }) {
  const colors = { Low: 'bg-[var(--sp-green)]', Medium: 'bg-[#f59e0b]', High: 'bg-[var(--sp-red)]' };
  return (
    <span className="flex items-center gap-1 text-[10px] text-[var(--sp-muted)]">
      <span className={`w-1.5 h-1.5 rounded-full ${colors[level]}`} />
      {level} risk
    </span>
  );
}

function PickCard({
  pick, index, onCalculate, onSelect,
}: {
  pick: FeedPick;
  index: number;
  onCalculate: (stock: Stock) => void;
  onSelect: (ticker: string) => void;
}) {
  const { isFavourite, addFavourite, removeFavourite } = useFavourites();
  const fav = isFavourite(pick.ticker);

  function handleCalculate(e: React.MouseEvent) {
    e.stopPropagation();
    onCalculate({
      ticker: pick.ticker,
      name: pick.companyName,
      price: pick.price,
      change: pick.change,
      changePercent: pick.changePercent,
      volume: 0,
      marketCap: 0,
    });
  }

  function handleStar(e: React.MouseEvent) {
    e.stopPropagation();
    if (fav) removeFavourite(pick.ticker);
    else addFavourite(pick.ticker, pick.companyName);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="glass rounded-xl p-5 hover:border-white/15 transition-all cursor-pointer"
      onClick={() => onSelect(pick.ticker)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="font-mono-num font-bold text-lg">{pick.ticker}</span>
          <div className="text-xs text-silver mt-0.5">{pick.companyName}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleStar}
            className={`p-1 rounded-md transition-colors ${
              fav ? 'text-yellow-400' : 'text-[var(--sp-muted)] hover:text-yellow-400'
            }`}
          >
            <Star className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
          </button>
          <ActionBadge action={pick.action} />
        </div>
      </div>

      {/* Price + expected gain */}
      <div className="flex items-center justify-between mb-3 px-3 py-2.5 rounded-lg bg-[var(--sp-green)]/10">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gain shrink-0" />
          <span className="font-mono-num text-xl font-bold text-gain">
            +{pick.expectedGainPct.toFixed(1)}%
          </span>
        </div>
        <div className="text-right">
          <div className="font-mono-num text-sm font-semibold">
            {pick.price > 0 ? `$${pick.price.toFixed(2)}` : '—'}
          </div>
          <div className="text-[10px] text-[var(--sp-muted)]">{pick.timeframe} target · {pick.confidence} conf.</div>
        </div>
      </div>

      {/* News catalyst */}
      <div className="mb-2 px-3 py-2 rounded-md bg-white/3 border border-white/8">
        <div className="text-[9px] text-[var(--sp-muted)] uppercase tracking-wider mb-1">News Catalyst</div>
        <p className="text-xs text-[var(--sp-text)] leading-relaxed">{pick.catalyst}</p>
      </div>

      {/* Reasoning */}
      <p className="text-xs text-silver leading-relaxed mb-3">{pick.reasoning}</p>

      <div className="flex items-center justify-between">
        <RiskDot level={pick.riskLevel} />
        <button
          onClick={handleCalculate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--sp-blue)]/10 text-[var(--sp-blue)] text-xs font-semibold hover:bg-[var(--sp-blue)]/20 transition-colors"
        >
          <Calculator className="w-3.5 h-3.5" />
          Calculator
        </button>
      </div>
    </motion.div>
  );
}

export default function AIMarketFeed({
  onSelect,
  onCalculate,
}: {
  onSelect: (ticker: string) => void;
  onCalculate: (stock: Stock) => void;
}) {
  const [feed, setFeed] = useState<FeedResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState<TF>('1W');

  async function loadFeed(tf: TF, bustCache = false) {
    try {
      const url = `/api/market-feed?timeframe=${tf}${bustCache ? '&refresh=1' : ''}`;
      const res = await fetch(url);
      const data: FeedResult = await res.json();
      setFeed(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    loadFeed(timeframe);
  }, [timeframe]);

  function handleTimeframe(tf: TF) {
    if (tf === timeframe) return;
    setTimeframe(tf);
  }

  function handleRefresh() {
    setRefreshing(true);
    loadFeed(timeframe, true);
  }

  const generatedAgo = feed?.generatedAt
    ? (() => {
        const diff = Math.floor((Date.now() - new Date(feed.generatedAt).getTime()) / 60000);
        if (diff < 1) return 'just now';
        if (diff < 60) return `${diff}m ago`;
        return `${Math.floor(diff / 60)}h ago`;
      })()
    : null;

  return (
    <section>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-[var(--sp-blue)]" />
          <h2 className="text-lg font-semibold">AI Market Intelligence</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--sp-blue)]/15 text-[var(--sp-blue)] border border-[var(--sp-blue)]/25 font-medium">
            Live News Analysis
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe selector */}
          <div className="flex items-center gap-1 bg-[var(--sp-card)] border border-white/10 rounded-lg p-1">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf}
                onClick={() => handleTimeframe(tf)}
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

          {generatedAgo && (
            <span className="flex items-center gap-1 text-[10px] text-[var(--sp-muted)]">
              <Clock className="w-3 h-3" />
              {generatedAgo}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 text-xs text-silver hover:text-white disabled:opacity-40 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading || refreshing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass rounded-xl p-5">
              <div className="h-6 w-16 bg-white/5 rounded animate-shimmer mb-2" />
              <div className="h-3 w-28 bg-white/5 rounded animate-shimmer mb-4" />
              <div className="h-12 w-full bg-white/5 rounded animate-shimmer mb-3" />
              <div className="h-10 w-full bg-white/5 rounded animate-shimmer mb-3" />
              <div className="h-16 w-full bg-white/5 rounded animate-shimmer" />
            </div>
          ))}
        </div>
      ) : feed?.error ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/3 border border-white/8 text-sm text-[var(--sp-muted)]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {feed.error}
        </div>
      ) : feed?.picks.length === 0 ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/3 border border-white/8 text-sm text-[var(--sp-muted)]">
          <Minus className="w-4 h-4 shrink-0" />
          No strong buy signals found for this timeframe — try a different timeframe or check back later.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {feed.picks.map((pick, i) => (
              <PickCard
                key={`${pick.ticker}-${timeframe}`}
                pick={pick}
                index={i}
                onCalculate={onCalculate}
                onSelect={onSelect}
              />
            ))}
          </div>
          {feed.newsCount != null && (
            <p className="mt-3 text-[10px] text-[var(--sp-muted)] text-center">
              Based on {feed.newsCount} live headlines · Refreshes every 6h · Not financial advice
            </p>
          )}
        </>
      )}
    </section>
  );
}
