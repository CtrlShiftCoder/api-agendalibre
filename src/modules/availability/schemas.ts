import { z } from 'zod';

export const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  serviceId: z.string().optional(),
  professionalId: z.string().optional(),
  businessId: z.string().optional(),
});
