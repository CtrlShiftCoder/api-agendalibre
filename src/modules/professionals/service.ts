import type { Professional } from '../../contracts/types.js';
import { AppError } from '../../shared/errors.js';
import { generateId } from '../../shared/ids.js';
import { professionalsRepository } from './repository.js';

export const professionalsService = {
  list(businessId?: string | null) {
    return professionalsRepository.list(businessId ?? undefined);
  },
  get(id: string) {
    const row = professionalsRepository.get(id);
    if (!row) throw AppError.notFound('Professional not found');
    return row;
  },
  create(
    businessId: string,
    input: Omit<Professional, 'id' | 'businessId' | 'active'> & { active?: boolean }
  ) {
    return professionalsRepository.create({
      id: generateId('pro'),
      businessId,
      name: input.name,
      role: input.role,
      teamRole: input.teamRole,
      phone: input.phone,
      active: input.active ?? true,
      color: input.color,
      workStart: input.workStart,
      workEnd: input.workEnd,
    });
  },
  update(id: string, patch: Partial<Professional>) {
    const row = professionalsRepository.update(id, patch);
    if (!row) throw AppError.notFound('Professional not found');
    return row;
  },
  remove(id: string) {
    if (!professionalsRepository.remove(id)) throw AppError.notFound('Professional not found');
  },
};
