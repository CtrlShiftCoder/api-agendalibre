import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { env } from './config/env.js';
import { errorHandler } from './infrastructure/middleware/error-handler.js';
import {
  authMockOptional,
  type AuthVars,
} from './infrastructure/middleware/auth-mock.js';
import {
  requestIdMiddleware,
  type RequestIdVars,
} from './infrastructure/middleware/request-id.js';
import {
  requestLoggerMiddleware,
  SLOW_THRESHOLD_MS,
} from './infrastructure/middleware/request-logger.js';
import { rateLimitMiddleware } from './infrastructure/middleware/rate-limit.js';
import { requireJsonContentType } from './infrastructure/middleware/json-content-type.js';
import { apiVersionMiddleware } from './infrastructure/middleware/api-version.js';
import { seedDatabase } from './infrastructure/mock-db/seed.js';
import { ok } from './shared/types/http.js';
import { API_VERSION } from './config/version.js';

import { authRoutes } from './modules/auth/routes.js';
import { businessesRoutes } from './modules/businesses/routes.js';
import { servicesRoutes } from './modules/services/routes.js';
import { professionalsRoutes } from './modules/professionals/routes.js';
import { clientsRoutes } from './modules/clients/routes.js';
import { appointmentsRoutes } from './modules/appointments/routes.js';
import { availabilityRoutes } from './modules/availability/routes.js';
import { policiesRoutes } from './modules/policies/routes.js';
import { waitlistRoutes } from './modules/waitlist/routes.js';
import {
  publicStorefrontRoutes,
  storefrontRoutes,
} from './modules/storefront/routes.js';
import { cashRoutes } from './modules/cash/routes.js';
import { remindersRoutes } from './modules/reminders/routes.js';
import { honorariosRoutes } from './modules/honorarios/routes.js';
import { teamRoutes } from './modules/team/routes.js';
import { notificationsRoutes } from './modules/notifications/routes.js';
import { reviewsRoutes } from './modules/reviews/routes.js';
import { galleryRoutes } from './modules/gallery/routes.js';

seedDatabase();

const startedAt = Date.now();

type Vars = AuthVars & RequestIdVars;

export function createApp() {
  const app = new Hono<{ Variables: Vars }>();

  app.use(
    '*',
    cors({
      origin: (origin) => {
        if (!origin) return env.corsOrigins[0] ?? '*';
        if (env.corsOrigins.includes('*')) return origin;
        if (env.corsOrigins.includes(origin)) return origin;
        // Expo web / metro
        if (
          origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:')
        ) {
          return origin;
        }
        return env.corsOrigins[0] ?? origin;
      },
      allowHeaders: [
        'Content-Type',
        'Authorization',
        'X-Mock-User',
        'X-Request-Id',
        'Idempotency-Key',
      ],
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      exposeHeaders: ['X-Request-Id', 'Idempotent-Replayed', 'X-API-Version'],
    })
  );

  app.use('*', apiVersionMiddleware);
  app.use('*', requestIdMiddleware);
  app.use('*', requestLoggerMiddleware);
  app.use('*', rateLimitMiddleware);
  app.use('*', requireJsonContentType);
  app.use('*', authMockOptional);
  app.onError(errorHandler);


  app.get('/openapi.json', (c) => {
    const candidates = [
      join(process.cwd(), 'openapi.json'),
      join(process.cwd(), 'openapi', 'openapi.json'),
    ];
    for (const file of candidates) {
      try {
        const raw = readFileSync(file, 'utf8');
        return c.json(JSON.parse(raw) as Record<string, unknown>);
      } catch {
        /* try next */
      }
    }
    return c.json(
      {
        error: {
          code: 'OPENAPI_MISSING',
          message: 'openapi.json not found — run npm run openapi',
        },
      },
      404
    );
  });

  app.get('/health', (c) => {
    const uptimeSec = Math.floor((Date.now() - startedAt) / 1000);
    return c.json(
      ok(
        {
          status: 'ok',
          service: 'agenda-libre-api',
          version: API_VERSION,
          time: new Date().toISOString(),
          uptimeSec,
          slowThresholdMs: SLOW_THRESHOLD_MS,
        },
        { requestId: c.get('requestId') }
      )
    );
  });

  app.route('/auth', authRoutes);
  app.route('/businesses', businessesRoutes);
  app.route('/services', servicesRoutes);
  app.route('/professionals', professionalsRoutes);
  app.route('/clients', clientsRoutes);
  app.route('/appointments', appointmentsRoutes);
  app.route('/availability', availabilityRoutes);
  app.route('/policies', policiesRoutes);
  app.route('/waitlist', waitlistRoutes);
  app.route('/storefront', storefrontRoutes);
  app.route('/public/v', publicStorefrontRoutes);
  app.route('/cash', cashRoutes);
  app.route('/reminders', remindersRoutes);
  app.route('/honorarios', honorariosRoutes);
  app.route('/team', teamRoutes);
  app.route('/notifications', notificationsRoutes);
  app.route('/reviews', reviewsRoutes);
  app.route('/gallery', galleryRoutes);

  app.notFound((c) =>
    c.json(
      {
        error: {
          code: 'NOT_FOUND',
          message: `Route ${c.req.method} ${c.req.path} not found`,
        },
      },
      404
    )
  );

  return app;
}

export type AppType = ReturnType<typeof createApp>;
