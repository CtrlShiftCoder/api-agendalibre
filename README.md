# AgendaLibre API (mock backend)

Production-shaped **in-memory** HTTP API for the AgendaLibre Expo PoC.
No real database — swap `infrastructure/mock-db` for Prisma later.

## Stack
- Node.js + TypeScript (strict)
- [Hono](https://hono.dev) HTTP framework
- Zod request validation
- Multi-tenant ready (`businessId` on most entities)
- Niche-agnostic (`niche` / `vertical` strings)


## Overnight features

| Feature | Notes |
|---------|-------|
| **Rate limit** | In-memory sliding window per IP+method+path (180 / 60s → 429 `RATE_LIMITED`) |
| **Cache** | TTL cache for idempotent GETs; mutations invalidate |
| **OpenAPI** | `GET /openapi.json` + `npm run openapi` generator |
| **Mock auth** | `Bearer mock:<role>:<userId>` or `X-Mock-User` JSON; seed login emails below |
| **Smoke** | `npm run test:smoke` — health, openapi, login, services, honorarios, vitrina, idempotency |
| **Idempotency-Key** | Optional on `POST /appointments` + `POST /clients`; in-memory replay 24h |



## OpenAPI (from Zod)

`npm run openapi` runs `tsx scripts/generate-openapi.ts`, which walks Zod
schemas under `src/modules/*/schemas.ts` and writes:

- `openapi.json` (served by `GET /openapi.json`)
- `openapi/openapi.json` (fallback copy)

Look for `"x-generated-from": "zod-schemas"` and requestBody schemas (e.g.
`/honorarios/quote`, `/appointments/{id}` patch with `depositStatus`).

## Quick start

```bash
cd agenda-libre-api
npm install
npm run typecheck
npm run dev          # http://127.0.0.1:8787
```

Scripts: `dev` · `build` · `start` · `typecheck` · `test:smoke` · `openapi`

## Auth (mock)

```
Authorization: Bearer mock:<role>:<userId>
# role ∈ cliente | empresa | persona_natural

# or JSON header
X-Mock-User: {"id":"usr_empresa_1","role":"empresa","businessId":"biz_barber_01"}
```

### Seed users
| Email | Password | Role | Business |
|-------|----------|------|----------|
| `empresa@agendalibre.cl` | `demo1234` | empresa | Barbería Norte |
| `podologia@agendalibre.cl` | `demo1234` | persona_natural | Podología Andina |
| `cliente@agendalibre.cl` | `demo1234` | cliente | — |
| `trabajador@agendalibre.cl` | `demo1234` | empresa (worker) | Barbería Norte |

Useful bearer: `Authorization: Bearer mock:empresa:usr_empresa_1`

## Example curls

```bash
# Health
curl -s http://127.0.0.1:8787/health | jq

# Public vitrina (gallery + reviews)
curl -s http://127.0.0.1:8787/public/v/barberia-norte | jq

# Services (auth)
curl -s http://127.0.0.1:8787/services \
  -H 'Authorization: Bearer mock:empresa:usr_empresa_1' | jq

# Honorarios quote (Chile 2026 retention 15.25%)
curl -s http://127.0.0.1:8787/honorarios/quote \
  -H 'Content-Type: application/json' \
  -d '{"brutoClp":100000}' | jq

# Login
curl -s http://127.0.0.1:8787/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"empresa@agendalibre.cl","password":"demo1234"}' | jq
```

## Resource map

| Path | Notes |
|------|-------|
| `GET /health` | Liveness |
| `POST /auth/login`, `POST /auth/register`, `GET /auth/me` | Mock auth |
| `/businesses` | Tenants |
| `/services`, `/professionals`, `/clients`, `/appointments` | CRUD-ish |
| `GET /availability?date=&serviceId=&professionalId=` | Slot mock |
| `/policies` | Cancellation / deposit |
| `/waitlist` | Join / manage |
| `/storefront`, `GET /public/v/:slug` | Branding + public vitrina |
| `GET /cash/day?date=` | Day cash summary |
| `/reminders/templates`, `/reminders/jobs` | Templates + mock send |
| `POST /honorarios/quote` | Pure calc |
| `/team/invites` | Empresa invites |
| `/notifications` | Inbox + preferences |
| `/reviews`, `/gallery` | Social proof |

Envelope: `{ data, meta? }` · errors `{ error: { code, message, details? } }`

## Rate limiting (mock)

In-memory sliding window **per IP + method + path** (default **180 req / 60s**).
Exceeding the limit returns **429** with the standard error envelope:

```json
{ "error": { "code": "RATE_LIMITED", "message": "…", "details": { "limit": 180, "windowMs": 60000, "retryAfter": 12 } }, "meta": { "requestId": "…" } }
```

Response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`.

JSON body methods (`POST` / `PUT` / `PATCH`) require `Content-Type: application/json` (or `*+json`); otherwise **400** `BAD_REQUEST`.

`GET /health` includes `uptimeSec` (process uptime since boot) and `version` (from `package.json`). All responses set `X-API-Version`.

Request logger emits `slow_request` warn (JSON) when `durationMs` > `slowThresholdMs` (200); `GET /health` exposes `slowThresholdMs`.


## Idempotency-Key (mock)

Optional header on **`POST /appointments`** and **`POST /clients`**:

```http
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
```

- First request with a key runs normally and caches `{ status, body }` scoped by
  `businessId` + method + path + key.
- Replay with the **same key + same body** returns the cached response (same
  appointment/client id). Response includes `Idempotent-Replayed: true`.
- Same key + **different body** → **409** `CONFLICT`.
- Store is **in-memory**, TTL **24h** (process life). Lost on restart — PoC only.

```bash
KEY=$(uuidgen)
curl -s http://127.0.0.1:8787/appointments \
  -H "Authorization: Bearer mock:empresa:usr_empresa_1" \
  -H 'Content-Type: application/json' \
  -H "Idempotency-Key: $KEY" \
  -d '{"serviceId":"svc_barber_1","professionalId":null,"clientId":"cli_barber_1","date":"2026-09-20","startTime":"11:00"}' | jq
# second call with same KEY → identical data.id
```

## OpenAPI path

- Live: `GET /openapi.json` (repo root `openapi.json`, fallback `openapi/openapi.json`)
- Generate from Zod: `npm run openapi` → `tsx scripts/generate-openapi.ts` (requestBodies from `src/modules/*/schemas.ts`)
- Marker: `"x-generated-from": "zod-schemas"`



## Cache (mock)

In-memory **TTL cache** for idempotent GETs (`infrastructure/cache/ttl-cache.ts`).
Keys are scoped by domain + `businessId` (e.g. services, policies, storefront).
Mutations invalidate the relevant prefix. Not shared across processes — fine for PoC.

## Smoke tests

Against a running API on `:8787` (starts one if `/health` is unreachable, then leaves it up):

```bash
npm run test:smoke
```

Checks: `GET /health`, `GET /openapi.json`, seed `POST /auth/login`, `GET /services` (Bearer), `POST /honorarios/quote`, `GET /public/v/barberia-norte`, **Idempotency-Key** replay on `POST /appointments`, Zod requestBodies marker, **PATCH depositStatus** mock. Exit **non-zero** on any failure. Override base URL with `SMOKE_BASE_URL`.

## Architecture

```
src/
  main.ts                 # listen :8787
  app.ts                  # compose routes + middleware
  config/env.ts
  shared/                 # errors, ids, http envelopes
  contracts/              # DTO mirror (no Expo imports)
  infrastructure/
    mock-db/              # store.ts + seed.ts
    middleware/           # error-handler, request-id, request-logger, rate-limit, json-content-type, auth-mock
    cache/                # in-memory TTL for idempotent GETs
    idempotency/          # Idempotency-Key map (24h) for POST creates
  modules/<domain>/       # routes, handlers, service, repository, schemas
```

## Replacing mock-db with a real DB later

1. Keep **module boundaries**: handlers → service → repository.
2. Replace `infrastructure/mock-db/store.ts` usage inside each `repository.ts`
   with Prisma/Drizzle clients (same method names).
3. Move seed to a migration / seed script.
4. Add real JWT in `auth-mock.ts` (or new `auth-jwt.ts`) without changing route shapes.
5. Contracts in `src/contracts` stay the wire format; DB models can differ.

CORS is open for Expo web (`localhost:8081` and any localhost port).

## Data dictionary

The API includes comprehensive data models for businesses, services, appointments, clients, and professionals. See the source code in `src/contracts/types.ts` and individual module schemas for entity definitions and validation rules.

## OpenAPI

```bash
npm run openapi   # → openapi.json + openapi/openapi.json
```
Generated from route map + Zod-aligned request shapes (login, honorarios, …).
