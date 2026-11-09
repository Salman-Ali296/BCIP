import { Router, Request, Response, NextFunction } from 'express';
import { createPortalSession } from '../../../../../modules/billing/billing.service';
import { Errors } from '../../../../../utils/error';

const router = Router();

router.post('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = _req.user?.tenantId;
        if (!tenantId) throw Errors.unauthorized();
        res.json({ success: true, data: await createPortalSession(tenantId) });
    } catch (error) {
        next(error);
    }
});

export default router;