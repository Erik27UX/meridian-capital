'use client';
import { useRef, useEffect, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useStockSearch } from '@/hooks/useStockSearch';
import { Stock } from '@/types';

export default function SearchBar({ onSelectStock, onCalculate }: {
  onSelectStock: (ticker: string) => void;
  onCalculate: (stock: Stock) => void;
}) {
  const { query, setQuery, results, loading } = useStockSearch();
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleKey); };
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-silver" />
        {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-silver animate-spin" />}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => query && setOpen(true)}
          placeholder="Search any stock (e.g. AAPL, TSLA, NVDA)..."
          className="w-full pl-12 pr-12 py-4 bg-[var(--sp-card)] border border-white/10 rounded-xl text-[var(--sp-text)] placeholder:text-[var(--sp-muted)] focus:outline-none focus:border-[var(--sp-blue)]/40 focus:ring-1 focus:ring-[var(--sp-blue)]/20 transition-all text-sm"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full glass rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
          {results.map(stock => (
            <div
              key={stock.ticker}
              className="flex items-center justify-between px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0"
              onClick={() => { onSelectStock(stock.ticker); setOpen(false); setQuery(''); }}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono-num font-bold text-sm text-[var(--sp-text)]">{stock.ticker}</span>
                <span className="text-sm text-silver">{stock.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono-num text-sm">${stock.price.toFixed(2)}</span>
                <span className={`font-mono-num text-xs ${stock.changePercent >= 0 ? 'text-gain' : 'text-loss'}`}>
                  {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </span>
                <button
                  onClick={e => { e.stopPropagation(); onCalculate(stock); setOpen(false); setQuery(''); }}
                  className="px-3 py-1 text-xs font-semibold rounded-md bg-[var(--sp-blue)]/15 text-[var(--sp-blue)] hover:bg-[var(--sp-blue)]/25 transition-colors"
                >
                  Calculate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
