"use client";

import { useEffect, useRef, useState } from "react";
import { StatCard } from "@/components/stat-card";
import { DownloadButton } from "@/components/ui/download-button";
// import "./map.css";

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

export default function SuiNetworkMapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const [validators, setValidators] = useState<ValidatorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const loadValidators = async () => {
      try {
        const response = await fetch("/api/sui-validators");
        if (!response.ok) {
          throw new Error("Failed to fetch validators");
        }
        const data = await response.json();
        setValidators(data);
      } catch (error) {
        console.error("Failed to load validator data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadValidators();
  }, []);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || mapLoaded) return;

      try {
        const L = (await import("leaflet")).default;

        // Initialize map
        const map = L.map(mapRef.current, {
          zoomControl: true,
          attributionControl: false,
        }).setView([20, 0], 2);

        mapInstanceRef.current = map;

        // Dynamic tile layer based on theme
        const updateTileLayer = () => {
          const isDark = document.documentElement.classList.contains("dark");
          const tileUrl = isDark
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

          if (tileLayerRef.current) {
            map.removeLayer(tileLayerRef.current);
          }

          tileLayerRef.current = L.tileLayer(tileUrl, {
            attribution: "© OpenStreetMap contributors © CARTO",
            maxZoom: 18,
          }).addTo(map);
        };

        updateTileLayer();

        // Enhanced custom marker icon with better visibility
        const customIcon = L.divIcon({
          className: "custom-marker",
          html: '<div style="background: #4da2ff; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 15px rgba(77, 162, 255, 0.8), 0 0 30px rgba(77, 162, 255, 0.4);"></div>',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        // Add validator markers
        validators.forEach((validator) => {
          if (validator.location.lat !== 0 && validator.location.lng !== 0) {
            const marker = L.marker(
              [validator.location.lat, validator.location.lng],
              { icon: customIcon }
            )
              .addTo(map)
              .bindPopup(
                `
                <div class="validator-popup">
                  <div class="validator-popup-title">${validator.name}</div>
                  <div class="validator-popup-content">
                    <div class="validator-popup-item">
                      <strong>📍 Location:</strong> ${
                        validator.location.city
                      }, ${validator.location.region}, ${
                  validator.location.country
                }
                    </div>
                    <div class="validator-popup-item">
                      <strong>💰 Stake:</strong> ${formatNumber(
                        validator.stakingPoolSuiBalance
                      )} SUI
                    </div>
                    <div class="validator-popup-item">
                      <strong>💼 Commission:</strong> ${
                        validator.commissionRate
                      }%
                    </div>
                    ${
                      validator.projectUrl
                        ? `
                      <div class="validator-popup-item">
                        <strong>🔗 URL:</strong> 
                        <a href="${
                          validator.projectUrl
                        }" target="_blank" class="validator-popup-link">
                          ${validator.projectUrl.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    `
                        : ""
                    }
                  </div>
                </div>
              `,
                {
                  className: "custom-popup",
                }
              );
          }
        });

        setMapLoaded(true);
      } catch (error) {
        console.error("Failed to initialize map:", error);
      }
    };

    if (validators.length > 0) {
      initMap();
    }
  }, [validators, mapLoaded]);

  // Theme change detection
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    const updateMapTheme = () => {
      const L = require("leaflet");
      const isDark = document.documentElement.classList.contains("dark");
      const tileUrl = isDark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }

      tileLayerRef.current = L.tileLayer(tileUrl, {
        attribution: "© OpenStreetMap contributors © CARTO",
        maxZoom: 18,
      }).addTo(mapInstanceRef.current);
    };

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          updateMapTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [mapLoaded]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const getCountryStats = () => {
    const countryCounts = validators.reduce((acc, validator) => {
      const country = validator.location.country || "Unknown";
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(countryCounts).sort(([, a], [, b]) => b - a);
  };

  const getCityStats = () => {
    const cityCounts = validators.reduce((acc, validator) => {
      const city = validator.location.city || "Unknown";
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(cityCounts).sort(([, a], [, b]) => b - a);
  };

  const getCountryFlag = (countryCode: string) => {
    const flags: Record<string, string> = {
      US: "🇺🇸",
      DE: "🇩🇪",
      FI: "🇫🇮",
      NL: "🇳🇱",
      LT: "🇱🇹",
      SG: "🇸🇬",
      JP: "🇯🇵",
      GB: "🇬🇧",
      CA: "🇨🇦",
      AU: "🇦🇺",
      FR: "🇫🇷",
      IE: "🇮🇪",
      PL: "🇵🇱",
      Unknown: "🌍",
    };
    return flags[countryCode] || "🌍";
  };

  const getCountryName = (countryCode: string) => {
    const names: Record<string, string> = {
      US: "United States",
      DE: "Germany",
      FI: "Finland",
      NL: "Netherlands",
      LT: "Lithuania",
      SG: "Singapore",
      JP: "Japan",
      GB: "United Kingdom",
      CA: "Canada",
      AU: "Australia",
      FR: "France",
      IE: "Ireland",
      PL: "Poland",
      Unknown: "Unknown",
    };
    return names[countryCode] || countryCode;
  };

  const getCountryToContinent = (countryCode: string) => {
    const continentMap: Record<string, string> = {
      US: "North America",
      CA: "North America",
      DE: "Europe",
      FI: "Europe",
      NL: "Europe",
      LT: "Europe",
      GB: "Europe",
      FR: "Europe",
      IE: "Europe",
      PL: "Europe",
      SG: "Asia",
      JP: "Asia",
      AU: "Oceania",
      Unknown: "Unknown",
    };
    return continentMap[countryCode] || "Unknown";
  };

  const getContinentStats = () => {
    const continentCounts = validators.reduce((acc, validator) => {
      const country = validator.location.country || "Unknown";
      const continent = getCountryToContinent(country);
      acc[continent] = (acc[continent] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(continentCounts).sort(([, a], [, b]) => b - a);
  };

  const getNetworkStats = () => {
    const totalValidators = validators.length;
    const uniqueCountries = new Set(
      validators.map((v) => v.location.country || "Unknown")
    ).size;
    const uniqueCities = new Set(
      validators.map((v) => v.location.city || "Unknown")
    ).size;
    const uniqueContinents = new Set(
      validators.map((v) =>
        getCountryToContinent(v.location.country || "Unknown")
      )
    ).size;

    return {
      totalValidators,
      countries: uniqueCountries,
      cities: uniqueCities,
      continents: uniqueContinents,
    };
  };

  const countryData = getCountryStats();
  const cityData = getCityStats();
  const continentData = getContinentStats();
  const networkStats = getNetworkStats();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Sui Network Map</h1>
          <p className="text-muted-foreground">
            Interactive map showing the global distribution of Sui validators
          </p>
        </div>
        {/* Network Overview Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {[...Array(5)].map((_, i) => (
            <StatCard
              key={i}
              title="..."
              value={
                <span className="inline-block w-16 h-6 bg-muted animate-pulse rounded" />
              }
              info=""
            />
          ))}
        </div>
        {/* Map Skeleton */}
        <div className="mb-8">
          <div className="border rounded-lg overflow-hidden">
            <div className="w-full h-[500px] flex items-center justify-center bg-muted animate-pulse">
              <span className="text-muted-foreground">Loading map...</span>
            </div>
          </div>
        </div>
        {/* Country/City Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">All Countries</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between animate-pulse"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-6 h-6 bg-muted rounded-full" />
                    <span className="h-4 w-24 bg-muted rounded block" />
                  </div>
                  <span className="h-4 w-12 bg-muted rounded block" />
                </div>
              ))}
            </div>
          </div>
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">All Cities</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between animate-pulse"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-6 h-6 bg-muted rounded-full" />
                    <span className="h-4 w-24 bg-muted rounded block" />
                  </div>
                  <span className="h-4 w-12 bg-muted rounded block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sui Network Map</h1>
        <p className="text-muted-foreground">
          Interactive map showing the global distribution of Sui validators
        </p>
      </div>

      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Total Validators"
          value={networkStats.totalValidators.toString()}
          info="Total number of active validators securing the Sui network"
          elementId="network-map-total-validators-card"
          filename="network-map-total-validators.png"
        />
        <StatCard
          title="Countries"
          value={networkStats.countries.toString()}
          info="Number of unique countries hosting Sui validators"
          elementId="network-map-countries-card"
          filename="network-map-countries.png"
        />
        <StatCard
          title="Cities"
          value={networkStats.cities.toString()}
          info="Number of unique cities with validator nodes"
          elementId="network-map-cities-card"
          filename="network-map-cities.png"
        />
        <StatCard
          title="Continents"
          value={networkStats.continents.toString()}
          info="Number of continents with validator presence"
          elementId="network-map-continents-card"
          filename="network-map-continents.png"
        />
        <StatCard
          title="Total Stake"
          value={`${formatNumber(
            validators.reduce((sum, v) => sum + v.stakingPoolSuiBalance, 0)
          )} SUI`}
          info="Total amount of SUI tokens staked across all validators"
          elementId="network-map-total-stake-card"
          filename="network-map-total-stake.png"
        />
      </div>

      {/* Interactive Map */}
      <div className="mb-8">
        <div
          id="sui-network-map-card"
          className="border rounded-lg overflow-hidden relative"
        >
          <div className="absolute top-2 right-2 z-10">
            <DownloadButton
              elementId="sui-network-map-card"
              filename="sui-network-map.png"
              size="sm"
              showText={false}
            />
          </div>
          <div ref={mapRef} className="w-full h-[500px]">
            {!mapLoaded && (
              <div className="flex items-center justify-center h-full bg-muted">
                <p className="text-muted-foreground">Loading map...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Geographic Distribution and All Hubs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div
          id="sui-network-all-countries-card"
          className="border rounded-lg p-6 relative"
        >
          <div className="absolute top-2 right-2 z-10">
            <DownloadButton
              elementId="sui-network-all-countries-card"
              filename="sui-network-all-countries.png"
              size="sm"
              showText={false}
            />
          </div>
          <h2 className="text-xl font-semibold mb-4">All Countries</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {countryData.map(([country, count]) => (
              <div key={country} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCountryFlag(country)}</span>
                  <span>{getCountryName(country)}</span>
                </div>
                <span className="font-medium">
                  {count} validator{count > 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          id="sui-network-all-cities-card"
          className="border rounded-lg p-6 relative"
        >
          <div className="absolute top-2 right-2 z-10">
            <DownloadButton
              elementId="sui-network-all-cities-card"
              filename="sui-network-all-cities.png"
              size="sm"
              showText={false}
            />
          </div>
          <h2 className="text-xl font-semibold mb-4">All Cities</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {cityData.map(([city, count]) => (
              <div key={city} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏙️</span>
                  <span>{city}</span>
                </div>
                <span className="font-medium">
                  {count} validator{count > 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
