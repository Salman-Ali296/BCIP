import { Router } from 'express';
import { authMiddleware, requireRoles } from '../../middleware/auth.middleware';
import {
    createBusinessDemoCheckout,
    changeBusinessSubscription,
    getBusinessBillingHistory,
    listBusinessPlans,
    getBusinessSubscriptionHistory,
    getBusinessUsage,
    getBusinessBillingProfile,
    updateBusinessBillingProfile,
} from './billing.controller';
import cancelRoute from '../../routes/api/auth/billing/cancel/route';
import checkoutRoute from '../../routes/api/auth/billing/checkout/route';
import portalRoute from '../../routes/api/auth/billing/portal/route';
import resumeRoute from '../../routes/api/auth/billing/resume/route';
import subscriptionRoute from '../../routes/api/auth/billing/subscription/route';
import webhookRoute from '../../routes/api/auth/billing/webhook/Stripe/route';

const router = Router();

router.get('/plans', listBusinessPlans);
router.use('/webhook/Stripe', webhookRoute);
router.use(authMiddleware, requireRoles('BUSINESS_ADMIN', 'SUPER_ADMIN'));
router.get('/profile', (req, res, next) => {
    void getBusinessBillingProfile(req, res, next);
});
router.put('/profile', (req, res, next) => {
    void updateBusinessBillingProfile(req, res, next);
});
router.post('/demo-checkout', (req, res, next) => {
    void createBusinessDemoCheckout(req, res, next);
});
router.use('/checkout', checkoutRoute);
router.use('/portal', portalRoute);
router.use('/subscription', subscriptionRoute);
router.post('/subscription/change', (req, res, next) => {
    void changeBusinessSubscription(req, res, next);
});
router.get('/subscription/usage', (req, res, next) => {
    void getBusinessUsage(req, res, next);
});
router.get('/subscription/history', (req, res, next) => {
    void getBusinessSubscriptionHistory(req, res, next);
});
router.get('/history', (req, res, next) => {
    void getBusinessBillingHistory(req, res, next);
});
router.use('/cancel', cancelRoute);
router.use('/resume', resumeRoute);

export default router;
