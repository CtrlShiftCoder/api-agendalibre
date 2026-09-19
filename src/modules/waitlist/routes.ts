import { Hono } from 'hono';
import { authMockRequired, type AuthVars } from '../../infrastructure/middleware/auth-mock.js';
import { waitlistHandlers } from './handlers.js';

export const waitlistRoutes = new Hono<{ Variables: AuthVars }>();
waitlistRoutes.use('*', authMockRequired);
waitlistRoutes.get('/', (c) => waitlistHandlers.list(c));
waitlistRoutes.post('/', (c) => waitlistHandlers.create(c));
waitlistRoutes.patch('/:id', (c) => waitlistHandlers.update(c));
