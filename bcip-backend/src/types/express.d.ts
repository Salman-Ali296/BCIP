
import 'express';
import type { User } from '@prisma/client';
import type { DecodedIdToken } from 'firebase-admin/auth';

declare global {
    namespace Express {
        interface Request {
            user?: Pick<
                User,
                | 'id'
                | 'email'
                | 'role'
                | 'accountType'
                | 'tenantId'
                | 'emailVerified'
                | 'isActive'
            >;

            firebaseUser?: DecodedIdToken;

            tenantId?: string;
            correlationId?: string;
            requestId?: string;
        }
    }
}

export {};
