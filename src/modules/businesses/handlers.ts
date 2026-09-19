import type { Context } from 'hono';
import type { AuthVars } from '../../infrastructure/middleware/auth-mock.js';
import { AppError } from '../../shared/errors.js';
import { requireParam } from '../../shared/params.js';
import { ok } from '../../shared/types/http.js';
import { createBusinessSchema, updateBusinessSchema } from './schemas.js';
import { businessesService } from './service.js';

type C = Context<{ Variables: AuthVars }>;

export const businessesHandlers = {
  list(c: C) {
    const user = c.get('user');
    const data = businessesService.list(user?.businessId);
    return c.json(ok(data, { requestId: c.get('requestId'), total: data.length }));
  },
  get(c: C) {
    const data = businessesService.get(requireParam(c.req.param('id'), 'id'));
    return c.json(ok(data, { requestId: c.get('requestId') }));
  },
  async create(c: C) {
    const body = createBusinessSchema.parse(await c.req.json());
    const data = businessesService.create(body);
    return c.json(ok(data, { requestId: c.get('requestId') }), 201);
  },
  async update(c: C) {
    const user = c.get('user');
    const id = requireParam(c.req.param('id'), 'id');
    if (user?.businessId && user.businessId !== id) {
      throw AppError.forbidden('Cannot update another business');
    }
    const body = updateBusinessSchema.parse(await c.req.json());
    const data = businessesService.update(id, body);
    return c.json(ok(data, { requestId: c.get('requestId') }));
  },
};
