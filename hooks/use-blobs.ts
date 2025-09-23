import { useQuery } from "@tanstack/react-query";
import { walrusApi } from "@/lib/api-service";
import { BlobsQueryParams } from "@/lib/api-types";

export const useBlobs = (params: BlobsQueryParams = {}) => {
  return useQuery({
    queryKey: ["blobs", params],
    queryFn: () => walrusApi.getBlobs(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, 
  });
};

export const useBlobsPaginated = (page: number = 0, size: number = 20) => {
  return useBlobs({
    page,
    size,
    orderBy: "DESC",
    sortBy: "TIMESTAMP",
  });
};
