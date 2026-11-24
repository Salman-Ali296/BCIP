import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../src/config/database';
import { env } from '../src/config/env';
import {
    AuthService,
    parseSystemMxLookupOutput,
} from '../src/modules/accounts/auth.service';
import type { RegisterDto } from '../src/modules/accounts/dto/register.dto';
import { AppError } from '../src/utils/error';

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

const registration: RegisterDto = {
    accountType: 'BUSINESS',
    businessName: 'Northwind Support',
    industry: 'Retail',
    email: 'owner@northwind.example',
    password: 'Secure-password-123!',
    fullName: 'Northwind Owner',
    phone: '+1 555 010 2040',
    termsAccepted: true,
    privacyPolicyAccepted: true,
    documents: [],
    policies: [],
};

const tenant = {
    id: 'tenant-1',
    name: 'Northwind Support',
    slug: 'northwind-support',
    industry: 'Retail',
    website: null,
};

const user = {
    id: 'user-1',
    email: registration.email,
    fullName: registration.fullName,
    phone: null,
    role: 'BUSINESS_ADMIN',
    accountType: 'BUSINESS',
    emailVerified: false,
    tenantId: tenant.id,
};

test('system DNS MX lookup results distinguish records, missing records, and resolver failures', () => {
    assert.equal(
        parseSystemMxLookupOutput('gmail.com MX preference = 5, mail exchanger = gmail-smtp-in.l.google.com'),
        true,
    );
    assert.equal(
        parseSystemMxLookupOutput('Server: UnKnown\nAddress: 192.0.2.1'),
        false,
    );
    assert.equal(
        parseSystemMxLookupOutput('Server: UnKnown\nAddress: 192.0.2.1\nDNS request timed out.'),
        undefined,
    );
    assert.equal(
        parseSystemMxLookupOutput('Server: UnKnown\nAddress: 192.0.2.1\n*** Server failed'),
        undefined,
    );
});

function makeTransaction(
    onUserCreate: (data: Record<string, unknown>) => void = () => {},
) {
    return {
        tenant: {
            create: async () => tenant,
            findUnique: async () => null,
        },
        user: {
            create: async (args: { data: Record<string, unknown> }) => {
                onUserCreate(args.data);
                return user;
            },
        },
        companyPolicy: {
            createMany: async () => ({ count: 0 }),
        },
        auditLog: {
            create: async () => ({ id: 'audit-1' }),
        },
    };
}

function makeFirebaseAdmin(options: {
    createUser?: (input: {
        email: string;
        password: string;
        displayName: string;
        emailVerified: false;
        disabled: true;
    }) => Promise<{ uid: string }>;
    deleteUser?: (uid: string) => Promise<void>;
    verifyEmail?: (uid: string) => Promise<void>;
    updateEmail?: (uid: string, email: string) => Promise<void>;
    updatePassword?: (uid: string, password: string) => Promise<void>;
} = {}) {
    const events: string[] = [];
    return {
        events,
        createUser: async (input: {
            email: string;
            password: string;
            displayName: string;
            emailVerified: false;
            disabled: true;
        }) => {
            events.push('firebase-create');
            if (options.createUser) return options.createUser(input);
            return { uid: 'firebase-user-1' };
        },
        deleteUser: async (uid: string) => {
            events.push(`firebase-delete:${uid}`);
            await options.deleteUser?.(uid);
        },
        verifyEmail: async (uid: string) => {
            events.push(`firebase-verify:${uid}`);
            await options.verifyEmail?.(uid);
        },
        updateEmail: async (uid: string, email: string) => {
            events.push(`firebase-email:${uid}:${email}`);
            await options.updateEmail?.(uid, email);
        },
        updatePassword: async (uid: string, password: string) => {
            events.push(`firebase-password:${uid}`);
            await options.updatePassword?.(uid, password);
        },
    };
}

