"use client";

import React, { memo } from "react";
import {
  OverviewPage,
  BlobsAllPage,
  BlobsDetailPage,
  // NodesPage,
  AccountsPage,
  BlobsAccountPage,
  StorageProvidersPage,
  ChatbotPage,
  NetworkMapPage,
  StorageCalculatorPage,
} from "./pages";
import { useContent } from "@/lib/content-context";

const MainContent = memo(function MainContent() {
  const { activeContent } = useContent();

  if (!activeContent || activeContent === "overview") return <OverviewPage />;

  if (activeContent === "blobs-all") return <BlobsAllPage />;
  if (activeContent === "blobs-detail") return <BlobsDetailPage />;
  if (activeContent === "blobs-account") return <BlobsAccountPage />;
  if (activeContent === "accounts") return <AccountsPage />;
  if (activeContent === "storage-providers") return <StorageProvidersPage />;
  if (activeContent === "chatbot") return <ChatbotPage />;
  if (activeContent === "network-map") return <NetworkMapPage />;
  if (activeContent === "storage-calculator") return <StorageCalculatorPage />;
  // if (activeContent === "nodes") return <NodesPage />;

  return (
    <div className="p-3 sm:p-4 lg:p-6 flex items-center justify-center flex-col h-full min-h-[400px]">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-center">
        Coming Soon
      </h1>
      <p className="text-sm sm:text-base text-muted-foreground text-center max-w-md">
        This section is under development. More content will be available soon.
      </p>
    </div>
  );
});

export { MainContent };

// walrus health --committee
// walrus health --committee --json
