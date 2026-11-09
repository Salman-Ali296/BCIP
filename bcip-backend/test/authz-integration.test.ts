import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import jwt from 'jsonwebtoken';
import { ComplaintStatus, Priority } from '@prisma/client';
import { createApp } from '../src/app';
import { env } from '../src/config/env';
import { prisma } from '../src/config/database';
import { complaintService } from '../src/services/complaintService';

const TEST_SECRET = 'authz-integration-secret-longer-than-thirty-two-characters';

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

function makeUser(role: string, tenantId = 'tenant-one') {
    return {
        id: 'user-one',
        email: 'customer@example.com',
        role,
        accountType: role === 'CUSTOMER' ? 'CUSTOMER' : 'BUSINESS',
        tenantId,
        emailVerified: true,
        isActive: true,
        tenant: { isActive: true, businessVerified: true },
    };
}

function token(role: string, tenantId = 'tenant-one'): string {
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

function mockAuthenticatedUser(
    context: TestContext,
    role: string,
    tenantId = 'tenant-one',
): void {
    mockMethod(context, prisma.user, 'findFirst', async () =>
        makeUser(role, tenantId) as never,
    );
}

test('protected complaint routes reject missing authentication', async () => {
    await withServer(async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/complaints`);
        assert.equal(response.status, 401);
    });
});

test('customer complaint listing ignores requested tenant and constrains results to verified account email', async (t) => {
    const previousSecret = env.JWT_SECRET;
    env.JWT_SECRET = TEST_SECRET;
    t.after(() => { env.JWT_SECRET = previousSecret; });
    mockAuthenticatedUser(t, 'CUSTOMER');

    let capturedTenantId: string | undefined;
    let capturedEmail: string | undefined;
    mockMethod(t, complaintService, 'listComplaints', async (
        tenantId: string | undefined,
        filters: { customerEmail?: string },
    ) => {
        capturedTenantId = tenantId;
        capturedEmail = filters.customerEmail;
        return { data: [], pagination: { total: 0, page: 1, limit: 20, pages: 0 } };
    });

    await withServer(async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/complaints?tenantId=tenant-other`, {
            headers: { Authorization: `Bearer ${token('CUSTOMER')}` },
        });
        assert.equal(response.status, 200);
    });

    assert.equal(capturedTenantId, undefined);
    assert.equal(capturedEmail, 'customer@example.com');
});

test('customer complaint detail lookup scopes the database query to the verified account email', async (t) => {
    const previousSecret = env.JWT_SECRET;
    env.JWT_SECRET = TEST_SECRET;
    t.after(() => { env.JWT_SECRET = previousSecret; });
    mockAuthenticatedUser(t, 'CUSTOMER');

    let capturedWhere: Record<string, unknown> | undefined;
    mockMethod(t, prisma.complaint, 'findFirst', async (args: { where: Record<string, unknown> }) => {
        capturedWhere = args.where;
        return {
            id: 'complaint-one',
            trackingId: 'COMP-20261023-ABCDEF',
            title: 'Customer complaint',
            description: 'Private customer description',
            status: ComplaintStatus.OPEN,
            priority: Priority.MEDIUM,
            aiCategory: null,
            aiSentiment: null,
            customer: { email: 'customer@example.com', fullName: 'Customer' },
            statusHistory: [],
        } as never;
    });

    await withServer(async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/complaints/complaint-one`, {
            headers: { Authorization: `Bearer ${token('CUSTOMER')}` },
        });
        assert.equal(response.status, 200);
    });

    assert.deepEqual(capturedWhere, {
        id: 'complaint-one',
        customer: { is: { email: 'customer@example.com' } },
    });
});

test('business complaint detail lookup remains restricted to the authenticated tenant', async (t) => {
    const previousSecret = env.JWT_SECRET;
    env.JWT_SECRET = TEST_SECRET;
    t.after(() => { env.JWT_SECRET = previousSecret; });
    mockAuthenticatedUser(t, 'AGENT', 'tenant-one');
    mockMethod(t, prisma.businessTrial, 'findUnique', async () => ({
        acceptedAt: new Date(Date.now() - 60_000),
        expiresAt: new Date(Date.now() + 60_000),
    }) as never);

    let capturedWhere: Record<string, unknown> | undefined;
    mockMethod(t, prisma.complaint, 'findFirst', async (args: { where: Record<string, unknown> }) => {
        capturedWhere = args.where;
        return null as never;
    });

    await withServer(async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/complaints/complaint-other`, {
            headers: { Authorization: `Bearer ${token('AGENT', 'tenant-one')}` },
        });
        assert.equal(response.status, 404);
    });

    assert.deepEqual(capturedWhere, {
        id: 'complaint-other',
        tenantId: 'tenant-one',
    });
});

