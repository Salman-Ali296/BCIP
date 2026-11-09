/**
 * auth-security.test.ts
 *
 * Focused security property tests for the authentication system.
 * Covers: privilege injection, tenant injection, JWT validation, and
 * account-state guards. All Prisma calls are mocked — no database required.
 */

import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../src/config/database';
import { env } from '../src/config/env';
import { AuthService } from '../src/modules/accounts/auth.service';
import { registerSchema } from '../src/modules/accounts/dto/register.dto';
import { AppError } from '../src/utils/error';
import { authMiddleware } from '../src/middleware/auth.middleware';
import { AUTH_SESSION_COOKIE } from '../src/modules/accounts/auth-session-cookie';
import type { Request, Response, NextFunction } from 'express';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEST_SECRET = 'test-secret-that-is-longer-than-thirty-two-chars';

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
        id: 'user-1',
        email: 'person@example.com',
        fullName: 'Example Person',
        passwordHash: '',
        role: 'CUSTOMER',
        accountType: 'CUSTOMER',
        tenantId: 'tenant-1',
        isActive: true,
        emailVerified: true,
        tenant: {
            id: 'tenant-1',
            name: 'Public Platform',
            slug: 'bcip-public-consumer-platform',
            isActive: true,
            businessVerified: true,
            industry: null,
            website: null,
        },
        ...overrides,
    };
}

async function errorCode(promise: Promise<unknown>, code: string) {
    await assert.rejects(promise, (error: unknown) =>
        error instanceof AppError && error.code === code,
    );
}

// ---------------------------------------------------------------------------
// REGISTRATION - Privilege injection
// ---------------------------------------------------------------------------

test('registration schema rejects client-supplied tenantId', () => {
    const payload = {
        accountType: 'CUSTOMER',
        email: 'user@example.com',
        password: 'Secure-pass-123',
        fullName: 'Test User',
        tenantId: 'deadbeef-dead-4ead-8ead-deadbeefcafe',
    };

    const result = registerSchema.safeParse(payload);
    if (result.success) {
        // tenantId has been removed from the schema - it must not appear in parsed output
        assert.equal(
            Object.prototype.hasOwnProperty.call(result.data, 'tenantId'),
            false,
            'tenantId must not appear in parsed output',
        );
    }
});

test('registration rejects EMPLOYEE account type via the service', async () => {
    const service = new AuthService();
    await errorCode(
        service.register({
            accountType: 'EMPLOYEE',
            email: 'staff@company.com',
            password: 'Secure-pass-123',
            fullName: 'Staff Member',
            documents: [],
            policies: [],
        }),
        'FORBIDDEN',
    );
});

test('registration rejects ESCALATION_AGENT account type via the service', async () => {
    const service = new AuthService();
    await errorCode(
        service.register({
            accountType: 'ESCALATION_AGENT',
            email: 'agent@company.com',
            password: 'Secure-pass-123',
            fullName: 'Agent Member',
            documents: [],
            policies: [],
        }),
        'FORBIDDEN',
    );
});

test('registration schema does not expose a role field - role is server-assigned', () => {
    const innerSchema = (registerSchema as any)._def?.schema ?? registerSchema;
    const shape = innerSchema.shape ?? {};
    assert.equal('role' in shape, false, 'role must not be in the registration schema');

    const parsed = registerSchema.safeParse({
        accountType: 'CUSTOMER',
        email: 'customer@example.com',
        password: 'Password123!',
        fullName: 'Test Customer',
        role: 'ADMIN',
    });
    assert.equal(parsed.success, true);
    assert.equal('role' in (parsed.data as Record<string, unknown>), false, 'role must not be in parsed registration data');
});

// ---------------------------------------------------------------------------
// REGISTRATION - Password never returned
// ---------------------------------------------------------------------------

