import assert from 'node:assert/strict';
import test, { TestContext } from 'node:test';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app';
import { prisma } from '../src/config/database';
import { emailService } from '../src/services/emailService';
import { authService } from '../src/modules/accounts/auth.service';

function mockPrismaMethod<Arguments extends unknown[], Result>(
    context: TestContext,
    target: object,
    methodName: string,
    implementation: (...args: Arguments) => Result,
) {
    const original = Object.getOwnPropertyDescriptor(target, methodName);
    Object.defineProperty(target, methodName, {
        configurable: true,
        writable: true,
        value: (...args: Arguments) => implementation(...args),
    });
    context.after(() => {
        if (original) {
            Object.defineProperty(target, methodName, original);
        } else {
            Reflect.deleteProperty(target, methodName);
        }
    });
}

function makeFakeUser(overrides: Record<string, unknown> = {}) {
    return {
        id: 'usr-1001',
        email: 'customer@example.com',
        fullName: 'Jane Doe',
        phone: null,
        passwordHash: '$2b$04$fakehashfakehashfakehashfakehashfakehashfakehashfak',
        role: 'CUSTOMER',
        accountType: 'CUSTOMER',
        tenantId: 'platform-tenant-id',
        isActive: true,
        emailVerified: true,
        lastLoginAt: null,
        tenant: {
            id: 'platform-tenant-id',
            name: 'BCIP Platform',
            slug: 'platform',
            industry: null,
            website: null,
            isActive: true,
            businessVerified: true,
        },
        ...overrides,
    };
}

async function withServer(
    fn: (baseUrl: string) => Promise<void>,
) {
    const server = createApp().listen(0);
    await new Promise<void>(resolve => server.once('listening', resolve));
    try {
        const address = server.address();
        assert.ok(address && typeof address !== 'string');
        await fn(`http://127.0.0.1:${address.port}`);
    } finally {
        await new Promise<void>((resolve, reject) => {
            server.close(err => (err ? reject(err) : resolve()));
        });
    }
}

test('POST /api/v1/auth/register successfully registers a customer and returns 201', async t => {
    mockPrismaMethod(t, authService, 'register', async () => ({
        user: {
            id: 'usr-new-customer',
            email: 'newcustomer@example.com',
            fullName: 'New Customer',
            phone: null,
            role: 'CUSTOMER',
            accountType: 'CUSTOMER',
            emailVerified: false,
            tenantId: 'platform-tenant-id',
            tenantName: 'BCIP Platform',
        },
        tenant: {
            id: 'platform-tenant-id',
            name: 'BCIP Platform',
            slug: 'bcip-public-consumer-platform',
            industry: null,
            website: null,
        },
        verificationRequired: true,
    }));

    await withServer(async baseUrl => {
        const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                accountType: 'CUSTOMER',
                email: 'newcustomer@example.com',
                password: 'Password123!',
                fullName: 'New Customer',
            }),
        });

        const body = (await response.json()) as {
            success: boolean;
            data?: {
                verificationRequired?: boolean;
                user?: { email?: string; role?: string; tenantId?: string };
            };
        };

        assert.equal(response.status, 201);
        assert.equal(body.success, true);
        assert.equal(body.data?.verificationRequired, true);
        assert.equal(body.data?.user?.email, 'newcustomer@example.com');
        assert.equal(body.data?.user?.role, 'CUSTOMER');
        assert.equal(body.data?.user?.tenantId, 'platform-tenant-id');
    });
});

