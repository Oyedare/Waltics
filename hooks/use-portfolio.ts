"use client";

import { useQuery } from "@tanstack/react-query";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { useMemo } from "react";

export interface PortfolioAsset {
  type: string;
  balance: string;
  symbol: string;
  name: string;
  decimals: number;
  valueUSD: number;
  priceUSD: number;
}

export interface PortfolioData {
  totalValueUSD: number;
  assets: PortfolioAsset[];
  totalYield24h: number;
  totalYield7d: number;
  totalYield30d: number;
  pnl24h: number;
  pnl7d: number;
  pnl30d: number;
  pnlPercent24h: number;
  pnlPercent7d: number;
  pnlPercent30d: number;
}

// Common Sui token types and their symbols
const TOKEN_SYMBOLS: Record<
  string,
  { symbol: string; name: string; decimals: number }
> = {
  "0x2::sui::SUI": { symbol: "SUI", name: "Sui", decimals: 9 },
  "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN":
    {
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
    },
  "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN":
    {
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
    },
  "0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS":
    {
      symbol: "CETUS",
      name: "Cetus",
      decimals: 9,
    },
  "0x5d1f47ea69bb0de31c313d7acf89b890dbb8991ea8e03c6c355171f84bb1ba4a::turbos::TURBOS":
    {
      symbol: "TURBOS",
      name: "Turbos",
      decimals: 9,
    },
};

// Fetch token price from DeFiLlama or use mock data
async function getTokenPrice(symbol: string): Promise<number> {
  try {
    // Try to fetch from DeFiLlama API
    if (symbol === "SUI") {
      const response = await fetch("/api/defillama/coins/sui/current");
      if (response.ok) {
        const data = await response.json();
        return data.price || 0;
      }
    }
    // Fallback to mock prices for demo
    const mockPrices: Record<string, number> = {
      SUI: 1.5,
      USDC: 1.0,
      USDT: 1.0,
      CETUS: 0.05,
      TURBOS: 0.02,
    };
    return mockPrices[symbol] || 0;
  } catch {
    return 0;
  }
}

// Helper function to get token metadata from type string
function getTokenMetadata(type: string): {
  symbol: string;
  name: string;
  decimals: number;
} | null {
  // Check if it's in our known tokens
  if (TOKEN_SYMBOLS[type]) {
    return TOKEN_SYMBOLS[type];
  }

  // Try to extract symbol from type string
  // Format: package::module::SYMBOL or package::module::coin::COIN
  const parts = type.split("::");
  if (parts.length >= 3) {
    const symbol = parts[parts.length - 1];
    // Common patterns
    if (symbol === "COIN" && parts.length >= 4) {
      const moduleName = parts[parts.length - 2];
      return {
        symbol: moduleName.toUpperCase(),
        name: moduleName.charAt(0).toUpperCase() + moduleName.slice(1),
        decimals: 9, // Default to 9 for Sui tokens
      };
    }
    return {
      symbol: symbol,
      name: symbol,
      decimals: 9, // Default to 9 for Sui tokens
    };
  }

  return null;
}

// Get balance for a specific coin type
async function getCoinBalance(
  client: SuiClient,
  address: string,
  coinType: string
): Promise<string> {
  try {
    const balance = await client.getBalance({
      owner: address,
      coinType: coinType,
    });
    return balance.totalBalance;
  } catch (error) {
    console.error(`Error fetching balance for ${coinType}:`, error);
    return "0";
  }
}

