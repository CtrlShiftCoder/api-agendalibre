import { Hono } from 'hono';
import { authMockRequired, type AuthVars } from '../../infrastructure/middleware/auth-mock.js';
import { servicesHandlers } from './handlers.js';

export const servicesRoutes = new Hono<{ Variables: AuthVars }>();
servicesRoutes.use('*', authMockRequired);
servicesRoutes.get('/', (c) => servicesHandlers.list(c));
servicesRoutes.post('/', (c) => servicesHandlers.create(c));
servicesRoutes.get('/:id', (c) => servicesHandlers.get(c));
servicesRoutes.patch('/:id', (c) => servicesHandlers.update(c));
servicesRoutes.delete('/:id', (c) => servicesHandlers.remove(c));
