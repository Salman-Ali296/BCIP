import { Router, Request, Response, NextFunction } from 'express';
import { resumeBusinessSubscription } from '../../../../../modules/billing/billing.controller';

const router = Router();

router.post('/', (req: Request, res: Response, next: NextFunction) =>
    resumeBusinessSubscription(req, res, next),
);

export default router;