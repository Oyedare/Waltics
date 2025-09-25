"use client";

import React, { memo, useMemo, useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useValidators } from "@/hooks/use-validators";
import { ExternalLink } from "lucide-react";

const PAGE_SIZE = 20;

const StorageProvidersPage = memo(function StorageProvidersPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  // Base query for pagination view
  const { data, isLoading, error, isFetching } = useValidators(page, PAGE_SIZE);

  // Fetch full list (max 200) to support global totals and client-side search
  const { data: allData } = useValidators(0, 200);

  const baseList = useMemo(
    () => allData?.content ?? data?.content ?? [],
    [allData, data]
  );

  const validators = useMemo(() => {
    if (!search) return data?.content ?? [];
    const q = search.trim().toLowerCase();
    return baseList.filter((v: any) =>
      (v.validatorName || "").toLowerCase().includes(q)
    );
  }, [data, baseList, search]);

  const totalElements = useMemo(() => {
    if (search) return validators.length;
    return allData?.totalElements ?? data?.totalElements ?? validators.length;
  }, [allData, data, validators, search]);

  const totalPages = useMemo(() => {
    if (search) return Math.ceil(validators.length / PAGE_SIZE) || 1;
    return data?.totalPages ?? 1;
  }, [data, search, validators]);

  const pagedValidators = useMemo(() => {
    if (!search) return validators;
    const start = page * PAGE_SIZE;
    return validators.slice(start, start + PAGE_SIZE);
  }, [validators, search, page]);

  // Reset to first page when search changes
  useEffect(() => {
    setPage(0);
  }, [search]);

  // KPIs across ALL validators (or filtered results when searching)
  const kpiList = useMemo(
    () => (search ? validators : baseList),
    [search, validators, baseList]
  );

  const totalStakeAll = useMemo(() => {
    return kpiList.reduce((sum: number, v: any) => sum + (v.stake || 0), 0);
  }, [kpiList]);

  const avgCommissionAll = useMemo(() => {
    if (kpiList.length === 0) return 0;
    const sum = kpiList.reduce(
      (acc: number, v: any) => acc + (v.commissionRate || 0),
      0
    );
    return Math.round((sum / kpiList.length) * 100) / 100;
  }, [kpiList]);

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 h-full overflow-y-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Storage Providers
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Validators overview and metrics
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search validators by name..."
            className="h-9 sm:h-10"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Validators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalElements}</div>
            <p className="text-xs text-muted-foreground">Across the network</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Stake</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalStakeAll.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Sum across {search ? "filtered results" : "all validators"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCommissionAll}%</div>
            <p className="text-xs text-muted-foreground">
              Average across {search ? "filtered results" : "all validators"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Validators</CardTitle>
              <CardDescription>List of storage providers</CardDescription>
            </div>
            {(isLoading || isFetching) && (
              <div className="text-xs text-muted-foreground">Loading...</div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Pagination - top */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-muted-foreground">
              Page {page + 1} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="py-2 pr-3 font-medium">#</th>
                  <th className="py-2 pr-3 font-medium">Validator</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 pr-3 font-medium">Stake</th>
                  <th className="py-2 pr-3 font-medium">Commission</th>
                  <th className="py-2 pr-3 font-medium">Capacity</th>
                  <th className="py-2 pr-3 font-medium">Walruscan</th>
                </tr>
              </thead>
              <tbody>
                {error ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-6 text-center text-muted-foreground"
                    >
                      Failed to load validators
                    </td>
                  </tr>
                ) : (
                  (search ? pagedValidators : data?.content ?? []).map(
                    (v: any, idx: number) => (
                      <tr
                        key={v.validatorHash}
                        className="border-b last:border-b-0"
                      >
                        <td className="py-2 pr-3 align-middle">
                          {page * PAGE_SIZE + idx + 1}
                        </td>
                        <td className="py-2 pr-3 align-middle">
                          <div className="flex items-center gap-2">
                            {v.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={v.imageUrl}
                                alt={v.validatorName}
                                className="h-6 w-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-muted" />
                            )}
                            <div className="font-medium">
                              {v.validatorName || "—"}
                            </div>
                          </div>
                        </td>
                        <td className="py-2 pr-3 align-middle">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                              v.state === "Active"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {v.state || "—"}
                          </span>
                        </td>
                        <td className="py-2 pr-3 align-middle">
                          {(v.stake ?? 0).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-2 pr-3 align-middle">
                          {v.commissionRate ?? 0}%
                        </td>
                        <td className="py-2 pr-3 align-middle">
                          {v.nodeCapacity?.toLocaleString() ?? "—"}
                        </td>
                        <td className="py-2 pr-3 align-middle">
                          <a
                            href={`https://walruscan.com/operator/${v.validatorHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center text-primary hover:underline"
                            title="Open in Walruscan"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </td>
                      </tr>
                    )
                  )
                )}
                {!isLoading &&
                  (search
                    ? pagedValidators.length === 0
                    : (data?.content ?? []).length === 0) &&
                  !error && (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-6 text-center text-muted-foreground"
                      >
                        No validators found
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>

          {/* Pagination - removed from bottom (moved to top) */}
        </CardContent>
      </Card>
    </div>
  );
});

export { StorageProvidersPage };
