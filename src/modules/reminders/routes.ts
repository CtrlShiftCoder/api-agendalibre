import { Hono } from 'hono';
import { authMockRequired, type AuthVars } from '../../infrastructure/middleware/auth-mock.js';
import { remindersHandlers } from './handlers.js';

export const remindersRoutes = new Hono<{ Variables: AuthVars }>();
remindersRoutes.use('*', authMockRequired);
remindersRoutes.get('/templates', (c) => remindersHandlers.templates(c));
remindersRoutes.patch('/templates/:id', (c) => remindersHandlers.updateTemplate(c));
remindersRoutes.get('/jobs', (c) => remindersHandlers.jobs(c));
remindersRoutes.post('/jobs', (c) => remindersHandlers.createJob(c));
