"use client";

import { useState } from "react";
import { StatCard } from "@/components/stat-card";
import {
  useSuiStablecoins,
  useSuiStablecoinsHistory,
} from "@/hooks/use-defillama";
import { useTheme } from "next-themes";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DownloadButton } from "@/components/ui/download-button";
import Image from "next/image";

export default function DefillamaStablecoinsPage() {
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
        <h2 className="text-xl font-semibold">Stablecoins (Sui)</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TotalMarketCapCard formatCompact={formatCompact} />
        <ActiveStablecoinsCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MarketCapChart formatCompact={formatCompact} />
        <DominanceChart />
      </div>

      <StablecoinsTable formatCompact={formatCompact} />
    </div>
  );
}

function TotalMarketCapCard({
  formatCompact,
}: {
  formatCompact: (n: number) => string;
}) {
  const { data, isLoading, error } = useSuiStablecoins();
  const { data: historyData } = useSuiStablecoinsHistory();

  const v = isLoading
    ? "Loading..."
    : error
    ? "-"
    : data?.totalMarketCap != null
    ? formatCompact(data.totalMarketCap)
    : "-";

  const change = historyData?.change7d ?? null;
  const neg = (change ?? 0) < 0;
  const ch = change != null ? `${neg ? "" : "+"}${change.toFixed(2)}%` : null;

  return (
    <StatCard
      title="Total Stablecoin MCap"
      value={
        <div className="flex flex-col">
          <span>${v}</span>
          {ch && (
            <span
              className={`text-xs ${neg ? "text-red-600" : "text-green-600"}`}
            >
              7d: {ch}
            </span>
          )}
        </div>
      }
      info="Total market capitalization of all stablecoins on Sui with 7-day change"
      elementId="sui-stablecoins-mcap-card"
      filename="sui-stablecoins-mcap-card.png"
    />
  );
}

function ActiveStablecoinsCard() {
  const { data, isLoading, error } = useSuiStablecoins();
  const count = isLoading
    ? "Loading..."
    : error
    ? "-"
    : data?.count?.toString() ?? "-";
  return (
    <StatCard
      title="Active Stablecoins"
      value={<span>{count}</span>}
      info="Number of different stablecoins on Sui"
      elementId="sui-active-stablecoins-card"
      filename="sui-active-stablecoins-card.png"
    />
  );
}

