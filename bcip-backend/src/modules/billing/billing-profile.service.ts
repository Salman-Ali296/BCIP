import { z } from 'zod';
import { prisma } from '../../config/database';
import { AppError, ErrorCode } from '../../utils/error';
import { emailAddressSchema } from '../accounts/dto/email-policy';

const optionalText = (max: number) =>
    z.string().trim().max(max).optional().transform((value) => value || null);

export const billingProfileSchema = z.object({
    companyName: z.string().trim().min(2, 'Enter the company name for invoices').max(160),
    contactName: z.string().trim().min(2, 'Enter the billing contact name').max(120),
    billingEmail: emailAddressSchema,
    phone: z
        .string()
        .trim()
        .max(30)
        .regex(/^[+()\d.\-\s]*$/, 'Enter a valid phone number')
        .optional()
        .transform((value) => value || null),
    addressLine1: z.string().trim().min(3, 'Enter the street address').max(200),
    addressLine2: optionalText(200),
    city: z.string().trim().min(2, 'Enter the city').max(100),
    state: optionalText(100),
    postalCode: z.string().trim().min(2, 'Enter the postal code').max(20),
    country: z
        .string()
        .trim()
        .length(2, 'Choose a country')
        .regex(/^[A-Za-z]{2}$/, 'Choose a country')
        .transform((value) => value.toUpperCase()),
    taxId: optionalText(40),
}).strict();

export type BillingProfileInput = z.infer<typeof billingProfileSchema>;

export interface BillingProfile {
    companyName: string;
    contactName: string;
    billingEmail: string;
    phone: string | null;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string | null;
    postalCode: string;
    country: string;
    taxId: string | null;
    updatedAt: Date | null;
}

const PROFILE_SELECT = {
    companyName: true,
    contactName: true,
    billingEmail: true,
    phone: true,
    addressLine1: true,
    addressLine2: true,
    city: true,
    state: true,
    postalCode: true,
    country: true,
    taxId: true,
    updatedAt: true,
} as const;

export function billingProfileRequiredError(): AppError {
    return new AppError(
        ErrorCode.BILLING_PROFILE_REQUIRED,
        'Add your billing details before choosing a paid plan.',
        409,
    );
}

export async function findBillingProfile(tenantId: string): Promise<BillingProfile | null> {
    return prisma.businessBillingProfile.findUnique({
        where: { tenantId },
        select: PROFILE_SELECT,
    });
}

export async function requireBillingProfile(tenantId: string): Promise<BillingProfile> {
    const profile = await findBillingProfile(tenantId);
    if (!profile) throw billingProfileRequiredError();
    return profile;
}

/**
 * Returns the saved profile, or a draft prefilled from the workspace identity so the
 * administrator only has to confirm and complete it.
 */
export async function getBillingProfileForTenant(tenantId: string) {
    const saved = await findBillingProfile(tenantId);
    if (saved) return { saved: true as const, profile: saved };

    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
            name: true,
            legalName: true,
            email: true,
            phone: true,
            primaryContactName: true,
            businessAddress: true,
            city: true,
        },
    });
    return {
        saved: false as const,
        profile: {
            companyName: tenant?.legalName || tenant?.name || '',
            contactName: tenant?.primaryContactName || '',
            billingEmail: tenant?.email || '',
            phone: tenant?.phone || null,
            addressLine1: tenant?.businessAddress || '',
            addressLine2: null,
            city: tenant?.city || '',
            state: null,
            postalCode: '',
            country: '',
            taxId: null,
            updatedAt: null,
        } satisfies BillingProfile,
    };
}

export async function saveBillingProfile(
    tenantId: string,
    input: BillingProfileInput,
): Promise<BillingProfile> {
    return prisma.businessBillingProfile.upsert({
        where: { tenantId },
        create: { tenantId, ...input },
        update: input,
        select: PROFILE_SELECT,
    });
}
