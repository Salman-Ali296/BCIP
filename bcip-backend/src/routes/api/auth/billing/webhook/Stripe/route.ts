import { Router, Request, Response, NextFunction } from 'express';
import { handleStripeEvent, parseStripeEvent, verifyStripeSignature } from '../../../../../../modules/billing/billing.service';
import { Errors } from '../../../../../../utils/error';

const router = Router();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!Buffer.isBuffer(req.body)) {
            throw Errors.validation('Webhook requires the unmodified JSON request body');
        }
        if (!verifyStripeSignature(req.body, req.get('stripe-signature'))) {
            throw Errors.unauthorized('Invalid billing webhook signature');
        }

        await handleStripeEvent(parseStripeEvent(req.body));
        res.json({ received: true });
    } catch (error) {
        next(error);
    }
});

export default router;