import { db } from '../../infrastructure/mock-db/store.js';

export const cashRepository = {
  appointments(businessId: string, date: string) {
    return db.appointments.filter(
      (a) => a.businessId === businessId && a.date === date
    );
  },
  services(businessId: string) {
    return db.services.filter((s) => s.businessId === businessId);
  },
};
