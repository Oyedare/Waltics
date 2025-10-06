import { useQuery } from "@tanstack/react-query";

export type LatestMemeLauncherCoin = {
  _id?: string;
  bondingProgress?: number;
  buyTradeCount?: number;
  buyVolume?: number;
  coinDev?: string;
  coinSupply?: number;
  coinType?: string;
  createdAt?: number;
  decimals?: number;
  description?: string;
  dev?: string;
  iconUrl?: string;
  icon_url?: string;
  id?: string;
  isHoneypot?: boolean;
  isMemeZone?: boolean;
  marketCap?: number;
  name?: string;
  platform?: string;
  price?: number;
  sellTradeCount?: number;
  sellVolume?: number;
  suiPrice?: number;
  supply?: number;
  symbol?: string;
  telegram?: string;
  treasuryCap?: string;
  treasuryCapOwner?: {
    AddressOwner?: string;
  };
  twitter?: string;
  virtualSui?: number;
  website?: string;
  lastTradeAt?: string;
  threshold?: number;
  dexPaid?: boolean;
  holdersCount?: number;
  top10HoldersPercent?: number;
  pools?: Array<{
    _id?: string;
    pool?: string;
    "0x2::sui::SUI"?: number;
    [key: string]: any;
    amountAAdded?: number;
    amountAClaimed?: number;
    amountARemoved?: number;
    amountBAdded?: number;
    amountBClaimed?: number;
    amountBRemoved?: number;
    platform?: string;
    swapCount?: number;
    coinA?: string;
    coinB?: string;
    liqA?: number;
    liqB?: number;
    liqUsd?: number;
    price?: number;
  }>;
  sniperHoldings?: number;
  bundleHoldings?: number;
  sniperHoldingsPercent?: number;
  bundleHoldingsPercent?: number;
};

export function useLatestMemeLauncherCoins() {
  return useQuery<LatestMemeLauncherCoin[]>({
    queryKey: ["nexa", "latest-meme-launcher-coins"],
    queryFn: async () => {
      const res = await fetch(
        "/api/proxy/external-api/insidex/memezone/latest",
        {
          headers: { accept: "application/json" },
          cache: "no-store",
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Request failed: ${res.status}`);
      }
      return res.json();
    },
    staleTime: 30_000,
  });
}
