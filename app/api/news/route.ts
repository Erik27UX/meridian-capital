import { NextRequest, NextResponse } from 'next/server';
import { mockNews } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = (searchParams.get('ticker') || '').toUpperCase();

  // Return mock news — Yahoo Finance doesn't provide sentiment-tagged news
  // so mock data with sentiment/relevance scores is more useful for our model
  const articles = mockNews[ticker];
  if (!articles) return NextResponse.json([]);

  return NextResponse.json(articles);
}
