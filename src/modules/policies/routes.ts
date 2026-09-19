import { Hono } from 'hono';
import { authMockRequired, type AuthVars } from '../../infrastructure/middleware/auth-mock.js';
import { policiesHandlers } from './handlers.js';

export const policiesRoutes = new Hono<{ Variables: AuthVars }>();
policiesRoutes.use('*', authMockRequired);
policiesRoutes.get('/', (c) => policiesHandlers.get(c));
policiesRoutes.put('/', (c) => policiesHandlers.put(c));
