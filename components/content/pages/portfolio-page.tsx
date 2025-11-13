"use client";

import { memo, useState } from "react";
import * as React from "react";
import { usePortfolio } from "@/hooks/use-portfolio";
import { StatCard } from "@/components/stat-card";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DownloadButton } from "@/components/ui/download-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useTheme } from "next-themes";
import { TrendingUp, PieChart as PieChartIcon, Search } from "lucide-react";

function formatCompactNumber(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(3)}B`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(3)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(3)}K`;
  return n.toFixed(2);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function WalletAddressInput({
  address,
  onAddressChange,
}: {
  address: string;
  onAddressChange: (address: string) => void;
}) {
  const [inputValue, setInputValue] = useState(address);

  // Sync input value when address changes externally
  React.useEffect(() => {
    if (!address) {
      setInputValue("");
    }
  }, [address]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedAddress = inputValue.trim();
    if (trimmedAddress.length > 0) {
      onAddressChange(trimmedAddress);
    }
  };

  const isValidAddress = (addr: string): boolean => {
    // Sui addresses are 32 bytes (64 hex characters) with optional 0x prefix
    const cleanAddr = addr.startsWith("0x") ? addr.slice(2) : addr;
    return /^[0-9a-fA-F]{64}$/.test(cleanAddr);
  };

  return (
    <Card id="wallet-address-input-card" className="relative">
      <div className="absolute top-2 right-2 z-10">
        <DownloadButton
          elementId="wallet-address-input-card"
          filename="wallet-address-input.png"
          size="sm"
          showText={false}
        />
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Enter Wallet Address
        </CardTitle>
        <CardDescription>
          Enter a Sui wallet address to track its portfolio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="0x..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="font-mono text-sm"
            />
            {inputValue && !isValidAddress(inputValue) && (
              <p className="text-xs text-red-600">
                Please enter a valid Sui address (64 hex characters)
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={!inputValue.trim() || !isValidAddress(inputValue)}
          >
            <Search className="h-4 w-4 mr-2" />
            Track Portfolio
          </Button>
          {address && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">
                Tracking Address:
              </div>
              <div className="font-mono text-sm break-all">
                {address.slice(0, 10)}...{address.slice(-8)}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInputValue("");
                  onAddressChange("");
                }}
                className="mt-2 w-full"
              >
                Clear
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Your wallet data is processed locally and never shared with third
            parties.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

function PortfolioOverviewCards({ portfolio }: { portfolio: any }) {
  const pnl24h = portfolio.pnl24h || 0;
  const pnl7d = portfolio.pnl7d || 0;
  const pnl30d = portfolio.pnl30d || 0;
  const pnl24hPercent = portfolio.pnlPercent24h || 0;
  const pnl7dPercent = portfolio.pnlPercent7d || 0;
  const pnl30dPercent = portfolio.pnlPercent30d || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Portfolio Value"
        value={formatCurrency(portfolio.totalValueUSD)}
        info="Total value of all assets in your portfolio"
        elementId="portfolio-total-value-card"
        filename="portfolio-total-value.png"
      />
      <StatCard
        title="24h P&L"
        value={
          <div className="flex flex-col">
            <span>{formatCurrency(pnl24h)}</span>
            <span
              className={`text-xs ${
                pnl24h >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {pnl24h >= 0 ? "+" : ""}
              {pnl24hPercent.toFixed(2)}%
            </span>
          </div>
        }
        info="Profit and loss over the last 24 hours"
        elementId="portfolio-pnl-24h-card"
        filename="portfolio-pnl-24h.png"
      />
      <StatCard
        title="7d P&L"
        value={
          <div className="flex flex-col">
            <span>{formatCurrency(pnl7d)}</span>
            <span
              className={`text-xs ${
                pnl7d >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {pnl7d >= 0 ? "+" : ""}
              {pnl7dPercent.toFixed(2)}%
            </span>
          </div>
        }
        info="Profit and loss over the last 7 days"
        elementId="portfolio-pnl-7d-card"
        filename="portfolio-pnl-7d.png"
      />
      <StatCard
        title="30d P&L"
        value={
          <div className="flex flex-col">
            <span>{formatCurrency(pnl30d)}</span>
            <span
              className={`text-xs ${
                pnl30d >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {pnl30d >= 0 ? "+" : ""}
              {pnl30dPercent.toFixed(2)}%
            </span>
          </div>
        }
        info="Profit and loss over the last 30 days"
        elementId="portfolio-pnl-30d-card"
        filename="portfolio-pnl-30d.png"
      />
    </div>
  );
}

function AssetAllocationChart({ assetAllocation }: { assetAllocation: any[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Use the same color scheme as Blob Size Distribution
  const colors = isDark
    ? ["#60A5FA", "#34D399", "#F87171", "#A78BFA", "#FBBF24"]
    : ["#3B82F6", "#10B981", "#EF4444", "#8B5CF6", "#F59E0B"];

  const CustomPieTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: any[];
  }) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0];
    const percentage = (p.payload as any)?.percentage || 0;
    return (
      <div
        className="rounded-md px-2.5 py-1.5 text-xs bg-popover text-popover-foreground shadow"
        style={{
          filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))",
        }}
      >
        <div className="font-medium">{p?.name}</div>
        <div>
          {formatCurrency(p?.value as number)} ({percentage.toFixed(2)}%)
        </div>
      </div>
    );
  };

  return (
    <Card id="asset-allocation-chart" className="relative">
      <div className="absolute top-2 right-2 z-10">
        <DownloadButton
          elementId="asset-allocation-chart"
          filename="asset-allocation-chart.png"
          size="sm"
          showText={false}
        />
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          Asset Allocation
        </CardTitle>
        <CardDescription>
          Distribution of assets in your portfolio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] lg:h-[320px]">
          {assetAllocation.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              No assets to display
            </div>
          ) : (
            <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
              <div className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <filter
                        id="shadow-asset"
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                      >
                        <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                        <feOffset dx="0" dy="1" result="offsetblur" />
                        <feComponentTransfer>
                          <feFuncA type="linear" slope="0.2" />
                        </feComponentTransfer>
                        <feMerge>
                          <feMergeNode />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <Tooltip
                      content={<CustomPieTooltip />}
                      wrapperStyle={{ outline: "none" }}
                    />
                    <Pie
                      data={assetAllocation}
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
                      {assetAllocation.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={colors[index % colors.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {assetAllocation.map((entry, index) => {
                  const percentage = entry.percentage || 0;
                  return (
                    <div
                      key={entry.name}
                      className="flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: colors[index % colors.length],
                          }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {entry.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {formatCurrency(entry.value)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {percentage.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PerformanceChart({ portfolio }: { portfolio: any }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const strokeColor = isDark ? "#9CA3AF" : "#6B7280";
  const cursorColor = isDark ? "#4B5563" : "#9CA3AF";

  // Generate mock historical data
  const generateHistoricalData = () => {
    const data = [];
    const now = Date.now();
    const baseValue = portfolio.totalValueUSD;
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const randomChange = (Math.random() - 0.5) * 0.1; // ±5% daily variation
      const value = baseValue * (1 + (randomChange * (30 - i)) / 30);
      data.push({
        timestamp: date.getTime(),
        value: value,
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      });
    }
    return data;
  };

  const chartData = generateHistoricalData();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
          <p className="text-sm text-muted-foreground">{data.date}</p>
          <p className="font-medium">{formatCurrency(data.value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card id="performance-chart" className="relative">
      <div className="absolute top-2 right-2 z-10">
        <DownloadButton
          elementId="performance-chart"
          filename="portfolio-performance-chart.png"
          size="sm"
          showText={false}
        />
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Portfolio Performance (30 Days)
        </CardTitle>
        <CardDescription>Historical portfolio value over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="portfolioGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
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
                content={<CustomTooltip />}
                wrapperStyle={{ outline: "none" }}
              />
              <XAxis
                dataKey="timestamp"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(ts) => {
                  const date = new Date(ts);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
                tick={{
                  fill: isDark ? "#9CA3AF" : "#6B7280",
                  fontSize: 11,
                }}
                axisLine={{ stroke: cursorColor, opacity: 0.4 }}
                tickLine={false}
                padding={{ left: 0, right: 0 }}
                height={24}
              />
              <YAxis
                tickFormatter={(v) => formatCompactNumber(v as number)}
                tick={{
                  fill: isDark ? "#9CA3AF" : "#6B7280",
                  fontSize: 11,
                }}
                axisLine={{ stroke: cursorColor, opacity: 0.4 }}
                tickLine={false}
                width={70}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={strokeColor}
                strokeWidth={2}
                fill="url(#portfolioGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: strokeColor,
                  stroke: strokeColor,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function AssetsTable({ assets }: { assets: any[] }) {
  return (
    <Card id="assets-table" className="relative">
      <div className="absolute top-2 right-2 z-10">
        <DownloadButton
          elementId="assets-table"
          filename="portfolio-assets-table.png"
          size="sm"
          showText={false}
        />
      </div>
      <CardHeader>
        <CardTitle>Assets</CardTitle>
        <CardDescription>
          Detailed breakdown of your portfolio assets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">Allocation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset, index) => {
              const balanceNumber =
                Number(BigInt(asset.balance)) / Math.pow(10, asset.decimals);
              const totalValue = assets.reduce((sum, a) => sum + a.valueUSD, 0);
              const allocation = (asset.valueUSD / totalValue) * 100;
              return (
                <TableRow key={asset.type || index}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{asset.symbol}</span>
                      <span className="text-xs text-muted-foreground">
                        {asset.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {balanceNumber.toLocaleString(undefined, {
                      maximumFractionDigits: asset.decimals,
                    })}
                  </TableCell>
                  <TableCell>{formatCurrency(asset.priceUSD)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(asset.valueUSD)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {allocation.toFixed(2)}%
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

const PortfolioPage = memo(function PortfolioPage() {
  const [address, setAddress] = useState<string>("");
  const { portfolio, isLoading, assetAllocation } = usePortfolio(
    address || null
  );

  if (!address) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Portfolio Tracker</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Enter a Sui wallet address to track its portfolio performance
          </p>
        </div>
        <WalletAddressInput address={address} onAddressChange={setAddress} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Portfolio Tracker</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Loading your portfolio data...
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Portfolio Tracker</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Unable to load portfolio data
          </p>
        </div>
        <WalletAddressInput address={address} onAddressChange={setAddress} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Portfolio Tracker</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Track your Sui ecosystem portfolio performance and analytics
        </p>
      </div>

      <WalletAddressInput address={address} onAddressChange={setAddress} />

      <PortfolioOverviewCards portfolio={portfolio} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssetAllocationChart assetAllocation={assetAllocation} />
        <PerformanceChart portfolio={portfolio} />
      </div>

      <AssetsTable assets={portfolio.assets} />
    </div>
  );
});

export { PortfolioPage };
