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

// Mock OHLC data for when the external API is unavailable
function generateMockOHLCData(): OHLCData[] {
    const now = Math.floor(Date.now() / 1000);
    const basePrice = 0.0234;
    const data: OHLCData[] = [];
    
    // Generate 60 data points for the last hour (1 minute intervals)
    for (let i = 59; i >= 0; i--) {
        const timestamp = now - (i * 60);
        const variation = (Math.random() - 0.5) * 0.002; // ±0.001 variation
        const price = basePrice + variation;
        const volume = Math.floor(Math.random() * 10000) + 1000;
        
        data.push({
            _id: timestamp.toString(),
            open: price * (0.995 + Math.random() * 0.01),
            high: price * (1.002 + Math.random() * 0.008),
            low: price * (0.992 + Math.random() * 0.008),
            close: price,
            suiPrice: 4.2 + (Math.random() - 0.5) * 0.5, // Mock SUI price around $4.2
            volume: volume
        });
    }
    
    return data;
}

export async function GET(request: NextRequest) {
    try {
        const apiKey = process.env.INSIDEX_API_KEY;
        
        if (!apiKey) {
            console.warn('INSIDEX_API_KEY not found in environment variables, using mock data');
            return NextResponse.json(generateMockOHLCData());
        }

        // Get current UNIX timestamp in seconds
        const to = Math.floor(Date.now() / 1000);
        // 1 hour ago
        const from = to - 3600;
        // 1 minute resolution
        const resolution = 60;

        const coinType = '0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL';
        const url = `https://api-ex.insidex.trade/price-feed/coin/${encodeURIComponent(
            coinType
        )}/ohlc?from=${from}&to=${to}&resolution=${resolution}`;

        const response = await fetch(url, {
            headers: {
                'x-api-key': apiKey,
            },
            // Add timeout to prevent hanging
            signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        if (!response.ok) {
            console.warn(`OHLC API HTTP error! Status: ${response.status}, using mock data`);
            return NextResponse.json(generateMockOHLCData());
        }

        const data: OHLCData[] = await response.json();
        
        return NextResponse.json(data);
    } catch (error) {
        console.warn('Error fetching Walrus OHLC data, using mock data:', error);
        return NextResponse.json(generateMockOHLCData());
    }
}