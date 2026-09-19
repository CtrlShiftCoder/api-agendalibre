import type { WaitlistEntry } from '../../contracts/types.js';
import { AppError } from '../../shared/errors.js';
import { generateId, nowIso } from '../../shared/ids.js';
import { waitlistRepository } from './repository.js';

export const waitlistService = {
  list(businessId?: string | null) {
    return waitlistRepository.list(businessId ?? undefined);
  },
  create(
    businessId: string,
    input: {
      clientId: string;
      clientName: string;
      clientPhone: string;
      serviceId?: string | null;
      professionalId?: string | null;
      preferredDate?: string | null;
      preferredPeriod?: WaitlistEntry['preferredPeriod'];
      notes?: string;
    }
  ) {
    return waitlistRepository.create({
      id: generateId('wl'),
      businessId,
      clientId: input.clientId,
      clientName: input.clientName,
      clientPhone: input.clientPhone,
      serviceId: input.serviceId ?? null,
      professionalId: input.professionalId ?? null,
      preferredDate: input.preferredDate ?? null,
      preferredPeriod: input.preferredPeriod ?? 'any',
      notes: input.notes,
      status: 'waiting',
      createdAt: nowIso(),
    });
  },
  update(id: string, patch: Partial<WaitlistEntry>) {
    const row = waitlistRepository.update(id, patch);
    if (!row) throw AppError.notFound('Waitlist entry not found');
    return row;
  },
};
