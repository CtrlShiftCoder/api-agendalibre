import type { Context } from 'hono';
import {
  requireBusinessId,
  type AuthVars,
} from '../../infrastructure/middleware/auth-mock.js';
import { requireParam } from '../../shared/params.js';
import { ok } from '../../shared/types/http.js';
import { createJobSchema, updateTemplateSchema } from './schemas.js';
import { remindersService } from './service.js';

type C = Context<{ Variables: AuthVars }>;

export const remindersHandlers = {
  templates(c: C) {
    const user = c.get('user');
    const data = remindersService.templates(user?.businessId);
    return c.json(ok(data, { requestId: c.get('requestId'), total: data.length }));
  },
  async updateTemplate(c: C) {
    requireBusinessId(c.get('user'));
    const id = requireParam(c.req.param('id'), 'id');
    const body = updateTemplateSchema.parse(await c.req.json());
    const data = remindersService.updateTemplate(id, body);
    return c.json(ok(data, { requestId: c.get('requestId') }));
  },
  jobs(c: C) {
    const user = c.get('user');
    const data = remindersService.jobs(user?.businessId);
    return c.json(ok(data, { requestId: c.get('requestId'), total: data.length }));
  },
  async createJob(c: C) {
    const businessId = requireBusinessId(c.get('user'));
    const body = createJobSchema.parse(await c.req.json());
    const data = remindersService.createJob(businessId, body);
    return c.json(ok(data, { requestId: c.get('requestId') }), 201);
  },
};
