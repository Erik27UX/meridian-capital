'use client';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Recommendation, Timeframe, EnhancedProjection } from '@/types';
import { calculateEnhancedProjection } from '@/lib/calculations';
import { useStockAnalysis } from '@/hooks/useStockAnalysis';
import VibeBadge from './VibeBadge';
import ProbabilityGauge from './ProbabilityGauge';

const TIMEFRAME_LABEL: Record<Timeframe, string> = {
  '1D': 'today', '1W': 'this week', '1M': 'this month', '3M': 'last 3 months', '1Y': 'this year', 'YTD': 'year to date',
};

const TIMEFRAME_SHORT: Record<Timeframe, string> = {
  '1D': 'today', '1W': 'this week', '1M': 'this month', '3M': 'this quarter', '1Y': 'this year', 'YTD': 'YTD',
};

function fmtPct(n: number) {
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
}

function ConfidenceBadge({ label, score }: { label: EnhancedProjection['confidenceLabel']; score: number }) {
  const colors: Record<string, string> = {
    Strong: 'bg-[var(--sp-green)]/15 text-gain border-[var(--sp-green)]/25',
    Moderate: 'bg-[var(--sp-blue)]/15 text-[var(--sp-blue)] border-[var(--sp-blue)]/25',
    Weak: 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/25',
    Conflicted: 'bg-[var(--sp-red)]/15 text-loss border-[var(--sp-red)]/25',
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colors[label]}`}>
      {score}% · {label}
    </span>
  );
}

function FactorDots({ bullish, bearish, neutral }: { bullish: number; bearish: number; neutral: number }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-[var(--sp-muted)]">
      {bullish > 0 && <span className="text-gain">▲{bullish}</span>}
      {bearish > 0 && <span className="text-loss">▼{bearish}</span>}
      {neutral > 0 && <span>●{neutral}</span>}
      <span>factors</span>
    </div>
  );
}

// Use $1000 as a base to derive clean percentages
const BASE_AMOUNT = 1000;

export default function StockCard({ rec, index, timeframe, onCalculate, onSelect }: {
  rec: Recommendation;
  index: number;
  timeframe: Timeframe;
  onCalculate: () => void;
  onSelect: () => void;
}) {
  const { stock, signal, probability, description, catalysts } = rec;
  const { history, news, loading: analysisLoading } = useStockAnalysis(stock.ticker);

  const periodChange = stock.changesByPeriod?.[timeframe] ?? stock.changePercent;
  const isPositive = periodChange >= 0;

  const projection: EnhancedProjection | null = history.length > 0
    ? calculateEnhancedProjection(BASE_AMOUNT, history, news, stock, probability, timeframe)
    : null;

  const expectedPct = projection?.expected.gainPercent ?? 0;
  const isGain = expectedPct >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="glass rounded-xl p-5 hover:border-white/15 transition-all group cursor-pointer"
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="font-mono-num font-bold text-lg">{stock.ticker}</span>
          <div className="text-xs text-silver">{stock.name}</div>
        </div>
        <div className="text-right">
          <div className="font-mono-num font-semibold text-lg">${stock.price.toFixed(2)}</div>
          <div className={`font-mono-num text-xs ${isPositive ? 'text-gain' : 'text-loss'}`}>
            {isPositive ? '+' : ''}{(stock.price * periodChange / 100).toFixed(2)} {TIMEFRAME_SHORT[timeframe]}
          </div>
        </div>
      </div>

      {/* Period change */}
      <div className={`flex items-center justify-between mb-3 px-3 py-2.5 rounded-lg ${isPositive ? 'bg-[var(--sp-green)]/10' : 'bg-[var(--sp-red,#ef4444)]/10'}`}>
        <div className="flex items-center gap-2">
          {isPositive
            ? <TrendingUp className="w-4 h-4 text-gain shrink-0" />
            : <TrendingDown className="w-4 h-4 text-loss shrink-0" />
          }
          <span className={`font-mono-num text-xl font-bold ${isPositive ? 'text-gain' : 'text-loss'}`}>
            {isPositive ? '+' : ''}{periodChange.toFixed(2)}%
          </span>
        </div>
        <span className="text-[10px] text-[var(--sp-muted)] capitalize">{TIMEFRAME_LABEL[timeframe]}</span>
      </div>

      {/* Multi-factor projection */}
      <div className="mb-3 rounded-lg border border-white/8 bg-white/3 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-[var(--sp-muted)] uppercase tracking-wider">
            {timeframe} projection
          </span>
          {projection && (
            <ConfidenceBadge label={projection.confidenceLabel} score={projection.probabilityScore} />
          )}
        </div>

        {projection ? (
          <div className="space-y-2">
            {/* Expected */}
            <div className={`flex items-center justify-between px-2.5 py-2 rounded-md ${isGain ? 'bg-[var(--sp-green)]/8' : 'bg-[var(--sp-red)]/8'}`}>
              <span className="text-[10px] text-[var(--sp-muted)] uppercase tracking-wider">Expected</span>
              <span className={`font-mono-num font-bold text-sm ${isGain ? 'text-gain' : 'text-loss'}`}>
                {fmtPct(expectedPct)}
              </span>
            </div>

            {/* Factor summary */}
            <div className="flex items-center justify-between pt-1">
              <FactorDots
                bullish={projection.bullishCount}
                bearish={projection.bearishCount}
                neutral={projection.neutralCount}
              />
              {Math.abs(projection.newsAdjustmentPct) > 0.5 && (
                <span className="text-[10px] text-[var(--sp-muted)]">
                  News: <span className={projection.newsAdjustmentPct > 0 ? 'text-gain' : 'text-loss'}>
                    {projection.newsAdjustmentPct > 0 ? '+' : ''}{projection.newsAdjustmentPct.toFixed(1)}%
                  </span>
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--sp-muted)]">
            <Activity className="w-3 h-3 animate-spin" />
            {analysisLoading ? 'Loading model…' : 'Calculating projection…'}
          </div>
        )}
      </div>

      <div className="mb-3"><VibeBadge signal={signal} /></div>
      <div className="mb-3"><ProbabilityGauge value={probability} /></div>

      <p className="text-xs text-silver leading-relaxed mb-3">{description}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {catalysts.map(c => (
          <span key={c} className="px-2 py-0.5 text-[10px] rounded-md bg-white/5 text-silver border border-white/5">{c}</span>
        ))}
      </div>

      <button
        onClick={e => { e.stopPropagation(); onCalculate(); }}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--sp-blue)]/10 text-[var(--sp-blue)] text-sm font-semibold hover:bg-[var(--sp-blue)]/20 transition-colors"
      >
        <Calculator className="w-4 h-4" />
        Full Calculator
      </button>
    </motion.div>
  );
}
