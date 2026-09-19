import { createMiddleware } from 'hono/factory';
import { AppError } from '../../shared/errors.js';
import type { RequestIdVars } from './request-id.js';

/** Sliding window entry */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Generous defaults for a mock PoC API */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 180;

function clientIp(c: {
  req: { header: (name: string) => string | undefined };
}): string {
  const xf = c.req.header('x-forwarded-for');
  if (xf) return xf.split(',')[0]!.trim() || 'unknown';
  return c.req.header('x-real-ip') ?? 'local';
}

function pruneIfNeeded(now: number) {
  if (buckets.size < 2_000) return;
  for (const [k, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(k);
  }
}

/**
 * In-memory rate limit: per IP + path, generous window.
 * Returns 429 AppError envelope on exceed.
 */
export const rateLimitMiddleware = createMiddleware<{
  Variables: RequestIdVars;
}>(async (c, next) => {
  // Skip CORS preflight
  if (c.req.method === 'OPTIONS') {
    await next();
    return;
  }

  const now = Date.now();
  pruneIfNeeded(now);

  const key = `${clientIp(c)}|${c.req.method}|${c.req.path}`;
  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + WINDOW_MS };
    buckets.set(key, bucket);
  }

  bucket.count += 1;
  const remaining = Math.max(0, MAX_PER_WINDOW - bucket.count);
  c.header('X-RateLimit-Limit', String(MAX_PER_WINDOW));
  c.header('X-RateLimit-Remaining', String(remaining));
  c.header('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

  if (bucket.count > MAX_PER_WINDOW) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    c.header('Retry-After', String(retryAfter));
    throw AppError.tooManyRequests(
      `Too many requests for ${c.req.method} ${c.req.path}. Try again in ${retryAfter}s.`,
      { limit: MAX_PER_WINDOW, windowMs: WINDOW_MS, retryAfter }
    );
  }

  await next();
});

/** Test helper — clear buckets between suites if needed */
export function resetRateLimitBuckets() {
  buckets.clear();
}
