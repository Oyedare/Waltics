import { NextResponse } from "next/server";

const BASE = "https://stablecoins.llama.fi/stablecoincharts/Sui";

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

    // Extract historical chart data
    const chartData = Array.isArray(data)
      ? data.map((point: any) => ({
          date: point.date,
          totalCirculating: point.totalCirculating?.peggedUSD || 0,
        }))
      : [];

    // Calculate 7d change if we have enough data
    let change7d = null;
    if (chartData.length > 7) {
      const latest = chartData[chartData.length - 1]?.totalCirculating || 0;
      const weekAgo = chartData[chartData.length - 8]?.totalCirculating || 0;
      if (weekAgo > 0) {
        change7d = ((latest - weekAgo) / weekAgo) * 100;
      }
    }

    return NextResponse.json(
      {
        chartData,
        change7d,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
