import type { Service } from '../../contracts/types.js';
import { db } from '../../infrastructure/mock-db/store.js';

export const servicesRepository = {
  list(businessId?: string): Service[] {
    let rows = [...db.services];
    if (businessId) rows = rows.filter((r) => r.businessId === businessId);
    return rows;
  },
  get(id: string) {
    return db.services.find((r) => r.id === id);
  },
  create(row: Service) {
    db.services.push(row);
    return row;
  },
  update(id: string, patch: Partial<Service>) {
    const i = db.services.findIndex((r) => r.id === id);
    if (i < 0) return undefined;
    db.services[i] = { ...db.services[i]!, ...patch, id };
    return db.services[i];
  },
  remove(id: string) {
    const before = db.services.length;
    db.services = db.services.filter((r) => r.id !== id);
    return db.services.length < before;
  },
};
