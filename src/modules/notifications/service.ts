import type { PushPreference } from '../../contracts/types.js';
import { AppError } from '../../shared/errors.js';
import { notificationsRepository } from './repository.js';

export const notificationsService = {
  list(userId?: string, businessId?: string | null) {
    return notificationsRepository.list(userId, businessId ?? undefined);
  },
  markRead(id: string) {
    const n = notificationsRepository.update(id, { read: true });
    if (!n) throw AppError.notFound('Notification not found');
    return n;
  },
  markAllRead(userId?: string, businessId?: string | null) {
    const count = notificationsRepository.markAllRead(
      userId,
      businessId ?? undefined
    );
    return { updated: count };
  },
  getPreferences(userId: string) {
    return notificationsRepository.getPrefs(userId);
  },
  updatePreferences(userId: string, patch: Partial<PushPreference>) {
    const current = notificationsRepository.getPrefs(userId);
    return notificationsRepository.setPrefs(userId, { ...current, ...patch });
  },
};