function MarketCapChart({
  formatCompact,
}: {
  formatCompact: (n: number) => string;
}) {
  const { data, isLoading, error } = useSuiStablecoinsHistory();
  const { theme } = useTheme();
  const [period, setPeriod] = useState<"30d" | "90d" | "180d">("90d");

  const chartData = data?.chartData ?? [];
  const now = Date.now() / 1000;
  const daysMap = { "30d": 30, "90d": 90, "180d": 180 };
  const cutoff = now - daysMap[period] * 86400;

  const filteredData = chartData
    .filter((point) => point.date >= cutoff)
    .map((point) => ({
      timestamp: point.date * 1000,
      mcap: point.totalCirculating,
    }));

  const strokeColor = theme === "dark" ? "#10b981" : "#059669";
  const cursorColor = theme === "dark" ? "#64748b" : "#cbd5e1";

  return (
    <div className="border rounded-lg p-4" id="stablecoin-mcap-chart">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Market Cap History</h3>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 border rounded-md p-1">
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
            <button
              onClick={() => setPeriod("90d")}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                period === "90d"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              90D
            </button>
            <button
              onClick={() => setPeriod("180d")}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                period === "180d"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              180D
            </button>
          </div>
          <DownloadButton
            elementId="stablecoin-mcap-chart"
            filename="sui-stablecoin-mcap-chart.png"
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
                <linearGradient id="mcapGradient" x1="0" y1="0" x2="0" y2="1">
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
                          ${formatCompact(data.mcap)}
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
                dataKey="mcap"
                stroke={strokeColor}
                strokeWidth={2}
                fill="url(#mcapGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function DominanceChart() {
  const { data, isLoading, error } = useSuiStablecoins();
  const { theme } = useTheme();
  const stablecoins = data?.stablecoins ?? [];
  const totalMcap = data?.totalMarketCap ?? 0;

  const pieData = stablecoins.map((sc) => ({
    name: sc.symbol,
    fullName: sc.name,
    value: sc.marketCap,
    percentage: totalMcap > 0 ? (sc.marketCap / totalMcap) * 100 : 0,
  }));

  const isDark = theme === "dark";
  const colors = isDark
    ? ["#60A5FA", "#34D399", "#F87171", "#A78BFA", "#FB923C", "#EC4899"]
    : ["#3B82F6", "#10B981", "#EF4444", "#8B5CF6", "#F97316", "#EC4899"];

  const formatCompact = (n: number) => {
    const abs = Math.abs(n);
    if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
    if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (abs >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
    return n.toLocaleString();
  };

  return (
    <div className="border rounded-lg p-4" id="stablecoin-dominance-chart">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Stablecoin Dominance</h3>
        <DownloadButton
          elementId="stablecoin-dominance-chart"
          filename="sui-stablecoin-dominance-chart.png"
        />
      </div>

      <div className="h-[320px]">
        {isLoading ? (
          <div className="h-full rounded-md bg-muted animate-pulse" />
        ) : error ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            Failed to load chart
          </div>
        ) : pieData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            No data available
          </div>
        ) : (
          <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
            <div className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const p = payload[0];
                      const data = p.payload;
                      return (
                        <div
                          className="rounded-md px-2.5 py-1.5 text-xs bg-popover text-popover-foreground shadow"
                          style={{
                            filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))",
                          }}
                        >
                          <div className="font-medium">{data.fullName}</div>
                          <div className="text-muted-foreground">
                            ${formatCompact(data.value)}
                          </div>
                          <div className="text-muted-foreground">
                            {data.percentage.toFixed(2)}%
                          </div>
                        </div>
                      );
                    }}
                    wrapperStyle={{ outline: "none" }}
                  />
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="45%"
                    outerRadius="80%"
                    stroke={isDark ? "#111827" : "#FFFFFF"}
                    strokeWidth={6}
                    paddingAngle={2}
                  >
                    {pieData.map((entry, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={colors[i % colors.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {pieData.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <span className="text-foreground font-medium">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      ${formatCompact(item.value)}
                    </span>
                    <span className="text-foreground font-medium min-w-[45px] text-right">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StablecoinsTable({
  formatCompact,
}: {
  formatCompact: (n: number) => string;
}) {
  const { data, isLoading, error } = useSuiStablecoins();

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">All Stablecoins</h3>
        <p className="text-sm text-muted-foreground">Loading stablecoins...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">All Stablecoins</h3>
        <p className="text-sm text-red-600">Error loading stablecoin data</p>
      </div>
    );
  }

  const stablecoins = data?.stablecoins ?? [];
  const totalMcap = data?.totalMarketCap ?? 0;

  if (stablecoins.length === 0) {
    return (
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">All Stablecoins</h3>
        <p className="text-sm text-muted-foreground">
          No stablecoin data available
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4" id="all-stablecoins-sui-table">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">All Stablecoins on Sui</h3>
        <DownloadButton
          elementId="all-stablecoins-sui-table"
          filename="sui-all-stablecoins.png"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr className="text-left">
              <th className="pb-2 font-medium">Rank</th>
              <th className="pb-2 font-medium">Stablecoin</th>
              <th className="pb-2 font-medium">Symbol</th>
              <th className="pb-2 font-medium text-right">Circulating (SUI)</th>
              <th className="pb-2 font-medium text-right">Market Cap</th>
              <th className="pb-2 font-medium text-right">Dominance</th>
            </tr>
          </thead>
          <tbody>
            {stablecoins.map((stablecoin, index) => {
              const dominance =
                totalMcap > 0 ? (stablecoin.marketCap / totalMcap) * 100 : 0;
              return (
                <tr key={stablecoin.id} className="border-b last:border-0">
                  <td className="py-3 text-muted-foreground">#{index + 1}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {stablecoin.logo ? (
                        <Image
                          width={24}
                          height={24}
                          src={stablecoin.logo}
                          alt={stablecoin.name}
                          className="w-6 h-6 rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                          {stablecoin.symbol.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium">{stablecoin.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {stablecoin.symbol}
                  </td>
                  <td className="py-3 text-right font-medium">
                    {formatCompact(stablecoin.circulatingSui)}
                  </td>
                  <td className="py-3 text-right font-medium">
                    ${formatCompact(stablecoin.marketCap)}
                  </td>
                  <td className="py-3 text-right text-muted-foreground">
                    {dominance.toFixed(2)}%
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
