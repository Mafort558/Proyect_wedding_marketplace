import { getApiBaseUrl } from "@/lib/config";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
  }
}

interface ApiRequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
  searchParams?: Record<string, string | undefined>;
}

export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const url = buildUrl(path, options.searchParams);
  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: buildHeaders(options),
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (!response.ok) {
    throw new ApiError(response.status, await extractDetail(response));
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}

function buildUrl(path: string, searchParams?: Record<string, string | undefined>): string {
  const url = new URL(`${getApiBaseUrl()}${path}`);
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

function buildHeaders(options: ApiRequestOptions): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.token !== undefined) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  return headers;
}

async function extractDetail(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body.detail === "string") {
      return body.detail;
    }
    return JSON.stringify(body.detail ?? body);
  } catch {
    return response.statusText;
  }
}
