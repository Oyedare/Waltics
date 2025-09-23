"use client";

import React, { memo, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useBlobById } from "@/hooks/use-blob-by-id";
import { formatBytes } from "@/lib/blob-utils";
import { Download } from "lucide-react";
import { downloadElementAsPng } from "@/lib/download";

const BlobsDetailPage = memo(function BlobsDetailPage() {
  const [inputId, setInputId] = useState("");
  const id = useMemo(() => inputId.trim() || null, [inputId]);
  const { data, isLoading, isError, refetch, isFetching } = useBlobById(id);

  return (
    <div className="p-6 h-full space-y-6">
      <Card>
        <CardHeader className="flex items-start justify-between gap-3">
          <CardTitle>Blob Details</CardTitle>
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
              <div className="flex items-center justify-end mb-3">
                <button
                  className="h-8 px-3 rounded-md border border-border text-sm cursor-pointer inline-flex items-center gap-1"
                  onClick={() => {
                    const el = document.getElementById("blob-detail-panel");
                    if (el) downloadElementAsPng(el, "blob-detail.png");
                  }}
                >
                  <Download className="h-4 w-4" /> Download
                </button>
              </div>
              <div
                id="blob-detail-panel"
                className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm"
              >
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
