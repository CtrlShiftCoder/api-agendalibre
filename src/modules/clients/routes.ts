import { Hono } from 'hono';
import { authMockRequired, type AuthVars } from '../../infrastructure/middleware/auth-mock.js';
import { clientsHandlers } from './handlers.js';

export const clientsRoutes = new Hono<{ Variables: AuthVars }>();
clientsRoutes.use('*', authMockRequired);
clientsRoutes.get('/', (c) => clientsHandlers.list(c));
clientsRoutes.post('/', (c) => clientsHandlers.create(c));
clientsRoutes.get('/:id', (c) => clientsHandlers.get(c));
clientsRoutes.patch('/:id', (c) => clientsHandlers.update(c));
clientsRoutes.delete('/:id', (c) => clientsHandlers.remove(c));
