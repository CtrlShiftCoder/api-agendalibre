import { createMiddleware } from 'hono/factory';
import type { AuthUser, UserRole } from '../../contracts/types.js';
import { AppError } from '../../shared/errors.js';
import { db } from '../mock-db/store.js';

export type AuthVars = {
  user: AuthUser | null;
  requestId: string;
};

const ROLES: UserRole[] = ['cliente', 'empresa', 'persona_natural'];

function parseBearer(header: string | undefined): AuthUser | null {
  if (!header) return null;
  const m = header.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  const token = m[1]!.trim();

  // mock:<role>:<userId>
  const mock = token.match(/^mock:([^:]+):(.+)$/);
  if (mock) {
    const role = mock[1] as UserRole;
    const userId = mock[2]!;
    if (!ROLES.includes(role)) return null;
    const found = db.users.find((u) => u.id === userId);
    if (found) {
      const { password: _p, ...user } = found;
      return user;
    }
    // Synthesize if id unknown but role valid (handy for smoke)
    const biz =
      role === 'cliente'
        ? null
        : db.businesses.find((b) =>
            role === 'persona_natural'
              ? b.roleKind === 'persona_natural'
              : b.roleKind === 'empresa'
          ) ?? null;
    return {
      id: userId,
      email: `${userId}@mock.local`,
      name: `Mock ${role}`,
      role,
      businessId: biz?.id ?? null,
      professionalId:
        biz
          ? db.professionals.find((p) => p.businessId === biz.id)?.id ?? null
          : null,
      clientId: role === 'cliente' ? db.clients[0]?.id ?? null : null,
    };
  }

  // token equals user id or email
  const byId = db.users.find((u) => u.id === token || u.email === token);
  if (byId) {
    const { password: _p, ...user } = byId;
    return user;
  }
  return null;
}

function parseXMockUser(raw: string | undefined): AuthUser | null {
  if (!raw) return null;
  try {
    const j = JSON.parse(raw) as Partial<AuthUser>;
    if (!j.id || !j.role || !ROLES.includes(j.role as UserRole)) return null;
    const found = db.users.find((u) => u.id === j.id);
    if (found) {
      const { password: _p, ...user } = found;
      return { ...user, ...j, role: j.role as UserRole };
    }
    return {
      id: j.id,
      email: j.email ?? `${j.id}@mock.local`,
      name: j.name ?? 'Mock User',
      role: j.role as UserRole,
      businessId: j.businessId ?? null,
      professionalId: j.professionalId ?? null,
      clientId: j.clientId ?? null,
    };
  } catch {
    return null;
  }
}

/** Attaches optional mock user (never throws). */
export const authMockOptional = createMiddleware<{
  Variables: AuthVars;
}>(async (c, next) => {
  const user =
    parseBearer(c.req.header('authorization')) ??
    parseXMockUser(c.req.header('x-mock-user'));
  c.set('user', user);
  await next();
});

/** Requires mock auth. */
export const authMockRequired = createMiddleware<{
  Variables: AuthVars;
}>(async (c, next) => {
  const user =
    parseBearer(c.req.header('authorization')) ??
    parseXMockUser(c.req.header('x-mock-user'));
  if (!user) throw AppError.unauthorized('Missing or invalid mock auth');
  c.set('user', user);
  await next();
});

export function requireBusinessId(user: AuthUser | null): string {
  if (!user?.businessId) {
    throw AppError.forbidden('This action requires a business context');
  }
  return user.businessId;
}
