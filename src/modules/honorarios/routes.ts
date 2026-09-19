import { Hono } from 'hono';
import type { AuthVars } from '../../infrastructure/middleware/auth-mock.js';
import { honorariosHandlers } from './handlers.js';

export const honorariosRoutes = new Hono<{ Variables: AuthVars }>();
honorariosRoutes.post('/quote', (c) => honorariosHandlers.quote(c));
