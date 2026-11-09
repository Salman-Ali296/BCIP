
import { Router } from 'express';
import { authController } from './auth.controller';
import { authMiddleware, requireRoles } from '../../middleware/auth.middleware';
import { requireFirebaseAuth } from '../../middleware/firebase-auth.middleware';
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
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: authRateLimitResponse,
});
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: authRateLimitResponse,
});
const verificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
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

// Public routes
router.post('/register', registerLimiter, authController.register.bind(authController));
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
    authController.businessTrialStatus.bind(authController),
);
router.post(
    '/trial/accept',
    authMiddleware,
    requireRoles('BUSINESS_ADMIN'),
    authController.acceptBusinessTrial.bind(authController),
);
router.post(
    '/trial/onboarding',
    authMiddleware,
    requireRoles('BUSINESS_ADMIN'),
    authController.completeBusinessOnboarding.bind(authController),
);
router.use('/billing', billingRoutes);

export default router;