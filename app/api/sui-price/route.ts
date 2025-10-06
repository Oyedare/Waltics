import { NextRequest, NextResponse } from 'next/server';

type PriceAndMarketCap = {
    marketCap: number;
    price: number;
    supply: number;
};

export async function GET(request: NextRequest) {
    try {
        const apiKey = process.env.INSIDEX_API_KEY;
        
        if (!apiKey) {
            console.warn('INSIDEX_API_KEY not found in environment variables');
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }
        
        const response = await fetch(
            "https://api-ex.insidex.trade/coins/0x2::sui::SUI/price-and-mc",
            {
                headers: {
                    "x-api-key": apiKey
                }
            }
        );

        if (!response.ok) {
            console.error(`Failed to fetch price data: ${response.statusText}`);
            return NextResponse.json({ error: `Failed to fetch data: ${response.statusText}` }, { status: response.status });
        }

        const data = await response.json();

        const result: PriceAndMarketCap = {
            marketCap: data.marketCap,
            price: data.price,
            supply: data.supply,
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching price data:', error);
        return NextResponse.json({ error: 'Failed to fetch price data' }, { status: 500 });
    }
}