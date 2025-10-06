"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DownloadButton } from "@/components/ui/download-button";

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
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((it, idx) => {
              const m = it.coinMetadata;
              const icon = m?.iconUrl;
              const isUp = (it.priceChange4h ?? 0) >= 0;
              return (
                <Card
                  key={`${m?.id || it.coin}-${idx}`}
                  id={`top-gainer-card-${(m?.symbol || "unknown").replace(
                    /[^a-zA-Z0-9]/g,
                    "-"
                  )}-${idx}`}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="space-y-2">
                    <div className="flex items-center gap-3">
                      {icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={icon}
                          alt={m?.symbol || ""}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-accent" />
                      )}
                      <div className="min-w-0 flex-1">
                        <CardTitle className="truncate flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1">
                            {m?.name}{" "}
                            <span className="text-muted-foreground">
                              ({m?.symbol})
                            </span>
                          </div>
                          <DownloadButton
                            elementId={`top-gainer-card-${(
                              m?.symbol || "unknown"
                            ).replace(/[^a-zA-Z0-9]/g, "-")}-${idx}`}
                            filename={`top-gainer-${(
                              m?.symbol || "unknown"
                            ).replace(/[^a-zA-Z0-9]/g, "-")}.png`}
                            size="sm"
                            showText={false}
                          />
                        </CardTitle>
                        <div className="text-xs text-muted-foreground truncate">
                          {formatCoinTypeShort(m?.coinType ?? it.coin)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="rounded-md border p-2 text-center">
                      <div className="text-xs text-muted-foreground">
                        4h Change
                      </div>
                      <div
                        className={`font-semibold ${
                          isUp
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {formatPercent(it.priceChange4h)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-md border p-2">
                        <div className="text-xs text-muted-foreground">
                          Price
                        </div>
                        <div className="font-medium">{it.price ?? "-"}</div>
                      </div>
                      <div className="rounded-md border p-2">
                        <div className="text-xs text-muted-foreground">
                          4h Ago
                        </div>
                        <div className="font-medium">
                          {it.price4hAgo ?? "-"}
                        </div>
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
