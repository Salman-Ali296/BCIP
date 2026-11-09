import { Router } from 'express';
import { authMiddleware, requireRoles } from '../../middleware/auth.middleware';
import cancelRoute from '../../routes/api/auth/billing/cancel/route';
import checkoutRoute from '../../routes/api/auth/billing/checkout/route';
import portalRoute from '../../routes/api/auth/billing/portal/route';
import resumeRoute from '../../routes/api/auth/billing/resume/route';
import subscriptionRoute from '../../routes/api/auth/billing/subscription/route';
import webhookRoute from '../../routes/api/auth/billing/webhook/Stripe/route';

const router = Router();

router.use('/webhook/Stripe', webhookRoute);
router.use(authMiddleware, requireRoles('BUSINESS_ADMIN', 'SUPER_ADMIN'));
router.use('/checkout', checkoutRoute);
router.use('/portal', portalRoute);
router.use('/subscription', subscriptionRoute);
router.use('/cancel', cancelRoute);
router.use('/resume', resumeRoute);

export default router;
