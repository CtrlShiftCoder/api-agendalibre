import { createMiddleware } from 'hono/factory';
import { generateId } from '../../shared/ids.js';

export type RequestIdVars = { requestId: string };

export const requestIdMiddleware = createMiddleware<{
  Variables: RequestIdVars;
}>(async (c, next) => {
  const incoming = c.req.header('x-request-id');
  const requestId = incoming && incoming.length > 0 ? incoming : generateId('req');
  c.set('requestId', requestId);
  c.header('x-request-id', requestId);
  await next();
});
