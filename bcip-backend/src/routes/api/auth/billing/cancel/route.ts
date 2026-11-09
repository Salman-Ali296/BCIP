import { Router, Request, Response, NextFunction } from 'express';
import { cancelSubscription } from '../../../../../modules/billing/billing.service';
import { Errors } from '../../../../../utils/error';

const router = Router();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) throw Errors.unauthorized();
        res.json({ success: true, data: await cancelSubscription(tenantId) });
    } catch (error) {
        next(error);
    }
});

export default router;