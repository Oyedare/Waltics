import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const size = searchParams.get('size') || '1';
        const unit = searchParams.get('unit') || 'GB';
        
        // Forward the request to the correct API endpoint
        const response = await fetch(`https://walrus5-gucco4za.b4a.run/api/walrus/storage-costs?size=${size}&unit=${unit}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // Add timeout to prevent hanging
            signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch storage costs: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.warn('Error fetching storage costs:', error);
        
        // Return mock data as fallback
        const size = new URL(request.url).searchParams.get('size') || '1';
        const unit = new URL(request.url).searchParams.get('unit') || 'GB';
        const sizeNum = parseFloat(size);
        
        // Calculate mock costs based on size using realistic values
        const baseCostPerGB = 0.003664; // Base cost for 1GB per day
        let multiplier = 1;
        
        if (unit === 'TB') {
            multiplier = 1000;
        } else if (unit === 'MB') {
            multiplier = 0.001;
        }
        
        const dailyCost = baseCostPerGB * sizeNum * multiplier;
        
        const mockData = {
            success: true,
            input: {
                size: sizeNum,
                unit: unit
            },
            costs: {
                oneDay: parseFloat(dailyCost.toFixed(6)),
                oneEpoch: parseFloat((dailyCost * 14).toFixed(6)), // 1 epoch = 14 days
                oneMonth: parseFloat((dailyCost * 42).toFixed(6)), // Approximate month
                oneYear: parseFloat((dailyCost * 365).toFixed(6))
            },
            currency: "WAL",
            note: "1 epoch = 14 days"
        };
        
        return NextResponse.json(mockData);
    }
}