// Your clean mapped type for dashboard
export interface TopGainerCoin {
    symbol: string;
    name: string;
    coinType: string;
    iconUrl: string;
    supply: number;
    price: number;
    priceChange4h: number;
  }
  
  export async function fetchTopGainers(): Promise<TopGainerCoin[]> {
    if (!process.env.INSIDEX_API_KEY) {
      console.warn('INSIDEX_API_KEY not found in environment variables');
      return [];
    }
    
    try {
      const response = await fetch("https://api-ex.insidex.trade/coins/top-gainers", {
        headers: {
          "x-api-key": process.env.INSIDEX_API_KEY
        }
      });
  
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
  
      const data = await response.json();
      console.log(`API returned ${data.length} coins`);
  
      return data.slice(0, 10).map((item: any) => {
        const meta = item.coinMetadata ?? {};
  
        return {
          symbol: meta.symbol ?? '',
          name: meta.name ?? '',
          coinType: meta.coinType ?? '',
          iconUrl: meta.iconUrl ?? '',
          supply: meta.supply ?? 0,
          price: item.price ?? 0,
          priceChange4h: item.priceChange4h ?? 0
        };
      });
    } catch (error) {
      console.error('Error fetching top gainers:', error);
      return [];
    }
  }
  
  export interface TrendingCoin {
    symbol: string;
    name: string;
    description: string;
    iconUrl: string;
    coinType: string;
    supply: number;
    marketCap: number;
    price: number;
    liquidityUsd: number;
    priceChange24h: number;
    buyVolume24h: number;
    sellVolume24h: number;
  }
  
  
  export async function fetchTrendingCoins(): Promise<TrendingCoin[]> {
    if (!process.env.INSIDEX_API_KEY) {
      console.warn('INSIDEX_API_KEY not found in environment variables');
      return [];
    }
    
    try {
      const response = await fetch("https://api-ex.insidex.trade/coins/trending", {
        headers: {
          "x-api-key": process.env.INSIDEX_API_KEY
        }
      });
  
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
  
      const data = await response.json();
      console.log(`API returned ${data.length} coins`);
  
      return data.slice(0, 10).map((item: any) => {
        const meta = item.coinMetadata ?? {};
  
        return {
          symbol: meta.symbol ?? '',
          name: meta.name ?? '',
          description: meta.description ?? '',
          iconUrl: meta.iconUrl ?? '',
          coinType: meta.coinType ?? '',
          supply: Number(meta.supply ?? 0),
          marketCap: Number(item.marketCap ?? 0),
          price: Number(item.coinPrice ?? 0),
          liquidityUsd: Number(item.totalLiquidityUsd ?? 0),
          priceChange24h: Number(item.percentagePriceChange24h ?? 0),
          buyVolume24h: Number(item.buyVolume24h ?? 0),
          sellVolume24h: Number(item.sellVolume24h ?? 0)
        };
      });
    } catch (error) {
      console.error('Error fetching trending coins:', error);
      return [];
    }
  }
  
  
  interface LatestCoinData {
    symbol: string;
    name: string;
    description: string;
    iconUrl: string;
    coinType: string;
    supply: number;
    twitter?: string;
    marketCap: number;
    price: number;
    liquidityUsd: number;
    priceChange24h: number;
    createdAt: number;
    buyVolume24h: number;
    sellVolume24h: number;
  }
  
  export async function fetchLatestCreatedCoins(): Promise<LatestCoinData[]> {
      if (!process.env.INSIDEX_API_KEY) {
        console.warn('INSIDEX_API_KEY not found in environment variables');
        return [];
      }
      
      try {
        const response = await fetch('https://api-ex.insidex.trade/coins/latest-created', {
          headers: {
            'x-api-key': process.env.INSIDEX_API_KEY
          }
        });
  
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
  
      const data = await response.json();
  
      return data.map((item: any) => {
        const meta = item.coinMetadata || item.coin || {};
  
        return {
          symbol: meta.symbol,
          name: meta.name,
          description: meta.description,
          iconUrl: meta.icon_url || meta.iconUrl || '',
          coinType: meta.coinType,
          supply: Number(meta.supply),
          twitter: meta.twitter,
          marketCap: Number(item.marketCap),
          price: Number(item.coinPrice),
          liquidityUsd: Number(item.totalLiquidityUsd),
          priceChange24h: Number(item.percentagePriceChange24h),
          createdAt: Number(meta.createdAt),
          buyVolume24h: Number(item.buyVolume24h),
          sellVolume24h: Number(item.sellVolume24h)
        };
      });
    } catch (error) {
      console.error('Error fetching latest created coins:', error);
      return [];
    }
  }