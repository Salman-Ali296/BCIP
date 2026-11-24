import { NextFunction, Request, Response } from 'express';
import { Errors } from '../utils/error';
import { getBusinessPlanAccess } from '../modules/billing/business-access.service';
import type { BusinessFeature } from '../modules/billing/business-plans';

export function requireBusinessFeature(feature: BusinessFeature) {
    return async function businessFeatureMiddleware(
        req: Request,
        _res: Response,
        next: NextFunction,
    ): Promise<void> {
        const tenantId = req.tenantId;
        if (!tenantId) {
            next(Errors.unauthorized('Tenant context missing'));
            return;
        }

        try {
            const access = await getBusinessPlanAccess(tenantId);
            if (!access.active || access.features?.[feature] !== true) {
                next(Errors.forbidden('An active plan with access to this feature is required'));
                return;
            }
            req.businessPlanAccess = access;
            next();
        } catch (error) {
            next(error);
        }
    };
}
