"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { usePathname } from "next/navigation";

type ContentType =
  | "overview"
  | "blobs-all"
  | "blobs-detail"
  | "blobs-account"
  | "accounts"
  | "nodes"
  | "analytics"
  | null;

interface ContentContextType {
  activeContent: ContentType;
  setActiveContent: (content: ContentType) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [activeContent, setActiveContent] = useState<ContentType>("overview");
  const pathname = usePathname();

  // Sync URL with active content
  useEffect(() => {
    const path = pathname.replace("/", "");
    if (path && path !== activeContent) {
      setActiveContent(path as ContentType);
    } else if (!path || path === "") {
      // Default to overview when no path
      setActiveContent("overview");
    }
  }, [pathname, activeContent]);

  const contextValue = useMemo(
    () => ({
      activeContent,
      setActiveContent,
    }),
    [activeContent, setActiveContent]
  );

  return (
    <ContentContext.Provider value={contextValue}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
}
