import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { Errors } from '../../utils/error';
import { getBusinessPlanAccess } from '../billing/business-access.service';
import {
    createBusinessTrialPeriod,
    getBusinessTrialState,
} from './trial-policy';

const BUSINESS_ROLES = [
    'BUSINESS_ADMIN',
    'MANAGER',
    'AGENT',
    'ESCALATION_AGENT',
] as const;

export class BusinessTrialService {
    async getStatus(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                accountType: true,
                role: true,
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        isActive: true,
                        businessVerified: true,
                        complaintChannel: true,
                        onboardingCompletedAt: true,
                        subscriptionStatus: true,
                        subscriptionPlan: true,
                        subscriptionCurrentPeriodEnd: true,
                        subscriptionCancelAtPeriodEnd: true,
                        businessTrial: {
                            select: {
                                acceptedAt: true,
                                expiresAt: true,
                                plan: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) throw Errors.notFound('Account');
        if (!BUSINESS_ROLES.includes(user.role as (typeof BUSINESS_ROLES)[number])) {
            throw Errors.forbidden('Business plan access is only available to business accounts');
        }

        const { tenant } = user;
        const access = await getBusinessPlanAccess(tenant.id);
        const isBusinessAdmin =
            user.accountType === 'BUSINESS' && user.role === 'BUSINESS_ADMIN';

        return {
            tenant: {
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
            },
            canAcceptTrial: Boolean(
                isBusinessAdmin &&
                tenant.isActive &&
                tenant.businessVerified &&
                !tenant.businessTrial &&
                access.source !== 'subscription',
            ),
            onboardingComplete: Boolean(tenant.onboardingCompletedAt),
            complaintChannel: tenant.complaintChannel,
            complaintPortalUrl: tenant.complaintChannel === 'WEB_PORTAL'
                ? `/support/${encodeURIComponent(tenant.slug)}/complaint`
                : null,
            trial: tenant.businessTrial
                ? getBusinessTrialState(tenant.businessTrial)
                : null,
            subscription: {
                status: tenant.subscriptionStatus,
                plan: tenant.subscriptionPlan,
                currentPeriodEnd: tenant.subscriptionCurrentPeriodEnd,
                cancelAtPeriodEnd: tenant.subscriptionCancelAtPeriodEnd,
            },
            access: {
                active: access.active,
                plan: access.plan,
                source: access.source,
                features: access.features,
            },
        };
    }

    async accept(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, accountType: true, role: true, tenantId: true },
        });

        if (!user) throw Errors.notFound('Account');
        if (user.accountType !== 'BUSINESS' || user.role !== 'BUSINESS_ADMIN') {
            throw Errors.forbidden('Only a business administrator can accept the trial');
        }

        const tenant = await prisma.tenant.findUnique({
            where: { id: user.tenantId },
            select: { businessVerified: true, isActive: true },
        });
        if (!tenant?.businessVerified || !tenant.isActive) {
            throw Errors.businessVerificationPending();
        }

        const existingTrial = await prisma.businessTrial.findUnique({
            where: { tenantId: user.tenantId },
            select: { acceptedAt: true, expiresAt: true, plan: true },
        });
        if (existingTrial) {
            if (getBusinessTrialState(existingTrial).active) {
                return this.getStatus(user.id);
            }
            throw Errors.forbidden('This business workspace has already used its 14-day trial');
        }

        const access = await getBusinessPlanAccess(user.tenantId);
        if (access.source === 'subscription') {
            throw Errors.forbidden('Your business already has an active paid subscription');
        }

        const period = createBusinessTrialPeriod(new Date());
        try {
            await prisma.businessTrial.create({
                data: {
                    tenantId: user.tenantId,
                    acceptedByUserId: user.id,
                    acceptedAt: period.acceptedAt,
                    expiresAt: period.expiresAt,
                    plan: 'starter',
                },
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                const concurrentTrial = await prisma.businessTrial.findUnique({
                    where: { tenantId: user.tenantId },
                    select: { acceptedAt: true, expiresAt: true, plan: true },
                });
                if (concurrentTrial && getBusinessTrialState(concurrentTrial).active) {
                    return this.getStatus(user.id);
                }
                throw Errors.forbidden('This business workspace has already used its 14-day trial');
            }
            throw error;
        }

        return this.getStatus(user.id);
    }

    async completeOnboarding(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, accountType: true, role: true, tenantId: true },
        });
        if (!user) throw Errors.notFound('Account');
        if (user.accountType !== 'BUSINESS' || user.role !== 'BUSINESS_ADMIN') {
            throw Errors.forbidden('Only a business administrator can configure the complaint channel');
        }

        const access = await getBusinessPlanAccess(user.tenantId);
        if (!access.active) {
            throw Errors.forbidden('An active business trial or subscription is required to complete onboarding');
        }

        const configuredAt = new Date();
        await prisma.tenant.updateMany({
            where: {
                id: user.tenantId,
                onboardingCompletedAt: null,
            },
            data: {
                complaintChannel: 'WEB_PORTAL',
                channelConfiguredAt: configuredAt,
                onboardingCompletedAt: configuredAt,
            },
        });

        return this.getStatus(user.id);
    }
}

export const businessTrialService = new BusinessTrialService();
