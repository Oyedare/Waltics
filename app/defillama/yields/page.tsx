"use client";

import { StatCard } from "@/components/stat-card";
import { useSuiYields } from "@/hooks/use-defillama";
import { useTheme } from "next-themes";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DownloadButton } from "@/components/ui/download-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DefillamaYieldsPage() {
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
        <h2 className="text-xl font-semibold">Yields (Sui)</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <HighestApyCard />
        <AverageApyCard />
        <ActivePoolsCard />
        <TotalTvlCard formatCompact={formatCompact} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopPoolsChart />
        <TvlDistributionChart formatCompact={formatCompact} />
      </div>

      <YieldsTable formatCompact={formatCompact} />
    </div>
  );
}

function HighestApyCard() {
  const { data, isLoading, error } = useSuiYields();
  const maxApy = data?.stats?.maxApy ?? 0;
  const v = isLoading
    ? "Loading..."
    : error
    ? "-"
    : maxApy > 0
    ? `${maxApy.toFixed(2)}%`
    : "-";
  return (
    <StatCard
      title="Highest APY"
      value={<span>{v}</span>}
      info="Best yield opportunity on Sui"
      elementId="sui-highest-apy-card"
      filename="sui-highest-apy-card.png"
    />
  );
}

function AverageApyCard() {
  const { data, isLoading, error } = useSuiYields();
  const avgApy = data?.stats?.avgApy ?? 0;
  const v = isLoading
    ? "Loading..."
    : error
    ? "-"
    : avgApy > 0
    ? `${avgApy.toFixed(2)}%`
    : "-";
  return (
    <StatCard
      title="Average APY"
      value={<span>{v}</span>}
      info="Mean APY across all yield pools"
      elementId="sui-avg-apy-card"
      filename="sui-avg-apy-card.png"
    />
  );
}

function ActivePoolsCard() {
  const { data, isLoading, error } = useSuiYields();
  const count = data?.stats?.poolCount ?? 0;
  const v = isLoading ? "Loading..." : error ? "-" : count.toString();
  return (
    <StatCard
      title="Active Pools"
      value={<span>{v}</span>}
      info="Number of yield farming pools"
      elementId="sui-active-pools-card"
      filename="sui-active-pools-card.png"
    />
  );
}

function TotalTvlCard({
  formatCompact,
}: {
  formatCompact: (n: number) => string;
}) {
  const { data, isLoading, error } = useSuiYields();
  const tvl = data?.stats?.totalTvl ?? 0;
  const v = isLoading
    ? "Loading..."
    : error
    ? "-"
    : tvl > 0
    ? formatCompact(tvl)
    : "-";
  return (
    <StatCard
      title="Total TVL in Yields"
      value={<span>${v}</span>}
      info="Combined TVL across all yield pools"
      elementId="sui-yields-tvl-card"
      filename="sui-yields-tvl-card.png"
    />
  );
}

