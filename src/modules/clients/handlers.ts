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
import type { Client } from '../../contracts/types.js';
import { createSchema, updateSchema } from './schemas.js';
import { clientsService } from './service.js';

type C = Context<{ Variables: AuthVars }>;

const CREATE_PATH = '/clients';

export const clientsHandlers = {
  list(c: C) {
    const user = c.get('user');
    const data = clientsService.list(user?.businessId);
    return c.json(ok(data, { requestId: c.get('requestId'), total: data.length }));
  },
  get(c: C) {
    return c.json(
      ok(clientsService.get(requireParam(c.req.param('id'), 'id')), {
        requestId: c.get('requestId'),
      })
    );
  },
  async create(c: C) {
    const businessId = requireBusinessId(c.get('user'));
    const body = createSchema.parse(await c.req.json());
    const idemKey = readIdempotencyKey(c);

    if (idemKey) {
      const cached = lookupIdempotency<ApiSuccess<Client>>(
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

    const data = clientsService.create(businessId, body);
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
    const data = clientsService.update(
      requireParam(c.req.param('id'), 'id'),
      body
    );
    return c.json(ok(data, { requestId: c.get('requestId') }));
  },
  remove(c: C) {
    requireBusinessId(c.get('user'));
    clientsService.remove(requireParam(c.req.param('id'), 'id'));
    return c.json(ok({ deleted: true }, { requestId: c.get('requestId') }));
  },
};
