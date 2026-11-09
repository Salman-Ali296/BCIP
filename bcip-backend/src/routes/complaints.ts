import { Router, Request, Response, NextFunction } from 'express';
import {
    createComplaint,
    getComplaint,
    listComplaints,
    trackComplaint,
    getTenantBySlug,
    updateComplaintStatus,
    submitCSATFeedback,
    getAIResponseSuggestion,
    escalateComplaint,
} from '../controllers/complaintController';
import { authMiddleware, requireRoles } from '../middleware/auth.middleware';
import { requireActiveBusinessTrial } from '../middleware/business-trial.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import multer from 'multer';
import { uploadComplaintFiles } from '../controllers/complaintController';
import rateLimit from 'express-rate-limit';
import { Errors } from '../utils/error';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 3,
        fieldSize: 10 * 1024,
        fields: 5,
        parts: 8,
    },
    fileFilter: (_req, file, callback) => {
        if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.mimetype)) {
            callback(Errors.validation('Only JPEG, PNG, and PDF attachments are allowed'));
            return;
        }
        callback(null, true);
    },
});

const publicComplaintLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: { code: 'RATE_LIMITED', message: 'Too many complaint requests. Please try again later.' },
    },
});

const publicTrackingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: { code: 'RATE_LIMITED', message: 'Too many tracking requests. Please try again later.' },
    },
});

const router = Router();

function parseComplaintFiles(req: Request, res: Response, next: NextFunction): void {
    upload.array('files', 3)(req, res, (error: unknown) => {
        if (error instanceof multer.MulterError) {
            next(error.code === 'LIMIT_FILE_SIZE'
                ? Errors.payloadTooLarge('Each attachment must be 5 MB or smaller')
                : Errors.validation('Complaint submission contains too many or oversized fields/files'));
            return;
        }
        next(error);
    });
}

/**
 * POST /api/complaints
 * Public endpoint - customer submits complaint
 */
router.post('/', publicComplaintLimiter, parseComplaintFiles, async (req: Request, res: Response, next: NextFunction) => {
    await createComplaint(req, res, next);
});

router.post('/submit', publicComplaintLimiter, parseComplaintFiles, async (req: Request, res: Response, next: NextFunction) => {
    await createComplaint(req, res, next);
});

router.get('/track/:trackingId', publicTrackingLimiter, async (req: Request, res: Response, next: NextFunction) => {
    await trackComplaint(req, res, next);
});

router.get('/tenant/:slug', async (req: Request, res: Response, next: NextFunction) => {
    await getTenantBySlug(req, res, next);
});

/**
 * GET /api/complaints
 * Protected - business views their complaints
 */
router.get(
    '/',
    authMiddleware,
    tenantMiddleware,
    requireRoles('SUPER_ADMIN', 'BUSINESS_ADMIN', 'MANAGER', 'AGENT', 'ESCALATION_AGENT', 'CUSTOMER'),
    (req, res, next) => req.user?.role === 'CUSTOMER'
        ? next()
        : requireActiveBusinessTrial(req, res, next),
    async (req: Request, res: Response, next: NextFunction) => {
        await listComplaints(req, res, next);
    }
);

router.get(
    '/:id',
    authMiddleware,
    tenantMiddleware,
    requireRoles('SUPER_ADMIN', 'BUSINESS_ADMIN', 'MANAGER', 'AGENT', 'ESCALATION_AGENT', 'CUSTOMER'),
    (req, res, next) => req.user?.role === 'CUSTOMER'
        ? next()
        : requireActiveBusinessTrial(req, res, next),
    async (req: Request, res: Response, next: NextFunction) => {
        await getComplaint(req, res, next);
    }
);

/**
 * PATCH /api/complaints/:id
 * Protected - update complaint status
 */
router.patch(
    '/:id',
    authMiddleware,
    tenantMiddleware,
    requireRoles('SUPER_ADMIN', 'BUSINESS_ADMIN', 'MANAGER', 'AGENT', 'ESCALATION_AGENT'),
    requireActiveBusinessTrial,
    async (req: Request, res: Response, next: NextFunction) => {
        await updateComplaintStatus(req, res, next);
    }
);

router.post(
    '/:id/upload',
    authMiddleware,
    tenantMiddleware,
    requireRoles('SUPER_ADMIN', 'BUSINESS_ADMIN', 'MANAGER', 'AGENT', 'ESCALATION_AGENT'),
    requireActiveBusinessTrial,
    parseComplaintFiles,
    async (req: Request, res: Response, next: NextFunction) => {
        await uploadComplaintFiles(req, res, next);
    },
);

/**
 * POST /api/complaints/track/:trackingId/feedback
 * Public customer CSAT feedback
 */
router.post('/track/:trackingId/feedback', publicComplaintLimiter, async (req: Request, res: Response, next: NextFunction) => {
    await submitCSATFeedback(req, res, next);
});

/**
 * POST /api/complaints/:id/suggest-response
 * Protected AI Response Suggestion
 */
router.post(
    '/:id/suggest-response',
    authMiddleware,
    tenantMiddleware,
    requireRoles('SUPER_ADMIN', 'BUSINESS_ADMIN', 'MANAGER', 'AGENT', 'ESCALATION_AGENT'),
    requireActiveBusinessTrial,
    async (req: Request, res: Response, next: NextFunction) => {
        await getAIResponseSuggestion(req, res, next);
    }
);

/**
 * POST /api/complaints/:id/escalate
 * Protected supervisor escalation
 */
router.post(
    '/:id/escalate',
    authMiddleware,
    tenantMiddleware,
    requireRoles('SUPER_ADMIN', 'BUSINESS_ADMIN', 'MANAGER', 'ESCALATION_AGENT'),
    requireActiveBusinessTrial,
    async (req: Request, res: Response, next: NextFunction) => {
        await escalateComplaint(req, res, next);
    }
);

export default router;