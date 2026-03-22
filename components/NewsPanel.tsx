'use client';
import { useNews } from '@/hooks/useNews';
import NewsCard from './NewsCard';
import { Newspaper } from 'lucide-react';

export default function NewsPanel({ ticker }: { ticker: string }) {
  const { articles, loading } = useNews(ticker);

  if (loading) {
    return (
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="w-4 h-4 text-[var(--sp-blue)]" />
          <span className="text-xs font-semibold text-[var(--sp-blue)] uppercase tracking-wider">What&apos;s Driving This Rating</span>
        </div>
        {[1,2,3].map(i => (
          <div key={i} className="py-3 border-b border-white/5">
            <div className="h-3 w-24 bg-white/5 rounded animate-shimmer mb-2" />
            <div className="h-4 w-full bg-white/5 rounded animate-shimmer mb-2" />
            <div className="h-3 w-3/4 bg-white/5 rounded animate-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="w-4 h-4 text-[var(--sp-blue)]" />
        <span className="text-xs font-semibold text-[var(--sp-blue)] uppercase tracking-wider">What&apos;s Driving This Rating</span>
      </div>
      {articles.map(a => <NewsCard key={a.id} article={a} />)}
      {articles.length === 0 && <p className="text-sm text-silver">No news available for this stock.</p>}
    </div>
  );
}
