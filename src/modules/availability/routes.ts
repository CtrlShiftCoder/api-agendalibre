import { Hono } from 'hono';
import { authMockOptional, type AuthVars } from '../../infrastructure/middleware/auth-mock.js';
import { availabilityHandlers } from './handlers.js';

export const availabilityRoutes = new Hono<{ Variables: AuthVars }>();
availabilityRoutes.get('/', authMockOptional, (c) => availabilityHandlers.list(c));
