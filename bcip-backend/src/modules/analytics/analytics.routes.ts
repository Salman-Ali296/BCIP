import { Router } from 'express';
import { authMiddleware, requireRoles } from '../../middleware/auth.middleware';
import { tenantMiddleware } from '../../middleware/tenant.middleware';
import { requireBusinessFeature } from '../../middleware/business-plan.middleware';
import { getBusinessDashboard } from './business-dashboard.controller';

const router = Router();

router.get(
    '/dashboard',
    authMiddleware,
    tenantMiddleware,
    requireRoles('BUSINESS_ADMIN', 'MANAGER', 'AGENT', 'ESCALATION_AGENT'),
    requireBusinessFeature('complaint_management'),
    getBusinessDashboard,
);

export { router as analyticsRoutes };
