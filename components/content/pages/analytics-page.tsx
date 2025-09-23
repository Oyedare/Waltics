"use client";

import React, { memo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { useTheme } from "next-themes";
import { Download } from "lucide-react";

const AnalyticsPage = memo(function AnalyticsPage() {
  const [period, setPeriod] = useState<"24H" | "7D" | "30D" | "CUSTOM">("7D");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  function ExportButtons() {
    return (
      <div className="flex items-center gap-2">
        <button className="h-8 px-3 rounded-md border border-border text-sm cursor-pointer inline-flex items-center gap-1">
          <Download className="h-4 w-4" /> CSV
        </button>
        <button className="h-8 px-3 rounded-md border border-border text-sm cursor-pointer inline-flex items-center gap-1">
          <Download className="h-4 w-4" /> JSON
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 h-full space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Advanced Analytics</CardTitle>
            <CardDescription>Deep-dive, compare, and export</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Period:</span>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="h-8 rounded-md px-2 border border-border text-foreground bg-background cursor-pointer"
              >
                <option value="24H">24 Hours</option>
                <option value="7D">7 Days</option>
                <option value="30D">30 Days</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>
            {period === "CUSTOM" && (
              <div className="flex items-center gap-2 text-sm">
                <input
                  type="datetime-local"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="h-8 rounded-md px-2 border border-input bg-background"
                />
                <span className="text-muted-foreground">to</span>
                <input
                  type="datetime-local"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="h-8 rounded-md px-2 border border-input bg-background"
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Select a period or custom range to update all analytics below.
          </div>
        </CardContent>
      </Card>

      {/* Comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Blobs vs Accounts</CardTitle>
              <CardDescription>Compare growth trends</CardDescription>
            </div>
            <ExportButtons />
          </CardHeader>
          <CardContent>
            <div className="h-[320px] rounded-md bg-muted" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Avg Size vs Counts</CardTitle>
              <CardDescription>Correlated time-series</CardDescription>
            </div>
            <ExportButtons />
          </CardHeader>
          <CardContent>
            <div className="h-[320px] rounded-md bg-muted" />
          </CardContent>
        </Card>
      </div>

      {/* Segmentation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Size Buckets</CardTitle>
              <CardDescription>Small / M / L distribution</CardDescription>
            </div>
            <ExportButtons />
          </CardHeader>
          <CardContent>
            <div className="h-[240px] rounded-md bg-muted" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Status Breakdown</CardTitle>
              <CardDescription>Certified vs Registered</CardDescription>
            </div>
            <ExportButtons />
          </CardHeader>
          <CardContent>
            <div className="h-[240px] rounded-md bg-muted" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Expiry Windows</CardTitle>
              <CardDescription>Start–End epoch distribution</CardDescription>
            </div>
            <ExportButtons />
          </CardHeader>
          <CardContent>
            <div className="h-[240px] rounded-md bg-muted" />
          </CardContent>
        </Card>
      </div>

      {/* Anomalies / Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Anomalies</CardTitle>
              <CardDescription>Spikes, dips, and outliers</CardDescription>
            </div>
            <ExportButtons />
          </CardHeader>
          <CardContent>
            <div className="h-[280px] rounded-md bg-muted" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Endpoint Performance</CardTitle>
              <CardDescription>Latency & availability trend</CardDescription>
            </div>
            <ExportButtons />
          </CardHeader>
          <CardContent>
            <div className="h-[280px] rounded-md bg-muted" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export { AnalyticsPage };
