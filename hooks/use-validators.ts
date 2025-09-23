import { useQuery } from "@tanstack/react-query";
import { walrusApi } from "@/lib/api-service";

export function useValidators(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ["validators", { page, size }],
    queryFn: () => walrusApi.getValidators(page, size),
    staleTime: 5 * 60 * 1000,
  });
}
