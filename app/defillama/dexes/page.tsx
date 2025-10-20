"use client";

import { useState } from "react";
import { StatCard } from "@/components/stat-card";
import { useSuiDexs } from "@/hooks/use-defillama";
import { useTheme } from "next-themes";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DownloadButton } from "@/components/ui/download-button";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DefillamaDexesPage() {
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
        <h2 className="text-xl font-semibold">DEX Volume (Sui)</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <TotalVolume24hCard formatCompact={formatCompact} />
        <TotalVolume7dCard formatCompact={formatCompact} />
        <ActiveDexsCard />
      </div>

      <VolumeChart formatCompact={formatCompact} />

      <DexsTable formatCompact={formatCompact} />
    </div>
  );
}

function TotalVolume24hCard({
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
      ? `${neg ? "" : "+"}${data.totalVolume.change1d.toFixed(2)}%`
      : "-";
  return (
    <StatCard
      title="Total Volume (24h)"
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
      elementId="sui-dex-total-24h-card"
      filename="sui-dex-total-24h-card.png"
    />
  );
}

function TotalVolume7dCard({
  formatCompact,
}: {
  formatCompact: (n: number) => string;
}) {
  const { data, isLoading, error } = useSuiDexs();
  const v = isLoading
    ? "Loading..."
    : error
    ? "-"
    : data?.totalVolume.total7d != null
    ? formatCompact(data.totalVolume.total7d)
    : "-";
  const neg = (data?.totalVolume.change7d ?? 0) < 0;
  const ch =
    data?.totalVolume.change7d != null
      ? `${neg ? "" : "+"}${data.totalVolume.change7d.toFixed(2)}%`
      : "-";
  return (
    <StatCard
      title="Total Volume (7d)"
      value={
        <div className="flex flex-col">
          <span>${v}</span>
          <span
            className={`text-xs ${neg ? "text-red-600" : "text-green-600"}`}
          >
            7d: {ch}
          </span>
        </div>
      }
      info="Total DEX trading volume on Sui over the last 7 days"
      elementId="sui-dex-total-7d-card"
      filename="sui-dex-total-7d-card.png"
    />
  );
}

function ActiveDexsCard() {
  const { data, isLoading, error } = useSuiDexs();
  const count = isLoading
    ? "Loading..."
    : error
    ? "-"
    : data?.dexs?.length?.toString() ?? "-";
  return (
    <StatCard
      title="Active DEXs"
      value={<span>{count}</span>}
      info="Number of active decentralized exchanges on Sui"
      elementId="sui-active-dexs-card"
      filename="sui-active-dexs-card.png"
    />
  );
}

function VolumeChart({
  formatCompact,
}: {
  formatCompact: (n: number) => string;
}) {
  const { data, isLoading, error } = useSuiDexs();
  const { theme } = useTheme();
  const [period, setPeriod] = useState<"7d" | "30d">("30d");

  const chartData = data?.chartData ?? [];
  const now = Date.now() / 1000;
  const cutoff = period === "7d" ? now - 7 * 86400 : now - 30 * 86400;
  const filteredData = chartData
    .filter((point) => point.date >= cutoff)
    .map((point) => ({
      timestamp: point.date * 1000,
      volume: point.volume,
    }));

  const strokeColor = theme === "dark" ? "#3b82f6" : "#2563eb";
  const cursorColor = theme === "dark" ? "#64748b" : "#cbd5e1";

  return (
    <div className="border rounded-lg p-4" id="dex-volume-chart">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <h3 className="text-lg font-semibold">Volume History</h3>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 border rounded-md p-1">
            <button
              onClick={() => setPeriod("7d")}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                period === "7d"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setPeriod("30d")}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                period === "30d"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              30D
            </button>
          </div>
          <DownloadButton
            elementId="dex-volume-chart"
            filename="sui-dex-volume-chart.png"
          />
        </div>
      </div>

      <div className="h-[300px]">
        {isLoading ? (
          <div className="h-full rounded-md bg-muted animate-pulse" />
        ) : error ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            Failed to load chart
          </div>
        ) : filteredData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={strokeColor}
                    stopOpacity={0.25}
                  />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                cursor={{ stroke: cursorColor, strokeDasharray: "2 6" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border border-border rounded-md shadow-lg p-2 text-xs">
                        <div className="text-muted-foreground mb-1">
                          {new Date(data.timestamp).toLocaleDateString()}
                        </div>
                        <div className="font-semibold">
                          ${formatCompact(data.volume)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
                wrapperStyle={{ outline: "none" }}
              />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(ts) =>
                  new Date(ts).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })
                }
                tick={{
                  fontSize: 11,
                  fill: theme === "dark" ? "#A0A0A0" : "#666666",
                }}
                axisLine={false}
                tickLine={false}
                minTickGap={40}
              />
              <YAxis
                tickFormatter={(val) => `$${formatCompact(val)}`}
                tick={{
                  fontSize: 11,
                  fill: theme === "dark" ? "#A0A0A0" : "#666666",
                }}
                axisLine={false}
                tickLine={false}
                width={70}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke={strokeColor}
                strokeWidth={2}
                fill="url(#volumeGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function DexsTable({
  formatCompact,
}: {
  formatCompact: (n: number) => string;
}) {
  const { data, isLoading, error } = useSuiDexs();

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">All DEXs</h3>
        <p className="text-sm text-muted-foreground">Loading DEXs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">All DEXs</h3>
        <p className="text-sm text-red-600">Error loading DEX data</p>
      </div>
    );
  }

  const dexs = data?.dexs ?? [];

  if (dexs.length === 0) {
    return (
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">All DEXs</h3>
        <p className="text-sm text-muted-foreground">No DEX data available</p>
      </div>
    );
  }

  // Sort by 24h volume
  const sortedDexs = [...dexs].sort(
    (a, b) => (b.total24h || 0) - (a.total24h || 0)
  );

  return (
    <div className="border rounded-lg p-4" id="all-dexs-sui-table">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <h3 className="text-lg font-semibold">All DEXs on Sui</h3>
        <DownloadButton
          elementId="all-dexs-sui-table"
          filename="sui-all-dexs.png"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>DEX</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Volume (24h)</TableHead>
            <TableHead className="text-right">Volume (7d)</TableHead>
            <TableHead className="text-right">24h Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDexs.map((dex, index) => {
            const neg = (dex.change1d ?? 0) < 0;
            return (
              <TableRow key={dex.id}>
                <TableCell className="text-muted-foreground">
                  #{index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {dex.logo ? (
                      <Image
                        width={24}
                        height={24}
                        src={dex.logo}
                        alt={dex.name}
                        className="w-6 h-6 rounded-full"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                        {dex.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium">{dex.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {dex.category || "-"}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {dex.total24h != null
                    ? `$${formatCompact(dex.total24h)}`
                    : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {dex.total7d != null ? `$${formatCompact(dex.total7d)}` : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {dex.change1d != null ? (
                    <span
                      className={`${neg ? "text-red-600" : "text-green-600"}`}
                    >
                      {neg ? "" : "+"}
                      {dex.change1d.toFixed(2)}%
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
