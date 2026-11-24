import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { z, ZodError } from 'zod';
import { prisma } from '../../../config/database';
import { BUSINESS_FEATURES } from '../../billing/business-plans';
import { Errors } from '../../../utils/error';

const featureKeys = Object.keys(BUSINESS_FEATURES);
const featureMapSchema = z.record(z.string(), z.boolean()).refine(
    (features) => Object.keys(features).every((feature) => featureKeys.includes(feature)),
    'Only implemented business features can be configured.',
);

const planFields = {
    name: z.string().trim().min(1).max(80),
    audience: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(500),
    currency: z.string().trim().length(3).transform((currency) => currency.toUpperCase()),
    monthlyPriceCents: z.number().int().nonnegative().nullable(),
    annualPriceCents: z.number().int().nonnegative().nullable(),
    complaintLimit: z.number().int().positive().nullable(),
    teamMemberLimit: z.number().int().positive().nullable(),
    aiAnalysisLimit: z.number().int().positive().nullable(),
    storageLimitMb: z.number().int().positive().nullable(),
    retentionDays: z.number().int().positive().nullable(),
    features: featureMapSchema,
    isPublic: z.boolean(),
    displayOrder: z.number().int().nonnegative(),
};

const createPlanSchema = z.object({
    slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(60),
    ...planFields,
});
const updatePlanSchema = z.object(planFields).partial().refine(
    (value) => Object.keys(value).length > 0,
    'At least one plan field must be provided.',
);
const statusSchema = z.object({ isActive: z.boolean() });

function handleValidation(error: unknown, next: NextFunction): void {
    if (error instanceof ZodError) {
        next(Errors.validation('Invalid plan configuration', {
            fields: error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            })),
        }));
        return;
    }
    next(error);
}

export async function listAdminPlans(
    _req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const plans = await prisma.businessPlan.findMany({
            orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
            include: { _count: { select: { subscriptions: true } } },
        });
        res.json({ success: true, data: plans });
    } catch (error) {
        next(error);
    }
}

export async function createAdminPlan(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const input = createPlanSchema.parse(req.body);
        const plan = await prisma.businessPlan.create({
            data: {
                ...input,
                features: input.features as Prisma.InputJsonValue,
            },
        });
        res.status(201).json({ success: true, data: plan });
    } catch (error) {
        handleValidation(error, next);
    }
}

export async function updateAdminPlan(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const id = z.string().min(1).parse(req.params.id);
        const input = updatePlanSchema.parse(req.body);
        const plan = await prisma.businessPlan.update({
            where: { id },
            data: {
                ...input,
                ...(input.features
                    ? { features: input.features as Prisma.InputJsonValue }
                    : {}),
            },
        });
        res.json({ success: true, data: plan });
    } catch (error) {
        handleValidation(error, next);
    }
}

export async function updateAdminPlanStatus(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const id = z.string().min(1).parse(req.params.id);
        const { isActive } = statusSchema.parse(req.body);
        const plan = await prisma.businessPlan.update({
            where: { id },
            data: { isActive },
        });
        res.json({ success: true, data: plan });
    } catch (error) {
        handleValidation(error, next);
    }
}

export async function listAdminSubscriptions(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const limit = z.coerce.number().int().min(1).max(100).default(50)
            .parse(req.query.limit);
        const subscriptions = await prisma.businessSubscription.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                plan: { select: { slug: true, name: true } },
                tenant: { select: { id: true, name: true, email: true } },
            },
        });
        res.json({ success: true, data: subscriptions });
    } catch (error) {
        handleValidation(error, next);
    }
}

export async function getAdminSubscription(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const id = z.string().min(1).parse(req.params.id);
        const subscription = await prisma.businessSubscription.findUnique({
            where: { id },
            include: {
                plan: true,
                tenant: { select: { id: true, name: true, email: true } },
                usageRecords: { orderBy: { periodStart: 'desc' }, take: 100 },
            },
        });
        if (!subscription) {
            next(Errors.notFound('Subscription not found'));
            return;
        }
        const history = await prisma.subscriptionHistory.findMany({
            where: { tenantId: subscription.tenantId },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        res.json({ success: true, data: { ...subscription, history } });
    } catch (error) {
        handleValidation(error, next);
    }
}
