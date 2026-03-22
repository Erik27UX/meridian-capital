import { Stock, StockQuote, HistoricalDataPoint, NewsArticle, Recommendation } from '@/types';

const BASE = '';

export async function searchStocks(query: string): Promise<Stock[]> {
  const res = await fetch(`${BASE}/api/stocks?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to search stocks');
  return res.json();
}

export async function getStockQuote(ticker: string): Promise<StockQuote> {
  const res = await fetch(`${BASE}/api/stocks?ticker=${encodeURIComponent(ticker)}`);
  if (!res.ok) throw new Error('Failed to fetch quote');
  return res.json();
}

export async function getStockHistory(ticker: string, period: string): Promise<HistoricalDataPoint[]> {
  const res = await fetch(`${BASE}/api/stocks/history?ticker=${encodeURIComponent(ticker)}&period=${encodeURIComponent(period)}`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function getNews(ticker: string): Promise<NewsArticle[]> {
  const res = await fetch(`${BASE}/api/news?ticker=${encodeURIComponent(ticker)}`);
  if (!res.ok) throw new Error('Failed to fetch news');
  return res.json();
}

export async function getRecommendations(): Promise<Recommendation[]> {
  const res = await fetch(`${BASE}/api/recommendations`);
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
}
