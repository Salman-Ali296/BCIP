import { Request, Response } from 'express';
import { adminBusinessService } from '../services/admin-business.service';
import { Prisma } from '@prisma/client';

export class AdminBusinessController {
    async getBusinesses(req: Request, res: Response): Promise<void> {
        try {
            const filters = {
                search: req.query.search as string | undefined,
                isActive:
                    req.query.isActive !== undefined
                        ? req.query.isActive === 'true'
                        : undefined,
                businessVerified:
                    req.query.businessVerified !== undefined
                        ? req.query.businessVerified === 'true'
                        : undefined,
                industry: req.query.industry as string | undefined,
            };

            const pagination = {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 20,
                sortBy: (req.query.sortBy as string) || 'createdAt',
                sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
            };

            const result = await adminBusinessService.getBusinesses(filters, pagination);

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
            console.error('Admin get businesses error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'BUSINESSES_FETCH_ERROR',
                    message: 'Failed to fetch businesses',
                },
            });
        }
    }

    async getBusinessById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (typeof id !== 'string' || id.length === 0) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_ID',
                        message: 'Business ID is required',
                    },
                });
                return;
            }

            const business = await adminBusinessService.getBusinessById(id);

            if (!business) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'BUSINESS_NOT_FOUND',
                        message: 'Business not found',
                    },
                });
                return;
            }

            res.json({
                success: true,
                data: business,
            });
        } catch (error) {
            console.error('Admin get business by ID error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'BUSINESS_FETCH_ERROR',
                    message: 'Failed to fetch business details',
                },
            });
        }
    }

    async updateBusinessStatus(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { isActive, businessVerified } = req.body;

            if (typeof id !== 'string' || id.length === 0) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_ID',
                        message: 'Business ID is required',
                    },
                });
                return;
            }

            if (isActive === undefined && businessVerified === undefined) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_DATA',
                        message: 'At least one status field is required',
                    },
                });
                return;
            }

            const data: { isActive?: boolean; businessVerified?: boolean } = {};
            if (isActive !== undefined) data.isActive = Boolean(isActive);
            if (businessVerified !== undefined)
                data.businessVerified = Boolean(businessVerified);

            const updated = await adminBusinessService.updateBusinessStatus(id, data);

            res.json({
                success: true,
                message: 'Business status updated successfully',
                data: updated,
            });
        } catch (error) {
            console.error('Admin update business status error:', error);

            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'BUSINESS_NOT_FOUND',
                        message: 'Business not found',
                    },
                });
                return;
            }

            res.status(500).json({
                success: false,
                error: {
                    code: 'BUSINESS_UPDATE_ERROR',
                    message: 'Failed to update business status',
                },
            });
        }
    }

    async getIndustries(req: Request, res: Response): Promise<void> {
        try {
            const industries = await adminBusinessService.getIndustries();
            res.json({
                success: true,
                data: industries,
            });
        } catch (error) {
            console.error('Admin get industries error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INDUSTRIES_FETCH_ERROR',
                    message: 'Failed to fetch industries',
                },
            });
        }
    }
}

export const adminBusinessController = new AdminBusinessController();
