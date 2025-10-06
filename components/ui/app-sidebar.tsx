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
  Layers,
  MessageSquare,
  Map,
  Calculator,
  Globe,
  Newspaper,
  ChartBar,
  Rocket,
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
import { usePathname } from "next/navigation";

const latestItems = [
  {
    title: "Market Overview",
    url: "/",
    icon: Globe,
  },
  {
    title: "News",
    url: "/news",
    icon: Newspaper,
  },

  {
    title: "Invest",
    url: "/invest",
    icon: ChartBar,
  },
];

// Sui section
const suiItems = [
  {
    title: "Sui Overview",
    url: "/sui/overview",
    icon: BarChart3,
  },
  {
    title: "Validators",
    url: "/sui/validators",
    icon: Server,
  },
  {
    title: "Network Map",
    url: "/sui/network-map",
    icon: Map,
  },
];

const walrusItems = [
  {
    title: "Walrus Overview",
    url: "/overview",
    icon: BarChart3,
  },
  {
    title: "All Blobs",
    url: "/blobs-all",
    icon: Database,
  },
  {
    title: "Blob Details",
    url: "/blobs-detail",
    icon: FileText,
  },
  {
    title: "Account Blobs",
    url: "/blobs-account",
    icon: Search,
  },
  {
    title: "Accounts",
    url: "/accounts",
    icon: Users,
  },
  {
    title: "Storage Providers",
    url: "/storage-providers",
    icon: Layers,
  },
  {
    title: "Storage Calculator",
    url: "/storage-calculator",
    icon: Calculator,
  },
  // {
  //   title: "Network Map",
  //   url: "/network-map",
  //   icon: Map,
  // },
];

const nexaItems = [
  {
    title: "Latest Created Coins",
    url: "/nexa/latest-created-coins",
    icon: Rocket,
  },
  {
    title: "Latest Meme Launcher",
    url: "/nexa/latest-meme-launcher",
    icon: Rocket,
  },
  {
    title: "Trending Coins",
    url: "/nexa/trending-coins",
    icon: Rocket,
  },
  {
    title: "Safety Check",
    url: "/nexa/safety-check",
    icon: Rocket,
  },
  {
    title: "Top Gainers",
    url: "/nexa/top-gainers",
    icon: Rocket,
  },
  {
    title: "Top Holder Quality",
    url: "/nexa/top-holder-quality",
    icon: Rocket,
  },
  {
    title: "Top Trade Count",
    url: "/nexa/top-trade-count",
    icon: Rocket,
  },
];

const chatbotItems = [
  {
    title: "AI Assistant",
    url: "/chatbot",
    icon: MessageSquare,
  },
];

const AppSidebar = memo(function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between px-2 py-3">
          <h1 className="text-lg font-bold text-primary">Sui Dashboard</h1>
          {/* <SidebarTrigger className="h-8 w-8" /> */}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Latest Sction */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-primary uppercase tracking-wider">
            Latest
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {latestItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="text-sm font-medium hover:bg-accent/50 transition-colors"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground/90">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sui Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
            Sui
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {suiItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="text-sm font-medium hover:bg-accent/50 transition-colors"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground/90">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Walrus Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
            Walrus
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {walrusItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="text-sm font-medium hover:bg-accent/50 transition-colors"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground/90">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Nexa Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
            Nexa
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nexaItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="text-sm font-medium hover:bg-accent/50 transition-colors"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground/90">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Chatbot Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
            Chatbot
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chatbotItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="text-sm font-medium hover:bg-accent/50 transition-colors"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground/90">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
});

export { AppSidebar };
