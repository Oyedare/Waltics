import { NextResponse } from 'next/server';

// Mock data for when the external API is unavailable
const mockData = {
    walTokenPrice: 0.00432669,
    marketCap: 0,
    totalSupply: 5000000000,
    networkStats: {
        storageUtilization: 18.563768774476802,
        usedCapacityTB: 773.4903656032,
        totalCapacityPB: 4.166666666666666,
        storagePools: "123"
    },
    networkConfig: {
        currentEpoch: 10,
        epochDurationHours: 336,
        nShards: 1000
    },
    storagePricing: {
        storagePricePerMB: "11000",
        writePricePerMB: "20000"
    },
    lastUpdated: new Date().toISOString(),
    fromCache: true,
    stale: false
};

export async function GET() {
    try {
        const response = await fetch('https://walrus5-gucco4za.b4a.run/api/walrus/overview-cached', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // Add timeout to prevent hanging
            signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch Walrus overview data: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Transform the API response to match the expected format
        const transformedData = {
            used_capacity_size: (data.networkStats.usedCapacityTB * 1000 * 1000 * 1000 * 1000).toString(), // Convert TB to bytes
            n_shards: data.networkConfig.nShards,
            epoch_duration: (data.networkConfig.epochDurationHours * 60 * 60 * 1000).toString(), // Convert hours to ms
            epoch: data.networkConfig.currentEpoch,
            pool_size: parseInt(data.networkStats.storagePools),
            total_capacity_size: (data.networkStats.totalCapacityPB * 1000 * 1000 * 1000 * 1000 * 1000).toString(), // Convert PB to bytes
            storage_price_per_unit_size: data.storagePricing.storagePricePerMB,
            write_price_per_unit_size: data.storagePricing.writePricePerMB,
        };

        return NextResponse.json(transformedData);
    } catch (error) {
        console.warn('External Walrus API unavailable, using mock data:', error);
        
        // Use mock data when external API fails
        const transformedData = {
            used_capacity_size: (mockData.networkStats.usedCapacityTB * 1000 * 1000 * 1000 * 1000).toString(), // Convert TB to bytes
            n_shards: mockData.networkConfig.nShards,
            epoch_duration: (mockData.networkConfig.epochDurationHours * 60 * 60 * 1000).toString(), // Convert hours to ms
            epoch: mockData.networkConfig.currentEpoch,
            pool_size: parseInt(mockData.networkStats.storagePools),
            total_capacity_size: (mockData.networkStats.totalCapacityPB * 1000 * 1000 * 1000 * 1000 * 1000).toString(), // Convert PB to bytes
            storage_price_per_unit_size: mockData.storagePricing.storagePricePerMB,
            write_price_per_unit_size: mockData.storagePricing.writePricePerMB,
        };

        return NextResponse.json(transformedData);
    }
}