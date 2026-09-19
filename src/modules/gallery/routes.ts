import { Hono } from 'hono';
import { authMockRequired, type AuthVars } from '../../infrastructure/middleware/auth-mock.js';
import { galleryHandlers } from './handlers.js';

export const galleryRoutes = new Hono<{ Variables: AuthVars }>();
galleryRoutes.use('*', authMockRequired);
galleryRoutes.get('/', (c) => galleryHandlers.list(c));
galleryRoutes.post('/', (c) => galleryHandlers.create(c));
galleryRoutes.patch('/:id', (c) => galleryHandlers.update(c));
galleryRoutes.delete('/:id', (c) => galleryHandlers.remove(c));
