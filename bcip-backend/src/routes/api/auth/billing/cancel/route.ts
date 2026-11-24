import { Router, Request, Response, NextFunction } from 'express';
import { cancelBusinessSubscription } from '../../../../../modules/billing/billing.controller';

const router = Router();

router.post('/', (req: Request, res: Response, next: NextFunction) =>
    cancelBusinessSubscription(req, res, next),
);

export default router;