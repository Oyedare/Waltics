import { NextResponse } from "next/server";

const HIST_URL = "https://api.llama.fi/v2/historicalChainTvl/Sui";
const CHAINS_URL = "https://api.llama.fi/v2/chains";

export const revalidate = 120;

export async function GET() {
  try {
    const [histRes, chainsRes] = await Promise.all([
      fetch(HIST_URL, { next: { revalidate } }),
      fetch(CHAINS_URL, { next: { revalidate } }),
    ]);
    if (!histRes.ok)
      return NextResponse.json(
        { error: `Upstream hist ${histRes.status}` },
        { status: 502 }
      );
    if (!chainsRes.ok)
      return NextResponse.json(
        { error: `Upstream chains ${chainsRes.status}` },
        { status: 502 }
      );

    const hist: { date: number; tvl: number }[] = await histRes.json();
    const chains: any[] = await chainsRes.json();

    const suiEntry = Array.isArray(chains)
      ? chains.find((c) => (c.name || "").toLowerCase() === "sui")
      : null;
    const chainsTvl =
      typeof suiEntry?.tvl === "number" ? suiEntry.tvl : undefined;

    const sorted = Array.isArray(hist)
      ? hist.slice().sort((a, b) => a.date - b.date)
      : [];
    if (sorted.length < 1) {
      return NextResponse.json({ error: "Insufficient data" }, { status: 500 });
    }
    const latest = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2] ?? latest;
    const tvlForDelta = typeof latest.tvl === "number" ? latest.tvl : 0;
    const prevTvl = typeof prev.tvl === "number" ? prev.tvl : tvlForDelta;
    const changeAbs = tvlForDelta - prevTvl;
    const changePct = prevTvl ? (changeAbs / prevTvl) * 100 : 0;

    const displayTvl = typeof chainsTvl === "number" ? chainsTvl : tvlForDelta;

    return NextResponse.json(
      {
        tvl: displayTvl,
        change24h: changeAbs,
        change24hPercent: changePct,
        latestDate: latest.date,
        prevDate: prev?.date ?? null,
        sources: {
          tvl: typeof chainsTvl === "number" ? "chains" : "historical",
          change: "historical",
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
