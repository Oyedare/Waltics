"use client";

import { memo, useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { RefreshCw, MapPin, Globe, Users, Building } from "lucide-react";
import { DownloadButton } from "@/components/ui/download-button";

// Walrus node interface matching the API
interface WalrusNode {
  nodeUrl: string;
  nodeName: string;
  nodeStatus: string;
  walruscanUrl: string;
  geo: {
    country: string;
    region: string;
    city: string;
  };
  loc?: string; // latitude,longitude format
}

const NetworkMapPage = memo(function NetworkMapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const [nodes, setNodes] = useState<WalrusNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { theme } = useTheme();

  // Country to coordinates mapping
  const getCoordinatesForLocation = (
    country: string,
    region: string,
    city: string
  ): [number, number] => {
    const locationMap: Record<string, [number, number]> = {
      // Major cities with precise coordinates
      US: [39.8283, -98.5795],
      DE: [51.1657, 10.4515],
      SG: [1.3521, 103.8198],
      JP: [35.6762, 139.6503],
      GB: [51.5074, -0.1278],
      AU: [-33.8688, 151.2093],
      CA: [43.6532, -79.3832],
      FR: [48.8566, 2.3522],
      NL: [52.3676, 4.9041],
      KR: [37.5665, 126.978],
      IT: [41.9028, 12.4964],
      ES: [40.4637, -3.7492],
      BR: [-23.5505, -46.6333],
      IN: [19.076, 72.8777],
      CN: [39.9042, 116.4074],
      RU: [55.7558, 37.6176],
      CH: [47.3769, 8.5417],
      NO: [59.9139, 10.7522],
      PL: [52.2297, 21.0122],
      RO: [44.4268, 26.1025],
      TH: [13.7563, 100.5018],
      FI: [60.1699, 24.9384],
      AT: [48.2082, 16.3738],
      LV: [56.9496, 24.1052],
      IE: [53.3498, -6.2603],
      LT: [55.9349, 23.3144],
    };

    // Try city-specific coordinates first
    const cityKey = `${city},${region}`;
    if (locationMap[cityKey]) {
      return locationMap[cityKey];
    }

    // Fall back to country coordinates
    return locationMap[country] || [0, 0];
  };

  // Load nodes from API
  const loadNodes = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("=== FRONTEND: Loading nodes from API ===");
      const response = await fetch("/api/walrus-nodes");
      console.log("API response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to fetch nodes");
      }
      const data: WalrusNode[] = await response.json();
      console.log("Frontend received data:", data);
      console.log("Data length:", data.length);
      console.log("Sample node:", data[0]);

      // Add coordinates to nodes
      const nodesWithCoords = data.map((node) => {
        const coords = getCoordinatesForLocation(
          node.geo.country,
          node.geo.region,
          node.geo.city
        );
        const nodeWithCoords = {
          ...node,
          loc: `${coords[0]},${coords[1]}`,
        };
        console.log("Node with coordinates:", nodeWithCoords);
        return nodeWithCoords;
      });

      console.log("Final nodes set:", nodesWithCoords);
      setNodes(nodesWithCoords);
    } catch (error) {
      console.error("Failed to load nodes:", error);
      console.log("Falling back to mock data");
      // Fallback to mock data if API fails
      setNodes(generateMockNodes());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mock data fallback
  const generateMockNodes = (): WalrusNode[] => [
    {
      nodeUrl: "https://node1.walrus.com",
      nodeName: "Mysten Labs 0",
      nodeStatus: "Active",
      walruscanUrl:
        "https://walruscan.com/operator/0xf11fef95c8c5a17c2cbc51c15483e38585cf996110b8d50b8e1957442dc736fd",
      geo: { country: "US", region: "California", city: "San Francisco" },
      loc: "37.7749,-122.4194",
    },
    {
      nodeUrl: "https://node2.walrus.com",
      nodeName: "Studio Mirai",
      nodeStatus: "Active",
      walruscanUrl:
        "https://walruscan.com/operator/0xb07ab3db6b190fe6e32e499e7c79499786174689ae835485c178da0e9a977180",
      geo: { country: "DE", region: "Hesse", city: "Frankfurt am Main" },
      loc: "50.1109,8.6821",
    },
    {
      nodeUrl: "https://node3.walrus.com",
      nodeName: "FP Validated",
      nodeStatus: "Active",
      walruscanUrl:
        "https://walruscan.com/operator/0x61d5598a35e198e6cafac7eb808191da3742a2a1789716ab89a68a1f934ee5c6",
      geo: { country: "SG", region: "Singapore", city: "Singapore" },
      loc: "1.3521,103.8198",
    },
  ];

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || mapLoaded || nodes.length === 0) return;

      try {
        const L = (await import("leaflet")).default;

        // Fix for default markers in Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        const map = L.map(mapRef.current, {
          zoomControl: true,
          attributionControl: false,
        }).setView([20, 0], 2);

        mapInstanceRef.current = map;

        // Update tile layer based on theme
        const updateTileLayer = () => {
          const isDark = theme === "dark";
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

        // Custom marker icon
        const customIcon = L.divIcon({
          className: "custom-marker",
          html: '<div style="background: #96f0e5; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 15px rgba(150, 240, 229, 0.8), 0 0 30px rgba(150, 240, 229, 0.4);"></div>',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        // Add node markers
        nodes.forEach((node) => {
          if (node.loc && node.loc !== "0,0") {
            const [lat, lng] = node.loc.split(",").map(Number);
            if (lat !== 0 && lng !== 0) {
              L.marker([lat, lng], { icon: customIcon }).addTo(map).bindPopup(`
                  <div style="padding: 8px; min-width: 200px;">
                    <div style="font-weight: 600; margin-bottom: 8px; color: #1f2937;">${
                      node.nodeName
                    }</div>
                    <div style="margin-bottom: 4px;">
                      <strong>📍 Location:</strong> ${node.geo.city}, ${
                node.geo.region
              }, ${node.geo.country}
                    </div>
                    <div style="margin-bottom: 4px;">
                      <strong>🌐 Node URL:</strong> ${node.nodeUrl}
                    </div>
                    <div style="margin-bottom: 4px;">
                      <strong>📊 Status:</strong> 
                      <span style="color: ${
                        node.nodeStatus === "Active" ? "#10b981" : "#ef4444"
                      }">${node.nodeStatus}</span>
                    </div>
                    ${
                      node.walruscanUrl
                        ? `
                      <div style="margin-bottom: 4px;">
                        <strong>🔗 Walruscan:</strong> 
                        <a href="${node.walruscanUrl}" target="_blank" style="color: #3b82f6; text-decoration: none;">View on Walruscan</a>
                      </div>
                    `
                        : ""
                    }
                  </div>
                `);
            }
          }
        });

        setMapLoaded(true);
      } catch (error) {
        console.error("Failed to initialize map:", error);
      }
    };

    if (nodes.length > 0) {
      initMap();
    }
  }, [nodes, mapLoaded, theme]);

  // Load nodes on mount
  useEffect(() => {
    loadNodes();
  }, [loadNodes]);

  // Get network statistics
  const getNetworkStats = () => {
    const totalNodes = nodes.length;
    const uniqueCountries = new Set(nodes.map((n) => n.geo.country)).size;
    const uniqueCities = new Set(nodes.map((n) => n.geo.city)).size;
    const uniqueContinents = new Set(
      nodes.map((n) => {
        const country = n.geo.country;
        const continentMap: Record<string, string> = {
          US: "North America",
          CA: "North America",
          DE: "Europe",
          GB: "Europe",
          FR: "Europe",
          NL: "Europe",
          IT: "Europe",
          ES: "Europe",
          AT: "Europe",
          IE: "Europe",
          PL: "Europe",
          RO: "Europe",
          FI: "Europe",
          LV: "Europe",
          LT: "Europe",
          NO: "Europe",
          CH: "Europe",
          SG: "Asia",
          JP: "Asia",
          KR: "Asia",
          CN: "Asia",
          IN: "Asia",
          TH: "Asia",
          AU: "Oceania",
          BR: "South America",
          RU: "Europe",
        };
        return continentMap[country] || "Unknown";
      })
    ).size;
    const activeNodes = nodes.filter((n) => n.nodeStatus === "Active").length;

    return {
      totalNodes,
      countries: uniqueCountries,
      cities: uniqueCities,
      continents: uniqueContinents,
      activeNodes,
      inactiveNodes: totalNodes - activeNodes,
    };
  };

  const networkStats = getNetworkStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Network Map
            </h1>
            <p className="text-sm text-muted-foreground">
              Loading Walrus node data...
            </p>
          </div>
        </div>
        <div className="w-full h-[600px] flex items-center justify-center bg-muted animate-pulse rounded-lg">
          <span className="text-muted-foreground">Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Network Map
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Interactive map showing the global distribution of Walrus storage
            nodes
          </p>
        </div>
        <Button
          onClick={loadNodes}
          disabled={isLoading}
          variant="outline"
          className="h-9 sm:h-10"
        >
          <RefreshCw
            className={`h-3 w-3 sm:h-4 sm:w-4 mr-2 ${
              isLoading ? "animate-spin" : ""
            }`}
          />
          <span className="text-xs sm:text-sm">Refresh</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card id="total-nodes-network-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Total Nodes</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </div>
            <DownloadButton
              elementId="total-nodes-network-card"
              filename="total-nodes-network.png"
              size="sm"
              showText={false}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats.totalNodes}</div>
            <p className="text-xs text-muted-foreground">
              Storage providers in network
            </p>
          </CardContent>
        </Card>

        <Card id="active-nodes-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                Active Nodes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <DownloadButton
              elementId="active-nodes-card"
              filename="active-nodes.png"
              size="sm"
              showText={false}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats.activeNodes}</div>
            <p className="text-xs text-muted-foreground">
              {networkStats.totalNodes > 0
                ? Math.round(
                    (networkStats.activeNodes / networkStats.totalNodes) * 100
                  )
                : 0}
              % uptime
            </p>
          </CardContent>
        </Card>

        <Card id="countries-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Countries</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
            <DownloadButton
              elementId="countries-card"
              filename="countries.png"
              size="sm"
              showText={false}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats.countries}</div>
            <p className="text-xs text-muted-foreground">
              Geographic distribution
            </p>
          </CardContent>
        </Card>

        <Card id="cities-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Cities</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </div>
            <DownloadButton
              elementId="cities-card"
              filename="cities.png"
              size="sm"
              showText={false}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats.cities}</div>
            <p className="text-xs text-muted-foreground">
              Urban node locations
            </p>
          </CardContent>
        </Card>

        <Card id="continents-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Continents</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </div>
            <DownloadButton
              elementId="continents-card"
              filename="continents.png"
              size="sm"
              showText={false}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats.continents}</div>
            <p className="text-xs text-muted-foreground">Global coverage</p>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <Card id="network-map-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Walrus Network Map</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Inactive</span>
                </div>
              </div>
            </div>
            <DownloadButton
              elementId="network-map-card"
              filename="network-map.png"
              size="sm"
              showText={false}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div
            ref={mapRef}
            className="h-[400px] sm:h-[500px] lg:h-[600px] w-full rounded-lg"
            style={{ minHeight: "400px" }}
          />
        </CardContent>
      </Card>

      {/* Node Details Table */}
      <Card id="node-details-table">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg">Node Details</CardTitle>
            <DownloadButton
              elementId="node-details-table"
              filename="node-details.png"
              size="sm"
              showText={false}
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-3 text-xs sm:text-sm">
                    Node
                  </th>
                  <th className="text-left py-2 pr-3 text-xs sm:text-sm">
                    Status
                  </th>
                  <th className="text-left py-2 pr-3 text-xs sm:text-sm">
                    Location
                  </th>
                  <th className="text-left py-2 pr-3 text-xs sm:text-sm">
                    Coordinates
                  </th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((node, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 pr-3">
                      <div className="font-medium text-sm">{node.nodeName}</div>
                      <div className="text-xs text-muted-foreground break-all">
                        {node.nodeUrl}
                      </div>
                    </td>
                    <td className="py-2 pr-3">
                      <Badge
                        variant={
                          node.nodeStatus === "Active" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {node.nodeStatus}
                      </Badge>
                    </td>
                    <td className="py-2 pr-3 text-sm">
                      {node.geo.city}, {node.geo.country}
                    </td>
                    <td className="py-2 pr-3 text-xs text-muted-foreground">
                      {node.loc || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-3">
            {nodes.map((node, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Node</div>
                  <div className="font-medium text-sm">{node.nodeName}</div>
                  <div className="text-xs text-muted-foreground break-all">
                    {node.nodeUrl}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Status</div>
                    <Badge
                      variant={
                        node.nodeStatus === "Active" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {node.nodeStatus}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Coordinates
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {node.loc || "N/A"}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Location</div>
                  <div className="text-sm">
                    {node.geo.city}, {node.geo.country}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export { NetworkMapPage };
