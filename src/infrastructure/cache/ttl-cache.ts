/**
 * Simple in-memory TTL cache for idempotent GETs.
 * Not shared across processes — fine for mock PoC.
 */

type Entry<T> = { value: T; expiresAt: number };

const store = new Map<string, Entry<unknown>>();

export function cacheGet<T>(key: string): T | undefined {
  const hit = store.get(key);
  if (!hit) return undefined;
  if (Date.now() > hit.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return hit.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function cacheInvalidate(prefixOrKey: string): void {
  if (store.has(prefixOrKey)) {
    store.delete(prefixOrKey);
  }
  for (const key of store.keys()) {
    if (key.startsWith(prefixOrKey)) store.delete(key);
  }
}

export function cacheClear(): void {
  store.clear();
}

/** Helpers for common domains */
export const CacheKeys = {
  services: (businessId: string) => `services:${businessId}`,
  policies: (businessId: string) => `policies:${businessId}`,
  storefront: (businessId: string) => `storefront:${businessId}`,
  publicVitrina: (slug: string) => `public:v:${slug}`,
} as const;

export const DEFAULT_TTL_MS = 30_000;
