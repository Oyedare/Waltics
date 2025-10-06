import { NextResponse } from 'next/server';
import { getAllBluechipMarketData, type BluechipCoin } from '@/coins/blue-chip';

// Simple in-memory cache
let cachedData: BluechipCoin[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function GET() {
  try {
    const now = Date.now();
    
    // Check if we have valid cached data
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('Returning cached bluechip data');
      return NextResponse.json(cachedData, {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600', // 5 min cache, 10 min stale
          'X-Cache-Status': 'HIT'
        }
      });
    }
    
    console.log('Fetching fresh bluechip data...');
    const marketData = await getAllBluechipMarketData();
    
    // Update cache
    cachedData = marketData;
    cacheTimestamp = now;
    
    return NextResponse.json(marketData, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'X-Cache-Status': 'MISS'
      }
    });
  } catch (error) {
    console.error('Error in bluechip-data API:', error);
    
    // If we have cached data, return it even if it's stale
    if (cachedData) {
      console.log('Returning stale cached data due to error');
      return NextResponse.json(cachedData, {
        headers: {
          'Cache-Control': 'public, max-age=60', // Shorter cache for stale data
          'X-Cache-Status': 'STALE'
        }
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch bluechip market data' },
      { status: 500 }
    );
  }
}