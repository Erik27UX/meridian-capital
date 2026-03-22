'use client';
import { usePortfolio } from '@/hooks/usePortfolio';
import PortfolioCard from './PortfolioCard';
import { Briefcase, TrendingUp } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/calculations';

export default function PortfolioTracker() {
  const { investments, removeInvestment, totalInvested, currentValue, totalGain, totalGainPercent } = usePortfolio();

  return (
    <section>
      <div className="flex items-center gap-2 mb-5">
        <Briefcase className="w-5 h-5 text-[var(--sp-blue)]" />
        <h2 className="text-lg font-semibold">My Investments</h2>
      </div>

      {investments.length > 0 && (
        <div className="glass rounded-xl p-5 mb-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-[10px] text-[var(--sp-muted)] uppercase tracking-wider mb-1">Total Invested</div>
              <div className="font-mono-num text-xl font-bold">{formatCurrency(totalInvested)}</div>
            </div>
            <div>
              <div className="text-[10px] text-[var(--sp-muted)] uppercase tracking-wider mb-1">Current Value</div>
              <div className="font-mono-num text-xl font-bold">{formatCurrency(currentValue)}</div>
            </div>
            <div>
              <div className="text-[10px] text-[var(--sp-muted)] uppercase tracking-wider mb-1">Total Gain/Loss</div>
              <div className={`font-mono-num text-xl font-bold ${totalGain >= 0 ? 'text-gain' : 'text-loss'}`}>
                {formatCurrency(totalGain)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[var(--sp-muted)] uppercase tracking-wider mb-1">ROI</div>
              <div className={`font-mono-num text-xl font-bold flex items-center gap-1 ${totalGainPercent >= 0 ? 'text-gain' : 'text-loss'}`}>
                <TrendingUp className="w-4 h-4" />
                {formatPercent(totalGainPercent)}
              </div>
            </div>
          </div>
        </div>
      )}

      {investments.length === 0 ? (
        <div className="glass rounded-xl p-8 text-center">
          <Briefcase className="w-10 h-10 text-[var(--sp-muted)] mx-auto mb-3" />
          <p className="text-sm text-silver mb-1">No investments tracked yet</p>
          <p className="text-xs text-[var(--sp-muted)]">Search for a stock and click &quot;Track This Investment&quot; in the calculator to start tracking.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {investments.map(inv => (
            <PortfolioCard key={inv.id} investment={inv} onRemove={() => removeInvestment(inv.id)} />
          ))}
        </div>
      )}
    </section>
  );
}
