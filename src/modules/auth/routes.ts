import { Hono } from 'hono';
import { authMockRequired, type AuthVars } from '../../infrastructure/middleware/auth-mock.js';
import { authHandlers } from './handlers.js';

export const authRoutes = new Hono<{ Variables: AuthVars }>();

authRoutes.post('/login', (c) => authHandlers.login(c));
authRoutes.post('/register', (c) => authHandlers.register(c));
authRoutes.get('/me', authMockRequired, (c) => authHandlers.me(c));
