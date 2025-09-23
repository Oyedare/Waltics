"use client";

import React, { memo, useMemo, useRef, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

type Network = "mainnet" | "testnet";

const ENDPOINTS: Record<
  Network,
  { role: "Aggregator" | "Publisher"; url: string }[]
> = {
  mainnet: [
    {
      role: "Aggregator",
      url: "https://wal-aggregator-mainnet.staketab.org:443",
    },
    {
      role: "Publisher",
      url: "https://walrus-mainnet-publisher-1.staketab.org:443",
    },
  ],
  testnet: [
    {
      role: "Aggregator",
      url: "https://wal-aggregator-testnet.staketab.org/v1/api",
    },
    {
      role: "Publisher",
      url: "https://wal-publisher-testnet.staketab.org/v1/api",
    },
  ],
};

const NodesPage = memo(function NodesPage() {
  const [network, setNetwork] = useState<Network>("mainnet");
  const endpoints = useMemo(() => ENDPOINTS[network], [network]);

  return (
    <div className="p-6 h-full space-y-6">
      <Card>
        <CardHeader className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Walrus Nodes</CardTitle>
            <CardDescription>
              Public aggregator and publisher endpoints
            </CardDescription>
          </div>
          <NetworkToggle value={network} onChange={setNetwork} />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {endpoints.map((e) => (
              <EndpointCard key={e.url} role={e.role} url={e.url} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What each node does</CardTitle>
          <CardDescription>Quick explainer of node roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <RoleTile
              title="Storage Node"
              points={[
                "Stores data",
                "Ensures availability",
                "Integrity checks",
              ]}
            />
            <RoleTile
              title="Publisher Node"
              points={[
                "Data upload & management",
                "Metadata handling",
                "Access control",
              ]}
            />
            <RoleTile
              title="Aggregator Node"
              points={["Data aggregation", "Load balancing", "Verification"]}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

function NetworkToggle({
  value,
  onChange,
}: {
  value: Network;
  onChange: (v: Network) => void;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Network:</span>
      <div className="inline-flex rounded-md border border-border overflow-hidden">
        <button
          className={`px-3 py-1.5 text-sm ${
            value === "mainnet"
              ? "bg-accent text-accent-foreground"
              : "bg-background text-foreground"
          }`}
          onClick={() => onChange("mainnet")}
        >
          Mainnet
        </button>
        <button
          className={`px-3 py-1.5 text-sm border-l border-border ${
            value === "testnet"
              ? "bg-accent text-accent-foreground"
              : "bg-background text-foreground"
          }`}
          onClick={() => onChange("testnet")}
        >
          Testnet
        </button>
      </div>
    </div>
  );
}

function RoleTile({ title, points }: { title: string; points: string[] }) {
  return (
    <div className="rounded-md border border-border p-4">
      <div className="text-sm font-semibold mb-2">{title}</div>
      <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
        {points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  );
}

function EndpointCard({
  role,
  url,
}: {
  role: "Aggregator" | "Publisher";
  url: string;
}) {
  const [status, setStatus] = useState<"idle" | "ok" | "degraded" | "down">(
    "idle"
  );
  const [latency, setLatency] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const isPinging = useRef(false);

  async function ping() {
    if (isPinging.current) return;
    isPinging.current = true;
    setNote(null);
    try {
      const start = performance.now();
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 8000);
      let res: Response | null = null;
      try {
        res = await fetch(url, {
          method: "HEAD",
          mode: "cors",
          signal: controller.signal,
        });
      } catch (_e) {
        res = await fetch(url, {
          method: "GET",
          mode: "cors",
          signal: controller.signal,
        });
      }
      clearTimeout(id);
      const ms = Math.round(performance.now() - start);
      setLatency(ms);

      if (!res || !("ok" in res)) {
        setStatus("down");
        setNote("No response");
      } else if (res.ok) {
        setStatus("ok");
      } else if (res.status >= 500) {
        setStatus("down");
      } else {
        setStatus("degraded");
      }
    } catch (e: any) {
      setStatus("degraded");
      setNote(e?.name === "AbortError" ? "Timeout" : "CORS/Network error");
    } finally {
      isPinging.current = false;
    }
  }

  function copyToClipboard() {
    navigator.clipboard?.writeText(url).catch(() => {});
  }

  const badgeColor =
    status === "ok"
      ? "bg-emerald-500"
      : status === "degraded"
      ? "bg-amber-500"
      : status === "down"
      ? "bg-red-500"
      : "bg-muted-foreground";

  return (
    <div className="rounded-md border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs inline-flex items-center gap-2">
              <span
                className={`inline-block h-2 w-2 rounded-full ${badgeColor}`}
              />
              <span className="uppercase tracking-wide text-muted-foreground">
                {role}
              </span>
            </span>
          </div>
          <div className="text-sm font-medium break-all text-foreground/90">
            {url}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="h-8 px-3 rounded-md border border-border text-sm cursor-pointer"
            onClick={copyToClipboard}
            title="Copy endpoint"
          >
            Copy
          </button>
          <a
            className="h-8 px-3 rounded-md border border-border text-sm cursor-pointer inline-flex items-center"
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            Open
          </a>
          <button
            className="h-8 px-3 rounded-md border border-border text-sm cursor-pointer"
            onClick={ping}
          >
            Ping
          </button>
        </div>
      </div>
      <div className="mt-3 text-xs text-muted-foreground flex items-center gap-3">
        <span>Latency: {latency != null ? `${latency} ms` : "—"}</span>
        {note && <span>({note})</span>}
      </div>
    </div>
  );
}

export { NodesPage };
