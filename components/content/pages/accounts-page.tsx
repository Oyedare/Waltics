"use client";

import React, { memo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Users } from "lucide-react";
import { useTotalAccounts } from "@/hooks/use-total-accounts";
import { formatNumber } from "@/lib/blob-utils";
import { useTheme } from "next-themes";
import { useAccountByHash } from "@/hooks/use-account-by-hash";
import { Download } from "lucide-react";
import { downloadElementAsPng } from "@/lib/download";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const AccountsPage = memo(function AccountsPage() {
  const [period, setPeriod] = useState<"24H" | "7D" | "30D">("7D");
  const { data, isLoading, isError } = useTotalAccounts(period);
  const totalAccounts = data?.value ?? null;
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const strokeColor = isDark ? "#FFFFFF" : "#0A0A0A";
  const cursorColor = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";

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

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const val = payload[0]?.value as number;
    const ts = payload[0]?.payload?.timestamp as number | undefined;
    return (
      <div
        className="pointer-events-none text-center"
        style={{ transform: "translate(-50%, -14px)" }}
      >
        <div className="text-[10px] leading-none mb-1 text-foreground/80">
          {ts
            ? new Date(ts).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : ""}
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
              Accounts on Walrus
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? "…"
                : isError
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
              <CardTitle>Account Growth Over Time</CardTitle>
              <CardDescription>From getAccountsCountChart</CardDescription>
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
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
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
                        id="accountGradient"
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
                      fill="url(#accountGradient)"
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
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Fetch account by address</CardDescription>
          </CardHeader>
          <CardContent>
            <AccountDetailsPanel />
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export { AccountsPage };

function AccountDetailsPanel() {
  const [address, setAddress] = React.useState("");
  const addr = address.trim() || null;
  const { data, isLoading, isError, refetch, isFetching } =
    useAccountByHash(addr);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter account address (0x...)"
          className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 ring-offset-0 ring-ring"
        />
        <button
          className="h-9 rounded-md px-3 border border-border cursor-pointer"
          onClick={() => refetch()}
          disabled={!addr || isFetching}
        >
          Fetch
        </button>
        <button
          className="h-9 rounded-md px-3 border border-border cursor-pointer inline-flex items-center gap-1"
          onClick={() => {
            const el = document.getElementById("account-detail-panel");
            if (el) downloadElementAsPng(el, "account-detail.png");
          }}
          disabled={!data}
        >
          <Download className="h-4 w-4" /> Download
        </button>
      </div>

      {!addr ? (
        <div className="text-sm text-muted-foreground">
          Enter an address to view details.
        </div>
      ) : isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : isError ? (
        <div className="text-sm text-muted-foreground">
          Failed to load account details.
        </div>
      ) : !data ? (
        <div className="text-sm text-muted-foreground">No data.</div>
      ) : (
        <div
          id="account-detail-panel"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm"
        >
          <div className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground">Address</div>
              <div className="font-medium break-all">{data.address}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">First Seen</div>
              <div className="font-medium">
                {new Date(data.firstSeen).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Last Seen</div>
              <div className="font-medium">
                {new Date(data.lastSeen).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground">Events</div>
              <div className="font-medium">{data.events.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Blobs</div>
              <div className="font-medium">{data.blobs.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Balance</div>
              <div className="font-medium">{data.balance}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
