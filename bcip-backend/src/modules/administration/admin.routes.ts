import { Router } from 'express';
import {
    approveBusinessVerification,
    deleteUser,
    getAllUsers,
    getPendingBusinessVerifications,
    getUserById,
    updateUser,
} from '../../controllers/admin.controller';
import { authMiddleware, requireRoles } from '../../middleware/auth.middleware';
import { adminDashboardController } from './controllers/admin-dashboard.controller';
import { adminBusinessController } from './controllers/admin-business.controller';
import { adminComplaintController } from './controllers/admin-complaint.controller';
import { adminUserController } from './controllers/admin-user.controller';
import { adminConfigController } from './controllers/admin-config.controller';

const router = Router();

// Require SUPER_ADMIN role for all admin routes
router.use(authMiddleware, requireRoles('SUPER_ADMIN'));

// ========================================
// Dashboard & Analytics
// ========================================
router.get('/dashboard/stats', adminDashboardController.getDashboardStats.bind(adminDashboardController));
router.get('/dashboard/complaint-trends', adminDashboardController.getComplaintTrends.bind(adminDashboardController));
router.get('/dashboard/category-distribution', adminDashboardController.getCategoryDistribution.bind(adminDashboardController));
router.get('/dashboard/priority-distribution', adminDashboardController.getPriorityDistribution.bind(adminDashboardController));
router.get('/dashboard/recent-activity', adminDashboardController.getRecentActivity.bind(adminDashboardController));
router.get('/dashboard/critical-alerts', adminDashboardController.getCriticalAlerts.bind(adminDashboardController));

// ========================================
// Business Management
// ========================================
router.get('/businesses', adminBusinessController.getBusinesses.bind(adminBusinessController));
router.get('/businesses/industries', adminBusinessController.getIndustries.bind(adminBusinessController));
router.get('/businesses/pending-verification', getPendingBusinessVerifications);
router.get('/businesses/:id', adminBusinessController.getBusinessById.bind(adminBusinessController));
router.patch('/businesses/:id/status', adminBusinessController.updateBusinessStatus.bind(adminBusinessController));
router.post('/businesses/:id/verification', approveBusinessVerification);

// ========================================
// User Management
// ========================================
router.get('/users', adminUserController.getUsers.bind(adminUserController));
router.get('/users/stats', adminUserController.getUserStats.bind(adminUserController));
router.get('/users/:id', adminUserController.getUserById.bind(adminUserController));
router.patch('/users/:id/role', adminUserController.updateUserRole.bind(adminUserController));
router.patch('/users/:id/status', adminUserController.toggleUserStatus.bind(adminUserController));
// Legacy routes for backward compatibility
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// ========================================
// Complaint Monitoring
// ========================================
router.get('/complaints', adminComplaintController.getComplaints.bind(adminComplaintController));
router.get('/complaints/flagged', adminComplaintController.getFlaggedComplaints.bind(adminComplaintController));
router.get('/complaints/categories', adminComplaintController.getComplaintCategories.bind(adminComplaintController));
router.get('/complaints/:id', adminComplaintController.getComplaintById.bind(adminComplaintController));

// ========================================
// Configuration & Categories
// ========================================
router.get('/config/categories', adminConfigController.getCategories.bind(adminConfigController));
router.get('/config/categories/:id', adminConfigController.getCategoryById.bind(adminConfigController));
router.post('/config/categories', adminConfigController.createCategory.bind(adminConfigController));
router.patch('/config/categories/:id', adminConfigController.updateCategory.bind(adminConfigController));
router.delete('/config/categories/:id', adminConfigController.deleteCategory.bind(adminConfigController));

router.get('/config/system', adminConfigController.getSystemConfigs.bind(adminConfigController));
router.get('/config/system/:key', adminConfigController.getSystemConfig.bind(adminConfigController));
router.post('/config/system', adminConfigController.upsertSystemConfig.bind(adminConfigController));

// ========================================
// AI Configuration
// ========================================
router.get('/ai/settings', adminConfigController.getAISettings.bind(adminConfigController));
router.get('/ai/processing-stats', adminConfigController.getAIProcessingStats.bind(adminConfigController));

export { router as adminRoutes };
