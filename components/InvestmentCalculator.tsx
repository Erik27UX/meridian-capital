'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, AlertTriangle, Bookmark } from 'lucide-react';
import { Stock, HistoricalDataPoint, Investment } from '@/types';
import { calculateProjection, calculateBestCase, calculateWorstCase, formatCurrency, formatPercent, timeframeToDays } from '@/lib/calculations';
import { getStockHistory } from '@/lib/api';

export default function InvestmentCalculator({ stock, onClose, onTrack }: {
  stock: Stock;
  onClose: () => void;
  onTrack: (inv: Investment) => void;
}) {
  const [amount, setAmount] = useState('');
  const [timeframe, setTimeframe] = useState('1M');
  const [history, setHistory] = useState<HistoricalDataPoint[]>([]);
  const [calculated, setCalculated] = useState(false);

  useEffect(() => {
    getStockHistory(stock.ticker, '1Y').then(setHistory).catch(() => {});
  }, [stock.ticker]);

  const amountNum = parseFloat(amount) || 0;
  const days = timeframeToDays(timeframe);
  const projection = calculateProjection(amountNum, history, days);
  const bestCase = calculateBestCase(amountNum, history, days);
  const worstCase = calculateWorstCase(amountNum, history, days);

  function handleTrack() {
    const inv: Investment = {
      id: Date.now().toString(),
      ticker: stock.ticker,
      name: stock.name,
      entryPrice: stock.price,
      amount: amountNum,
      shares: amountNum / stock.price,
      date: new Date().toISOString(),
      currentPrice: stock.price,
      projectedGainPercent: projection.gainPercent,
    };
    onTrack(inv);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg glass rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono-num font-bold text-xl">{stock.ticker}</span>
              <span className={`font-mono-num text-sm ${stock.changePercent >= 0 ? 'text-gain' : 'text-loss'}`}>
                {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
              </span>
            </div>
            <div className="text-sm text-silver">{stock.name}</div>
            <div className="font-mono-num text-2xl font-bold mt-1">${stock.price.toFixed(2)}</div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-5 h-5 text-silver" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-silver uppercase tracking-wider mb-2">Investment Amount ($)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-silver font-mono-num">$</span>
            <input
              type="number"
              value={amount}
              onChange={e => { setAmount(e.target.value); setCalculated(false); }}
              placeholder="5,000"
              className="w-full pl-8 pr-4 py-3 bg-[var(--sp-bg)] border border-white/10 rounded-lg font-mono-num text-[var(--sp-text)] placeholder:text-[var(--sp-muted)] focus:outline-none focus:border-[var(--sp-blue)]/40 transition-all"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-xs text-silver uppercase tracking-wider mb-2">Timeline</label>
          <div className="grid grid-cols-4 gap-2">
            {['1D', '1W', '1M', '1Y'].map(tf => (
              <button
                key={tf}
                onClick={() => { setTimeframe(tf); setCalculated(false); }}
                className={`py-2 rounded-lg text-sm font-medium transition-all ${
                  timeframe === tf
                    ? 'bg-[var(--sp-blue)]/15 text-[var(--sp-blue)] border border-[var(--sp-blue)]/30'
                    : 'bg-white/5 text-silver border border-white/5 hover:bg-white/10'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setCalculated(true)}
          disabled={amountNum <= 0}
          className="w-full py-3 rounded-lg bg-[var(--sp-blue)] text-white font-semibold text-sm hover:bg-[var(--sp-blue)]/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all mb-5"
        >
          Calculate Projection
        </button>

        <AnimatePresence>
          {calculated && amountNum > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="bg-info rounded-xl p-4 border border-[var(--sp-blue)]/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-[var(--sp-blue)]" />
                  <span className="text-xs font-semibold text-[var(--sp-blue)] uppercase tracking-wider">Projected Return</span>
                </div>
                <div className="font-mono-num text-2xl font-bold">{formatCurrency(projection.projectedValue)}</div>
                <div className="flex gap-3 mt-1">
                  <span className={`font-mono-num text-sm ${projection.gain >= 0 ? 'text-gain' : 'text-loss'}`}>
                    {formatCurrency(projection.gain)}
                  </span>
                  <span className={`font-mono-num text-sm ${projection.gainPercent >= 0 ? 'text-gain' : 'text-loss'}`}>
                    ({formatPercent(projection.gainPercent)})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gain rounded-xl p-4 border border-[var(--sp-green)]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-[var(--sp-green)]" />
                    <span className="text-[10px] font-semibold text-[var(--sp-green)] uppercase tracking-wider">Best Case</span>
                  </div>
                  <div className="font-mono-num text-lg font-bold text-[var(--sp-green)]">{formatCurrency(bestCase.projectedValue)}</div>
                  <div className="font-mono-num text-xs text-[var(--sp-green)]/70">{formatPercent(bestCase.gainPercent)}</div>
                </div>

                <div className="bg-loss rounded-xl p-4 border border-[var(--sp-red)]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-[var(--sp-red)]" />
                    <span className="text-[10px] font-semibold text-[var(--sp-red)] uppercase tracking-wider">Worst Case</span>
                  </div>
                  <div className="font-mono-num text-lg font-bold text-[var(--sp-red)]">{formatCurrency(worstCase.projectedValue)}</div>
                  <div className="font-mono-num text-xs text-[var(--sp-red)]/70">{formatPercent(worstCase.gainPercent)}</div>
                </div>
              </div>

              <button
                onClick={handleTrack}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[var(--sp-green)]/10 text-[var(--sp-green)] font-semibold text-sm hover:bg-[var(--sp-green)]/20 transition-colors border border-[var(--sp-green)]/20"
              >
                <Bookmark className="w-4 h-4" />
                Track This Investment
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
