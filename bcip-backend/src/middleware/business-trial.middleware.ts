import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/database';
import { Errors } from '../utils/error';
import { getBusinessTrialState } from '../modules/accounts/trial-policy';

export async function requireActiveBusinessTrial(
    req: Request,
    _res: Response,
    next: NextFunction,
): Promise<void> {
    if (!req.tenantId) {
        next(Errors.unauthorized('Tenant context missing'));
        return;
    }

    try {
        const trial = await prisma.businessTrial.findUnique({
            where: { tenantId: req.tenantId },
            select: { acceptedAt: true, expiresAt: true },
        });
        if (!trial || !getBusinessTrialState(trial).active) {
            next(Errors.forbidden('Accept an active 14-day business trial to use the workspace'));
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}
