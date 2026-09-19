import { z } from 'zod';

const depositStatus = z.enum([
  'not_required',
  'pending',
  'paid',
  'refunded',
  'forfeited',
]);
const depositProvider = z.enum(['none', 'flow', 'mercadopago']);

export const createSchema = z.object({
  serviceId: z.string().min(1),
  professionalId: z.string().nullable(),
  clientId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  status: z
    .enum(['confirmada', 'pendiente', 'cancelada', 'completada', 'noshow'])
    .optional(),
  notes: z.string().optional(),
  depositStatus: depositStatus.optional(),
  depositProvider: depositProvider.optional(),
});

export const updateSchema = z.object({
  serviceId: z.string().optional(),
  professionalId: z.string().nullable().optional(),
  clientId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  status: z
    .enum(['confirmada', 'pendiente', 'cancelada', 'completada', 'noshow'])
    .optional(),
  notes: z.string().optional(),
  depositStatus: depositStatus.optional(),
  depositProvider: depositProvider.optional(),
});
