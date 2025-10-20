import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://coins.llama.fi/prices/current/coingecko:sui",
      {
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    );

    if (!response.ok) {
      throw new Error(`DeFiLlama API error: ${response.status}`);
    }

    const data = await response.json();
    const suiData = data.coins?.["coingecko:sui"];

    if (!suiData) {
      return NextResponse.json(
        { error: "SUI price data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      price: suiData.price,
      symbol: suiData.symbol,
      timestamp: suiData.timestamp,
      confidence: suiData.confidence,
    });
  } catch (error) {
    console.error("Error fetching SUI price:", error);
    return NextResponse.json(
      { error: "Failed to fetch SUI price" },
      { status: 500 }
    );
  }
}
