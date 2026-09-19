import type { Context } from 'hono';
import type { AuthVars } from '../../infrastructure/middleware/auth-mock.js';
import { AppError } from '../../shared/errors.js';
import { ok } from '../../shared/types/http.js';
import { querySchema } from './schemas.js';
import { availabilityService } from './service.js';

type C = Context<{ Variables: AuthVars }>;

export const availabilityHandlers = {
  list(c: C) {
    const parsed = querySchema.parse({
      date: c.req.query('date'),
      serviceId: c.req.query('serviceId') || undefined,
      professionalId: c.req.query('professionalId') || undefined,
      businessId: c.req.query('businessId') || undefined,
    });
    const user = c.get('user');
    const businessId = parsed.businessId ?? user?.businessId;
    if (!businessId) throw AppError.badRequest('businessId required');
    const data = availabilityService.slots({ ...parsed, businessId });
    return c.json(ok(data, { requestId: c.get('requestId'), total: data.length }));
  },
};
