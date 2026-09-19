import { z } from 'zod';

export const quoteSchema = z.object({
  brutoClp: z.number().nonnegative(),
  year: z.number().int().optional(),
});
