import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

export interface FeedPick {
  ticker: string;
  companyName: string;
  action: 'buy' | 'watch';
  expectedGainPct: number;
  timeframe: '1D' | '1W' | '1M' | '3M';
  confidence: 'High' | 'Medium' | 'Low';
  catalyst: string;
  reasoning: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  price: number;
  change: number;
  changePercent: number;
}

export interface FeedResult {
  picks: FeedPick[];
  generatedAt: string;
  newsCount: number;
  timeframe: string;
  error?: string;
}

// Cache per timeframe
const cacheMap = new Map<string, { data: FeedResult; timestamp: number }>();
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const WATCH_TICKERS = [
  'AAPL', 'NVDA', 'MSFT', 'GOOGL', 'AMZN',
  'TSLA', 'META', 'AMD', 'NFLX', 'JPM',
  'SPY', 'QQQ', 'INTC', 'BABA', 'PLTR',
];

// Timeframe configs: how much to weight news vs price momentum, and gain caps
const TF_CONFIG = {
  '1D': { newsWeight: 0.80, momentumWeight: 0.20, maxGain: 1.5, historyDays: 5 },
  '1W': { newsWeight: 0.65, momentumWeight: 0.35, maxGain: 3.0, historyDays: 14 },
  '1M': { newsWeight: 0.50, momentumWeight: 0.50, maxGain: 6.0, historyDays: 60 },
  '3M': { newsWeight: 0.30, momentumWeight: 0.70, maxGain: 12.0, historyDays: 120 },
} as const;

// ── Keyword sentiment scoring ─────────────────────────────────────────────────

const BULLISH_KEYWORDS = [
  'beat', 'beats', 'upgrade', 'upgraded', 'outperform', 'record',
  'surge', 'surges', 'soar', 'soars', 'rally', 'rallies', 'jumps', 'rises',
  'profit', 'revenue growth', 'earnings beat', 'raised target', 'raises guidance',
  'partnership', 'acquisition', 'launches', 'expands', 'milestone', 'approval',
  'deal', 'contract', 'positive', 'strong', 'growth', 'bullish', 'breakout',
];

const BEARISH_KEYWORDS = [
  'miss', 'misses', 'downgrade', 'downgraded', 'underperform',
  'drops', 'falls', 'tumbles', 'plunges', 'slumps', 'declines', 'sinks',
  'loss', 'losses', 'debt', 'lawsuit', 'investigation', 'recall', 'warning',
  'layoffs', 'cut', 'cuts', 'below expectations', 'lowers guidance', 'concern',
  'bearish', 'weak', 'disappoints', 'missed', 'fraud', 'delay', 'fine',
];

function scoreHeadline(headline: string): number {
  const lower = headline.toLowerCase();
  let score = 0;
  for (const kw of BULLISH_KEYWORDS) if (lower.includes(kw)) score++;
  for (const kw of BEARISH_KEYWORDS) if (lower.includes(kw)) score--;
  return score;
}

function pickCatalyst(headlines: string[], score: number): string {
  let best = headlines[0];
  let bestScore = -Infinity;
  for (const h of headlines) {
    const s = scoreHeadline(h);
    const match = score >= 0 ? s : -s;
    if (match > bestScore) { bestScore = match; best = h; }
  }
  return best;
}

