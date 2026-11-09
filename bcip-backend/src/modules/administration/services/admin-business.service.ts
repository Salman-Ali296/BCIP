import { prisma } from '../../../config/database';
import { Prisma } from '@prisma/client';

export interface BusinessFilters {
    search?: string;
    isActive?: boolean;
    businessVerified?: boolean;
    industry?: string;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface BusinessListItem {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    industry: string | null;
    teamSize: string | null;
    isActive: boolean;
    businessVerified: boolean;
    createdAt: Date;
    _count: {
        users: number;
        complaints: number;
    };
}

export interface BusinessDetail {
    id: string;
    name: string;
    slug: string;
    email: string;
    phone: string | null;
    website: string | null;
    industry: string | null;
    teamSize: string | null;
    description: string | null;
    logoUrl: string | null;
    timezone: string;
    isActive: boolean;
    businessVerified: boolean;
    subscriptionStatus: string | null;
    subscriptionPlan: string | null;
    createdAt: Date;
    updatedAt: Date;
    users: Array<{
        id: string;
        fullName: string;
        email: string;
        role: string;
        accountType: string;
        isActive: boolean;
        emailVerified: boolean;
    }>;
    complaintStats: {
        total: number;
        pending: number;
        inProgress: number;
        resolved: number;
        avgResolutionHours: number;
    };
    documents: Array<{
        id: string;
        documentType: string;
        fileName: string;
        status: string;
        createdAt: Date;
    }>;
}

export class AdminBusinessService {
    async getBusinesses(
        filters: BusinessFilters,
        pagination: PaginationParams
    ): Promise<{ data: BusinessListItem[]; total: number; page: number; totalPages: number }> {
        const page = Math.max(1, pagination.page || 1);
        const limit = Math.min(100, Math.max(1, pagination.limit || 20));
        const skip = (page - 1) * limit;

        const where: Prisma.TenantWhereInput = {};

        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive;
        }

        if (filters.businessVerified !== undefined) {
            where.businessVerified = filters.businessVerified;
        }

        if (filters.industry) {
            where.industry = filters.industry;
        }

        const orderBy: Prisma.TenantOrderByWithRelationInput = {};
        const sortBy = pagination.sortBy || 'createdAt';
        const sortOrder = pagination.sortOrder || 'desc';

        if (sortBy === 'name') {
            orderBy.name = sortOrder;
        } else if (sortBy === 'createdAt') {
            orderBy.createdAt = sortOrder;
        } else {
            orderBy.createdAt = 'desc';
        }

        const [businesses, total] = await Promise.all([
            prisma.tenant.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    industry: true,
                    teamSize: true,
                    isActive: true,
                    businessVerified: true,
                    createdAt: true,
                    _count: {
                        select: {
                            users: true,
                            complaints: true,
                        },
                    },
                },
            }),
            prisma.tenant.count({ where }),
        ]);

        return {
            data: businesses,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getBusinessById(id: string): Promise<BusinessDetail | null> {
        const business = await prisma.tenant.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                slug: true,
                email: true,
                phone: true,
                website: true,
                industry: true,
                teamSize: true,
                description: true,
                logoUrl: true,
                timezone: true,
                isActive: true,
                businessVerified: true,
                subscriptionStatus: true,
                subscriptionPlan: true,
                createdAt: true,
                updatedAt: true,
                users: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true,
                        accountType: true,
                        isActive: true,
                        emailVerified: true,
                    },
                },
                documents: {
                    select: {
                        id: true,
                        documentType: true,
                        fileName: true,
                        status: true,
                        createdAt: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        if (!business) {
            return null;
        }

        // Get complaint statistics
        const [total, pending, inProgress, resolved, resolvedWithTime] = await Promise.all([
            prisma.complaint.count({ where: { tenantId: id } }),
            prisma.complaint.count({
                where: {
                    tenantId: id,
                    status: { in: ['PENDING', 'AI_PROCESSING', 'OPEN'] },
                },
            }),
            prisma.complaint.count({
                where: {
                    tenantId: id,
                    status: { in: ['IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'ESCALATED'] },
                },
            }),
            prisma.complaint.count({
                where: {
                    tenantId: id,
                    status: { in: ['RESOLVED', 'CLOSED'] },
                },
            }),
            prisma.complaint.findMany({
                where: {
                    tenantId: id,
                    status: { in: ['RESOLVED', 'CLOSED'] },
                    resolvedAt: { not: null },
                },
                select: {
                    createdAt: true,
                    resolvedAt: true,
                },
            }),
        ]);

        let avgResolutionHours = 0;
        if (resolvedWithTime.length > 0) {
            const totalResolutionTimeMs = resolvedWithTime.reduce((sum, complaint) => {
                const resolutionTime =
                    complaint.resolvedAt!.getTime() - complaint.createdAt.getTime();
                return sum + resolutionTime;
            }, 0);
            avgResolutionHours =
                totalResolutionTimeMs / resolvedWithTime.length / (1000 * 60 * 60);
        }

        return {
            ...business,
            complaintStats: {
                total,
                pending,
                inProgress,
                resolved,
                avgResolutionHours: Math.round(avgResolutionHours * 10) / 10,
            },
        };
    }

    async updateBusinessStatus(
        id: string,
        data: {
            isActive?: boolean;
            businessVerified?: boolean;
        }
    ): Promise<{ id: string; isActive: boolean; businessVerified: boolean }> {
        const updated = await prisma.tenant.update({
            where: { id },
            data,
            select: {
                id: true,
                isActive: true,
                businessVerified: true,
            },
        });

        return updated;
    }

    async getIndustries(): Promise<string[]> {
        const industries = await prisma.tenant.findMany({
            where: {
                industry: {
                    not: null,
                },
            },
            select: {
                industry: true,
            },
            distinct: ['industry'],
        });

        return industries.map((i) => i.industry!).sort();
    }
}

export const adminBusinessService = new AdminBusinessService();
