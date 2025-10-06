import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import * as dns from "node:dns/promises";

const client = new SuiClient({
  url: getFullnodeUrl("mainnet"),
});

const IPINFO_TOKEN = "970eb9e9938742";

type IPInfoData = {
  country?: string;
  region?: string;
  city?: string;
  loc?: string; // latitude,longitude format
  ip?: string;
  hostname?: string;
  org?: string;
};

async function resolveIp(address: string): Promise<string | null> {
  const dnsMatch = address.match(/\/dns\/([^/]+)/);
  if (!dnsMatch) return null;
  const hostname = dnsMatch[1];

  try {
    const res = await dns.lookup(hostname);
    return res.address;
  } catch {
    // Logging removed
    return null;
  }
}

async function getGeoData(ip: string): Promise<IPInfoData> {
  try {
    const res = await fetch(
      `https://ipinfo.io/${ip}/json?token=${IPINFO_TOKEN}`
    );
    if (!res.ok) throw new Error(`Failed to fetch geo data for IP ${ip}`);
    const data = (await res.json()) as IPInfoData;
    return {
      country: data.country,
      region: data.region,
      city: data.city,
      loc: data.loc, // This contains "lat,lng" format
      ip: data.ip,
      hostname: data.hostname,
      org: data.org,
    };
  } catch {
    // Logging removed
    return {};
  }
}

// Removed getValidatorLocations and all logging

export async function getValidatorData() {
  const systemState = await client.getLatestSuiSystemState();
  const validators = systemState.activeValidators;

  const validatorDataWithLocation = await Promise.all(
    validators.map(async (validator) => {
      // Get location data for each validator
      const ip = await resolveIp(validator.netAddress);
      let location = {
        country: "Unknown",
        region: "Unknown",
        city: "Unknown",
        lat: 0,
        lng: 0,
      };

      if (ip) {
        const geo = await getGeoData(ip);
        let lat = 0,
          lng = 0;

        // Parse coordinates directly from IP geolocation
        if (geo.loc) {
          const [latStr, lngStr] = geo.loc.split(",");
          lat = parseFloat(latStr) || 0;
          lng = parseFloat(lngStr) || 0;

          // Add small random offset for multiple validators in same location
          lat += (Math.random() - 0.5) * 0.01;
          lng += (Math.random() - 0.5) * 0.01;
        }

        location = {
          country: geo.country || "Unknown",
          region: geo.region || "Unknown",
          city: geo.city || "Unknown",
          lat,
          lng,
        };
      }

      return {
        name: validator.name,
        projectUrl: validator.projectUrl,
        imageUrl: validator.imageUrl,
        votingPower: validator.votingPower,
        stakingPoolSuiBalance: Number(validator.stakingPoolSuiBalance) / 1e9,
        rewardsPool: Number(validator.rewardsPool) / 1e9,
        gasPrice: validator.gasPrice,
        commissionRate: parseInt(validator.commissionRate) / 100,
        poolTokenBalance: Number(validator.poolTokenBalance) / 1e9,
        pendingStake: Number(validator.pendingStake) / 1e9,
        stakingPoolActivationEpoch: validator.stakingPoolActivationEpoch,
        location,
        performance: {
          totalStaked: Number(validator.stakingPoolSuiBalance) / 1e9,
          rewardsRate: Number(
            (Number(validator.rewardsPool) * 100) /
              Number(validator.stakingPoolSuiBalance)
          ).toFixed(2),
          utilization: Number(
            (Number(validator.poolTokenBalance) * 100) /
              Number(validator.stakingPoolSuiBalance)
          ).toFixed(2),
        },
      };
    })
  );

  return validatorDataWithLocation
    .sort((a, b) => b.stakingPoolSuiBalance - a.stakingPoolSuiBalance)
    .filter((validator) => validator.stakingPoolSuiBalance > 0);
}

// IP geolocation provides accurate coordinates directly, no need for additional geocoding
