import { NextRequest, NextResponse } from 'next/server';

interface OHLCData {
    _id: string;
    open: number;
    high: number;
    low: number;
    close: number;
    suiPrice: number;
    volume: number;
}

export async function GET(request: NextRequest) {
    try {
        const apiKey = process.env.INSIDEX_API_KEY;
        
        if (!apiKey) {
            console.warn('INSIDEX_API_KEY not found in environment variables');
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        // Get current UNIX timestamp in seconds
        const to = Math.floor(Date.now() / 1000);
        // 1 hour ago
        const from = to - 3600;
        // 1 minute resolution
        const resolution = 60;

        const coinType = '0x2::sui::SUI';
        const url = `https://api-ex.insidex.trade/price-feed/coin/${encodeURIComponent(
            coinType
        )}/ohlc?from=${from}&to=${to}&resolution=${resolution}`;

        const response = await fetch(url, {
            headers: {
                'x-api-key': apiKey,
            },
        });

        if (!response.ok) {
            console.error(`OHLC API HTTP error! Status: ${response.status}`);
            return NextResponse.json({ error: `HTTP error! Status: ${response.status}` }, { status: response.status });
        }

        const data: OHLCData[] = await response.json();
        
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching OHLC data:', error);
        return NextResponse.json({ error: 'Failed to fetch OHLC data' }, { status: 500 });
    }
}