"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { downloadElementAsPng } from "@/lib/download";
import { DownloadButton } from "@/components/ui/download-button";
import {
  fetchSuiStats,
  getNakamotoCoefficient,
  fetchNetworkMetrics,
} from "@/lib/sui/chainstats";
import { StatCard } from "@/components/stat-card";
import { FeatureList } from "@/components/feature-list";
import { NetworkExplainer } from "@/components/network-explainer";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type SuiStatsData = {
  epoch: string;
  epochStartTimestamp: number;
  epochEndTimestamp: number;
  epochDurationMs: number;
  totalStake: number;
  activeValidators: number;
  totalTxBlocks: bigint;
  totalCheckpoints: string;
  referenceGasPrice: number;
  totalSupply: number;
  stakingAPY: number;
  storageFund: number;
  protocolVersion: string;
};

type NetworkMetrics = {
  tps: number;
  avgBlockTime: number;
  totalValidators: number;
  pendingValidators: number;
  networkTotalTransactions: number;
  checkpointTimestamp: number;
};

type PriceData = {
  price: number;
  marketCap: number;
  supply: number;
};

type OHLCData = {
  _id: string;
  open: number;
  high: number;
  low: number;
  close: number;
  suiPrice: number;
  volume: number;
};

// Professional Price Chart Component using Chart.js
function PriceChart({ data }: { data: OHLCData[] }) {
  if (data.length === 0) return null;

  const chartData = {
    labels: data.map((d, i) => {
      const date = new Date(parseInt(d._id) * 1000);
      const now = new Date();
      const diffMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );

      if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
      } else {
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }
    }),
    datasets: [
      {
        label: "SUI Price",
        data: data.map((d) => d.close),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "rgb(59, 130, 246)",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
        callbacks: {
          label: function (context: any) {
            const dataPoint = data[context.dataIndex];
            return [
              `Price: $${dataPoint.close.toFixed(4)}`,
              `High: $${dataPoint.high.toFixed(4)}`,
              `Low: $${dataPoint.low.toFixed(4)}`,
              `Volume: ${dataPoint.volume.toLocaleString()}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "rgb(107, 114, 128)",
        },
      },
      y: {
        display: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "rgb(107, 114, 128)",
          callback: function (value: any) {
            return "$" + value.toFixed(4);
          },
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

  const currentPrice = data[data.length - 1]?.close || 0;
  const firstPrice = data[0]?.close || 0;
  const priceChange = currentPrice - firstPrice;
  const priceChangePercent =
    firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center text-sm mb-4">
        <div className="flex items-center gap-4">
          <span className="text-foreground font-medium">
            Current: ${currentPrice.toFixed(4)}
          </span>
          <span
            className={`font-medium ${
              priceChange >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {priceChange >= 0 ? "+" : ""}${priceChange.toFixed(4)} (
            {priceChangePercent >= 0 ? "+" : ""}
            {priceChangePercent.toFixed(2)}%)
          </span>
        </div>
        <span className="text-muted-foreground">
          Last Hour • 1min intervals
        </span>
      </div>
      <div className="flex-1">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

export default function SuiOverviewPage() {
  const [data, setData] = useState<SuiStatsData | null>(null);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [ohlcData, setOhlcData] = useState<OHLCData[]>([]);
  const [nakamotoCoeff, setNakamotoCoeff] = useState<number | null>(null);
  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetrics | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suiStats, nakamoto, metrics] = await Promise.all([
          fetchSuiStats(),
          getNakamotoCoefficient(),
          fetchNetworkMetrics(),
        ]);

        setData(suiStats);
        setNakamotoCoeff(nakamoto);
        setNetworkMetrics(metrics);

        // Fetch price data and OHLC data from API routes
        try {
          const [priceResponse, ohlcResponse] = await Promise.all([
            fetch("/api/sui-price"),
            fetch("/api/sui-ohlc"),
          ]);

          if (priceResponse.ok) {
            const priceResult = await priceResponse.json();
            setPriceData(priceResult);
          }

          if (ohlcResponse.ok) {
            const ohlcResult = await ohlcResponse.json();
            setOhlcData(ohlcResult);
          }
        } catch (priceError) {
          console.error("Failed to fetch price/OHLC data:", priceError);
        }
      } catch (error) {
        console.error("Error fetching Sui stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="">
          <h1 className="text-3xl font-bold mb-8 text-foreground">
            Sui Overview
          </h1>
          {/* Render the full UI structure with skeletons/placeholders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <NetworkExplainer
              title="About Sui Network"
              logoUrl="/sui-logo.svg"
              description="Sui is a next-generation smart contract platform with high throughput, low latency, and an asset-oriented programming model powered by the Move programming language. Sui's unique object-centric data model enables parallel execution, instant finality, and rich on-chain assets that can be directly owned and transferred."
              links={[]}
            />
            <FeatureList
              title="Sui Network Features"
              features={[]}
              bulletColor="bg-muted"
            />
          </div>
          <div className="mb-6 sm:mb-8">
            <div className="p-4 sm:p-6 border rounded-lg">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground">
                Sui Price Chart (Last Hour)
              </h2>
              <div className="h-48 sm:h-64 bg-muted/20 rounded-lg flex items-center justify-center animate-pulse">
                <div className="text-muted-foreground text-center px-4">
                  <div className="text-base sm:text-lg font-medium mb-2">
                    Loading Price Chart...
                  </div>
                  <div className="text-xs sm:text-sm">Fetching OHLC data</div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">
              Network Statistics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(15)].map((_, i) => (
                <StatCard
                  key={i}
                  title="..."
                  value={
                    <span className="inline-block w-16 h-6 bg-muted animate-pulse rounded" />
                  }
                  info=""
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="" id="sui-overview-export">
        <div className="mb-6 sm:mb-8">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Sui Overview
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Real-time network statistics and metrics
            </p>
          </div>
        </div>

        <div>
          {/* Top Section: Network Info Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div id="network-explainer-card" className="relative">
              <div className="absolute top-2 right-2 z-10">
                <DownloadButton
                  elementId="network-explainer-card"
                  filename="sui-network-explainer.png"
                  size="sm"
                  showText={false}
                />
              </div>
              <NetworkExplainer
                title="About Sui Network"
                logoUrl="/sui-logo.svg"
                description="Sui is a next-generation smart contract platform with high throughput, low latency, and an asset-oriented programming model powered by the Move programming language. Sui's unique object-centric data model enables parallel execution, instant finality, and rich on-chain assets that can be directly owned and transferred."
                links={[
                  { label: "docs.sui.io", url: "https://docs.sui.io" },
                  { label: "sui.io", url: "https://sui.io" },
                  { label: "GitHub", url: "https://github.com/MystenLabs/sui" },
                  { label: "Discord", url: "https://discord.gg/sui" },
                  { label: "Twitter", url: "https://twitter.com/SuiNetwork" },
                ]}
              />
            </div>

            <div id="feature-list-card" className="relative">
              <div className="absolute top-2 right-2 z-10">
                <DownloadButton
                  elementId="feature-list-card"
                  filename="sui-network-features.png"
                  size="sm"
                  showText={false}
                />
              </div>
              <FeatureList
                title="Sui Network Features"
                features={[
                  "Parallel Transaction Execution",
                  "Object-Centric Data Model",
                  "Instant Finality",
                  "Low Gas Fees",
                  "Dynamic Object Fields",
                  "Tier-1 Developer Experience",
                  "Interoperability & Orchestration",
                ]}
                bulletColor="bg-muted"
              />
            </div>
          </div>

          {/* Middle Section: Price Chart */}
          <div className="mb-6 sm:mb-8">
            <div
              id="price-chart-card"
              className="p-4 sm:p-6 border rounded-lg relative"
            >
              <div className="absolute top-2 right-2 z-10">
                <DownloadButton
                  elementId="price-chart-card"
                  filename="sui-price-chart.png"
                  size="sm"
                  showText={false}
                />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground">
                Sui Price Chart (Last Hour)
              </h2>
              {ohlcData.length > 0 ? (
                <div className="h-48 sm:h-64 bg-muted/20 rounded-lg p-2 sm:p-4">
                  <PriceChart data={ohlcData} />
                </div>
              ) : (
                <div className="h-48 sm:h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-muted-foreground text-center px-4">
                    <div className="text-base sm:text-lg font-medium mb-2">
                      Loading Price Chart...
                    </div>
                    <div className="text-xs sm:text-sm">Fetching OHLC data</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section: Stat Cards */}
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">
              Network Statistics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <StatCard
                title="Current Epoch"
                value={data?.epoch ? String(data.epoch) : "N/A"}
                info="An epoch is a period of time during which the validator set remains fixed. Each epoch lasts approximately 24 hours."
                elementId="current-epoch-card"
                filename="current-epoch.png"
              />
              <StatCard
                title="Active Validators"
                value={
                  data?.activeValidators ? String(data.activeValidators) : "N/A"
                }
                info="The number of validators currently participating in consensus and securing the network."
                elementId="active-validators-card"
                filename="active-validators.png"
              />
              <StatCard
                title="Total Stake"
                value={
                  data?.totalStake
                    ? `${(data.totalStake / 1e9).toFixed(2)}B SUI`
                    : "N/A"
                }
                info="The total amount of SUI tokens staked across all validators to secure the network."
                elementId="total-stake-card"
                filename="total-stake.png"
              />
              <StatCard
                title="Sui Price"
                value={
                  priceData?.price ? `$${priceData.price.toFixed(4)}` : "N/A"
                }
                info="Current market price of SUI token in USD."
                elementId="sui-price-card"
                filename="sui-price.png"
              />
              <StatCard
                title="Market Cap"
                value={
                  priceData?.marketCap
                    ? `$${(priceData.marketCap / 1e9).toFixed(2)}B`
                    : "N/A"
                }
                info="Total market capitalization of SUI tokens in USD."
                elementId="market-cap-card"
                filename="market-cap.png"
              />
              <StatCard
                title="Total Supply"
                value={
                  data?.totalSupply
                    ? `${(data.totalSupply / 1e9).toFixed(2)}B SUI`
                    : "N/A"
                }
                info="Total supply of SUI tokens in circulation."
                elementId="total-supply-card"
                filename="total-supply.png"
              />
              <StatCard
                title="TPS (Current)"
                value={
                  networkMetrics?.tps
                    ? `${networkMetrics.tps.toFixed(2)}`
                    : "N/A"
                }
                info="Current transactions per second based on recent checkpoint data."
                elementId="tps-card"
                filename="tps.png"
              />

              <StatCard
                title="Block Time"
                value={
                  networkMetrics?.avgBlockTime
                    ? `${networkMetrics.avgBlockTime.toFixed(1)}s`
                    : "N/A"
                }
                info="Average time between checkpoints (blocks) on the Sui network."
                elementId="block-time-card"
                filename="block-time.png"
              />
              <StatCard
                title="Staking APY"
                value={
                  data?.stakingAPY ? `${data.stakingAPY.toFixed(2)}%` : "N/A"
                }
                info="Estimated annual percentage yield for staking SUI tokens."
                elementId="staking-apy-card"
                filename="staking-apy.png"
              />

              <StatCard
                title="Nakamoto Coefficient"
                value={
                  nakamotoCoeff !== undefined && nakamotoCoeff !== null
                    ? String(nakamotoCoeff)
                    : "N/A"
                }
                info="The minimum number of validators needed to control more than 33% of the network's voting power. Higher values indicate better decentralization."
                elementId="nakamoto-coefficient-card"
                filename="nakamoto-coefficient.png"
              />
              <StatCard
                title="Total Transactions"
                value={
                  data?.totalTxBlocks
                    ? data.totalTxBlocks.toLocaleString()
                    : "N/A"
                }
                info="Total number of transaction blocks processed on the Sui network."
                elementId="total-transactions-card"
                filename="total-transactions.png"
              />
              <StatCard
                title="Total Checkpoints"
                value={
                  data?.totalCheckpoints ? String(data.totalCheckpoints) : "N/A"
                }
                info="Total number of checkpoints created on the Sui network."
                elementId="total-checkpoints-card"
                filename="total-checkpoints.png"
              />
              <StatCard
                title="Total Validators"
                value={
                  networkMetrics?.totalValidators
                    ? String(networkMetrics.totalValidators)
                    : "N/A"
                }
                info="Total number of validators including active and pending validators."
                elementId="total-validators-card"
                filename="total-validators.png"
              />

              <StatCard
                title="Epoch Duration"
                value={
                  data?.epochDurationMs
                    ? `${Math.round(
                        data.epochDurationMs / (1000 * 60 * 60)
                      )} hours`
                    : "N/A"
                }
                info="Duration of each epoch on the Sui network. Each epoch lasts approximately 24 hours."
                elementId="epoch-duration-card"
                filename="epoch-duration.png"
              />
              <StatCard
                title="Epoch End"
                value={
                  data?.epochEndTimestamp
                    ? new Date(data.epochEndTimestamp).toLocaleString()
                    : "N/A"
                }
                info="The exact end time of the current epoch."
                elementId="epoch-end-card"
                filename="epoch-end.png"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
