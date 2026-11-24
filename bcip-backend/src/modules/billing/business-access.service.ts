import { prisma } from '../../config/database';
import {
    resolveBusinessPlanAccess,
    type BusinessPlanAccess,
} from './business-plans';
import { Prisma } from '@prisma/client';

function toFeatureMap(value: Prisma.JsonValue): Record<string, boolean> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(
        Object.entries(value).filter((entry): entry is [string, boolean] =>
            typeof entry[1] === 'boolean',
        ),
    );
}

export async function getBusinessPlanAccess(
    tenantId: string,
    now: Date = new Date(),
): Promise<BusinessPlanAccess> {
    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
            subscriptionStatus: true,
            subscriptionPlan: true,
            subscriptionCurrentPeriodEnd: true,
            businessTrial: {
                select: {
                    acceptedAt: true,
                    expiresAt: true,
                    plan: true,
                },
            },
        },
    });

    if (!tenant) {
        return resolveBusinessPlanAccess({
            subscriptionStatus: null,
            subscriptionPlan: null,
            subscriptionCurrentPeriodEnd: null,
            trial: null,
            now,
        });
    }

    const access = resolveBusinessPlanAccess({
        subscriptionStatus: tenant.subscriptionStatus,
        subscriptionPlan: tenant.subscriptionPlan,
        subscriptionCurrentPeriodEnd: tenant.subscriptionCurrentPeriodEnd,
        trial: tenant.businessTrial,
        now,
    });
    const status = tenant.subscriptionStatus?.toLowerCase();
    const subscriptionActive = ['active', 'trialing', 'demo_active'].includes(status ?? '') &&
        (!tenant.subscriptionCurrentPeriodEnd || tenant.subscriptionCurrentPeriodEnd > now);
    const candidatePlan = subscriptionActive
        ? tenant.subscriptionPlan
        : access.trial?.active
            ? tenant.businessTrial?.plan
            : null;
    const planSlug = access.plan ?? candidatePlan;
    if (!planSlug) return access;

    const plan = await prisma.businessPlan.findUnique({
        where: { slug: planSlug },
        select: {
            slug: true,
            features: true,
            complaintLimit: true,
            teamMemberLimit: true,
            aiAnalysisLimit: true,
            storageLimitMb: true,
        },
    });
    if (!plan) return access;

    return {
        ...access,
        active: access.active || Boolean(candidatePlan),
        plan: plan.slug,
        source: access.source ?? (subscriptionActive ? 'subscription' : candidatePlan ? 'trial' : null),
        features: toFeatureMap(plan.features),
        limits: {
            complaintsPerMonth: plan.complaintLimit,
            teamMembers: plan.teamMemberLimit,
            aiAnalysesPerMonth: plan.aiAnalysisLimit,
            storageMb: plan.storageLimitMb,
        },
    };
}
