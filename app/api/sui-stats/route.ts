import { NextResponse } from 'next/server';
import { fetchSuiStats } from '@/sui/chainstats';

export async function GET() {
  try {
    const stats = await fetchSuiStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in sui-stats API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Sui stats' },
      { status: 500 }
    );
  }
}