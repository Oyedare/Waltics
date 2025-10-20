"use client";

import { useQuery } from "@tanstack/react-query";

export function useDefillamaProtocols() {
  return useQuery({
    queryKey: ["defillama", "protocols"],
    queryFn: async () => {
      const res = await fetch("/api/defillama/protocols");
      if (!res.ok) throw new Error("Failed to load protocols");
      return res.json();
    },
  });
}

export function useDefillamaProtocol(protocol?: string) {
  return useQuery({
    queryKey: ["defillama", "protocol", protocol],
    queryFn: async () => {
      if (!protocol) throw new Error("protocol is required");
      const res = await fetch(
        `/api/defillama/protocol/${encodeURIComponent(protocol)}`
      );
      if (!res.ok) throw new Error("Failed to load protocol detail");
      return res.json();
    },
    enabled: Boolean(protocol),
  });
}

export function useDefillamaProtocolTvl(protocol?: string) {
  return useQuery({
    queryKey: ["defillama", "tvl", protocol],
    queryFn: async () => {
      if (!protocol) throw new Error("protocol is required");
      const res = await fetch(
        `/api/defillama/tvl/${encodeURIComponent(protocol)}`
      );
      if (!res.ok) throw new Error("Failed to load protocol tvl");
      return res.json() as Promise<{ tvl: number }>;
    },
    enabled: Boolean(protocol),
  });
}