test('POST /api/auth/register legacy route alias registers successfully', async t => {
    mockPrismaMethod(t, authService, 'register', async () => ({
        user: {
            id: 'usr-legacy-cust',
            email: 'legacy@example.com',
            fullName: 'Legacy User',
            phone: null,
            role: 'CUSTOMER',
            accountType: 'CUSTOMER',
            emailVerified: false,
            tenantId: 'platform-tenant-id',
            tenantName: 'BCIP Platform',
        },
        tenant: {
            id: 'platform-tenant-id',
            name: 'BCIP Platform',
            slug: 'bcip-public-consumer-platform',
            industry: null,
            website: null,
        },
        verificationRequired: true,
    }));

    await withServer(async baseUrl => {
        const response = await fetch(`${baseUrl}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                accountType: 'CUSTOMER',
                email: 'legacy@example.com',
                password: 'Password123!',
                fullName: 'Legacy User',
            }),
        });

        assert.equal(response.status, 201);
        const body = await response.json() as any;
        assert.equal(body.success, true);
        assert.equal(body.data?.verificationRequired, true);
    });
});

test('POST /api/v1/auth/register rejects business registration with personal email', async () => {
    await withServer(async baseUrl => {
        const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                accountType: 'BUSINESS',
                businessName: 'Acme Corp',
                industry: 'Tech',
                email: 'owner@gmail.com', // Personal email not allowed for BUSINESS
                password: 'Password123!',
                fullName: 'Acme Owner',
            }),
        });

        const body = (await response.json()) as { error?: { code?: string } };
        assert.equal(response.status, 400);
        assert.equal(body.error?.code, 'VALIDATION_ERROR');
    });
});

test('POST /api/v1/auth/login logs in verified user and returns JWT token', async t => {
    const password = 'StrongPassword123!';
    const passwordHash = await bcrypt.hash(password, 4);
    const user = makeFakeUser({ passwordHash });

    mockPrismaMethod(t, prisma.user, 'findUnique', async () => user as never);
    mockPrismaMethod(t, prisma.user, 'update', async () => ({}) as never);

    await withServer(async baseUrl => {
        const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'customer@example.com',
                password,
            }),
        });

        const body = (await response.json()) as {
            success: boolean;
            data?: {
                token?: string;
                user?: { email?: string; role?: string; tenantId?: string; tenantName?: string };
                tenant?: { id?: string; name?: string };
            };
        };

        assert.equal(response.status, 200);
        assert.equal(body.success, true);
        assert.ok(body.data?.token, 'must return a jwt token');
        assert.equal(body.data?.user?.email, 'customer@example.com');
        assert.equal(body.data?.user?.role, 'CUSTOMER');
        assert.equal(body.data?.user?.tenantId, 'platform-tenant-id');
        assert.equal(body.data?.user?.tenantName, 'BCIP Platform');
    });
});

test('POST /api/auth/login legacy route logs in verified user correctly', async t => {
    const password = 'StrongPassword123!';
    const passwordHash = await bcrypt.hash(password, 4);
    const user = makeFakeUser({ passwordHash });

    mockPrismaMethod(t, prisma.user, 'findUnique', async () => user as never);
    mockPrismaMethod(t, prisma.user, 'update', async () => ({}) as never);

    await withServer(async baseUrl => {
        const response = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'customer@example.com',
                password,
            }),
        });

        const body = (await response.json()) as {
            success: boolean;
            data?: { token?: string };
        };

        assert.equal(response.status, 200);
        assert.equal(body.success, true);
        assert.ok(body.data?.token);
    });
});

test('POST /api/v1/auth/login rejects unverified email with 403 EMAIL_NOT_VERIFIED', async t => {
    const password = 'StrongPassword123!';
    const passwordHash = await bcrypt.hash(password, 4);
    const user = makeFakeUser({ passwordHash, emailVerified: false });

    mockPrismaMethod(t, prisma.user, 'findUnique', async () => user as never);

    await withServer(async baseUrl => {
        const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'customer@example.com',
                password,
            }),
        });

        const body = (await response.json()) as {
            success: boolean;
            error?: { code?: string };
        };

        assert.equal(response.status, 403);
        assert.equal(body.success, false);
        assert.equal(body.error?.code, 'EMAIL_NOT_VERIFIED');
    });
});

test('POST /api/v1/auth/login rejects wrong password with 401 INVALID_CREDENTIALS', async t => {
    const passwordHash = await bcrypt.hash('CorrectPassword1!', 4);
    const user = makeFakeUser({ passwordHash });

    mockPrismaMethod(t, prisma.user, 'findUnique', async () => user as never);

    await withServer(async baseUrl => {
        const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'customer@example.com',
                password: 'WrongPassword!',
            }),
        });

        const body = (await response.json()) as {
            success: boolean;
            error?: { code?: string };
        };

        assert.equal(response.status, 401);
        assert.equal(body.success, false);
        assert.equal(body.error?.code, 'INVALID_CREDENTIALS');
    });
});

test('GET /api/v1/auth/me returns user profile when valid Bearer token provided', async t => {
    const user = makeFakeUser();
    mockPrismaMethod(t, prisma.user, 'findFirst', async () => user as never);
    mockPrismaMethod(t, prisma.user, 'findUnique', async () => user as never);

    const token = jwt.sign(
        { userId: user.id, role: user.role, tenantId: user.tenantId },
        process.env.JWT_SECRET || 'd31dda79950794f4445db421788e720839164c8012b3210d3d469279bcc6a69416e0cfae45c4773e049ce12878b60cb7',
        { expiresIn: '1h' },
    );

    await withServer(async baseUrl => {
        const response = await fetch(`${baseUrl}/api/v1/auth/me`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const body = (await response.json()) as {
            success: boolean;
            data?: {
                user?: { id?: string; email?: string; role?: string; tenantId?: string };
                tenant?: { id?: string; name?: string };
            };
        };

        assert.equal(response.status, 200);
        assert.equal(body.success, true);
        assert.equal(body.data?.user?.id, user.id);
        assert.equal(body.data?.user?.email, user.email);
        assert.equal(body.data?.user?.tenantId, user.tenantId);
    });
});

test('GET /api/auth/me legacy route returns profile with Bearer token', async t => {
    const user = makeFakeUser();
    mockPrismaMethod(t, prisma.user, 'findFirst', async () => user as never);
    mockPrismaMethod(t, prisma.user, 'findUnique', async () => user as never);

    const token = jwt.sign(
        { userId: user.id, role: user.role, tenantId: user.tenantId },
        process.env.JWT_SECRET || 'd31dda79950794f4445db421788e720839164c8012b3210d3d469279bcc6a69416e0cfae45c4773e049ce12878b60cb7',
        { expiresIn: '1h' },
    );

    await withServer(async baseUrl => {
        const response = await fetch(`${baseUrl}/api/auth/me`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        assert.equal(response.status, 200);
        const body = await response.json() as any;
        assert.equal(body.success, true);
        assert.equal(body.data?.user?.email, user.email);
    });
});

test('POST /api/v1/auth/forgot-password accepts request and sends email', async t => {
    mockPrismaMethod(t, emailService, 'assertVerificationEmailConfigured', () => {});
    let sentEmail: string | undefined;
    mockPrismaMethod(t, emailService, 'sendPasswordResetEmail', async (email: string) => {
        sentEmail = email;
    });

    const user = makeFakeUser({ email: 'recover@example.com' });
    mockPrismaMethod(t, prisma.user, 'findUnique', async () => user as never);
    mockPrismaMethod(t, prisma.user, 'update', async () => ({}) as never);

    await withServer(async baseUrl => {
        const response = await fetch(`${baseUrl}/api/v1/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'recover@example.com' }),
        });

        const body = await response.json() as { success: boolean; data?: { accepted: boolean } };
        assert.equal(response.status, 200);
        assert.equal(body.success, true);
        assert.equal(body.data?.accepted, true);
        assert.equal(sentEmail, 'recover@example.com');
    });
});