function makeFirebaseLoginAdmin(options: {
    getUserByEmail?: (email: string) => Promise<{ uid: string }>;
    createUser?: (input: {
        email: string;
        password: string;
        displayName: string;
        emailVerified: true;
        disabled: false;
    }) => Promise<{ uid: string }>;
    createCustomToken?: (uid: string) => Promise<string>;
    deleteUser?: (uid: string) => Promise<void>;
} = {}) {
    const events: string[] = [];
    return {
        events,
        getUserByEmail: async (email: string) => {
            events.push(`firebase-lookup:${email}`);
            if (options.getUserByEmail) return options.getUserByEmail(email);
            throw Object.assign(new Error('not found'), {
                code: 'auth/user-not-found',
            });
        },
        createUser: async (input: {
            email: string;
            password: string;
            displayName: string;
            emailVerified: true;
            disabled: false;
        }) => {
            events.push('firebase-create-login');
            if (options.createUser) return options.createUser(input);
            return { uid: 'firebase-migrated-user' };
        },
        createCustomToken: async (uid: string) => {
            events.push(`firebase-custom-token:${uid}`);
            return options.createCustomToken
                ? options.createCustomToken(uid)
                : 'short-lived-custom-token';
        },
        deleteUser: async (uid: string) => {
            events.push(`firebase-delete-login:${uid}`);
            await options.deleteUser?.(uid);
        },
    };
}

function mockExistingUser(context: TestContext, existing: unknown) {
    mockPrismaMethod(
        context,
        prisma.user,
        'findUnique',
        async () => existing as never,
    );
}

function mockTransaction(
    context: TestContext,
    transaction: ReturnType<typeof makeTransaction>,
) {
    mockPrismaMethod(
        context,
        prisma,
        '$transaction',
        async (callback: (tx: never) => Promise<unknown>) =>
            callback(transaction as never),
    );
}

test('business registration creates a disabled Firebase identity and atomically maps its UID', async (t) => {
    const events: string[] = [];
    mockExistingUser(t, null);
    let persistedFirebaseUid: unknown;
    mockTransaction(t, makeTransaction((data) => {
        events.push('database-create');
        persistedFirebaseUid = data.firebaseUid;
        assert.equal(data.emailVerificationTokenHash, undefined);
    }));

    const firebaseAdmin = makeFirebaseAdmin({
        createUser: async (input) => {
            events.push('firebase-create');
            assert.equal(input.disabled, true);
            assert.equal(input.emailVerified, false);
            return { uid: 'firebase-user-1' };
        },
    });
    const service = new AuthService(firebaseAdmin, undefined, async () => true);
    const result = await service.register(registration);

    assert.equal(result.verificationRequired, true);
    assert.equal(persistedFirebaseUid, 'firebase-user-1');
    assert.deepEqual(events, [
        'firebase-create',
        'database-create',
    ]);
    assert.deepEqual(firebaseAdmin.events, ['firebase-create']);
});

test('business registration rejects an email domain without MX records', async (t) => {
    mockExistingUser(t, null);
    const firebaseAdmin = makeFirebaseAdmin();
    let checkedDomain: string | undefined;
    const service = new AuthService(
        firebaseAdmin,
        undefined,
        async domain => {
            checkedDomain = domain;
            return false;
        },
    );

    await assert.rejects(
        service.register(registration),
        (error: unknown) =>
            error instanceof AppError &&
            error.statusCode === 400 &&
            error.message.includes('mail exchange'),
    );
    assert.equal(checkedDomain, 'northwind.example');
    assert.deepEqual(firebaseAdmin.events, []);
});

test('duplicate BCIP email does not create a Firebase identity or tenant', async (t) => {
    mockExistingUser(t, { emailVerified: false });
    const firebaseAdmin = makeFirebaseAdmin();

    const result = await new AuthService(firebaseAdmin, undefined, async () => true).register(registration);

    assert.equal(result.verificationRequired, true);
    assert.deepEqual(firebaseAdmin.events, []);
});

test('already-verified duplicate BCIP account routes to login', async (t) => {
    mockExistingUser(t, { emailVerified: true });
    const firebaseAdmin = makeFirebaseAdmin();

    const result = await new AuthService(firebaseAdmin, undefined, async () => true).register(registration);

    assert.equal(result.verificationRequired, false);
    assert.deepEqual(firebaseAdmin.events, []);
});