export function useDefillamaChains() {
  return useQuery({
    queryKey: ["defillama", "chains"],
    queryFn: async () => {
      const res = await fetch("/api/defillama/chains");
      if (!res.ok) throw new Error("Failed to load chains");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDefillamaHistoricalChains() {
  return useQuery({
    queryKey: ["defillama", "historicalChainTvl"],
    queryFn: async () => {
      const res = await fetch("/api/defillama/historicalChainTvl");
      if (!res.ok) throw new Error("Failed to load historical chain TVL");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDefillamaHistoricalByChain(chain?: string) {
  return useQuery({
    queryKey: ["defillama", "historicalChainTvl", chain],
    queryFn: async () => {
      if (!chain) throw new Error("chain is required");
      const res = await fetch(
        `/api/defillama/historicalChainTvl/${encodeURIComponent(chain)}`
      );
      if (!res.ok) throw new Error("Failed to load chain historical TVL");
      return res.json();
    },
    enabled: Boolean(chain),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSuiOverviewTvl() {
  return useQuery({
    queryKey: ["defillama", "overview", "sui", "tvl"],
    queryFn: async () => {
      const res = await fetch(`/api/defillama/overview/sui/tvl`);
      if (!res.ok) throw new Error("Failed to load Sui TVL overview");
      return res.json() as Promise<{
        tvl: number;
        change24h: number;
        change24hPercent: number;
        latestDate: number;
        prevDate: number | null;
      }>;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useSuiStablecoinMcap() {
  return useQuery({
    queryKey: ["defillama", "overview", "sui", "stablecoins"],
    queryFn: async () => {
      const res = await fetch(`/api/defillama/overview/sui/stablecoins`);
      if (!res.ok) throw new Error("Failed to load Sui stablecoin mcap");
      return res.json() as Promise<{
        stablecoinMcapUSD: number;
        has7dChange: boolean;
        change7d?: number;
        change7dPercent?: number;
        latestDate?: number;
        baseDate?: number | null;
      }>;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSuiFees24h() {
  return useQuery({
    queryKey: ["defillama", "overview", "sui", "fees24h"],
    queryFn: async () => {
      const res = await fetch(`/api/defillama/overview/sui/fees`);
      if (!res.ok) throw new Error("Failed to load Sui fees");
      return res.json() as Promise<{
        chain: {
          total24h: number | null;
          change1d: number | null;
        };
        protocols: Array<{
          id: string;
          name: string;
          logo: string | null;
          total24h: number;
          change1d: number | null;
          category: string | null;
          chains: string[];
        }>;
      }>;
    },
    staleTime: 3 * 60 * 1000,
  });
}

export function useSuiRevenue24h() {
  return useQuery({
    queryKey: ["defillama", "overview", "sui", "revenue24h"],
    queryFn: async () => {
      const res = await fetch(`/api/defillama/overview/sui/revenue`);
      if (!res.ok) throw new Error("Failed to load Sui revenue");
      return res.json() as Promise<{
        chain: {
          total24h: number | null;
          change1d: number | null;
        };
        protocols: Array<{
          id: string;
          name: string;
          logo: string | null;
          total24h: number;
          change1d: number | null;
          category: string | null;
          chains: string[];
        }>;
      }>;
    },
    staleTime: 3 * 60 * 1000,
  });
}

export function useCoinCurrentPrices(
  coinsCsv?: string,
  searchWidth?: "4h" | "24h"
) {
  return useQuery({
    queryKey: ["defillama", "coins", "current", coinsCsv, searchWidth],
    queryFn: async () => {
      if (!coinsCsv) throw new Error("coins are required");
      const url = new URL(
        `/api/defillama/coins/prices/current/${coinsCsv}`,
        window.location.origin
      );
      if (searchWidth) url.searchParams.set("searchWidth", searchWidth);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to load current prices");
      return res.json();
    },
    enabled: Boolean(coinsCsv),
  });
}

export function useCoinHistoricalPrices(
  timestamp?: number,
  coinsCsv?: string,
  searchWidthSeconds?: number
) {
  return useQuery({
    queryKey: [
      "defillama",
      "coins",
      "historical",
      timestamp,
      coinsCsv,
      searchWidthSeconds,
    ],
    queryFn: async () => {
      if (!coinsCsv || !timestamp)
        throw new Error("timestamp and coins are required");
      const url = new URL(
        `/api/defillama/coins/prices/historical/${timestamp}/${coinsCsv}`,
        window.location.origin
      );
      if (searchWidthSeconds)
        url.searchParams.set("searchWidth", String(searchWidthSeconds));
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to load historical prices");
      return res.json();
    },
    enabled: Boolean(coinsCsv && timestamp),
  });
}

export function useCoinChart(
  coinsCsv?: string,
  opts?: {
    period?: "1d" | "7d" | "30d" | "90d" | "180d" | "365d";
    span?: number;
    searchWidth?: string;
  }
) {
  return useQuery({
    queryKey: [
      "defillama",
      "coins",
      "chart",
      coinsCsv,
      opts?.period,
      opts?.span,
      opts?.searchWidth,
    ],
    queryFn: async () => {
      if (!coinsCsv) throw new Error("coins are required");
      const url = new URL(
        `/api/defillama/coins/chart/${coinsCsv}`,
        window.location.origin
      );
      if (opts?.period) url.searchParams.set("period", opts.period);
      if (opts?.span) url.searchParams.set("span", String(opts.span));
      if (opts?.searchWidth)
        url.searchParams.set("searchWidth", opts.searchWidth);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to load chart");
      return res.json();
    },
    enabled: Boolean(coinsCsv),
  });
}

export function useCoinPercentage(
  coinsCsv?: string,
  opts?: { timestamp?: number; lookForward?: boolean; period?: string }
) {
  return useQuery({
    queryKey: [
      "defillama",
      "coins",
      "percentage",
      coinsCsv,
      opts?.timestamp,
      opts?.lookForward,
      opts?.period,
    ],
    queryFn: async () => {
      if (!coinsCsv) throw new Error("coins are required");
      const url = new URL(
        `/api/defillama/coins/percentage/${coinsCsv}`,
        window.location.origin
      );
      if (opts?.timestamp)
        url.searchParams.set("timestamp", String(opts.timestamp));
      if (opts?.lookForward !== undefined)
        url.searchParams.set("lookForward", String(opts.lookForward));
      if (opts?.period) url.searchParams.set("period", String(opts.period));
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to load percentage");
      return res.json();
    },
    enabled: Boolean(coinsCsv),
  });
}

export function useCoinFirstPrice(coinsCsv?: string) {
  return useQuery({
    queryKey: ["defillama", "coins", "first", coinsCsv],
    queryFn: async () => {
      if (!coinsCsv) throw new Error("coins are required");
      const res = await fetch(`/api/defillama/coins/prices/first/${coinsCsv}`);
      if (!res.ok) throw new Error("Failed to load first price");
      return res.json();
    },
    enabled: Boolean(coinsCsv),
  });
}

export function useBlockAt(chain?: string, timestamp?: number) {
  return useQuery({
    queryKey: ["defillama", "coins", "block", chain, timestamp],
    queryFn: async () => {
      if (!chain || !timestamp)
        throw new Error("chain and timestamp are required");
      const res = await fetch(
        `/api/defillama/coins/block/${chain}/${timestamp}`
      );
      if (!res.ok) throw new Error("Failed to load block");
      return res.json();
    },
    enabled: Boolean(chain && timestamp),
  });
}

export function useSuiDexs() {
  return useQuery({
    queryKey: ["defillama", "dexs", "sui"],
    queryFn: async () => {
      const res = await fetch(`/api/defillama/dexs/sui`);
      if (!res.ok) throw new Error("Failed to load SUI DEXs");
      return res.json() as Promise<{
        totalVolume: {
          total24h: number | null;
          total7d: number | null;
          total30d: number | null;
          change1d: number | null;
          change7d: number | null;
          change30d: number | null;
        };
        dexs: Array<{
          id: string;
          name: string;
          logo: string | null;
          total24h: number | null;
          total7d: number | null;
          total30d: number | null;
          change1d: number | null;
          change7d: number | null;
          change30d: number | null;
          category: string | null;
          chains: string[];
        }>;
        chartData: Array<{
          date: number;
          volume: number;
        }>;
        chain: string;
      }>;
    },
    staleTime: 3 * 60 * 1000,
  });
}

export function useSuiOptionsDexs(
  dataType: "dailyNotionalVolume" | "dailyPremiumVolume" = "dailyNotionalVolume"
) {
  return useQuery({
    queryKey: ["defillama", "options", "sui", dataType],
    queryFn: async () => {
      const res = await fetch(
        `/api/defillama/options/sui?dataType=${dataType}`
      );
      if (!res.ok) throw new Error("Failed to load SUI options DEXs");
      return res.json() as Promise<{
        totalVolume: {
          total24h: number | null;
          total7d: number | null;
          total30d: number | null;
          change1d: number | null;
          change7d: number | null;
          change30d: number | null;
        };
        protocols: Array<{
          id: string;
          name: string;
          logo: string | null;
          total24h: number | null;
          total7d: number | null;
          total30d: number | null;
          change1d: number | null;
          change7d: number | null;
          change30d: number | null;
          category: string | null;
          chains: string[];
        }>;
        chartData: Array<{
          date: number;
          volume: number;
        }>;
        chain: string;
        dataType: string;
      }>;
    },
    staleTime: 3 * 60 * 1000,
  });
}

export function useSuiStablecoins() {
  return useQuery({
    queryKey: ["defillama", "stablecoins", "sui"],
    queryFn: async () => {
      const res = await fetch(`/api/defillama/stablecoins`);
      if (!res.ok) throw new Error("Failed to load SUI stablecoins");
      return res.json() as Promise<{
        stablecoins: Array<{
          id: string;
          name: string;
          symbol: string;
          logo: string | null;
          circulatingSui: number;
          price: number;
          marketCap: number;
          pegType: string | null;
          pegMechanism: string | null;
        }>;
        totalMarketCap: number;
        count: number;
      }>;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSuiStablecoinsHistory() {
  return useQuery({
    queryKey: ["defillama", "stablecoins", "sui", "history"],
    queryFn: async () => {
      const res = await fetch(`/api/defillama/stablecoins/sui/history`);
      if (!res.ok) throw new Error("Failed to load SUI stablecoins history");
      return res.json() as Promise<{
        chartData: Array<{
          date: number;
          totalCirculating: number;
        }>;
        change7d: number | null;
      }>;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSuiYields() {
  return useQuery({
    queryKey: ["defillama", "yields", "sui"],
    queryFn: async () => {
      const res = await fetch(`/api/defillama/yields/sui`);
      if (!res.ok) throw new Error("Failed to load SUI yields");
      return res.json() as Promise<{
        pools: Array<{
          poolId: string;
          project: string;
          symbol: string;
          tvlUsd: number;
          apy: number;
          apyBase: number;
          apyReward: number;
          apyPct1D: number | null;
          apyPct7D: number | null;
          apyPct30D: number | null;
          rewardTokens: string[];
          stablecoin: boolean;
          ilRisk: string;
          exposure: string;
          predictions: any;
          underlyingTokens: string[];
          poolMeta: string | null;
        }>;
        stats: {
          totalTvl: number;
          avgApy: number;
          maxApy: number;
          poolCount: number;
          topPool: any;
        };
      }>;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSuiCurrentPrice() {
  return useQuery({
    queryKey: ["defillama", "coins", "sui", "current"],
    queryFn: async () => {
      const res = await fetch(`/api/defillama/coins/sui/current`);
      if (!res.ok) throw new Error("Failed to load SUI price");
      return res.json() as Promise<{
        price: number;
        symbol: string;
        timestamp: number;
        confidence: number;
      }>;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useSuiPricePercentage(period: string = "24h") {
  return useQuery({
    queryKey: ["defillama", "coins", "sui", "percentage", period],
    queryFn: async () => {
      const res = await fetch(
        `/api/defillama/coins/sui/percentage?period=${period}`
      );
      if (!res.ok) throw new Error("Failed to load SUI percentage");
      return res.json() as Promise<{
        change: number | null;
        period: string;
      }>;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSuiPriceChart(period: string = "30d") {
  return useQuery({
    queryKey: ["defillama", "coins", "sui", "chart", period],
    queryFn: async () => {
      const res = await fetch(
        `/api/defillama/coins/sui/chart?period=${period}&span=100`
      );
      if (!res.ok) throw new Error("Failed to load SUI chart");
      return res.json() as Promise<{
        symbol: string;
        confidence: number;
        chartData: Array<{
          timestamp: number;
          price: number;
        }>;
      }>;
    },
    staleTime: 5 * 60 * 1000,
  });
}
