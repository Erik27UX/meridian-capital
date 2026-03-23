import { NextRequest, NextResponse } from 'next/server';
import { mockNews } from '@/lib/mockData';
import { NewsArticle } from '@/types';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

function formatAgeString(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = (searchParams.get('ticker') || '').toUpperCase();

  // Return rich mock news for tickers we have curated data for
  if (mockNews[ticker]) {
    return NextResponse.json(mockNews[ticker]);
  }

  // Fall back to real Yahoo Finance news for all other tickers
  try {
    const result = await yahooFinance.search(ticker, { quotesCount: 0, newsCount: 6 });
    const articles: NewsArticle[] = (result.news ?? []).map((a: Record<string, unknown>, i: number) => {
      const publishedDate = a.providerPublishTime instanceof Date
        ? a.providerPublishTime
        : new Date((a.providerPublishTime as number) * 1000 || Date.now());

      return {
        id: `yf-${ticker}-${i}`,
        headline: (a.title as string) ?? '',
        source: (a.publisher as string) ?? 'Yahoo Finance',
        publishedAt: formatAgeString(publishedDate),
        url: (a.link as string) ?? '#',
        sentiment: 'neutral' as const,
        summary: `Latest news about ${ticker} from ${(a.publisher as string) ?? 'Yahoo Finance'}.`,
        relevance: 0.7,
      };
    }).filter((a: NewsArticle) => a.headline);

    return NextResponse.json(articles);
  } catch {
    return NextResponse.json([]);
  }
}
