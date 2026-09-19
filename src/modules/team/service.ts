import type { TeamInvite } from '../../contracts/types.js';
import { AppError } from '../../shared/errors.js';
import { generateCode, generateId, nowIso, todayOffset } from '../../shared/ids.js';
import { db } from '../../infrastructure/mock-db/store.js';
import { teamRepository } from './repository.js';

export const teamService = {
  list(businessId?: string | null) {
    return teamRepository.list(businessId ?? undefined);
  },
  create(
    businessId: string,
    createdByProfessionalId: string,
    role: TeamInvite['role'],
    businessName?: string
  ) {
    const biz = db.businesses.find((b) => b.id === businessId);
    return teamRepository.create({
      id: generateId('inv'),
      businessId,
      code: generateCode('TEAM'),
      businessName: businessName ?? biz?.name ?? 'Negocio',
      createdByProfessionalId,
      role,
      status: 'pending',
      expiresAt: todayOffset(14) + 'T23:59:59.000Z',
      createdAt: nowIso(),
    });
  },
  accept(code: string) {
    const inv = teamRepository.getByCode(code);
    if (!inv) throw AppError.notFound('Invite not found');
    if (inv.status !== 'pending') throw AppError.conflict('Invite not pending');
    return teamRepository.update(inv.id, { status: 'accepted' })!;
  },
  revoke(id: string) {
    const inv = teamRepository.get(id);
    if (!inv) throw AppError.notFound('Invite not found');
    return teamRepository.update(id, { status: 'revoked' })!;
  },
  remove(id: string) {
    if (!teamRepository.remove(id)) throw AppError.notFound('Invite not found');
  },
};
