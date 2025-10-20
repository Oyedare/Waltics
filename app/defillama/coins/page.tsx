"use client";

import { useMemo, useState } from "react";
import { StatCard } from "@/components/stat-card";
import {
  useSuiCurrentPrice,
  useSuiPricePercentage,
  useSuiPriceChart,
  useCoinCurrentPrices,
} from "@/hooks/use-defillama";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CoinsPage() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">SUI Token Price</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SuiPriceCard />
        <Change24hCard />
        <Change7dCard />
      </div>

      <PriceChart />

      <TokenLookup />
    </div>
  );
}

function SuiPriceCard() {
  const { data, isLoading, error } = useSuiCurrentPrice();
  const price = data?.price ?? 0;

  const priceDisplay = isLoading
    ? "Loading..."
    : error
    ? "-"
    : price > 0
    ? `$${price.toFixed(4)}`
    : "-";

  return (
    <StatCard
      title="SUI Price"
      value={priceDisplay}
      info="Current SUI token price in USD"
      elementId="sui-price-detail-card"
      filename="sui-price-detail-card.png"
    />
  );
}

function Change24hCard() {
  const { data, isLoading, error } = useSuiPricePercentage("24h");
  const change = data?.change ?? null;
  const isNeg = (change ?? 0) < 0;

  const changeDisplay = isLoading
    ? "Loading..."
    : error
    ? "-"
    : change !== null
    ? `${isNeg ? "" : "+"}${change.toFixed(2)}%`
    : "-";

  return (
    <StatCard
      title="24h Change"
      value={
        <span className={isNeg ? "text-red-600" : "text-green-600"}>
          {changeDisplay}
        </span>
      }
      info="24-hour price change percentage"
      elementId="sui-24h-change-card"
      filename="sui-24h-change-card.png"
    />
  );
}

function Change7dCard() {
  const { data, isLoading, error } = useSuiPricePercentage("7d");
  const change = data?.change ?? null;
  const isNeg = (change ?? 0) < 0;

  const changeDisplay = isLoading
    ? "Loading..."
    : error
    ? "-"
    : change !== null
    ? `${isNeg ? "" : "+"}${change.toFixed(2)}%`
    : "-";

  return (
    <StatCard
      title="7d Change"
      value={
        <span className={isNeg ? "text-red-600" : "text-green-600"}>
          {changeDisplay}
        </span>
      }
      info="7-day price change percentage"
      elementId="sui-7d-change-card"
      filename="sui-7d-change-card.png"
    />
  );
}

function PriceChart() {
  const { theme } = useTheme();
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "180d" | "1y">(
    "30d"
  );
  const { data, isLoading, error } = useSuiPriceChart(period);

  const chartData = data?.chartData ?? [];
  const areaColor = theme === "dark" ? "#60A5FA" : "#3B82F6";
  const gradientId = "suiPriceGradient";

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${(price / 1000).toFixed(2)}K`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(4)}`;
  };

  return (
    <div className="border rounded-lg p-4" id="sui-price-chart">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <h3 className="text-lg font-semibold">SUI Price History</h3>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 border rounded-md p-1">
            {(["7d", "30d", "90d", "180d", "1y"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2 py-1 text-xs rounded ${
                  period === p
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <DownloadButton
            elementId="sui-price-chart"
            filename="sui-price-chart.png"
          />
        </div>
      </div>

      <div className="h-[350px]">
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
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={areaColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={areaColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="timestamp"
                tickFormatter={(ts) => new Date(ts * 1000).toLocaleDateString()}
                tick={{
                  fontSize: 11,
                  fill: theme === "dark" ? "#A0A0A0" : "#666666",
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatPrice}
                tick={{
                  fontSize: 11,
                  fill: theme === "dark" ? "#A0A0A0" : "#666666",
                }}
                axisLine={false}
                tickLine={false}
                width={70}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const p = payload[0];
                  const date = new Date(
                    p.payload.timestamp * 1000
                  ).toLocaleDateString();
                  return (
                    <div
                      className="rounded-md px-2.5 py-1.5 text-xs bg-popover text-popover-foreground shadow"
                      style={{
                        filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))",
                      }}
                    >
                      <div className="font-medium">{date}</div>
                      <div className="text-muted-foreground">
                        Price: {formatPrice(Number(p.value))}
                      </div>
                    </div>
                  );
                }}
                wrapperStyle={{ outline: "none" }}
                cursor={{
                  stroke: "hsl(var(--muted-foreground))",
                  strokeWidth: 1,
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={areaColor}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function TokenLookup() {
  const [coinInput, setCoinInput] = useState("");
  const [coinsCsv, setCoinsCsv] = useState<string | undefined>(undefined);
  const { data, isLoading, error } = useCoinCurrentPrices(coinsCsv);

  const rows = useMemo(() => {
    const coins =
      data?.coins && typeof data.coins === "object" ? data.coins : {};
    return Object.entries(coins).map(([key, val]: any) => ({ key, ...val }));
  }, [data]);

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Token Price Lookup</h3>
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-2 items-start md:items-end">
          <div className="flex-1">
            <label className="block text-sm mb-1 text-muted-foreground">
              Enter token (format: chain:address or coingecko:token-name)
            </label>
            <Input
              value={coinInput}
              onChange={(e) => setCoinInput(e.target.value)}
              placeholder="coingecko:sui, sui:0x..., ethereum:0x..."
            />
          </div>
          <Button onClick={() => setCoinsCsv(coinInput.trim())}>
            Fetch Price
          </Button>
        </div>

        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="text-red-500 text-sm">
            {String((error as Error).message)}
          </div>
        ) : rows.length === 0 && coinsCsv ? (
          <div className="text-sm text-muted-foreground">
            No data found. Ensure the token exists and is formatted correctly.
          </div>
        ) : rows.length > 0 ? (
          <div id="token-lookup-results">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
              <div className="text-sm font-medium">Results</div>
              <DownloadButton
                elementId="token-lookup-results"
                filename="token-price-lookup.png"
              />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Decimals</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r: any) => (
                    <TableRow key={r.key}>
                      <TableCell className="font-mono text-xs">
                        {r.key}
                      </TableCell>
                      <TableCell>{r.symbol ?? "-"}</TableCell>
                      <TableCell>
                        {typeof r.price === "number"
                          ? `$${r.price.toLocaleString()}`
                          : "-"}
                      </TableCell>
                      <TableCell>{r.decimals ?? "-"}</TableCell>
                      <TableCell>
                        {typeof r.timestamp === "number"
                          ? new Date(r.timestamp * 1000).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell>{r.confidence ?? "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
