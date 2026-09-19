import type { Client } from '../../contracts/types.js';
import { db } from '../../infrastructure/mock-db/store.js';

export const clientsRepository = {
  list(businessId?: string): Client[] {
    let rows = [...db.clients];
    if (businessId) rows = rows.filter((r) => r.businessId === businessId);
    return rows;
  },
  get(id: string) {
    return db.clients.find((r) => r.id === id);
  },
  create(row: Client) {
    db.clients.push(row);
    return row;
  },
  update(id: string, patch: Partial<Client>) {
    const i = db.clients.findIndex((r) => r.id === id);
    if (i < 0) return undefined;
    db.clients[i] = { ...db.clients[i]!, ...patch, id };
    return db.clients[i];
  },
  remove(id: string) {
    const before = db.clients.length;
    db.clients = db.clients.filter((r) => r.id !== id);
    return db.clients.length < before;
  },
};
