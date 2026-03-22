'use client';
import useSWR from 'swr';
import { NewsArticle } from '@/types';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useNews(ticker: string | null) {
  const { data, error, isLoading } = useSWR<NewsArticle[]>(
    ticker ? `/api/news?ticker=${ticker}` : null,
    fetcher
  );

  return { articles: data || [], error, loading: isLoading };
}
