import type { Context } from 'hono';
import {
  requireBusinessId,
  type AuthVars,
} from '../../infrastructure/middleware/auth-mock.js';
import { ok } from '../../shared/types/http.js';
import { requireParam } from '../../shared/params.js';
import { createSchema, updateSchema } from './schemas.js';
import { galleryService } from './service.js';

type C = Context<{ Variables: AuthVars }>;

export const galleryHandlers = {
  list(c: C) {
    const user = c.get('user');
    const visibleOnly = c.req.query('visible') === 'true';
    const data = galleryService.list(user?.businessId, visibleOnly);
    return c.json(ok(data, { requestId: c.get('requestId'), total: data.length }));
  },
  async create(c: C) {
    const businessId = requireBusinessId(c.get('user'));
    const body = createSchema.parse(await c.req.json());
    const data = galleryService.create(businessId, body);
    return c.json(ok(data, { requestId: c.get('requestId') }), 201);
  },
  async update(c: C) {
    requireBusinessId(c.get('user'));
    const body = updateSchema.parse(await c.req.json());
    const data = galleryService.update(requireParam(c.req.param('id'), 'id'), body);
    return c.json(ok(data, { requestId: c.get('requestId') }));
  },
  remove(c: C) {
    requireBusinessId(c.get('user'));
    galleryService.remove(requireParam(c.req.param('id'), 'id'));
    return c.json(ok({ deleted: true }, { requestId: c.get('requestId') }));
  },
};
