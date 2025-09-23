"use client";

import React, { memo } from "react";
import { Search, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useContent } from "@/lib/content-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Navbar = memo(function Navbar() {
  const { activeContent } = useContent();
  const { theme, setTheme } = useTheme();

  const getActiveTitle = () => {
    if (!activeContent) return "Overview";

    const titleMap: Record<string, string> = {
      "overview-blobs": "Total Blobs Stored",
      "overview-data": "Total Data Stored",
      "overview-nodes": "Active Nodes",
      "overview-price": "WAL Price",
      "calculator-size": "Size Input Calculator",
      "calculator-duration": "Duration Calculator",
      "calculator-cost": "Cost Breakdown",
      "calculator-comparison": "Comparison Table",
      "network-blob-size": "Blob Size Distribution",
      "network-lifecycle": "Blob Lifecycle",
      "network-new-blobs": "New Blobs Per Day",
      "network-uptime": "Node Uptime Stats",
      "geo-world-map": "Interactive World Map",
      "geo-capacity": "Regional Storage Capacity",
      "geo-latency": "Latency Benchmarks",
      "tokenomics-supply": "WAL Supply Chart",
      "tokenomics-price": "WAL Price Trend",
      "tokenomics-subsidy": "Subsidy Pool Balance",
      "tokenomics-payout": "WAL Paid Per Epoch",
      "usage-dapps": "Top dApps",
      "usage-categories": "Category Breakdown",
      "usage-growth": "Storage Growth Trend",
      "health-redundancy": "Redundancy Health",
      "health-expiry": "Expiry Forecast",
      "health-sustainability": "Subsidy Sustainability",
    };

    return titleMap[activeContent] || "Dashboard";
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center px-6 py-4.5">
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-foreground">
            {getActiveTitle()}
          </h1>
        </div>

        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search analytics..." className="pl-10 pr-4" />
          </div>
        </div>

        <div className="flex-1 flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </nav>
  );
});

export { Navbar };
