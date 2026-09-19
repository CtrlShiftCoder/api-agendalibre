import type { Review } from '../../contracts/types.js';
import { AppError } from '../../shared/errors.js';
import { generateId, nowIso } from '../../shared/ids.js';
import { reviewsRepository } from './repository.js';

export const reviewsService = {
  list(businessId?: string | null, visibleOnly = false) {
    return reviewsRepository.list(businessId ?? undefined, visibleOnly);
  },
  create(
    businessId: string,
    input: {
      appointmentId: string;
      clientId: string;
      clientName: string;
      professionalId?: string | null;
      serviceId?: string | null;
      rating: 1 | 2 | 3 | 4 | 5;
      comment: string;
      visible?: boolean;
    }
  ) {
    return reviewsRepository.create({
      id: generateId('rev'),
      businessId,
      appointmentId: input.appointmentId,
      clientId: input.clientId,
      clientName: input.clientName,
      professionalId: input.professionalId ?? null,
      serviceId: input.serviceId ?? null,
      rating: input.rating,
      comment: input.comment,
      createdAt: nowIso(),
      visible: input.visible ?? true,
    });
  },
  update(id: string, patch: Partial<Review> & { reply?: string | null }) {
    const next: Partial<Review> = { ...patch };
    if (patch.reply !== undefined) {
      next.reply = patch.reply;
      next.replyAt = patch.reply ? nowIso() : null;
    }
    const row = reviewsRepository.update(id, next);
    if (!row) throw AppError.notFound('Review not found');
    return row;
  },
};
