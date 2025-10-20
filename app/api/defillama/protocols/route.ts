import { NextResponse } from "next/server";
import { defillama } from "@/lib/defillama";

export const revalidate = 60;

export async function GET() {
  try {
    const data = await defillama.getProtocols();
    const filtered = Array.isArray(data)
      ? data.filter(
          (p: any) => Array.isArray(p.chains) && p.chains.includes("Sui")
        )
      : [];
    return NextResponse.json(filtered, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
