import { z } from 'zod';

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

function toMins(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export const businessHoursSchema = z
  .object({
    open: z.string().regex(HHMM),
    close: z.string().regex(HHMM),
    days: z.array(z.number().int().min(0).max(6)),
  })
  .refine((h) => toMins(h.close) > toMins(h.open), {
    message: 'close must be after open',
  });

export const createBusinessSchema = z.object({
  name: z.string().min(1),
  niche: z.enum(['barber', 'health', 'beauty', 'other']),
  roleKind: z.enum(['empresa', 'persona_natural']),
  address: z.string().min(1),
  phone: z.string().optional(),
  hours: businessHoursSchema.optional(),
  blockedDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  theme: z.enum(['barber', 'health', 'beauty', 'neutral']).optional(),
  slug: z.string().optional(),
});

export const updateBusinessSchema = createBusinessSchema.partial();
