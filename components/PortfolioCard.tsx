'use client';
import { Trash2 } from 'lucide-react';
import { Investment } from '@/types';
import { formatCurrency, formatPercent } from '@/lib/calculations';

export default function PortfolioCard({ investment, onRemove }: {
  investment: Investment;
  onRemove: () => void;
}) {
  const currentValue = investment.shares * investment.currentPrice;
  const gain = currentValue - investment.amount;
  const gainPct = (gain / investment.amount) * 100;
  const daysAgo = Math.floor((Date.now() - new Date(investment.date).getTime()) / 86400000);

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="font-mono-num font-bold text-base">{investment.ticker}</span>
          <div className="text-xs text-silver">{investment.name}</div>
        </div>
        <button onClick={onRemove} className="p-1.5 rounded-md hover:bg-white/5 transition-colors text-silver hover:text-[var(--sp-red)]">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="text-[10px] text-[var(--sp-muted)] uppercase tracking-wider mb-0.5">Entry Price</div>
          <div className="font-mono-num text-sm">${investment.entryPrice.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-[10px] text-[var(--sp-muted)] uppercase tracking-wider mb-0.5">Current Price</div>
          <div className="font-mono-num text-sm">${investment.currentPrice.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-[10px] text-[var(--sp-muted)] uppercase tracking-wider mb-0.5">Invested</div>
          <div className="font-mono-num text-sm">{formatCurrency(investment.amount)}</div>
        </div>
        <div>
          <div className="text-[10px] text-[var(--sp-muted)] uppercase tracking-wider mb-0.5">Current Value</div>
          <div className="font-mono-num text-sm">{formatCurrency(currentValue)}</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className={`font-mono-num text-sm font-semibold ${gain >= 0 ? 'text-gain' : 'text-loss'}`}>
          {formatCurrency(gain)} ({formatPercent(gainPct)})
        </div>
        <div className="text-[10px] text-[var(--sp-muted)]">
          Tracked {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}
        </div>
      </div>
    </div>
  );
}
