import { NextResponse } from "next/server";
import { defillama } from "@/lib/defillama";

export const revalidate = 300;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object" || !body.coins) {
      return NextResponse.json(
        { error: "Body { coins: { [coin]: [timestamps] } } required" },
        { status: 400 }
      );
    }
    const data = await defillama.postBatchHistorical(body);
    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
