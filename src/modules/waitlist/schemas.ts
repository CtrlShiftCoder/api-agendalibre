import { z } from 'zod';

export const createSchema = z.object({
  clientId: z.string(),
  clientName: z.string(),
  clientPhone: z.string(),
  serviceId: z.string().nullable().optional(),
  professionalId: z.string().nullable().optional(),
  preferredDate: z.string().nullable().optional(),
  preferredPeriod: z.enum(['morning', 'afternoon', 'any']).optional(),
  notes: z.string().optional(),
});

export const updateSchema = z.object({
  status: z.enum(['waiting', 'notified', 'booked', 'cancelled']).optional(),
  preferredDate: z.string().nullable().optional(),
  preferredPeriod: z.enum(['morning', 'afternoon', 'any']).optional(),
  notes: z.string().optional(),
  serviceId: z.string().nullable().optional(),
  professionalId: z.string().nullable().optional(),
});
