"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DownloadButton } from "@/components/ui/download-button";

type QualityRow = {
  _id?: string;
  averageAgeOfHolders?: number;
  coin?: string;
  holderQualityScore?: number;
  holdersWithProminentNft?: number;
  holdersWithSuiNs?: number;
};

function useTopHolderQuality() {
  return useQuery<QualityRow[]>({
    queryKey: ["nexa", "top-holder-quality"],
    queryFn: async () => {
      const res = await fetch(
        "/api/proxy/external-api/insidex/coins/top-holder-quality-score",
        { headers: { accept: "application/json" }, cache: "no-store" }
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

export default function NexaTopHolderQualityPage() {
  const { data, isLoading, isError, error } = useTopHolderQuality();
  const rows = data ?? [];

  return (
    <div className="p-8">
      <div className="mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">
            Top Holder Quality Score
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
        ) : rows.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-muted-foreground">
              No data available.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rows.map((r, idx) => (
              <Card
                key={`${r._id || r.coin}-${idx}`}
                id={`holder-quality-card-${idx}`}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="truncate">
                    {formatCoinTypeShort(r.coin)}
                  </CardTitle>
                  <DownloadButton
                    elementId={`holder-quality-card-${idx}`}
                    filename={`holder-quality-${formatCoinTypeShort(
                      r.coin
                    ).replace(/[^a-zA-Z0-9]/g, "-")}.png`}
                    size="sm"
                    showText={false}
                  />
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="rounded-md border p-2">
                    <div className="text-xs text-muted-foreground">
                      Holder Quality Score
                    </div>
                    <div className="font-semibold">
                      {r.holderQualityScore ?? "-"}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-md border p-2">
                      <div className="text-xs text-muted-foreground">
                        Avg Holder Age
                      </div>
                      <div className="font-medium">
                        {r.averageAgeOfHolders ?? "-"}
                      </div>
                    </div>
                    <div className="rounded-md border p-2">
                      <div className="text-xs text-muted-foreground">
                        With SuiNS
                      </div>
                      <div className="font-medium">
                        {r.holdersWithSuiNs ?? "-"}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-md border p-2">
                    <div className="text-xs text-muted-foreground">
                      With Prominent NFT
                    </div>
                    <div className="font-medium">
                      {r.holdersWithProminentNft ?? "-"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
