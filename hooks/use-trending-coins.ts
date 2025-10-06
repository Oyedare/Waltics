import { useQuery } from "@tanstack/react-query";

export interface CoinMetadata {
  coinType: string;
  name: string;
  symbol: string;
  iconUrl?: string;
  icon_url?: string;
}

export interface TrendingCoin {
  coinMetadata: CoinMetadata;

  price: number;
  percentagePriceChange1d: number;

  marketCap: number;

  coin1dTradeVolumeUsd: number;
  coin1dTradeCount: number;

  holdersCount: number;
}

export function useTrendingCoins() {
  return useQuery<TrendingCoin[]>({
    queryKey: ["nexa", "trending-coins"],
    queryFn: async () => {
      const res = await fetch(
        "/api/proxy/external-api/insidex/coins/trending",
        { headers: { accept: "application/json" }, cache: "no-store" }
      );
      if (!res.ok) {
        throw new Error("Failed to fetch trending coins");
      }
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
      }
      return data;
    },
    staleTime: 30_000,
  });
}
