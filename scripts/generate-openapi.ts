/**
 * Generate OpenAPI 3.0 from Hono route map + Zod request schemas.
 * Run: npm run openapi  (tsx scripts/generate-openapi.ts)
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ZodTypeAny } from 'zod';
import { ZodFirstPartyTypeKind } from 'zod';

import { loginSchema, registerSchema } from '../src/modules/auth/schemas.js';
import {
  createSchema as aptCreate,
  updateSchema as aptUpdate,
} from '../src/modules/appointments/schemas.js';
import { querySchema as availabilityQuery } from '../src/modules/availability/schemas.js';
import {
  createBusinessSchema,
  updateBusinessSchema,
} from '../src/modules/businesses/schemas.js';
import { querySchema as cashQuery } from '../src/modules/cash/schemas.js';
import {
  createSchema as clientCreate,
  updateSchema as clientUpdate,
} from '../src/modules/clients/schemas.js';
import {
  createSchema as galleryCreate,
  updateSchema as galleryUpdate,
} from '../src/modules/gallery/schemas.js';
import { quoteSchema } from '../src/modules/honorarios/schemas.js';
import { preferencesSchema } from '../src/modules/notifications/schemas.js';
import { updateSchema as policyUpdate } from '../src/modules/policies/schemas.js';
import {
  createSchema as proCreate,
  updateSchema as proUpdate,
} from '../src/modules/professionals/schemas.js';
import {
  createJobSchema,
  updateTemplateSchema,
} from '../src/modules/reminders/schemas.js';
import {
  createSchema as reviewCreate,
  updateSchema as reviewUpdate,
} from '../src/modules/reviews/schemas.js';
import {
  createSchema as serviceCreate,
  updateSchema as serviceUpdate,
} from '../src/modules/services/schemas.js';
import { updateSchema as storefrontUpdate } from '../src/modules/storefront/schemas.js';
import { createInviteSchema } from '../src/modules/team/schemas.js';
import {
  createSchema as waitlistCreate,
  updateSchema as waitlistUpdate,
} from '../src/modules/waitlist/schemas.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

type JsonSchema = Record<string, unknown>;

function zodToJsonSchema(schema: ZodTypeAny): JsonSchema {
  const def = schema._def as {
    typeName: ZodFirstPartyTypeKind;
    description?: string;
    innerType?: ZodTypeAny;
    schema?: ZodTypeAny;
    type?: ZodTypeAny;
    shape?: () => Record<string, ZodTypeAny>;
    values?: unknown[];
    checks?: Array<{ kind: string; value?: unknown }>;
    options?: ZodTypeAny[];
  };

  switch (def.typeName) {
    case ZodFirstPartyTypeKind.ZodString: {
      const out: JsonSchema = { type: 'string' };
      for (const c of def.checks ?? []) {
        if (c.kind === 'email') out.format = 'email';
        if (c.kind === 'regex' && c.value instanceof RegExp) {
          out.pattern = c.value.source;
        }
        if (c.kind === 'min' && typeof c.value === 'number') out.minLength = c.value;
      }
      return out;
    }
    case ZodFirstPartyTypeKind.ZodNumber: {
      const out: JsonSchema = { type: 'number' };
      for (const c of def.checks ?? []) {
        if (c.kind === 'int') out.type = 'integer';
        if (c.kind === 'min' && typeof c.value === 'number') out.minimum = c.value;
        if (c.kind === 'max' && typeof c.value === 'number') out.maximum = c.value;
      }
      return out;
    }
    case ZodFirstPartyTypeKind.ZodBoolean:
      return { type: 'boolean' };
    case ZodFirstPartyTypeKind.ZodEnum:
      return { type: 'string', enum: def.values };
    case ZodFirstPartyTypeKind.ZodLiteral: {
      const v = (schema as unknown as { _def: { value: unknown } })._def.value;
      return { type: typeof v as 'string' | 'number' | 'boolean', enum: [v] };
    }
    case ZodFirstPartyTypeKind.ZodNullable:
      return { ...zodToJsonSchema(def.innerType!), nullable: true };
    case ZodFirstPartyTypeKind.ZodOptional:
      return zodToJsonSchema(def.innerType!);
    case ZodFirstPartyTypeKind.ZodDefault:
      return zodToJsonSchema(def.innerType!);
    case ZodFirstPartyTypeKind.ZodArray:
      return { type: 'array', items: zodToJsonSchema(def.type!) };
    case ZodFirstPartyTypeKind.ZodObject: {
      const shape = def.shape!();
      const properties: Record<string, JsonSchema> = {};
      const required: string[] = [];
      for (const [key, val] of Object.entries(shape)) {
        properties[key] = zodToJsonSchema(val);
        const isOpt =
          (val._def as { typeName: string }).typeName ===
            ZodFirstPartyTypeKind.ZodOptional ||
          (val._def as { typeName: string }).typeName ===
            ZodFirstPartyTypeKind.ZodDefault;
        if (!isOpt) required.push(key);
      }
      const out: JsonSchema = { type: 'object', properties };
      if (required.length) out.required = required;
      return out;
    }
    case ZodFirstPartyTypeKind.ZodUnion: {
      return { oneOf: (def.options ?? []).map(zodToJsonSchema) };
    }
    case ZodFirstPartyTypeKind.ZodEffects:
      return zodToJsonSchema(def.schema!);
    default:
      return {};
  }
}

function body(schema: ZodTypeAny) {
  return {
    required: true,
    content: {
      'application/json': { schema: zodToJsonSchema(schema) },
    },
  };
}

function idParam() {
  return {
    name: 'id',
    in: 'path' as const,
    required: true,
    schema: { type: 'string' },
  };
}

function bearer() {
  return [{ bearerAuth: [] as string[] }];
}

const paths: Record<string, unknown> = {
  '/health': {
    get: {
      summary: 'Liveness',
      tags: ['system'],
      responses: { 200: { description: 'OK' } },
    },
  },
  '/openapi.json': {
    get: {
      summary: 'This OpenAPI document',
      tags: ['system'],
      responses: { 200: { description: 'OpenAPI 3.0 JSON' } },
    },
  },
  '/auth/login': {
    post: {
      summary: 'Mock login',
      tags: ['auth'],
      requestBody: body(loginSchema),
      responses: {
        200: { description: 'AuthSession' },
        401: { description: 'Unauthorized' },
      },
    },
  },
  '/auth/register': {
    post: {
      summary: 'Mock register',
      tags: ['auth'],
      requestBody: body(registerSchema),
      responses: { 201: { description: 'AuthSession' } },
    },
  },
  '/auth/me': {
    get: {
      summary: 'Current user',
      tags: ['auth'],
      security: bearer(),
      responses: { 200: { description: 'AuthUser' } },
    },
  },
};

function crud(
  base: string,
  name: string,
  create?: ZodTypeAny,
  update?: ZodTypeAny,
  opts?: { delete?: boolean }
) {
  const tag = name.toLowerCase();
  paths[base] = {
    get: {
      summary: `List ${name}`,
      tags: [tag],
      security: bearer(),
      responses: { 200: { description: `${name}[]` } },
    },
    post: {
      summary: `Create ${name}`,
      tags: [tag],
      security: bearer(),
      ...(create ? { requestBody: body(create) } : {}),
      responses: { 201: { description: name } },
    },
  };
  const item: Record<string, unknown> = {
    get: {
      summary: `Get ${name}`,
      tags: [tag],
      security: bearer(),
      parameters: [idParam()],
      responses: { 200: { description: name } },
    },
  };
  if (update) {
    item.patch = {
      summary: `Update ${name}`,
      tags: [tag],
      security: bearer(),
      parameters: [idParam()],
      requestBody: body(update),
      responses: { 200: { description: name } },
    };
  }
  if (opts?.delete) {
    item.delete = {
      summary: `Delete ${name}`,
      tags: [tag],
      security: bearer(),
      parameters: [idParam()],
      responses: { 200: { description: 'deleted' } },
    };
  }
  paths[`${base}/{id}`] = item;
}

crud('/services', 'Service', serviceCreate, serviceUpdate, { delete: true });
crud('/professionals', 'Professional', proCreate, proUpdate, { delete: true });
crud('/clients', 'Client', clientCreate, clientUpdate, { delete: true });
crud('/appointments', 'Appointment', aptCreate, aptUpdate);
crud('/businesses', 'Business', createBusinessSchema, updateBusinessSchema);

Object.assign(paths, {
  '/availability': {
    get: {
      summary: 'List slots',
      tags: ['availability'],
      parameters: Object.entries(
        (zodToJsonSchema(availabilityQuery).properties ?? {}) as Record<
          string,
          JsonSchema
        >
      ).map(([name, schema]) => ({
        name,
        in: 'query',
        required: ((zodToJsonSchema(availabilityQuery).required as string[]) ?? []).includes(
          name
        ),
        schema,
      })),
      responses: { 200: { description: 'AvailabilitySlot[]' } },
    },
  },
  '/policies': {
    get: {
      summary: 'Get cancellation policy',
      tags: ['policies'],
      security: bearer(),
      responses: { 200: { description: 'CancellationPolicy' } },
    },
    put: {
      summary: 'Update policy',
      tags: ['policies'],
      security: bearer(),
      requestBody: body(policyUpdate),
      responses: { 200: { description: 'CancellationPolicy' } },
    },
  },
  '/waitlist': {
    get: {
      summary: 'List waitlist',
      tags: ['waitlist'],
      security: bearer(),
      responses: { 200: { description: 'WaitlistEntry[]' } },
    },
    post: {
      summary: 'Join waitlist',
      tags: ['waitlist'],
      security: bearer(),
      requestBody: body(waitlistCreate),
      responses: { 201: { description: 'WaitlistEntry' } },
    },
  },
  '/waitlist/{id}': {
    patch: {
      summary: 'Update waitlist entry',
      tags: ['waitlist'],
      security: bearer(),
      parameters: [idParam()],
      requestBody: body(waitlistUpdate),
      responses: { 200: { description: 'WaitlistEntry' } },
    },
  },
  '/storefront': {
    get: {
      summary: 'Get storefront',
      tags: ['storefront'],
      security: bearer(),
      responses: { 200: { description: 'PublicStorefront' } },
    },
    put: {
      summary: 'Update storefront',
      tags: ['storefront'],
      security: bearer(),
      requestBody: body(storefrontUpdate),
      responses: { 200: { description: 'PublicStorefront' } },
    },
  },
  '/public/v/{slug}': {
    get: {
      summary: 'Public vitrina',
      tags: ['storefront'],
      parameters: [
        {
          name: 'slug',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: { 200: { description: 'PublicStorefrontView' } },
    },
  },
  '/cash/day': {
    get: {
      summary: 'Day cash summary CLP',
      tags: ['cash'],
      security: bearer(),
      parameters: Object.entries(
        (zodToJsonSchema(cashQuery).properties ?? {}) as Record<string, JsonSchema>
      ).map(([name, schema]) => ({
        name,
        in: 'query',
        required: ((zodToJsonSchema(cashQuery).required as string[]) ?? []).includes(
          name
        ),
        schema,
      })),
      responses: { 200: { description: 'DayCashSummary' } },
    },
  },
  '/reminders/templates': {
    get: {
      summary: 'List WhatsApp templates',
      tags: ['reminders'],
      security: bearer(),
      responses: { 200: { description: 'ReminderTemplate[]' } },
    },
  },
  '/reminders/templates/{id}': {
    patch: {
      summary: 'Update template',
      tags: ['reminders'],
      security: bearer(),
      parameters: [idParam()],
      requestBody: body(updateTemplateSchema),
      responses: { 200: { description: 'ReminderTemplate' } },
    },
  },
  '/reminders/jobs': {
    get: {
      summary: 'List reminder jobs',
      tags: ['reminders'],
      security: bearer(),
      responses: { 200: { description: 'ReminderJob[]' } },
    },
    post: {
      summary: 'Create + mock-send job',
      tags: ['reminders'],
      security: bearer(),
      requestBody: body(createJobSchema),
      responses: { 201: { description: 'ReminderJob' } },
    },
  },
  '/honorarios/quote': {
    post: {
      summary: 'Chile boleta retention quote (2026 15.25%)',
      tags: ['honorarios'],
      requestBody: body(quoteSchema),
      responses: { 200: { description: 'HonorariosQuote' } },
    },
  },
  '/team/invites': {
    get: {
      summary: 'List invites',
      tags: ['team'],
      security: bearer(),
      responses: { 200: { description: 'TeamInvite[]' } },
    },
    post: {
      summary: 'Create invite',
      tags: ['team'],
      security: bearer(),
      requestBody: body(createInviteSchema),
      responses: { 201: { description: 'TeamInvite' } },
    },
  },
  '/notifications': {
    get: {
      summary: 'Inbox',
      tags: ['notifications'],
      security: bearer(),
      responses: { 200: { description: 'AppNotification[]' } },
    },
  },
  '/notifications/{id}/read': {
    patch: {
      summary: 'Mark one read',
      tags: ['notifications'],
      security: bearer(),
      parameters: [idParam()],
      responses: { 200: { description: 'AppNotification' } },
    },
  },
  '/notifications/read-all': {
    post: {
      summary: 'Mark all read',
      tags: ['notifications'],
      security: bearer(),
      responses: { 200: { description: '{ updated }' } },
    },
  },
  '/notifications/preferences': {
    get: {
      summary: 'Push preferences',
      tags: ['notifications'],
      security: bearer(),
      responses: { 200: { description: 'PushPreference' } },
    },
    put: {
      summary: 'Update preferences',
      tags: ['notifications'],
      security: bearer(),
      requestBody: body(preferencesSchema),
      responses: { 200: { description: 'PushPreference' } },
    },
  },
  '/reviews': {
    get: {
      summary: 'List reviews',
      tags: ['reviews'],
      security: bearer(),
      responses: { 200: { description: 'Review[]' } },
    },
    post: {
      summary: 'Create review',
      tags: ['reviews'],
      security: bearer(),
      requestBody: body(reviewCreate),
      responses: { 201: { description: 'Review' } },
    },
  },
  '/reviews/{id}': {
    patch: {
      summary: 'Update review (reply / visibility)',
      tags: ['reviews'],
      security: bearer(),
      parameters: [idParam()],
      requestBody: body(reviewUpdate),
      responses: { 200: { description: 'Review' } },
    },
  },
  '/gallery': {
    get: {
      summary: 'List gallery',
      tags: ['gallery'],
      security: bearer(),
      responses: { 200: { description: 'GalleryItem[]' } },
    },
    post: {
      summary: 'Add gallery item',
      tags: ['gallery'],
      security: bearer(),
      requestBody: body(galleryCreate),
      responses: { 201: { description: 'GalleryItem' } },
    },
  },
  '/gallery/{id}': {
    patch: {
      summary: 'Update gallery item',
      tags: ['gallery'],
      security: bearer(),
      parameters: [idParam()],
      requestBody: body(galleryUpdate),
      responses: { 200: { description: 'GalleryItem' } },
    },
    delete: {
      summary: 'Remove gallery item',
      tags: ['gallery'],
      security: bearer(),
      parameters: [idParam()],
      responses: { 200: { description: 'deleted' } },
    },
  },
});

const doc = {
  openapi: '3.0.3',
  info: {
    title: 'AgendaLibre Mock API',
    version: '1.0.0',
    description:
      'In-memory Hono API for the Expo PoC. Request bodies derived from Zod schemas in src/modules/*/schemas.ts. No real payments / OAuth / FCM.',
  },
  servers: [{ url: 'http://127.0.0.1:8787' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        description: 'mock:<role>:<userId> or login token',
      },
    },
    schemas: {
      ApiSuccess: {
        type: 'object',
        properties: {
          data: {},
          meta: {
            type: 'object',
            properties: {
              requestId: { type: 'string' },
              total: { type: 'integer' },
            },
          },
        },
      },
      ApiError: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              details: {},
            },
          },
        },
      },
    },
  },
  paths,
  tags: [
    { name: 'system' },
    { name: 'auth' },
    { name: 'storefront' },
    { name: 'honorarios' },
    { name: 'cash' },
    { name: 'appointments' },
    { name: 'services' },
    { name: 'clients' },
    { name: 'gallery' },
    { name: 'reviews' },
    { name: 'notifications' },
    { name: 'reminders' },
    { name: 'waitlist' },
    { name: 'team' },
    { name: 'policies' },
  ],
  'x-generated-from': 'zod-schemas',
};

mkdirSync(join(root, 'openapi'), { recursive: true });
const json = JSON.stringify(doc, null, 2);
writeFileSync(join(root, 'openapi.json'), json);
writeFileSync(join(root, 'openapi', 'openapi.json'), json);
console.log(
  'Wrote openapi.json + openapi/openapi.json — paths:',
  Object.keys(paths).length,
  '| from Zod: yes'
);
