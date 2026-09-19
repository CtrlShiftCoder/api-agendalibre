import { createMiddleware } from 'hono/factory';
import { API_VERSION } from '../../config/version.js';

/** Sets `X-API-Version` on every response. */
export const apiVersionMiddleware = createMiddleware(async (c, next) => {
  c.header('X-API-Version', API_VERSION);
  await next();
});
