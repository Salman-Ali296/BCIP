import { Router, Request, Response, NextFunction } from 'express';
import { createBusinessPortal } from '../../../../../modules/billing/billing.controller';

const router = Router();

router.post('/', (req: Request, res: Response, next: NextFunction) =>
    createBusinessPortal(req, res, next),
);

export default router;