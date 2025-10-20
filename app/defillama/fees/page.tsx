"use client";

import { StatCard } from "@/components/stat-card";
import { useSuiFees24h, useSuiRevenue24h } from "@/hooks/use-defillama";
import { DownloadButton } from "@/components/ui/download-button";
import Image from "next/image";

export default function DefillamaFeesPage() {
  const formatCompact = (n: number) => {
    const abs = Math.abs(n);
    if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(3)}B`;
    if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(3)}M`;
    if (abs >= 1_000) return `${(n / 1_000).toFixed(3)}K`;
    return n.toLocaleString();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Fees & Revenue (Sui)</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ChainFeesCard formatCompact={formatCompact} />
        <TotalProtocolFeesCard formatCompact={formatCompact} />
        <TotalProtocolRevenueCard formatCompact={formatCompact} />
      </div>

      <ProtocolsTable formatCompact={formatCompact} />
    </div>
  );
}

function ChainFeesCard({
  formatCompact,
}: {
  formatCompact: (n: number) => string;
}) {
  const { data, isLoading, error } = useSuiFees24h();
  const v = isLoading
    ? "Loading..."
    : error
    ? "-"
    : data?.chain.total24h != null
    ? formatCompact(data.chain.total24h)
    : "-";
  const neg = (data?.chain.change1d ?? 0) < 0;
  const ch =
    data?.chain.change1d != null
      ? `${neg ? "" : "+"}${data.chain.change1d.toFixed(3)}%`
      : "-";
  return (
    <StatCard
      title="Chain Fees (24h)"
      value={
        <div className="flex flex-col">
          <span>${v}</span>
          <span
            className={`text-xs ${neg ? "text-red-600" : "text-green-600"}`}
          >
            24h: {ch}
          </span>
        </div>
      }
      info="Total fees over the last 24h for Sui chain"
      elementId="sui-chain-fees-card"
      filename="sui-chain-fees-card.png"
    />
  );
}

function TotalProtocolFeesCard({
  formatCompact,
}: {
  formatCompact: (n: number) => string;
}) {
  const { data, isLoading, error } = useSuiFees24h();
  const total =
    data?.protocols?.reduce((sum, p) => sum + (p.total24h || 0), 0) || 0;
  const v = isLoading ? "Loading..." : error ? "-" : formatCompact(total);

  return (
    <StatCard
      title="Total App Fees (24h)"
      value={
        <div className="flex flex-col">
          <span>${v}</span>
        </div>
      }
      info="Sum of all protocol fees over the last 24h"
      elementId="sui-total-app-fees-card"
      filename="sui-total-app-fees-card.png"
    />
  );
}

function TotalProtocolRevenueCard({
  formatCompact,
}: {
  formatCompact: (n: number) => string;
}) {
  const { data, isLoading, error } = useSuiRevenue24h();
  const total =
    data?.protocols?.reduce((sum, p) => sum + (p.total24h || 0), 0) || 0;
  const v = isLoading ? "Loading..." : error ? "-" : formatCompact(total);

  return (
    <StatCard
      title="Total App Revenue (24h)"
      value={
        <div className="flex flex-col">
          <span>${v}</span>
        </div>
      }
      info="Sum of all protocol revenue over the last 24h"
      elementId="sui-total-app-revenue-card"
      filename="sui-total-app-revenue-card.png"
    />
  );
}

