import { z } from 'zod';
import { emailAddressSchema } from './email-policy';

export const loginSchema = z.object({
    email: emailAddressSchema,
    password: z.string().min(1, "Password is required"),
});

export type LoginDto = z.infer<typeof loginSchema>;