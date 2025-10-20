"use client";

import { useState, useEffect, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DownloadButton } from "@/components/ui/download-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

type SafetyResponse = {
  coinDev?: string;
  coinSupply?: number;
  amountBurned?: number;
  timeCreated?: number;
  burntLpPosition?: {
    _id?: string;
    coinA?: string;
    coinB?: string;
    pool?: string;
    id?: string;
    timestamp?: number;
    platform?: string;
    sender?: string;
    digest?: string;
  };
  burntLpAmounts?: {
    _id?: string;
    coinA?: string;
    coinB?: string;
    pool?: string;
    id?: string;
    timestamp?: number;
    platform?: string;
    sender?: string;
    digest?: string;
    amountA?: number;
    amountB?: number;
  }[];
  coinMetadata?: {
    coinType?: string;
    name?: string;
    symbol?: string;
    description?: string;
    iconUrl?: string;
    twitter?: string;
    website?: string;
    discord?: string;
    createdAt?: number;
    lastTradeAt?: string;
    supply?: number;
    dev?: string;
  };
  devsOldestTransactionTimestamp?: number;
  suspiciousActivities?: unknown[];
  coinPrice?: number;
  top10HoldersPercent?: number;
  amountInLiquidity?: number;
  coinDevHoldings?: number;
};

function useSafetyCheck(coinType: string) {
  return useQuery<SafetyResponse>({
    queryKey: ["nexa", "safety-check", coinType],
    enabled: !!coinType,
    queryFn: async () => {
      const res = await fetch(
        `/api/proxy/external-api/insidex/coins/${encodeURIComponent(
          coinType
        )}/safety-check`,
        { headers: { accept: "application/json" }, cache: "no-store" }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Request failed: ${res.status}`);
      }
      return res.json();
    },
    staleTime: 15_000,
  });
}

function formatPercent(v?: number) {
  if (typeof v !== "number" || Number.isNaN(v)) return "-";
  return `${(v * 100).toFixed(2)}%`;
}

function formatCompact(v?: number) {
  if (typeof v !== "number" || Number.isNaN(v)) return "-";
  return new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(v);
}

function SafetyCheckContent() {
  const searchParams = useSearchParams();
  const [coinType, setCoinType] = useState("");
  const [submitted, setSubmitted] = useState("");
  const { data, isLoading, isError, error, refetch, isFetching } =
    useSafetyCheck(submitted);

  // Auto-populate from URL parameters
  useEffect(() => {
    const urlCoinType = searchParams.get("coinType");
    if (urlCoinType) {
      setCoinType(urlCoinType);
      setSubmitted(urlCoinType);
    }
  }, [searchParams]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(coinType.trim());
    if (coinType.trim()) {
      refetch();
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Safety Check</h1>
          <Badge variant="secondary">Nexa</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Check a coin by Coin Type</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="flex gap-2">
              <Input
                placeholder="e.g. 0x...::module::SYMBOL"
                value={coinType}
                onChange={(e) => setCoinType(e.target.value)}
              />
              <Button type="submit" disabled={!coinType.trim() || isFetching}>
                {isFetching ? "Checking..." : "Check"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {submitted ? (
          isLoading ? (
            <Card>
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-1/2" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              </CardContent>
            </Card>
          ) : isError ? (
            <Card className="border-destructive/40">
              <CardContent className="p-6 text-destructive">
                {error?.message || "Failed to load safety data"}
              </CardContent>
            </Card>
          ) : data ? (
            <Card id="safety-check-result-card">
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  {data.coinMetadata?.iconUrl ? (
                    <Image
                      width={24}
                      height={24}
                      src={data.coinMetadata.iconUrl}
                      alt={data.coinMetadata?.symbol || ""}
                      className="h-8 w-8 rounded"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded bg-accent" />
                  )}
                  <span>
                    {data.coinMetadata?.name}{" "}
                    <span className="text-muted-foreground">
                      ({data.coinMetadata?.symbol})
                    </span>
                  </span>
                </CardTitle>
                <DownloadButton
                  elementId="safety-check-result-card"
                  filename={`safety-check-${(
                    data.coinMetadata?.symbol || "unknown"
                  ).replace(/[^a-zA-Z0-9]/g, "-")}.png`}
                  size="sm"
                  showText={false}
                />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">
                      Top 10 Holders
                    </div>
                    <div className="font-semibold">
                      {formatPercent(data.top10HoldersPercent)}
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">
                      Amount Burned
                    </div>
                    <div className="font-semibold">
                      {formatCompact(data.amountBurned)}
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">
                      In Liquidity
                    </div>
                    <div className="font-semibold">
                      {formatCompact(data.amountInLiquidity)}
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">
                      Dev Holdings
                    </div>
                    <div className="font-semibold">
                      {formatCompact(data.coinDevHoldings)}
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">Price</div>
                    <div className="font-semibold">{data.coinPrice ?? "-"}</div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">Supply</div>
                    <div className="font-semibold">
                      {formatCompact(data.coinSupply)}
                    </div>
                  </div>
                </div>

                {data.burntLpPosition ? (
                  <div className="rounded-md border p-3">
                    <div className="text-sm font-medium mb-2">
                      Burned LP (latest)
                    </div>
                    <div className="text-xs text-muted-foreground break-all">
                      Pool: {data.burntLpPosition.pool}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Platform: {data.burntLpPosition.platform}
                    </div>
                  </div>
                ) : null}

                {Array.isArray(data.burntLpAmounts) &&
                data.burntLpAmounts.length > 0 ? (
                  <div className="rounded-md border p-3">
                    <div className="text-sm font-medium mb-2">
                      Burned LP Amounts
                    </div>
                    <div className="space-y-2 text-xs">
                      {data.burntLpAmounts.slice(0, 5).map((lp, idx) => (
                        <div
                          key={`${lp._id}-${idx}`}
                          className="flex items-center justify-between"
                        >
                          <span className="truncate" title={lp.pool}>
                            Pool: {lp.pool}
                          </span>
                          <span>AmtA: {formatCompact(lp.amountA)}</span>
                          <span>AmtB: {formatCompact(lp.amountB)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {Array.isArray(data.suspiciousActivities) &&
                data.suspiciousActivities.length > 0 ? (
                  <div className="rounded-md border p-3">
                    <div className="text-sm font-medium mb-2">
                      Suspicious Activities
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {data.suspiciousActivities.length} flags
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border p-3 text-sm text-muted-foreground">
                    No suspicious activities reported.
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null
        ) : null}
      </div>
    </div>
  );
}

export default function NexaSafetyCheckPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading…</div>}>
      <SafetyCheckContent />
    </Suspense>
  );
}
