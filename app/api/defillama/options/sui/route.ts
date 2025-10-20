import { NextResponse } from "next/server";

const BASE = "https://api.llama.fi/overview/options/sui";
const QS = "excludeTotalDataChart=false&excludeTotalDataChartBreakdown=true";

export const revalidate = 180;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dataType = searchParams.get("dataType") || "dailyNotionalVolume";

    const url = `${BASE}?${QS}&dataType=${dataType}`;
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok)
      return NextResponse.json(
        { error: `Upstream ${res.status}` },
        { status: 502 }
      );
    const data: any = await res.json();

    // Extract protocols list
    const protocols: any[] = Array.isArray(data?.protocols)
      ? data.protocols
      : [];

    // Map protocols to cleaner structure
    const optionsDexs = protocols.map((p: any) => ({
      id: p.id || p.module || p.name,
      name: p.displayName || p.name || p.module,
      logo: p.logo ?? null,
      total24h: p.total24h ?? null,
      total7d: p.total7d ?? null,
      total30d: p.total30d ?? null,
      change1d: p.change_1d ?? null,
      change7d: p.change_7d ?? null,
      change30d: p.change_1m ?? null,
      category: p.category ?? null,
      chains: p.chains ?? [],
    }));

    // Extract total volume data
    const totalVolume = {
      total24h: data.total24h ?? null,
      total7d: data.total7d ?? null,
      total30d: data.total30d ?? null,
      change1d: data.change_1d ?? null,
      change7d: data.change_7d ?? null,
      change30d: data.change_1m ?? null,
    };

    // Extract chart data if available
    const chartData = Array.isArray(data.totalDataChart)
      ? data.totalDataChart.map((point: any) => ({
          date: point[0],
          volume: point[1],
        }))
      : [];

    return NextResponse.json(
      {
        totalVolume,
        protocols: optionsDexs,
        chartData,
        chain: data.chain || "Sui",
        dataType,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
