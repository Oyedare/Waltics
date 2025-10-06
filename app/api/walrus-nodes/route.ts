import { NextResponse } from 'next/server';

// Define the interface for the API response
interface WalrusNodeData {
  nodeUrl: string;
  nodeName: string;
  nodeStatus: string;
  walruscanUrl: string;
  geo: {
    country: string;
    region: string;
    city: string;
  };
}

interface WalrusNodeWithLocation extends WalrusNodeData {
  loc?: string; // latitude,longitude format
}

async function fetchWalrusNodes(): Promise<WalrusNodeData[]> {

  try {
    const response = await fetch('https://walrus5-gucco4za.b4a.run/health');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: any = await response.json();
    
    // The API returns an object with a 'nodes' property containing the array
    if (!data.success || !Array.isArray(data.nodes)) {
      throw new Error('Invalid API response structure');
    }
    
    return data.nodes.map((node: any) => {
      return {
        nodeUrl: node.nodeUrl || 'Unknown',
        nodeName: node.nodeName || 'Unknown', 
        nodeStatus: node.nodeStatus || 'Unknown',
        walruscanUrl: node.walruscanUrl || '',
        geo: {
          country: node.geo?.country || 'Unknown',
          region: node.geo?.region || 'Unknown',
          city: node.geo?.city || 'Unknown'
        }
      };
     });
  } catch (error) {
    console.error('Error fetching Walrus nodes:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const nodes = await fetchWalrusNodes();
    // Add location coordinates from the geo data that's already included
    const nodesWithLocation: WalrusNodeWithLocation[] = nodes.map(node => ({
      ...node,
      // For now, we'll use placeholder coordinates since the API doesn't provide lat/lng
      // In a real implementation, you'd geocode the city/country to get coordinates
      loc: '0,0' // This should be replaced with actual coordinates based on geo data
    }));
    
    return NextResponse.json(nodesWithLocation);
  } catch (error) {
    console.error('Error fetching Walrus node data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Walrus node data' },
      { status: 500 }
    );
  }
}