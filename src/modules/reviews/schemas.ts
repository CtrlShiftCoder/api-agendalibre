import { z } from 'zod';

export const createSchema = z.object({
  appointmentId: z.string(),
  clientId: z.string(),
  clientName: z.string(),
  professionalId: z.string().nullable().optional(),
  serviceId: z.string().nullable().optional(),
  rating: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  comment: z.string().default(''),
  visible: z.boolean().optional(),
});

export const updateSchema = z.object({
  reply: z.string().nullable().optional(),
  visible: z.boolean().optional(),
  rating: z
    .union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ])
    .optional(),
  comment: z.string().optional(),
});
