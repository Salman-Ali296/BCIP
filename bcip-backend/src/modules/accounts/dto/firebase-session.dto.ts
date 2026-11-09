import { z } from 'zod';

export const firebaseSessionSchema = z.object({
    rememberMe: z.boolean().default(false),
});

export const firebaseBootstrapLoginSchema = z.object({
    email: z.string().email().trim().toLowerCase(),
    password: z.string().min(1, 'Password is required'),
});
