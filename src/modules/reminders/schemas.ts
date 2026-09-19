import { z } from 'zod';

export const createJobSchema = z.object({
  appointmentId: z.string(),
  templateId: z.string(),
  channel: z.enum(['whatsapp', 'sms', 'email']).optional(),
  scheduledFor: z.string().optional(),
});

export const updateTemplateSchema = z.object({
  kind: z
    .enum(['confirm', 'reminder_24h', 'reminder_2h', 'noshow_followup'])
    .optional(),
  channel: z.enum(['whatsapp', 'sms', 'email']).optional(),
  body: z.string().min(1).optional(),
});
