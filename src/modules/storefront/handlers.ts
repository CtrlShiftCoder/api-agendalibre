import type { Context } from 'hono';
import {
  requireBusinessId,
  type AuthVars,
} from '../../infrastructure/middleware/auth-mock.js';
import { ok } from '../../shared/types/http.js';
import { requireParam } from '../../shared/params.js';
import { updateSchema } from './schemas.js';
import { storefrontService } from './service.js';

type C = Context<{ Variables: AuthVars }>;

export const storefrontHandlers = {
  get(c: C) {
    const businessId = requireBusinessId(c.get('user'));
    return c.json(ok(storefrontService.get(businessId), { requestId: c.get('requestId') }));
  },
  async put(c: C) {
    const businessId = requireBusinessId(c.get('user'));
    const body = updateSchema.parse(await c.req.json());
    return c.json(
      ok(storefrontService.update(businessId, body), { requestId: c.get('requestId') })
    );
  },
  public(c: C) {
    const slug = requireParam(c.req.param('slug'), 'slug');
    return c.json(
      ok(storefrontService.publicBySlug(slug), { requestId: c.get('requestId') })
    );
  },
};
