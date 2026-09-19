import { Hono } from 'hono';
import { authMockRequired, type AuthVars } from '../../infrastructure/middleware/auth-mock.js';
import { cashHandlers } from './handlers.js';

export const cashRoutes = new Hono<{ Variables: AuthVars }>();
cashRoutes.use('*', authMockRequired);
cashRoutes.get('/day', (c) => cashHandlers.day(c));