test('Firebase email collision without a BCIP mapping is rejected without automatic linking', async (t) => {
    mockExistingUser(t, null);
    const firebaseAdmin = makeFirebaseAdmin({
        createUser: async () => {
            throw Object.assign(new Error('email collision'), {
                code: 'auth/email-already-exists',
            });
        },
    });

    await assert.rejects(
        new AuthService(firebaseAdmin, undefined, async () => true).register(registration),
        (error: unknown) =>
            error instanceof AppError &&
            error.statusCode === 409 &&
            !error.message.includes(registration.email),
    );
    assert.deepEqual(firebaseAdmin.events, ['firebase-create']);
});

test('verification is required after Firebase account creation without sending until requested', async (t) => {
    mockExistingUser(t, null);
    mockTransaction(t, makeTransaction());
    const result = await new AuthService(makeFirebaseAdmin(), undefined, async () => true).register(registration);

    assert.equal(result.verificationRequired, true);
});

test('Firebase creation failure does not create a BCIP user or tenant', async (t) => {
    mockExistingUser(t, null);
    let transactionCalled = false;
    mockPrismaMethod(t, prisma, '$transaction', async () => {
        transactionCalled = true;
        return undefined;
    });
    const firebaseAdmin = makeFirebaseAdmin({
        createUser: async () => {
            throw new Error('provider unavailable');
        },
    });

    await assert.rejects(
        new AuthService(firebaseAdmin, undefined, async () => true).register(registration),
        (error: unknown) =>
            error instanceof AppError &&
            error.statusCode === 500 &&
            !error.message.includes(registration.password),
    );
    assert.equal(transactionCalled, false);
});

test('database transaction failure compensates by deleting the newly created Firebase identity', async (t) => {
    mockExistingUser(t, null);
    mockPrismaMethod(t, prisma, '$transaction', async () => {
        throw new Error('database failure');
    });
    const firebaseAdmin = makeFirebaseAdmin();

    await assert.rejects(
        new AuthService(firebaseAdmin, undefined, async () => true).register(registration),
        (error: unknown) =>
            error instanceof AppError &&
            error.statusCode === 500 &&
            !error.message.includes(registration.password),
    );
    assert.deepEqual(firebaseAdmin.events, [
        'firebase-create',
        'firebase-delete:firebase-user-1',
    ]);
});

test('registration retry succeeds after the failed attempt compensated its Firebase identity', async (t) => {
    mockExistingUser(t, null);
    let transactionAttempts = 0;
    mockPrismaMethod(
        t,
        prisma,
        '$transaction',
        async (callback: (tx: never) => Promise<unknown>) => {
            transactionAttempts += 1;
            if (transactionAttempts === 1) {
                throw new Error('temporary database failure');
            }
            return callback(makeTransaction() as never);
        },
    );
    const firebaseAdmin = makeFirebaseAdmin();
    const service = new AuthService(firebaseAdmin, undefined, async () => true);

    await assert.rejects(service.register(registration));
    const retried = await service.register(registration);

    assert.equal(retried.verificationRequired, true);
    assert.equal(transactionAttempts, 2);
    assert.deepEqual(firebaseAdmin.events, [
        'firebase-create',
        'firebase-delete:firebase-user-1',
        'firebase-create',
    ]);
});

test('BCIP verification enables the mapped Firebase account before committing database verification', async (t) => {
    const events: string[] = [];
    mockPrismaMethod(t, prisma.user, 'findFirst', async () => ({
        id: user.id,
        email: user.email,
        accountType: 'BUSINESS',
        tenantId: tenant.id,
        firebaseUid: 'firebase-user-1',
    }) as never);
    mockPrismaMethod(
        t,
        prisma,
        '$transaction',
        async (callback: (tx: never) => Promise<unknown>) => {
            events.push('database-transaction');
            const transaction = {
                user: {
                    updateMany: async () => ({ count: 1 }),
                },
                tenant: {
                    update: async () => tenant,
                },
            };
            return callback(transaction as never);
        },
    );
    const firebaseAdmin = makeFirebaseAdmin({
        verifyEmail: async (uid) => {
            assert.equal(uid, 'firebase-user-1');
            events.push('firebase-verified');
        },
    });

    const result = await new AuthService(firebaseAdmin).verifyEmail('verification-token');

    assert.equal(result.emailVerified, true);
    assert.deepEqual(events, ['firebase-verified', 'database-transaction']);
});

