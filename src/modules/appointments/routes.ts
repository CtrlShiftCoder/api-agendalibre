import { Hono } from 'hono';
import { authMockRequired, type AuthVars } from '../../infrastructure/middleware/auth-mock.js';
import { appointmentsHandlers } from './handlers.js';

export const appointmentsRoutes = new Hono<{ Variables: AuthVars }>();
appointmentsRoutes.use('*', authMockRequired);
appointmentsRoutes.get('/', (c) => appointmentsHandlers.list(c));
appointmentsRoutes.post('/', (c) => appointmentsHandlers.create(c));
appointmentsRoutes.get('/:id', (c) => appointmentsHandlers.get(c));
appointmentsRoutes.patch('/:id', (c) => appointmentsHandlers.update(c));
