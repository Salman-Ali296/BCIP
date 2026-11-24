import { Router, Request, Response, NextFunction } from 'express';
import { createBusinessCheckout } from '../../../../../modules/billing/billing.controller';

const router = Router();

router.post('/', (req: Request, res: Response, next: NextFunction) =>
    createBusinessCheckout(req, res, next),
);

export default router;