import { Hono } from 'hono';
import { authMockRequired, type AuthVars } from '../../infrastructure/middleware/auth-mock.js';
import { professionalsHandlers } from './handlers.js';

export const professionalsRoutes = new Hono<{ Variables: AuthVars }>();
professionalsRoutes.use('*', authMockRequired);
professionalsRoutes.get('/', (c) => professionalsHandlers.list(c));
professionalsRoutes.post('/', (c) => professionalsHandlers.create(c));
professionalsRoutes.get('/:id', (c) => professionalsHandlers.get(c));
professionalsRoutes.patch('/:id', (c) => professionalsHandlers.update(c));
professionalsRoutes.delete('/:id', (c) => professionalsHandlers.remove(c));
