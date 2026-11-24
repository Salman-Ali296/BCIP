import { Router, Request, Response, NextFunction } from 'express';
import { getBusinessSubscription } from '../../../../../modules/billing/billing.controller';

const router = Router();

router.get('/', (req: Request, res: Response, next: NextFunction) =>
    getBusinessSubscription(req, res, next),
);

export default router;