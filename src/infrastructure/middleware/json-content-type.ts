import { createMiddleware } from 'hono/factory';
import { AppError } from '../../shared/errors.js';
import type { RequestIdVars } from './request-id.js';

const JSON_BODY_METHODS = new Set(['POST', 'PUT', 'PATCH']);

/**
 * Require Content-Type: application/json (or +json / charset) on JSON body methods.
 * Empty-body POSTs without CT are still rejected for consistency.
 */
export const requireJsonContentType = createMiddleware<{
  Variables: RequestIdVars;
}>(async (c, next) => {
  if (!JSON_BODY_METHODS.has(c.req.method)) {
    await next();
    return;
  }

  const ct = (c.req.header('content-type') ?? '').toLowerCase().trim();
  const ok =
    ct.startsWith('application/json') ||
    ct.includes('+json');

  if (!ok) {
    throw AppError.badRequest(
      'Content-Type must be application/json for this endpoint',
      {
        received: ct || null,
        expected: 'application/json',
      }
    );
  }

  await next();
});
