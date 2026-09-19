import { Hono } from 'hono';
import { authMockRequired, type AuthVars } from '../../infrastructure/middleware/auth-mock.js';
import { businessesHandlers } from './handlers.js';

export const businessesRoutes = new Hono<{ Variables: AuthVars }>();
businessesRoutes.use('*', authMockRequired);
businessesRoutes.get('/', (c) => businessesHandlers.list(c));
businessesRoutes.post('/', (c) => businessesHandlers.create(c));
businessesRoutes.get('/:id', (c) => businessesHandlers.get(c));
businessesRoutes.patch('/:id', (c) => businessesHandlers.update(c));
