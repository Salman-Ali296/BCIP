import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app';
import { env } from '../src/config/env';
import { prisma } from '../src/config/database';

const TEST_SECRET = 'business-dashboard-test-secret-longer-than-thirty-two-characters';

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

function token(role = 'AGENT', tenantId = 'tenant-one'): string {
    return jwt.sign(
        { userId: 'user-one', tenantId, role },
        TEST_SECRET,
        { expiresIn: '1h' },
    );
}

async function withServer(fn: (baseUrl: string) => Promise<void>): Promise<void> {
    const server = createApp().listen(0);
    await new Promise<void>((resolve) => server.once('listening', resolve));
    try {
        const address = server.address();
        assert.ok(address && typeof address !== 'string');
        await fn(`http://127.0.0.1:${address.port}`);
    } finally {
        await new Promise<void>((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
    }
}

function mockDashboardQueries(
    context: TestContext,
    onComplaintFindMany?: (args: {
        where: Record<string, unknown>;
        select?: Record<string, unknown>;
    }) => unknown[],
) {
    const complaintCountWhere: Array<Record<string, unknown>> = [];
    mockMethod(
        context,
        prisma.user,
        'findFirst',
        async () => ({
            id: 'user-one',
            email: 'agent@example.com',
            role: 'AGENT',
            accountType: 'BUSINESS',
            tenantId: 'tenant-one',
            emailVerified: true,
            isActive: true,
            tenant: { isActive: true, businessVerified: true },
        }) as never,
    );
    mockMethod(
        context,
        prisma.complaint,
        'count',
        async (args: { where: Record<string, unknown> }) => {
            complaintCountWhere.push(args.where);
            return 0;
        },
    );
    mockMethod(context, prisma.complaint, 'groupBy', async () => [] as never);
    mockMethod(
        context,
        prisma.complaint,
        'findMany',
        async (args: { where: Record<string, unknown>; select?: Record<string, unknown> }) =>
            (onComplaintFindMany?.(args) ?? []) as never,
    );
    mockMethod(context, prisma, '$queryRaw', async () => [] as never);
    return complaintCountWhere;
}

function mockPlanAccess(
    context: TestContext,
    features: Record<string, boolean> = {
        complaint_management: true,
        complaint_portal: true,
        resolution_management: true,
    },
): void {
    mockMethod(
        context,
        prisma.tenant,
        'findUnique',
        async () => ({
            subscriptionStatus: 'demo_active',
            subscriptionPlan: 'starter',
            subscriptionCurrentPeriodEnd: null,
            businessTrial: null,
        }) as never,
    );
    mockMethod(
        context,
        prisma.businessPlan,
        'findUnique',
        async () => ({
            slug: 'starter',
            features,
            complaintLimit: 200,
            teamMemberLimit: 3,
            aiAnalysisLimit: 100,
            storageLimitMb: 2048,
        }) as never,
    );
}

test('dashboard aggregates are tenant-scoped and agents see only their assigned complaints', async (context) => {
    const previousSecret = env.JWT_SECRET;
    env.JWT_SECRET = TEST_SECRET;
    context.after(() => { env.JWT_SECRET = previousSecret; });
    const complaintCountWhere = mockDashboardQueries(context);
    mockPlanAccess(context);

    await withServer(async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/v1/analytics/dashboard?range=7d`, {
            headers: { Authorization: `Bearer ${token()}` },
        });
        assert.equal(response.status, 200);
        const body = await response.json() as {
            success: boolean;
            data: {
                period: { range: string };
                entitlements: {
                    plan: string;
                    source: string;
                    features: Record<string, boolean>;
                    limits: { complaintsPerMonth: number | null };
                };
                kpis: {
                    totalComplaints: { value: number };
                    workspaceComplaintCount: number;
                    openComplaints: { value: number };
                    highPriorityComplaints: { value: number };
                    averageResolutionHours: number | null;
                };
                sentiment: { sampleSize: number; distribution: unknown[] };
                attention: unknown[];
                recent: { items: unknown[]; total: number };
            };
        };
        assert.equal(body.success, true);
        assert.equal(body.data.period.range, '7d');
        assert.equal(body.data.entitlements.plan, 'starter');
        assert.equal(body.data.entitlements.source, 'subscription');
        assert.equal(body.data.entitlements.features.complaint_management, true);
        assert.equal(body.data.entitlements.limits.complaintsPerMonth, 200);
        assert.equal(body.data.kpis.totalComplaints.value, 0);
        assert.equal(body.data.kpis.workspaceComplaintCount, 0);
        assert.equal(body.data.kpis.openComplaints.value, 0);
        assert.equal(body.data.kpis.highPriorityComplaints.value, 0);
        assert.equal(body.data.kpis.averageResolutionHours, null);
        assert.equal(body.data.sentiment.sampleSize, 0);
        assert.deepEqual(body.data.sentiment.distribution, []);
        assert.deepEqual(body.data.attention, []);
        assert.deepEqual(body.data.recent.items, []);
        assert.equal(body.data.recent.total, 0);
    });

    assert.ok(complaintCountWhere.length > 0);
    for (const where of complaintCountWhere) {
        assert.equal(where.tenantId, 'tenant-one');
        assert.equal(where.assignedToId, 'user-one');
    }
});

test('dashboard rejects invalid custom dates before running complaint queries', async (context) => {
    const previousSecret = env.JWT_SECRET;
    env.JWT_SECRET = TEST_SECRET;
    context.after(() => { env.JWT_SECRET = previousSecret; });
    let complaintQueries = 0;
    mockPlanAccess(context);
    mockMethod(
        context,
        prisma.user,
        'findFirst',
        async () => ({
            id: 'user-one',
            email: 'agent@example.com',
            role: 'AGENT',
            accountType: 'BUSINESS',
            tenantId: 'tenant-one',
            emailVerified: true,
            isActive: true,
            tenant: { isActive: true, businessVerified: true },
        }) as never,
    );
    mockMethod(context, prisma.complaint, 'count', async () => {
        complaintQueries += 1;
        return 0;
    });

    await withServer(async (baseUrl) => {
        const response = await fetch(
            `${baseUrl}/api/v1/analytics/dashboard?range=custom&startDate=2026-02-31&endDate=2026-03-01`,
            { headers: { Authorization: `Bearer ${token()}` } },
        );
        assert.equal(response.status, 400);
        assert.equal(complaintQueries, 0);
    });
});

test('dashboard refuses a client tenant header that conflicts with the authenticated tenant', async (context) => {
    const previousSecret = env.JWT_SECRET;
    env.JWT_SECRET = TEST_SECRET;
    context.after(() => { env.JWT_SECRET = previousSecret; });
    let complaintQueries = 0;
    mockPlanAccess(context);
    mockMethod(
        context,
        prisma.user,
        'findFirst',
        async () => ({
            id: 'user-one',
            email: 'agent@example.com',
            role: 'AGENT',
            accountType: 'BUSINESS',
            tenantId: 'tenant-one',
            emailVerified: true,
            isActive: true,
            tenant: { isActive: true, businessVerified: true },
        }) as never,
    );
    mockMethod(context, prisma.complaint, 'count', async () => {
        complaintQueries += 1;
        return 0;
    });

    await withServer(async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/v1/analytics/dashboard`, {
            headers: {
                Authorization: `Bearer ${token()}`,
                'x-tenant-id': 'tenant-other',
            },
        });
        assert.equal(response.status, 403);
        assert.equal(complaintQueries, 0);
    });
});

