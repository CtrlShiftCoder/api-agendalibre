import type { Appointment } from '../../contracts/types.js';
import { db } from '../../infrastructure/mock-db/store.js';

export const appointmentsRepository = {
  list(businessId?: string, filters?: { date?: string; clientId?: string }): Appointment[] {
    let rows = [...db.appointments];
    if (businessId) rows = rows.filter((r) => r.businessId === businessId);
    if (filters?.date) rows = rows.filter((r) => r.date === filters.date);
    if (filters?.clientId) rows = rows.filter((r) => r.clientId === filters.clientId);
    return rows;
  },
  get(id: string) {
    return db.appointments.find((r) => r.id === id);
  },
  create(row: Appointment) {
    db.appointments.push(row);
    return row;
  },
  update(id: string, patch: Partial<Appointment>) {
    const i = db.appointments.findIndex((r) => r.id === id);
    if (i < 0) return undefined;
    db.appointments[i] = { ...db.appointments[i]!, ...patch, id };
    return db.appointments[i];
  },
};
