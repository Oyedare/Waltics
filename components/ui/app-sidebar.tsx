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

// const nodesItems = [
//   {
//     title: "Nodes",
//     url: "#nodes",
//     icon: Server,
//   },
// ];

const providersItems = [
  {
    title: "Storage Providers",
    url: "#storage-providers",
    icon: Layers,
  },
];

const chatbotItems = [
  {
    title: "AI Assistant",
    url: "#chatbot",
    icon: MessageSquare,
  },
];

const networkItems = [
  {
    title: "Network Map",
    url: "#network-map",
    icon: Map,
  },
];

const calculatorItems = [
  {
    title: "Storage Calculator",
    url: "#storage-calculator",
    icon: Calculator,
  },
];

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

        {/* Section - Providers */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
            Providers
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {providersItems.map((item) => (
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

        {/* Section - Calculator */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {calculatorItems.map((item) => (
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

        {/* Section - Network */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
            Network
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {networkItems.map((item) => (
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

        {/* <SidebarGroup>
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
        </SidebarGroup> */}

        {/* Section - AI Assistant */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
            AI
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chatbotItems.map((item) => (
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
      </SidebarContent>
    </Sidebar>
  );
});

export { AppSidebar };
