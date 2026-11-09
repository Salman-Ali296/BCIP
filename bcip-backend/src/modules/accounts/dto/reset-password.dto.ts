import { z } from 'zod';

export const resetPasswordSchema = z.object({
    token: z.string().trim().min(1, 'Password reset token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password confirmation is required').optional(),
}).superRefine((data, ctx) => {
    if (data.confirmPassword && data.password !== data.confirmPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['confirmPassword'],
            message: 'Passwords do not match',
        });
    }
});

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
