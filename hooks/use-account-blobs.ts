import { useQuery } from "@tanstack/react-query";
import { walrusApi } from "@/lib/api-service";
import { BlobsQueryParams } from "@/lib/api-types";

export function useAccountBlobs(
  address: string | null,
  params: BlobsQueryParams = {}
) {
  return useQuery({
    queryKey: ["account-blobs", address, params],
    queryFn: () => {
      if (!address) throw new Error("Missing account address");
      return walrusApi.getAccountBlobs(address, params);
    },
    enabled: Boolean(address),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export const useAccountBlobsPaginated = (
  address: string | null,
  page: number = 0,
  size: number = 20
) => {
  return useAccountBlobs(address, {
    page,
    size,
    orderBy: "DESC",
    sortBy: "TIMESTAMP",
  });
};