function ProtocolsTable({
  formatCompact,
}: {
  formatCompact: (n: number) => string;
}) {
  const {
    data: feesData,
    isLoading: feesLoading,
    error: feesError,
  } = useSuiFees24h();
  const {
    data: revenueData,
    isLoading: revenueLoading,
    error: revenueError,
  } = useSuiRevenue24h();

  const isLoading = feesLoading || revenueLoading;
  const hasError = feesError || revenueError;

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">All Protocols</h3>
        <p className="text-sm text-muted-foreground">Loading protocols...</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">All Protocols</h3>
        <p className="text-sm text-red-600">Error loading protocol data</p>
      </div>
    );
  }

  // Merge fees and revenue data by protocol id
  const protocolsMap = new Map<
    string,
    {
      id: string;
      name: string;
      logo: string | null;
      fees24h: number | null;
      feesChange1d: number | null;
      revenue24h: number | null;
      revenueChange1d: number | null;
      category: string | null;
    }
  >();

  feesData?.protocols?.forEach((p: any) => {
    protocolsMap.set(p.id, {
      id: p.id,
      name: p.name,
      logo: p.logo,
      fees24h: p.total24h,
      feesChange1d: p.change1d,
      revenue24h: null,
      revenueChange1d: null,
      category: p.category,
    });
  });

  revenueData?.protocols?.forEach((p: any) => {
    const existing = protocolsMap.get(p.id);
    if (existing) {
      existing.revenue24h = p.total24h;
      existing.revenueChange1d = p.change1d;
      // Update logo if not present from fees data
      if (!existing.logo && p.logo) {
        existing.logo = p.logo;
      }
    } else {
      protocolsMap.set(p.id, {
        id: p.id,
        name: p.name,
        logo: p.logo,
        fees24h: null,
        feesChange1d: null,
        revenue24h: p.total24h,
        revenueChange1d: p.change1d,
        category: p.category,
      });
    }
  });

  const protocols = Array.from(protocolsMap.values()).sort((a, b) => {
    const aTotal = (a.fees24h || 0) + (a.revenue24h || 0);
    const bTotal = (b.fees24h || 0) + (b.revenue24h || 0);
    return bTotal - aTotal;
  });

  if (protocols.length === 0) {
    return (
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">All Protocols</h3>
        <p className="text-sm text-muted-foreground">
          No protocol data available
        </p>
      </div>
    );
  }

  return (
    <div
      className="border rounded-lg p-4"
      id="all-protocols-fees-revenue-table"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          All Protocols - Fees & Revenue (24h)
        </h3>
        <DownloadButton
          elementId="all-protocols-fees-revenue-table"
          filename="sui-all-protocols-fees-revenue.png"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr className="text-left">
              <th className="pb-2 font-medium">Rank</th>
              <th className="pb-2 font-medium">Protocol</th>
              <th className="pb-2 font-medium">Category</th>
              <th className="pb-2 font-medium text-right">Fees (24h)</th>
              <th className="pb-2 font-medium text-right">Revenue (24h)</th>
            </tr>
          </thead>
          <tbody>
            {protocols.map((protocol, index) => {
              const feesNeg = (protocol.feesChange1d ?? 0) < 0;
              const revNeg = (protocol.revenueChange1d ?? 0) < 0;
              return (
                <tr key={protocol.id} className="border-b last:border-0">
                  <td className="py-3 text-muted-foreground">#{index + 1}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {protocol.logo ? (
                        <Image
                          width={24}
                          height={24}
                          src={protocol.logo}
                          alt={protocol.name}
                          className="w-6 h-6 rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                          {protocol.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span>{protocol.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {protocol.category || "-"}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex flex-col items-end">
                      <span>
                        {protocol.fees24h != null
                          ? `$${formatCompact(protocol.fees24h)}`
                          : "-"}
                      </span>
                      {protocol.feesChange1d != null && (
                        <span
                          className={`text-xs ${
                            feesNeg ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {feesNeg ? "" : "+"}
                          {protocol.feesChange1d.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex flex-col items-end">
                      <span>
                        {protocol.revenue24h != null
                          ? `$${formatCompact(protocol.revenue24h)}`
                          : "-"}
                      </span>
                      {protocol.revenueChange1d != null && (
                        <span
                          className={`text-xs ${
                            revNeg ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {revNeg ? "" : "+"}
                          {protocol.revenueChange1d.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
