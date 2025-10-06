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
import { useTrendingCoins, TrendingCoin } from "@/hooks/use-trending-coins";
import { DownloadButton } from "@/components/ui/download-button";

function formatCompact(num: number | undefined | null): string {
  if (num == null || isNaN(num)) return "0";
  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return num.toFixed(0);
}

function formatUSD(num: number | undefined | null): string {
  if (num == null || isNaN(num)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(num);
}

function formatMarketCapShort(num: number | undefined | null): string {
  if (num == null || isNaN(num)) return "$0";
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

function formatCoinTypeShort(coinType: string | undefined | null): string {
  if (!coinType) return "Unknown";
  return coinType.length > 20 ? `${coinType.slice(0, 20)}...` : coinType;
}

function formatPercentage(num: number | undefined | null): string {
  if (num == null || isNaN(num)) return "+0.00%";
  const sign = num >= 0 ? "+" : "";
  return `${sign}${num.toFixed(2)}%`;
}

export default function NexaTrendingCoinsPage() {
  const { data, isLoading, isError, error } = useTrendingCoins();
  const coins = useMemo(() => data ?? [], [data]);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8">
        <div className="mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">
              Trending Coins
            </h1>
            <Badge variant="secondary">Nexa</Badge>
          </div>
          <div className="text-center">
            <p className="text-destructive">Error loading trending coins</p>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (coins.length === 0) {
    return (
      <div className="p-8">
        <div className="mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">
              Trending Coins
            </h1>
            <Badge variant="secondary">Nexa</Badge>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">No trending coins found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Trending Coins</h1>
          <Badge variant="secondary">Nexa</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {coins.map((coin) => (
            <Card
              key={coin.coinMetadata.coinType}
              id={`trending-coin-card-${(
                coin.coinMetadata.symbol || "unknown"
              ).replace(/[^a-zA-Z0-9]/g, "-")}`}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {(coin.coinMetadata.iconUrl ||
                      coin.coinMetadata.icon_url) && (
                      <img
                        src={
                          coin.coinMetadata.iconUrl ||
                          coin.coinMetadata.icon_url
                        }
                        alt={coin.coinMetadata.name || "Unknown"}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="text-lg font-semibold">
                      {coin.coinMetadata.name || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {coin.coinMetadata.symbol || "N/A"}
                    </Badge>
                    <DownloadButton
                      elementId={`trending-coin-card-${(
                        coin.coinMetadata.symbol || "unknown"
                      ).replace(/[^a-zA-Z0-9]/g, "-")}`}
                      filename={`trending-coin-${(
                        coin.coinMetadata.symbol || "unknown"
                      ).replace(/[^a-zA-Z0-9]/g, "-")}.png`}
                      size="sm"
                      showText={false}
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Price</span>
                    <span className="font-mono">{formatUSD(coin.price)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      24h Change
                    </span>
                    <span
                      className={`font-mono ${
                        (coin.percentagePriceChange1d ?? 0) >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatPercentage(coin.percentagePriceChange1d)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Market Cap
                    </span>
                    <span className="font-mono">
                      {formatMarketCapShort(coin.marketCap)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Volume 24h
                    </span>
                    <span className="font-mono">
                      {formatMarketCapShort(coin.coin1dTradeVolumeUsd)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Holders
                    </span>
                    <span className="font-mono">
                      {formatCompact(coin.holdersCount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Trades 24h
                    </span>
                    <span className="font-mono">
                      {formatCompact(coin.coin1dTradeCount)}
                    </span>
                  </div>
                  <div className="pt-2">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" className="w-full">
                          Safety Check
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>
                            Safety Check for{" "}
                            {coin.coinMetadata.name || "Unknown"}
                          </SheetTitle>
                        </SheetHeader>
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground mb-2">
                            Coin Type:{" "}
                            {formatCoinTypeShort(coin.coinMetadata.coinType)}
                          </p>
                          <Button
                            onClick={() => {
                              if (coin.coinMetadata.coinType) {
                                window.open(
                                  `/nexa/safety-check?coinType=${encodeURIComponent(
                                    coin.coinMetadata.coinType
                                  )}`,
                                  "_blank"
                                );
                              }
                            }}
                            className="w-full"
                            disabled={!coin.coinMetadata.coinType}
                          >
                            Open Safety Check
                          </Button>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
