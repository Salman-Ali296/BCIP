// This file is just for endpoints and rate Limiters. All the logic should be in the controller.


import { Router } from 'express';
import { authController } from './auth.controller';
import { authMiddleware, requireRoles } from '../../middleware/auth.middleware';
import { requireFirebaseAuth } from '../../middleware/firebase-auth.middleware';
import {
    acceptBusinessTrial,
    getBusinessTrialStatus,
} from './business-trial.controller';
import {
    acceptBusinessInvitation,
    completeBusinessWorkspaceOnboarding,
    createBusinessInvitation,
    getBusinessOnboarding,
    inspectBusinessInvitation,
    saveBusinessOnboardingStep,
} from './business-onboarding.controller';
import billingRoutes from '../billing/billing.routes';
import rateLimit from 'express-rate-limit';

const router = Router();
const authRateLimitResponse = {
    success: false,
    error: {
        code: 'RATE_LIMITED',
        message: 'Too many authentication requests. Please try again later.',
    },
};
// Limits are per client IP. The Next.js auth proxy forwards the browser IP
// (bcip-frontend/src/lib/server/auth-backend.ts) and app.ts trusts one hop.
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: authRateLimitResponse,
});
// The registration wizard calls /registration/account and /registration/complete
// after /register. They had shared registerLimiter, so a single sign-up used
// 3 of the 5 hourly attempts and a retry or two blocked the user.
const registrationStepLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: authRateLimitResponse,
});
// One sign-in makes two calls through this limiter (/login + /session-upgrade,
// or /firebase-bootstrap + /firebase-login). Counting only failed requests
// keeps the brute-force protection without blocking people who sign in normally.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: authRateLimitResponse,
});
// Wrong verification codes are what this guards against; a correct code
// shouldn't use up an attempt.
const verificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: authRateLimitResponse,
});
const resendVerificationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: authRateLimitResponse,
});
const registrationEmailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: authRateLimitResponse,
});
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: authRateLimitResponse,
});
const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: authRateLimitResponse,
});
const businessInvitationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: authRateLimitResponse,
});
const acceptInvitationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: authRateLimitResponse,
});

// Public routes
router.post('/register', registerLimiter, authController.register.bind(authController));
router.get('/verification-policy', authController.verificationPolicy.bind(authController));
router.post(
    '/registration/email',
    registrationEmailLimiter,
    authController.changeRegistrationEmail.bind(authController),
);
router.post(
    '/registration/complete',
    registrationStepLimiter,
    authController.completeBusinessRegistration.bind(authController),
);
router.patch(
    '/registration/account',
    registrationStepLimiter,
    authController.updateRegistrationAccount.bind(authController),
);
router.post('/login', loginLimiter, authController.login.bind(authController));
router.post(
    '/firebase-bootstrap',
    loginLimiter,
    authController.bootstrapFirebaseLogin.bind(authController),
);
router.post(
    '/firebase-login',
    loginLimiter,
    requireFirebaseAuth,
    authController.firebaseLogin.bind(authController),
);
router.post(
    '/session-upgrade',
    loginLimiter,
    authMiddleware,
    authController.upgradeSession.bind(authController),
);
router.post('/logout', authController.logout.bind(authController));
router.post(
    '/resend-verification',
    resendVerificationLimiter,
    authController.resendVerification.bind(authController),
);
router.post('/forgot-password', forgotPasswordLimiter, authController.forgotPassword.bind(authController));
router.post('/reset-password', resetPasswordLimiter, authController.resetPassword.bind(authController));
router.get('/verify-email', verificationLimiter, authController.verifyEmail.bind(authController));
router.post('/verify-email', verificationLimiter, authController.verifyEmail.bind(authController));
router.get('/me', authMiddleware, authController.profile.bind(authController));
router.get('/me/qr', authMiddleware, authController.profileQr.bind(authController));
router.get(
    '/trial',
    authMiddleware,
    requireRoles('BUSINESS_ADMIN', 'MANAGER', 'AGENT', 'ESCALATION_AGENT'),
    getBusinessTrialStatus,
);
router.post(
    '/trial/accept',
    authMiddleware,
    requireRoles('BUSINESS_ADMIN'),
    acceptBusinessTrial,
);
router.get(
    '/onboarding',
    authMiddleware,
    requireRoles('BUSINESS_ADMIN'),
    getBusinessOnboarding,
);
router.put(
    '/onboarding/steps/:step',
    authMiddleware,
    requireRoles('BUSINESS_ADMIN'),
    saveBusinessOnboardingStep,
);
router.post(
    '/onboarding/complete',
    authMiddleware,
    requireRoles('BUSINESS_ADMIN'),
    completeBusinessWorkspaceOnboarding,
);
router.post(
    '/onboarding/invitations',
    businessInvitationLimiter,
    authMiddleware,
    requireRoles('BUSINESS_ADMIN'),
    createBusinessInvitation,
);
router.post(
    '/invitations/preview',
    acceptInvitationLimiter,
    inspectBusinessInvitation,
);
router.post(
    '/invitations/accept',
    acceptInvitationLimiter,
    acceptBusinessInvitation,
);
router.use('/billing', billingRoutes);

export default router;