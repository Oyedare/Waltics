import { NextResponse } from "next/server";
import { defillama } from "@/lib/defillama";

export const revalidate = 300;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ timestamp: string; coins: string[] }> }
) {
  try {
    const { timestamp: timestampStr, coins } = await params;
    const { searchParams } = new URL(req.url);
    const searchWidth = searchParams.get("searchWidth");
    const coinsCsv = (coins || []).join(",");
    const timestamp = Number(timestampStr);
    if (!coinsCsv || !Number.isFinite(timestamp)) {
      return NextResponse.json(
        { error: "timestamp and coins are required" },
        { status: 400 }
      );
    }
    const data = await defillama.getHistoricalPrices(
      timestamp,
      coinsCsv,
      searchWidth ? Number(searchWidth) : undefined
    );
    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
