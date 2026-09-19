import type { Professional } from '../../contracts/types.js';
import { db } from '../../infrastructure/mock-db/store.js';

export const professionalsRepository = {
  list(businessId?: string): Professional[] {
    let rows = [...db.professionals];
    if (businessId) rows = rows.filter((r) => r.businessId === businessId);
    return rows;
  },
  get(id: string) {
    return db.professionals.find((r) => r.id === id);
  },
  create(row: Professional) {
    db.professionals.push(row);
    return row;
  },
  update(id: string, patch: Partial<Professional>) {
    const i = db.professionals.findIndex((r) => r.id === id);
    if (i < 0) return undefined;
    db.professionals[i] = { ...db.professionals[i]!, ...patch, id };
    return db.professionals[i];
  },
  remove(id: string) {
    const before = db.professionals.length;
    db.professionals = db.professionals.filter((r) => r.id !== id);
    return db.professionals.length < before;
  },
};
