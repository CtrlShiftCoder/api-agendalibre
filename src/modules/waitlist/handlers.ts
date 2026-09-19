import type { Context } from 'hono';
import {
  requireBusinessId,
  type AuthVars,
} from '../../infrastructure/middleware/auth-mock.js';
import { ok } from '../../shared/types/http.js';
import { requireParam } from '../../shared/params.js';
import { createSchema, updateSchema } from './schemas.js';
import { waitlistService } from './service.js';

type C = Context<{ Variables: AuthVars }>;

export const waitlistHandlers = {
  list(c: C) {
    const user = c.get('user');
    const data = waitlistService.list(user?.businessId);
    return c.json(ok(data, { requestId: c.get('requestId'), total: data.length }));
  },
  async create(c: C) {
    const businessId = requireBusinessId(c.get('user'));
    const body = createSchema.parse(await c.req.json());
    const data = waitlistService.create(businessId, body);
    return c.json(ok(data, { requestId: c.get('requestId') }), 201);
  },
  async update(c: C) {
    requireBusinessId(c.get('user'));
    const body = updateSchema.parse(await c.req.json());
    const data = waitlistService.update(requireParam(c.req.param('id'), 'id'), body);
    return c.json(ok(data, { requestId: c.get('requestId') }));
  },
};
