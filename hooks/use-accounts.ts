import { useQuery } from "@tanstack/react-query";
import { walrusApi } from "@/lib/api-service";

export function useAccounts(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ["accounts", { page, size }],
    queryFn: () => walrusApi.getAccounts(page, size),
    staleTime: 5 * 60 * 1000,
  });
}
