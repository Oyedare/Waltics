import { NextResponse } from "next/server";

const BASE_URL = "https://spot.api.sui-prod.bluefin.io/external-api/insidex";

export async function GET() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_NEXA_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_NEXA_API_KEY" },
        { status: 500 }
      );
    }

    const RETRYABLE_STATUS = new Set([502, 503, 504]);
    const maxRetries = 2;
    const baseTimeoutMs = 20000;

    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    let upstream: Response | null = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), baseTimeoutMs);
      try {
        upstream = await fetch(`${BASE_URL}/coins/latest-created`, {
          headers: {
            "x-api-key": apiKey,
            accept: "application/json",
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (upstream.ok || !RETRYABLE_STATUS.has(upstream.status)) {
          break;
        }
        if (attempt < maxRetries) {
          await delay(500 * Math.pow(2, attempt));
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        const isTimeout = err?.name === "AbortError";
        if (attempt < maxRetries) {
          await delay(500 * Math.pow(2, attempt));
          continue;
        }
        const message = isTimeout
          ? "Upstream request timed out"
          : err?.message || "Upstream request failed";
        return NextResponse.json({ error: message }, { status: 504 });
      }
    }

    if (!upstream) {
      return NextResponse.json(
        { error: "No response from upstream" },
        { status: 504 }
      );
    }

    if (!upstream.ok) {
      let details: string | undefined;
      try {
        details = await upstream.text();
      } catch {}
      return NextResponse.json(
        {
          error: `Upstream error: ${upstream.status} ${upstream.statusText}`,
          details,
        },
        { status: upstream.status }
      );
    }

    const data = await upstream.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=30, stale-while-revalidate=120",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to fetch latest-created-coins",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
