import { NextResponse } from "next/server";

const BASE_URL = "https://spot.api.sui-prod.bluefin.io/external-api/insidex";

export async function GET() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_NEXA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let upstream: Response;
    try {
      upstream = await fetch(`${BASE_URL}/coins/trending`, {
        headers: {
          "x-api-key": apiKey,
          accept: "application/json",
        },
        signal: controller.signal,
      });
    } catch (error: any) {
      if (error.name === "AbortError") {
        return NextResponse.json({ error: "Request timeout" }, { status: 408 });
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!upstream.ok) {
      const errorText = await upstream.text();
      console.error("Upstream error:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch trending coins" },
        { status: upstream.status }
      );
    }

    const data = await upstream.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error: any) {
    console.error("Error fetching trending coins:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
