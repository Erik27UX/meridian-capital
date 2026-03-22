import { NextRequest, NextResponse } from 'next/server';
import { mockStocks } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const ticker = searchParams.get('ticker');

  if (ticker) {
    const upper = ticker.toUpperCase();
    const stock = mockStocks[upper];
    if (!stock) return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    return NextResponse.json({
      ticker: stock.ticker,
      price: stock.price,
      open: stock.price * 0.99,
      high: stock.price * 1.01,
      low: stock.price * 0.98,
      volume: stock.volume,
      previousClose: stock.price - stock.change,
      change: stock.change,
      changePercent: stock.changePercent,
    });
  }

  if (query) {
    const q = query.toUpperCase();
    const results = Object.values(mockStocks).filter(
      s => s.ticker.includes(q) || s.name.toUpperCase().includes(q)
    );
    return NextResponse.json(results);
  }

  return NextResponse.json(Object.values(mockStocks));
}
