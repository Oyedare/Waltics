"use client";
import React, { memo } from "react";
import Link from "next/link";
import {
  Database,
  Server,
  Users,
  BarChart3,
  FileText,
  Search,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  // SidebarTrigger,
} from "@/components/ui/sidebar";
import { useContent } from "@/lib/content-context";

// Dashboard navigation items per user's structure
const overviewItems = [
  {
    title: "Overview",
    url: "#overview",
    icon: BarChart3,
  },
];

const blobsItems = [
  {
    title: "All Blobs",
    url: "#blobs-all",
    icon: Database,
  },
  {
    title: "Blob Details",
    url: "#blobs-detail",
    icon: FileText,
  },
  {
    title: "Account Blobs",
    url: "#blobs-account",
    icon: Search,
  },
];

const accountsItems = [
  {
    title: "Accounts",
    url: "#accounts",
    icon: Users,
  },
];

const nodesItems = [
  {
    title: "Nodes",
    url: "#nodes",
    icon: Server,
  },
];

// Analytics section removed per product decision

// Tokenomics section items
// const tokenomicsItems = [
//   {
//     title: "WAL Supply Chart",
//     url: "#tokenomics-supply",
//     icon: Coins,
//   },
//   {
//     title: "WAL Price Trend",
//     url: "#tokenomics-price",
//     icon: TrendingUp,
//   },
//   {
//     title: "Subsidy Pool Balance",
//     url: "#tokenomics-subsidy",
//     icon: Target,
//   },
//   {
//     title: "WAL Paid Per Epoch",
//     url: "#tokenomics-payout",
//     icon: BarChart,
//   },
// ];

// Usage Insights section items
// const usageItems = [
//   {
//     title: "Top dApps",
//     url: "#usage-dapps",
//     icon: Users,
//   },
//   {
//     title: "Category Breakdown",
//     url: "#usage-categories",
//     icon: PieChart,
//   },
//   {
//     title: "Storage Growth Trend",
//     url: "#usage-growth",
//     icon: TrendingUp,
//   },
// ];

// Health & Forecasting section items
// const healthItems = [
//   {
//     title: "Redundancy Health",
//     url: "#health-redundancy",
//     icon: Gauge,
//   },
//   {
//     title: "Expiry Forecast",
//     url: "#health-expiry",
//     icon: Clock,
//   },
//   {
//     title: "Subsidy Sustainability",
//     url: "#health-sustainability",
//     icon: Shield,
//   },
// ];

const AppSidebar = memo(function AppSidebar() {
  const { activeContent } = useContent();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between px-2 py-3">
          <h1 className="text-lg font-bold text-foreground">Waltics</h1>
          {/* <SidebarTrigger className="h-8 w-8" /> */}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Section - Overview */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
            Overview
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {overviewItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeContent === item.url.replace("#", "")}
                    className="text-sm font-medium hover:bg-accent/50 transition-colors"
                  >
                    <Link href={`/${item.url.replace("#", "")}`}>
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground/90">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Section - Blobs */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
            Blobs
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {blobsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeContent === item.url.replace("#", "")}
                    className="text-sm font-medium hover:bg-accent/50 transition-colors"
                  >
                    <Link href={`/${item.url.replace("#", "")}`}>
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground/90">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Section - Accounts */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
            Accounts
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeContent === item.url.replace("#", "")}
                    className="text-sm font-medium hover:bg-accent/50 transition-colors"
                  >
                    <Link href={`/${item.url.replace("#", "")}`}>
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground/90">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Section - Nodes (if available) */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
            Nodes
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nodesItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeContent === item.url.replace("#", "")}
                    className="text-sm font-medium hover:bg-accent/50 transition-colors"
                  >
                    <Link href={`/${item.url.replace("#", "")}`}>
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground/90">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Analytics section removed */}

        {/* Section 5 - Tokenomics */}
        {/* <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
            Tokenomics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tokenomicsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeContent === item.url.replace("#", "")}
                    className="text-sm font-medium hover:bg-accent/50 transition-colors"
                  >
                    <Link href={`/${item.url.replace("#", "")}`}>
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground/90">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}

        {/* Section 6 - Usage Insights */}
        {/* <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
            Usage Insights
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {usageItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeContent === item.url.replace("#", "")}
                    className="text-sm font-medium hover:bg-accent/50 transition-colors"
                  >
                    <Link href={`/${item.url.replace("#", "")}`}>
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground/90">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}

        {/* Section 7 - Health & Forecasting */}
        {/* <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
            Health & Forecasting
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {healthItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeContent === item.url.replace("#", "")}
                    className="text-sm font-medium hover:bg-accent/50 transition-colors"
                  >
                    <Link href={`/${item.url.replace("#", "")}`}>
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground/90">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}
      </SidebarContent>
    </Sidebar>
  );
});

export { AppSidebar };
