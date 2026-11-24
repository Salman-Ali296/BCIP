import { z } from 'zod';
import { emailAddressSchema, isDisposableEmailAddress, isPersonalEmailAddress } from './email-policy';

const httpUrlSchema = z.string().url().refine(value => {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:') &&
        !url.username &&
        !url.password;
}, 'Use a valid HTTP or HTTPS URL');

export const registerSchema = z.object({
    accountType: z.enum(['CUSTOMER', 'BUSINESS', 'EMPLOYEE', 'ESCALATION_AGENT']),
    businessName: z.string().trim().min(3, "Business name must be at least 3 characters").optional(),
    workspaceName: z.string().trim().min(3).max(120).optional(),
    email: emailAddressSchema,
    password: z.string().min(12, "Password must be at least 12 characters").max(128),
    fullName: z.string().trim().min(3, "Full name must be at least 3 characters"),
    phone: z.string().trim().min(7).max(30),
    termsAccepted: z.literal(true).optional(),
    privacyPolicyAccepted: z.literal(true).optional(),
    industry: z.string().max(120).optional(),
    teamSize: z.string().max(50).optional(),
    timezone: z.string().max(100).optional(),
    website: httpUrlSchema.optional(),
    documents: z.array(z.object({
        documentType: z.string().min(2).max(80),
        fileName: z.string().min(1).max(255),
        fileUrl: httpUrlSchema,
        metadata: z.record(z.string(), z.unknown()).optional(),
    })).max(10).default([]),
    policies: z.array(z.object({
        name: z.string().min(2).max(120),
        version: z.string().min(1).max(40),
        content: z.string().min(1),
        effectiveAt: z.coerce.date().optional(),
    })).default([]),
}).superRefine((data, context) => {
    if (data.accountType !== 'BUSINESS') {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['accountType'],
            message: 'Only business accounts can register. Customers can use the public complaint portal without an account.',
        });
    }
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
    if (data.accountType === 'BUSINESS') {
        if (data.termsAccepted !== true) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['termsAccepted'],
                message: 'Accept the Terms of Service to register',
            });
        }
        if (data.privacyPolicyAccepted !== true) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['privacyPolicyAccepted'],
                message: 'Accept the Privacy Policy to register',
            });
        }
    }
    data.documents.forEach((document, index) => {
        if (document.documentType !== 'BUSINESS_REGISTRATION') {
            return;
        }

        if (!/^https:\/\//i.test(document.fileUrl)) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['documents', index, 'fileUrl'],
                message: 'Business registration evidence must use HTTPS',
            });
        }
        if (
            typeof document.metadata?.businessAddress !== 'string' ||
            document.metadata.businessAddress.trim().length < 5
        ) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['documents', index, 'metadata', 'businessAddress'],
                message: 'A registered business address is required',
            });
        }
        if (
            typeof document.metadata?.registrationNumber !== 'string' ||
            document.metadata.registrationNumber.trim().length < 3
        ) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['documents', index, 'metadata', 'registrationNumber'],
                message: 'A business registration number is required',
            });
        }
    });
    // Staff accounts are created through tenant invitations, never public signup.
});

export type RegisterDto = z.infer<typeof registerSchema>;
