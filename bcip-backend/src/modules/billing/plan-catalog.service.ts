import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError, ErrorCode } from '../../utils/error';
import {
    BUSINESS_FEATURES,
    BUSINESS_PLAN_PRESENTATION,
    normalizeBusinessPlan,
    type BillingInterval,
    type BusinessFeature,
} from './business-plans';
import { isDemoCheckoutEnabled, isBusinessPlanPriceConfigured } from './billing.service';

function featureMap(value: Prisma.JsonValue): Record<string, boolean> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(
        Object.entries(value).filter((entry): entry is [string, boolean] =>
            typeof entry[1] === 'boolean',
        ),
    );
}

export async function listPublicBusinessPlans() {
    const records = await prisma.businessPlan.findMany({
        where: {
            isActive: true,
            isPublic: true,
            slug: { not: 'business' },
        },
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });

    return Promise.all(records.map(async (plan) => {
        const features = featureMap(plan.features);
        const normalizedPlan = normalizeBusinessPlan(plan.slug);
        const configuredIntervals = await Promise.all(
            (['month', 'year'] as const).map(async (interval: BillingInterval) => {
                if (!normalizedPlan) {
                    return [interval, { available: false, verificationFailed: false }] as const;
                }
                const catalogAmount = interval === 'month'
                    ? plan.monthlyPriceCents
                    : plan.annualPriceCents;
                if (isDemoCheckoutEnabled()) {
                    return [
                        interval,
                        {
                            available: catalogAmount !== null && catalogAmount > 0,
                            verificationFailed: false,
                        },
                    ] as const;
                }
                try {
                    return [
                        interval,
                        {
                            available: await isBusinessPlanPriceConfigured(normalizedPlan, interval),
                            verificationFailed: false,
                        },
                    ] as const;
                } catch (error) {
                    if (
                        isDemoCheckoutEnabled() &&
                        error instanceof AppError &&
                        error.code === ErrorCode.EXTERNAL_SERVICE_ERROR &&
                        error.statusCode >= 500
                    ) {
                        return [
                            interval,
                            { available: false, verificationFailed: true },
                        ] as const;
                    }
                    throw error;
                }
            }),
        );
        const monthly = plan.monthlyPriceCents ?? 0;
        const annual = plan.annualPriceCents ?? 0;
        const annualDiscountPercent = monthly > 0 && annual > 0
            ? Math.max(0, Math.round((1 - annual / (monthly * 12)) * 100))
            : 0;

        const presentation = BUSINESS_PLAN_PRESENTATION[plan.slug];
        const customPricing = plan.monthlyPriceCents === null;

        return {
            id: plan.slug,
            name: plan.name,
            audience: plan.audience,
            summary: plan.description,
            tagline: presentation?.tagline ?? plan.description,
            highlights: presentation?.highlights ?? [],
            featured: presentation?.featured === true,
            trialAvailable: presentation?.trialAvailable === true,
            contactSales: customPricing,
            pricing: {
                currency: plan.currency,
                amountCents: { month: monthly, year: annual },
                annualDiscountPercent,
            },
            limits: {
                complaintsPerMonth: plan.complaintLimit,
                teamMembers: plan.teamMemberLimit,
                aiAnalysesPerMonth: plan.aiAnalysisLimit,
                storageMb: plan.storageLimitMb,
                retentionDays: plan.retentionDays,
            },
            features: Object.entries(BUSINESS_FEATURES)
                .filter(([id]) => features[id])
                .map(([id, feature]) => ({ id, name: feature.name, group: feature.group })),
            featureComparison: (Object.entries(BUSINESS_FEATURES) as Array<
                [BusinessFeature, (typeof BUSINESS_FEATURES)[BusinessFeature]]
            >).map(([id, feature]) => ({
                id,
                name: feature.name,
                group: feature.group,
                included: features[id] === true,
            })),
            billingIntervals: Object.fromEntries(
                configuredIntervals.map(([interval, status]) => [interval, status.available]),
            ),
            billingVerificationFailedIntervals: Object.fromEntries(
                configuredIntervals.map(([interval, status]) => [
                    interval,
                    status.verificationFailed,
                ]),
            ),
            demoCheckoutAvailable: isDemoCheckoutEnabled() && !customPricing,
            customPricing,
        };
    }));
}

export async function getPlanForTenant(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
            subscriptionStatus: true,
            subscriptionPlan: true,
            businessTrial: { select: { plan: true, acceptedAt: true, expiresAt: true } },
            subscriptionCurrentPeriodEnd: true,
        },
    });
    if (!tenant) return null;
    const now = new Date();
    const subscriptionActive = ['active', 'trialing', 'demo_active'].includes(
        tenant.subscriptionStatus?.toLowerCase() ?? '',
    ) && (!tenant.subscriptionCurrentPeriodEnd || tenant.subscriptionCurrentPeriodEnd > now);
    const trialActive = tenant.businessTrial?.acceptedAt &&
        tenant.businessTrial.acceptedAt <= now &&
        tenant.businessTrial.expiresAt > now;
    const slug = subscriptionActive
        ? tenant.subscriptionPlan
        : trialActive
            ? tenant.businessTrial?.plan
            : null;
    if (!tenant || !slug) return null;
    const plan = await prisma.businessPlan.findUnique({
        where: { slug },
        select: {
            id: true,
            slug: true,
            name: true,
            complaintLimit: true,
            teamMemberLimit: true,
            aiAnalysisLimit: true,
            storageLimitMb: true,
            retentionDays: true,
            features: true,
        },
    });
    if (!plan) return null;
    return {
        ...plan,
        features: featureMap(plan.features),
    };
}
