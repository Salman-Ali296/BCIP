import { z } from 'zod';
import { emailAddressSchema } from './email-policy';

export const resendVerificationSchema = z.object({
    email: emailAddressSchema,
});

export type ResendVerificationDto = z.infer<typeof resendVerificationSchema>;
