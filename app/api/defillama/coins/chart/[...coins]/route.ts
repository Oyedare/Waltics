import { NextResponse } from "next/server";
import { defillama } from "@/lib/defillama";

export const revalidate = 120;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ coins: string[] }> }
) {
  try {
    const { coins } = await params;
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") as any;
    const span = searchParams.get("span");
    const searchWidth = searchParams.get("searchWidth") || undefined;
    const coinsCsv = (coins || []).join(",");
    if (!coinsCsv) {
      return NextResponse.json(
        { error: "coins are required" },
        { status: 400 }
      );
    }
    const data = await defillama.getChart(coinsCsv, {
      period: period || undefined,
      span: span ? Number(span) : undefined,
      searchWidth,
    });
    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
