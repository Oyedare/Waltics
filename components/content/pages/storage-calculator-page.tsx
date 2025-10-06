"use client";

import { memo, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DownloadButton } from "@/components/ui/download-button";

// Storage size options
const SIZE_OPTIONS = [
  { value: "MB", label: "MB", multiplier: 1 },
  { value: "GB", label: "GB", multiplier: 1024 },
  { value: "TB", label: "TB", multiplier: 1024 * 1024 },
];

// Duration options
const DURATION_OPTIONS = [
  { value: "epoch", label: "1 Epoch (14 days)", days: 14 },
  { value: "month", label: "1 Month", days: 30 },
  { value: "year", label: "1 Year", days: 365 },
];

// Pricing constants (estimated based on decentralized storage networks)
const WAL_PER_GB_PER_DAY = 0.001; // 0.001 WAL per GB per day
const USD_PER_WAL = 0.05; // Estimated WAL to USD conversion rate

const StorageCalculatorPage = memo(function StorageCalculatorPage() {
  const [storageSize, setStorageSize] = useState<string>("");
  const [sizeUnit, setSizeUnit] = useState<string>("GB");
  const [duration, setDuration] = useState<string>("month");

  // Calculate storage costs
  const calculations = useMemo(() => {
    const size = parseFloat(storageSize);
    if (!size || size <= 0) {
      return null;
    }

    const sizeOption = SIZE_OPTIONS.find((opt) => opt.value === sizeUnit);
    const durationOption = DURATION_OPTIONS.find(
      (opt) => opt.value === duration
    );

    if (!sizeOption || !durationOption) {
      return null;
    }

    // Convert to GB
    const sizeInGB = size * sizeOption.multiplier;
    const days = durationOption.days;

    // Calculate costs
    const walCost = sizeInGB * WAL_PER_GB_PER_DAY * days;
    const usdCost = walCost * USD_PER_WAL;

    // Calculate per epoch cost (14 days)
    const walPerEpoch = sizeInGB * WAL_PER_GB_PER_DAY * 14;
    const usdPerEpoch = walPerEpoch * USD_PER_WAL;

    // Calculate monthly cost
    const walPerMonth = sizeInGB * WAL_PER_GB_PER_DAY * 30;
    const usdPerMonth = walPerMonth * USD_PER_WAL;

    // Calculate yearly cost
    const walPerYear = sizeInGB * WAL_PER_GB_PER_DAY * 365;
    const usdPerYear = walPerYear * USD_PER_WAL;

    return {
      sizeInGB,
      days,
      walCost,
      usdCost,
      walPerEpoch,
      usdPerEpoch,
      walPerMonth,
      usdPerMonth,
      walPerYear,
      usdPerYear,
    };
  }, [storageSize, sizeUnit, duration]);

  const formatNumber = (num: number, decimals: number = 4) => {
    return num.toFixed(decimals);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount);
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 h-full overflow-y-auto">
      <div id="storage-calculator-export" className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
              Storage Cost Calculator
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Calculate the cost of storing data on the Walrus network for
              different durations
            </p>
          </div>
          {/* Removed page-level download; per-card downloads added below */}
        </div>

        {/* Calculator Input */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              Storage Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Storage Size Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Storage Size</label>
                <Input
                  type="number"
                  placeholder="Enter size"
                  value={storageSize}
                  onChange={(e) => setStorageSize(e.target.value)}
                  min="0"
                  step="0.01"
                  className="h-9 sm:h-10"
                />
              </div>

              {/* Size Unit */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit</label>
                <Select value={sizeUnit} onValueChange={setSizeUnit}>
                  <SelectTrigger className="h-9 sm:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <label className="text-sm font-medium">Duration</label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="h-9 sm:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pricing Note */}
            <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                <strong>Note:</strong> Pricing is estimated based on current
                Walrus network rates. Actual costs may vary. Current rate:{" "}
                {WAL_PER_GB_PER_DAY} WAL per GB per day (≈ $
                {(WAL_PER_GB_PER_DAY * USD_PER_WAL).toFixed(6)} USD per GB per
                day)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {calculations && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            {/* Selected Duration Cost */}
            <Card
              id="selected-duration-card"
              className="min-h-[120px] sm:min-h-[140px]"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
                  Selected Duration
                </CardTitle>
                <div className="flex items-center gap-2">
                  <DownloadButton
                    elementId="selected-duration-card"
                    filename="storage-selected-duration.png"
                    size="sm"
                    showText={false}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold break-words">
                  {formatNumber(calculations.walCost)} WAL
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(calculations.usdCost, "USD")}
                </p>
                <p className="text-xs text-muted-foreground leading-tight">
                  {calculations.days} days for{" "}
                  {formatNumber(calculations.sizeInGB)} GB
                </p>
              </CardContent>
            </Card>

            {/* Per Epoch Cost */}
            <Card
              id="per-epoch-card"
              className="min-h-[120px] sm:min-h-[140px]"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
                  Per Epoch (14 days)
                </CardTitle>
                <div className="flex items-center gap-2">
                  <DownloadButton
                    elementId="per-epoch-card"
                    filename="storage-per-epoch.png"
                    size="sm"
                    showText={false}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold break-words">
                  {formatNumber(calculations.walPerEpoch)} WAL
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(calculations.usdPerEpoch, "USD")}
                </p>
                <p className="text-xs text-muted-foreground leading-tight">
                  Per 14-day epoch
                </p>
              </CardContent>
            </Card>

            {/* Monthly Cost */}
            <Card
              id="monthly-cost-card"
              className="min-h-[120px] sm:min-h-[140px]"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
                  Monthly Cost
                </CardTitle>
                <div className="flex items-center gap-2">
                  <DownloadButton
                    elementId="monthly-cost-card"
                    filename="storage-monthly-cost.png"
                    size="sm"
                    showText={false}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold break-words">
                  {formatNumber(calculations.walPerMonth)} WAL
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(calculations.usdPerMonth, "USD")}
                </p>
                <p className="text-xs text-muted-foreground leading-tight">
                  Per month
                </p>
              </CardContent>
            </Card>

            {/* Yearly Cost */}
            <Card
              id="yearly-cost-card"
              className="min-h-[120px] sm:min-h-[140px]"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
                  Yearly Cost
                </CardTitle>
                <div className="flex items-center gap-2">
                  <DownloadButton
                    elementId="yearly-cost-card"
                    filename="storage-yearly-cost.png"
                    size="sm"
                    showText={false}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold break-words">
                  {formatNumber(calculations.walPerYear)} WAL
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(calculations.usdPerYear, "USD")}
                </p>
                <p className="text-xs text-muted-foreground leading-tight">
                  Per year
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cost Breakdown Table */}
        {calculations && (
          <Card id="cost-breakdown-card">
            <CardHeader className="pb-3 sm:pb-4 flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">
                Cost Breakdown
              </CardTitle>
              <DownloadButton
                elementId="cost-breakdown-card"
                filename="storage-cost-breakdown.png"
                size="sm"
                showText={false}
              />
            </CardHeader>
            <CardContent>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-3 text-sm font-medium">
                        Duration
                      </th>
                      <th className="text-left py-2 pr-3 text-sm font-medium">
                        WAL Cost
                      </th>
                      <th className="text-left py-2 pr-3 text-sm font-medium">
                        USD Cost
                      </th>
                      <th className="text-left py-2 pr-3 text-sm font-medium">
                        Cost per GB per Day
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pr-3 text-sm">1 Epoch (14 days)</td>
                      <td className="py-2 pr-3 text-sm font-medium">
                        {formatNumber(calculations.walPerEpoch)} WAL
                      </td>
                      <td className="py-2 pr-3 text-sm">
                        {formatCurrency(calculations.usdPerEpoch, "USD")}
                      </td>
                      <td className="py-2 pr-3 text-sm">
                        {formatNumber(WAL_PER_GB_PER_DAY)} WAL
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-3 text-sm">1 Month (30 days)</td>
                      <td className="py-2 pr-3 text-sm font-medium">
                        {formatNumber(calculations.walPerMonth)} WAL
                      </td>
                      <td className="py-2 pr-3 text-sm">
                        {formatCurrency(calculations.usdPerMonth, "USD")}
                      </td>
                      <td className="py-2 pr-3 text-sm">
                        {formatNumber(WAL_PER_GB_PER_DAY)} WAL
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-3 text-sm">1 Year (365 days)</td>
                      <td className="py-2 pr-3 text-sm font-medium">
                        {formatNumber(calculations.walPerYear)} WAL
                      </td>
                      <td className="py-2 pr-3 text-sm">
                        {formatCurrency(calculations.usdPerYear, "USD")}
                      </td>
                      <td className="py-2 pr-3 text-sm">
                        {formatNumber(WAL_PER_GB_PER_DAY)} WAL
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-3">
                <div className="p-3 border rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      1 Epoch (14 days)
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">WAL Cost:</span>
                      <span className="font-medium">
                        {formatNumber(calculations.walPerEpoch)} WAL
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">USD Cost:</span>
                      <span>
                        {formatCurrency(calculations.usdPerEpoch, "USD")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Per GB/Day:</span>
                      <span>{formatNumber(WAL_PER_GB_PER_DAY)} WAL</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 border rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      1 Month (30 days)
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">WAL Cost:</span>
                      <span className="font-medium">
                        {formatNumber(calculations.walPerMonth)} WAL
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">USD Cost:</span>
                      <span>
                        {formatCurrency(calculations.usdPerMonth, "USD")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Per GB/Day:</span>
                      <span>{formatNumber(WAL_PER_GB_PER_DAY)} WAL</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 border rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      1 Year (365 days)
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">WAL Cost:</span>
                      <span className="font-medium">
                        {formatNumber(calculations.walPerYear)} WAL
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">USD Cost:</span>
                      <span>
                        {formatCurrency(calculations.usdPerYear, "USD")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Per GB/Day:</span>
                      <span>{formatNumber(WAL_PER_GB_PER_DAY)} WAL</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Examples */}
        {/* <Card>
        <CardHeader>
          <CardTitle>Common Storage Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { size: "1", unit: "GB", label: "1 GB" },
              { size: "10", unit: "GB", label: "10 GB" },
              { size: "100", unit: "GB", label: "100 GB" },
              { size: "1", unit: "TB", label: "1 TB" },
              { size: "5", unit: "TB", label: "5 TB" },
              { size: "10", unit: "TB", label: "10 TB" },
            ].map((example) => {
              const sizeInGB =
                parseFloat(example.size) *
                SIZE_OPTIONS.find((opt) => opt.value === example.unit)!
                  .multiplier;
              const monthlyWal = sizeInGB * WAL_PER_GB_PER_DAY * 30;
              const monthlyUsd = monthlyWal * USD_PER_WAL;

              return (
                <div key={example.label} className="p-4 border rounded-lg">
                  <h4 className="font-medium">{example.label}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Monthly: {formatNumber(monthlyWal)} WAL (
                    {formatCurrency(monthlyUsd, "USD")})
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Yearly: {formatNumber(monthlyWal * 12)} WAL (
                    {formatCurrency(monthlyUsd * 12, "USD")})
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card> */}
      </div>
    </div>
  );
});

export { StorageCalculatorPage };