function TopPoolsChart() {
  const { data, isLoading, error } = useSuiYields();
  const { theme } = useTheme();

  const pools = data?.pools ?? [];
  const top10 = pools.slice(0, 10);

  const chartData = top10.map((pool) => ({
    name: `${pool.project} - ${pool.symbol}`,
    apy: pool.apy,
    project: pool.project,
  }));

  const barColor = theme === "dark" ? "#60A5FA" : "#3B82F6";

  return (
    <div className="border rounded-lg p-4" id="top-pools-chart">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <h3 className="text-lg font-semibold">Top 10 Pools by APY</h3>
        <DownloadButton
          elementId="top-pools-chart"
          filename="sui-top-pools-apy-chart.png"
        />
      </div>

      <div className="h-[400px]">
        {isLoading ? (
          <div className="h-full rounded-md bg-muted animate-pulse" />
        ) : error ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            Failed to load chart
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <XAxis
                type="number"
                tickFormatter={(val) => `${val.toFixed(1)}%`}
                tick={{
                  fontSize: 11,
                  fill: theme === "dark" ? "#A0A0A0" : "#666666",
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{
                  fontSize: 10,
                  fill: theme === "dark" ? "#A0A0A0" : "#666666",
                }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div
                        className="rounded-md px-2.5 py-1.5 text-xs bg-popover text-popover-foreground shadow"
                        style={{
                          filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))",
                        }}
                      >
                        <div className="font-medium">{data.project}</div>
                        <div className="text-muted-foreground">
                          APY: {data.apy.toFixed(2)}%
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
                wrapperStyle={{ outline: "none" }}
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
              />
              <Bar
                dataKey="apy"
                fill={barColor}
                radius={[0, 4, 4, 0]}
                label={{
                  position: "right",
                  formatter: ((value: any) =>
                    typeof value === "number"
                      ? `${value.toFixed(2)}%`
                      : "") as any,
                  fontSize: 11,
                  fill: theme === "dark" ? "#FFFFFF" : "#000000",
                  fontWeight: 500,
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function TvlDistributionChart({
  formatCompact,
}: {
  formatCompact: (n: number) => string;
}) {
  const { data, isLoading, error } = useSuiYields();
  const { theme } = useTheme();

  const pools = data?.pools ?? [];

  // Group by project and sum TVL
  const projectTvl = pools.reduce((acc: any, pool) => {
    if (!acc[pool.project]) {
      acc[pool.project] = 0;
    }
    acc[pool.project] += pool.tvlUsd;
    return acc;
  }, {});

  const pieData = Object.entries(projectTvl)
    .map(([project, tvl]) => ({
      name: project,
      value: tvl as number,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Top 8 projects

  const totalTvl = pieData.reduce((sum, item) => sum + item.value, 0);

  const isDark = theme === "dark";
  const colors = isDark
    ? [
        "#60A5FA",
        "#34D399",
        "#F87171",
        "#A78BFA",
        "#FB923C",
        "#EC4899",
        "#14B8A6",
        "#FBBF24",
      ]
    : [
        "#3B82F6",
        "#10B981",
        "#EF4444",
        "#8B5CF6",
        "#F97316",
        "#EC4899",
        "#14B8A6",
        "#F59E0B",
      ];

  return (
    <div className="border rounded-lg p-4" id="tvl-distribution-chart">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <h3 className="text-lg font-semibold">TVL Distribution by Protocol</h3>
        <DownloadButton
          elementId="tvl-distribution-chart"
          filename="sui-yields-tvl-distribution-chart.png"
        />
      </div>

      <div className="h-[550px] md:h-[400px]">
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
            <div className="h-[250px] md:h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      const percentage = (data.value / totalTvl) * 100;
                      return (
                        <div
                          className="rounded-md px-2.5 py-1.5 text-xs bg-popover text-popover-foreground shadow"
                          style={{
                            filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))",
                          }}
                        >
                          <div className="font-medium">{data.name}</div>
                          <div className="text-muted-foreground">
                            ${formatCompact(data.value)}
                          </div>
                          <div className="text-muted-foreground">
                            {percentage.toFixed(2)}%
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
              {pieData.map((item, index) => {
                const percentage = (item.value / totalTvl) * 100;
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{
                          backgroundColor: colors[index % colors.length],
                        }}
                      />
                      <span className="text-foreground font-medium truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">
                        ${formatCompact(item.value)}
                      </span>
                      <span className="text-foreground font-medium min-w-[45px] text-right">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function YieldsTable({
  formatCompact,
}: {
  formatCompact: (n: number) => string;
}) {
  const { data, isLoading, error } = useSuiYields();

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">All Yield Pools</h3>
        <p className="text-sm text-muted-foreground">Loading pools...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">All Yield Pools</h3>
        <p className="text-sm text-red-600">Error loading yield data</p>
      </div>
    );
  }

  const pools = data?.pools ?? [];

  if (pools.length === 0) {
    return (
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">All Yield Pools</h3>
        <p className="text-sm text-muted-foreground">No pool data available</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4" id="all-yield-pools-sui-table">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <h3 className="text-lg font-semibold">All Yield Pools on Sui</h3>
        <DownloadButton
          elementId="all-yield-pools-sui-table"
          filename="sui-all-yield-pools.png"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Protocol</TableHead>
            <TableHead>Asset</TableHead>
            <TableHead className="text-right">APY</TableHead>
            <TableHead className="text-right">TVL</TableHead>
            <TableHead className="text-center">IL Risk</TableHead>
            <TableHead className="text-center">Outlook</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pools.map((pool, index) => {
            const predictionClass = pool.predictions?.predictedClass;
            const confidence = pool.predictions?.binnedConfidence;
            return (
              <TableRow key={pool.poolId}>
                <TableCell className="text-muted-foreground">
                  #{index + 1}
                </TableCell>
                <TableCell className="font-medium">{pool.project}</TableCell>
                <TableCell className="text-muted-foreground">
                  {pool.symbol}
                </TableCell>
                <TableCell className="text-right font-medium text-green-600">
                  {pool.apy.toFixed(2)}%
                </TableCell>
                <TableCell className="text-right">
                  ${formatCompact(pool.tvlUsd)}
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      pool.ilRisk === "no"
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                    }`}
                  >
                    {pool.ilRisk === "no" ? "No" : "Yes"}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {predictionClass && confidence ? (
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        predictionClass === "Stable/Up"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {predictionClass} ({confidence})
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
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
