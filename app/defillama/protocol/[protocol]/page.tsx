"use client";

import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { DownloadButton } from "@/components/ui/download-button";
import {
  useDefillamaProtocol,
  useDefillamaProtocolTvl,
} from "@/hooks/use-defillama";

export default function ProtocolDetailPage() {
  const params = useParams<{ protocol: string }>();
  const slug = params?.protocol as string | undefined;
  const { data, isLoading, error } = useDefillamaProtocol(slug);
  const { data: tvlData } = useDefillamaProtocolTvl(slug);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Protocol: {slug}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
            <div className="text-sm text-muted-foreground">Overview</div>
            <DownloadButton
              elementId="protocol-overview-card"
              filename={`protocol-${slug}-overview.png`}
            />
          </div>
          {isLoading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">
              {String((error as Error).message)}
            </div>
          ) : data ? (
            <div id="protocol-overview-card" className="space-y-2">
              <div className="text-lg font-medium flex items-center gap-2">
                {data.logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.logo}
                    alt={data.name}
                    className="h-6 w-6 rounded-sm object-contain"
                  />
                )}
                <span>{data.name}</span>
              </div>
              {data.description && (
                <p className="text-sm opacity-80">{data.description}</p>
              )}
              <div className="text-sm">Category: {data.category ?? "-"}</div>
              <div className="text-sm">
                Chains:{" "}
                {Array.isArray(data.chains) ? data.chains.join(", ") : "-"}
              </div>
              <div className="text-sm">
                Website:{" "}
                {data.url ? (
                  <a
                    href={data.url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    {data.url}
                  </a>
                ) : (
                  "-"
                )}
              </div>
              <div className="text-sm">
                Twitter:{" "}
                {data.twitter ? (
                  <a
                    href={`https://twitter.com/${data.twitter}`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    @{data.twitter}
                  </a>
                ) : (
                  "-"
                )}
              </div>
              <div className="text-sm">
                Market Cap:{" "}
                {typeof data.mcap === "number"
                  ? data.mcap.toLocaleString()
                  : "-"}
              </div>
              <div className="text-sm">
                Current TVL:{" "}
                {typeof tvlData?.tvl === "number"
                  ? tvlData.tvl.toLocaleString()
                  : "-"}
              </div>
            </div>
          ) : null}
        </Card>
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
            <div className="text-sm font-medium">TVL Series (last points)</div>
            <DownloadButton
              elementId="protocol-tvl-card"
              filename={`protocol-${slug}-tvl-series.png`}
            />
          </div>
          <ul
            id="protocol-tvl-card"
            className="text-sm space-y-1 max-h-80 overflow-auto"
          >
            {Array.isArray(data?.tvl) ? (
              data!.tvl.slice(-20).map((pt: any) => (
                <li key={pt.date} className="flex justify-between">
                  <span>{new Date(pt.date * 1000).toLocaleDateString()}</span>
                  <span>{pt.totalLiquidityUSD.toLocaleString()}</span>
                </li>
              ))
            ) : (
              <li>-</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