async function fetchPortfolioData(address: string): Promise<PortfolioData> {
  const client = new SuiClient({ url: getFullnodeUrl("mainnet") });

  try {
    // Get SUI balance (native token) and coin objects in parallel
    const [suiBalance, firstPage] = await Promise.all([
      client.getBalance({ owner: address }),
      client.getOwnedObjects({
        owner: address,
        filter: {
          StructType: "0x2::coin::Coin",
        },
        options: {
          showType: true,
          showContent: false,
        },
        limit: 50, // Limit initial fetch
      }),
    ]);

    // Extract unique coin types from first page only (to avoid too many requests)
    const coinTypes = new Set<string>();
    for (const obj of firstPage.data) {
      if (obj.data?.type) {
        const match = obj.data.type.match(/0x2::coin::Coin<(.+)>/);
        if (match && match[1]) {
          coinTypes.add(match[1]);
        }
      }
    }

    // Limit to top 20 coin types to avoid too many API calls
    const coinTypesArray = Array.from(coinTypes).slice(0, 20);

    // Process assets
    const assets: PortfolioAsset[] = [];
    const suiPrice = await getTokenPrice("SUI");

    // Add SUI balance (native token)
    if (
      suiBalance.totalBalance &&
      BigInt(suiBalance.totalBalance) > BigInt(0)
    ) {
      const balance = BigInt(suiBalance.totalBalance);
      const balanceNumber = Number(balance) / 1e9;
      assets.push({
        type: "0x2::sui::SUI",
        balance: suiBalance.totalBalance,
        symbol: "SUI",
        name: "Sui",
        decimals: 9,
        valueUSD: balanceNumber * suiPrice,
        priceUSD: suiPrice,
      });
    }

    // Batch fetch all coin balances in parallel (much faster!)
    const balancePromises = coinTypesArray
      .filter((coinType) => coinType !== "0x2::sui::SUI")
      .map((coinType) =>
        getCoinBalance(client, address, coinType).then((balance) => ({
          coinType,
          balance,
        }))
      );

    const balances = await Promise.all(balancePromises);

    // Process balances and prepare price fetches
    const pricePromises: Promise<{
      coinType: string;
      symbol: string;
      price: number;
    }>[] = [];
    const tokenMetadataMap = new Map<
      string,
      { symbol: string; name: string; decimals: number }
    >();
    const balanceMap = new Map<string, string>(); // coinType -> balance

    for (const { coinType, balance } of balances) {
      if (BigInt(balance) === BigInt(0)) continue; // Skip zero balances

      balanceMap.set(coinType, balance);
      const metadata = getTokenMetadata(coinType);

      if (!metadata) {
        // Unknown token - add immediately
        assets.push({
          type: coinType,
          balance: balance,
          symbol: "UNKNOWN",
          name: "Unknown Token",
          decimals: 9,
          valueUSD: 0,
          priceUSD: 0,
        });
        continue;
      }

      tokenMetadataMap.set(coinType, metadata);
      // Fetch prices in parallel
      pricePromises.push(
        getTokenPrice(metadata.symbol).then((price) => ({
          coinType,
          symbol: metadata.symbol,
          price,
        }))
      );
    }

    // Wait for all prices to be fetched
    const prices = await Promise.all(pricePromises);
    const priceMap = new Map<string, number>(); // coinType -> price

    for (const { coinType, symbol, price } of prices) {
      priceMap.set(coinType, price);
    }

    // Build final assets array with prices
    for (const [coinType, balance] of balanceMap.entries()) {
      const metadata = tokenMetadataMap.get(coinType);
      if (!metadata) continue; // Already added as unknown

      const price = priceMap.get(coinType) || 0;
      const balanceNumber =
        Number(BigInt(balance)) / Math.pow(10, metadata.decimals);

      assets.push({
        type: coinType,
        balance: balance,
        symbol: metadata.symbol,
        name: metadata.name,
        decimals: metadata.decimals,
        valueUSD: balanceNumber * price,
        priceUSD: price,
      });
    }

    // Sort assets by value (highest first)
    assets.sort((a, b) => b.valueUSD - a.valueUSD);

    const totalValueUSD = assets.reduce(
      (sum, asset) => sum + asset.valueUSD,
      0
    );

    return {
      totalValueUSD,
      assets,
      totalYield24h: 0,
      totalYield7d: 0,
      totalYield30d: 0,
      pnl24h: 0,
      pnl7d: 0,
      pnl30d: 0,
      pnlPercent24h: 0,
      pnlPercent7d: 0,
      pnlPercent30d: 0,
    };
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    throw error;
  }
}

export function usePortfolio(address: string | null) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["portfolio", address],
    queryFn: () => fetchPortfolioData(address!),
    enabled: !!address && address.length > 0,
    refetchInterval: false, // Disable auto-refetch to prevent loops
    retry: 2, // Retry failed requests up to 2 times
    staleTime: 60000, // Consider data fresh for 1 minute
  });

  const assetAllocation = useMemo(() => {
    if (!data) return [];
    return data.assets.map((asset) => ({
      name: asset.symbol,
      value: asset.valueUSD,
      percentage: (asset.valueUSD / data.totalValueUSD) * 100,
    }));
  }, [data]);

  return {
    portfolio: data,
    isLoading,
    error,
    refetch,
    assetAllocation,
  };
}
