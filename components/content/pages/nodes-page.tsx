"use client";

import React, { memo, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { useTheme } from "next-themes";
import { BarChart3, Database, Shield, Activity } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DownloadButton } from "@/components/ui/download-button";

function generateTimeSeries(days: number) {
  const now = Date.now();
  const step = Math.floor((24 * 60 * 60 * 1000) / 24); // hourly-ish points per day
  const totalPoints = Math.max(24, days * 24);
  const data: { timestamp: number; uploads: number; retrievals: number }[] = [];
  for (let i = totalPoints - 1; i >= 0; i--) {
    const timestamp = now - i * step;
    const uploads = Math.max(
      0,
      Math.round(50 + 40 * Math.sin(i / 6) + (Math.random() * 20 - 10))
    );
    const retrievals = Math.max(
      0,
      Math.round(70 + 35 * Math.cos(i / 7) + (Math.random() * 20 - 10))
    );
    data.push({ timestamp, uploads, retrievals });
  }
  return data;
}

function generateStatusBars(days: number) {
  // Success and error codes distribution over time
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const data: {
    day: string;
    ok200: number;
    err404: number;
    err451: number;
    err500: number;
    err504: number;
  }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const ts = new Date(now - i * dayMs);
    const base = 200 + Math.round(Math.random() * 150);
    const ok200 = base;
    const err404 = Math.round(base * 0.08 * Math.random());
    const err451 = Math.round(base * 0.04 * Math.random());
    const err500 = Math.round(base * 0.03 * Math.random());
    const err504 = Math.round(base * 0.05 * Math.random());
    data.push({
      day: ts.toLocaleDateString([], { month: "short", day: "numeric" }),
      ok200,
      err404,
      err451,
      err500,
      err504,
    });
  }
  return data;
}

function generatePolicyPie() {
  const permanent = 45 + Math.round(Math.random() * 20);
  const deletable = 40 + Math.round(Math.random() * 15);
  const epoch = 100 - permanent - deletable;
  return [
    { name: "Permanent", value: permanent },
    { name: "Deletable", value: deletable },
    { name: "Epoch-based", value: Math.max(0, epoch) },
  ];
}

function generateSizeHistogram() {
  // Buckets of sizes
  const buckets = [
    { range: "<64KB", count: 120 },
    { range: "64KB-256KB", count: 180 },
    { range: "256KB-1MB", count: 140 },
    { range: "1MB-5MB", count: 90 },
    { range: "5MB-20MB", count: 60 },
    { range: ">20MB", count: 25 },
  ];
  return buckets.map((b) => ({
    ...b,
    count: Math.max(0, Math.round(b.count * (0.7 + Math.random() * 0.6))),
  }));
}

function generateQuiltList() {
  // Simple placeholder quilt usage
  return [
    { quiltId: "quilt_8f12ab", patches: 12, retrievals: 340 },
    { quiltId: "quilt_9c77de", patches: 8, retrievals: 275 },
    { quiltId: "quilt_2a45cd", patches: 21, retrievals: 510 },
    { quiltId: "quilt_7b33ef", patches: 5, retrievals: 120 },
  ];
}

