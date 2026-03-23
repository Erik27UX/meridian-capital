'use client';
import { useState, useEffect } from 'react';
import { HistoricalDataPoint, NewsArticle } from '@/types';
import { getStockHistory, getNews } from '@/lib/api';

export function useStockAnalysis(ticker: string) {
  const [history, setHistory] = useState<HistoricalDataPoint[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getStockHistory(ticker, '1Y'),
      getNews(ticker),
    ])
      .then(([h, n]) => { setHistory(h); setNews(n); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ticker]);

  return { history, news, loading };
}