test('login result does not contain passwordHash', async t => {
    const password = 'Correct-password-123';
    const passwordHash = await bcrypt.hash(password, 4);
    const secretBefore = env.JWT_SECRET;
    env.JWT_SECRET = TEST_SECRET;
    t.after(() => { env.JWT_SECRET = secretBefore; });

    mockPrismaMethod(t, prisma.user, 'findUnique', async () =>
        makeFakeUser({ passwordHash }) as never,
    );
    mockPrismaMethod(t, prisma.user, 'update', async () => ({}) as never);

    const service = new AuthService();
    const result = await service.login({ email: 'person@example.com', password });

    const resultStr = JSON.stringify(result);
    assert.equal(resultStr.includes('passwordHash'), false, 'response must not include passwordHash');
    assert.equal(resultStr.includes(password), false, 'response must not include plaintext password');
});

// ---------------------------------------------------------------------------
// JWT - authMiddleware validation
// ---------------------------------------------------------------------------

function mockRequest(headers: Record<string, string> = {}): Request {
    return { headers } as unknown as Request;
}

function mockResponse(): Response {
    return {} as Response;
}

test('authMiddleware rejects requests with no Authorization header', async () => {
    const req = mockRequest({});
    const res = mockResponse();
    let capturedError: unknown;
    const next: NextFunction = (err) => { capturedError = err; };

    await authMiddleware(req, res, next);

    assert.ok(capturedError instanceof AppError);
    assert.equal((capturedError as AppError).code, 'UNAUTHORIZED');
});

test('authMiddleware rejects malformed Bearer tokens', async () => {
    const req = mockRequest({ authorization: 'Bearer not.a.real.jwt.token' });
    const res = mockResponse();
    let capturedError: unknown;
    const next: NextFunction = (err) => { capturedError = err; };

    await authMiddleware(req, res, next);

    assert.ok(capturedError instanceof AppError);
    assert.equal((capturedError as AppError).code, 'UNAUTHORIZED');
});

test('authMiddleware rejects JWTs signed with a wrong secret', async () => {
    const badToken = jwt.sign(
        { userId: 'user-1', tenantId: 'tenant-1', role: 'CUSTOMER' },
        'wrong-secret-that-is-long-enough',
        { expiresIn: '1h' },
    );
    const req = mockRequest({ authorization: `Bearer ${badToken}` });
    const res = mockResponse();
    let capturedError: unknown;
    const next: NextFunction = (err) => { capturedError = err; };

    await authMiddleware(req, res, next);

    assert.ok(capturedError instanceof AppError);
    assert.equal((capturedError as AppError).code, 'UNAUTHORIZED');
});

test('authMiddleware rejects expired JWTs', async () => {
    const secretBefore = env.JWT_SECRET;
    env.JWT_SECRET = TEST_SECRET;
    try {
        const expiredToken = jwt.sign(
            { userId: 'user-1', tenantId: 'tenant-1', role: 'CUSTOMER' },
            TEST_SECRET,
            { expiresIn: '-1s' },
        );
        const req = mockRequest({ authorization: `Bearer ${expiredToken}` });
        const res = mockResponse();
        let capturedError: unknown;
        const next: NextFunction = (err) => { capturedError = err; };

        await authMiddleware(req, res, next);

        assert.ok(capturedError instanceof AppError);
        assert.equal((capturedError as AppError).code, 'UNAUTHORIZED');
    } finally {
        env.JWT_SECRET = secretBefore;
    }
});

test('authMiddleware rejects JWTs missing userId claim', async () => {
    const secretBefore = env.JWT_SECRET;
    env.JWT_SECRET = TEST_SECRET;
    try {
        const token = jwt.sign({ tenantId: 'tenant-1', role: 'CUSTOMER' }, TEST_SECRET, { expiresIn: '1h' });
        const req = mockRequest({ authorization: `Bearer ${token}` });
        const res = mockResponse();
        let capturedError: unknown;
        const next: NextFunction = (err) => { capturedError = err; };

        await authMiddleware(req, res, next);

        assert.ok(capturedError instanceof AppError);
        assert.equal((capturedError as AppError).code, 'UNAUTHORIZED');
    } finally {
        env.JWT_SECRET = secretBefore;
    }
});

