import { useQuery } from "@tanstack/react-query";
import { walrusApi } from "@/lib/api-service";

export function useValidators(
  page: number = 0,
  size: number = 20,
  orderBy: "ASC" | "DESC" = "DESC",
  sortBy: "VALIDATOR_NAME" | "COMMISSION_RATE" | "STATUS" | "STAKE" = "STAKE"
) {
  return useQuery({
    queryKey: ["validators", { page, size, orderBy, sortBy }],
    queryFn: () => walrusApi.getValidators(page, size, orderBy, sortBy),
    staleTime: 5 * 60 * 1000,
  });
}
