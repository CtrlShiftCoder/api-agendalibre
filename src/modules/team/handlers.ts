import type { Context } from 'hono';
import {
  requireBusinessId,
  type AuthVars,
} from '../../infrastructure/middleware/auth-mock.js';
import { AppError } from '../../shared/errors.js';
import { requireParam } from '../../shared/params.js';
import { ok } from '../../shared/types/http.js';
import { createInviteSchema } from './schemas.js';
import { teamService } from './service.js';

type C = Context<{ Variables: AuthVars }>;

export const teamHandlers = {
  list(c: C) {
    const user = c.get('user');
    const data = teamService.list(user?.businessId);
    return c.json(ok(data, { requestId: c.get('requestId'), total: data.length }));
  },
  async create(c: C) {
    const user = c.get('user');
    const businessId = requireBusinessId(user);
    const body = createInviteSchema.parse(await c.req.json());
    if (!user?.professionalId) throw AppError.forbidden('Need professional context');
    const data = teamService.create(
      businessId,
      user.professionalId,
      body.role,
      body.businessName
    );
    return c.json(ok(data, { requestId: c.get('requestId') }), 201);
  },
  accept(c: C) {
    const data = teamService.accept(requireParam(c.req.param('code'), 'code'));
    return c.json(ok(data, { requestId: c.get('requestId') }));
  },
  revoke(c: C) {
    requireBusinessId(c.get('user'));
    const data = teamService.revoke(requireParam(c.req.param('id'), 'id'));
    return c.json(ok(data, { requestId: c.get('requestId') }));
  },
  remove(c: C) {
    requireBusinessId(c.get('user'));
    teamService.remove(requireParam(c.req.param('id'), 'id'));
    return c.json(ok({ deleted: true }, { requestId: c.get('requestId') }));
  },
};
