import { NextResponse } from 'next/server';

type PriceAndMarketCap = {
    marketCap: number;
    price: number;
    supply: number;
};

// Mock data for when the external API is unavailable
const mockPriceData: PriceAndMarketCap = {
    marketCap: 234000000, // $234M
    price: 0.0234, // $0.0234
    supply: 10000000000 // 10B WAL
};

export async function GET() {
    try {
        const apiKey = process.env.INSIDEX_API_KEY;
        if (!apiKey) {
            console.warn('INSIDEX_API_KEY not found in environment variables, using mock data');
            return NextResponse.json(mockPriceData);
        }

        const response = await fetch(
            "https://api-ex.insidex.trade/coins/0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL/price-and-mc",
            {
                headers: {
                    "x-api-key": apiKey
                },
                // Add timeout to prevent hanging
                signal: AbortSignal.timeout(10000) // 10 second timeout
            }
        );

        if (!response.ok) {
            console.warn(`Failed to fetch WAL price data: ${response.statusText}, using mock data`);
            return NextResponse.json(mockPriceData);
        }

        const data = await response.json();

        const result: PriceAndMarketCap = {
            marketCap: data.marketCap,
            price: data.price,
            supply: data.supply,
        };

        return NextResponse.json(result);
    } catch (error) {
        console.warn('Error fetching WAL price data, using mock data:', error);
        return NextResponse.json(mockPriceData);
    }
}