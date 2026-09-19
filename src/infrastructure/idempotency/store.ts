/**
 * In-memory Idempotency-Key store (process lifetime).
 * TTL default 24h — not shared across processes (fine for mock PoC).
 */

export type IdempotencyRecord = {
  status: number;
  body: unknown;
  bodyFingerprint: string;
  expiresAt: number;
};

const store = new Map<string, IdempotencyRecord>();

/** 24 hours */
export const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

function prune(now: number) {
  if (store.size < 500) return;
  for (const [k, v] of store) {
    if (v.expiresAt <= now) store.delete(k);
  }
}

export function fingerprintBody(body: unknown): string {
  return JSON.stringify(body);
}

export function idempotencyGet(mapKey: string): IdempotencyRecord | undefined {
  const hit = store.get(mapKey);
  if (!hit) return undefined;
  if (Date.now() > hit.expiresAt) {
    store.delete(mapKey);
    return undefined;
  }
  return hit;
}

export function idempotencySet(
  mapKey: string,
  record: Omit<IdempotencyRecord, 'expiresAt'>,
  ttlMs: number = IDEMPOTENCY_TTL_MS
): void {
  const now = Date.now();
  prune(now);
  store.set(mapKey, { ...record, expiresAt: now + ttlMs });
}

export function idempotencyClear(): void {
  store.clear();
}

/** Build scoped map key: METHOD:path:businessId:rawKey */
export function idempotencyMapKey(
  method: string,
  path: string,
  businessId: string,
  rawKey: string
): string {
  return `${method.toUpperCase()}:${path}:${businessId}:${rawKey}`;
}
