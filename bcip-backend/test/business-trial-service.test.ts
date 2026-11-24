import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import { prisma } from '../src/config/database';
import { BusinessTrialService } from '../src/modules/accounts/business-trial.service';

function mockMethod<Arguments extends unknown[], Result>(
    context: TestContext,
    target: object,
    methodName: string,
    implementation: (...args: Arguments) => Result,
): void {
    const original = Object.getOwnPropertyDescriptor(target, methodName);
    Object.defineProperty(target, methodName, {
        configurable: true,
        writable: true,
        value: (...args: Arguments) => implementation(...args),
    });
    context.after(() => {
        if (original) Object.defineProperty(target, methodName, original);
        else Reflect.deleteProperty(target, methodName);
    });
}

test('accepting a trial stores Starter as the workspace access plan', async (t) => {
    let userQuery = 0;
    let createdTrial: {
        acceptedAt: Date;
        expiresAt: Date;
        plan: string;
    } | null = null;

    mockMethod(t, prisma.user, 'findUnique', async () => {
        userQuery += 1;
        if (userQuery === 1) {
            return {
                id: 'business-admin',
                accountType: 'BUSINESS',
                role: 'BUSINESS_ADMIN',
                tenantId: 'tenant-trial',
            } as never;
        }
        return {
            accountType: 'BUSINESS',
            role: 'BUSINESS_ADMIN',
            tenant: {
                id: 'tenant-trial',
                name: 'Trial business',
                slug: 'trial-business',
                isActive: true,
                businessVerified: true,
                complaintChannel: null,
                onboardingCompletedAt: null,
                subscriptionStatus: null,
                subscriptionPlan: null,
                subscriptionCurrentPeriodEnd: null,
                subscriptionCancelAtPeriodEnd: false,
                businessTrial: createdTrial,
            },
        } as never;
    });
    mockMethod(t, prisma.tenant, 'findUnique', async () => ({
        businessVerified: true,
        isActive: true,
        subscriptionStatus: null,
        subscriptionPlan: null,
        businessTrial: createdTrial,
    }) as never);
    mockMethod(t, prisma.businessPlan, 'findUnique', async () => ({
        slug: 'starter',
        features: {
            complaint_management: true,
            complaint_portal: true,
            resolution_management: true,
        },
        complaintLimit: 200,
        teamMemberLimit: 3,
        aiAnalysisLimit: 100,
        storageLimitMb: 2048,
    }) as never);
    mockMethod(t, prisma.businessTrial, 'findUnique', async () => null as never);
    mockMethod(
        t,
        prisma.businessTrial,
        'create',
        async (args: {
            data: {
                acceptedAt: Date;
                expiresAt: Date;
                plan: string;
            };
        }) => {
            createdTrial = args.data;
            return createdTrial as never;
        },
    );

    const status = await new BusinessTrialService().accept('business-admin');

    assert.equal(createdTrial?.plan, 'starter');
    assert.equal(status.trial?.plan, 'starter');
    assert.equal(status.access.features?.complaint_management, true);
});

test('a paid business can finish workspace onboarding without creating a trial', async (t) => {
    let userQuery = 0;
    mockMethod(t, prisma.user, 'findUnique', async () => {
        userQuery += 1;
        if (userQuery === 1) {
            return {
                id: 'business-admin',
                accountType: 'BUSINESS',
                role: 'BUSINESS_ADMIN',
                tenantId: 'tenant-paid',
            } as never;
        }
        return {
            accountType: 'BUSINESS',
            role: 'BUSINESS_ADMIN',
            tenant: {
                id: 'tenant-paid',
                name: 'Paid business',
                slug: 'paid-business',
                isActive: true,
                businessVerified: true,
                complaintChannel: 'WEB_PORTAL',
                onboardingCompletedAt: new Date(),
                subscriptionStatus: 'active',
                subscriptionPlan: 'starter',
                subscriptionCurrentPeriodEnd: null,
                subscriptionCancelAtPeriodEnd: false,
                businessTrial: null,
            },
        } as never;
    });
    mockMethod(t, prisma.tenant, 'findUnique', async () => ({
        subscriptionStatus: 'active',
        subscriptionPlan: 'starter',
        businessTrial: null,
    }) as never);
    mockMethod(t, prisma.businessPlan, 'findUnique', async () => ({
        slug: 'starter',
        features: {
            complaint_management: true,
            complaint_portal: true,
            resolution_management: true,
        },
        complaintLimit: 200,
        teamMemberLimit: 3,
        aiAnalysisLimit: 100,
        storageLimitMb: 2048,
    }) as never);

    let updatedWhere: Record<string, unknown> | undefined;
    let updatedData: Record<string, unknown> | undefined;
    mockMethod(
        t,
        prisma.tenant,
        'updateMany',
        async (args: {
            where: Record<string, unknown>;
            data: Record<string, unknown>;
        }) => {
            updatedWhere = args.where;
            updatedData = args.data;
            return { count: 1 } as never;
        },
    );

    const status = await new BusinessTrialService().completeOnboarding('business-admin');

    assert.deepEqual(updatedWhere, {
        id: 'tenant-paid',
        onboardingCompletedAt: null,
    });
    assert.equal(updatedData?.complaintChannel, 'WEB_PORTAL');
    assert.ok(updatedData?.onboardingCompletedAt instanceof Date);
    assert.equal(status.onboardingComplete, true);
    assert.equal(status.trial, null);
});
