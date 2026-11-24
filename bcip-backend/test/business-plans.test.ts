import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import { prisma } from '../src/config/database';
import { env } from '../src/config/env';
import { createBusinessTrialPeriod } from '../src/modules/accounts/trial-policy';
import {
    createCheckoutSession,
    createDemoCheckout,
    createPortalSession,
    isDemoCheckoutEnabled,
} from '../src/modules/billing/billing.service';
import { listPublicBusinessPlans } from '../src/modules/billing/plan-catalog.service';
import {
    BUSINESS_FEATURE_GROUPS,
    BUSINESS_FEATURES,
    normalizeBusinessPlan,
    resolveBusinessPlanAccess,
} from '../src/modules/billing/business-plans';
import { billingProfileSchema } from '../src/modules/billing/billing-profile.service';
import { AppError } from '../src/utils/error';

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

test('only supported business feature keys are exposed to plan configuration', () => {
    assert.deepEqual(
        Object.keys(BUSINESS_FEATURES),
        [
            'complaint_management',
            'complaint_portal',
            'resolution_management',
            'csat_feedback',
            'ai_triage',
            'duplicate_detection',
            'ai_response_suggestions',
            'team_management',
            'escalations',
            'knowledge_resources',
            'analytics',
            'reports',
            'audit_logs',
            'custom_branding',
            'api_access',
            'priority_support',
        ],
    );
});

test('every business feature belongs to a published comparison group', () => {
    for (const feature of Object.values(BUSINESS_FEATURES)) {
        assert.ok(
            (BUSINESS_FEATURE_GROUPS as readonly string[]).includes(feature.group),
            `${feature.name} has an unknown group`,
        );
    }
});

const billingProfile = {
    companyName: 'Apex Enterprise Solutions (Pvt) Ltd',
    contactName: 'Ayesha Khan',
    billingEmail: 'billing@apex.example',
    phone: null,
    addressLine1: '12 Main Boulevard',
    addressLine2: null,
    city: 'Lahore',
    state: null,
    postalCode: '54000',
    country: 'PK',
    taxId: null,
    updatedAt: new Date('2026-11-22T00:00:00.000Z'),
};

test('billing details are validated and normalized before they are saved', () => {
    const parsed = billingProfileSchema.parse({
        companyName: ' Apex Enterprise Solutions ',
        contactName: 'Ayesha Khan',
        billingEmail: 'Billing@Apex.example',
        addressLine1: '12 Main Boulevard',
        city: 'Lahore',
        postalCode: '54000',
        country: 'pk',
        taxId: '',
    });
    assert.equal(parsed.companyName, 'Apex Enterprise Solutions');
    assert.equal(parsed.country, 'PK');
    assert.equal(parsed.taxId, null);
    assert.equal(parsed.addressLine2, null);

    assert.equal(billingProfileSchema.safeParse({ ...parsed, country: 'Pakistan' }).success, false);
    assert.equal(billingProfileSchema.safeParse({ ...parsed, cardNumber: '4242' }).success, false);
});

test('paid plan activation requires billing details first', async (t) => {
    const previousNodeEnv = env.NODE_ENV;
    env.NODE_ENV = 'development';
    t.after(() => {
        env.NODE_ENV = previousNodeEnv;
    });
    mockMethod(t, prisma.businessBillingProfile, 'findUnique', async () => null as never);
    let transactionStarted = false;
    mockMethod(t, prisma, '$transaction', async () => {
        transactionStarted = true;
    });

    await assert.rejects(
        createDemoCheckout('tenant-demo', { plan: 'growth', interval: 'month' }),
        (error: unknown) =>
            error instanceof AppError &&
            error.code === 'BILLING_PROFILE_REQUIRED' &&
            error.statusCode === 409,
    );
    assert.equal(transactionStarted, false);
});