test('Firebase verification failure leaves the BCIP verification token usable for retry', async (t) => {
    mockPrismaMethod(t, prisma.user, 'findFirst', async () => ({
        id: user.id,
        email: user.email,
        accountType: 'BUSINESS',
        tenantId: tenant.id,
        firebaseUid: 'firebase-user-1',
    }) as never);
    let transactionCalled = false;
    mockPrismaMethod(t, prisma, '$transaction', async () => {
        transactionCalled = true;
        return { count: 1 };
    });
    const firebaseAdmin = makeFirebaseAdmin({
        verifyEmail: async () => {
            throw new Error('provider unavailable');
        },
    });

    await assert.rejects(
        new AuthService(firebaseAdmin).verifyEmail('verification-token'),
        (error: unknown) =>
            error instanceof AppError &&
            error.statusCode === 500 &&
            !error.message.includes('provider unavailable'),
    );
    assert.equal(transactionCalled, false);
});

test('password reset updates the mapped Firebase identity before consuming the BCIP reset token', async (t) => {
    const events: string[] = [];
    mockPrismaMethod(t, prisma.user, 'findFirst', async () => ({
        id: user.id,
        email: user.email,
        firebaseUid: 'firebase-user-1',
    }) as never);
    mockPrismaMethod(t, prisma.user, 'update', async () => {
        events.push('database-password');
        return {} as never;
    });
    const firebaseAdmin = makeFirebaseAdmin({
        updatePassword: async (uid, password) => {
            assert.equal(uid, 'firebase-user-1');
            assert.equal(password, 'UpdatedPassword123!');
            events.push('firebase-password');
        },
    });

    await new AuthService(firebaseAdmin).resetPassword({
        token: 'valid-reset-token',
        password: 'UpdatedPassword123!',
    });

    assert.deepEqual(events, ['firebase-password', 'database-password']);
});

test('Firebase password update failure preserves the BCIP reset token for retry', async (t) => {
    let databaseUpdated = false;
    mockPrismaMethod(t, prisma.user, 'findFirst', async () => ({
        id: user.id,
        email: user.email,
        firebaseUid: 'firebase-user-1',
    }) as never);
    mockPrismaMethod(t, prisma.user, 'update', async () => {
        databaseUpdated = true;
        return {} as never;
    });
    const firebaseAdmin = makeFirebaseAdmin({
        updatePassword: async () => {
            throw new Error('provider unavailable');
        },
    });

    await assert.rejects(
        new AuthService(firebaseAdmin).resetPassword({
            token: 'valid-reset-token',
            password: 'UpdatedPassword123!',
        }),
        (error: unknown) =>
            error instanceof AppError &&
            error.statusCode === 500 &&
            !error.message.includes('provider unavailable'),
    );
    assert.equal(databaseUpdated, false);
});

test('legacy BCIP password login safely links a verified account and returns a Firebase custom token', async (t) => {
    const passwordHash = await bcrypt.hash(registration.password, 4);
    mockPrismaMethod(t, prisma.user, 'findUnique', async () => ({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        passwordHash,
        firebaseUid: null,
        isActive: true,
        emailVerified: true,
        accountType: 'BUSINESS',
        tenantId: tenant.id,
        tenant: { isActive: true, businessVerified: true },
    }) as never);
    let linkedUid: unknown;
    mockPrismaMethod(t, prisma.user, 'updateMany', async (args: {
        data: { firebaseUid: string };
    }) => {
        linkedUid = args.data.firebaseUid;
        return { count: 1 } as never;
    });
    const firebaseLoginAdmin = makeFirebaseLoginAdmin({
        createUser: async (input) => {
            assert.equal(input.emailVerified, true);
            assert.equal(input.disabled, false);
            assert.equal(input.password, registration.password);
            return { uid: 'firebase-migrated-user' };
        },
    });

    const result = await new AuthService(
        makeFirebaseAdmin(),
        firebaseLoginAdmin,
    ).bootstrapFirebaseLogin({
        email: registration.email,
        password: registration.password,
    });

    assert.equal(result.customToken, 'short-lived-custom-token');
    assert.equal(linkedUid, 'firebase-migrated-user');
    assert.deepEqual(firebaseLoginAdmin.events, [
        `firebase-lookup:${user.email}`,
        'firebase-create-login',
        'firebase-custom-token:firebase-migrated-user',
    ]);
});

