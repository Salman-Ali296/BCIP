import assert from 'node:assert/strict';
import test from 'node:test';
import type { NextFunction, Request, Response } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import {
    createFirebaseAuthMiddleware,
    type FirebaseAuthDependencies,
    type FirebaseAccount,
} from '../src/middleware/firebase-auth.middleware';
import { AppError } from '../src/utils/error';

const decodedToken: DecodedIdToken = {
    aud: 'bcip-7cee0',
    auth_time: 1,
    exp: 2_000_000_000,
    firebase: {
        identities: {},
        sign_in_provider: 'password',
    },
    iat: 1,
    iss: 'https://securetoken.google.com/bcip-7cee0',
    sub: 'firebase-user-1',
    uid: 'firebase-user-1',
    email: 'customer@example.com',
    email_verified: true,
};

function makeAccount(overrides: Partial<FirebaseAccount> = {}): FirebaseAccount {
    return {
        id: 'account-1',
        email: 'customer@example.com',
        role: 'CUSTOMER',
        accountType: 'CUSTOMER',
        tenantId: 'tenant-db',
        emailVerified: true,
        isActive: true,
        tenant: { isActive: true, businessVerified: true },
        ...overrides,
    };
}

async function runMiddleware(
    authorization: string | undefined,
    dependencies: FirebaseAuthDependencies,
    extraRequestValues: Record<string, unknown> = {},
) {
    const request = {
        headers: authorization ? { authorization } : {},
        ...extraRequestValues,
    } as Request;
    let nextError: unknown;
    let nextCalled = false;
    const next: NextFunction = (error) => {
        nextCalled = true;
        nextError = error;
    };

    await createFirebaseAuthMiddleware(dependencies)(
        request,
        {} as Response,
        next,
    );

    return { request, nextCalled, nextError };
}

function makeDependencies(
    account: ReturnType<typeof makeAccount> | null = makeAccount(),
    verifyToken: FirebaseAuthDependencies['verifyIdToken'] = async () => decodedToken,
): FirebaseAuthDependencies {
    return {
        verifyIdToken: verifyToken,
        findAccountByFirebaseUid: async () => account,
    };
}

test('Firebase middleware rejects a missing or malformed bearer token', async () => {
    for (const authorization of [undefined, 'Basic token', 'Bearer token with-space']) {
        const result = await runMiddleware(
            authorization,
            makeDependencies(),
        );

        assert.ok(result.nextError instanceof AppError);
        assert.equal(result.nextError.code, 'UNAUTHORIZED');
    }
});

test('Firebase middleware verifies tokens with revocation checking enabled', async () => {
    let revocationCheckEnabled = false;
    const result = await runMiddleware('Bearer firebase-token', {
        verifyIdToken: async (token, checkRevoked) => {
            assert.equal(token, 'firebase-token');
            revocationCheckEnabled = checkRevoked;
            return decodedToken;
        },
        findAccountByFirebaseUid: async (uid) => {
            assert.equal(uid, decodedToken.uid);
            return makeAccount();
        },
    });

    assert.equal(revocationCheckEnabled, true);
    assert.equal(result.nextError, undefined);
    assert.equal(result.request.user?.id, 'account-1');
    assert.equal(result.request.tenantId, 'tenant-db');
});

test('Firebase middleware rejects invalid, expired, or revoked Firebase ID tokens uniformly', async () => {
    const result = await runMiddleware('Bearer firebase-token', makeDependencies(
        makeAccount(),
        async () => {
            throw Object.assign(new Error('internal token details'), {
                code: 'auth/id-token-revoked',
            });
        },
    ));

    assert.ok(result.nextError instanceof AppError);
    assert.equal(result.nextError.code, 'UNAUTHORIZED');
    assert.equal(result.nextError.message, 'Invalid or expired authentication token');
});

test('Firebase middleware forwards non-token verification failures as server errors', async () => {
    const serviceError = Object.assign(new Error('Firebase service unavailable'), {
        code: 'auth/network-request-failed',
    });
    const result = await runMiddleware(
        'Bearer firebase-token',
        makeDependencies(makeAccount(), async () => {
            throw serviceError;
        }),
    );

    assert.equal(result.nextError, serviceError);
});

test('Firebase middleware requires verified Firebase and BCIP email status', async () => {
    const unverifiedFirebaseToken: DecodedIdToken = {
        ...decodedToken,
        email_verified: false,
    };
    const firebaseResult = await runMiddleware(
        'Bearer firebase-token',
        makeDependencies(null, async () => unverifiedFirebaseToken),
    );
    assert.ok(firebaseResult.nextError instanceof AppError);
    assert.equal(firebaseResult.nextError.code, 'EMAIL_NOT_VERIFIED');

    const bcipResult = await runMiddleware(
        'Bearer firebase-token',
        makeDependencies(makeAccount({ emailVerified: false })),
    );
    assert.ok(bcipResult.nextError instanceof AppError);
    assert.equal(bcipResult.nextError.code, 'EMAIL_NOT_VERIFIED');
});

test('Firebase middleware does not auto-create or match accounts by email', async () => {
    let lookupUid: string | undefined;
    const result = await runMiddleware('Bearer firebase-token', {
        verifyIdToken: async () => decodedToken,
        findAccountByFirebaseUid: async (uid) => {
            lookupUid = uid;
            return null;
        },
    });

    assert.equal(lookupUid, decodedToken.uid);
    assert.ok(result.nextError instanceof AppError);
    assert.equal(result.nextError.code, 'UNAUTHORIZED');
});

test('Firebase middleware rejects inactive accounts and tenants', async () => {
    for (const account of [
        makeAccount({ isActive: false }),
        makeAccount({ tenant: { isActive: false, businessVerified: true } }),
    ]) {
        const result = await runMiddleware(
            'Bearer firebase-token',
            makeDependencies(account),
        );
        assert.ok(result.nextError instanceof AppError);
        assert.equal(result.nextError.code, 'ACCOUNT_SUSPENDED');
    }
});

test('Firebase middleware applies the authoritative business verification gate', async () => {
    const businessAccount = makeAccount({
        accountType: 'BUSINESS',
        role: 'BUSINESS_ADMIN',
        tenant: { isActive: true, businessVerified: false },
    });
    const result = await runMiddleware(
        'Bearer firebase-token',
        makeDependencies(businessAccount),
    );

    assert.ok(result.nextError instanceof AppError);
    assert.equal(result.nextError.code, 'BUSINESS_VERIFICATION_PENDING');
});

test('Firebase middleware overwrites client tenant context with the mapped BCIP tenant', async () => {
    const result = await runMiddleware(
        'Bearer firebase-token',
        makeDependencies(),
        { tenantId: 'tenant-from-client' },
    );

    assert.equal(result.nextError, undefined);
    assert.equal(result.request.tenantId, 'tenant-db');
    assert.equal(result.request.user?.tenantId, 'tenant-db');
    assert.equal(result.request.user?.role, 'CUSTOMER');
});

test('Firebase middleware rejects expired and malformed ID tokens', async () => {
    for (const code of ['auth/id-token-expired', 'auth/invalid-id-token']) {
        const result = await runMiddleware(
            'Bearer firebase-token',
            makeDependencies(makeAccount(), async () => {
                throw Object.assign(new Error('invalid Firebase token'), { code });
            }),
        );

        assert.ok(result.nextError instanceof AppError);
        assert.equal(result.nextError.code, 'UNAUTHORIZED');
    }
});
