import type { ReminderJob, ReminderTemplate } from '../../contracts/types.js';
import { AppError } from '../../shared/errors.js';
import { generateId, nowIso } from '../../shared/ids.js';
import { remindersRepository } from './repository.js';

export const remindersService = {
  templates(businessId?: string | null) {
    return remindersRepository.templates(businessId ?? undefined);
  },
  jobs(businessId?: string | null) {
    return remindersRepository.jobs(businessId ?? undefined);
  },
  updateTemplate(id: string, patch: Partial<ReminderTemplate>) {
    const row = remindersRepository.updateTemplate(id, patch);
    if (!row) throw AppError.notFound('Template not found');
    return row;
  },
  createJob(
    businessId: string,
    input: {
      appointmentId: string;
      templateId: string;
      channel?: ReminderJob['channel'];
      scheduledFor?: string;
    }
  ) {
    const tpl = remindersRepository.getTemplate(input.templateId);
    if (!tpl) throw AppError.badRequest('Unknown templateId');
    const job: ReminderJob = {
      id: generateId('job'),
      businessId,
      appointmentId: input.appointmentId,
      templateId: input.templateId,
      channel: input.channel ?? tpl.channel,
      status: 'pending',
      scheduledFor: input.scheduledFor ?? nowIso(),
    };
    // Mock: mark sent immediately
    job.status = 'sent';
    job.sentAt = nowIso();
    return remindersRepository.createJob(job);
  },
};
