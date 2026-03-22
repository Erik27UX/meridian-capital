import { NextResponse } from 'next/server';
import { mockRecommendations } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json(mockRecommendations);
}
