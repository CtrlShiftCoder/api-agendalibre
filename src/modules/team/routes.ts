import { Hono } from 'hono';
import { authMockRequired, type AuthVars } from '../../infrastructure/middleware/auth-mock.js';
import { teamHandlers } from './handlers.js';

export const teamRoutes = new Hono<{ Variables: AuthVars }>();
teamRoutes.use('*', authMockRequired);
teamRoutes.get('/invites', (c) => teamHandlers.list(c));
teamRoutes.post('/invites', (c) => teamHandlers.create(c));
teamRoutes.post('/invites/:code/accept', (c) => teamHandlers.accept(c));
teamRoutes.delete('/invites/:id', (c) => teamHandlers.remove(c));
teamRoutes.patch('/invites/:id/revoke', (c) => teamHandlers.revoke(c));
