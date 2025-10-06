export default function NewsPage() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Latest News</h1>

        <div className="space-y-6">
          <article className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0"></div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">
                  Sui Network Reaches New Transaction Milestone
                </h2>
                <p className="text-muted-foreground mb-3">
                  The Sui blockchain has processed over 1 billion transactions,
                  marking a significant milestone in its journey towards
                  becoming a leading Layer 1 solution.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>2 hours ago</span>
                  <span>•</span>
                  <span>Blockchain</span>
                </div>
              </div>
            </div>
          </article>

          <article className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0"></div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">
                  New DeFi Protocol Launches on Sui
                </h2>
                <p className="text-muted-foreground mb-3">
                  FlowX Finance, a new automated market maker, has officially
                  launched on the Sui network, bringing innovative liquidity
                  solutions to the ecosystem.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>6 hours ago</span>
                  <span>•</span>
                  <span>DeFi</span>
                </div>
              </div>
            </div>
          </article>

          <article className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0"></div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">
                  Sui Foundation Announces Developer Grant Program
                </h2>
                <p className="text-muted-foreground mb-3">
                  A new $10M grant program has been launched to support
                  developers building innovative applications on the Sui
                  blockchain.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>1 day ago</span>
                  <span>•</span>
                  <span>Development</span>
                </div>
              </div>
            </div>
          </article>

          <article className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0"></div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">
                  Walrus Storage Network Expands Globally
                </h2>
                <p className="text-muted-foreground mb-3">
                  The decentralized storage network has added 15 new storage
                  providers across different continents, improving global
                  accessibility and redundancy.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>2 days ago</span>
                  <span>•</span>
                  <span>Storage</span>
                </div>
              </div>
            </div>
          </article>

          <article className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0"></div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">
                  Major Exchange Lists SUI Token
                </h2>
                <p className="text-muted-foreground mb-3">
                  A leading cryptocurrency exchange has announced the listing of
                  SUI token, providing increased liquidity and accessibility for
                  traders.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>3 days ago</span>
                  <span>•</span>
                  <span>Trading</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
