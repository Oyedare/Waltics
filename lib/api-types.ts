export interface BlobData {
  blobId: string;
  blobIdBase64: string;
  objectId: string;
  status: string;
  startEpoch: number;
  endEpoch: number;
  size: number;
  timestamp: number;
}

export interface BlobDetailResponse {
  blobId: string;
  blobIdBase64: string;
  senderAddress: string | null;
  senderName: string | null;
  senderImg: string | null;
  suiObjectId: string;
  startEpoch: number;
  endEpoch: number;
  size: number;
  suiPackageId: string;
}

export interface BlobsResponse {
  content: BlobData[];
  pageable: {
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface BlobsQueryParams {
  page?: number;
  size?: number;
  orderBy?: "ASC" | "DESC";
  sortBy?: "TIMESTAMP" | "SIZE" | "HASH";
}

export interface AccountSummary {
  address: string;
  name?: string | null;
  createdAt?: number | null;
  lastActiveAt?: number | null;
}

export interface AccountsResponse {
  content: AccountSummary[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ValidatorSummary {
  address: string;
  name?: string | null;
  commission?: number | null;
  votingPower?: number | null;
  status?: string | null;
}

export interface ValidatorsResponse {
  content: ValidatorSummary[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface AccountDetailResponse {
  address: string;
  firstSeen: number;
  lastSeen: number;
  events: number;
  blobs: number;
  balance: number;
}

export interface WidgetTotalBlobsResponse {
  value: number;
  changeValue: number | null;
  changePercent: number | null;
  additionalValue: number | null;
  maxRate: number | null;
  changeRate: number | null;
  changePeriod: string | null; // e.g. "24H"
  noChanges: boolean;
  chart: { value: number; timestamp: number }[];
}

export interface WidgetAvgBlobSizeResponse {
  value: number;
  changeValue: number | null;
  changePercent: number | null;
  additionalValue: number | null;
  maxRate: number | null;
  changeRate: number | null;
  changePeriod: string | null;
  noChanges: boolean;
  chart: { value: number; timestamp: number }[];
}

export interface WidgetTotalAccountsResponse {
  value: number;
  changeValue: number | null;
  changePercent: number | null;
  additionalValue: number | null;
  maxRate: number | null;
  changeRate: number | null;
  changePeriod: string | null;
  noChanges: boolean;
  chart: { value: number; timestamp: number }[];
}