test('legacy Firebase bootstrap rejects wrong passwords without creating or linking an identity', async (t) => {
    const passwordHash = await bcrypt.hash(registration.password, 4);
    mockPrismaMethod(t, prisma.user, 'findUnique', async () => ({
        id: user.id,
        email: user.email,
        passwordHash,
        firebaseUid: null,
        isActive: true,
        emailVerified: true,
        accountType: 'BUSINESS',
        tenantId: tenant.id,
        tenant: { isActive: true, businessVerified: true },
    }) as never);
    const firebaseLoginAdmin = makeFirebaseLoginAdmin();

    await assert.rejects(
        new AuthService(makeFirebaseAdmin(), firebaseLoginAdmin).bootstrapFirebaseLogin({
            email: registration.email,
            password: 'Wrong-password-123!',
        }),
        (error: unknown) =>
            error instanceof AppError &&
            error.code === 'INVALID_CREDENTIALS',
    );
    assert.deepEqual(firebaseLoginAdmin.events, []);
});

test('legacy Firebase bootstrap rejects unverified BCIP accounts before creating an identity', async (t) => {
    const passwordHash = await bcrypt.hash(registration.password, 4);
    mockPrismaMethod(t, prisma.user, 'findUnique', async () => ({
        id: user.id,
        email: user.email,
        passwordHash,
        firebaseUid: null,
        isActive: true,
        emailVerified: false,
        accountType: 'BUSINESS',
        tenantId: tenant.id,
        tenant: { isActive: true, businessVerified: false },
    }) as never);
    const firebaseLoginAdmin = makeFirebaseLoginAdmin();

    await assert.rejects(
        new AuthService(makeFirebaseAdmin(), firebaseLoginAdmin).bootstrapFirebaseLogin({
            email: registration.email,
            password: registration.password,
        }),
        (error: unknown) =>
            error instanceof AppError &&
            error.code === 'EMAIL_NOT_VERIFIED',
    );
    assert.deepEqual(firebaseLoginAdmin.events, []);
});

test('verified registration token submits a business profile under its own tenant', async (t) => {
    const previousSecret = env.JWT_SECRET;
    env.JWT_SECRET = 'registration-test-secret-that-is-long-enough';
    t.after(() => { env.JWT_SECRET = previousSecret; });
    const token = jwt.sign(
        { purpose: 'business_registration_completion', userId: user.id },
        env.JWT_SECRET,
        { expiresIn: '30m', algorithm: 'HS256' },
    );
    mockPrismaMethod(t, prisma.user, 'findUnique', async () => ({
        id: user.id,
        tenantId: 'tenant-12345678',
        email: registration.email,
        emailVerified: true,
        accountType: 'BUSINESS',
        role: 'BUSINESS_ADMIN',
        tenant: {
            id: 'tenant-12345678',
            name: 'Business registration pending',
            isActive: false,
            businessVerified: false,
            phone: registration.phone,
            industry: null,
            website: null,
            teamSize: null,
            description: null,
        },
    }) as never);

    let updatedSlug = '';
    let updatedLocation: { country: string; city: string; businessAddress: string | null } | undefined;
    let evidenceCreated = false;
    let submissionAudited = false;
    mockPrismaMethod(
        t,
        prisma,
        '$transaction',
        async (operation: (transaction: never) => Promise<unknown>) => operation({
            tenant: {
                updateMany: async (args: {
                    data: {
                        slug: string;
                        country: string;
                        city: string;
                        businessAddress: string | null;
                    };
                }) => {
                    updatedSlug = args.data.slug;
                    updatedLocation = {
                        country: args.data.country,
                        city: args.data.city,
                        businessAddress: args.data.businessAddress,
                    };
                    return { count: 1 };
                },
                findUniqueOrThrow: async () => ({ id: 'tenant-12345678', businessVerified: false }),
            },
            accountDocument: {
                create: async () => {
                    evidenceCreated = true;
                    return { id: 'document-1' };
                },
            },
            auditLog: {
                create: async () => {
                    submissionAudited = true;
                    return { id: 'audit-1' };
                },
            },
        } as never),
    );

    const result = await new AuthService().completeBusinessRegistration(token, {
        businessName: 'Northwind Support',
        industry: 'Retail',
        website: '',
        teamSize: '11–50',
        phone: '+1 555 010 2040',
        country: 'United States',
        city: 'Seattle',
        businessAddress: '123 Registered Road',
        description: '',
        confirmationAccepted: true,
    });

    assert.equal(result.registrationReferenceId, 'tenant-12345678');
    assert.equal(result.businessApprovalStatus, 'PENDING_REVIEW');
    assert.equal(updatedSlug, 'northwind-support-12345678');
    assert.deepEqual(updatedLocation, {
        country: 'United States',
        city: 'Seattle',
        businessAddress: '123 Registered Road',
    });
    assert.equal(evidenceCreated, false);
    assert.equal(submissionAudited, true);
});

