import type { Context } from 'hono';
import {
  requireBusinessId,
  type AuthVars,
} from '../../infrastructure/middleware/auth-mock.js';
import { ok } from '../../shared/types/http.js';
import { updateSchema } from './schemas.js';
import { policiesService } from './service.js';

type C = Context<{ Variables: AuthVars }>;

export const policiesHandlers = {
  get(c: C) {
    const businessId = requireBusinessId(c.get('user'));
    return c.json(ok(policiesService.get(businessId), { requestId: c.get('requestId') }));
  },
  async put(c: C) {
    const businessId = requireBusinessId(c.get('user'));
    const body = updateSchema.parse(await c.req.json());
    return c.json(
      ok(policiesService.update(businessId, body), { requestId: c.get('requestId') })
    );
  },
};
