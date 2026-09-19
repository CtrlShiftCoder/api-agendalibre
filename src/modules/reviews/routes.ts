import { Hono } from 'hono';
import { authMockRequired, type AuthVars } from '../../infrastructure/middleware/auth-mock.js';
import { reviewsHandlers } from './handlers.js';

export const reviewsRoutes = new Hono<{ Variables: AuthVars }>();
reviewsRoutes.use('*', authMockRequired);
reviewsRoutes.get('/', (c) => reviewsHandlers.list(c));
reviewsRoutes.post('/', (c) => reviewsHandlers.create(c));
reviewsRoutes.patch('/:id', (c) => reviewsHandlers.update(c));
