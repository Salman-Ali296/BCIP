import { Request, Response } from 'express';
import { adminComplaintService } from '../services/admin-complaint.service';
import { ComplaintStatus, Priority, Sentiment } from '@prisma/client';

export class AdminComplaintController {
    async getComplaints(req: Request, res: Response): Promise<void> {
        try {
            const filters = {
                search: req.query.search as string | undefined,
                status: req.query.status as ComplaintStatus | undefined,
                priority: req.query.priority as Priority | undefined,
                sentiment: req.query.sentiment as Sentiment | undefined,
                tenantId: req.query.tenantId as string | undefined,
                categoryId: req.query.categoryId as string | undefined,
                aiCategory: req.query.aiCategory as string | undefined,
                dateFrom: req.query.dateFrom
                    ? new Date(req.query.dateFrom as string)
                    : undefined,
                dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
            };

            const pagination = {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 20,
                sortBy: (req.query.sortBy as string) || 'createdAt',
                sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
            };

            const result = await adminComplaintService.getComplaints(filters, pagination);

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
            console.error('Admin get complaints error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'COMPLAINTS_FETCH_ERROR',
                    message: 'Failed to fetch complaints',
                },
            });
        }
    }

    async getComplaintById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (typeof id !== 'string' || id.length === 0) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_ID',
                        message: 'Complaint ID is required',
                    },
                });
                return;
            }

            const complaint = await adminComplaintService.getComplaintById(id);

            if (!complaint) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'COMPLAINT_NOT_FOUND',
                        message: 'Complaint not found',
                    },
                });
                return;
            }

            res.json({
                success: true,
                data: complaint,
            });
        } catch (error) {
            console.error('Admin get complaint by ID error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'COMPLAINT_FETCH_ERROR',
                    message: 'Failed to fetch complaint details',
                },
            });
        }
    }

    async getFlaggedComplaints(req: Request, res: Response): Promise<void> {
        try {
            const flagged = await adminComplaintService.getFlaggedComplaints();
            res.json({
                success: true,
                data: flagged,
                count: flagged.length,
            });
        } catch (error) {
            console.error('Admin get flagged complaints error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'FLAGGED_FETCH_ERROR',
                    message: 'Failed to fetch flagged complaints',
                },
            });
        }
    }

    async getComplaintCategories(req: Request, res: Response): Promise<void> {
        try {
            const categories = await adminComplaintService.getComplaintCategories();
            res.json({
                success: true,
                data: categories,
            });
        } catch (error) {
            console.error('Admin get complaint categories error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'CATEGORIES_FETCH_ERROR',
                    message: 'Failed to fetch complaint categories',
                },
            });
        }
    }
}

export const adminComplaintController = new AdminComplaintController();