test('authMiddleware rejects JWTs missing tenantId claim', async () => {
    const secretBefore = env.JWT_SECRET;
    env.JWT_SECRET = TEST_SECRET;
    try {
        const token = jwt.sign({ userId: 'user-1', role: 'CUSTOMER' }, TEST_SECRET, { expiresIn: '1h' });
        const req = mockRequest({ authorization: `Bearer ${token}` });
        const res = mockResponse();
        let capturedError: unknown;
        const next: NextFunction = (err) => { capturedError = err; };

        await authMiddleware(req, res, next);

        assert.ok(capturedError instanceof AppError);
        assert.equal((capturedError as AppError).code, 'UNAUTHORIZED');
    } finally {
        env.JWT_SECRET = secretBefore;
    }
});

// ---------------------------------------------------------------------------
// JWT - authMiddleware user-state checks
// ---------------------------------------------------------------------------

test('authMiddleware rejects inactive users even with a valid JWT', async t => {
    const secretBefore = env.JWT_SECRET;
    env.JWT_SECRET = TEST_SECRET;
    t.after(() => { env.JWT_SECRET = secretBefore; });

    const token = jwt.sign({ userId: 'user-1', tenantId: 'tenant-1', role: 'CUSTOMER' }, TEST_SECRET, { expiresIn: '1h' });

    mockPrismaMethod(t, prisma.user, 'findFirst', async () =>
        makeFakeUser({ isActive: false }) as never,
    );

    const req = mockRequest({ authorization: `Bearer ${token}` });
    const res = mockResponse();
    let capturedError: unknown;
    const next: NextFunction = (err) => { capturedError = err; };

    await authMiddleware(req, res, next);

    assert.ok(capturedError instanceof AppError);
    assert.equal((capturedError as AppError).code, 'ACCOUNT_SUSPENDED');
});

test('authMiddleware rejects unverified email users', async t => {
    const secretBefore = env.JWT_SECRET;
    env.JWT_SECRET = TEST_SECRET;
    t.after(() => { env.JWT_SECRET = secretBefore; });

    const token = jwt.sign({ userId: 'user-1', tenantId: 'tenant-1', role: 'CUSTOMER' }, TEST_SECRET, { expiresIn: '1h' });

    mockPrismaMethod(t, prisma.user, 'findFirst', async () =>
        makeFakeUser({ emailVerified: false }) as never,
    );

    const req = mockRequest({ authorization: `Bearer ${token}` });
    const res = mockResponse();
    let capturedError: unknown;
    const next: NextFunction = (err) => { capturedError = err; };

    await authMiddleware(req, res, next);

    assert.ok(capturedError instanceof AppError);
    assert.equal((capturedError as AppError).code, 'EMAIL_NOT_VERIFIED');
});

test('authMiddleware populates req.user from Prisma - never from JWT claims alone', async t => {
    const secretBefore = env.JWT_SECRET;
    env.JWT_SECRET = TEST_SECRET;
    t.after(() => { env.JWT_SECRET = secretBefore; });

    // JWT claims role=SUPER_ADMIN, but the database record shows CUSTOMER
    const token = jwt.sign(
        { userId: 'user-1', tenantId: 'tenant-1', role: 'SUPER_ADMIN' },
        TEST_SECRET,
        { expiresIn: '1h' },
    );

    mockPrismaMethod(t, prisma.user, 'findFirst', async () =>
        makeFakeUser({ role: 'CUSTOMER' }) as never,
    );

    const req = mockRequest({ authorization: `Bearer ${token}` });
    const res = mockResponse();
    let nextCalled = false;
    const next: NextFunction = () => { nextCalled = true; };

    await authMiddleware(req, res, next);

    assert.equal(nextCalled, true, 'next() should have been called for a valid session');
    // The role must come from Prisma, not the JWT payload
    assert.equal((req as Request).user?.role, 'CUSTOMER');
});

test('authMiddleware accepts the HttpOnly BCIP session cookie and loads authoritative account data', async t => {
    const secretBefore = env.JWT_SECRET;
    env.JWT_SECRET = TEST_SECRET;
    t.after(() => { env.JWT_SECRET = secretBefore; });

    const token = jwt.sign(
        { userId: 'user-1', tenantId: 'tenant-1', role: 'SUPER_ADMIN' },
        TEST_SECRET,
        { expiresIn: '1h' },
    );
    mockPrismaMethod(t, prisma.user, 'findFirst', async () =>
        makeFakeUser({ role: 'CUSTOMER' }) as never,
    );

    const req = mockRequest({
        cookie: `${AUTH_SESSION_COOKIE}=${token}`,
    });
    req.method = 'GET';
    let nextError: unknown;
    await authMiddleware(req, mockResponse(), (error) => {
        nextError = error;
    });

    assert.equal(nextError, undefined);
    assert.equal((req as Request).user?.role, 'CUSTOMER');
    assert.equal((req as Request).tenantId, 'tenant-1');
});

