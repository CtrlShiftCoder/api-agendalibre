import type { DayCashSummary } from '../../contracts/types.js';
import { cashRepository } from './repository.js';

export const cashService = {
  day(
    businessId: string,
    date: string,
    professionalId?: string
  ): DayCashSummary {
    const services = cashRepository.services(businessId);
    const svcMap = new Map(services.map((s) => [s.id, s]));
    let list = cashRepository.appointments(businessId, date);
    if (professionalId) {
      list = list.filter(
        (a) => a.professionalId === professionalId || a.professionalId === null
      );
    }
    let completedCount = 0;
    let cancelledCount = 0;
    let noShowCount = 0;
    let grossClp = 0;
    let depositsHeldClp = 0;
    const byProfessionalId: Record<string, number> = {};

    for (const a of list) {
      const svc = svcMap.get(a.serviceId);
      const price = svc?.priceClp ?? 0;
      const depositPct = svc?.depositPercent ?? null;
      if (a.status === 'completada') {
        completedCount += 1;
        grossClp += price;
        const key = a.professionalId ?? '_unassigned';
        byProfessionalId[key] = (byProfessionalId[key] ?? 0) + price;
      } else if (a.status === 'cancelada') cancelledCount += 1;
      else if (a.status === 'noshow') noShowCount += 1;
      if (a.status !== 'cancelada' && depositPct != null && depositPct > 0) {
        depositsHeldClp += Math.round((price * depositPct) / 100);
      }
    }

    return {
      date,
      currency: 'CLP',
      appointmentsCount: list.length,
      completedCount,
      cancelledCount,
      noShowCount,
      grossClp,
      depositsHeldClp,
      byMethod: {
        cash: Math.round(grossClp * 0.4),
        transfer: Math.round(grossClp * 0.35),
        card: Math.round(grossClp * 0.2),
        other: Math.max(
          0,
          grossClp -
            Math.round(grossClp * 0.4) -
            Math.round(grossClp * 0.35) -
            Math.round(grossClp * 0.2)
        ),
      },
      byProfessionalId,
    };
  },
};
