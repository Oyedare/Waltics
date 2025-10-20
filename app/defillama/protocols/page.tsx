"use client";

import { useDefillamaProtocols } from "@/hooks/use-defillama";
import { Card } from "@/components/ui/card";
import { DownloadButton } from "@/components/ui/download-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export default function DefillamaProtocolsPage() {
  const { data, isLoading, error } = useDefillamaProtocols();

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Sui Protocols</h2>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-muted-foreground">
            Sui Protocols with current TVL
          </div>
          <DownloadButton
            elementId="defillama-protocols-table"
            filename="defillama-protocols.png"
          />
        </div>
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{String((error as Error).message)}</div>
        ) : (
          <div id="defillama-protocols-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Chains</TableHead>
                  <TableHead>TVL</TableHead>
                  <TableHead>24h%</TableHead>
                  <TableHead>7d%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).slice(0, 200).map((p: any) => {
                  const slug = (p.slug || p.name || "")
                    .toString()
                    .toLowerCase()
                    .replace(/\s+/g, "-");
                  const chains: string[] = Array.isArray(p.chains)
                    ? p.chains
                    : [];
                  const visibleChains = chains.slice(0, 5);
                  const remaining = Math.max(
                    0,
                    chains.length - visibleChains.length
                  );
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {p.logo && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.logo}
                              alt={p.name}
                              className="h-5 w-5 rounded-sm object-contain"
                            />
                          )}
                          <Link
                            href={`/defillama/protocol/${encodeURIComponent(
                              slug
                            )}`}
                            className="underline"
                          >
                            {p.name}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>{p.category ?? "-"}</TableCell>
                      <TableCell>
                        {visibleChains.length > 0 ? (
                          <>
                            {visibleChains.join(", ")}
                            {remaining > 0 && (
                              <span className="ml-1 text-muted-foreground">
                                +{remaining} more
                              </span>
                            )}
                          </>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {typeof p.tvl === "number"
                          ? p.tvl.toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell>{p.change_1d ?? "-"}</TableCell>
                      <TableCell>{p.change_7d ?? "-"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
