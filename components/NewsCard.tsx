'use client';
import { ExternalLink } from 'lucide-react';
import { NewsArticle } from '@/types';
import SentimentBadge from './SentimentBadge';

export default function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <div className="py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-silver">{article.source}</span>
          <span className="text-[11px] text-[var(--sp-muted)]">{article.publishedAt}</span>
        </div>
        <SentimentBadge sentiment={article.sentiment} />
      </div>
      <a href={article.url} target="_blank" rel="noopener noreferrer"
        className="text-sm font-medium text-[var(--sp-text)] hover:text-[var(--sp-blue)] transition-colors flex items-start gap-1.5 mb-1.5 group">
        {article.headline}
        <ExternalLink className="w-3 h-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </a>
      <p className="text-xs text-silver leading-relaxed">{article.summary}</p>
    </div>
  );
}
