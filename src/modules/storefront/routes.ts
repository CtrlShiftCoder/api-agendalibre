import { Hono } from 'hono';
import { authMockRequired, type AuthVars } from '../../infrastructure/middleware/auth-mock.js';
import { storefrontHandlers } from './handlers.js';

export const storefrontRoutes = new Hono<{ Variables: AuthVars }>();
storefrontRoutes.get('/', authMockRequired, (c) => storefrontHandlers.get(c));
storefrontRoutes.put('/', authMockRequired, (c) => storefrontHandlers.put(c));

export const publicStorefrontRoutes = new Hono<{ Variables: AuthVars }>();
publicStorefrontRoutes.get('/:slug', (c) => storefrontHandlers.public(c));
