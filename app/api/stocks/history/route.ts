import { NextRequest, NextResponse } from 'next/server';
import { mockHistory } from '@/lib/mockData';
import { getLiveHistory } from '@/lib/liveData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = (searchParams.get('ticker') || '').toUpperCase();
  const period = searchParams.get('period') || '1M';

  // Try live data first
  try {
    const data = await getLiveHistory(ticker, period);
    if (data.length > 0) return NextResponse.json(data);
  } catch {
    // fall through to mock
  }

  // Mock fallback
  const history = mockHistory[ticker];
  if (!history) return NextResponse.json({ error: 'No history' }, { status: 404 });

  let days: number;
  switch (period) {
    case '1D': days = 1; break;
    case '1W': days = 7; break;
    case '1M': days = 30; break;
    case '3M': days = 90; break;
    case '1Y': days = 365; break;
    default: days = 30;
  }

  const sliced = history.slice(-Math.min(days, history.length));
  return NextResponse.json(sliced);
}
