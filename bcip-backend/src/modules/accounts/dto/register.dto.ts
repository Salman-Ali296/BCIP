import { z } from 'zod';
import { emailAddressSchema, isDisposableEmailAddress, isPersonalEmailAddress } from './email-policy';

export const registerSchema = z.object({
    accountType: z.enum(['CUSTOMER', 'BUSINESS', 'EMPLOYEE', 'ESCALATION_AGENT']),
    businessName: z.string().trim().min(3, "Business name must be at least 3 characters").optional(),
    workspaceName: z.string().trim().min(3).max(120).optional(),
    email: emailAddressSchema,
    password: z.string().min(8, "Password must be at least 8 characters"),
    fullName: z.string().trim().min(3, "Full name must be at least 3 characters"),
    phone: z.string().min(7).max(30).optional(),
    industry: z.string().max(120).optional(),
    teamSize: z.string().max(50).optional(),
    timezone: z.string().max(100).optional(),
    website: z.string().url().optional(),
    documents: z.array(z.object({
        documentType: z.string().min(2).max(80),
        fileName: z.string().min(1).max(255),
        fileUrl: z.string().url(),
        metadata: z.record(z.unknown()).optional(),
    })).default([]),
    policies: z.array(z.object({
        name: z.string().min(2).max(120),
        version: z.string().min(1).max(40),
        content: z.string().min(1),
        effectiveAt: z.coerce.date().optional(),
    })).default([]),
}).superRefine((data, context) => {
    if (isDisposableEmailAddress(data.email)) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['email'],
            message: 'Disposable email addresses are not allowed',
        });
    }
    if (data.accountType === 'BUSINESS' && isPersonalEmailAddress(data.email)) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['email'],
            message: 'Use a work email address for business registration',
        });
    }
    if (data.accountType === 'BUSINESS' && !data.businessName) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['businessName'], message: 'Business name is required' });
    }
    if (data.accountType === 'BUSINESS' && !data.industry) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['industry'], message: 'Business industry is required' });
    }
    // EMPLOYEE and ESCALATION_AGENT must be created through tenant invitation only.
    // They are rejected at the service layer with a clear error.
});

export type RegisterDto = z.infer<typeof registerSchema>;
