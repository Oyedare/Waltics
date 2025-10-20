const DEFILLAMA_MAIN_BASE = "https://api.llama.fi"; // free endpoints on main API domain
const DEFILLAMA_BRIDGE_BASE = "https://bridges.llama.fi";
const DEFILLAMA_COINS_BASE = "https://coins.llama.fi"; // free coins endpoints

type HttpMethod = "GET" | "POST";

interface RequestOptions {
  base?: "main" | "bridge" | "coins";
  method?: HttpMethod;
  headers?: Record<string, string>;
  // For future use when some free endpoints accept query params
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
}

function buildUrl(
  path: string,
  base: RequestOptions["base"],
  query?: RequestOptions["query"]
): string {
  const root =
    base === "bridge"
      ? DEFILLAMA_BRIDGE_BASE
      : base === "coins"
      ? DEFILLAMA_COINS_BASE
      : DEFILLAMA_MAIN_BASE;
  const url = new URL(path.replace(/^\//, ""), root + "/");
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

async function http<T = unknown>(
  path: string,
  opts: RequestOptions = {}
): Promise<T> {
  const { base = "main", method = "GET", headers, query, body } = opts;
  const url = buildUrl(path, base, query);
  const response = await fetch(url, {
    method,
    headers: {
      accept: "application/json",
      "content-type": body ? "application/json" : undefined,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    // credentials not needed; all endpoints used are public
  } as RequestInit);

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `DefiLlama request failed: ${response.status} ${response.statusText} - ${text}`
    );
  }
  return response.json() as Promise<T>;
}

// Types kept minimal for bootstrap; can be expanded per endpoint when used.
export interface BridgeSummary {
  id: string;
  name: string;
  // additional fields exist; extend when needed
}

export const defillama = {
  // Basic liveness check (some free endpoints exist like /ping on various services)
  async ping(): Promise<{ status: string } | unknown> {
    // There isn't a universal /ping; use a tiny free endpoint from the main API.
    // Choose a very lightweight, stable one: list of bridges root from bridge API.
    return http("bridges", { base: "bridge" });
  },

  // Bridges list (free, no key). Docs base: https://bridges.llama.fi/bridges
  async getBridges(): Promise<BridgeSummary[]> {
    return http<BridgeSummary[]>("bridges", { base: "bridge" });
  },

  // ===== Free TVL & Protocol endpoints (public api.llama.fi) =====
  async getProtocols(): Promise<ProtocolSummary[]> {
    return http<ProtocolSummary[]>("protocols", { base: "main" });
  },
  async getProtocol(protocol: string): Promise<ProtocolDetail> {
    return http<ProtocolDetail>(`protocol/${encodeURIComponent(protocol)}`, {
      base: "main",
    });
  },
  async getProtocolTvl(protocol: string): Promise<number> {
    // This endpoint returns a raw number; we keep it as number
    return http<number>(`tvl/${encodeURIComponent(protocol)}`, {
      base: "main",
    });
  },
  async getChains(): Promise<ChainTvlSummary[]> {
    return http<ChainTvlSummary[]>("v2/chains", { base: "main" });
  },
  async getHistoricalChainTvl(): Promise<HistoricalChainTvlAll[]> {
    return http<HistoricalChainTvlAll[]>("v2/historicalChainTvl", {
      base: "main",
    });
  },
  async getHistoricalChainTvlByChain(
    chain: string
  ): Promise<HistoricalChainTvl[]> {
    return http<HistoricalChainTvl[]>(
      `v2/historicalChainTvl/${encodeURIComponent(chain)}`,
      { base: "main" }
    );
  },

  // ===== Free Coins endpoints (public coins.llama.fi) =====
  async getCurrentPrices(coinsCsv: string, searchWidth?: "4h" | "24h") {
    return http<{
      coins: Record<
        string,
        {
          decimals?: number;
          symbol?: string;
          price: number;
          timestamp?: number;
          confidence?: number;
        }
      >;
    }>(`prices/current/${encodeURIComponent(coinsCsv)}`, {
      base: "coins",
      query: searchWidth ? { searchWidth } : undefined,
    });
  },
  async getHistoricalPrices(
    timestamp: number,
    coinsCsv: string,
    searchWidthSeconds?: number
  ) {
    return http<{
      coins: Record<
        string,
        {
          decimals?: number;
          symbol?: string;
          price: number;
          timestamp?: number;
          confidence?: number;
        }
      >;
    }>(
      `prices/historical/${encodeURIComponent(
        String(timestamp)
      )}/${encodeURIComponent(coinsCsv)}`,
      {
        base: "coins",
        query: searchWidthSeconds
          ? { searchWidth: String(searchWidthSeconds) }
          : undefined,
      }
    );
  },
  async postBatchHistorical(body: { coins: Record<string, number[]> }) {
    return http<{
      coins: Record<
        string,
        {
          prices: { timestamp: number; price: number }[];
          symbol?: string;
          confidence?: number;
        }
      >;
    }>(`batchHistorical`, { base: "coins", method: "POST", body });
  },
  async getChart(
    coinsCsv: string,
    opts?: {
      period?: "1d" | "7d" | "30d" | "90d" | "180d" | "365d";
      span?: number;
      searchWidth?: string;
    }
  ) {
    return http<{
      coins: Record<
        string,
        {
          prices: { timestamp: number; price: number }[];
          symbol?: string;
          confidence?: number;
        }
      >;
    }>(`chart/${encodeURIComponent(coinsCsv)}`, {
      base: "coins",
      query: {
        ...(opts?.period ? { period: opts.period } : {}),
        ...(opts?.span ? { span: String(opts.span) } : {}),
        ...(opts?.searchWidth ? { searchWidth: opts.searchWidth } : {}),
      },
    });
  },
  async getPercentage(
    coinsCsv: string,
    opts?: { timestamp?: number; lookForward?: boolean; period?: string }
  ) {
    return http<{
      coins: Record<
        string,
        { symbol?: string; price?: number; change?: number }
      >;
    }>(`percentage/${encodeURIComponent(coinsCsv)}`, {
      base: "coins",
      query: {
        ...(opts?.timestamp ? { timestamp: String(opts.timestamp) } : {}),
        ...(opts?.lookForward
          ? { lookForward: String(!!opts.lookForward) }
          : {}),
        ...(opts?.period ? { period: opts.period } : {}),
      },
    });
  },
  async getFirstPrice(coinsCsv: string) {
    return http<{
      coins: Record<
        string,
        { price: number; timestamp: number; symbol?: string }
      >;
    }>(`prices/first/${encodeURIComponent(coinsCsv)}`, { base: "coins" });
  },
  async getBlockAt(chain: string, timestamp: number) {
    return http<{ height: number; timestamp: number }>(
      `block/${encodeURIComponent(chain)}/${encodeURIComponent(
        String(timestamp)
      )}`,
      { base: "coins" }
    );
  },
};

export type DefillamaClient = typeof defillama;

// -------- Types (minimal; extend fields as needed by UI) --------
export interface ProtocolSummary {
  id: string | number;
  name: string;
  slug?: string;
  symbol?: string;
  category?: string;
  chains?: string[];
  tvl?: number;
  chainTvls?: Record<string, number>;
  change_1h?: number;
  change_1d?: number;
  change_7d?: number;
  mcap?: number | null;
  logo?: string;
}

export interface ProtocolDetailTvlPoint {
  date: number; // unix seconds
  totalLiquidityUSD: number;
}

export interface ProtocolDetailChainTvlSeries {
  tvl: ProtocolDetailTvlPoint[];
}

export interface ProtocolDetail {
  id: string | number;
  name: string;
  symbol?: string;
  category?: string;
  chains?: string[];
  description?: string;
  logo?: string;
  url?: string;
  twitter?: string;
  chainTvls?: Record<string, ProtocolDetailChainTvlSeries>;
  tvl?: ProtocolDetailTvlPoint[];
  currentChainTvls?: Record<string, number>;
  mcap?: number | null;
  raises?: { date: string; amount: number }[];
  metrics?: {
    fees?: { [k in "24h" | "7d"]?: number };
    revenue?: { [k in "24h" | "7d"]?: number };
  };
}

export interface ChainTvlSummary {
  gecko_id?: string;
  tvl: number;
  tokenSymbol?: string;
  cmcId?: string;
  name: string;
  chainId?: number;
}

export interface HistoricalChainTvlAll {
  date: number; // unix seconds
  tvl: Record<string, number>; // chain name -> tvl
}

export interface HistoricalChainTvl {
  date: number; // unix seconds
  tvl: number;
}
