import { NextResponse } from "next/server";
import { defillama } from "@/lib/defillama";

export const revalidate = 600;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ coins: string[] }> }
) {
  try {
    const { coins } = await params;
    const coinsCsv = (coins || []).join(",");
    if (!coinsCsv) {
      return NextResponse.json(
        { error: "coins are required" },
        { status: 400 }
      );
    }
    const data = await defillama.getFirstPrice(coinsCsv);
    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
