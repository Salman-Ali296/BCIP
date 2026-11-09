import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import type { Prisma } from '@prisma/client';

import { getFirebaseAuth } from '../config/firebase-admin';
import { prisma } from '../config/database';
import { Errors } from '../utils/error';

const accountSelect = {
    id: true,
    email: true,
    role: true,
    accountType: true,
    tenantId: true,
    emailVerified: true,
    isActive: true,
    tenant: {
        select: {
            isActive: true,
            businessVerified: true,
        },
    },
} satisfies Prisma.UserSelect;

export type FirebaseAccount = Prisma.UserGetPayload<{ select: typeof accountSelect }>;

const invalidTokenErrorCodes = new Set([
    'auth/argument-error',
    'auth/id-token-expired',
    'auth/id-token-revoked',
    'auth/invalid-id-token',
    'auth/user-disabled',
    'auth/user-not-found',
]);

interface FirebaseAuthDependencies {
    verifyIdToken: (
        token: string,
        checkRevoked: true,
    ) => Promise<DecodedIdToken>;
    findAccountByFirebaseUid: (uid: string) => Promise<FirebaseAccount | null>;
}

function unauthorized(): Error {
    return Errors.unauthorized('Invalid or expired authentication token');
}

export function createFirebaseAuthMiddleware(
    dependencies: FirebaseAuthDependencies,
): RequestHandler {
    return async (
        req: Request,
        _res: Response,
        next: NextFunction,
    ): Promise<void> => {
        const authorization = req.headers.authorization;
        const match = typeof authorization === 'string'
            ? /^Bearer ([^\s]+)$/i.exec(authorization)
            : null;

        if (!match) {
            next(unauthorized());
            return;
        }

        let decodedToken: DecodedIdToken;
        try {
            decodedToken = await dependencies.verifyIdToken(match[1], true);
        } catch (error) {
            if (
                error instanceof Error &&
                'code' in error &&
                typeof error.code === 'string' &&
                invalidTokenErrorCodes.has(error.code)
            ) {
                next(unauthorized());
                return;
            }
            next(error);
            return;
        }

        if (
            typeof decodedToken.uid !== 'string' ||
            decodedToken.uid.length === 0
        ) {
            next(unauthorized());
            return;
        }
        if (decodedToken.email_verified !== true) {
            next(Errors.emailNotVerified());
            return;
        }

        const account = await dependencies.findAccountByFirebaseUid(decodedToken.uid);
        if (!account) {
            next(unauthorized());
            return;
        }
        if (!account.isActive || !account.tenant.isActive) {
            next(Errors.accountSuspended());
            return;
        }
        if (!account.emailVerified) {
            next(Errors.emailNotVerified());
            return;
        }
        if (
            account.accountType === 'BUSINESS' &&
            !account.tenant.businessVerified
        ) {
            next(Errors.businessVerificationPending());
            return;
        }

        req.firebaseUser = decodedToken;
        req.user = {
            id: account.id,
            email: account.email,
            role: account.role,
            accountType: account.accountType,
            tenantId: account.tenantId,
            emailVerified: account.emailVerified,
            isActive: account.isActive,
        };
        req.tenantId = account.tenantId;
        next();
    };
}

export const requireFirebaseAuth = createFirebaseAuthMiddleware({
    verifyIdToken: (token, checkRevoked) =>
        getFirebaseAuth().verifyIdToken(token, checkRevoked),
    findAccountByFirebaseUid: (uid) =>
        prisma.user.findUnique({
            where: { firebaseUid: uid },
            select: accountSelect,
        }),
});