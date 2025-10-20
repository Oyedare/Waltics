import { NextResponse } from "next/server";

const BASE = "https://yields.llama.fi/pools";

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

    // Extract pools list
    const allPools: any[] = Array.isArray(data?.data) ? data.data : [];

    // Filter for Sui pools and map to cleaner structure
    const suiPools = allPools
      .filter((pool: any) => pool.chain === "Sui")
      .map((pool: any) => ({
        poolId: pool.pool,
        project: pool.project,
        symbol: pool.symbol,
        tvlUsd: pool.tvlUsd ?? 0,
        apy: pool.apy ?? 0,
        apyBase: pool.apyBase ?? 0,
        apyReward: pool.apyReward ?? 0,
        apyPct1D: pool.apyPct1D ?? null,
        apyPct7D: pool.apyPct7D ?? null,
        apyPct30D: pool.apyPct30D ?? null,
        rewardTokens: pool.rewardTokens ?? [],
        stablecoin: pool.stablecoin ?? false,
        ilRisk: pool.ilRisk ?? "no",
        exposure: pool.exposure ?? "single",
        predictions: pool.predictions ?? null,
        underlyingTokens: pool.underlyingTokens ?? [],
        poolMeta: pool.poolMeta ?? null,
      }))
      .sort((a: any, b: any) => b.apy - a.apy); // Sort by APY (highest first)

    // Calculate aggregate stats
    const totalTvl = suiPools.reduce((sum, pool) => sum + pool.tvlUsd, 0);
    const avgApy =
      suiPools.length > 0
        ? suiPools.reduce((sum, pool) => sum + pool.apy, 0) / suiPools.length
        : 0;
    const maxApy =
      suiPools.length > 0 ? Math.max(...suiPools.map((p) => p.apy)) : 0;
    const topPool = suiPools.length > 0 ? suiPools[0] : null;

    return NextResponse.json(
      {
        pools: suiPools,
        stats: {
          totalTvl,
          avgApy,
          maxApy,
          poolCount: suiPools.length,
          topPool,
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
