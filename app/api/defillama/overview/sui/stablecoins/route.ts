import { NextResponse } from "next/server";

// Use historical charts endpoint to get current and 7d change
const URL = "https://stablecoins.llama.fi/stablecoincharts/sui";

export const revalidate = 300;

export async function GET() {
  try {
    const res = await fetch(URL, { next: { revalidate } });
    if (!res.ok)
      return NextResponse.json(
        { error: `Upstream ${res.status}` },
        { status: 502 }
      );

    const rows: any[] = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No data" }, { status: 500 });
    }

    // Extract mcap from totalCirculatingUSD.peggedUSD
    const sorted = rows
      .filter((r) => r?.totalCirculatingUSD?.peggedUSD != null)
      .map((r) => ({
        date: Number(r.date),
        value: Number(r.totalCirculatingUSD.peggedUSD),
      }))
      .sort((a, b) => a.date - b.date);

    if (sorted.length === 0) {
      return NextResponse.json({ error: "No peggedUSD data" }, { status: 500 });
    }

    const latest = sorted[sorted.length - 1];
    // find point ~7 days (7*86400 seconds) before; pick the closest earlier
    const targetTs = latest.date - 7 * 86400;
    let prev = sorted[0];
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (sorted[i].date <= targetTs) {
        prev = sorted[i];
        break;
      }
    }

    const current = latest.value;
    const prevVal = prev?.value ?? current;
    const change7d = current - prevVal;
    const change7dPercent = prevVal ? (change7d / prevVal) * 100 : 0;

    return NextResponse.json(
      {
        stablecoinMcapUSD: current,
        has7dChange: true,
        change7d,
        change7dPercent,
        latestDate: latest.date,
        baseDate: prev?.date ?? null,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