test('POST /api/v1/auth/forgot-password does not disclose non-existent accounts', async t => {
    mockPrismaMethod(t, emailService, 'assertVerificationEmailConfigured', () => {});
    mockPrismaMethod(t, prisma.user, 'findUnique', async () => null as never);

    await withServer(async baseUrl => {
        const response = await fetch(`${baseUrl}/api/v1/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'unknown-person@example.com' }),
        });

        const body = await response.json() as { success: boolean; data?: { accepted: boolean } };
        assert.equal(response.status, 200);
        assert.equal(body.success, true);
        assert.equal(body.data?.accepted, true);
    });
});

test('POST /api/v1/auth/reset-password resets password with valid token', async t => {
    const user = makeFakeUser({ id: 'usr-reset-1' });
    mockPrismaMethod(t, prisma.user, 'findFirst', async () => user as never);
    let updatedPasswordHash: string | undefined;
    mockPrismaMethod(t, prisma.user, 'update', async (args: any) => {
        updatedPasswordHash = args.data.passwordHash;
        return {} as never;
    });

    await withServer(async baseUrl => {
        const response = await fetch(`${baseUrl}/api/v1/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: 'valid-reset-token-12345',
                password: 'BrandNewSecurePassword123!',
                confirmPassword: 'BrandNewSecurePassword123!',
            }),
        });

        const body = await response.json() as { success: boolean; message?: string };
        assert.equal(response.status, 200);
        assert.equal(body.success, true);
        assert.ok(updatedPasswordHash, 'passwordHash must be updated');
        assert.equal(await bcrypt.compare('BrandNewSecurePassword123!', updatedPasswordHash!), true);
    });
});

test('POST /api/v1/auth/reset-password rejects invalid/expired token with 400 VALIDATION_ERROR', async t => {
    mockPrismaMethod(t, prisma.user, 'findFirst', async () => null as never);

    await withServer(async baseUrl => {
        const response = await fetch(`${baseUrl}/api/v1/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: 'expired-or-invalid-token',
                password: 'BrandNewPassword123!',
            }),
        });

        const body = await response.json() as { success: boolean; error?: { code?: string } };
        assert.equal(response.status, 400);
        assert.equal(body.success, false);
        assert.equal(body.error?.code, 'VALIDATION_ERROR');
    });
});

test('development account provisioning is not exposed over HTTP', async () => {
    await withServer(async baseUrl => {
        for (const path of [
            '/api/auth/dev-account-info',
            '/api/v1/auth/dev-account-info',
        ]) {
            const response = await fetch(`${baseUrl}${path}`);
            assert.equal(response.status, 404);
        }
    });
});
