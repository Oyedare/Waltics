import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";
    const span = searchParams.get("span") || "100";

    const response = await fetch(
      `https://coins.llama.fi/chart/coingecko:sui?period=${period}&span=${span}`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`DeFiLlama API error: ${response.status}`);
    }

    const data = await response.json();
    const suiData = data.coins?.["coingecko:sui"];

    if (!suiData || !suiData.prices) {
      return NextResponse.json(
        { error: "SUI chart data not found" },
        { status: 404 }
      );
    }

    // Transform to our format
    const chartData = suiData.prices.map((item: any) => ({
      timestamp: item.timestamp,
      price: item.price,
    }));

    return NextResponse.json({
      symbol: suiData.symbol,
      confidence: suiData.confidence,
      chartData,
    });
  } catch (error) {
    console.error("Error fetching SUI chart:", error);
    return NextResponse.json(
      { error: "Failed to fetch SUI chart data" },
      { status: 500 }
    );
  }
}
