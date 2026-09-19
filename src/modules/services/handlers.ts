import type { Context } from 'hono';
import {
  requireBusinessId,
  type AuthVars,
} from '../../infrastructure/middleware/auth-mock.js';
import { ok } from '../../shared/types/http.js';
import { requireParam } from '../../shared/params.js';
import { createSchema, updateSchema } from './schemas.js';
import { servicesService } from './service.js';

type C = Context<{ Variables: AuthVars }>;

export const servicesHandlers = {
  list(c: C) {
    const user = c.get('user');
    const data = servicesService.list(user?.businessId);
    return c.json(ok(data, { requestId: c.get('requestId'), total: data.length }));
  },
  get(c: C) {
    return c.json(ok(servicesService.get(requireParam(c.req.param('id'), 'id')), { requestId: c.get('requestId') }));
  },
  async create(c: C) {
    const businessId = requireBusinessId(c.get('user'));
    const body = createSchema.parse(await c.req.json());
    const data = servicesService.create(businessId, body);
    return c.json(ok(data, { requestId: c.get('requestId') }), 201);
  },
  async update(c: C) {
    requireBusinessId(c.get('user'));
    const body = updateSchema.parse(await c.req.json());
    const data = servicesService.update(requireParam(c.req.param('id'), 'id'), body);
    return c.json(ok(data, { requestId: c.get('requestId') }));
  },
  remove(c: C) {
    requireBusinessId(c.get('user'));
    servicesService.remove(requireParam(c.req.param('id'), 'id'));
    return c.json(ok({ deleted: true }, { requestId: c.get('requestId') }));
  },
};
