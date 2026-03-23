import { NextResponse } from 'next/server';
import { mockRecommendations } from '@/lib/mockData';
import { getLiveStock } from '@/lib/liveData';

export async function GET() {
  // Enrich recommendations with live price data
  const enriched = await Promise.all(
    mockRecommendations.map(async (rec) => {
      try {
        const live = await getLiveStock(rec.stock.ticker);
        return { ...rec, stock: live };
      } catch {
        return rec; // keep mock data on failure
      }
    })
  );

  return NextResponse.json(enriched);
}
