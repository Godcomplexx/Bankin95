/** Base URL of the Bankin95 server. Set EXPO_PUBLIC_API_URL in .env.local (see README). */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init?: { method?: 'GET' | 'POST'; body?: unknown; timeoutMs?: number }): Promise<T> {
  if (!API_URL) throw new ApiError('EXPO_PUBLIC_API_URL is not set', 0);
  const res = await fetch(`${API_URL}${path}`, {
    method: init?.method ?? 'GET',
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
    body: init?.body ? JSON.stringify(init.body) : undefined,
    signal: AbortSignal.timeout(init?.timeoutMs ?? 20000),
  });
  if (!res.ok) throw new ApiError(`HTTP ${res.status}`, res.status);
  return (await res.json()) as T;
}
