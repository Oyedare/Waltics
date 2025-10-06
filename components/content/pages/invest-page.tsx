import { DownloadButton } from "@/components/ui/download-button";

export default function InvestPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">Investment Opportunities</h1>
        <p className="text-muted-foreground mt-2">
          Explore various investment opportunities in the Sui ecosystem
        </p>
      </div>

      {/* Investment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div id="tvl-invest-card" className="p-4 border rounded-lg relative">
          <div className="absolute top-2 right-2">
            <DownloadButton
              elementId="tvl-invest-card"
              filename="total-value-locked-invest.png"
              size="sm"
              showText={false}
            />
          </div>
          <h3 className="font-semibold text-sm text-muted-foreground">
            Total Value Locked
          </h3>
          <p className="text-2xl font-bold">$1.2B</p>
          <p className="text-sm text-foreground">+12.5% (24h)</p>
        </div>
        <div id="avg-apy-card" className="p-4 border rounded-lg relative">
          <div className="absolute top-2 right-2">
            <DownloadButton
              elementId="avg-apy-card"
              filename="average-apy.png"
              size="sm"
              showText={false}
            />
          </div>
          <h3 className="font-semibold text-sm text-muted-foreground">
            Average APY
          </h3>
          <p className="text-2xl font-bold">8.4%</p>
          <p className="text-sm text-foreground">Across all pools</p>
        </div>
        <div
          id="active-protocols-card"
          className="p-4 border rounded-lg relative"
        >
          <div className="absolute top-2 right-2">
            <DownloadButton
              elementId="active-protocols-card"
              filename="active-protocols.png"
              size="sm"
              showText={false}
            />
          </div>
          <h3 className="font-semibold text-sm text-muted-foreground">
            Active Protocols
          </h3>
          <p className="text-2xl font-bold">23</p>
          <p className="text-sm text-foreground">DeFi protocols</p>
        </div>
        <div id="risk-score-card" className="p-4 border rounded-lg relative">
          <div className="absolute top-2 right-2">
            <DownloadButton
              elementId="risk-score-card"
              filename="risk-score.png"
              size="sm"
              showText={false}
            />
          </div>
          <h3 className="font-semibold text-sm text-muted-foreground">
            Risk Score
          </h3>
          <p className="text-2xl font-bold text-foreground">Low</p>
          <p className="text-sm text-foreground">Market assessment</p>
        </div>
      </div>

      {/* Investment Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staking */}
        <div
          id="staking-opportunities-card"
          className="border rounded-lg p-6 relative"
        >
          <div className="absolute top-2 right-2">
            <DownloadButton
              elementId="staking-opportunities-card"
              filename="staking-opportunities.png"
              size="sm"
              showText={false}
            />
          </div>
          <h2 className="text-xl font-semibold mb-4">Staking Opportunities</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
              <div>
                <h3 className="font-medium">SUI Staking</h3>
                <p className="text-sm text-muted-foreground">
                  Stake SUI tokens with validators
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">7.2% APY</p>
                <p className="text-xs text-muted-foreground">
                  21-day unbonding
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
              <div>
                <h3 className="font-medium">Liquid Staking</h3>
                <p className="text-sm text-muted-foreground">
                  Stake while maintaining liquidity
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">6.8% APY</p>
                <p className="text-xs text-muted-foreground">
                  Instant liquidity
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DeFi Protocols */}
        <div
          id="defi-protocols-card"
          className="border rounded-lg p-6 relative"
        >
          <div className="absolute top-2 right-2">
            <DownloadButton
              elementId="defi-protocols-card"
              filename="defi-protocols.png"
              size="sm"
              showText={false}
            />
          </div>
          <h2 className="text-xl font-semibold mb-4">DeFi Protocols</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
              <div>
                <h3 className="font-medium">CETUS DEX</h3>
                <p className="text-sm text-muted-foreground">
                  Concentrated liquidity AMM
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">12.4% APR</p>
                <p className="text-xs text-muted-foreground">SUI/USDC pool</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
              <div>
                <h3 className="font-medium">Turbos Finance</h3>
                <p className="text-sm text-muted-foreground">
                  Yield farming platform
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">15.7% APR</p>
                <p className="text-xs text-muted-foreground">TURBOS/SUI pool</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Pools */}
      <div
        id="top-performing-pools-table"
        className="border rounded-lg p-6 relative"
      >
        <div className="absolute top-2 right-2">
          <DownloadButton
            elementId="top-performing-pools-table"
            filename="top-performing-pools.png"
            size="sm"
            showText={false}
          />
        </div>
        <h2 className="text-xl font-semibold mb-4">Top Performing Pools</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Pool</th>
                <th className="text-left p-2">Protocol</th>
                <th className="text-left p-2">TVL</th>
                <th className="text-left p-2">APR</th>
                <th className="text-left p-2">Risk</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2 font-medium">SUI/USDC</td>
                <td className="p-2">CETUS</td>
                <td className="p-2">$45.2M</td>
                <td className="p-2 text-foreground">12.4%</td>
                <td className="p-2">
                  <span className="px-2 py-1 bg-muted text-foreground text-xs rounded">
                    Low
                  </span>
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-2 font-medium">TURBOS/SUI</td>
                <td className="p-2">Turbos</td>
                <td className="p-2">$23.8M</td>
                <td className="p-2 text-foreground">15.7%</td>
                <td className="p-2">
                  <span className="px-2 py-1 bg-muted text-foreground text-xs rounded">
                    Medium
                  </span>
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-2 font-medium">SCA/USDT</td>
                <td className="p-2">Scallop</td>
                <td className="p-2">$18.5M</td>
                <td className="p-2 text-foreground">18.2%</td>
                <td className="p-2">
                  <span className="px-2 py-1 bg-muted text-foreground text-xs rounded">
                    Medium
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-2 font-medium">FLOW/SUI</td>
                <td className="p-2">FlowX</td>
                <td className="p-2">$12.1M</td>
                <td className="p-2 text-foreground">22.1%</td>
                <td className="p-2">
                  <span className="px-2 py-1 bg-muted text-foreground text-xs rounded">
                    High
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Investment Strategies */}
      <div
        id="investment-strategies-card"
        className="border rounded-lg p-6 relative"
      >
        <div className="absolute top-2 right-2">
          <DownloadButton
            elementId="investment-strategies-card"
            filename="investment-strategies.png"
            size="sm"
            showText={false}
          />
        </div>
        <h2 className="text-xl font-semibold mb-4">Investment Strategies</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Conservative</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Low-risk strategies focusing on staking and stable pools
            </p>
            <ul className="text-sm space-y-1">
              <li>• SUI Staking (7.2% APY)</li>
              <li>• Stable coin pools</li>
              <li>• Blue-chip token pairs</li>
            </ul>
            <p className="text-sm font-medium text-foreground mt-2">
              Expected: 6-8% APY
            </p>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Balanced</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Mix of staking, LP provision, and yield farming
            </p>
            <ul className="text-sm space-y-1">
              <li>• Diversified LP positions</li>
              <li>• Yield farming rewards</li>
              <li>• Protocol governance tokens</li>
            </ul>
            <p className="text-sm font-medium text-foreground mt-2">
              Expected: 10-15% APY
            </p>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Aggressive</h3>
            <p className="text-sm text-muted-foreground mb-3">
              High-yield opportunities with increased risk
            </p>
            <ul className="text-sm space-y-1">
              <li>• New protocol launches</li>
              <li>• Leveraged positions</li>
              <li>• Volatile token pairs</li>
            </ul>
            <p className="text-sm font-medium text-foreground mt-2">
              Expected: 15-25% APY
            </p>
          </div>
        </div>
      </div>

      {/* Risk Disclaimer */}
      <div
        id="risk-disclaimer-card"
        className="border border-muted bg-muted/50 rounded-lg p-4 relative"
      >
        <div className="absolute top-2 right-2">
          <DownloadButton
            elementId="risk-disclaimer-card"
            filename="risk-disclaimer.png"
            size="sm"
            showText={false}
          />
        </div>
        <h3 className="font-semibold text-foreground mb-2">
          ⚠️ Investment Disclaimer
        </h3>
        <p className="text-sm text-muted-foreground">
          All investments carry risk. Past performance does not guarantee future
          results. APY rates are estimates and subject to change. Please do your
          own research and consider your risk tolerance before investing. This
          is not financial advice.
        </p>
      </div>
    </div>
  );
}
