import type { Context } from 'hono';
import type { AuthVars } from '../../infrastructure/middleware/auth-mock.js';
import { AppError } from '../../shared/errors.js';
import { requireParam } from '../../shared/params.js';
import { ok } from '../../shared/types/http.js';
import { preferencesSchema } from './schemas.js';
import { notificationsService } from './service.js';

type C = Context<{ Variables: AuthVars }>;

export const notificationsHandlers = {
  list(c: C) {
    const user = c.get('user');
    if (!user) throw AppError.unauthorized();
    const data = notificationsService.list(user.id, user.businessId);
    return c.json(ok(data, { requestId: c.get('requestId'), total: data.length }));
  },
  markRead(c: C) {
    const data = notificationsService.markRead(requireParam(c.req.param('id'), 'id'));
    return c.json(ok(data, { requestId: c.get('requestId') }));
  },
  markAllRead(c: C) {
    const user = c.get('user');
    if (!user) throw AppError.unauthorized();
    const data = notificationsService.markAllRead(user.id, user.businessId);
    return c.json(ok(data, { requestId: c.get('requestId') }));
  },
  getPreferences(c: C) {
    const user = c.get('user');
    if (!user) throw AppError.unauthorized();
    return c.json(
      ok(notificationsService.getPreferences(user.id), { requestId: c.get('requestId') })
    );
  },
  async putPreferences(c: C) {
    const user = c.get('user');
    if (!user) throw AppError.unauthorized();
    const body = preferencesSchema.parse(await c.req.json());
    return c.json(
      ok(notificationsService.updatePreferences(user.id, body), {
        requestId: c.get('requestId'),
      })
    );
  },
};
