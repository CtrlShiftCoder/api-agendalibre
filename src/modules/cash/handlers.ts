import type { Context } from 'hono';
import {
  requireBusinessId,
  type AuthVars,
} from '../../infrastructure/middleware/auth-mock.js';
import { ok } from '../../shared/types/http.js';
import { querySchema } from './schemas.js';
import { cashService } from './service.js';

type C = Context<{ Variables: AuthVars }>;

export const cashHandlers = {
  day(c: C) {
    const businessId = requireBusinessId(c.get('user'));
    const q = querySchema.parse({
      date: c.req.query('date'),
      professionalId: c.req.query('professionalId') || undefined,
    });
    const data = cashService.day(businessId, q.date, q.professionalId);
    return c.json(ok(data, { requestId: c.get('requestId') }));
  },
};
