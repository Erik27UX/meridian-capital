import { NextRequest, NextResponse } from 'next/server';
import { mockNews } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = (searchParams.get('ticker') || '').toUpperCase();

  const articles = mockNews[ticker];
  if (!articles) return NextResponse.json([]);

  return NextResponse.json(articles);
}
