"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DownloadButton } from "@/components/ui/download-button";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

type TopGainer = {
  coin?: string;
  pool?: string;
  price?: number;
  price4hAgo?: number;
  priceChange4h?: number;
  coinMetadata?: {
    _id?: string;
    coinType?: string;
    decimals?: number;
    iconUrl?: string;
    id?: string;
    name?: string;
    supply?: number;
    symbol?: string;
  };
};

function useTopGainers() {
  return useQuery<TopGainer[]>({
    queryKey: ["nexa", "top-gainers"],
    queryFn: async () => {
      const res = await fetch(
        "/api/proxy/external-api/insidex/coins/top-gainers",
        {
          headers: { accept: "application/json" },
          cache: "no-store",
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Request failed: ${res.status}`);
      }
      return res.json();
    },
    staleTime: 30_000,
  });
}

function formatPercent(v?: number) {
  if (typeof v !== "number" || Number.isNaN(v)) return "-";
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
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

export default function NexaTopGainersPage() {
  const { data, isLoading, isError, error } = useTopGainers();
  const items = data ?? [];

  return (
    <div className="p-8">
      <div className="mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Top Gainers</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Nexa</Badge>
            <DownloadButton
              elementId="top-gainers-table"
              filename="top-gainers-table.png"
              size="sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div id="top-gainers-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Coin</TableHead>
                  <TableHead>4h Change</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>4h Ago</TableHead>
                  <TableHead>Coin Type</TableHead>
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
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
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
        ) : isError ? (
          <Card className="border-destructive/40">
            <CardContent className="p-6 text-destructive">
              {error?.message || "Failed to load data"}
            </CardContent>
          </Card>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-muted-foreground">
              No data available.
            </CardContent>
          </Card>
        ) : (
          <div id="top-gainers-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Coin</TableHead>
                  <TableHead>4h Change</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>4h Ago</TableHead>
                  <TableHead>Coin Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it, idx) => {
                  const m = it.coinMetadata;
                  const icon = m?.iconUrl;
                  const isUp = (it.priceChange4h ?? 0) >= 0;
                  return (
                    <TableRow
                      key={`${m?.id || it.coin}-${idx}`}
                      id={`top-gainer-row-${idx}`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3 min-w-0">
                          {icon ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={icon}
                              alt={m?.symbol || ""}
                              className="h-6 w-6 rounded object-cover"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded bg-accent" />
                          )}
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {m?.name}{" "}
                              <span className="text-muted-foreground">
                                ({m?.symbol})
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-semibold ${
                            isUp
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {formatPercent(it.priceChange4h)}
                        </span>
                      </TableCell>
                      <TableCell>{it.price ?? "-"}</TableCell>
                      <TableCell>{it.price4hAgo ?? "-"}</TableCell>
                      <TableCell>
                        <span
                          className="text-xs text-muted-foreground truncate"
                          title={m?.coinType ?? it.coin}
                        >
                          {formatCoinTypeShort(m?.coinType ?? it.coin)}
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
                              <SheetTitle>Safety Check</SheetTitle>
                            </SheetHeader>
                            <div className="p-4 text-sm">
                              <p className="mb-2 text-muted-foreground break-all">
                                {m?.coinType ?? it.coin}
                              </p>
                              <p className="mb-4">
                                Use the form on the Safety Check page for a full
                                report.
                              </p>
                              <a
                                className="underline text-primary"
                                href={`/nexa/safety-check?coinType=${encodeURIComponent(
                                  m?.coinType ?? it.coin ?? ""
                                )}`}
                              >
                                Open Safety Check Page →
                              </a>
                            </div>
                          </SheetContent>
                        </Sheet>
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