test('a priced Enterprise plan is purchasable and shows its positioning', async (t) => {
    const previousNodeEnv = env.NODE_ENV;
    env.NODE_ENV = 'development';
    t.after(() => {
        env.NODE_ENV = previousNodeEnv;
    });
    mockMethod(t, prisma.businessPlan, 'findMany', async () => [{
        slug: 'enterprise',
        name: 'Enterprise',
        audience: 'Multi-department organizations',
        description: 'Unlimited complaint operations',
        currency: 'USD',
        monthlyPriceCents: 24900,
        annualPriceCents: 249000,
        complaintLimit: null,
        teamMemberLimit: null,
        aiAnalysisLimit: null,
        storageLimitMb: 256000,
        retentionDays: null,
        features: { complaint_management: true, audit_logs: true },
    }] as never);

    const [enterprise] = await listPublicBusinessPlans();
    assert.equal(enterprise.contactSales, false);
    assert.equal(enterprise.customPricing, false);
    assert.equal(enterprise.demoCheckoutAvailable, true);
    assert.deepEqual(enterprise.billingIntervals, { month: true, year: true });
    assert.equal(enterprise.pricing.annualDiscountPercent, 17);
    assert.ok(enterprise.highlights.length > 0);
    assert.equal(
        enterprise.featureComparison.find((feature) => feature.id === 'audit_logs')?.included,
        true,
    );
    assert.equal(
        enterprise.featureComparison.find((feature) => feature.id === 'analytics')?.included,
        false,
    );
});

test('business plan normalization accepts supported tiers and legacy aliases', () => {
    assert.equal(normalizeBusinessPlan('GROWTH'), 'growth');
    assert.equal(normalizeBusinessPlan('professional'), 'growth');
    assert.equal(normalizeBusinessPlan('business_growth'), 'business');
    assert.equal(normalizeBusinessPlan('enterprise'), 'enterprise');
    assert.equal(normalizeBusinessPlan(null), null);
});

test('priced plans are available for development demo checkout without Stripe prices', async (t) => {
    const previousNodeEnv = env.NODE_ENV;
    env.NODE_ENV = 'development';
    t.after(() => {
        env.NODE_ENV = previousNodeEnv;
    });

    let catalogQuery: { where?: { slug?: { not?: string } } } | undefined;
    mockMethod(t, prisma.businessPlan, 'findMany', async (query: {
        where?: { slug?: { not?: string } };
    }) => {
        catalogQuery = query;
        return [
        {
            slug: 'starter',
            name: 'Starter',
            audience: 'Small teams',
            description: 'Core complaint handling',
            currency: 'USD',
            monthlyPriceCents: 1900,
            annualPriceCents: 18240,
            complaintLimit: 200,
            teamMemberLimit: 3,
            aiAnalysisLimit: 100,
            storageLimitMb: 2048,
            retentionDays: 90,
            features: {
                complaint_management: true,
                complaint_portal: true,
                resolution_management: true,
            },
        },
        {
            slug: 'enterprise',
            name: 'Enterprise',
            audience: 'Large teams',
            description: 'Custom capacity',
            currency: 'USD',
            monthlyPriceCents: null,
            annualPriceCents: null,
            complaintLimit: null,
            teamMemberLimit: null,
            aiAnalysisLimit: null,
            storageLimitMb: null,
            retentionDays: null,
            features: {
                complaint_management: true,
                complaint_portal: true,
                resolution_management: true,
            },
        },
        ] as never;
    });

    const plans = await listPublicBusinessPlans();
    assert.deepEqual(catalogQuery?.where?.slug, { not: 'business' });
    assert.deepEqual(plans.map((plan) => plan.id), ['starter', 'enterprise']);
    assert.deepEqual(plans[0].billingIntervals, { month: true, year: true });
    assert.equal(plans[0].demoCheckoutAvailable, true);
    assert.deepEqual(plans[1].billingIntervals, { month: false, year: false });
    assert.equal(plans[1].demoCheckoutAvailable, false);
});

