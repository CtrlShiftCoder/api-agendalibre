import type { AuthSession, AuthUser, Niche } from '../../contracts/types.js';
import { db } from '../../infrastructure/mock-db/store.js';
import { AppError } from '../../shared/errors.js';
import { generateId, nowIso, todayOffset } from '../../shared/ids.js';
import { authRepository } from './repository.js';

function sessionFor(user: AuthUser): AuthSession {
  return {
    token: `mock:${user.role}:${user.id}`,
    user,
    expiresAt: todayOffset(30) + 'T23:59:59.000Z',
  };
}

export const authService = {
  login(email: string, password: string, roleHint?: AuthUser['role']): AuthSession {
    let user = authRepository.findByEmail(email);
    if (!user) throw AppError.unauthorized('Invalid email or password');
    if (user.password !== password) throw AppError.unauthorized('Invalid email or password');
    if (roleHint && user.role !== roleHint) {
      // allow roleHint only if another seed user with that role+email pattern; else ignore
    }
    return sessionFor(authRepository.toAuthUser(user));
  },

  register(input: {
    email: string;
    password: string;
    name: string;
    role: AuthUser['role'];
    niche?: Niche;
    phone?: string;
  }): AuthSession {
    if (authRepository.findByEmail(input.email)) {
      throw AppError.conflict('Email already registered');
    }
    const ts = nowIso();
    let businessId: string | null = null;
    let professionalId: string | null = null;
    let clientId: string | null = null;

    if (input.role === 'empresa' || input.role === 'persona_natural') {
      const niche = input.niche ?? 'other';
      const slug =
        input.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || 'negocio';
      businessId = generateId('biz');
      db.businesses.push({
        id: businessId,
        slug: `${slug}-${businessId.slice(-4)}`,
        name: input.name,
        niche,
        vertical: niche,
        roleKind: input.role,
        address: 'Santiago, Chile',
        phone: input.phone,
        hours: { open: '09:00', close: '19:00', days: [1, 2, 3, 4, 5, 6] },
        blockedDates: [],
        theme: niche === 'other' ? 'neutral' : niche,
        createdAt: ts,
        updatedAt: ts,
      });
      professionalId = generateId('pro');
      db.professionals.push({
        id: professionalId,
        businessId,
        name: input.name,
        role: input.role === 'persona_natural' ? 'Profesional' : 'Admin',
        teamRole: 'admin',
        phone: input.phone,
        active: true,
        color: '#06C167',
      });
      db.policies.push({
        id: generateId('pol'),
        businessId,
        cancelBeforeHours: 24,
        depositPercentDefault: 30,
        noShowFeePercent: 50,
        noShowFeeFixedClp: null,
        keepDepositOnNoShow: true,
        policyText: 'Cancelación hasta 24h antes sin cargo.',
        updatedAt: ts,
      });
      db.storefronts.push({
        slug: `${slug}-${businessId.slice(-4)}`,
        businessId,
        displayName: input.name,
        bio: 'Agenda fácil con AgendaLibre.',
        niche,
        address: 'Santiago, Chile',
        coverEmoji: niche === 'barber' ? '💈' : niche === 'health' ? '🩺' : '✨',
        coverColor: '#06C167',
        showPrices: true,
        showTeam: input.role === 'empresa',
        bookingPath: `/v/${slug}-${businessId.slice(-4)}`,
      });
    } else {
      clientId = generateId('cli');
    }

    const created = authRepository.create({
      id: generateId('usr'),
      email: input.email,
      password: input.password,
      name: input.name,
      role: input.role,
      businessId,
      professionalId,
      clientId,
    });
    return sessionFor(created);
  },

  me(userId: string): AuthUser {
    const u = authRepository.findById(userId);
    if (!u) throw AppError.notFound('User not found');
    return authRepository.toAuthUser(u);
  },
};
