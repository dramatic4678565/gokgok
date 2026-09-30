/**
 * The one place the dashboard talks to a server.
 *
 * Every request goes through `apiFetch`, so pointing the app at a real backend
 * is a one-line change: set `NEXT_PUBLIC_API_BASE_URL` to its origin. The mock
 * route handlers under `src/app/api/**` implement the same contract, so with
 * the variable unset the app is fully functional offline.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function apiUrl(path: string, params?: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return `${API_BASE_URL}${path}${query ? `?${query}` : ""}`;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, signal } = options;

  const response = await fetch(API_BASE_URL + path, {
    method,
    signal,
    // Session cookie is required by the protected API routes.
    credentials: "include",
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (payload as { error?: string } | null)?.error ??
      `Request failed with ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

/** Turns any thrown value into something worth putting in a toast. */
export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message;
  }
  return fallback;
}