test('customer role cannot escalate complaints or upload tenant attachments', async (t) => {
    const previousSecret = env.JWT_SECRET;
    env.JWT_SECRET = TEST_SECRET;
    t.after(() => { env.JWT_SECRET = previousSecret; });
    let authenticatedRole = 'CUSTOMER';
    mockMethod(t, prisma.user, 'findFirst', async () =>
        makeUser(authenticatedRole) as never,
    );

    await withServer(async (baseUrl) => {
        const headers = { Authorization: `Bearer ${token('CUSTOMER')}` };
        const escalation = await fetch(`${baseUrl}/api/complaints/complaint-one/escalate`, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: 'test' }),
        });
        const upload = await fetch(`${baseUrl}/api/complaints/complaint-one/upload`, {
            method: 'POST',
            headers,
            body: new FormData(),
        });

        assert.equal(escalation.status, 403);
        assert.equal(upload.status, 403);

        authenticatedRole = 'AGENT';
        const agentEscalation = await fetch(
            `${baseUrl}/api/complaints/complaint-one/escalate`,
            {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: 'supervisor review required' }),
            },
        );
        assert.equal(agentEscalation.status, 403);
    });
});

test('a business tenant header cannot select another tenant', async (t) => {
    const previousSecret = env.JWT_SECRET;
    env.JWT_SECRET = TEST_SECRET;
    t.after(() => { env.JWT_SECRET = previousSecret; });
    mockAuthenticatedUser(t, 'BUSINESS_ADMIN', 'tenant-one');

    await withServer(async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/complaints`, {
            headers: {
                Authorization: `Bearer ${token('BUSINESS_ADMIN', 'tenant-one')}`,
                'x-tenant-id': 'tenant-other',
            },
        });
        assert.equal(response.status, 403);
    });
});

test('administrative routes reject missing authentication and non-admin roles', async (t) => {
    const previousSecret = env.JWT_SECRET;
    env.JWT_SECRET = TEST_SECRET;
    t.after(() => { env.JWT_SECRET = previousSecret; });
    mockAuthenticatedUser(t, 'BUSINESS_ADMIN');

    await withServer(async (baseUrl) => {
        const unauthenticated = await fetch(`${baseUrl}/api/v1/admin/users`);
        const businessUser = await fetch(`${baseUrl}/api/v1/admin/users`, {
            headers: { Authorization: `Bearer ${token('BUSINESS_ADMIN')}` },
        });
        assert.equal(unauthenticated.status, 401);
        assert.equal(businessUser.status, 403);
    });
});

test('versioned internal complaint submission requires an authenticated business user', async (t) => {
    const previousSecret = env.JWT_SECRET;
    env.JWT_SECRET = TEST_SECRET;
    t.after(() => { env.JWT_SECRET = previousSecret; });
    mockAuthenticatedUser(t, 'CUSTOMER');

    await withServer(async (baseUrl) => {
        const unauthenticated = await fetch(`${baseUrl}/api/v1/complaints`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                title: 'Valid internal complaint title',
                description: 'Valid complaint description for testing purposes',
            }),
        });
        const customer = await fetch(`${baseUrl}/api/v1/complaints`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token('CUSTOMER')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customerId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                title: 'Valid internal complaint title',
                description: 'Valid complaint description for testing purposes',
            }),
        });
        assert.equal(unauthenticated.status, 401);
        assert.equal(customer.status, 403);
    });
});

test('public email complaint enumeration is disabled', async () => {
    await withServer(async (baseUrl) => {
        const response = await fetch(
            `${baseUrl}/api/complaints/track/email/customer%40example.com`,
        );
        assert.equal(response.status, 404);
    });
});

test('public tracking response omits description, customer identity, and internal history comments', async (t) => {
    mockMethod(t, complaintService, 'getComplaintByTrackingId', async () => ({
        id: 'complaint-one',
        trackingId: 'COMP-20261023-ABCDEF',
        title: 'Visible title',
        description: 'Private complaint details',
        status: ComplaintStatus.OPEN,
        priority: Priority.MEDIUM,
        aiCategory: 'GENERAL',
        customer: { email: 'private@example.com', fullName: 'Private Name' },
        statusHistory: [{
            id: 'event-one',
            toStatus: ComplaintStatus.OPEN,
            changedAt: new Date('2026-10-23T00:00:00Z'),
            comment: 'Internal staff note',
        }],
    }) as never);

    await withServer(async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/complaints/track/COMP-20261023-ABCDEF`);
        assert.equal(response.status, 200);
        const text = await response.text();
        assert.equal(text.includes('Private complaint details'), false);
        assert.equal(text.includes('private@example.com'), false);
        assert.equal(text.includes('Internal staff note'), false);
    });
});

