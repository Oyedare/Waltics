import { NextResponse } from "next/server";

// Define the interface for the API response
interface WalrusNodeData {
  nodeUrl: string;
  nodeName: string;
  nodeStatus: string;
  walruscanUrl: string;
  geo: {
    country: string;
    region: string;
    city: string;
  };
}

interface WalrusNodeWithLocation extends WalrusNodeData {
  loc?: string; // latitude,longitude format
}

// Fallback data when external API is not available
function getFallbackNodes(): WalrusNodeData[] {
  console.log("Using fallback node data");
  return [
    {
      nodeUrl: "https://node1.walrus.com",
      nodeName: "Mysten Labs 0",
      nodeStatus: "Active",
      walruscanUrl:
        "https://walruscan.com/operator/0xf11fef95c8c5a17c2cbc51c15483e38585cf996110b8d50b8e1957442dc736fd",
      geo: {
        country: "US",
        region: "California",
        city: "San Francisco",
      },
    },
    {
      nodeUrl: "https://node2.walrus.com",
      nodeName: "Studio Mirai",
      nodeStatus: "Active",
      walruscanUrl:
        "https://walruscan.com/operator/0xb07ab3db6b190fe6e32e499e7c79499786174689ae835485c178da0e9a977180",
      geo: {
        country: "DE",
        region: "Hesse",
        city: "Frankfurt am Main",
      },
    },
    {
      nodeUrl: "https://node3.walrus.com",
      nodeName: "FP Validated",
      nodeStatus: "Active",
      walruscanUrl:
        "https://walruscan.com/operator/0x61d5598a35e198e6cafac7eb808191da3742a2a1789716ab89a68a1f934ee5c6",
      geo: {
        country: "SG",
        region: "Singapore",
        city: "Singapore",
      },
    },
    {
      nodeUrl: "https://node4.walrus.com",
      nodeName: "Nodeinfra",
      nodeStatus: "Active",
      walruscanUrl:
        "https://walruscan.com/operator/0x7c09670cbf67f4a9213177364c6b70bac7922d21affd0ea88450270c43d3587a",
      geo: {
        country: "JP",
        region: "Tokyo",
        city: "Tokyo",
      },
    },
    {
      nodeUrl: "https://node5.walrus.com",
      nodeName: "Nodes.Guru",
      nodeStatus: "Active",
      walruscanUrl:
        "https://walruscan.com/operator/0x23bd98e815ce5d18aa3f0c33c26528b235a80ab07520df1e65801346635f41f5",
      geo: {
        country: "GB",
        region: "England",
        city: "London",
      },
    },
  ];
}

async function fetchWalrusNodes(): Promise<WalrusNodeData[]> {
  try {
    console.log("Fetching from: https://walrus5-gucco4za.b4a.run/health");
    const response = await fetch("https://walrus5-gucco4za.b4a.run/health");
    console.log("External API response status:", response.status);

    if (!response.ok) {
      console.log("External API failed, using fallback data");
      // Return fallback data since the external API is not available
      return getFallbackNodes();
    }
    const data: any = await response.json();

    console.log("Raw API response:", JSON.stringify(data, null, 2));
    console.log("Response structure:", {
      hasSuccess: "success" in data,
      successValue: data.success,
      hasNodes: "nodes" in data,
      nodesType: Array.isArray(data.nodes) ? "array" : typeof data.nodes,
      nodesLength: Array.isArray(data.nodes) ? data.nodes.length : "not array",
      firstNode:
        Array.isArray(data.nodes) && data.nodes.length > 0
          ? data.nodes[0]
          : "no nodes",
    });

    // The API returns an object with a 'nodes' property containing the array
    if (!data.success || !Array.isArray(data.nodes)) {
      console.error("Invalid API response structure:", {
        success: data.success,
        nodes: data.nodes,
        hasNodes: "nodes" in data,
      });
      throw new Error("Invalid API response structure");
    }

    const mappedNodes = data.nodes.map((node: any) => {
      const mappedNode = {
        nodeUrl: node.nodeUrl || "Unknown",
        nodeName: node.nodeName || "Unknown",
        nodeStatus: node.nodeStatus || "Unknown",
        walruscanUrl: node.walruscanUrl || "",
        geo: {
          country: node.geo?.country || "Unknown",
          region: node.geo?.region || "Unknown",
          city: node.geo?.city || "Unknown",
        },
      };
      console.log("Mapped node:", mappedNode);
      return mappedNode;
    });

    console.log("Total mapped nodes:", mappedNodes.length);
    return mappedNodes;
  } catch (error) {
    console.error("Error fetching Walrus nodes:", error);
    console.log("Using fallback data due to error");
    return getFallbackNodes();
  }
}

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

export async function GET() {
  try {
    console.log("=== API ENDPOINT CALLED ===");
    const nodes = await fetchWalrusNodes();
    console.log("Fetched nodes count:", nodes.length);

    // Add location coordinates from the geo data
    const nodesWithLocation: WalrusNodeWithLocation[] = nodes.map((node) => {
      const coords = getCoordinatesForLocation(
        node.geo.country,
        node.geo.region,
        node.geo.city
      );
      const nodeWithLocation = {
        ...node,
        loc: `${coords[0]},${coords[1]}`,
      };
      console.log("Node with location:", nodeWithLocation);
      return nodeWithLocation;
    });

    console.log("Final response nodes count:", nodesWithLocation.length);
    console.log("Sample final node:", nodesWithLocation[0]);
    return NextResponse.json(nodesWithLocation);
  } catch (error) {
    console.error("Error fetching Walrus node data:", error);
    return NextResponse.json(
      { error: "Failed to fetch Walrus node data" },
      { status: 500 }
    );
  }
}
