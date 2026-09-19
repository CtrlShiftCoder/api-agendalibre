import { z } from 'zod';

export const createInviteSchema = z.object({
  role: z.enum(['trabajador', 'admin']).default('trabajador'),
  businessName: z.string().optional(),
});
