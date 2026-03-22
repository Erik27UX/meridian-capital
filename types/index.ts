export interface Stock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
}

export interface StockQuote {
  ticker: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  previousClose: number;
  change: number;
  changePercent: number;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NewsArticle {
  id: string;
  headline: string;
  source: string;
  publishedAt: string;
  url: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  summary: string;
  relevance: number;
}

export interface Investment {
  id: string;
  ticker: string;
  name: string;
  entryPrice: number;
  amount: number;
  shares: number;
  date: string;
  currentPrice: number;
}

export type Signal = 'strong-buy' | 'buy' | 'hold' | 'sell';

export interface Recommendation {
  stock: Stock;
  signal: Signal;
  probability: number;
  description: string;
  catalysts: string[];
}

export interface ProjectionResult {
  projectedValue: number;
  gain: number;
  gainPercent: number;
}
