"use client";

import React, { memo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Database, BarChart3, Users, Download } from "lucide-react";
import { useTotalBlobs } from "@/hooks/use-total-blobs";
import { formatBytes, formatNumber } from "@/lib/blob-utils";
import { useAvgBlobSize } from "@/hooks/use-avg-blob-size";
import { useTotalAccounts } from "@/hooks/use-total-accounts";
import { useTheme } from "next-themes";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import { downloadElementAsPng } from "@/lib/download";
// import type { TooltipProps } from "recharts";
import { Payload } from "recharts/types/component/DefaultTooltipContent";

const OverviewPage = memo(function OverviewPage() {
  const [period, setPeriod] = useState<"24H" | "7D" | "30D">("7D");
  const { data, isLoading, isError } = useTotalBlobs(period);
  const totalBlobs = data?.value ?? null;
  const avgQuery = useAvgBlobSize(period);
  const avgBlobSizeBytes = avgQuery.data?.value ?? null;
  const accountsQuery = useTotalAccounts(period);
  const totalAccounts = accountsQuery.data?.value ?? null;
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const strokeColor = isDark ? "#FFFFFF" : "#0A0A0A";
  // const fillColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const cursorColor = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";

  function formatTime(ts?: number) {
    if (!ts) return "";
    return new Date(ts).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatXAxisLabel(timestamp: number) {
    const date = new Date(timestamp);
    if (period === "24H") {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (period === "7D") {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Payload<number, string>[] }) => {
    if (!active || !payload || !payload.length) return null;
    const val = payload[0]?.value as number;
    const ts = payload[0]?.payload?.timestamp as number | undefined;
    return (
      <div
        className="pointer-events-none text-center"
        style={{ transform: "translate(-50%, -14px)" }}
      >
        <div className="text-[10px] leading-none mb-1 text-foreground/80">
          {formatTime(ts)}
        </div>
        <div className="text-xs font-semibold text-foreground">
          {formatNumber(val)}
        </div>
      </div>
    );
  };
  return (
    <div className="p-6 h-full space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Blobs Stored
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "…" : isError ? "—" : formatNumber(totalBlobs ?? 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Blob Size</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgQuery.isLoading
                ? "…"
                : avgQuery.isError
                ? "—"
                : formatBytes(Math.max(0, Math.round(avgBlobSizeBytes ?? 0)))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Accounts
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accountsQuery.isLoading
                ? "…"
                : accountsQuery.isError
                ? "—"
                : formatNumber(totalAccounts ?? 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Blob Growth Over Time</CardTitle>
              <CardDescription>
                Time-series from getBlobsCountChart
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Period:</span>
              <select
                value={period}
                onChange={(e) =>
                  setPeriod(e.target.value as "24H" | "7D" | "30D")
                }
                className="h-8 rounded-md px-2 border border-border text-foreground bg-background cursor-pointer text-sm"
              >
                <option value="24H">24 Hours</option>
                <option value="7D">7 Days</option>
                <option value="30D">30 Days</option>
              </select>
              <button
                className="h-8 px-3 rounded-md border border-border text-sm cursor-pointer inline-flex items-center gap-1"
                onClick={() => {
                  const el = document.getElementById("overview-blobs-chart");
                  if (el) downloadElementAsPng(el, "blob-growth.png");
                }}
              >
                <Download className="h-4 w-4" /> Download
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div id="overview-blobs-chart" className="h-[300px]">
              {isLoading ? (
                <div className="h-full rounded-md bg-muted" />
              ) : isError ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  Failed to load chart
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data?.chart ?? []}
                    margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="blobGradient"
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
                      content={<CustomTooltip />}
                      wrapperStyle={{ outline: "none" }}
                    />
                    <XAxis
                      dataKey="timestamp"
                      type="number"
                      domain={["dataMin", "dataMax"]}
                      tickFormatter={formatXAxisLabel}
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
                      tickFormatter={(v) => formatNumber(v as number)}
                      tick={{
                        fill: isDark ? "#9CA3AF" : "#6B7280",
                        fontSize: 11,
                      }}
                      axisLine={{ stroke: cursorColor, opacity: 0.4 }}
                      tickLine={false}
                      width={36}
                      allowDecimals={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={strokeColor}
                      strokeWidth={2}
                      fill="url(#blobGradient)"
                      dot={false}
                      activeDot={{
                        r: 4,
                        fill: strokeColor,
                        stroke: strokeColor,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Blob Size Distribution</CardTitle>
              <CardDescription>From getAvgBlobSizeChart</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Period:</span>
              <select
                value={period}
                onChange={(e) =>
                  setPeriod(e.target.value as "24H" | "7D" | "30D")
                }
                className="h-8 rounded-md px-2 border border-border text-foreground bg-background cursor-pointer text-sm"
              >
                <option value="24H">24 Hours</option>
                <option value="7D">7 Days</option>
                <option value="30D">30 Days</option>
              </select>
              <button
                className="h-8 px-3 rounded-md border border-border text-sm cursor-pointer inline-flex items-center gap-1"
                onClick={() => {
                  const el = document.getElementById("overview-size-pie");
                  if (el)
                    downloadElementAsPng(el, "blob-size-distribution.png");
                }}
              >
                <Download className="h-4 w-4" /> Download
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div id="overview-size-pie" className="h-[300px]">
              {avgQuery.isLoading ? (
                <div className="h-full rounded-md bg-muted" />
              ) : avgQuery.isError ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  Failed to load data
                </div>
              ) : (
                <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
                  <div className="h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          <filter
                            id="shadow"
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
                        {(() => {
                          const series = avgQuery.data?.chart ?? [];
                          const values = series
                            .map((d) => d.value)
                            .filter((v) => Number.isFinite(v));
                          const avg = values.length
                            ? values.reduce((a, b) => a + b, 0) / values.length
                            : 0;
                          const min = values.length ? Math.min(...values) : 0;
                          const max = values.length ? Math.max(...values) : 0;

                          const slices = [
                            { name: "Avg Blob Size", value: avg },
                            { name: "Min Avg (period)", value: min },
                            { name: "Max Avg (period)", value: max },
                          ];

                          const total = slices.reduce(
                            (s, x) => s + (x.value || 0),
                            0
                          );
                          if (total <= 0) {
                            return (
                              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                                No data
                              </div>
                            );
                          }

                          const colors = isDark
                            ? ["#60A5FA", "#34D399", "#F87171"]
                            : ["#3B82F6", "#10B981", "#EF4444"];

                          const CustomPieTooltip = ({
                            active,
                            payload,
                          }: {
                            active?: boolean;
                            payload?: Payload<number, string>[];
                          }) => {
                            if (!active || !payload || !payload.length)
                              return null;
                            const p = payload[0];
                            return (
                              <div
                                className="rounded-md px-2.5 py-1.5 text-xs bg-popover text-popover-foreground shadow"
                                style={{
                                  filter:
                                    "drop-shadow(0 1px 1px rgba(0,0,0,0.1))",
                                }}
                              >
                                <div className="font-medium">{p?.name}</div>
                                <div>
                                  {formatBytes(
                                    Math.max(0, Math.round(p?.value ?? 0))
                                  )}
                                </div>
                              </div>
                            );
                          };

                          return (
                            <>
                              <Tooltip
                                content={<CustomPieTooltip />}
                                wrapperStyle={{ outline: "none" }}
                              />
                              <Pie
                                data={slices}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={70}
                                outerRadius={110}
                                stroke={isDark ? "#111827" : "#FFFFFF"}
                                strokeWidth={6}
                                paddingAngle={2}
                              >
                                {slices.map((s, i) => (
                                  <Cell
                                    key={s.name}
                                    fill={colors[i % colors.length]}
                                  />
                                ))}
                              </Pie>
                            </>
                          );
                        })()}
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {(() => {
                      const series = avgQuery.data?.chart ?? [];
                      const values = series
                        .map((d) => d.value)
                        .filter((v) => Number.isFinite(v));
                      const avg = values.length
                        ? values.reduce((a, b) => a + b, 0) / values.length
                        : 0;
                      const min = values.length ? Math.min(...values) : 0;
                      const max = values.length ? Math.max(...values) : 0;
                      const entries = [
                        {
                          label: "Avg Blob Size",
                          value: avg,
                          color: isDark ? "#60A5FA" : "#3B82F6",
                        },
                        {
                          label: "Min Avg (period)",
                          value: min,
                          color: isDark ? "#34D399" : "#10B981",
                        },
                        {
                          label: "Max Avg (period)",
                          value: max,
                          color: isDark ? "#F87171" : "#EF4444",
                        },
                      ];
                      return entries.map((e) => (
                        <div
                          key={e.label}
                          className="flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: e.color }}
                            />
                            <span className="text-sm text-muted-foreground">
                              {e.label}
                            </span>
                          </div>
                          <span className="text-sm font-medium">
                            {formatBytes(Math.max(0, Math.round(e.value)))}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export { OverviewPage };
