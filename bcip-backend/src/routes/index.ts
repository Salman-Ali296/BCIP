import { Router } from 'express';
import authRoutes from '../modules/accounts/auth.routes';
import {analyticsRoutes} from '../modules/analytics/analytics.routes';
import {adminRoutes} from '../modules/administration/admin.routes';
import {notificationRoutes} from '../modules/notifications/notification.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);

export default router;