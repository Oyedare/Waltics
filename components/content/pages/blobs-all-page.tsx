"use client";

import React, { memo, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useBlobs } from "@/hooks/use-blobs";
import { formatBytes } from "@/lib/blob-utils";
import { Download } from "lucide-react";
import { downloadElementAsPng } from "@/lib/download";

function formatDate(ts: number): string {
  try {
    const d = new Date(ts);
    return d.toLocaleString();
  } catch {
    return "";
  }
}

const BlobsAllPage = memo(function BlobsAllPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

  const { data, isLoading, isError, refetch, isFetching } = useBlobs({
    page,
    size,
    orderBy: "DESC",
    sortBy: "TIMESTAMP",
  });

  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const canPrev = page > 0;
  const canNext = page + 1 < totalPages;

  const rows = useMemo(() => data?.content ?? [], [data]);

  return (
    <div className="p-6 h-full space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Blobs</CardTitle>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              Page {page + 1} of {Math.max(1, totalPages)}
            </span>
            <span>•</span>
            <span>{totalElements.toLocaleString()} total</span>
          </div>
        </CardHeader>
        <CardContent>
          <div
            id="table-all-blobs"
            className="rounded-md border border-border overflow-hidden"
          >
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-4 py-2">Blob ID</th>
                    <th className="text-left font-medium px-4 py-2">Size</th>
                    <th className="text-left font-medium px-4 py-2">Status</th>
                    <th className="text-left font-medium px-4 py-2">
                      Timestamp
                    </th>
                    <th className="text-left font-medium px-4 py-2">Account</th>
                    <th className="text-left font-medium px-4 py-2">Epochs</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        Loading…
                      </td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        Failed to load blobs
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        No blobs found
                      </td>
                    </tr>
                  ) : (
                    rows.map((b) => (
                      <tr key={b.blobId} className="border-t border-border">
                        <td className="px-4 py-3 align-top">
                          <div
                            className="font-medium text-foreground/90 truncate max-w-[320px]"
                            title={b.blobId}
                          >
                            {b.blobId}
                          </div>
                          <div
                            className="text-xs text-muted-foreground truncate max-w-[320px]"
                            title={b.blobIdBase64}
                          >
                            {b.blobIdBase64}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          {formatBytes(b.size)}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span
                            className={
                              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
                              (b.status === "Certified"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-amber-500/15 text-amber-600 dark:text-amber-400")
                            }
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top whitespace-nowrap">
                          {formatDate(b.timestamp)}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div
                            className="truncate max-w-[260px]"
                            title={b.objectId}
                          >
                            {b.objectId}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          {b.startEpoch}–{b.endEpoch}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-visible">
                <span>Rows per page</span>
                {(() => {
                  const [open, setOpen] = [
                    undefined as unknown as boolean,
                    undefined as unknown as React.Dispatch<
                      React.SetStateAction<boolean>
                    >,
                  ];
                  return (
                    <RowsPerPageDropdown
                      value={size}
                      onChange={(newSize) => {
                        setPage(0);
                        setSize(newSize);
                        refetch();
                      }}
                    />
                  );
                })()}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <button
                  className="h-8 rounded-md px-3 border border-border disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
                  onClick={() => {
                    const el = document.getElementById("table-all-blobs");
                    if (el) downloadElementAsPng(el, "all-blobs.png");
                  }}
                >
                  <Download className="h-4 w-4" /> Download
                </button>
                <button
                  className="h-8 rounded-md px-3 border border-border disabled:opacity-50 cursor-pointer"
                  onClick={() => setPage(0)}
                  disabled={!canPrev || isFetching}
                >
                  First
                </button>
                <button
                  className="h-8 rounded-md px-3 border border-border disabled:opacity-50 cursor-pointer"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={!canPrev || isFetching}
                >
                  Prev
                </button>
                <span className="px-2 text-muted-foreground">
                  {page + 1} / {Math.max(1, totalPages)}
                </span>
                <button
                  className="h-8 rounded-md px-3 border border-border disabled:opacity-50 cursor-pointer"
                  onClick={() => setPage((p) => (canNext ? p + 1 : p))}
                  disabled={!canNext || isFetching}
                >
                  Next
                </button>
                <button
                  className="h-8 rounded-md px-3 border border-border disabled:opacity-50 cursor-pointer"
                  onClick={() => setPage(Math.max(0, totalPages - 1))}
                  disabled={!canNext || isFetching}
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export { BlobsAllPage };

// Lightweight themed dropdown for rows-per-page selection
function RowsPerPageDropdown({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const options = [10, 20, 50, 100];
  return (
    <div className="relative">
      <button
        type="button"
        className="h-8 inline-flex items-center gap-2 rounded-md px-2.5 border border-border text-foreground bg-background cursor-pointer"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {value}
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M5 7l5 6 5-6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div
          className="absolute z-[9999] mt-1 w-28 rounded-md border border-border bg-popover text-popover-foreground shadow-md"
          role="listbox"
          onMouseLeave={() => setOpen(false)}
          style={{ position: "absolute" }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={
                "w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer " +
                (opt === value ? "font-medium" : "")
              }
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              role="option"
              aria-selected={opt === value}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