test('business registration completion rejects a token with another purpose', async (t) => {
    const previousSecret = env.JWT_SECRET;
    env.JWT_SECRET = 'registration-test-secret-that-is-long-enough';
    t.after(() => { env.JWT_SECRET = previousSecret; });
    mockPrismaMethod(t, prisma.user, 'findUnique', async () => {
        throw new Error('A token with the wrong purpose must not query registration data');
    });
    const token = jwt.sign(
        { purpose: 'business_workspace_access', userId: user.id },
        env.JWT_SECRET,
        { expiresIn: '30m', algorithm: 'HS256' },
    );

    await assert.rejects(
        new AuthService().completeBusinessRegistration(token, {
            businessName: 'Northwind Support',
            industry: 'Retail',
            website: '',
            teamSize: '11–50',
            phone: '+1 555 010 2040',
            country: 'United States',
            city: 'Seattle',
            businessAddress: '123 Registered Road',
            description: '',
            registrationNumber: 'REG-123',
            evidenceUrl: 'https://registry.example/business.pdf',
            confirmationAccepted: true,
        }),
        (error: unknown) =>
            error instanceof AppError && error.statusCode === 401,
    );
});

test('email changes on a pending verified registration require verification again', async (t) => {
    const passwordHash = await bcrypt.hash(registration.password, 4);
    const pendingUser = {
        id: user.id,
        email: registration.email,
        passwordHash,
        firebaseUid: 'firebase-user-1',
        accountType: 'BUSINESS',
        role: 'BUSINESS_ADMIN',
        emailVerified: true,
        tenantId: tenant.id,
        tenant: { isActive: false, businessVerified: false, industry: null },
    };
    mockPrismaMethod(
        t,
        prisma.user,
        'findUnique',
        async (args: { where: { email: string } }) =>
            args.where.email === registration.email ? pendingUser as never : null as never,
    );
    mockPrismaMethod(t, prisma.tenant, 'findUnique', async () => null as never);

    let updatedUser: Record<string, unknown> | undefined;
    mockPrismaMethod(
        t,
        prisma,
        '$transaction',
        async (operation: (transaction: never) => Promise<unknown>) => operation({
            user: {
                update: async (args: { data: Record<string, unknown> }) => {
                    updatedUser = args.data;
                    return { id: user.id };
                },
            },
            tenant: { update: async () => ({ id: tenant.id }) },
        } as never),
    );

    const firebaseAdmin = makeFirebaseAdmin();
    const service = new AuthService(firebaseAdmin, undefined, async () => true);
    let verificationRequested = false;
    service.resendVerificationEmail = async () => {
        verificationRequested = true;
        return { accepted: true };
    };
    const result = await service.changeRegistrationEmail({
        email: registration.email,
        newEmail: 'owner@newnorthwind.example',
        password: registration.password,
    });

    assert.deepEqual(result, { accepted: true });
    assert.equal(updatedUser?.email, 'owner@newnorthwind.example');
    assert.equal(updatedUser?.emailVerified, false);
    assert.equal(updatedUser?.emailVerificationSentAt, null);
    assert.equal(verificationRequested, false);
    assert.deepEqual(firebaseAdmin.events, [
        'firebase-email:firebase-user-1:owner@newnorthwind.example',
    ]);
});
