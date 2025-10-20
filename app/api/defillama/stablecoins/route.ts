import { NextResponse } from "next/server";

const BASE = "https://stablecoins.llama.fi/stablecoins";

export const revalidate = 300; // 5 minutes

export async function GET() {
  try {
    const res = await fetch(BASE, { next: { revalidate } });
    if (!res.ok)
      return NextResponse.json(
        { error: `Upstream ${res.status}` },
        { status: 502 }
      );
    const data: any = await res.json();

    // Extract stablecoins list
    const stablecoins: any[] = Array.isArray(data?.peggedAssets)
      ? data.peggedAssets
      : [];

    // Filter and map stablecoins that have Sui chain data
    const suiStablecoins = stablecoins
      .filter((sc: any) => {
        const chainCirculating = sc?.chainCirculating || {};
        return chainCirculating["Sui"]?.current?.peggedUSD !== undefined;
      })
      .map((sc: any) => {
        const suiCirculating =
          sc.chainCirculating?.["Sui"]?.current?.peggedUSD || 0;
        const price = sc.price || 1; // Default to $1 for stablecoins
        const marketCap = suiCirculating; // Already in USD

        return {
          id: sc.id,
          name: sc.name,
          symbol: sc.symbol,
          logo: sc.logo ?? null,
          circulatingSui: suiCirculating,
          price: price,
          marketCap: marketCap,
          pegType: sc.pegType ?? null,
          pegMechanism: sc.pegMechanism ?? null,
        };
      })
      .filter((sc: any) => sc.marketCap > 0) // Only include stablecoins with actual mcap
      .sort((a: any, b: any) => b.marketCap - a.marketCap); // Sort by market cap

    // Calculate total market cap
    const totalMarketCap = suiStablecoins.reduce(
      (sum: number, sc: any) => sum + sc.marketCap,
      0
    );

    return NextResponse.json(
      {
        stablecoins: suiStablecoins,
        totalMarketCap,
        count: suiStablecoins.length,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
