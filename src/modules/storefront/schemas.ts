import { z } from 'zod';

export const updateSchema = z.object({
  displayName: z.string().optional(),
  bio: z.string().optional(),
  address: z.string().optional(),
  coverEmoji: z.string().optional(),
  coverColor: z.string().optional(),
  showPrices: z.boolean().optional(),
  showTeam: z.boolean().optional(),
  slug: z.string().optional(),
});
