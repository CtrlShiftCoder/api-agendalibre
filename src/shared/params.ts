import { AppError } from './errors.js';

/** Require a route param (Hono types it as string | undefined). */
export function requireParam(
  value: string | undefined,
  name = 'id'
): string {
  if (!value) throw AppError.badRequest(`Missing path param :${name}`);
  return value;
}