const NodesPage = memo(function NodesPage() {
  const [period, setPeriod] = useState<"24H" | "7D" | "30D">("7D");
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const strokeColor = isDark ? "#FFFFFF" : "#0A0A0A";
  const cursorColor = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";

  const timeSeries = useMemo(
    () => generateTimeSeries(period === "24H" ? 1 : period === "7D" ? 7 : 30),
    [period]
  );
  const statusBars = useMemo(
    () => generateStatusBars(period === "24H" ? 2 : period === "7D" ? 7 : 30),
    [period]
  );
  const policyPie = useMemo(() => generatePolicyPie(), []);
  const sizeHistogram = useMemo(() => generateSizeHistogram(), []);
  const quilts = useMemo(() => generateQuiltList(), []);

  function formatXAxisLabel(timestamp: number) {
    const date = new Date(timestamp);
    if (period === "24H") {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  const CustomAreaTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: any[];
  }) => {
    if (!active || !payload || payload.length === 0) return null;
    const p = payload;
    return (
      <div className="rounded-md border bg-background p-2 text-xs shadow-sm">
        <div className="font-medium mb-1">
          {new Date(p[0].payload.timestamp).toLocaleString()}
        </div>
        {p.map((it) => (
          <div key={it.dataKey} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-sm"
              style={{ background: it.color }}
            />
            <span className="text-muted-foreground">{it.dataKey}:</span>
            <span className="font-medium">{it.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const pieColors = isDark
    ? ["#60A5FA", "#34D399", "#FBBF24"]
    : ["#1D4ED8", "#059669", "#D97706"];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Nodes</h1>
          <p className="text-sm text-muted-foreground">
            Publisher vs Aggregator usage analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md border p-1 bg-background">
            {(["24H", "7D", "30D"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs rounded-sm ${
                  period === p
                    ? "bg-muted font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div id="nodes-dashboard" className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card id="uploads-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">
                  Uploads (Publisher)
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
              <DownloadButton
                elementId="uploads-card"
                filename="uploads-publisher.png"
                size="sm"
                showText={false}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {timeSeries.reduce((acc, cur) => acc + cur.uploads, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total over selected period
              </p>
            </CardContent>
          </Card>

          <Card id="retrievals-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">
                  Retrievals (Aggregator)
                </CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </div>
              <DownloadButton
                elementId="retrievals-card"
                filename="retrievals-aggregator.png"
                size="sm"
                showText={false}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {timeSeries.reduce((acc, cur) => acc + cur.retrievals, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total over selected period
              </p>
            </CardContent>
          </Card>

          <Card id="success-rate-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">
                  Success Rate
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
              <DownloadButton
                elementId="success-rate-card"
                filename="success-rate.png"
                size="sm"
                showText={false}
              />
            </CardHeader>
            <CardContent>
              {(() => {
                const ok = statusBars.reduce((a, b) => a + b.ok200, 0);
                const total =
                  ok +
                  statusBars.reduce(
                    (a, b) => a + b.err404 + b.err451 + b.err500 + b.err504,
                    0
                  );
                const pct = total === 0 ? 0 : Math.round((ok / total) * 100);
                return (
                  <>
                    <div className="text-2xl font-bold">{pct}%</div>
                    <p className="text-xs text-muted-foreground">
                      200s out of total responses
                    </p>
                  </>
                );
              })()}
            </CardContent>
          </Card>

          <Card id="blocked-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">
                  Blocked (451)
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </div>
              <DownloadButton
                elementId="blocked-card"
                filename="blocked-451.png"
                size="sm"
                showText={false}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statusBars.reduce((a, b) => a + b.err451, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Content moderation impact
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Line chart: uploads vs retrievals */}
        <Card id="uploads-vs-retrievals-chart">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Uploads vs Retrievals</CardTitle>
                <CardDescription>Activity over time</CardDescription>
              </div>
              <DownloadButton
                elementId="uploads-vs-retrievals-chart"
                filename="uploads-vs-retrievals.png"
                size="sm"
                showText={false}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={timeSeries}
                  margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="uploadsGradient"
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
                      <stop
                        offset="100%"
                        stopColor={strokeColor}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    cursor={{ stroke: cursorColor, strokeDasharray: "2 6" }}
                    content={<CustomAreaTooltip />}
                    wrapperStyle={{ outline: "none" }}
                  />
                  <XAxis
                    dataKey="timestamp"
                    type="number"
                    tickFormatter={formatXAxisLabel}
                    domain={["dataMin", "dataMax"]}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={16}
                  />
                  <YAxis tickLine={false} axisLine={false} width={36} />
                  <Area
                    type="monotone"
                    dataKey="uploads"
                    stroke={isDark ? "#60A5FA" : "#1D4ED8"}
                    fill="url(#uploadsGradient)"
                    fillOpacity={1}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="retrievals"
                    stroke={isDark ? "#34D399" : "#059669"}
                    fillOpacity={0}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Stacked bar: success vs error types */}
        <Card id="status-codes-chart">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Status Codes Distribution</CardTitle>
                <CardDescription>
                  200, 404, 451, 500, 504 over time
                </CardDescription>
              </div>
              <DownloadButton
                elementId="status-codes-chart"
                filename="status-codes-distribution.png"
                size="sm"
                showText={false}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusBars} stackOffset="expand">
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis
                    tickFormatter={(v) => `${Math.round(v * 100)}%`}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip wrapperStyle={{ outline: "none" }} />
                  <Legend />
                  <Bar
                    dataKey="ok200"
                    stackId="a"
                    fill={isDark ? "#34D399" : "#059669"}
                    name="200"
                  />
                  <Bar
                    dataKey="err404"
                    stackId="a"
                    fill={isDark ? "#A5B4FC" : "#4F46E5"}
                    name="404"
                  />
                  <Bar
                    dataKey="err451"
                    stackId="a"
                    fill={isDark ? "#F59E0B" : "#D97706"}
                    name="451"
                  />
                  <Bar
                    dataKey="err500"
                    stackId="a"
                    fill={isDark ? "#F87171" : "#DC2626"}
                    name="500"
                  />
                  <Bar
                    dataKey="err504"
                    stackId="a"
                    fill={isDark ? "#93C5FD" : "#2563EB"}
                    name="504"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Two-column: policies pie and size histogram */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card id="retention-policies-chart">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Retention Policies</CardTitle>
                  <CardDescription>
                    Permanent vs deletable vs epoch-based
                  </CardDescription>
                </div>
                <DownloadButton
                  elementId="retention-policies-chart"
                  filename="retention-policies.png"
                  size="sm"
                  showText={false}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip wrapperStyle={{ outline: "none" }} />
                    <Pie
                      data={policyPie}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {policyPie.map((_, idx) => (
                        <Cell
                          key={idx}
                          fill={pieColors[idx % pieColors.length]}
                        />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card id="blob-size-distribution-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Blob Size Distribution</CardTitle>
                  <CardDescription>Counts per size bucket</CardDescription>
                </div>
                <DownloadButton
                  elementId="blob-size-distribution-card"
                  filename="blob-size-distribution.png"
                  size="sm"
                  showText={false}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {sizeHistogram.map((b) => (
                  <div
                    key={b.range}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <span className="text-sm text-muted-foreground">
                      {b.range}
                    </span>
                    <span className="font-medium">{b.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quilt explorer */}
        <Card id="quilt-explorer-table">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Quilt Explorer</CardTitle>
                <CardDescription>
                  Patch count and retrieval frequency
                </CardDescription>
              </div>
              <DownloadButton
                elementId="quilt-explorer-table"
                filename="quilt-explorer.png"
                size="sm"
                showText={false}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 font-medium">Quilt ID</th>
                    <th className="py-2 font-medium">Patches</th>
                    <th className="py-2 font-medium">Retrievals</th>
                  </tr>
                </thead>
                <tbody>
                  {quilts.map((q) => (
                    <tr key={q.quiltId} className="border-t">
                      <td className="py-2 font-mono">{q.quiltId}</td>
                      <td className="py-2">{q.patches}</td>
                      <td className="py-2">{q.retrievals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export { NodesPage };
