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

type Row = {
  _id?: string;
  coin?: string;
  tradeCount?: number;
  volume?: number;
  volumeUsd?: number;
};

function useTopTradeCount() {
  return useQuery<Row[]>({
    queryKey: ["nexa", "top-trade-count"],
    queryFn: async () => {
      const res = await fetch(
        "/api/proxy/external-api/insidex/coins/top-trade-count",
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

function formatUsd(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function NexaTopTradeCountPage() {
  const { data, isLoading, isError, error } = useTopTradeCount();
  const rows = data ?? [];

  return (
    <div className="p-8">
      <div className="mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">
            Top Trade Count
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Nexa</Badge>
            <DownloadButton
              elementId="top-trade-count-table"
              filename="top-trade-count-table.png"
              size="sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div id="top-trade-count-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Coin</TableHead>
                  <TableHead>Trades</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Volume USD</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-64" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
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
        ) : rows.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-muted-foreground">
              No data available.
            </CardContent>
          </Card>
        ) : (
          <div id="top-trade-count-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Coin</TableHead>
                  <TableHead>Trades</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Volume USD</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, idx) => (
                  <TableRow
                    key={`${r._id || r.coin}-${idx}`}
                    id={`trade-count-row-${idx}`}
                  >
                    <TableCell>
                      <span className="truncate" title={r.coin}>
                        {formatCoinTypeShort(r.coin)}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {r.tradeCount ?? "-"}
                    </TableCell>
                    <TableCell>{r.volume ?? "-"}</TableCell>
                    <TableCell>{formatUsd(r.volumeUsd)}</TableCell>
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
                              {r.coin}
                            </p>
                            <p className="mb-4">
                              Use the form on the Safety Check page for a full
                              report.
                            </p>
                            <a
                              className="underline text-primary"
                              href={`/nexa/safety-check?coinType=${encodeURIComponent(
                                r.coin || ""
                              )}`}
                            >
                              Open Safety Check Page →
                            </a>
                          </div>
                        </SheetContent>
                      </Sheet>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
