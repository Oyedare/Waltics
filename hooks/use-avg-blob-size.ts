import { useQuery } from "@tanstack/react-query";
import { walrusApi } from "@/lib/api-service";

export function useAvgBlobSize(period: "24H" | "7D" | "30D" = "7D") {
  return useQuery({
    queryKey: [
      "widget",
      "avg-blob-size",
      { period, size: "SMALL", widgetPage: "HOME" },
    ],
    queryFn: () => walrusApi.getAvgBlobSize(period, "SMALL", "HOME"),
    staleTime: 60 * 1000,
  });
}
