import { Hono } from 'hono';
import { authMockRequired, type AuthVars } from '../../infrastructure/middleware/auth-mock.js';
import { notificationsHandlers } from './handlers.js';

export const notificationsRoutes = new Hono<{ Variables: AuthVars }>();
notificationsRoutes.use('*', authMockRequired);
notificationsRoutes.get('/preferences', (c) => notificationsHandlers.getPreferences(c));
notificationsRoutes.put('/preferences', (c) => notificationsHandlers.putPreferences(c));
notificationsRoutes.post('/read-all', (c) => notificationsHandlers.markAllRead(c));
notificationsRoutes.get('/', (c) => notificationsHandlers.list(c));
notificationsRoutes.patch('/:id/read', (c) => notificationsHandlers.markRead(c));
