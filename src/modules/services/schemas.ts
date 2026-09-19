import { z } from 'zod';

export const createSchema = z.object({
  name: z.string().min(1),
  durationMin: z.number().int().positive(),
  priceClp: z.number().int().nonnegative(),
  active: z.boolean().optional(),
  depositPercent: z.number().nullable().optional(),
  popular: z.boolean().optional(),
  category: z.enum(['servicio', 'paquete', 'promo']).optional(),
  iconKey: z.enum(['cut', 'spa', 'bolt', 'all']).optional(),
});

export const updateSchema = createSchema.partial();
