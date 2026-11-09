import { prisma } from '../../../config/database';
import { Prisma, ComplaintStatus, Priority, Sentiment } from '@prisma/client';

export interface ComplaintFilters {
    search?: string;
    status?: ComplaintStatus;
    priority?: Priority;
    sentiment?: Sentiment;
    tenantId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    categoryId?: string;
    aiCategory?: string;
}

export interface ComplaintListItem {
    id: string;
    trackingId: string;
    title: string;
    status: ComplaintStatus;
    priority: Priority;
    aiSentiment: Sentiment | null;
    aiCategory: string | null;
    tenantName: string;
    customerEmail: string | null;
    assignedToName: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface ComplaintDetailView {
    id: string;
    trackingId: string;
    title: string;
    description: string;
    status: ComplaintStatus;
    priority: Priority;
    source: string;
    aiCategory: string | null;
    aiCategoryConfidence: number | null;
    aiSentiment: Sentiment | null;
    aiSentimentScore: number | null;
    aiPriority: Priority | null;
    aiSummary: string | null;
    suggestedResponse: string | null;
    isDuplicate: boolean;
    duplicateOfId: string | null;
    resolutionNotes: string | null;
    resolutionType: string | null;
    resolvedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    tenant: {
        id: string;
        name: string;
        email: string;
    };
    customer: {
        id: string;
        fullName: string | null;
        email: string | null;
        phone: string | null;
    } | null;
    assignedTo: {
        id: string;
        fullName: string;
        email: string;
        role: string;
    } | null;
    category: {
        id: string;
        name: string;
    } | null;
    attachments: Array<{
        id: string;
        fileName: string;
        originalName: string | null;
        fileUrl: string;
        mimeType: string;
        fileSize: number | null;
        uploadedAt: Date;
    }>;
    statusHistory: Array<{
        id: string;
        fromStatus: ComplaintStatus | null;
        toStatus: ComplaintStatus;
        comment: string | null;
        changedBy: {
            fullName: string;
            email: string;
        } | null;
        changedAt: Date;
    }>;
    aiProcesses: Array<{
        id: string;
        modelName: string;
        processingType: string;
        status: string;
        confidenceScore: number | null;
        createdAt: Date;
        completedAt: Date | null;
    }>;
}

export class AdminComplaintService {
    async getComplaints(
        filters: ComplaintFilters,
        pagination: { page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }
    ): Promise<{
        data: ComplaintListItem[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const page = Math.max(1, pagination.page || 1);
        const limit = Math.min(100, Math.max(1, pagination.limit || 20));
        const skip = (page - 1) * limit;

        const where: Prisma.ComplaintWhereInput = {};

        if (filters.search) {
            where.OR = [
                { trackingId: { contains: filters.search, mode: 'insensitive' } },
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.priority) {
            where.priority = filters.priority;
        }

        if (filters.sentiment) {
            where.aiSentiment = filters.sentiment;
        }

        if (filters.tenantId) {
            where.tenantId = filters.tenantId;
        }

        if (filters.categoryId) {
            where.categoryId = filters.categoryId;
        }

        if (filters.aiCategory) {
            where.aiCategory = filters.aiCategory;
        }

        if (filters.dateFrom || filters.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom) {
                where.createdAt.gte = filters.dateFrom;
            }
            if (filters.dateTo) {
                where.createdAt.lte = filters.dateTo;
            }
        }

        const orderBy: Prisma.ComplaintOrderByWithRelationInput = {};
        const sortBy = pagination.sortBy || 'createdAt';
        const sortOrder = pagination.sortOrder || 'desc';

        if (sortBy === 'createdAt') {
            orderBy.createdAt = sortOrder;
        } else if (sortBy === 'priority') {
            orderBy.priority = sortOrder;
        } else if (sortBy === 'status') {
            orderBy.status = sortOrder;
        } else {
            orderBy.createdAt = 'desc';
        }

        const [complaints, total] = await Promise.all([
            prisma.complaint.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                select: {
                    id: true,
                    trackingId: true,
                    title: true,
                    status: true,
                    priority: true,
                    aiSentiment: true,
                    aiCategory: true,
                    createdAt: true,
                    updatedAt: true,
                    tenant: {
                        select: {
                            name: true,
                        },
                    },
                    customer: {
                        select: {
                            email: true,
                        },
                    },
                    assignedTo: {
                        select: {
                            fullName: true,
                        },
                    },
                },
            }),
            prisma.complaint.count({ where }),
        ]);

