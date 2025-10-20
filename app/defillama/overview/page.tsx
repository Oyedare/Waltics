"use client";

import { StatCard } from "@/components/stat-card";
import {
  useSuiOverviewTvl,
  useSuiStablecoinMcap,
  useSuiFees24h,
  useSuiRevenue24h,
  useSuiDexs,
  useSuiYields,
  useSuiCurrentPrice,
  useSuiPricePercentage,
} from "@/hooks/use-defillama";
import { DownloadButton } from "@/components/ui/download-button";
import Image from "next/image";

export default function DefillamaOverviewPage() {
  const { data, isLoading, error } = useSuiOverviewTvl();
  const formatCompact = (n: number) => {
    const abs = Math.abs(n);
    if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(3)}B`;
    if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(3)}M`;
    if (abs >= 1_000) return `${(n / 1_000).toFixed(3)}K`;
    return n.toLocaleString();
  };
  const value = isLoading
    ? "Loading..."
    : error
    ? "-"
    : data
    ? formatCompact(data.tvl)
    : "-";
  const isNeg = (data?.change24h ?? 0) < 0;
  const change = data
    ? `${isNeg ? "" : "+"}${data.change24hPercent.toFixed(3)}% (${
        isNeg ? "" : "+"
      }${formatCompact(data.change24h)})`
    : "-";

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Sui Defi Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Sui TVL"
          value={
            <div className="flex flex-col">
              <span>${value}</span>
              <span
                className={`text-xs ${
                  isNeg ? "text-red-600" : "text-green-600"
                }`}
              >
                24h: {change}
              </span>
            </div>
          }
          info="Total Value Locked on Sui and its 24h change."
          elementId="sui-tvl-card"
          filename="sui-tvl-card.png"
        />
        <SuiPriceCard />
        <StablecoinCard formatCompact={formatCompact} />
        <FeesCard formatCompact={formatCompact} />
        <DexVolumeCard formatCompact={formatCompact} />
        <TopYieldCard />
      </div>
      <ProtocolsTable formatCompact={formatCompact} />
    </div>
  );
}

function SuiPriceCard() {
  const { data: priceData, isLoading: priceLoading } = useSuiCurrentPrice();
  const { data: changeData, isLoading: changeLoading } =
    useSuiPricePercentage("24h");

  const price = priceData?.price ?? 0;
  const change = changeData?.change ?? null;
  const isNeg = (change ?? 0) < 0;

  const priceDisplay = priceLoading
    ? "Loading..."
    : price > 0
    ? `$${price.toFixed(4)}`
    : "-";

  const changeDisplay =
    changeLoading || change === null
      ? null
      : `${isNeg ? "" : "+"}${change.toFixed(2)}%`;

  return (
    <StatCard
      title="SUI Price"
      value={
        <div className="flex flex-col">
          <span>{priceDisplay}</span>
          {changeDisplay && (
            <span
              className={`text-xs ${isNeg ? "text-red-600" : "text-green-600"}`}
            >
              24h: {changeDisplay}
            </span>
          )}
        </div>
      }
      info="Current SUI token price and 24h change"
      elementId="sui-price-card"
      filename="sui-price-card.png"
    />
  );
}

function StablecoinCard({
  formatCompact,
}: {
  formatCompact: (n: number) => string;
}) {
  const { data, isLoading, error } = useSuiStablecoinMcap();
  const value = isLoading
    ? "Loading..."
    : error
    ? "-"
    : typeof data?.stablecoinMcapUSD === "number"
    ? formatCompact(data.stablecoinMcapUSD)
    : "-";
  const neg7d = (data?.change7d ?? 0) < 0;
  const change7d = data?.has7dChange
    ? `${neg7d ? "" : "+"}${(data.change7dPercent ?? 0).toFixed(3)}% (${
        neg7d ? "" : "+"
      }${formatCompact(data.change7d ?? 0)})`
    : null;
  return (
    <StatCard
      title="Sui Stablecoin Market Cap"
      value={
        <div className="flex flex-col">
          <span>${value}</span>
          {change7d && (
            <span
              className={`text-xs ${neg7d ? "text-red-600" : "text-green-600"}`}
            >
              7d: {change7d}
            </span>
          )}
        </div>
      }
      info={
        data?.has7dChange
          ? "7d change computed from historical stablecoin charts"
          : "7d change not available from this endpoint"
      }
      elementId="sui-stablecoins-card"
      filename="sui-stablecoins-card.png"
    />
  );
}

