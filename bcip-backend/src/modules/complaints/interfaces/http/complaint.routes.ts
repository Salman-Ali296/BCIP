import { Router } from 'express';
import { authMiddleware, requireRoles } from '../../../../middleware/auth.middleware';
import { requireBusinessFeature } from '../../../../middleware/business-plan.middleware';
import { tenantMiddleware } from '../../../../middleware/tenant.middleware';
import { submitComplaint } from './complaint.controller';

const router = Router();

router.post(
    '/',
    authMiddleware,
    tenantMiddleware,
    requireRoles('BUSINESS_ADMIN', 'MANAGER', 'AGENT', 'ESCALATION_AGENT'),
    requireBusinessFeature('complaint_management'),
    submitComplaint,
);

export default router;