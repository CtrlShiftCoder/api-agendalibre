import { z } from 'zod';

export const createSchema = z.object({
  professionalId: z.string().nullable().optional(),
  title: z.string().min(1),
  caption: z.string().optional(),
  imageUri: z.string().nullable().optional(),
  placeholderColor: z.string().default('#06C167'),
  emoji: z.string().default('📷'),
  serviceId: z.string().nullable().optional(),
  visible: z.boolean().optional(),
});

export const updateSchema = createSchema.partial();