test('a newly accepted 14-day trial receives Starter access', () => {
    const acceptedAt = new Date('2026-10-01T00:00:00.000Z');
    const access = resolveBusinessPlanAccess({
        subscriptionStatus: null,
        subscriptionPlan: null,
        trial: createBusinessTrialPeriod(acceptedAt),
        now: new Date('2026-10-02T00:00:00.000Z'),
    });

    assert.deepEqual(
        { active: access.active, plan: access.plan, source: access.source },
        { active: true, plan: 'starter', source: 'trial' },
    );
});

test('an existing business-level trial retains its previous access level', () => {
    const acceptedAt = new Date('2026-10-01T00:00:00.000Z');
    const access = resolveBusinessPlanAccess({
        subscriptionStatus: null,
        subscriptionPlan: null,
        trial: {
            ...createBusinessTrialPeriod(acceptedAt),
            plan: 'business',
        },
        now: new Date('2026-10-02T00:00:00.000Z'),
    });

    assert.deepEqual(
        { active: access.active, plan: access.plan, source: access.source },
        { active: true, plan: 'business', source: 'trial' },
    );
});

test('an active subscription remains accessible after trial expiry', () => {
    const acceptedAt = new Date('2026-10-01T00:00:00.000Z');
    const access = resolveBusinessPlanAccess({
        subscriptionStatus: 'active',
        subscriptionPlan: 'growth',
        trial: createBusinessTrialPeriod(acceptedAt),
        now: new Date('2026-10-20T00:00:00.000Z'),
    });

    assert.deepEqual(
        { active: access.active, plan: access.plan, source: access.source },
        { active: true, plan: 'growth', source: 'subscription' },
    );
});

test('a demo subscription grants its selected plan ahead of a Starter trial', () => {
    const acceptedAt = new Date('2026-10-01T00:00:00.000Z');
    const access = resolveBusinessPlanAccess({
        subscriptionStatus: 'demo_active',
        subscriptionPlan: 'growth',
        trial: createBusinessTrialPeriod(acceptedAt),
        now: new Date('2026-10-02T00:00:00.000Z'),
    });

    assert.deepEqual(
        { active: access.active, plan: access.plan, source: access.source },
        { active: true, plan: 'growth', source: 'subscription' },
    );
});

test('canceled subscriptions and unknown plans do not grant paid access', () => {
    for (const input of [
        { subscriptionStatus: 'canceled', subscriptionPlan: 'starter' },
        { subscriptionStatus: 'active', subscriptionPlan: 'unknown-plan' },
    ]) {
        const access = resolveBusinessPlanAccess({
            ...input,
            trial: null,
        });
        assert.equal(access.active, false);
        assert.equal(access.plan, null);
    }
});

test('an expired paid period does not grant active access', () => {
    const access = resolveBusinessPlanAccess({
        subscriptionStatus: 'active',
        subscriptionPlan: 'starter',
        subscriptionCurrentPeriodEnd: new Date('2026-10-01T00:00:00.000Z'),
        trial: null,
        now: new Date('2026-10-02T00:00:00.000Z'),
    });
    assert.equal(access.active, false);
});

test('checkout cannot create a second active paid subscription', async (t) => {
    const previousPrice = env.STRIPE_PRICES.business.month;
    env.STRIPE_PRICES.business.month = 'price_test';
    t.after(() => {
        env.STRIPE_PRICES.business.month = previousPrice;
    });

    mockMethod(t, prisma.tenant, 'findUnique', async () => ({
        isActive: true,
        businessVerified: true,
    }) as never);
    mockMethod(t, prisma, '$queryRaw', async () => [{
        stripeCustomerId: 'customer-one',
        stripeSubscriptionId: 'subscription-one',
        subscriptionStatus: 'active',
        subscriptionPlan: 'growth',
        subscriptionCurrentPeriodEnd: new Date('2027-01-01T00:00:00.000Z'),
        subscriptionCancelAtPeriodEnd: false,
    }] as never);
    mockMethod(t, prisma.businessSubscription, 'findFirst', async () => null as never);

    await assert.rejects(
        createCheckoutSession('tenant-one', { plan: 'business', interval: 'month' }),
        { statusCode: 409 },
    );
});