function FeesCard({ formatCompact }: { formatCompact: (n: number) => string }) {
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
      elementId="sui-fees-card"
      filename="sui-fees-card.png"
    />
  );
}

function DexVolumeCard({
  formatCompact,
}: {
  formatCompact: (n: number) => string;
}) {
  const { data, isLoading, error } = useSuiDexs();
  const v = isLoading
    ? "Loading..."
    : error
    ? "-"
    : data?.totalVolume.total24h != null
    ? formatCompact(data.totalVolume.total24h)
    : "-";
  const neg = (data?.totalVolume.change1d ?? 0) < 0;
  const ch =
    data?.totalVolume.change1d != null
      ? `${neg ? "" : "+"}${data.totalVolume.change1d.toFixed(3)}%`
      : "-";
  return (
    <StatCard
      title="DEX Volume (24h)"
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
      info="Total DEX trading volume on Sui over the last 24h"
      elementId="sui-dex-volume-card"
      filename="sui-dex-volume-card.png"
    />
  );
}

function TopYieldCard() {
  const { data, isLoading, error } = useSuiYields();
  const topPool = data?.stats?.topPool;
  const maxApy = data?.stats?.maxApy ?? 0;

  const apyDisplay = isLoading
    ? "Loading..."
    : error
    ? "-"
    : maxApy > 0
    ? `${maxApy.toFixed(2)}%`
    : "-";

  return (
    <StatCard
      title="Top Yield (SUI)"
      value={
        <div className="flex flex-col">
          <span>{apyDisplay}</span>
          {topPool && (
            <span className="text-xs text-muted-foreground truncate">
              {topPool.project} • {topPool.symbol}
            </span>
          )}
        </div>
      }
      info="Highest APY yield opportunity available on Sui"
      elementId="sui-top-yield-card"
      filename="sui-top-yield-card.png"
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
        <h3 className="text-lg font-semibold mb-4">Protocol Fees & Revenue</h3>
        <p className="text-sm text-muted-foreground">Loading protocols...</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Protocol Fees & Revenue</h3>
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

  // Show only top 10 protocols on overview
  const topProtocols = protocols.slice(0, 10);

  if (topProtocols.length === 0) {
    return (
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">
          Top Protocols by Fees & Revenue
        </h3>
        <p className="text-sm text-muted-foreground">
          No protocol data available
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4" id="top-protocols-table">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          Top Protocols by Fees & Revenue (24h)
        </h3>
        <div className="flex items-center gap-3">
          <DownloadButton
            elementId="top-protocols-table"
            filename="sui-top-protocols-fees-revenue.png"
          />
          <a
            href="/defillama/fees"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
          >
            View All →
          </a>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr className="text-left">
              <th className="pb-2 font-medium">Protocol</th>
              <th className="pb-2 font-medium">Category</th>
              <th className="pb-2 font-medium text-right">App Fees (24h)</th>
              <th className="pb-2 font-medium text-right">App Revenue (24h)</th>
            </tr>
          </thead>
          <tbody>
            {topProtocols.map((protocol) => {
              const feesNeg = (protocol.feesChange1d ?? 0) < 0;
              const revNeg = (protocol.revenueChange1d ?? 0) < 0;
              return (
                <tr key={protocol.id} className="border-b last:border-0">
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
