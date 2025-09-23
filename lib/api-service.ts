import {
  BlobsResponse,
  BlobsQueryParams,
  WidgetTotalBlobsResponse,
  WidgetAvgBlobSizeResponse,
  WidgetTotalAccountsResponse,
  BlobDetailResponse,
  AccountsResponse,
  ValidatorsResponse,
  AccountDetailResponse,
} from "./api-types";

const API_BASE_URL = "https://api.blockberry.one/walrus-mainnet/v1";
const API_KEY = process.env.NEXT_PUBLIC_WALRUS_API_KEY;

if (!API_KEY) {
  throw new Error("NEXT_PUBLIC_WALRUS_API_KEY is not defined");
}

const defaultHeaders = {
  accept: "*/*",
  "x-api-key": API_KEY,
};

export const walrusApi = {
  async getBlobs(params: BlobsQueryParams = {}): Promise<BlobsResponse> {
    const {
      page = 0,
      size = 20,
      orderBy = "DESC",
      sortBy = "TIMESTAMP",
    } = params;

    const searchParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      orderBy,
      sortBy,
    });

    const response = await fetch(`${API_BASE_URL}/blobs?${searchParams}`, {
      method: "GET",
      headers: defaultHeaders,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch blobs: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  },
  async getTotalBlobs(
    period: "24H" | "7D" | "30D" = "24H",
    size: "SMALL" | "MEDIUM" | "LARGE" = "SMALL",
    widgetPage: "HOME" | "ANALYTICS" = "HOME"
  ): Promise<WidgetTotalBlobsResponse> {
    const searchParams = new URLSearchParams({ period, size, widgetPage });
    const response = await fetch(
      `${API_BASE_URL}/widgets/total-blobs?${searchParams.toString()}`,
      {
        method: "GET",
        headers: defaultHeaders,
      }
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch total blobs: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  },
  async getAvgBlobSize(
    period: "24H" | "7D" | "30D" = "24H",
    size: "SMALL" | "LARGE" = "SMALL",
    widgetPage: "HOME" | "ANALYTICS" = "HOME"
  ): Promise<WidgetAvgBlobSizeResponse> {
    const searchParams = new URLSearchParams({ period, size, widgetPage });
    const response = await fetch(
      `${API_BASE_URL}/widgets/avg-blob-size?${searchParams.toString()}`,
      {
        method: "GET",
        headers: defaultHeaders,
      }
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch avg blob size: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  },
  async getTotalAccounts(
    period: "24H" | "7D" | "30D" = "24H",
    size: "SMALL" | "LARGE" = "SMALL",
    widgetPage: "HOME" | "ANALYTICS" = "HOME"
  ): Promise<WidgetTotalAccountsResponse> {
    const searchParams = new URLSearchParams({ period, size, widgetPage });
    const response = await fetch(
      `${API_BASE_URL}/widgets/total-accounts?${searchParams.toString()}`,
      {
        method: "GET",
        headers: defaultHeaders,
      }
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch total accounts: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  },
  async getBlobById(id: string): Promise<BlobDetailResponse> {
    const response = await fetch(`${API_BASE_URL}/blobs/${id}`, {
      method: "GET",
      headers: defaultHeaders,
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch blob by id: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  },
  async getAccountBlobs(
    address: string,
    params: BlobsQueryParams = {}
  ): Promise<BlobsResponse> {
    const {
      page = 0,
      size = 20,
      orderBy = "DESC",
      sortBy = "TIMESTAMP",
    } = params;

    const searchParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      orderBy,
      sortBy,
    });

    const response = await fetch(
      `${API_BASE_URL}/blobs/accounts/${address}?${searchParams}`,
      {
        method: "GET",
        headers: defaultHeaders,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch account blobs: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  },
  async getAccounts(
    page: number = 0,
    size: number = 20
  ): Promise<AccountsResponse> {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    const response = await fetch(`${API_BASE_URL}/accounts?${searchParams}`, {
      method: "GET",
      headers: defaultHeaders,
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch accounts: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  },
  async getValidators(
    page: number = 0,
    size: number = 20
  ): Promise<ValidatorsResponse> {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    const response = await fetch(`${API_BASE_URL}/validators?${searchParams}`, {
      method: "GET",
      headers: defaultHeaders,
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch validators: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  },
  async getAccountByHash(address: string): Promise<AccountDetailResponse> {
    const response = await fetch(`${API_BASE_URL}/accounts/${address}`, {
      method: "GET",
      headers: defaultHeaders,
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch account details: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  },
};
