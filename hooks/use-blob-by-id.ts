import { useQuery } from "@tanstack/react-query";
import { walrusApi } from "@/lib/api-service";

export function useBlobById(id: string | null) {
  return useQuery({
    queryKey: ["blob", id],
    queryFn: () => {
      if (!id) throw new Error("Missing blob id");
      return walrusApi.getBlobById(id);
    },
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
}

