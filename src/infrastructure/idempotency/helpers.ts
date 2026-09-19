import type { Context } from 'hono';
import { AppError } from '../../shared/errors.js';
import {
  fingerprintBody,
  idempotencyGet,
  idempotencyMapKey,
  idempotencySet,
} from './store.js';

/**
 * Read optional Idempotency-Key header. Empty / oversized → 400.
 */
export function readIdempotencyKey(c: Context): string | null {
  const raw =
    c.req.header('Idempotency-Key') ?? c.req.header('idempotency-key');
  if (raw == null) return null;
  const key = raw.trim();
  if (!key) {
    throw AppError.badRequest('Idempotency-Key header is empty');
  }
  if (key.length > 256) {
    throw AppError.badRequest('Idempotency-Key too long (max 256)');
  }
  return key;
}

export type IdempotencyReplay<T> =
  | { kind: 'miss' }
  | { kind: 'replay'; status: number; body: T }
  | { kind: 'conflict' };

/**
 * Lookup cached response for this key+body. Same body → replay;
 * different body → conflict.
 */
export function lookupIdempotency<T = unknown>(
  method: string,
  path: string,
  businessId: string,
  rawKey: string,
  body: unknown
): IdempotencyReplay<T> {
  const mapKey = idempotencyMapKey(method, path, businessId, rawKey);
  const hit = idempotencyGet(mapKey);
  if (!hit) return { kind: 'miss' };
  const fp = fingerprintBody(body);
  if (hit.bodyFingerprint !== fp) return { kind: 'conflict' };
  return { kind: 'replay', status: hit.status, body: hit.body as T };
}

export function storeIdempotency(
  method: string,
  path: string,
  businessId: string,
  rawKey: string,
  body: unknown,
  status: number,
  responseBody: unknown
): void {
  const mapKey = idempotencyMapKey(method, path, businessId, rawKey);
  idempotencySet(mapKey, {
    status,
    body: responseBody,
    bodyFingerprint: fingerprintBody(body),
  });
}
