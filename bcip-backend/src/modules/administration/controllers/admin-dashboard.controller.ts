import { Request, Response } from 'express';
import { adminDashboardService } from '../services/admin-dashboard.service';

export class AdminDashboardController {
    async getDashboardStats(req: Request, res: Response): Promise<void> {
        try {
            const stats = await adminDashboardService.getDashboardStats();
            res.json({
                success: true,
                data: stats,
            });
        } catch (error) {
            console.error('Admin dashboard stats error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'DASHBOARD_ERROR',
                    message: 'Failed to fetch dashboard statistics',
                },
            });
        }
    }

    async getComplaintTrends(req: Request, res: Response): Promise<void> {
        try {
            const days = Math.min(90, Math.max(7, Number(req.query.days) || 30));
            const trends = await adminDashboardService.getComplaintTrends(days);
            res.json({
                success: true,
                data: trends,
            });
        } catch (error) {
            console.error('Admin complaint trends error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'TRENDS_ERROR',
                    message: 'Failed to fetch complaint trends',
                },
            });
        }
    }

    async getCategoryDistribution(req: Request, res: Response): Promise<void> {
        try {
            const distribution = await adminDashboardService.getCategoryDistribution();
            res.json({
                success: true,
                data: distribution,
            });
        } catch (error) {
            console.error('Admin category distribution error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'DISTRIBUTION_ERROR',
                    message: 'Failed to fetch category distribution',
                },
            });
        }
    }

    async getPriorityDistribution(req: Request, res: Response): Promise<void> {
        try {
            const distribution = await adminDashboardService.getPriorityDistribution();
            res.json({
                success: true,
                data: distribution,
            });
        } catch (error) {
            console.error('Admin priority distribution error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'DISTRIBUTION_ERROR',
                    message: 'Failed to fetch priority distribution',
                },
            });
        }
    }

    async getRecentActivity(req: Request, res: Response): Promise<void> {
        try {
            const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
            const activity = await adminDashboardService.getRecentActivity(limit);
            res.json({
                success: true,
                data: activity,
            });
        } catch (error) {
            console.error('Admin recent activity error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'ACTIVITY_ERROR',
                    message: 'Failed to fetch recent activity',
                },
            });
        }
    }

    async getCriticalAlerts(req: Request, res: Response): Promise<void> {
        try {
            const alerts = await adminDashboardService.getCriticalAlerts();
            res.json({
                success: true,
                data: alerts,
                count: alerts.length,
            });
        } catch (error) {
            console.error('Admin critical alerts error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'ALERTS_ERROR',
                    message: 'Failed to fetch critical alerts',
                },
            });
        }
    }
}

export const adminDashboardController = new AdminDashboardController();
