import { z } from 'zod';
import { emailAddressSchema } from './email-policy';

const safeUrl = (protocols: string[], message: string) =>
    z.string().trim().max(2048).refine(value => {
        try {
            const url = new URL(value);
            return protocols.includes(url.protocol) && !url.username && !url.password;
        } catch {
            return false;
        }
    }, message);

const httpsUrlSchema = safeUrl(['https:'], 'Use a valid HTTPS URL');
const websiteUrlSchema = safeUrl(['https:', 'http:'], 'Use a valid HTTP or HTTPS website URL');

const phoneSchema = z
    .string()
    .trim()
    .regex(/^\+?[0-9\s\-()]{7,30}$/, 'Use a valid phone number');

// Current email comes from the authenticated session, not the body
export const changeRegistrationEmailSchema = z.object({
    newEmail: emailAddressSchema,
    password: z.string().min(1).max(128),
});

export const updateRegistrationAccountSchema = z.object({
    fullName: z.string().trim().min(2).max(120),
    phone: phoneSchema,
});

export const completeBusinessRegistrationSchema = z.object({
    businessName: z.string().trim().min(3).max(120),
    industry: z.enum([
        'Technology',
        'Software & SaaS',
        'IT Services',
        'Healthcare',
        'Pharmaceuticals',
        'Fitness & Wellness',
        'Finance',
        'Banking',
        'Insurance',
        'Real Estate',
        'Retail',
        'E-commerce',
        'Wholesale & Distribution',
        'Food & Beverage',
        'Restaurants & Cafes',
        'Fashion & Apparel',
        'Beauty & Personal Care',
        'Education',
        'Manufacturing',
        'Construction',
        'Automotive',
        'Agriculture',
        'Energy & Utilities',
        'Telecommunications',
        'Media & Entertainment',
        'Marketing & Advertising',
        'Logistics',
        'Transportation',
        'Hospitality',
        'Travel & Tourism',
        'Legal Services',
        'Consulting & Professional Services',
        'Security Services',
        'Government & Public Sector',
        'Non-Profit',
        'Other',
    ]),
    website: websiteUrlSchema.optional().or(z.literal('')),
    teamSize: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']),
    phone: phoneSchema,
    country: z.string().trim().min(2).max(100),
    city: z.string().trim().min(2).max(100),
    businessAddress: z.string().trim().max(500).optional().or(z.literal('')),
    description: z.string().trim().max(2000).optional().or(z.literal('')),
    registrationNumber: z.string().trim().min(3).max(120).optional().or(z.literal('')),
    evidenceUrl: httpsUrlSchema.optional().or(z.literal('')),
    confirmationAccepted: z.literal(true),
});

export type ChangeRegistrationEmailDto = z.infer<typeof changeRegistrationEmailSchema>;
export type UpdateRegistrationAccountDto = z.infer<typeof updateRegistrationAccountSchema>;
export type CompleteBusinessRegistrationDto = z.infer<typeof completeBusinessRegistrationSchema>;