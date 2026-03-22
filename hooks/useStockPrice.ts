'use client';
import useSWR from 'swr';
import { StockQuote } from '@/types';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useStockPrice(ticker: string | null) {
  const { data, error, isLoading } = useSWR<StockQuote>(
    ticker ? `/api/stocks?ticker=${ticker}` : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  return { quote: data, error, loading: isLoading };
}
