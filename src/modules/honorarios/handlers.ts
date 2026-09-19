import type { Context } from 'hono';
import type { AuthVars } from '../../infrastructure/middleware/auth-mock.js';
import { ok } from '../../shared/types/http.js';
import { quoteSchema } from './schemas.js';
import { honorariosService } from './service.js';

type C = Context<{ Variables: AuthVars }>;

export const honorariosHandlers = {
  async quote(c: C) {
    const body = quoteSchema.parse(await c.req.json());
    return c.json(
      ok(honorariosService.quote(body.brutoClp), { requestId: c.get('requestId') })
    );
  },
};
