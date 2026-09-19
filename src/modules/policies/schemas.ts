import { z } from 'zod';

export const updateSchema = z.object({
  cancelBeforeHours: z.number().int().nonnegative().optional(),
  depositPercentDefault: z.number().nullable().optional(),
  noShowFeePercent: z.number().nullable().optional(),
  noShowFeeFixedClp: z.number().int().nullable().optional(),
  keepDepositOnNoShow: z.boolean().optional(),
  policyText: z.string().optional(),
});
