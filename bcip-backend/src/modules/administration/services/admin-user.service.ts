import { prisma } from '../../../config/database';
import { Prisma, Role, AccountType } from '@prisma/client';

export interface UserFilters {
    search?: string;
    role?: Role;
    accountType?: AccountType;
    isActive?: boolean;
    emailVerified?: boolean;
    tenantId?: string;
}

export interface UserListItem {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    role: Role;
    accountType: AccountType;
    emailVerified: boolean;
    isActive: boolean;
    tenantName: string;
    createdAt: Date;
    lastLoginAt: Date | null;
}

export interface UserDetail {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    role: Role;
    accountType: AccountType;
    emailVerified: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date | null;
    tenant: {
        id: string;
        name: string;
        email: string;
        isActive: boolean;
        businessVerified: boolean;
    };
    team: {
        id: string;
        name: string;
    } | null;
    assignedComplaintsCount: number;
    resolvedComplaintsCount: number;
}

export class AdminUserService {
    async getUsers(
        filters: UserFilters,
        pagination: { page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }
    ): Promise<{ data: UserListItem[]; total: number; page: number; totalPages: number }> {
        const page = Math.max(1, pagination.page || 1);
        const limit = Math.min(100, Math.max(1, pagination.limit || 20));
        const skip = (page - 1) * limit;

        const where: Prisma.UserWhereInput = {};

        if (filters.search) {
            where.OR = [
                { fullName: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        if (filters.role) {
            where.role = filters.role;
        }

        if (filters.accountType) {
            where.accountType = filters.accountType;
        }

        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive;
        }

        if (filters.emailVerified !== undefined) {
            where.emailVerified = filters.emailVerified;
        }

        if (filters.tenantId) {
            where.tenantId = filters.tenantId;
        }

        const orderBy: Prisma.UserOrderByWithRelationInput = {};
        const sortBy = pagination.sortBy || 'createdAt';
        const sortOrder = pagination.sortOrder || 'desc';

        if (sortBy === 'fullName') {
            orderBy.fullName = sortOrder;
        } else if (sortBy === 'email') {
            orderBy.email = sortOrder;
        } else if (sortBy === 'createdAt') {
            orderBy.createdAt = sortOrder;
        } else if (sortBy === 'lastLoginAt') {
            orderBy.lastLoginAt = sortOrder;
        } else {
            orderBy.createdAt = 'desc';
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true,
                    role: true,
                    accountType: true,
                    emailVerified: true,
                    isActive: true,
                    createdAt: true,
                    lastLoginAt: true,
                    tenant: {
                        select: {
                            name: true,
                        },
                    },
                },
            }),
            prisma.user.count({ where }),
        ]);

        return {
            data: users.map((u) => ({
                id: u.id,
                fullName: u.fullName,
                email: u.email,
                phone: u.phone,
                role: u.role,
                accountType: u.accountType,
                emailVerified: u.emailVerified,
                isActive: u.isActive,
                tenantName: u.tenant.name,
                createdAt: u.createdAt,
                lastLoginAt: u.lastLoginAt,
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getUserById(id: string): Promise<UserDetail | null> {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                role: true,
                accountType: true,
                emailVerified: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                lastLoginAt: true,
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        isActive: true,
                        businessVerified: true,
                    },
                },
                team: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!user) {
            return null;
        }

        const [assignedComplaintsCount, resolvedComplaintsCount] = await Promise.all([
            prisma.complaint.count({
                where: {
                    assignedToId: id,
                },
            }),
            prisma.complaint.count({
                where: {
                    assignedToId: id,
                    status: {
                        in: ['RESOLVED', 'CLOSED'],
                    },
                },
            }),
        ]);

        return {
            ...user,
            assignedComplaintsCount,
            resolvedComplaintsCount,
        };
    }

    async updateUserRole(userId: string, role: Role): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data: { role },
        });
    }

    async toggleUserStatus(userId: string, isActive: boolean): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data: { isActive },
        });
    }

    async getUserStats(): Promise<{
        totalUsers: number;
        activeUsers: number;
        verifiedUsers: number;
        byRole: Array<{ role: Role; count: number }>;
        byAccountType: Array<{ accountType: AccountType; count: number }>;
    }> {
        const [totalUsers, activeUsers, verifiedUsers, byRole, byAccountType] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { isActive: true } }),
            prisma.user.count({ where: { emailVerified: true } }),
            prisma.user.groupBy({
                by: ['role'],
                _count: { id: true },
            }),
            prisma.user.groupBy({
                by: ['accountType'],
                _count: { id: true },
            }),
        ]);

        return {
            totalUsers,
            activeUsers,
            verifiedUsers,
            byRole: byRole.map((r) => ({ role: r.role, count: r._count.id })),
            byAccountType: byAccountType.map((a) => ({
                accountType: a.accountType,
                count: a._count.id,
            })),
        };
    }
}

export const adminUserService = new AdminUserService();
