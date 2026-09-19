import type { Context } from 'hono';
import { ok } from '../../shared/types/http.js';
import type { AuthVars } from '../../infrastructure/middleware/auth-mock.js';
import { AppError } from '../../shared/errors.js';
import { loginSchema, registerSchema } from './schemas.js';
import { authService } from './service.js';

type C = Context<{ Variables: AuthVars }>;

export const authHandlers = {
  async login(c: C) {
    const body = loginSchema.parse(await c.req.json());
    const session = authService.login(body.email, body.password, body.roleHint);
    return c.json(ok(session, { requestId: c.get('requestId') }), 200);
  },
  async register(c: C) {
    const body = registerSchema.parse(await c.req.json());
    const session = authService.register(body);
    return c.json(ok(session, { requestId: c.get('requestId') }), 201);
  },
  async me(c: C) {
    const user = c.get('user');
    if (!user) throw AppError.unauthorized();
    const me = authService.me(user.id);
    return c.json(ok(me, { requestId: c.get('requestId') }));
  },
};