        return {
            data: complaints.map((c) => ({
                id: c.id,
                trackingId: c.trackingId,
                title: c.title,
                status: c.status,
                priority: c.priority,
                aiSentiment: c.aiSentiment,
                aiCategory: c.aiCategory,
                tenantName: c.tenant.name,
                customerEmail: c.customer?.email || null,
                assignedToName: c.assignedTo?.fullName || null,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getComplaintById(id: string): Promise<ComplaintDetailView | null> {
        const complaint = await prisma.complaint.findUnique({
            where: { id },
            select: {
                id: true,
                trackingId: true,
                title: true,
                description: true,
                status: true,
                priority: true,
                source: true,
                aiCategory: true,
                aiCategoryConfidence: true,
                aiSentiment: true,
                aiSentimentScore: true,
                aiPriority: true,
                aiSummary: true,
                suggestedResponse: true,
                isDuplicate: true,
                duplicateOfId: true,
                resolutionNotes: true,
                resolutionType: true,
                resolvedAt: true,
                createdAt: true,
                updatedAt: true,
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                customer: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                    },
                },
                assignedTo: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true,
                    },
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                attachments: {
                    select: {
                        id: true,
                        fileName: true,
                        originalName: true,
                        fileUrl: true,
                        mimeType: true,
                        fileSize: true,
                        uploadedAt: true,
                    },
                },
                statusHistory: {
                    select: {
                        id: true,
                        fromStatus: true,
                        toStatus: true,
                        comment: true,
                        changedBy: {
                            select: {
                                fullName: true,
                                email: true,
                            },
                        },
                        changedAt: true,
                    },
                    orderBy: {
                        changedAt: 'desc',
                    },
                },
                aiProcesses: {
                    select: {
                        id: true,
                        modelName: true,
                        processingType: true,
                        status: true,
                        confidenceScore: true,
                        createdAt: true,
                        completedAt: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        return complaint;
    }

    async getFlaggedComplaints(): Promise<
        Array<{
            id: string;
            trackingId: string;
            title: string;
            priority: Priority;
            status: ComplaintStatus;
            tenantName: string;
            reason: string;
            createdAt: Date;
        }>
    > {
        // Get critical unresolved complaints and high-priority old complaints
        const flagged = await prisma.complaint.findMany({
            where: {
                OR: [
                    {
                        priority: 'CRITICAL',
                        status: {
                            notIn: ['RESOLVED', 'CLOSED'],
                        },
                    },
                    {
                        priority: 'HIGH',
                        status: {
                            in: ['PENDING', 'OPEN'],
                        },
                        createdAt: {
                            lt: new Date(Date.now() - 72 * 60 * 60 * 1000), // Older than 72 hours
                        },
                    },
                    {
                        status: 'ESCALATED',
                    },
                ],
            },
            orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
            take: 50,
            select: {
                id: true,
                trackingId: true,
                title: true,
                priority: true,
                status: true,
                createdAt: true,
                tenant: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        return flagged.map((c) => {
            let reason = '';
            if (c.priority === 'CRITICAL') {
                reason = 'Critical priority complaint';
            } else if (c.status === 'ESCALATED') {
                reason = 'Escalated complaint';
            } else {
                const daysOld = Math.floor(
                    (Date.now() - c.createdAt.getTime()) / (1000 * 60 * 60 * 24)
                );
                reason = `High priority complaint open for ${daysOld} days`;
            }

            return {
                id: c.id,
                trackingId: c.trackingId,
                title: c.title,
                priority: c.priority,
                status: c.status,
                tenantName: c.tenant.name,
                reason,
                createdAt: c.createdAt,
            };
        });
    }

    async getComplaintCategories(): Promise<string[]> {
        const categories = await prisma.complaint.findMany({
            where: {
                aiCategory: {
                    not: null,
                },
            },
            select: {
                aiCategory: true,
            },
            distinct: ['aiCategory'],
        });

        return categories.map((c) => c.aiCategory!).sort();
    }
}

export const adminComplaintService = new AdminComplaintService();
