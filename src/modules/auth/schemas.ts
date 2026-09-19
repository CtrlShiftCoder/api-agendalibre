import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
  roleHint: z.enum(['cliente', 'empresa', 'persona_natural']).optional(),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
  name: z.string().min(1),
  role: z.enum(['cliente', 'empresa', 'persona_natural']),
  niche: z.enum(['barber', 'health', 'beauty', 'other']).optional(),
  phone: z.string().optional(),
});
