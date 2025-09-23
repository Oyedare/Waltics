"use client";

import React, { memo } from "react";
import {
  OverviewPage,
  BlobsAllPage,
  BlobsDetailPage,
  BlobsAccountPage,
  AccountsPage,
  // NodesPage,
} from "./pages";
import { useContent } from "@/lib/content-context";

const MainContent = memo(function MainContent() {
  const { activeContent } = useContent();

  if (!activeContent || activeContent === "overview") return <OverviewPage />;

  if (activeContent === "blobs-all") return <BlobsAllPage />;
  if (activeContent === "blobs-detail") return <BlobsDetailPage />;
  if (activeContent === "blobs-account") return <BlobsAccountPage />;
  if (activeContent === "accounts") return <AccountsPage />;
  // if (activeContent === "nodes") return <NodesPage />;

  return (
    <div className="p-6 flex items-center justify-center flex-col h-full">
      <h1 className="text-3xl font-bold mb-6">Coming Soon</h1>
      <p className="text-muted-foreground">
        This section is under development. More content will be available soon.
      </p>
    </div>
  );
});

export { MainContent };
