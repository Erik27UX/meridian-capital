import YahooFinance from 'yahoo-finance2';
import { Stock, HistoricalDataPoint, Timeframe } from '@/types';

// v3 requires instantiation
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

// ─── Quote ───────────────────────────────────────────────────────────────────

export async function getLiveQuote(ticker: string) {
  const q = await yahooFinance.quote(ticker);
  return {
    ticker: q.symbol,
    price: q.regularMarketPrice ?? 0,
    open: q.regularMarketOpen ?? 0,
    high: q.regularMarketDayHigh ?? 0,
    low: q.regularMarketDayLow ?? 0,
    volume: q.regularMarketVolume ?? 0,
    previousClose: q.regularMarketPreviousClose ?? 0,
    change: q.regularMarketChange ?? 0,
    changePercent: q.regularMarketChangePercent ?? 0,
    name: q.shortName ?? q.longName ?? q.symbol,
    marketCap: q.marketCap ?? 0,
  };
}

// ─── Full Stock object with changesByPeriod ──────────────────────────────────

export async function getLiveStock(ticker: string): Promise<Stock> {
  const [q, changesByPeriod] = await Promise.all([
    getLiveQuote(ticker),
    getChangesByPeriod(ticker),
  ]);
  // Use the quote's daily % for 1D (more accurate than historical close diff)
  changesByPeriod['1D'] = q.changePercent;
  return {
    ticker: q.ticker,
    name: q.name,
    price: q.price,
    change: q.change,
    changePercent: q.changePercent,
    volume: q.volume,
    marketCap: q.marketCap,
    changesByPeriod,
  };
}

// ─── Historical data ─────────────────────────────────────────────────────────

const PERIOD_MAP: Record<string, { period1: string; interval: '1d' | '1wk' | '1mo' }> = {
  '1D': { period1: '2d', interval: '1d' },
  '1W': { period1: '7d', interval: '1d' },
  '1M': { period1: '1mo', interval: '1d' },
  '3M': { period1: '3mo', interval: '1d' },
  '1Y': { period1: '1y', interval: '1d' },
};

export async function getLiveHistory(ticker: string, period: string): Promise<HistoricalDataPoint[]> {
  const cfg = PERIOD_MAP[period] ?? PERIOD_MAP['1M'];

  const now = new Date();
  const start = new Date();
  switch (cfg.period1) {
    case '2d': start.setDate(now.getDate() - 2); break;
    case '7d': start.setDate(now.getDate() - 7); break;
    case '1mo': start.setMonth(now.getMonth() - 1); break;
    case '3mo': start.setMonth(now.getMonth() - 3); break;
    case '1y': start.setFullYear(now.getFullYear() - 1); break;
  }

  const result = await yahooFinance.chart(ticker, {
    period1: start,
    period2: now,
    interval: cfg.interval,
  });

  return (result.quotes ?? [])
    .filter((d: Record<string, unknown>) => d.close != null)
    .map((d: Record<string, unknown>) => ({
      date: new Date(d.date as string | number).toISOString().split('T')[0],
      open: (d.open as number) ?? 0,
      high: (d.high as number) ?? 0,
      low: (d.low as number) ?? 0,
      close: d.close as number,
      volume: (d.volume as number) ?? 0,
    }));
}

// ─── Changes by period (computed from historical closes) ─────────────────────

export async function getChangesByPeriod(ticker: string): Promise<Partial<Record<Timeframe, number>>> {
  try {
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    const result = await yahooFinance.chart(ticker, {
      period1: oneYearAgo,
      period2: now,
      interval: '1d',
    });

    const quotes = (result.quotes ?? []).filter((d: Record<string, unknown>) => d.close != null);
    if (quotes.length < 2) return {};

    const latest = quotes[quotes.length - 1].close as number;
    const getClose = (daysAgo: number): number | null => {
      const idx = Math.max(0, quotes.length - 1 - daysAgo);
      return (quotes[idx]?.close as number) ?? null;
    };

    const pct = (prev: number | null): number | undefined => {
      if (prev == null || prev === 0) return undefined;
      return ((latest - prev) / prev) * 100;
    };

    // YTD: find first trading day of this year
    const yearStart = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    const ytdIdx = quotes.findIndex((q: Record<string, unknown>) => {
      const d = new Date(q.date as string | number).toISOString().split('T')[0];
      return d >= yearStart;
    });
    const ytdClose = ytdIdx >= 0 ? (quotes[ytdIdx].close as number) : null;

    return {
      '1D': pct(getClose(1)),
      '1W': pct(getClose(5)),
      '1M': pct(getClose(21)),
      '3M': pct(getClose(63)),
      '1Y': pct(getClose(quotes.length - 1)),
      'YTD': pct(ytdClose),
    } as Partial<Record<Timeframe, number>>;
  } catch {
    return {};
  }
}

// ─── Search ──────────────────────────────────────────────────────────────────

export async function searchLiveStocks(query: string): Promise<Stock[]> {
  const result = await yahooFinance.search(query, { quotesCount: 8, newsCount: 0 });

  const symbols = (result.quotes ?? [])
    .filter((q: Record<string, unknown>) =>
      (q.quoteType === 'EQUITY' || q.quoteType === 'ETF') && q.symbol
    )
    .map((q: Record<string, unknown>) => q.symbol as string)
    .slice(0, 6);

  if (symbols.length === 0) return [];

  const stocks: Stock[] = [];
  await Promise.all(
    symbols.map(async (sym) => {
      try {
        const q = await getLiveQuote(sym);
        stocks.push({
          ticker: q.ticker,
          name: q.name,
          price: q.price,
          change: q.change,
          changePercent: q.changePercent,
          volume: q.volume,
          marketCap: q.marketCap,
        });
      } catch {
        // skip failed quotes
      }
    })
  );

  return stocks;
}
