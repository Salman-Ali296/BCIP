import { Router } from 'express';
import { authMiddleware, requireRoles } from '../../../../middleware/auth.middleware';
import { requireActiveBusinessTrial } from '../../../../middleware/business-trial.middleware';
import { tenantMiddleware } from '../../../../middleware/tenant.middleware';
import { submitComplaint } from './complaint.controller';

const router = Router();

router.post(
    '/',
    authMiddleware,
    tenantMiddleware,
    requireRoles('BUSINESS_ADMIN', 'MANAGER', 'AGENT', 'ESCALATION_AGENT'),
    requireActiveBusinessTrial,
    submitComplaint,
);

export default router;