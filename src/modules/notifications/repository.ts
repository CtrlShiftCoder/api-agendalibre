import type { AppNotification, PushPreference } from '../../contracts/types.js';
import { db } from '../../infrastructure/mock-db/store.js';

const DEFAULT_PUSH: PushPreference = {
  bookingConfirm: true,
  reminder24h: true,
  reminder2h: true,
  waitlistOpen: true,
  reviewRequest: true,
  teamInvite: true,
  marketing: false,
};

export const notificationsRepository = {
  list(userId?: string, businessId?: string) {
    let rows = [...db.notifications];
    if (userId) rows = rows.filter((n) => !n.userId || n.userId === userId);
    if (businessId) rows = rows.filter((n) => !n.businessId || n.businessId === businessId);
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  get(id: string) {
    return db.notifications.find((n) => n.id === id);
  },
  update(id: string, patch: Partial<AppNotification>) {
    const i = db.notifications.findIndex((n) => n.id === id);
    if (i < 0) return undefined;
    db.notifications[i] = { ...db.notifications[i]!, ...patch, id };
    return db.notifications[i];
  },
  markAllRead(userId?: string, businessId?: string) {
    let count = 0;
    for (let i = 0; i < db.notifications.length; i++) {
      const n = db.notifications[i]!;
      if (userId && n.userId && n.userId !== userId) continue;
      if (businessId && n.businessId && n.businessId !== businessId) continue;
      if (!n.read) {
        db.notifications[i] = { ...n, read: true };
        count++;
      }
    }
    return count;
  },
  getPrefs(userId: string): PushPreference {
    return db.pushPreferences[userId] ?? { ...DEFAULT_PUSH };
  },
  setPrefs(userId: string, prefs: PushPreference) {
    db.pushPreferences[userId] = prefs;
    return prefs;
  },
};
