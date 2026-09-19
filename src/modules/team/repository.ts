import type { TeamInvite } from '../../contracts/types.js';
import { db } from '../../infrastructure/mock-db/store.js';

export const teamRepository = {
  list(businessId?: string) {
    let rows = [...db.teamInvites];
    if (businessId) rows = rows.filter((i) => i.businessId === businessId);
    return rows;
  },
  get(id: string) {
    return db.teamInvites.find((i) => i.id === id);
  },
  getByCode(code: string) {
    return db.teamInvites.find((i) => i.code === code);
  },
  create(row: TeamInvite) {
    db.teamInvites.push(row);
    return row;
  },
  update(id: string, patch: Partial<TeamInvite>) {
    const i = db.teamInvites.findIndex((r) => r.id === id);
    if (i < 0) return undefined;
    db.teamInvites[i] = { ...db.teamInvites[i]!, ...patch, id };
    return db.teamInvites[i];
  },
  remove(id: string) {
    const before = db.teamInvites.length;
    db.teamInvites = db.teamInvites.filter((r) => r.id !== id);
    return db.teamInvites.length < before;
  },
};
