'use client';
import { useState } from 'react';
import { Trash2, Target, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Investment } from '@/types';
import { formatCurrency, formatPercent } from '@/lib/calculations';

function getAccuracy(predicted: number, actual: number): { score: number; label: string; color: string } {
  const error = Math.abs(actual - predicted);
  const score = Math.max(0, Math.round(100 - error * 3));
  const sameDirection = (predicted >= 0) === (actual >= 0);

  let label: string;
  let color: string;
  if (score >= 85 && sameDirection) { label = 'Excellent'; color = 'text-gain'; }
  else if (score >= 65 && sameDirection) { label = 'Good'; color = 'text-[var(--sp-blue)]'; }
  else if (score >= 40) { label = 'Fair'; color = 'text-[#f59e0b]'; }
  else { label = 'Poor'; color = 'text-loss'; }

  return { score, label, color };
}

export default function PortfolioCard({ investment, onRemove, onUpdate }: {
  investment: Investment;
  onRemove: () => void;
  onUpdate: (actualGainPercent: number) => void;
}) {
  const [showResult, setShowResult] = useState(false);
  const [actualInput, setActualInput] = useState(
    investment.actualGainPercent != null ? investment.actualGainPercent.toString() : ''
  );

  const currentValue = investment.shares * investment.currentPrice;
  const gain = currentValue - investment.amount;
  const gainPct = (gain / investment.amount) * 100;
  const daysAgo = Math.floor((Date.now() - new Date(investment.date).getTime()) / 86400000);

  const hasResult = investment.actualGainPercent != null;
  const accuracy = hasResult && investment.projectedGainPercent != null
    ? getAccuracy(investment.projectedGainPercent, investment.actualGainPercent!)
    : null;

  function handleSubmitResult() {
    const val = parseFloat(actualInput);
    if (isNaN(val)) return;
    onUpdate(val);
    setShowResult(false);
  }

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="font-mono-num font-bold text-base">{investment.ticker}</span>
          <div className="text-xs text-silver">{investment.name}</div>
        </div>
        <button onClick={onRemove} className="p-1.5 rounded-md hover:bg-white/5 transition-colors text-silver hover:text-loss">
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

      <div className="flex items-center justify-between pt-3 border-t border-white/5 mb-3">
        <div className={`font-mono-num text-sm font-semibold ${gain >= 0 ? 'text-gain' : 'text-loss'}`}>
          {formatCurrency(gain)} ({formatPercent(gainPct)})
        </div>
        <div className="text-[10px] text-[var(--sp-muted)]">
          Tracked {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}
        </div>
      </div>

      {investment.projectedGainPercent != null && (
        <div className="text-[10px] text-[var(--sp-muted)] mb-3">
          Predicted: <span className={`font-mono-num font-medium ${investment.projectedGainPercent >= 0 ? 'text-gain' : 'text-loss'}`}>
            {investment.projectedGainPercent >= 0 ? '+' : ''}{investment.projectedGainPercent.toFixed(2)}%
          </span>
        </div>
      )}

      {accuracy && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 mb-3">
          <CheckCircle className="w-4 h-4 text-[var(--sp-muted)] shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-[var(--sp-muted)] uppercase tracking-wider">Prediction Accuracy</div>
            <div className="flex items-center gap-2">
              <span className={`font-mono-num font-bold text-sm ${accuracy.color}`}>{accuracy.score}%</span>
              <span className={`text-xs ${accuracy.color}`}>{accuracy.label}</span>
            </div>
          </div>
          <div className="text-[10px] text-[var(--sp-muted)] text-right">
            Actual: <span className="font-mono-num">{investment.actualGainPercent! >= 0 ? '+' : ''}{investment.actualGainPercent!.toFixed(2)}%</span>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowResult(v => !v)}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-silver text-xs font-medium transition-colors"
      >
        <Target className="w-3.5 h-3.5" />
        {hasResult ? 'Update Result' : 'Log Actual Result'}
        {showResult ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {showResult && (
        <div className="mt-2 flex gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              value={actualInput}
              onChange={e => setActualInput(e.target.value)}
              placeholder="e.g. 12.5"
              className="w-full pl-3 pr-8 py-2 bg-[var(--sp-bg)] border border-white/10 rounded-lg font-mono-num text-sm text-[var(--sp-text)] placeholder:text-[var(--sp-muted)] focus:outline-none focus:border-[var(--sp-blue)]/40 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--sp-muted)] text-xs">%</span>
          </div>
          <button
            onClick={handleSubmitResult}
            disabled={actualInput === '' || isNaN(parseFloat(actualInput))}
            className="px-3 py-2 rounded-lg bg-[var(--sp-blue)]/10 text-[var(--sp-blue)] text-xs font-semibold hover:bg-[var(--sp-blue)]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
