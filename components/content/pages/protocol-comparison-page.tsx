"use client";

import { memo, useState, useMemo } from "react";
import {
  useSuiFees24h,
  useSuiRevenue24h,
  useDefillamaProtocols,
} from "@/hooks/use-defillama";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import Image from "next/image";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useTheme } from "next-themes";

function formatCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(3)}B`;
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(3)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(3)}K`;
  return `$${n.toFixed(2)}`;
}

interface ProtocolData {
  id: string;
  name: string;
  logo: string | null;
  category: string | null;
  chains: string[];
  fees24h: number | null;
  feesChange1d: number | null;
  revenue24h: number | null;
  revenueChange1d: number | null;
  tvl: number | null;
  tvlChange1d: number | null;
  tvlChange7d: number | null;
}

function ProtocolSelector({
  protocols,
  selectedProtocols,
  onSelect,
  onRemove,
}: {
  protocols: ProtocolData[];
  selectedProtocols: string[];
  onSelect: (protocolId: string) => void;
  onRemove: (protocolId: string) => void;
}) {
  const availableProtocols = protocols.filter(
    (p) => !selectedProtocols.includes(p.id)
  );

  return (
    <Card id="protocol-selector-card" className="relative">
      <div className="absolute top-2 right-2 z-10">
        <DownloadButton
          elementId="protocol-selector-card"
          filename="protocol-selector.png"
          size="sm"
          showText={false}
        />
      </div>
      <CardHeader>
        <CardTitle>Select Protocols to Compare</CardTitle>
        <CardDescription>
          Choose up to 4 protocols to compare side-by-side
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Protocols */}
        {selectedProtocols.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Selected ({selectedProtocols.length}/4):
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedProtocols.map((protocolId) => {
                const protocol = protocols.find((p) => p.id === protocolId);
                if (!protocol) return null;
                return (
                  <Badge
                    key={protocolId}
                    variant="secondary"
                    className="flex items-center gap-2 px-3 py-1.5"
                  >
                    {protocol.logo && (
                      <Image
                        src={protocol.logo}
                        alt={protocol.name}
                        width={16}
                        height={16}
                        className="rounded-sm"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <span>{protocol.name}</span>
                    <button
                      onClick={() => onRemove(protocolId)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Protocol Selector */}
        {selectedProtocols.length < 4 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Add Protocol:
            </div>
            <Select
              onValueChange={onSelect}
              disabled={selectedProtocols.length >= 4}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a protocol to compare..." />
              </SelectTrigger>
              <SelectContent>
                {availableProtocols.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No more protocols available
                  </div>
                ) : (
                  availableProtocols.map((protocol) => (
                    <SelectItem key={protocol.id} value={protocol.id}>
                      <div className="flex items-center gap-2">
                        {protocol.logo && (
                          <Image
                            src={protocol.logo}
                            alt={protocol.name}
                            width={20}
                            height={20}
                            className="rounded-sm"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                        <span>{protocol.name}</span>
                        {protocol.category && (
                          <span className="text-xs text-muted-foreground">
                            ({protocol.category})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedProtocols.length >= 4 && (
          <p className="text-xs text-muted-foreground">
            Maximum of 4 protocols can be compared at once
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ComparisonTable({ protocols }: { protocols: ProtocolData[] }) {
  const { theme } = useTheme();

  if (protocols.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Select at least 2 protocols to compare
          </div>
        </CardContent>
      </Card>
    );
  }

  const comparisonData = [
    {
      label: "Protocol",
      values: protocols.map((p) => ({
        value: (
          <div className="flex items-center gap-2">
            {p.logo && (
              <Image
                src={p.logo}
                alt={p.name}
                width={24}
                height={24}
                className="rounded-sm"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
            <span className="font-medium">{p.name}</span>
          </div>
        ),
      })),
    },
    {
      label: "Category",
      values: protocols.map((p) => ({
        value: p.category || "-",
      })),
    },
    {
      label: "Chains",
      values: protocols.map((p) => ({
        value: (
          <div className="flex flex-wrap gap-1">
            {p.chains.slice(0, 3).map((chain) => (
              <Badge key={chain} variant="outline" className="text-xs">
                {chain}
              </Badge>
            ))}
            {p.chains.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{p.chains.length - 3}
              </Badge>
            )}
          </div>
        ),
      })),
    },
    {
      label: "TVL",
      values: protocols.map((p) => ({
        value: p.tvl != null ? formatCompact(p.tvl) : "-",
        highlight: true,
      })),
    },
    {
      label: "TVL Change (24h)",
      values: protocols.map((p) => {
        const change = p.tvlChange1d;
        if (change == null) return { value: "-" };
        const isPositive = change >= 0;
        return {
          value: (
            <span
              className={`flex items-center gap-1 ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {isPositive ? "+" : ""}
              {change.toFixed(2)}%
            </span>
          ),
        };
      }),
    },
    {
      label: "TVL Change (7d)",
      values: protocols.map((p) => {
        const change = p.tvlChange7d;
        if (change == null) return { value: "-" };
        const isPositive = change >= 0;
        return {
          value: (
            <span
              className={`flex items-center gap-1 ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {isPositive ? "+" : ""}
              {change.toFixed(2)}%
            </span>
          ),
        };
      }),
    },
    {
      label: "Fees (24h)",
      values: protocols.map((p) => ({
        value: p.fees24h != null ? formatCompact(p.fees24h) : "-",
        highlight: true,
      })),
    },
    {
      label: "Fees Change (24h)",
      values: protocols.map((p) => {
        const change = p.feesChange1d;
        if (change == null) return { value: "-" };
        const isPositive = change >= 0;
        return {
          value: (
            <span
              className={`flex items-center gap-1 ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {isPositive ? "+" : ""}
              {change.toFixed(2)}%
            </span>
          ),
        };
      }),
    },
    {
      label: "Revenue (24h)",
      values: protocols.map((p) => ({
        value: p.revenue24h != null ? formatCompact(p.revenue24h) : "-",
        highlight: true,
      })),
    },
    {
      label: "Revenue Change (24h)",
      values: protocols.map((p) => {
        const change = p.revenueChange1d;
        if (change == null) return { value: "-" };
        const isPositive = change >= 0;
        return {
          value: (
            <span
              className={`flex items-center gap-1 ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {isPositive ? "+" : ""}
              {change.toFixed(2)}%
            </span>
          ),
        };
      }),
    },
  ];

  return (
    <Card id="protocol-comparison-table" className="relative">
      <div className="absolute top-2 right-2 z-10">
        <DownloadButton
          elementId="protocol-comparison-table"
          filename="protocol-comparison-table.png"
          size="sm"
          showText={false}
        />
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Protocol Comparison
        </CardTitle>
        <CardDescription>
          Side-by-side comparison of selected protocols
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Metric</TableHead>
                {protocols.map((protocol) => (
                  <TableHead key={protocol.id} className="min-w-[200px]">
                    <div className="flex items-center gap-2">
                      {protocol.logo && (
                        <Image
                          src={protocol.logo}
                          alt={protocol.name}
                          width={20}
                          height={20}
                          className="rounded-sm"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                      <span className="font-medium">{protocol.name}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  {row.values.map((item, colIndex) => (
                    <TableCell
                      key={colIndex}
                      className="font-semibold"
                    >
                      {item.value}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function ComparisonCharts({ protocols }: { protocols: ProtocolData[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (protocols.length === 0) return null;

  const colors = isDark
    ? ["#60A5FA", "#34D399", "#F87171", "#A78BFA"]
    : ["#3B82F6", "#10B981", "#EF4444", "#8B5CF6"];

  // TVL Comparison Chart
  const tvlData = protocols.map((p, index) => ({
    name: p.name,
    tvl: p.tvl || 0,
    color: colors[index % colors.length],
  }));

  // Fees Comparison Chart
  const feesData = protocols.map((p, index) => ({
    name: p.name,
    fees: p.fees24h || 0,
    color: colors[index % colors.length],
  }));

  // Revenue Comparison Chart
  const revenueData = protocols.map((p, index) => ({
    name: p.name,
    revenue: p.revenue24h || 0,
    color: colors[index % colors.length],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div
          className="rounded-md px-2.5 py-1.5 text-xs bg-popover text-popover-foreground shadow"
          style={{
            filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))",
          }}
        >
          <div className="font-medium">{data.name}</div>
          <div>{formatCompact(data.value)}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* TVL Comparison */}
      <Card id="tvl-comparison-chart" className="relative">
        <div className="absolute top-2 right-2 z-10">
          <DownloadButton
            elementId="tvl-comparison-chart"
            filename="tvl-comparison-chart.png"
            size="sm"
            showText={false}
          />
        </div>
        <CardHeader>
          <CardTitle className="text-base">TVL Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tvlData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fill: isDark ? "#9CA3AF" : "#6B7280" }}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="tvl" radius={[0, 4, 4, 0]}>
                  {tvlData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Fees Comparison */}
      <Card id="fees-comparison-chart" className="relative">
        <div className="absolute top-2 right-2 z-10">
          <DownloadButton
            elementId="fees-comparison-chart"
            filename="fees-comparison-chart.png"
            size="sm"
            showText={false}
          />
        </div>
        <CardHeader>
          <CardTitle className="text-base">Fees (24h) Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feesData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fill: isDark ? "#9CA3AF" : "#6B7280" }}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="fees" radius={[0, 4, 4, 0]}>
                  {feesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Comparison */}
      <Card id="revenue-comparison-chart" className="relative">
        <div className="absolute top-2 right-2 z-10">
          <DownloadButton
            elementId="revenue-comparison-chart"
            filename="revenue-comparison-chart.png"
            size="sm"
            showText={false}
          />
        </div>
        <CardHeader>
          <CardTitle className="text-base">Revenue (24h) Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fill: isDark ? "#9CA3AF" : "#6B7280" }}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const ProtocolComparisonPage = memo(function ProtocolComparisonPage() {
  const { data: feesData, isLoading: feesLoading } = useSuiFees24h();
  const { data: revenueData, isLoading: revenueLoading } = useSuiRevenue24h();
  const { data: protocolsData, isLoading: protocolsLoading } =
    useDefillamaProtocols();

  const [selectedProtocolIds, setSelectedProtocolIds] = useState<string[]>([]);

  // Merge all protocol data
  const protocols = useMemo(() => {
    const protocolsMap = new Map<string, ProtocolData>();

    // Add fees data
    feesData?.protocols?.forEach((p: any) => {
      protocolsMap.set(p.id, {
        id: p.id,
        name: p.name,
        logo: p.logo,
        category: p.category,
        chains: p.chains || [],
        fees24h: p.total24h,
        feesChange1d: p.change1d,
        revenue24h: null,
        revenueChange1d: null,
        tvl: null,
        tvlChange1d: null,
        tvlChange7d: null,
      });
    });

    // Add revenue data
    revenueData?.protocols?.forEach((p: any) => {
      const existing = protocolsMap.get(p.id);
      if (existing) {
        existing.revenue24h = p.total24h;
        existing.revenueChange1d = p.change1d;
        if (!existing.logo && p.logo) existing.logo = p.logo;
        if (!existing.category && p.category) existing.category = p.category;
      } else {
        protocolsMap.set(p.id, {
          id: p.id,
          name: p.name,
          logo: p.logo,
          category: p.category,
          chains: p.chains || [],
          fees24h: null,
          feesChange1d: null,
          revenue24h: p.total24h,
          revenueChange1d: p.change1d,
          tvl: null,
          tvlChange1d: null,
          tvlChange7d: null,
        });
      }
    });

    // Add TVL data from protocols list
    if (protocolsData && Array.isArray(protocolsData)) {
      protocolsData.forEach((p: any) => {
        const protocolId =
          p.id || p.slug || p.name?.toLowerCase().replace(/\s+/g, "-");
        if (!protocolId) return;

        const existing = protocolsMap.get(protocolId);
        if (existing) {
          existing.tvl = typeof p.tvl === "number" ? p.tvl : null;
          existing.tvlChange1d =
            typeof p.change_1d === "number" ? p.change_1d : null;
          existing.tvlChange7d =
            typeof p.change_7d === "number" ? p.change_7d : null;
          if (!existing.logo && p.logo) existing.logo = p.logo;
          if (!existing.category && p.category) existing.category = p.category;
          if (!existing.chains.length && p.chains) {
            existing.chains = Array.isArray(p.chains) ? p.chains : [];
          }
        } else {
          protocolsMap.set(protocolId, {
            id: protocolId,
            name: p.name || "Unknown",
            logo: p.logo || null,
            category: p.category || null,
            chains: Array.isArray(p.chains) ? p.chains : [],
            fees24h: null,
            feesChange1d: null,
            revenue24h: null,
            revenueChange1d: null,
            tvl: typeof p.tvl === "number" ? p.tvl : null,
            tvlChange1d: typeof p.change_1d === "number" ? p.change_1d : null,
            tvlChange7d: typeof p.change_7d === "number" ? p.change_7d : null,
          });
        }
      });
    }

    return Array.from(protocolsMap.values()).sort((a, b) => {
      const aTotal = (a.fees24h || 0) + (a.revenue24h || 0) + (a.tvl || 0);
      const bTotal = (b.fees24h || 0) + (b.revenue24h || 0) + (b.tvl || 0);
      return bTotal - aTotal;
    });
  }, [feesData, revenueData, protocolsData]);

  const selectedProtocols = useMemo(() => {
    return protocols.filter((p) => selectedProtocolIds.includes(p.id));
  }, [protocols, selectedProtocolIds]);

  const handleSelectProtocol = (protocolId: string) => {
    if (
      selectedProtocolIds.length < 4 &&
      !selectedProtocolIds.includes(protocolId)
    ) {
      setSelectedProtocolIds([...selectedProtocolIds, protocolId]);
    }
  };

  const handleRemoveProtocol = (protocolId: string) => {
    setSelectedProtocolIds(
      selectedProtocolIds.filter((id) => id !== protocolId)
    );
  };

  const isLoading = feesLoading || revenueLoading || protocolsLoading;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Protocol Comparison</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Compare up to 4 Sui protocols side-by-side
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
      ) : (
        <>
          <ProtocolSelector
            protocols={protocols}
            selectedProtocols={selectedProtocolIds}
            onSelect={handleSelectProtocol}
            onRemove={handleRemoveProtocol}
          />

          {selectedProtocols.length >= 2 && (
            <>
              <ComparisonTable protocols={selectedProtocols} />
              <ComparisonCharts protocols={selectedProtocols} />
            </>
          )}

          {selectedProtocols.length === 1 && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  Select at least 2 protocols to compare
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
});

export { ProtocolComparisonPage };
