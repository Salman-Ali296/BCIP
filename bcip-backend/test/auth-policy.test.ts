import assert from 'node:assert/strict';
import { createHash, createHmac } from 'node:crypto';
import test, { type TestContext } from 'node:test';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../src/config/database';
import { env } from '../src/config/env';
import { AuthService } from '../src/modules/accounts/auth.service';
import { emailService } from '../src/services/emailService';
import { AppError } from '../src/utils/error';

const service = new AuthService();
const password = 'Correct-password-123';

function account(overrides: Record<string, unknown> = {}) {
    return {
        id: 'user-1',
        email: 'person@example.com',
        fullName: 'Example Person',
        passwordHash: '',
        role: 'CUSTOMER',
        accountType: 'CUSTOMER',
        tenantId: 'tenant-1',
        isActive: true,
        emailVerified: false,
        tenant: {
            id: 'tenant-1',
            name: 'Public Customer Platform',
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

function mockPrismaMethod<Arguments extends unknown[], Result>(
    context: TestContext,
    target: object,
    methodName: string,
    implementation: (...args: Arguments) => Result,
) {
    const originalDescriptor = Object.getOwnPropertyDescriptor(target, methodName);
    const calls: Arguments[] = [];
    Object.defineProperty(target, methodName, {
        configurable: true,
        writable: true,
        value: (...args: Arguments) => {
            calls.push(args);
            return implementation(...args);
        },
    });
    context.after(() => {
        if (originalDescriptor) {
            Object.defineProperty(target, methodName, originalDescriptor);
        } else {
            Reflect.deleteProperty(target, methodName);
        }
    });
    return { calls, callCount: () => calls.length };
}

test('every user role must verify email before login', async t => {
    const passwordHash = await bcrypt.hash(password, 4);
    const roles = [
        ['SUPER_ADMIN', 'EMPLOYEE'],
        ['BUSINESS_ADMIN', 'BUSINESS'],
        ['MANAGER', 'EMPLOYEE'],
        ['AGENT', 'EMPLOYEE'],
        ['CUSTOMER', 'CUSTOMER'],
        ['ESCALATION_AGENT', 'ESCALATION_AGENT'],
    ] as const;
    let currentAccount = account({ passwordHash });
    mockPrismaMethod(t, prisma.user, 'findUnique', async () => currentAccount as never);

    for (const [role, accountType] of roles) {
        currentAccount = account({ passwordHash, role, accountType, emailVerified: false });
        await errorCode(service.login({ email: currentAccount.email, password }), 'EMAIL_NOT_VERIFIED');
    }
});

test('verified users authenticate and receive a signed access token', async t => {
    const passwordHash = await bcrypt.hash(password, 4);
    const secretBefore = env.JWT_SECRET;
    env.JWT_SECRET = 'test-secret-that-is-longer-than-thirty-two-characters';
    t.after(() => { env.JWT_SECRET = secretBefore; });
    mockPrismaMethod(t, prisma.user, 'findUnique', async () =>
        account({ passwordHash, emailVerified: true }) as never,
    );
    mockPrismaMethod(t, prisma.user, 'update', async () => ({}) as never);

    const result = await service.login({ email: 'person@example.com', password });
    assert.equal(result.user.emailVerified, true);
    assert.equal((jwt.verify(result.token, env.JWT_SECRET) as jwt.JwtPayload).userId, 'user-1');
});

test('business accounts remain blocked until separate business approval', async t => {
    const passwordHash = await bcrypt.hash(password, 4);
    mockPrismaMethod(t, prisma.user, 'findUnique', async () =>
        account({
            passwordHash,
            accountType: 'BUSINESS',
            role: 'BUSINESS_ADMIN',
            emailVerified: true,
            tenant: { ...account().tenant, isActive: false, businessVerified: false },
        }) as never,
    );

    await errorCode(
        service.login({ email: 'person@example.com', password }),
        'BUSINESS_VERIFICATION_PENDING',
    );
});

test('invalid credentials and suspended accounts receive distinct safe error codes', async t => {
    const passwordHash = await bcrypt.hash(password, 4);
    let currentAccount = account({ passwordHash });
    mockPrismaMethod(t, prisma.user, 'findUnique', async () => currentAccount as never);

    await errorCode(service.login({ email: 'person@example.com', password: 'wrong-password' }), 'INVALID_CREDENTIALS');
    currentAccount = account({ passwordHash, isActive: false, emailVerified: true });
    await errorCode(service.login({ email: 'person@example.com', password }), 'ACCOUNT_SUSPENDED');
});

test('verification tokens are hashed, single-use, and rejected when expired or reused', async t => {
    const token = 'a'.repeat(64);
    let updateCount = 1;
    let tokenFound = true;
    const businessAccount = account({
        id: 'verify-user',
        email: 'verify@example.com',
        accountType: 'BUSINESS',
        role: 'BUSINESS_ADMIN',
    });
    mockPrismaMethod(
        t,
        prisma,
        '$transaction',
        async (operation: (transaction: typeof prisma) => Promise<unknown>) =>
            operation(prisma),
    );
    const findToken = mockPrismaMethod(
        t,
        prisma.user,
        'findFirst',
        async (_args: Parameters<typeof prisma.user.findFirst>[0]) =>
            tokenFound
                ? businessAccount as never
                : null as never,
    );
    const updateMany = mockPrismaMethod(
        t,
        prisma.user,
        'updateMany',
        async (_args: Parameters<typeof prisma.user.updateMany>[0]) =>
            ({ count: updateCount-- }) as never,
    );
    const activateTenant = mockPrismaMethod(
        t,
        prisma.tenant,
        'update',
        async (_args: Parameters<typeof prisma.tenant.update>[0]) => ({}) as never,
    );

    const verified = await service.verifyEmail(token);
    assert.equal(verified.emailVerified, true);
    assert.equal(activateTenant.callCount(), 1);
    assert.deepEqual(activateTenant.calls[0]?.[0], {
        where: { id: businessAccount.tenantId },
        data: { isActive: true, businessVerified: true },
    });
    const writtenHash = findToken.calls[0]?.[0].where.emailVerificationTokenHash;
    assert.equal(
        writtenHash,
        createHash('sha256').update(token).digest('hex'),
    );
    assert.notEqual(writtenHash, token);
    await errorCode(service.verifyEmail(token), 'VALIDATION_ERROR');

    tokenFound = false;
    await errorCode(service.verifyEmail('expired-token'), 'VALIDATION_ERROR');
});

test('resend cooldown updates are atomic and do not disclose account existence', async t => {
    t.mock.method(emailService, 'assertVerificationEmailConfigured', () => undefined);
    const sendMail = t.mock.method(emailService, 'sendVerificationCode', async () => undefined);
    mockPrismaMethod(t, prisma.user, 'findUnique', async () =>
        account({ emailVerificationSentAt: new Date() }) as never,
    );
    const updateMany = mockPrismaMethod(
        t,
        prisma.user,
        'updateMany',
        async (_args: Parameters<typeof prisma.user.updateMany>[0]) => ({ count: 0 }) as never,
    );

    const result = await service.resendVerificationEmail('person@example.com');
    assert.deepEqual(result, { accepted: true });
    assert.equal(updateMany.callCount(), 1);
    assert.equal(sendMail.mock.callCount(), 0);
});

test('resend sends a 6-digit code and stores only its keyed hash', async t => {
    const secretBefore = env.JWT_SECRET;
    env.JWT_SECRET = 'test-secret-that-is-longer-than-thirty-two-characters';
    t.after(() => { env.JWT_SECRET = secretBefore; });

    t.mock.method(emailService, 'assertVerificationEmailConfigured', () => undefined);
    let sentCode = '';
    t.mock.method(emailService, 'sendVerificationCode', async (_email, code) => {
        sentCode = code;
    });
    mockPrismaMethod(t, prisma.user, 'findUnique', async () =>
        account({ emailVerificationSentAt: null }) as never,
    );
    const updateMany = mockPrismaMethod(
        t,
        prisma.user,
        'updateMany',
        async (_args: Parameters<typeof prisma.user.updateMany>[0]) => ({ count: 1 }) as never,
    );

    const result = await service.resendVerificationEmail('person@example.com');
    assert.deepEqual(result, { accepted: true });
    assert.match(sentCode, /^\d{6}$/);
    assert.equal(
        updateMany.calls[0]?.[0].data.emailVerificationTokenHash,
        createHmac('sha256', env.JWT_SECRET).update(sentCode).digest('hex'),
    );
    assert.equal(updateMany.calls[0]?.[0].data.emailVerificationSentAt instanceof Date, true);
    const expiresAt = updateMany.calls[0]?.[0].data.emailVerificationExpiresAt;
    assert.ok(expiresAt instanceof Date);
    assert.ok(expiresAt.getTime() > Date.now());
    assert.ok(expiresAt.getTime() <= Date.now() + 10 * 60 * 1000);
});

test('verification codes are keyed-hashed, expire after ten minutes, and verify once', async t => {
    const secretBefore = env.JWT_SECRET;
    env.JWT_SECRET = 'test-secret-that-is-longer-than-thirty-two-characters';
    t.after(() => { env.JWT_SECRET = secretBefore; });

    const code = '012345';
    const codeHash = createHmac('sha256', env.JWT_SECRET).update(code).digest('hex');
    const verificationAccount = account({
        id: 'verify-code-user',
        emailVerified: false,
        emailVerificationTokenHash: codeHash,
        emailVerificationExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    let isPending = true;
    let expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    mockPrismaMethod(t, prisma.user, 'findUnique', async () => ({
        ...verificationAccount,
        emailVerified: !isPending,
        emailVerificationExpiresAt: expiresAt,
    }) as never);
    mockPrismaMethod(
        t,
        prisma,
        '$transaction',
        async (operation: (transaction: typeof prisma) => Promise<unknown>) =>
            operation(prisma),
    );
    const updateMany = mockPrismaMethod(
        t,
        prisma.user,
        'updateMany',
        async (_args: Parameters<typeof prisma.user.updateMany>[0]) => {
            isPending = false;
            return { count: 1 } as never;
        },
    );

    const verified = await service.verifyEmailCode(verificationAccount.email, code);
    assert.equal(verified.emailVerified, true);
    assert.equal(
        updateMany.calls[0]?.[0].where.emailVerificationTokenHash,
        codeHash,
    );
    await errorCode(service.verifyEmailCode(verificationAccount.email, code), 'VALIDATION_ERROR');
    isPending = true;
    await errorCode(service.verifyEmailCode(verificationAccount.email, '999999'), 'VALIDATION_ERROR');
    expiresAt = new Date(Date.now() - 1);
    await errorCode(service.verifyEmailCode(verificationAccount.email, code), 'VALIDATION_ERROR');
});
