"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  useLatestMemeLauncherCoins,
  LatestMemeLauncherCoin,
} from "@/hooks/use-latest-meme-launcher-coins";
import { DownloadButton } from "@/components/ui/download-button";

function formatCompactNumber(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatUsd(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 6,
  }).format(value);
}

function formatMarketCapShort(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toLocaleString();
}

function formatCoinTypeShort(value?: string) {
  if (!value) return "-";
  const parts = value.split("::");
  const addr = parts[0] || value;
  const rest = parts.slice(1).join("::");
  let short = addr;
  if (addr.startsWith("0x") && addr.length > 14) {
    short = `${addr.slice(0, 8)}…${addr.slice(-6)}`;
  }
  return rest ? `${short}::${rest}` : short;
}

function formatBondingProgress(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return `${(value * 100).toFixed(2)}%`;
}

export default function NexaLatestMemeLauncherPage() {
  const { data, isLoading, isError, error } = useLatestMemeLauncherCoins();

  const coins = useMemo(() => data ?? [], [data]);

  return (
    <div className="p-8">
      <div className="mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">
            Latest Meme Launcher Coins
          </h1>
          <Badge variant="secondary">Nexa</Badge>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex-row items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <div className="grid grid-cols-3 gap-3">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <Card className="border-destructive/40">
            <CardContent className="p-6">
              <div className="text-destructive">
                {error?.message || "Failed to load data"}
              </div>
            </CardContent>
          </Card>
        ) : coins.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-muted-foreground">
              No data available.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coins.map((c) => {
              const icon = c.iconUrl || c.icon_url;
              return (
                <Card
                  key={c._id || c.id}
                  id={`meme-launcher-card-${c._id || c.id}`}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {icon ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={icon}
                            alt={c.symbol}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-accent" />
                        )}
                        <div className="min-w-0">
                          <CardTitle className="truncate">
                            {c.name}{" "}
                            <span className="text-muted-foreground">
                              ({c.symbol})
                            </span>
                          </CardTitle>
                          <div className="text-xs text-muted-foreground truncate">
                            {c.platform ?? ""}
                          </div>
                        </div>
                      </div>
                      <DownloadButton
                        elementId={`meme-launcher-card-${c._id || c.id}`}
                        filename={`meme-launcher-${(
                          c.symbol || "unknown"
                        ).replace(/[^a-zA-Z0-9]/g, "-")}.png`}
                        size="sm"
                        showText={false}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {c.description ? (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {c.description}
                      </p>
                    ) : null}

                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="rounded-md border p-2 text-center">
                        <div className="text-xs text-muted-foreground">
                          Price
                        </div>
                        <div className="font-semibold">
                          {formatUsd(c.price)}
                        </div>
                      </div>
                      <div className="rounded-md border p-2 text-center">
                        <div className="text-xs text-muted-foreground">
                          Mkt Cap
                        </div>
                        <div className="font-semibold">
                          {formatMarketCapShort(c.marketCap)}
                        </div>
                      </div>
                      <div className="rounded-md border p-2 text-center">
                        <div className="text-xs text-muted-foreground">
                          Holders
                        </div>
                        <div className="font-semibold">
                          {formatCompactNumber(c.holdersCount)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-md border p-2">
                        <div className="text-xs text-muted-foreground">
                          Bonding Progress
                        </div>
                        <div className="font-medium">
                          {formatBondingProgress(c.bondingProgress)}
                        </div>
                      </div>
                      <div className="rounded-md border p-2">
                        <div className="text-xs text-muted-foreground">
                          Virtual SUI
                        </div>
                        <div className="font-medium">
                          {formatCompactNumber(c.virtualSui)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-md border p-2">
                        <div className="text-xs text-muted-foreground">
                          24h Buy Vol
                        </div>
                        <div className="font-medium">
                          {formatUsd(c.buyVolume)}
                        </div>
                      </div>
                      <div className="rounded-md border p-2">
                        <div className="text-xs text-muted-foreground">
                          24h Sell Vol
                        </div>
                        <div className="font-medium">
                          {formatUsd(c.sellVolume)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="truncate" title={c.coinType}>
                        {formatCoinTypeShort(c.coinType)}
                      </span>
                      <div className="flex items-center gap-2">
                        {c.isHoneypot ? (
                          <Badge variant="destructive">Honeypot</Badge>
                        ) : (
                          <Badge variant="outline">Tradable</Badge>
                        )}
                        {c.isMemeZone && (
                          <Badge variant="secondary">Meme Zone</Badge>
                        )}
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button size="sm" variant="secondary">
                              Safety Check
                            </Button>
                          </SheetTrigger>
                          <SheetContent side="right">
                            <SheetHeader>
                              <SheetTitle>Safety Check</SheetTitle>
                            </SheetHeader>
                            <div className="p-4 text-sm">
                              <p className="mb-2 text-muted-foreground break-all">
                                {c.coinType}
                              </p>
                              <p className="mb-4">
                                Use the form on the Safety Check page for a full
                                report.
                              </p>
                              <a
                                className="underline text-primary"
                                href={`/nexa/safety-check?coinType=${encodeURIComponent(
                                  c.coinType || ""
                                )}`}
                              >
                                Open Safety Check Page →
                              </a>
                            </div>
                          </SheetContent>
                        </Sheet>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