test('checkout and billing portal cannot be used before business approval', async (t) => {
    mockMethod(t, prisma.tenant, 'findUnique', async () => ({
        isActive: false,
        businessVerified: false,
    }) as never);

    const approvalError = (error: unknown) =>
        error instanceof AppError &&
        error.code === 'BUSINESS_VERIFICATION_PENDING';
    await assert.rejects(
        createCheckoutSession('tenant-pending', { plan: 'starter', interval: 'month' }),
        approvalError,
    );
    await assert.rejects(
        createPortalSession('tenant-pending'),
        approvalError,
    );
});

test('demo checkout activates the chosen plan without a Stripe payment in development', async (t) => {
    const previousNodeEnv = env.NODE_ENV;
    env.NODE_ENV = 'development';
    t.after(() => {
        env.NODE_ENV = previousNodeEnv;
    });

    let updateArgs: Record<string, unknown> | undefined;
    let historyDetails: Record<string, unknown> | undefined;
    mockMethod(t, prisma.businessBillingProfile, 'findUnique', async () => billingProfile as never);
    mockMethod(
        t,
        prisma,
        '$transaction',
        async (callback: (tx: {
            tenant: {
                findUnique: () => Promise<{ subscriptionPlan: null }>;
                updateMany: (args: Record<string, unknown>) => Promise<{ count: number }>;
            };
            businessPlan: { findUnique: () => Promise<{ id: string; isActive: boolean; isPublic: boolean }> };
            businessSubscription: {
                findFirst: () => Promise<null>;
                create: () => Promise<unknown>;
            };
            subscriptionHistory: { create: (args: { data: { details: Record<string, unknown> } }) => Promise<unknown> };
        }) => Promise<unknown>) => callback({
            tenant: {
                findUnique: async () => ({ subscriptionPlan: null }),
                updateMany: async (args) => {
                    updateArgs = args;
                    return { count: 1 };
                },
            },
            businessPlan: {
                findUnique: async () => ({ id: 'plan_growth', isActive: true, isPublic: true }),
            },
            businessSubscription: {
                findFirst: async () => null,
                create: async () => ({}),
            },
            subscriptionHistory: {
                create: async (args) => {
                    historyDetails = args.data.details;
                    return {};
                },
            },
        }),
    );

    const result = await createDemoCheckout('tenant-demo', {
        plan: 'growth',
        interval: 'year',
    });

    assert.equal(isDemoCheckoutEnabled(), true);
    assert.equal((updateArgs?.where as Record<string, unknown> | undefined)?.id, 'tenant-demo');
    assert.equal((updateArgs?.where as Record<string, unknown> | undefined)?.businessVerified, true);
    assert.equal(
        (updateArgs?.data as Record<string, unknown> | undefined)?.subscriptionPlan,
        'growth',
    );
    assert.deepEqual(
        {
            plan: result.plan,
            interval: result.interval,
            mode: result.mode,
            paymentProcessed: result.paymentProcessed,
        },
        {
            plan: 'growth',
            interval: 'year',
            mode: 'demo',
            paymentProcessed: false,
        },
    );
    assert.equal(historyDetails?.billedTo, billingProfile.companyName);
    assert.equal(historyDetails?.billingCountry, 'PK');
});

test('demo checkout is rejected outside development', async (t) => {
    const previousNodeEnv = env.NODE_ENV;
    env.NODE_ENV = 'production';
    t.after(() => {
        env.NODE_ENV = previousNodeEnv;
    });

    assert.equal(isDemoCheckoutEnabled(), false);
    await assert.rejects(
        createDemoCheckout('tenant-demo', { plan: 'starter', interval: 'month' }),
        { statusCode: 403 },
    );
});
