import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';
import { Errors } from '../../utils/error';
import { prisma } from '../../config/database';
import {
    BILLING_INTERVALS,
    PURCHASABLE_BUSINESS_PLAN_IDS,
} from './business-plans';
import { listPublicBusinessPlans } from './plan-catalog.service';
import {
    cancelSubscription,
    changeSubscriptionPlan,
    createDemoCheckout,
    createCheckoutSession,
    createPortalSession,
    getBillingHistory,
    getSubscription,
    resumeSubscription,
} from './billing.service';
import { getTenantUsage } from './usage.service';
import {
    billingProfileSchema,
    getBillingProfileForTenant,
    saveBillingProfile,
} from './billing-profile.service';

const checkoutSchema = z.object({
    plan: z.enum(PURCHASABLE_BUSINESS_PLAN_IDS),
    interval: z.enum(BILLING_INTERVALS).default('month'),
});
const demoCheckoutSchema = z.object({
    plan: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(60),
    interval: z.enum(BILLING_INTERVALS).default('month'),
});

function getTenantId(req: Request): string {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw Errors.unauthorized();
    return tenantId;
}

function forwardError(error: unknown, next: NextFunction): void {
    if (error instanceof ZodError) {
        next(Errors.validation('Invalid checkout request', {
            fields: error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            })),
        }));
        return;
    }
    next(error);
}

export async function listBusinessPlans(
    _req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const plans = await listPublicBusinessPlans();
        res.json({ success: true, data: plans });
    } catch (error) {
        next(error);
    }
}

export async function createBusinessCheckout(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const input = checkoutSchema.parse(req.body);
        const result = await createCheckoutSession(getTenantId(req), input);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        forwardError(error, next);
    }
}

export async function createBusinessDemoCheckout(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const input = demoCheckoutSchema.parse(req.body);
        const result = await createDemoCheckout(getTenantId(req), input);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        forwardError(error, next);
    }
}

export async function createBusinessPortal(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        res.json({
            success: true,
            data: await createPortalSession(getTenantId(req)),
        });
    } catch (error) {
        next(error);
    }
}

export async function getBusinessSubscription(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        res.json({
            success: true,
            data: await getSubscription(getTenantId(req)),
        });
    } catch (error) {
        next(error);
    }
}

export async function cancelBusinessSubscription(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        res.json({
            success: true,
            data: await cancelSubscription(getTenantId(req)),
        });
    } catch (error) {
        next(error);
    }
}

export async function resumeBusinessSubscription(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        res.json({
            success: true,
            data: await resumeSubscription(getTenantId(req)),
        });
    } catch (error) {
        next(error);
    }
}

export async function changeBusinessSubscription(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const input = checkoutSchema.parse(req.body);
        res.json({
            success: true,
            data: await changeSubscriptionPlan(getTenantId(req), input),
        });
    } catch (error) {
        forwardError(error, next);
    }
}

export async function getBusinessBillingProfile(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        res.json({
            success: true,
            data: await getBillingProfileForTenant(getTenantId(req)),
        });
    } catch (error) {
        next(error);
    }
}

export async function updateBusinessBillingProfile(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const input = billingProfileSchema.parse(req.body);
        const profile = await saveBillingProfile(getTenantId(req), input);
        res.json({ success: true, data: { saved: true, profile } });
    } catch (error) {
        if (error instanceof ZodError) {
            next(Errors.validation('Check the highlighted billing details', {
                fields: error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                })),
            }));
            return;
        }
        next(error);
    }
}

export async function getBusinessUsage(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const usage = await getTenantUsage(getTenantId(req));
        if (!usage) {
            next(Errors.notFound('A current business plan'));
            return;
        }
        res.json({ success: true, data: usage });
    } catch (error) {
        next(error);
    }
}

export async function getBusinessSubscriptionHistory(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const tenantId = getTenantId(req);
        const history = await prisma.subscriptionHistory.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        res.json({ success: true, data: history });
    } catch (error) {
        next(error);
    }
}

export async function getBusinessBillingHistory(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        res.json({
            success: true,
            data: await getBillingHistory(getTenantId(req)),
        });
    } catch (error) {
        next(error);
    }
}
