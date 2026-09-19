import type { Business } from '../../contracts/types.js';
import { db } from '../../infrastructure/mock-db/store.js';

export const businessesRepository = {
  list(): Business[] {
    return [...db.businesses];
  },
  get(id: string): Business | undefined {
    return db.businesses.find((b) => b.id === id);
  },
  getBySlug(slug: string): Business | undefined {
    return db.businesses.find((b) => b.slug === slug);
  },
  create(b: Business): Business {
    db.businesses.push(b);
    return b;
  },
  update(id: string, patch: Partial<Business>): Business | undefined {
    const i = db.businesses.findIndex((b) => b.id === id);
    if (i < 0) return undefined;
    db.businesses[i] = { ...db.businesses[i]!, ...patch, id, updatedAt: new Date().toISOString() };
    return db.businesses[i];
  },
};
