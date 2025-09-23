import { useQuery } from "@tanstack/react-query";
import { walrusApi } from "@/lib/api-service";

export function useTotalAccounts(period: "24H" | "7D" | "30D" = "7D") {
  return useQuery({
    queryKey: [
      "widget",
      "total-accounts",
      { period, size: "SMALL", widgetPage: "HOME" },
    ],
    queryFn: () => walrusApi.getTotalAccounts(period, "SMALL", "HOME"),
    staleTime: 60 * 1000,
  });
}
