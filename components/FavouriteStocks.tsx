'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, TrendingUp, TrendingDown, X } from 'lucide-react';
import { useFavourites } from '@/contexts/FavouritesContext';
import { Stock } from '@/types';

interface LiveFav {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function FavouriteStocks({ onSelect }: { onSelect: (ticker: string) => void }) {
  const { favourites, removeFavourite } = useFavourites();
  const [liveData, setLiveData] = useState<Record<string, LiveFav>>({});

  useEffect(() => {
    if (favourites.length === 0) return;

    let cancelled = false;

    async function fetchAll() {
      const results: Record<string, LiveFav> = {};
      await Promise.all(
        favourites.map(async (fav) => {
          try {
            const res = await fetch(`/api/stocks?ticker=${fav.ticker}`);
            if (!res.ok) return;
            const q = await res.json();
            results[fav.ticker] = {
              ticker: fav.ticker,
              name: fav.name,
              price: q.price,
              change: q.change,
              changePercent: q.changePercent,
            };
          } catch {
            // skip
          }
        })
      );
      if (!cancelled) setLiveData(results);
    }

    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [favourites]);

  if (favourites.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        <h2 className="text-lg font-bold">Favourite Stocks</h2>
        <span className="text-xs text-[var(--sp-muted)]">({favourites.length})</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <AnimatePresence>
          {favourites.map((fav) => {
            const live = liveData[fav.ticker];
            const isPositive = (live?.changePercent ?? 0) >= 0;

            return (
              <motion.div
                key={fav.ticker}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="glass rounded-xl p-4 hover:border-white/15 transition-all cursor-pointer group relative"
                onClick={() => onSelect(fav.ticker)}
              >
                <button
                  onClick={e => { e.stopPropagation(); removeFavourite(fav.ticker); }}
                  className="absolute top-2 right-2 p-1 rounded-md text-[var(--sp-muted)] opacity-0 group-hover:opacity-100 hover:text-[var(--sp-red)] transition-all"
                  title="Remove from favourites"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-mono-num font-bold text-sm">{fav.ticker}</span>
                    <div className="text-[10px] text-silver truncate max-w-[120px]">{fav.name}</div>
                  </div>
                  {live && (
                    <span className="font-mono-num font-semibold text-sm">${live.price.toFixed(2)}</span>
                  )}
                </div>

                {live ? (
                  <div className={`flex items-center gap-1.5 ${isPositive ? 'text-gain' : 'text-loss'}`}>
                    {isPositive
                      ? <TrendingUp className="w-3.5 h-3.5" />
                      : <TrendingDown className="w-3.5 h-3.5" />
                    }
                    <span className="font-mono-num text-xs font-semibold">
                      {isPositive ? '+' : ''}{live.changePercent.toFixed(2)}%
                    </span>
                    <span className="font-mono-num text-[10px] text-[var(--sp-muted)]">
                      ({isPositive ? '+' : ''}{live.change.toFixed(2)})
                    </span>
                  </div>
                ) : (
                  <div className="text-[10px] text-[var(--sp-muted)]">Loading...</div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
