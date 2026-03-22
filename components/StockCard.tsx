'use client';
import { motion } from 'framer-motion';
import { Calculator } from 'lucide-react';
import { Recommendation } from '@/types';
import VibeBadge from './VibeBadge';
import ProbabilityGauge from './ProbabilityGauge';

export default function StockCard({ rec, index, onCalculate, onSelect }: {
  rec: Recommendation;
  index: number;
  onCalculate: () => void;
  onSelect: () => void;
}) {
  const { stock, signal, probability, description, catalysts } = rec;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="glass rounded-xl p-5 hover:border-white/15 transition-all group cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono-num font-bold text-lg">{stock.ticker}</span>
            <span className={`font-mono-num text-xs ${stock.changePercent >= 0 ? 'text-gain' : 'text-loss'}`}>
              {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
            </span>
          </div>
          <div className="text-xs text-silver">{stock.name}</div>
        </div>
        <div className="text-right">
          <div className="font-mono-num font-semibold text-lg">${stock.price.toFixed(2)}</div>
          <div className={`font-mono-num text-xs ${stock.change >= 0 ? 'text-gain' : 'text-loss'}`}>
            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="mb-3">
        <VibeBadge signal={signal} />
      </div>

      <div className="mb-3">
        <ProbabilityGauge value={probability} />
      </div>

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
        Calculate Returns
      </button>
    </motion.div>
  );
}
