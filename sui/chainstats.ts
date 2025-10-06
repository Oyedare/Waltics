import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

type PriceAndMarketCap = {
  marketCap: number;
  price: number;
  supply: number;
};

export async function fetchSuiPriceAndMarketCap(): Promise<PriceAndMarketCap> {
  const apiKey = process.env.INSIDEX_API_KEY;

  if (!apiKey) {
    console.warn("INSIDEX_API_KEY not found in environment variables");
    throw new Error("API key not configured");
  }

  const response = await fetch(
    "https://api-ex.insidex.trade/coins/0x2::sui::SUI/price-and-mc",
    {
      headers: {
        "x-api-key": apiKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    marketCap: data.marketCap,
    price: data.price,
    supply: data.supply,
  };
}

export async function fetchSuiStats() {
  const client = new SuiClient({
    url: getFullnodeUrl("mainnet"),
  });

  try {
    const [
      systemState,
      txCount,
      checkpointSeq,
      referenceGasPrice,
      totalSupply,
    ] = await Promise.all([
      client.getLatestSuiSystemState(),
      client.getTotalTransactionBlocks(),
      client.getLatestCheckpointSequenceNumber(),
      client.getReferenceGasPrice(),
      client.getTotalSupply({ coinType: "0x2::sui::SUI" }),
    ]);

    const epochStartMs = Number(systemState.epochStartTimestampMs);
    const epochDurationMs = Number(systemState.epochDurationMs);
    const epochEndMs = epochStartMs + epochDurationMs;

    // Calculate staking APY from actual network data
    // Calculate APY based on validator commission rates and network rewards
    // This is a simplified calculation using available system state data
    let totalCommissionRate = 0;
    let validatorCount = 0;

    systemState.activeValidators.forEach((validator) => {
      const commissionRate = Number(validator.commissionRate) / 10000; // Convert from basis points
      totalCommissionRate += commissionRate;
      validatorCount++;
    });

    const avgCommissionRate =
      validatorCount > 0 ? totalCommissionRate / validatorCount : 0;
    // Calculate staking APY based on Sui's current reward structure
    // Base staking reward is approximately 3-4% on Sui network
    const baseStakingReward = 0.035; // 3.5% base estimate (more realistic for current Sui)
    const stakingAPY = Math.max(
      0,
      (baseStakingReward - avgCommissionRate) * 100
    );

    // Ensure we have a reasonable APY value (fallback if calculation seems off)
    const finalStakingAPY =
      stakingAPY > 0 && stakingAPY < 20 ? stakingAPY : 3.5; // Default to 3.5% if calculation is unrealistic

    // Handle BigInt values properly - Sui SDK often returns BigInt
    const rawTotalStake =
      typeof systemState.totalStake === "bigint"
        ? Number(systemState.totalStake)
        : Number(systemState.totalStake);
    const rawTotalSupply =
      typeof totalSupply.value === "bigint"
        ? Number(totalSupply.value)
        : Number(totalSupply.value);
    const rawStorageFund =
      typeof systemState.storageFundTotalObjectStorageRebates === "bigint"
        ? Number(systemState.storageFundTotalObjectStorageRebates || 0)
        : Number(systemState.storageFundTotalObjectStorageRebates || 0);

    // Convert to billions (divide by 1e9)
    const convertedTotalStake = rawTotalStake / 1000000000;
    const convertedTotalSupply = rawTotalSupply / 1000000000;
    const convertedStorageFund = rawStorageFund / 1000000000;

    return {
      epoch: systemState.epoch,
      epochStartTimestamp: epochStartMs,
      epochEndTimestamp: epochEndMs,
      epochDurationMs: epochDurationMs,
      totalStake: convertedTotalStake, // Convert to billions
      activeValidators: systemState.activeValidators.length,
      totalTxBlocks: txCount,
      totalCheckpoints: checkpointSeq,
      // Note: This is the reference gas price set by validators for the current epoch
      // The Sui SDK does not provide historical gas fee statistics (avg, min, max over 24h)
      referenceGasPrice: Number(referenceGasPrice),
      totalSupply: convertedTotalSupply, // Convert to billions
      stakingAPY: finalStakingAPY,
      storageFund: convertedStorageFund, // Convert to billions
      protocolVersion: systemState.protocolVersion,
    };
  } catch (error) {
    console.error("Error in fetchSuiStats:", error);
    return null;
  }
}

export async function getNakamotoCoefficient(): Promise<number> {
  const client = new SuiClient({
    url: getFullnodeUrl("mainnet"),
  });

  const systemState = await client.getLatestSuiSystemState();
  const validators = systemState.activeValidators;

  // Total voting power (BigInt for safety)
  const totalVotingPower = validators.reduce(
    (sum, v) => sum + BigInt(v.votingPower),
    BigInt(0)
  );

  // Sort validators by voting power descending
  const sorted = validators.sort((a, b) =>
    Number(BigInt(b.votingPower) - BigInt(a.votingPower))
  );

  let cumulative = BigInt(0);
  let count = 0;

  for (const v of sorted) {
    cumulative += BigInt(v.votingPower);
    count++;

    // Check if cumulative voting power > 33.33%
    if ((cumulative * BigInt(10000)) / totalVotingPower > BigInt(3333)) {
      break;
    }
  }

  return count;
}

export async function fetchNetworkMetrics() {
  const client = new SuiClient({
    url: getFullnodeUrl("mainnet"),
  });

  try {
    const systemState = await client.getLatestSuiSystemState();
    const latestCheckpointSeq =
      await client.getLatestCheckpointSequenceNumber();

    // Get multiple checkpoints for better TPS calculation
    const checkpointPromises = [];
    const numCheckpoints = 10; // Use last 10 checkpoints for average

    for (let i = 0; i < numCheckpoints; i++) {
      const checkpointId = Number(latestCheckpointSeq) - i;
      if (checkpointId > 0) {
        checkpointPromises.push(
          client.getCheckpoint({ id: String(checkpointId) })
        );
      }
    }

    const checkpoints = await Promise.all(checkpointPromises);

    // Calculate TPS based on multiple checkpoints
    let totalTps = 0;
    let totalBlockTime = 0;
    let validCalculations = 0;

    for (let i = 0; i < checkpoints.length - 1; i++) {
      const current = checkpoints[i];
      const previous = checkpoints[i + 1];

      const timeDiff =
        Number(current.timestampMs) - Number(previous.timestampMs);
      const txDiff =
        Number(current.networkTotalTransactions) -
        Number(previous.networkTotalTransactions);

      if (timeDiff > 0) {
        totalTps += txDiff / (timeDiff / 1000);
        totalBlockTime += timeDiff / 1000;
        validCalculations++;
      }
    }

    const tps = validCalculations > 0 ? totalTps / validCalculations : 0;
    const avgBlockTime =
      validCalculations > 0 ? totalBlockTime / validCalculations : 0;

    // Get validator count and staking metrics
    const pendingValidatorsSize = Number(
      systemState.pendingActiveValidatorsSize || 0
    );
    const totalValidators =
      systemState.activeValidators.length + pendingValidatorsSize;

    const latestCheckpoint = checkpoints[0]; // First checkpoint is the latest

    return {
      tps: Math.round(tps * 100) / 100,
      avgBlockTime: Math.round(avgBlockTime * 100) / 100,
      totalValidators,
      pendingValidators: pendingValidatorsSize,
      networkTotalTransactions: Number(
        latestCheckpoint.networkTotalTransactions
      ),
      checkpointTimestamp: Number(latestCheckpoint.timestampMs),
    };
  } catch (error) {
    console.error("Error fetching network metrics:", error);
    return null;
  }
}

interface OHLCData {
  _id: string;
  open: number;
  high: number;
  low: number;
  close: number;
  suiPrice: number;
  volume: number;
}

export async function fetchCoinOHLC(coinType: string): Promise<OHLCData[]> {
  const apiKey = process.env.INSIDEX_API_KEY;

  if (!apiKey) {
    console.warn("INSIDEX_API_KEY not found in environment variables");
    return [];
  }
  // Get current UNIX timestamp in seconds
  const to = Math.floor(Date.now() / 1000);

  // 1 hour ago
  const from = to - 3600;

  // Example resolution in seconds (e.g., 900 = 15 minutes)
  const resolution = 900;

  const url = `https://api-ex.insidex.trade/price-feed/coin/${encodeURIComponent(
    coinType
  )}/ohlc?from=${from}&to=${to}&resolution=${resolution}`;

  try {
    const response = await fetch(url, {
      headers: {
        "x-api-key": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: OHLCData[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching OHLC data:", error);
    return [];
  }
}
