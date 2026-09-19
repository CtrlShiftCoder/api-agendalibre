import type { WaitlistEntry } from '../../contracts/types.js';
import { db } from '../../infrastructure/mock-db/store.js';

export const waitlistRepository = {
  list(businessId?: string) {
    let rows = [...db.waitlist];
    if (businessId) rows = rows.filter((r) => r.businessId === businessId);
    return rows;
  },
  get(id: string) {
    return db.waitlist.find((r) => r.id === id);
  },
  create(row: WaitlistEntry) {
    db.waitlist.push(row);
    return row;
  },
  update(id: string, patch: Partial<WaitlistEntry>) {
    const i = db.waitlist.findIndex((r) => r.id === id);
    if (i < 0) return undefined;
    db.waitlist[i] = { ...db.waitlist[i]!, ...patch, id };
    return db.waitlist[i];
  },
};
