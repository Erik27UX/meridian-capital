export type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y' | 'YTD';

export interface Stock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  changesByPeriod?: Partial<Record<Timeframe, number>>;
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
  projectedGainPercent?: number;
  actualGainPercent?: number;
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

export interface FactorBreakdown {
  cagrSignal: number;
  rsiValue: number;
  rsiSignal: number;
  volumeSignal: number;
  momentumSignal: number;
  newsSentimentScore: number;
  newsSentimentSignal: number;
  zScore: number;
  zScoreSignal: number;
  volRegime: number;
  aiProbability: number;
  aiSignal: number;
}

export interface EnhancedProjection {
  expected: ProjectionResult;
  bull: ProjectionResult;
  bear: ProjectionResult;
  probabilityScore: number;
  confidenceLabel: 'Strong' | 'Moderate' | 'Weak' | 'Conflicted';
  factors: FactorBreakdown;
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  newsAdjustmentPct: number;
}
