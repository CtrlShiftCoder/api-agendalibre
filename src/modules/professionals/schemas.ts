import { z } from 'zod';

const hhmm = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'HH:mm')
  .optional();

export const createSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  teamRole: z.enum(['admin', 'trabajador']),
  phone: z.string().optional(),
  active: z.boolean().optional(),
  color: z.string().optional(),
  workStart: hhmm,
  workEnd: hhmm,
});

export const updateSchema = createSchema.partial();
