"use client";

import React, { memo } from "react";
import { Search, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useContent } from "@/lib/content-context";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Navbar = memo(function Navbar() {
  const { activeContent } = useContent();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const getActiveTitle = () => {
    // Prefer URL path for accuracy; fall back to content context
    const raw = (pathname || "/").replace(/^\/+|\/+$/g, "");
    const key = raw || activeContent || "market-overview";

    const titleMap: Record<string, string> = {
      // top-level routes
      "": "Overview",
      overview: "Walrus Overview",
      "market-overview": "Market Overview",
      news: "Latest News",
      invest: "Invest",
      chatbot: "AI Assistant",
      "network-map": "Network Map",

      // walrus
      "blobs-all": "All Blobs",
      "blobs-detail": "Blob Details",
      "blobs-account": "Account Blobs",
      accounts: "Accounts",
      "storage-providers": "Storage Providers",
      "storage-calculator": "Storage Cost Calculator",

      // sui nested (path style)
      "sui/overview": "Sui Overview",
      "sui/validators": "Sui Validators",
      "sui/network-map": "Sui Network Map",

      // nexa nested (path style)
      "nexa/latest-created-coins": "Latest Created Coins",
      "nexa/latest-meme-launcher": "Latest Meme Launcher",
      "nexa/trending-coins": "Trending Coins",
      "nexa/safety-check": "Safety Check",
      "nexa/top-gainers": "Top Gainers",
      "nexa/top-holder-quality": "Top Holder Quality",
      "nexa/top-trade-count": "Top Trade Count",

      // older dash-style keys from content context (compat)
      "sui-overview": "Sui Overview",
      "sui-validators": "Sui Validators",
      "sui-network-map": "Sui Network Map",
    };

    if (titleMap[key] !== undefined) return titleMap[key];

    // Fallback: prettify the last path segment
    const seg = key.split("/").pop() || "market-overview";
    return seg
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center px-4 sm:px-6 py-4.5">
        <div className="flex-1 flex items-center">
          <SidebarTrigger className="mr-2 md:hidden" />
          <h1 className="text-xl font-semibold text-foreground">
            {getActiveTitle()}
          </h1>
        </div>

        {/* <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search analytics..." className="pl-10 pr-4" />
          </div>
        </div> */}

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
