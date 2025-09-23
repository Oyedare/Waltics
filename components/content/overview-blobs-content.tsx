"use client";

import React, { memo } from "react";
import {
  Database,
  TrendingUp,
  Calendar,
  Users,
  HardDrive,
  Shield,
  Activity,
} from "lucide-react";
import { useBlobsPaginated } from "@/hooks/use-blobs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatBytes,
  formatNumber,
  getBlobSizeDistribution,
  getDailyBlobCount,
  calculateBlobStats,
} from "@/lib/blob-utils";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

const OverviewBlobsContent = memo(function OverviewBlobsContent() {
  const { data, isLoading, error } = useBlobsPaginated();

  if (isLoading) {
    return (
      <div className="p-6 h-full">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 h-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground">
              Error Loading Data
            </h3>
            <p className="text-muted-foreground">Failed to fetch blob data</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.content) {
    return (
      <div className="p-6 h-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground">
              No Data Available
            </h3>
            <p className="text-muted-foreground">No blob data found</p>
          </div>
        </div>
      </div>
    );
  }

  const blobs = data.content;
  const stats = calculateBlobStats(blobs);
  const palette = ["#4285F4", "#34A853", "#EA4335"]; // blue, green, red
  const zPriority: Record<string, number> = {
    "#EA4335": 0, // red bottom
    "#34A853": 1, // green middle (laps red)
    "#4285F4": 2, // blue top (laps green)
  };
  const sizeDistribution = getBlobSizeDistribution(blobs).map((d, i) => ({
    ...d,
    color: palette[i] ?? d.color,
  }));
  const dailyCount = getDailyBlobCount(blobs);

  return (
    <div className="p-6 h-full space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blobs</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(data.totalElements)}
            </div>
            {/* <p className="text-xs text-muted-foreground">
              {formatNumber(blobs.length)} in current page
            </p> */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(stats.totalSize)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average: {formatBytes(stats.avgSize)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Certified Blobs
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(stats.certifiedCount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.certificationRate.toFixed(1)}% certification rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Blobs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(blobs.length)}
            </div>
            <p className="text-xs text-muted-foreground">Currently displayed</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Size Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Blob Size Distribution</CardTitle>
            <CardDescription>
              Distribution of blobs by size categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center gap-6">
              <div className="flex-1 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    {(() => {
                      const total = blobs.length || 1;
                      const gap = 0;
                      let currentStart = 90;
                      const segments = sizeDistribution.map((seg) => {
                        const angle = (seg.value / total) * 360;
                        const startAngle = currentStart;
                        const endAngle = currentStart - angle;
                        currentStart = endAngle - gap;
                        return { ...seg, startAngle, endAngle };
                      });

                      // Render with controlled z-index: red bottom, green middle, blue top
                      return segments
                        .sort(
                          (a, b) =>
                            (zPriority[a.color] ?? 0) -
                            (zPriority[b.color] ?? 0)
                        )
                        .map((seg, idx) => (
                          <Pie
                            key={`seg-${idx}`}
                            data={[{ name: seg.name, value: 1 }]}
                            dataKey="value"
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            startAngle={seg.startAngle}
                            endAngle={seg.endAngle}
                            cornerRadius={14}
                            stroke="none"
                          >
                            <Cell fill={seg.color} />
                          </Pie>
                        ));
                    })()}
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-48 space-y-3">
                {sizeDistribution.map((entry) => (
                  <div
                    key={entry.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {entry.name}
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {((entry.value / blobs.length) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Blob Count Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Blob Creation</CardTitle>
            <CardDescription>
              Number of new blobs created per day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyCount}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                    formatter={(value) => [value, "Blobs"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Average Blob Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(stats.avgSize)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export { OverviewBlobsContent };
