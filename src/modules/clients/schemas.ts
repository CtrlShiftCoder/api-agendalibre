import { z } from 'zod';

export const createSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  notes: z.string().optional(),
  email: z.string().email().optional(),
  tags: z.array(z.string()).optional(),
  noShowCount: z.number().int().optional(),
  completedCount: z.number().int().optional(),
  lastVisitAt: z.string().optional(),
  riskFlag: z.enum(['ok', 'watch', 'high']).optional(),
});

export const updateSchema = createSchema.partial();
