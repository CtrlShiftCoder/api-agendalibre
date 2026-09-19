import type { Review } from '../../contracts/types.js';
import { db } from '../../infrastructure/mock-db/store.js';

export const reviewsRepository = {
  list(businessId?: string, visibleOnly = false) {
    let rows = [...db.reviews];
    if (businessId) rows = rows.filter((r) => r.businessId === businessId);
    if (visibleOnly) rows = rows.filter((r) => r.visible);
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  get(id: string) {
    return db.reviews.find((r) => r.id === id);
  },
  create(row: Review) {
    db.reviews.push(row);
    return row;
  },
  update(id: string, patch: Partial<Review>) {
    const i = db.reviews.findIndex((r) => r.id === id);
    if (i < 0) return undefined;
    db.reviews[i] = { ...db.reviews[i]!, ...patch, id };
    return db.reviews[i];
  },
};
