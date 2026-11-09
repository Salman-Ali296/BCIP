import { Router, Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { createCheckoutSession } from '../../../../../modules/billing/billing.service';
import { Errors } from '../../../../../utils/error';

const router = Router();
const checkoutSchema = z.object({
    plan: z.enum(['starter', 'growth', 'business']),
    interval: z.enum(['month', 'year']).default('month'),
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const input = checkoutSchema.parse(req.body);
        const tenantId = req.user?.tenantId;
        if (!tenantId) throw Errors.unauthorized();
        res.status(201).json({ success: true, data: await createCheckoutSession(tenantId, input) });
    } catch (error) {
        next(error instanceof ZodError
            ? Errors.validation('Invalid checkout request', {
                fields: error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                })),
            })
            : error);
    }
});

export default router;