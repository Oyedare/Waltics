"use client";
import { Download } from "lucide-react";
import { downloadElementAsPng } from "@/lib/download";
import { DownloadButton } from "@/components/ui/download-button";

export default function MarketOverviewPage() {
  return (
    <div className="p-8">
      <div className="" id="market-overview-export">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Market Overview</h1>
        </div>
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div id="tvl-card" className="p-6 border rounded-lg relative">
              <div className="absolute top-2 right-2">
                <DownloadButton
                  elementId="tvl-card"
                  filename="total-value-locked.png"
                  size="sm"
                  showText={false}
                />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Total Value Locked
              </h3>
              <div className="text-2xl font-bold">$2.4B</div>
              <div className="text-sm text-foreground">+12.5%</div>
            </div>
            <div
              id="active-addresses-card"
              className="p-6 border rounded-lg relative"
            >
              <div className="absolute top-2 right-2">
                <DownloadButton
                  elementId="active-addresses-card"
                  filename="active-addresses.png"
                  size="sm"
                  showText={false}
                />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Active Addresses
              </h3>
              <div className="text-2xl font-bold">145K</div>
              <div className="text-sm text-foreground">+8.2%</div>
            </div>
            <div
              id="transactions-card"
              className="p-6 border rounded-lg relative"
            >
              <div className="absolute top-2 right-2">
                <DownloadButton
                  elementId="transactions-card"
                  filename="transactions-24h.png"
                  size="sm"
                  showText={false}
                />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Transactions (24h)
              </h3>
              <div className="text-2xl font-bold">892K</div>
              <div className="text-sm text-foreground">-3.1%</div>
            </div>
            <div id="sui-price-card" className="p-6 border rounded-lg relative">
              <div className="absolute top-2 right-2">
                <DownloadButton
                  elementId="sui-price-card"
                  filename="sui-price.png"
                  size="sm"
                  showText={false}
                />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                SUI Price
              </h3>
              <div className="text-2xl font-bold">$4.32</div>
              <div className="text-sm text-foreground">+5.7%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              id="top-protocols-card"
              className="p-6 border rounded-lg relative"
            >
              <div className="absolute top-2 right-2">
                <DownloadButton
                  elementId="top-protocols-card"
                  filename="top-protocols.png"
                  size="sm"
                  showText={false}
                />
              </div>
              <h3 className="text-lg font-semibold mb-4">Top Protocols</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Cetus Protocol</span>
                  <span className="font-semibold">$456M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Scallop</span>
                  <span className="font-semibold">$234M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Turbos Finance</span>
                  <span className="font-semibold">$189M</span>
                </div>
              </div>
            </div>

            <div
              id="recent-activity-card"
              className="p-6 border rounded-lg relative"
            >
              <div className="absolute top-2 right-2">
                <DownloadButton
                  elementId="recent-activity-card"
                  filename="recent-activity.png"
                  size="sm"
                  showText={false}
                />
              </div>
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium">New DEX Launch</div>
                  <div className="text-muted-foreground">
                    FlowX Finance went live on Sui
                  </div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Partnership Announcement</div>
                  <div className="text-muted-foreground">
                    Sui Foundation partners with Circle
                  </div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Network Upgrade</div>
                  <div className="text-muted-foreground">
                    Sui v1.15.0 released with performance improvements
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
