import { NextResponse } from "next/server";
import { defillama } from "@/lib/defillama";

export const revalidate = 600;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ chain: string; timestamp: string }> }
) {
  try {
    const { chain, timestamp: timestampStr } = await params;
    const timestamp = Number(timestampStr);
    if (!chain || !Number.isFinite(timestamp)) {
      return NextResponse.json(
        { error: "chain and timestamp are required" },
        { status: 400 }
      );
    }
    const data = await defillama.getBlockAt(chain, timestamp);
    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
