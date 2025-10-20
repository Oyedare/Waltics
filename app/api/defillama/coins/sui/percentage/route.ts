import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "24h";

    const response = await fetch(
      `https://coins.llama.fi/percentage/coingecko:sui?period=${period}`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`DeFiLlama API error: ${response.status}`);
    }

    const data = await response.json();
    const suiData = data.coins?.["coingecko:sui"];

    if (!suiData) {
      return NextResponse.json({
        change: null,
        period,
      });
    }

    return NextResponse.json({
      change: suiData,
      period,
    });
  } catch (error) {
    console.error("Error fetching SUI percentage change:", error);
    return NextResponse.json(
      { error: "Failed to fetch SUI percentage change" },
      { status: 500 }
    );
  }
}
