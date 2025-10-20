"use client";
import { Card, CardContent} from "@/components/ui/card";
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
import { useLatestMemeLauncherCoins } from "@/hooks/use-latest-meme-launcher-coins";
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
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Nexa</Badge>
            <DownloadButton
              elementId="latest-meme-launcher-table"
              filename="latest-meme-launcher-coins-table.png"
              size="sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div id="latest-meme-launcher-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Coin</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Mkt Cap</TableHead>
                  <TableHead>Holders</TableHead>
                  <TableHead>Bonding</TableHead>
                  <TableHead>Virtual SUI</TableHead>
                  <TableHead>24h Buy Vol</TableHead>
                  <TableHead>24h Sell Vol</TableHead>
                  <TableHead>Coin Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-6 rounded" />
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
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-24" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
          <div id="latest-meme-launcher-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Coin</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Mkt Cap</TableHead>
                  <TableHead>Holders</TableHead>
                  <TableHead>Bonding</TableHead>
                  <TableHead>Virtual SUI</TableHead>
                  <TableHead>24h Buy Vol</TableHead>
                  <TableHead>24h Sell Vol</TableHead>
                  <TableHead>Coin Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coins.map((c) => {
                  const icon = c.iconUrl || c.icon_url;
                  return (
                    <TableRow
                      key={c._id || c.id}
                      id={`meme-launcher-row-${c._id || c.id}`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3 min-w-0">
                          {icon ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={icon}
                              alt={c.symbol}
                              className="h-6 w-6 rounded object-cover"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded bg-accent" />
                          )}
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {c.name}{" "}
                              <span className="text-muted-foreground">
                                ({c.symbol})
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {c.platform ?? ""}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatUsd(c.price)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatMarketCapShort(c.marketCap)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCompactNumber(c.holdersCount)}
                      </TableCell>
                      <TableCell>
                        {formatBondingProgress(c.bondingProgress)}
                      </TableCell>
                      <TableCell>{formatCompactNumber(c.virtualSui)}</TableCell>
                      <TableCell>{formatUsd(c.buyVolume)}</TableCell>
                      <TableCell>{formatUsd(c.sellVolume)}</TableCell>
                      <TableCell>
                        <span
                          className="text-xs text-muted-foreground truncate"
                          title={c.coinType}
                        >
                          {formatCoinTypeShort(c.coinType)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {c.isHoneypot ? (
                            <Badge variant="destructive">Honeypot</Badge>
                          ) : (
                            <Badge variant="outline">Tradable</Badge>
                          )}
                          {c.isMemeZone && (
                            <Badge variant="secondary">Meme Zone</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
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
                                  Use the form on the Safety Check page for a
                                  full report.
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
                          {/* <DownloadButton
                            elementId={`meme-launcher-row-${c._id || c.id}`}
                            filename={`meme-launcher-${(
                              c.symbol || "unknown"
                            ).replace(/[^a-zA-Z0-9]/g, "-")}.png`}
                            size="sm"
                            showText={false}
                          /> */}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
