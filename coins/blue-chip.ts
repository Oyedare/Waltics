const coinTypes = [
    "0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL",
    "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP",
    "0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS",
    "0xaafb102dd0902f5055cadecd687fb5b71ca82ef0e0285d90afde828ec58ca96b::btc::BTC",
    "0x7016aae72cfc67f2fadf55769c0a7dd54291a583b63051a5ed71081cce836ac6::sca::SCA",
    "0x3a304c7feba2d819ea57c3542d68439ca2c386ba02159c740f7b406e592c62ea::haedal::HAEDAL",
    "0x5145494a5f5100e645e4b0aa950fa6b68f614e8c59e17bc5ded3495123a79178::ns::NS",
    "0xa99b8952d4f7d947ea77fe0ecdcc9e5fc0bcab2841d6e2a5aa00c3044e5544b5::navx::NAVX",
    "0x8993129d72e733985f7f1a00396cbd055bad6f817fee36576ce483c8bbb8b87b::sudeng::SUDENG",
    "0x5d1f47ea69bb0de31c313d7acf89b890dbb8991ea8e03c6c355171f84bb1ba4a::turbos::TURBOS",
    "0xb45fcfcc2cc07ce0702cc2d229621e046c906ef14d9b25e8e4d25f6e8763fef7::send::SEND",
    "0x0ef38abcdaaafedd1e2d88929068a3f65b59bf7ee07d7e8f573c71df02d27522::attn::ATTN",
    "0x6dae8ca14311574fdfe555524ea48558e3d1360d1607d1c7f98af867e3b7976c::flx::FLX",
    "0xfe3afec26c59e874f3c1d60b8203cb3852d2bb2aa415df9548b8d688e6683f93::alpha::ALPHA",
    "0x3b68324b392cee9cd28eba82df39860b6b220dc89bdd9b21f675d23d6b7416f1::kdx::KDX",
    "0x87dfe1248a1dc4ce473bd9cb2937d66cdc6c30fee63f3fe0dbb55c7a09d35dec::up::UP",
    "0xe6b9e1033c72084ad01db37c77778ca53b9c4ebb263f28ffbfed39f4d5fd5057::win::WIN",
    "0x4c981f3ff786cdb9e514da897ab8a953647dae2ace9679e8358eec1e3e8871ac::dmc::DMC"
];

type MarketData = {
    coin: string;
    coinMetadata: {
        coinType: string;
        name: string;
        supply: string;
        symbol: string;
        iconUrl: string;
    };
    coinPrice: string;
    coinSupply: string;
    fullyDilutedMarketCap: string;
    isCoinHoneyPot: string;
    lpBurnt: string;
    marketCap: string;
    percentagePriceChange1h: string;
    percentagePriceChange24h: string;
    price1hAgo: string;
    price24hAgo: string;
    sellVolume1h: string;
    sellVolume24h: string;
    timeCreated: string;
};

const apiKey = process.env.INSIDEX_API_KEY;

async function getMarketDataForCoin(coinType: string, apiKey: string | undefined): Promise<MarketData | null> {
    if (!apiKey) {
        console.warn('INSIDEX_API_KEY not found in environment variables');
        return null;
    }
    
    const url = `https://api-ex.insidex.trade/coins/${encodeURIComponent(coinType)}/market-data`;

    try {
        // Add timeout and better error handling for performance
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(url, {
            headers: {
                "x-api-key": apiKey,
                "Content-Type": "application/json"
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error for ${coinType}: ${response.status} ${response.statusText}`, errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
            console.error(`Empty or invalid data for ${coinType}:`, data);
            throw new Error('Empty or invalid data received');
        }

        const d = data[0];

        return {
            coin: d.coin,
            coinMetadata: d.coinMetadata,
            coinPrice: d.coinPrice,
            coinSupply: d.coinSupply,
            fullyDilutedMarketCap: d.fullyDilutedMarketCap,
            isCoinHoneyPot: d.isCoinHoneyPot,
            lpBurnt: d.lpBurnt,
            marketCap: d.marketCap,
            percentagePriceChange1h: d.percentagePriceChange1h,
            percentagePriceChange24h: d.percentagePriceChange24h,
            price1hAgo: d.price1hAgo,
            price24hAgo: d.price24hAgo,
            sellVolume1h: d.sellVolume1h,
            sellVolume24h: d.sellVolume24h,
            timeCreated: d.timeCreated
        };
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
            console.error(`Timeout fetching data for ${coinType}`);
            throw new Error('Request timeout');
        }
        console.error(`Network error fetching data for ${coinType}:`, error);
        throw error;
    }
}

async function getAllBluechipMarketData(): Promise<MarketData[]> {
    const results: MarketData[] = [];
    for (const coinType of coinTypes) {
        try {
            const data = await getMarketDataForCoin(coinType, apiKey);
            if (data) {
                results.push(data);
            }
        } catch (e) {
            // Optionally log or handle errors per coin
            // console.error(`Error fetching data for ${coinType}:`, e);
        }
    }
    return results;
}

export { getMarketDataForCoin, getAllBluechipMarketData };
type BluechipCoin = MarketData;
export type { MarketData, BluechipCoin };

// Removed the IIFE that was making unnecessary sequential API calls
// This improves module loading performance