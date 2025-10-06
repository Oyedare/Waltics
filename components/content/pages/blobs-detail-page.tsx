"use client";

import React, { memo, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useBlobById } from "@/hooks/use-blob-by-id";
import { formatBytes } from "@/lib/blob-utils";
import { DownloadButton } from "@/components/ui/download-button";

const BlobsDetailPage = memo(function BlobsDetailPage() {
  const [inputId, setInputId] = useState("");
  const id = useMemo(() => inputId.trim() || null, [inputId]);
  const { data, isLoading, isError, refetch, isFetching } = useBlobById(id);

  return (
    <div className="p-6 h-full space-y-6">
      <Card id="blob-detail-panel">
        <CardHeader className="flex items-start justify-between gap-3">
          <div className="flex items-center justify-between w-full">
            <CardTitle>Blob Details</CardTitle>
            <DownloadButton
              elementId="blob-detail-panel"
              filename="blob-detail.png"
              size="sm"
              showText={false}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              placeholder="Enter blobIdBase64"
              className="h-9 w-[320px] rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 ring-offset-0 ring-ring"
            />
            <button
              className="h-9 rounded-md px-3 border border-border cursor-pointer"
              onClick={() => refetch()}
              disabled={!id || isFetching}
            >
              Fetch
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {!id ? (
            <div className="text-sm text-muted-foreground">
              Enter a blobIdBase64 to view details.
            </div>
          ) : isLoading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : isError ? (
            <div className="text-sm text-muted-foreground">
              Failed to load blob details.
            </div>
          ) : !data ? (
            <div className="text-sm text-muted-foreground">No data.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Blob ID (base64)
                    </div>
                    <div className="font-medium break-all">
                      {data.blobIdBase64}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Blob ID</div>
                    <div className="break-all">{data.blobId}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Size</div>
                    <div className="font-medium">{formatBytes(data.size)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Lifecycle
                    </div>
                    <div className="font-medium">
                      {data.startEpoch}–{data.endEpoch}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Sender</div>
                    <div className="break-all">{data.senderAddress ?? "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      SUI Object ID
                    </div>
                    <div className="break-all">{data.suiObjectId}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      SUI Package ID
                    </div>
                    <div className="break-all">{data.suiPackageId}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export { BlobsDetailPage };
