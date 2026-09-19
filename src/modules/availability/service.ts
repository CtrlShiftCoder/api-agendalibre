import type { AvailabilitySlot } from '../../contracts/types.js';
import { AppError } from '../../shared/errors.js';
import { availabilityRepository } from './repository.js';

function toMins(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}
function fromMins(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export const availabilityService = {
  slots(input: {
    date: string;
    serviceId?: string;
    professionalId?: string;
    businessId: string;
  }): AvailabilitySlot[] {
    const biz = availabilityRepository.getBusiness(input.businessId);
    if (!biz) throw AppError.notFound('Business not found');
    const duration = input.serviceId
      ? availabilityRepository.getService(input.serviceId)?.durationMin ?? 30
      : 30;
    if (biz.blockedDates?.includes(input.date)) return [];
    const day = new Date(input.date + 'T12:00:00').getDay();
    if (!biz.hours.days.includes(day)) return [];

    const bizOpen = toMins(biz.hours.open);
    const bizClose = toMins(biz.hours.close);
    const pros = availabilityRepository.professionals(
      input.businessId,
      input.professionalId
    );
    const taken = availabilityRepository.appointmentsOn(
      input.businessId,
      input.date
    );

    const slots: AvailabilitySlot[] = [];
    const step = 30;
    const proList = pros.length ? pros : [null];
    for (const pro of proList) {
      const pid = pro?.id ?? null;
      let open = bizOpen;
      let close = bizClose;
      if (pro?.workStart) open = Math.max(open, toMins(pro.workStart));
      if (pro?.workEnd) close = Math.min(close, toMins(pro.workEnd));
      if (close <= open) continue;

      for (let t = open; t + duration <= close; t += step) {
        const startTime = fromMins(t);
        const endTime = fromMins(t + duration);
        const conflict = taken.some((a) => {
          if (pid && a.professionalId && a.professionalId !== pid) return false;
          const aStart = toMins(a.startTime);
          const aDur =
            availabilityRepository.getService(a.serviceId)?.durationMin ?? 30;
          const aEnd = aStart + aDur;
          return t < aEnd && t + duration > aStart;
        });
        slots.push({
          startTime,
          endTime,
          professionalId: pid,
          available: !conflict,
        });
      }
    }
    return slots;
  },
};
