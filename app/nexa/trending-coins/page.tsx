"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useTrendingCoins } from "@/hooks/use-trending-coins";
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
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
          <div id="trending-coins-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Coin</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>24h Change</TableHead>
                  <TableHead>Mkt Cap</TableHead>
                  <TableHead>Volume 24h</TableHead>
                  <TableHead>Holders</TableHead>
                  <TableHead>Trades 24h</TableHead>
                  <TableHead>Coin Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-24" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Nexa</Badge>
            <DownloadButton
              elementId="trending-coins-table"
              filename="trending-coins-table.png"
              size="sm"
            />
          </div>
        </div>
        <div id="trending-coins-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Coin</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>24h Change</TableHead>
                <TableHead>Mkt Cap</TableHead>
                <TableHead>Volume 24h</TableHead>
                <TableHead>Holders</TableHead>
                <TableHead>Trades 24h</TableHead>
                <TableHead>Coin Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coins.map((coin) => (
                <TableRow key={coin.coinMetadata.coinType}>
                  <TableCell>
                    <div className="flex items-center gap-3 min-w-0">
                      {coin.coinMetadata.iconUrl ||
                      coin.coinMetadata.icon_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={
                            coin.coinMetadata.iconUrl ||
                            coin.coinMetadata.icon_url
                          }
                          alt={coin.coinMetadata.name || "Unknown"}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-accent" />
                      )}
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {coin.coinMetadata.name || "Unknown"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {coin.coinMetadata.symbol || "N/A"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatUSD(coin.price)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        (coin.percentagePriceChange1d ?? 0) >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }
                    >
                      {formatPercentage(coin.percentagePriceChange1d)}
                    </span>
                  </TableCell>
                  <TableCell>{formatMarketCapShort(coin.marketCap)}</TableCell>
                  <TableCell>
                    {formatMarketCapShort(coin.coin1dTradeVolumeUsd)}
                  </TableCell>
                  <TableCell>{formatCompact(coin.holdersCount)}</TableCell>
                  <TableCell>{formatCompact(coin.coin1dTradeCount)}</TableCell>
                  <TableCell>
                    <span
                      className="text-xs text-muted-foreground truncate"
                      title={coin.coinMetadata.coinType || undefined}
                    >
                      {formatCoinTypeShort(coin.coinMetadata.coinType)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button size="sm" variant="secondary">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
