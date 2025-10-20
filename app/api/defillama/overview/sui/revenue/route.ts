import { NextResponse } from "next/server";

const BASE = "https://api.llama.fi/overview/fees/sui";
const QS =
  "excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true&dataType=dailyRevenue";

export const revalidate = 180;

export async function GET() {
  try {
    const url = `${BASE}?${QS}`;
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok)
      return NextResponse.json(
        { error: `Upstream ${res.status}` },
        { status: 502 }
      );
    const data: any = await res.json();

    // Use chain-only entry (id 'chain#sui' or protocolType 'chain' for Sui)
    const protocols: any[] = Array.isArray(data?.protocols)
      ? data.protocols
      : [];
    const chainEntry =
      protocols.find((p: any) => p?.id === "chain#sui") ||
      protocols.find(
        (p: any) =>
          p?.protocolType === "chain" &&
          ((typeof p?.name === "string" && p.name.toLowerCase() === "sui") ||
            (typeof p?.displayName === "string" &&
              p.displayName.toLowerCase() === "sui") ||
            (typeof p?.module === "string" &&
              p.module.toLowerCase() === "sui") ||
            (Array.isArray(p?.chains) && p.chains.includes("Sui")))
      );

    const total24h: number | undefined =
      typeof chainEntry?.total24h === "number"
        ? chainEntry.total24h
        : undefined;
    const change1d: number | undefined =
      typeof chainEntry?.change_1d === "number"
        ? chainEntry.change_1d
        : undefined;

    // NOTE: DeFiLlama's revenue endpoint does NOT have chain-level revenue data
    // Only protocol-level revenue exists. Chain revenue would show "burned coins"
    // but this data is not available in the dailyRevenue dataType.
    // Return null to indicate chain revenue is not available.

    // Extract app/protocol data (exclude chain entry)
    const appProtocols = protocols
      .filter(
        (p: any) =>
          p?.protocolType !== "chain" &&
          p?.id !== "chain#sui" &&
          p?.total24h !== undefined
      )
      .map((p: any) => ({
        id: p.id || p.module || p.name,
        name: p.displayName || p.name || p.module,
        logo: p.logo ?? null,
        total24h: p.total24h,
        change1d: p.change_1d ?? null,
        category: p.category ?? null,
        chains: p.chains ?? [],
      }));

    return NextResponse.json(
      {
        chain: {
          total24h: total24h ?? null,
          change1d: change1d ?? null,
        },
        protocols: appProtocols,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
