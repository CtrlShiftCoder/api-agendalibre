import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import {
  requireBusinessId,
  type AuthVars,
} from '../../infrastructure/middleware/auth-mock.js';
import {
  lookupIdempotency,
  readIdempotencyKey,
  storeIdempotency,
} from '../../infrastructure/idempotency/helpers.js';
import { AppError } from '../../shared/errors.js';
import { ok, type ApiSuccess } from '../../shared/types/http.js';
import { requireParam } from '../../shared/params.js';
import type { Appointment } from '../../contracts/types.js';
import { createSchema, updateSchema } from './schemas.js';
import { appointmentsService } from './service.js';

type C = Context<{ Variables: AuthVars }>;

const CREATE_PATH = '/appointments';

export const appointmentsHandlers = {
  list(c: C) {
    const user = c.get('user');
    const date = c.req.query('date');
    const clientId = c.req.query('clientId');
    const data = appointmentsService.list(user?.businessId, {
      date: date || undefined,
      clientId: clientId || undefined,
    });
    return c.json(ok(data, { requestId: c.get('requestId'), total: data.length }));
  },
  get(c: C) {
    return c.json(
      ok(appointmentsService.get(requireParam(c.req.param('id'), 'id')), {
        requestId: c.get('requestId'),
      })
    );
  },
  async create(c: C) {
    const businessId = requireBusinessId(c.get('user'));
    const body = createSchema.parse(await c.req.json());
    const idemKey = readIdempotencyKey(c);

    if (idemKey) {
      const cached = lookupIdempotency<ApiSuccess<Appointment>>(
        'POST',
        CREATE_PATH,
        businessId,
        idemKey,
        body
      );
      if (cached.kind === 'conflict') {
        throw AppError.conflict(
          'Idempotency-Key reused with a different request body',
          { key: idemKey }
        );
      }
      if (cached.kind === 'replay') {
        c.header('Idempotent-Replayed', 'true');
        return c.json(cached.body, cached.status as ContentfulStatusCode);
      }
    }

    const data = appointmentsService.create(businessId, body);
    const payload = ok(data, { requestId: c.get('requestId') });

    if (idemKey) {
      storeIdempotency(
        'POST',
        CREATE_PATH,
        businessId,
        idemKey,
        body,
        201,
        payload
      );
    }

    return c.json(payload, 201);
  },
  async update(c: C) {
    requireBusinessId(c.get('user'));
    const body = updateSchema.parse(await c.req.json());
    const data = appointmentsService.update(
      requireParam(c.req.param('id'), 'id'),
      body
    );
    return c.json(ok(data, { requestId: c.get('requestId') }));
  },
};
