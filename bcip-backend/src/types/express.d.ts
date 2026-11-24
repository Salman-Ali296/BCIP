
import 'express';
import type { User } from '@prisma/client';
import type { DecodedIdToken } from 'firebase-admin/auth';
import type { BusinessPlanAccess } from '../modules/billing/business-plans';

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
            businessPlanAccess?: BusinessPlanAccess;
            correlationId?: string;
            requestId?: string;
        }
    }
}

export {};
