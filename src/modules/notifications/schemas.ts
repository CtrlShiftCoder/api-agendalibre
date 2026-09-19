import { z } from 'zod';

export const preferencesSchema = z.object({
  bookingConfirm: z.boolean().optional(),
  reminder24h: z.boolean().optional(),
  reminder2h: z.boolean().optional(),
  waitlistOpen: z.boolean().optional(),
  reviewRequest: z.boolean().optional(),
  teamInvite: z.boolean().optional(),
  marketing: z.boolean().optional(),
});
