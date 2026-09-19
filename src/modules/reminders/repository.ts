import type { ReminderJob, ReminderTemplate } from '../../contracts/types.js';
import { db } from '../../infrastructure/mock-db/store.js';

export const remindersRepository = {
  templates(businessId?: string) {
    let rows = [...db.reminderTemplates];
    if (businessId) rows = rows.filter((t) => t.businessId === businessId);
    return rows;
  },
  jobs(businessId?: string) {
    let rows = [...db.reminderJobs];
    if (businessId) rows = rows.filter((j) => j.businessId === businessId);
    return rows;
  },
  getTemplate(id: string) {
    return db.reminderTemplates.find((t) => t.id === id);
  },
  updateTemplate(id: string, patch: Partial<ReminderTemplate>) {
    const i = db.reminderTemplates.findIndex((t) => t.id === id);
    if (i < 0) return undefined;
    db.reminderTemplates[i] = { ...db.reminderTemplates[i]!, ...patch, id };
    return db.reminderTemplates[i];
  },
  createJob(job: ReminderJob) {
    db.reminderJobs.push(job);
    return job;
  },
};
