import { z } from 'zod';
import { emailAddressSchema } from './email-policy';

export const forgotPasswordSchema = z.object({
    email: emailAddressSchema,
});

export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
