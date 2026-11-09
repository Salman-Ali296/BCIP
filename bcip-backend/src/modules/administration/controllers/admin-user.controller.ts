import { Request, Response } from 'express';
import { adminUserService } from '../services/admin-user.service';
import { Role, AccountType } from '@prisma/client';

export class AdminUserController {
    async getUsers(req: Request, res: Response): Promise<void> {
        try {
            const filters = {
                search: req.query.search as string | undefined,
                role: req.query.role as Role | undefined,
                accountType: req.query.accountType as AccountType | undefined,
                isActive:
                    req.query.isActive !== undefined
                        ? req.query.isActive === 'true'
                        : undefined,
                emailVerified:
                    req.query.emailVerified !== undefined
                        ? req.query.emailVerified === 'true'
                        : undefined,
                tenantId: req.query.tenantId as string | undefined,
            };

            const pagination = {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 20,
                sortBy: (req.query.sortBy as string) || 'createdAt',
                sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
            };

            const result = await adminUserService.getUsers(filters, pagination);

            res.json({
                success: true,
                data: result.data,
                pagination: {
                    page: result.page,
                    limit: pagination.limit,
                    total: result.total,
                    totalPages: result.totalPages,
                },
            });
        } catch (error) {
            console.error('Admin get users error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'USERS_FETCH_ERROR',
                    message: 'Failed to fetch users',
                },
            });
        }
    }

    async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (typeof id !== 'string' || id.length === 0) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_ID',
                        message: 'User ID is required',
                    },
                });
                return;
            }

            const user = await adminUserService.getUserById(id);

            if (!user) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: 'User not found',
                    },
                });
                return;
            }

            res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            console.error('Admin get user by ID error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'USER_FETCH_ERROR',
                    message: 'Failed to fetch user details',
                },
            });
        }
    }

    async updateUserRole(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { role } = req.body;

            if (typeof id !== 'string' || id.length === 0) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_ID',
                        message: 'User ID is required',
                    },
                });
                return;
            }

            if (!role || !Object.values(Role).includes(role)) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_ROLE',
                        message: 'Valid role is required',
                    },
                });
                return;
            }

            await adminUserService.updateUserRole(id, role);

            res.json({
                success: true,
                message: 'User role updated successfully',
            });
        } catch (error) {
            console.error('Admin update user role error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'USER_UPDATE_ERROR',
                    message: 'Failed to update user role',
                },
            });
        }
    }

    async toggleUserStatus(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { isActive } = req.body;

            if (typeof id !== 'string' || id.length === 0) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_ID',
                        message: 'User ID is required',
                    },
                });
                return;
            }

            if (typeof isActive !== 'boolean') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_STATUS',
                        message: 'isActive must be a boolean',
                    },
                });
                return;
            }

            await adminUserService.toggleUserStatus(id, isActive);

            res.json({
                success: true,
                message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            });
        } catch (error) {
            console.error('Admin toggle user status error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'USER_UPDATE_ERROR',
                    message: 'Failed to update user status',
                },
            });
        }
    }

    async getUserStats(req: Request, res: Response): Promise<void> {
        try {
            const stats = await adminUserService.getUserStats();
            res.json({
                success: true,
                data: stats,
            });
        } catch (error) {
            console.error('Admin get user stats error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'STATS_FETCH_ERROR',
                    message: 'Failed to fetch user statistics',
                },
            });
        }
    }
}

export const adminUserController = new AdminUserController();