test('authMiddleware rejects a session token attempting to select another tenant', async t => {
    const secretBefore = env.JWT_SECRET;
    env.JWT_SECRET = TEST_SECRET;
    t.after(() => { env.JWT_SECRET = secretBefore; });

    const token = jwt.sign(
        { userId: 'user-1', tenantId: 'other-tenant', role: 'CUSTOMER' },
        TEST_SECRET,
        { expiresIn: '1h' },
    );
    mockPrismaMethod(t, prisma.user, 'findFirst', async (args: {
        where: { id: string; tenantId: string };
    }) => {
        assert.equal(args.where.tenantId, 'other-tenant');
        return null as never;
    });

    const req = mockRequest({
        cookie: `${AUTH_SESSION_COOKIE}=${token}`,
    });
    req.method = 'GET';
    let capturedError: unknown;
    await authMiddleware(req, mockResponse(), (error) => {
        capturedError = error;
    });

    assert.ok(capturedError instanceof AppError);
    assert.equal(capturedError.code, 'UNAUTHORIZED');
});

test('authMiddleware rejects cross-origin cookie-authenticated mutations', async t => {
    const secretBefore = env.JWT_SECRET;
    env.JWT_SECRET = TEST_SECRET;
    t.after(() => { env.JWT_SECRET = secretBefore; });

    const token = jwt.sign(
        { userId: 'user-1', tenantId: 'tenant-1' },
        TEST_SECRET,
        { expiresIn: '1h' },
    );
    const req = mockRequest({
        cookie: `${AUTH_SESSION_COOKIE}=${token}`,
        origin: 'https://untrusted.example',
    });
    req.method = 'POST';
    let capturedError: unknown;

    await authMiddleware(req, mockResponse(), (error) => {
        capturedError = error;
    });

    assert.ok(capturedError instanceof AppError);
    assert.equal(capturedError.code, 'FORBIDDEN');
});

// ---------------------------------------------------------------------------
// Tenant isolation - Cross-tenant access denial
// ---------------------------------------------------------------------------

test('authMiddleware denies cross-tenant token use', async t => {
    const secretBefore = env.JWT_SECRET;
    env.JWT_SECRET = TEST_SECRET;
    t.after(() => { env.JWT_SECRET = secretBefore; });

    // Token claims tenant-2, but user is in tenant-1
    const token = jwt.sign(
        { userId: 'user-1', tenantId: 'tenant-2', role: 'CUSTOMER' },
        TEST_SECRET,
        { expiresIn: '1h' },
    );

    // Prisma findFirst with WHERE id=user-1 AND tenantId=tenant-2 => not found
    mockPrismaMethod(t, prisma.user, 'findFirst', async () => null as never);

    const req = mockRequest({ authorization: `Bearer ${token}` });
    const res = mockResponse();
    let capturedError: unknown;
    const next: NextFunction = (err) => { capturedError = err; };

    await authMiddleware(req, res, next);

    assert.ok(capturedError instanceof AppError);
    assert.equal((capturedError as AppError).code, 'UNAUTHORIZED');
});

// ---------------------------------------------------------------------------
// Login - inactive tenant is blocked
// ---------------------------------------------------------------------------

test('login blocks users when tenant is inactive', async t => {
    const password = 'Correct-password-123';
    const passwordHash = await bcrypt.hash(password, 4);

    mockPrismaMethod(t, prisma.user, 'findUnique', async () =>
        makeFakeUser({
            passwordHash,
            emailVerified: true,
            tenant: { ...makeFakeUser().tenant, isActive: false },
        }) as never,
    );

    const service = new AuthService();
    await errorCode(service.login({ email: 'person@example.com', password }), 'ACCOUNT_SUSPENDED');
});
