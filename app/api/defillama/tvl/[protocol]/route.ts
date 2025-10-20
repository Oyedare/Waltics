import { NextResponse } from "next/server";
import { defillama } from "@/lib/defillama";

export const revalidate = 60;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ protocol: string }> }
) {
  try {
    const { protocol } = await params;
    if (!protocol) {
      return NextResponse.json(
        { error: "protocol is required" },
        { status: 400 }
      );
    }
    const tvl = await defillama.getProtocolTvl(protocol);
    // Return consistent JSON shape for clients
    return NextResponse.json({ tvl }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