function buildReasoning(newsScore: number, momentum: number, headlines: string[], tf: string): string {
  const sentimentStr = newsScore > 1 ? 'strongly positive' : 'mildly positive';
  const momentumStr = momentum > 2 ? 'strong upward' : momentum > 0 ? 'mild upward' : 'flat';
  const count = headlines.length;
  const tfLabel = tf === '1D' ? 'today' : tf === '1W' ? 'this week' : tf === '1M' ? 'this month' : 'this quarter';
  return `News sentiment is ${sentimentStr} across ${count} recent headline${count !== 1 ? 's' : ''}. Price momentum is ${momentumStr} ${tfLabel}. Bullish signals suggest a short-term opportunity, though markets remain unpredictable — always manage risk.`;
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tf = (url.searchParams.get('timeframe') ?? '1W') as keyof typeof TF_CONFIG;
  const bustCache = url.searchParams.has('refresh');
  const timeframe = TF_CONFIG[tf] ? tf : '1W';
  const cfg = TF_CONFIG[timeframe];

  const cached = cacheMap.get(timeframe);
  if (!bustCache && cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  // ── 1. Fetch news + quotes + history in parallel ─────────────────────────
  type StockData = {
    headlines: string[];
    name: string;
    price: number;
    change: number;
    changePercent: number;
    periodChange: number; // % change over the selected timeframe
  };

  const stockData: Record<string, StockData> = {};

  await Promise.all(
    WATCH_TICKERS.map(async (ticker) => {
      try {
        const now = new Date();
        const histStart = new Date(now.getTime() - cfg.historyDays * 24 * 60 * 60 * 1000);

        const [searchResult, quote, chart] = await Promise.all([
          yahooFinance.search(ticker, { quotesCount: 0, newsCount: 4 }),
          yahooFinance.quote(ticker),
          yahooFinance.chart(ticker, { period1: histStart, period2: now, interval: '1d' }),
        ]);

        const headlines = (searchResult.news ?? []).map((a: Record<string, unknown>) => a.title as string).filter(Boolean);

        // Compute period % change from history
        const quotes = (chart.quotes ?? []).filter((q: Record<string, unknown>) => q.close != null);
        let periodChange = 0;
        if (quotes.length >= 2) {
          const first = quotes[0].close as number;
          const last = quotes[quotes.length - 1].close as number;
          periodChange = ((last - first) / first) * 100;
        }

        stockData[ticker] = {
          headlines,
          name: quote.shortName ?? quote.longName ?? ticker,
          price: quote.regularMarketPrice ?? 0,
          change: quote.regularMarketChange ?? 0,
          changePercent: quote.regularMarketChangePercent ?? 0,
          periodChange,
        };
      } catch { /* skip */ }
    })
  );

  const totalNews = Object.values(stockData).reduce((s, d) => s + d.headlines.length, 0);

  if (totalNews === 0) {
    return NextResponse.json(
      { picks: [], generatedAt: new Date().toISOString(), newsCount: 0, timeframe, error: 'Could not fetch news from Yahoo Finance' },
      { status: 503 }
    );
  }

  // ── 2. Score each ticker ─────────────────────────────────────────────────
  type ScoredTicker = {
    ticker: string;
    compositeScore: number;
    newsScore: number;
    data: StockData;
  };

  const scored: ScoredTicker[] = WATCH_TICKERS
    .filter(t => stockData[t]?.headlines.length)
    .map(ticker => {
      const data = stockData[ticker];
      const newsScore = data.headlines.reduce((s, h) => s + scoreHeadline(h), 0);
      const normalizedMomentum = data.periodChange / 5; // normalise to roughly -1..+1 range
      const compositeScore =
        newsScore * cfg.newsWeight + normalizedMomentum * cfg.momentumWeight;
      return { ticker, compositeScore, newsScore, data };
    })
    // Only keep stocks with a positive composite score (buy/watch candidates)
    .filter(s => s.compositeScore > 0)
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .slice(0, 5);

  // ── 3. Build picks ───────────────────────────────────────────────────────
  const picks: FeedPick[] = scored.map(({ ticker, compositeScore, newsScore, data }) => {
    const action: FeedPick['action'] = compositeScore > 1.2 ? 'buy' : 'watch';

    const baseGain = Math.min(compositeScore * 1.5, cfg.maxGain);
    const expectedGainPct = parseFloat(Math.max(0.1, baseGain).toFixed(1));

    const confidence: FeedPick['confidence'] =
      compositeScore > 2 ? 'High' : compositeScore > 1 ? 'Medium' : 'Low';

    const riskLevel: FeedPick['riskLevel'] =
      Math.abs(data.periodChange) > 5 ? 'High' :
      Math.abs(data.periodChange) > 2 ? 'Medium' : 'Low';

    return {
      ticker,
      companyName: data.name,
      action,
      expectedGainPct,
      timeframe,
      confidence,
      catalyst: pickCatalyst(data.headlines, newsScore),
      reasoning: buildReasoning(newsScore, data.periodChange, data.headlines, timeframe),
      riskLevel,
      price: data.price,
      change: data.change,
      changePercent: data.changePercent,
    };
  });

  const result: FeedResult = {
    picks,
    generatedAt: new Date().toISOString(),
    newsCount: totalNews,
    timeframe,
  };

  cacheMap.set(timeframe, { data: result, timestamp: Date.now() });
  return NextResponse.json(result);
}
