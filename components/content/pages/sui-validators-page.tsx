"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  Download,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { downloadElementAsPng } from "@/lib/download";
import Image from "next/image";

type ValidatorData = {
  name: string;
  projectUrl: string;
  imageUrl: string;
  votingPower: string;
  stakingPoolSuiBalance: number;
  rewardsPool: number;
  gasPrice: string;
  commissionRate: number;
  poolTokenBalance: number;
  pendingStake: number;
  stakingPoolActivationEpoch: string;
  location: {
    country: string;
    region: string;
    city: string;
    lat: number;
    lng: number;
  };
  performance: {
    totalStaked: number;
    rewardsRate: string;
    utilization: string;
  };
};

type SortConfig = {
  key: string;
  direction: "asc" | "desc" | null;
};

export default function ValidatorsPage() {
  const [validators, setValidators] = useState<ValidatorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "",
    direction: null,
  });
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadValidators = async () => {
      try {
        const response = await fetch("/api/sui-validators");
        if (!response.ok) {
          throw new Error("Failed to fetch validators");
        }
        const data = await response.json();
        setValidators(data);
        setImageErrors(new Set()); // Reset image errors when new data loads
      } catch (error) {
        console.error("Failed to load validator data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadValidators();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Function to handle sorting
  const requestSort = (key: string) => {
    let direction: "asc" | "desc" | null = "asc";

    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") {
        direction = "desc";
      } else if (sortConfig.direction === "desc") {
        direction = null;
      }
    }

    setSortConfig({ key, direction });
  };

  // Get sorted and filtered validators
  const getSortedValidators = (items: ValidatorData[]) => {
    if (!sortConfig.direction || !sortConfig.key) {
      return items;
    }

    return [...items].sort((a, b) => {
      // Helper function to get nested properties
      const getNestedProperty = (obj: any, path: string) => {
        const keys = path.split(".");
        return keys.reduce(
          (o, key) => (o && o[key] !== undefined ? o[key] : null),
          obj
        );
      };

      let aValue = getNestedProperty(a, sortConfig.key);
      let bValue = getNestedProperty(b, sortConfig.key);

      // Handle null, undefined, or empty values first
      if (aValue === null || aValue === undefined || aValue === "")
        return sortConfig.direction === "asc" ? 1 : -1;
      if (bValue === null || bValue === undefined || bValue === "")
        return sortConfig.direction === "asc" ? -1 : 1;

      // Parse numeric values (including percentages)
      const parseNumericValue = (value: any) => {
        if (typeof value === "number") return value;
        if (typeof value === "string") {
          // Remove % sign and parse as float
          const cleanValue = value.replace("%", "").trim();
          const numericValue = parseFloat(cleanValue);
          return isNaN(numericValue) ? value.toLowerCase() : numericValue;
        }
        return value;
      };

      aValue = parseNumericValue(aValue);
      bValue = parseNumericValue(bValue);

      // Handle string values (case-insensitive) after numeric parsing
      if (typeof aValue === "string" && typeof bValue === "string") {
        // Already converted to lowercase in parseNumericValue if it's a string
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  // Function to render sort icon
  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronsUpDown className="ml-2 h-4 w-4" />;
    }
    if (sortConfig.direction === "asc") {
      return <ChevronUp className="ml-2 h-4 w-4" />;
    }
    if (sortConfig.direction === "desc") {
      return <ChevronDown className="ml-2 h-4 w-4" />;
    }
    return <ChevronsUpDown className="ml-2 h-4 w-4" />;
  };

  // Filter validators based on search term
  const searchFilteredValidators = validators.filter((validator) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      validator.name.toLowerCase().includes(searchLower) ||
      validator.location.city.toLowerCase().includes(searchLower) ||
      validator.location.country.toLowerCase().includes(searchLower) ||
      validator.location.region.toLowerCase().includes(searchLower)
    );
  });

  // Apply sorting to filtered validators
  const filteredValidators = getSortedValidators(searchFilteredValidators);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="">
        <div className="flex items-center justify-between">
          <div className="space-y-2 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Sui Network Validators
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Active validators securing the Sui network
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <StatCard
                key={i}
                title="..."
                value={
                  <span className="inline-block w-16 h-6 bg-muted animate-pulse rounded" />
                }
                info=""
              />
            ))
          ) : (
            <>
              <StatCard
                title="Total Validators"
                value={filteredValidators.length.toString()}
                info={"Active validators securing the network"}
                elementId="validators-total-validators-card"
                filename="validators-total-validators.png"
              />
              <StatCard
                title="Total Stake"
                value={`${formatNumber(
                  filteredValidators.reduce(
                    (sum, v) => sum + v.stakingPoolSuiBalance,
                    0
                  )
                )} SUI`}
                info="SUI tokens staked"
                elementId="validators-total-stake-card"
                filename="validators-total-stake.png"
              />
              <StatCard
                title="Avg Commission"
                value={`${
                  filteredValidators.length > 0
                    ? (
                        filteredValidators.reduce(
                          (sum, v) => sum + v.commissionRate,
                          0
                        ) / filteredValidators.length
                      ).toFixed(1)
                    : "0"
                }%`}
                info="Average commission rate"
                elementId="validators-avg-commission-card"
                filename="validators-avg-commission.png"
              />
              <StatCard
                title="Total Rewards Pool"
                value={`${formatNumber(
                  filteredValidators.reduce((sum, v) => sum + v.rewardsPool, 0)
                )} SUI`}
                info="Available rewards pool"
                elementId="validators-total-rewards-card"
                filename="validators-total-rewards.png"
              />
            </>
          )}
        </div>
        {/* Validator Table */}
        <div
          className="border rounded-lg p-4 sm:p-6"
          id="sui-validators-table-export"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold">All Validators</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search validators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>

              <button
                className="h-10 px-4 rounded-md border border-border text-sm cursor-pointer inline-flex items-center gap-2 hover:bg-accent exclude-from-export"
                onClick={() => {
                  const el = document.getElementById(
                    "sui-validators-table-export"
                  );
                  if (el)
                    downloadElementAsPng(
                      el as HTMLElement,
                      "sui-validators-table.png"
                    );
                }}
              >
                <Download className="h-4 w-4" /> Download
              </button>
            </div>
          </div>
          {loading ? (
            <div>
              {/* Skeleton for mobile card view */}
              <div className="block sm:hidden space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="border rounded-lg p-4 space-y-3 animate-pulse bg-muted/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted" />
                      <div className="flex-1 min-w-0">
                        <div className="h-4 bg-muted rounded w-24 mb-1" />
                        <div className="h-3 bg-muted rounded w-16" />
                      </div>
                      <div className="h-3 w-8 bg-muted rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="h-3 bg-muted rounded w-16 mb-1" />
                      <div className="h-3 bg-muted rounded w-12 mb-1" />
                      <div className="h-3 bg-muted rounded w-16 mb-1" />
                      <div className="h-3 bg-muted rounded w-12 mb-1" />
                    </div>
                    <div className="h-8 bg-muted rounded w-full mt-2" />
                  </div>
                ))}
              </div>
              {/* Skeleton for desktop table view */}
              <div className="hidden sm:block overflow-x-auto">
                <div className="w-full min-w-[1200px]">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center border-b py-2 animate-pulse"
                    >
                      {[...Array(11)].map((_, j) => (
                        <div
                          key={j}
                          className="h-4 bg-muted rounded mx-2"
                          style={{ width: j === 1 ? 120 : 60 }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block sm:hidden space-y-4">
                {filteredValidators.map((validator, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {validator.imageUrl &&
                        validator.imageUrl.trim() !== "" &&
                        !imageErrors.has(validator.name) ? (
                          <Image
                            src={validator.imageUrl}
                            alt={validator.name}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={() => {
                              setImageErrors((prev) =>
                                new Set(prev).add(validator.name)
                              );
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                            {validator.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {validator.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {validator.location.city},{" "}
                          {validator.location.country}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                          #{index + 1}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-muted-foreground">Staked SUI</div>
                        <div className="font-mono">
                          {formatNumber(validator.stakingPoolSuiBalance)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Commission</div>
                        <div>{validator.commissionRate}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">
                          Rewards Pool
                        </div>
                        <div className="font-mono">
                          {formatNumber(validator.rewardsPool)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">
                          Voting Power
                        </div>
                        <div className="font-mono">{validator.votingPower}</div>
                      </div>
                    </div>

                    {validator.projectUrl &&
                      validator.projectUrl.trim() !== "" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(validator.projectUrl, "_blank")
                          }
                          className="w-full text-xs"
                        >
                          Visit Project
                        </Button>
                      )}
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <Table className="table-fixed w-full min-w-[1200px]">
                  <TableCaption>
                    Complete list of active Sui validators with real-time data
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 select-none w-48"
                        onClick={() => requestSort("name")}
                      >
                        <div className="flex items-center">
                          Validator
                          {getSortIcon("name")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 select-none w-32"
                        onClick={() => requestSort("location.city")}
                      >
                        <div className="flex items-center">
                          Location
                          {getSortIcon("location.city")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-right cursor-pointer hover:bg-muted/50 select-none w-28"
                        onClick={() => requestSort("stakingPoolSuiBalance")}
                      >
                        <div className="flex items-center justify-end">
                          Staked SUI
                          {getSortIcon("stakingPoolSuiBalance")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-right cursor-pointer hover:bg-muted/50 select-none w-28"
                        onClick={() => requestSort("rewardsPool")}
                      >
                        <div className="flex items-center justify-end">
                          Rewards Pool
                          {getSortIcon("rewardsPool")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-right cursor-pointer hover:bg-muted/50 select-none w-24"
                        onClick={() => requestSort("commissionRate")}
                      >
                        <div className="flex items-center justify-end">
                          Commission
                          {getSortIcon("commissionRate")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-right cursor-pointer hover:bg-muted/50 select-none w-28"
                        onClick={() => requestSort("performance.rewardsRate")}
                      >
                        <div className="flex items-center justify-end">
                          Rewards Rate
                          {getSortIcon("performance.rewardsRate")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-right cursor-pointer hover:bg-muted/50 select-none w-28"
                        onClick={() => requestSort("votingPower")}
                      >
                        <div className="flex items-center justify-end">
                          Voting Power
                          {getSortIcon("votingPower")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-right cursor-pointer hover:bg-muted/50 select-none w-24"
                        onClick={() => requestSort("gasPrice")}
                      >
                        <div className="flex items-center justify-end">
                          Gas Price
                          {getSortIcon("gasPrice")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-right cursor-pointer hover:bg-muted/50 select-none w-24"
                        onClick={() => requestSort("performance.utilization")}
                      >
                        <div className="flex items-center justify-end">
                          Utilization
                          {getSortIcon("performance.utilization")}
                        </div>
                      </TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredValidators.map((validator, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-sm w-12">
                          {index + 1}
                        </TableCell>
                        <TableCell className="w-48 p-2">
                          <div className="flex items-center gap-2 w-full">
                            <div className="flex-shrink-0 w-8 h-8">
                              {validator.imageUrl &&
                              validator.imageUrl.trim() !== "" &&
                              !imageErrors.has(validator.name) ? (
                                <Image
                                  src={validator.imageUrl}
                                  alt={validator.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                  onError={() => {
                                    setImageErrors((prev) =>
                                      new Set(prev).add(validator.name)
                                    );
                                  }}
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                  {validator.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <div
                                className="font-medium text-sm truncate"
                                title={validator.name}
                              >
                                {validator.name}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="w-32">
                          <div className="text-sm overflow-hidden">
                            <div
                              className="truncate"
                              title={validator.location.city}
                            >
                              {validator.location.city}
                            </div>
                            <div
                              className="text-muted-foreground truncate"
                              title={`${validator.location.region}, ${validator.location.country}`}
                            >
                              {validator.location.region},{" "}
                              {validator.location.country}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell
                          className="text-right font-mono w-28 truncate"
                          title={formatNumber(validator.stakingPoolSuiBalance)}
                        >
                          {formatNumber(validator.stakingPoolSuiBalance)}
                        </TableCell>
                        <TableCell
                          className="text-right font-mono w-28 truncate"
                          title={formatNumber(validator.rewardsPool)}
                        >
                          {formatNumber(validator.rewardsPool)}
                        </TableCell>
                        <TableCell className="text-right w-24 truncate">
                          {validator.commissionRate}%
                        </TableCell>
                        <TableCell className="text-right w-28 truncate">
                          {validator.performance.rewardsRate}%
                        </TableCell>
                        <TableCell
                          className="text-right font-mono w-28 truncate"
                          title={validator.votingPower}
                        >
                          {validator.votingPower}
                        </TableCell>
                        <TableCell
                          className="text-right font-mono w-24 truncate"
                          title={validator.gasPrice}
                        >
                          {validator.gasPrice}
                        </TableCell>
                        <TableCell className="text-right w-24 truncate">
                          {validator.performance.utilization}%
                        </TableCell>
                        <TableCell className="w-24">
                          {validator.projectUrl &&
                          validator.projectUrl.trim() !== "" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(validator.projectUrl, "_blank")
                              }
                              className="text-xs px-2"
                            >
                              Visit
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              className="opacity-50 cursor-not-allowed text-xs px-2"
                            >
                              No URL
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