test('public complaint submissions accept validated evidence in the initial request', async (t) => {
    let capturedFileCount = 0;
    mockMethod(t, complaintService, 'createComplaint', async (request: { files?: unknown[] }) => {
        capturedFileCount = request.files?.length ?? 0;
        return {
            id: 'complaint-one',
            trackingId: 'COMP-20261023-ABCDEF',
            status: ComplaintStatus.OPEN,
            priority: Priority.MEDIUM,
            sentiment: null,
            category: 'GENERAL',
            suggestedResponse: null,
            aiSummary: null,
            assignedToId: null,
        };
    });

    await withServer(async (baseUrl) => {
        const form = new FormData();
        form.set('title', 'A complaint title long enough');
        form.set('description', 'A complaint description long enough for this test.');
        form.set('customerEmail', 'customer@example.com');
        form.set('customerName', 'Test Customer');
        form.set('tenantId', 'f47ac10b-58cc-4372-a567-0e02b2c3d479');
        form.append(
            'files',
            new Blob(['%PDF-1.7 test'], { type: 'application/pdf' }),
            'evidence.pdf',
        );

        const response = await fetch(`${baseUrl}/api/complaints/submit`, {
            method: 'POST',
            body: form,
        });
        assert.equal(response.status, 201);
    });

    assert.equal(capturedFileCount, 1);
});

test('public complaint submissions reject file content that does not match its MIME type', async (t) => {
    mockMethod(t, complaintService, 'createComplaint', async () => {
        throw new Error('The complaint service must not be called');
    });

    await withServer(async (baseUrl) => {
        const form = new FormData();
        form.set('title', 'A complaint title long enough');
        form.set('description', 'A complaint description long enough for this test.');
        form.set('customerEmail', 'customer@example.com');
        form.set('customerName', 'Test Customer');
        form.set('tenantId', 'f47ac10b-58cc-4372-a567-0e02b2c3d479');
        form.append(
            'files',
            new Blob(['not a PDF'], { type: 'application/pdf' }),
            'evidence.pdf',
        );

        const response = await fetch(`${baseUrl}/api/complaints/submit`, {
            method: 'POST',
            body: form,
        });
        assert.equal(response.status, 400);
    });
});

test('customer trial acceptance and business onboarding are role-restricted', async (t) => {
    const previousSecret = env.JWT_SECRET;
    env.JWT_SECRET = TEST_SECRET;
    t.after(() => { env.JWT_SECRET = previousSecret; });
    mockAuthenticatedUser(t, 'CUSTOMER');

    await withServer(async (baseUrl) => {
        const headers = {
            Authorization: `Bearer ${token('CUSTOMER')}`,
            'Content-Type': 'application/json',
        };
        const trial = await fetch(`${baseUrl}/api/v1/auth/trial/accept`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ accepted: true }),
        });
        const onboarding = await fetch(`${baseUrl}/api/v1/auth/trial/onboarding`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ complaintChannel: 'WEB_PORTAL' }),
        });
        assert.equal(trial.status, 403);
        assert.equal(onboarding.status, 403);
    });
});

test('complaint service database failures do not expose internal details to API clients', async (t) => {
    mockMethod(t, complaintService, 'getComplaintByTrackingId', async () => {
        throw new Error('database connection string must remain private');
    });

    await withServer(async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/complaints/track/COMP-20261023-ABCDEF`);
        const body = await response.text();
        assert.equal(response.status, 500);
        assert.equal(body.includes('database connection string'), false);
    });
});