test('dashboard rejects tenants without complaint-management entitlement', async (context) => {
    const previousSecret = env.JWT_SECRET;
    env.JWT_SECRET = TEST_SECRET;
    context.after(() => { env.JWT_SECRET = previousSecret; });
    const complaintCountWhere = mockDashboardQueries(context);
    mockPlanAccess(context, {
        complaint_management: false,
        complaint_portal: true,
        resolution_management: true,
    });

    await withServer(async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/v1/analytics/dashboard`, {
            headers: { Authorization: `Bearer ${token()}` },
        });
        assert.equal(response.status, 403);
    });

    assert.equal(complaintCountWhere.length, 0);
});

test('dashboard omits advanced analytics data when the plan does not include analytics', async (context) => {
    const previousSecret = env.JWT_SECRET;
    env.JWT_SECRET = TEST_SECRET;
    context.after(() => { env.JWT_SECRET = previousSecret; });
    mockDashboardQueries(context);
    mockPlanAccess(context);

    await withServer(async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/v1/analytics/dashboard`, {
            headers: { Authorization: `Bearer ${token()}` },
        });
        assert.equal(response.status, 200);
        const body = await response.json() as {
            data: {
                ai: null;
                teamPerformance: null;
                entitlements: { features: Record<string, boolean> };
            };
        };
        assert.equal(body.data.ai, null);
        assert.equal(body.data.teamPerformance, null);
        assert.equal(body.data.entitlements.features.analytics, undefined);
        assert.equal(body.data.entitlements.features.team_management, undefined);
    });
});

test('dashboard filters recent complaints by tenant-owned category and returns its display name', async (context) => {
    const previousSecret = env.JWT_SECRET;
    env.JWT_SECRET = TEST_SECRET;
    context.after(() => { env.JWT_SECRET = previousSecret; });
    const findManyArgs: Array<{
        where: Record<string, unknown>;
        select?: Record<string, unknown>;
    }> = [];
    mockDashboardQueries(context, (args) => {
        findManyArgs.push(args);
        if (!args.select?.category) return [];
        return [{
            id: 'complaint-one',
            trackingId: 'BCIP-123',
            title: 'Billing issue',
            status: 'OPEN',
            priority: 'MEDIUM',
            aiSentiment: null,
            aiCategory: null,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            assignedTo: null,
            customer: null,
            category: { name: 'Billing', tenantId: 'tenant-one' },
        }];
    });
    mockPlanAccess(context);

    await withServer(async (baseUrl) => {
        const response = await fetch(
            `${baseUrl}/api/v1/analytics/dashboard?range=7d&category=Billing`,
            { headers: { Authorization: `Bearer ${token()}` } },
        );
        assert.equal(response.status, 200);
        const body = await response.json() as {
            data: {
                recent: {
                    items: Array<{ categoryName: string | null }>;
                };
            };
        };
        assert.equal(body.data.recent.items[0]?.categoryName, 'Billing');
    });

    const recentQuery = findManyArgs.find((args) => args.select?.category);
    assert.ok(recentQuery);
    const categoryFilter = recentQuery.where.OR as Array<{
        category?: { is?: { tenantId?: string; name?: { equals?: string } } };
    }>;
    assert.equal(categoryFilter[0]?.category?.is?.tenantId, 'tenant-one');
    assert.equal(categoryFilter[0]?.category?.is?.name?.equals, 'Billing');
});
