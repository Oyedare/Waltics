import { useQuery } from "@tanstack/react-query";
import { walrusApi } from "@/lib/api-service";

export function useAccountByHash(address: string | null) {
  return useQuery({
    queryKey: ["account-detail", address],
    queryFn: () => {
      if (!address) throw new Error("Missing account address");
      return walrusApi.getAccountByHash(address);
    },
    enabled: Boolean(address),
    staleTime: 60 * 1000,
  });
}
