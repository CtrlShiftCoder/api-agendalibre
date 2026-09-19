import type { Appointment, AppointmentStatus } from '../../contracts/types.js';
import { db } from '../../infrastructure/mock-db/store.js';
import { AppError } from '../../shared/errors.js';
import { generateCode, generateId, nowIso } from '../../shared/ids.js';
import { appointmentsRepository } from './repository.js';

function bumpClientCounters(clientId: string, status: AppointmentStatus) {
  const i = db.clients.findIndex((c) => c.id === clientId);
  if (i < 0) return;
  const c = db.clients[i]!;
  if (status === 'completada') {
    c.completedCount += 1;
    c.lastVisitAt = nowIso().slice(0, 10);
  } else if (status === 'noshow') {
    c.noShowCount += 1;
  }
  if (c.noShowCount >= 3) c.riskFlag = 'high';
  else if (c.noShowCount >= 1) c.riskFlag = 'watch';
  else c.riskFlag = 'ok';
}

export const appointmentsService = {
  list(businessId?: string | null, filters?: { date?: string; clientId?: string }) {
    return appointmentsRepository.list(businessId ?? undefined, filters);
  },
  get(id: string) {
    const row = appointmentsRepository.get(id);
    if (!row) throw AppError.notFound('Appointment not found');
    return row;
  },
  create(
    businessId: string,
    input: {
      serviceId: string;
      professionalId: string | null;
      clientId: string;
      date: string;
      startTime: string;
      status?: AppointmentStatus;
      notes?: string;
    }
  ) {
    if (!db.services.some((s) => s.id === input.serviceId)) {
      throw AppError.badRequest('Unknown serviceId');
    }
    if (!db.clients.some((c) => c.id === input.clientId)) {
      throw AppError.badRequest('Unknown clientId');
    }
    return appointmentsRepository.create({
      id: generateId('apt'),
      businessId,
      serviceId: input.serviceId,
      professionalId: input.professionalId,
      clientId: input.clientId,
      date: input.date,
      startTime: input.startTime,
      status: input.status ?? 'confirmada',
      code: generateCode(),
      createdAt: nowIso(),
      notes: input.notes,
    });
  },
  update(id: string, patch: Partial<Appointment>) {
    const prev = appointmentsRepository.get(id);
    if (!prev) throw AppError.notFound('Appointment not found');
    const row = appointmentsRepository.update(id, patch)!;
    if (patch.status && patch.status !== prev.status) {
      bumpClientCounters(row.clientId, patch.status);
    }
    return row;
  },
};
