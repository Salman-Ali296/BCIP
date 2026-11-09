import { z } from 'zod';
import { emailAddressSchema } from './email-policy';

export const verifyEmailCodeSchema = z.object({
    email: emailAddressSchema,
    code: z.string().regex(/^\d{6}$/, 'Verification code must be 6 digits'),
});

export type VerifyEmailCodeDto = z.infer<typeof verifyEmailCodeSchema>;
