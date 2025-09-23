import { BlobData } from "./api-types";

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function getBlobSizeDistribution(blobs: BlobData[]) {
  const small = blobs.filter((blob) => blob.size < 1024 * 1024).length; // < 1MB
  const medium = blobs.filter(
    (blob) => blob.size >= 1024 * 1024 && blob.size < 10 * 1024 * 1024
  ).length; // 1MB - 10MB
  const large = blobs.filter((blob) => blob.size >= 10 * 1024 * 1024).length; // > 10MB

  return [
    { name: "Small (< 1MB)", value: small, color: "#8884d8" },
    { name: "Medium (1-10MB)", value: medium, color: "#82ca9d" },
    { name: "Large (> 10MB)", value: large, color: "#ffc658" },
  ];
}

export function getDailyBlobCount(blobs: BlobData[]) {
  const dailyCount: { [key: string]: number } = {};

  blobs.forEach((blob) => {
    const date = new Date(blob.timestamp).toISOString().split("T")[0];
    dailyCount[date] = (dailyCount[date] || 0) + 1;
  });

  return Object.entries(dailyCount)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getBlobLifespan(blobs: BlobData[]) {
  return blobs.map((blob) => ({
    blobId: blob.blobIdBase64,
    lifespan: blob.endEpoch - blob.startEpoch,
    size: blob.size,
  }));
}

export function calculateBlobStats(blobs: BlobData[]) {
  const totalSize = blobs.reduce((sum, blob) => sum + blob.size, 0);
  const avgSize = totalSize / blobs.length;
  const certifiedCount = blobs.filter(
    (blob) => blob.status === "Certified"
  ).length;

  return {
    totalBlobs: blobs.length,
    totalSize,
    avgSize,
    certifiedCount,
    certificationRate: (certifiedCount / blobs.length) * 100,
  };
}
