import type { Client } from '../../contracts/types.js';
import { AppError } from '../../shared/errors.js';
import { generateId } from '../../shared/ids.js';
import { clientsRepository } from './repository.js';

export const clientsService = {
  list(businessId?: string | null) {
    return clientsRepository.list(businessId ?? undefined);
  },
  get(id: string) {
    const row = clientsRepository.get(id);
    if (!row) throw AppError.notFound('Client not found');
    return row;
  },
  create(
    businessId: string,
    input: {
      name: string;
      phone: string;
      notes?: string;
      email?: string;
      tags?: string[];
      noShowCount?: number;
      completedCount?: number;
      lastVisitAt?: string;
      riskFlag?: Client['riskFlag'];
    }
  ) {
    return clientsRepository.create({
      id: generateId('cli'),
      businessId,
      name: input.name,
      phone: input.phone,
      notes: input.notes,
      email: input.email,
      tags: input.tags,
      noShowCount: input.noShowCount ?? 0,
      completedCount: input.completedCount ?? 0,
      lastVisitAt: input.lastVisitAt,
      riskFlag: input.riskFlag ?? 'ok',
    });
  },
  update(id: string, patch: Partial<Client>) {
    const row = clientsRepository.update(id, patch);
    if (!row) throw AppError.notFound('Client not found');
    return row;
  },
  remove(id: string) {
    if (!clientsRepository.remove(id)) throw AppError.notFound('Client not found');
  },
};
