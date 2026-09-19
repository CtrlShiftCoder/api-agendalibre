import { db } from '../../infrastructure/mock-db/store.js';

export const availabilityRepository = {
  getBusiness(id: string) {
    return db.businesses.find((b) => b.id === id);
  },
  getService(id: string) {
    return db.services.find((s) => s.id === id);
  },
  appointmentsOn(businessId: string, date: string) {
    return db.appointments.filter(
      (a) =>
        a.businessId === businessId &&
        a.date === date &&
        a.status !== 'cancelada'
    );
  },
  professionals(businessId: string, professionalId?: string) {
    let rows = db.professionals.filter(
      (p) => p.businessId === businessId && p.active !== false
    );
    if (professionalId) rows = rows.filter((p) => p.id === professionalId);
    return rows;
  },
};
