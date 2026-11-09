import { prisma } from '../../../config/database';
import { ComplaintStatus, Priority } from '@prisma/client';

export interface DashboardStats {
    totalBusinesses: number;
    totalUsers: number;
    totalComplaints: number;
    pendingComplaints: number;
    inProgressComplaints: number;
    resolvedComplaints: number;
    highPriorityComplaints: number;
    criticalComplaints: number;
    avgResolutionTimeHours: number;
    verifiedBusinesses: number;
    unverifiedBusinesses: number;
}

export interface ComplaintTrend {
    date: string;
    count: number;
    status?: ComplaintStatus;
}

export interface CategoryDistribution {
    category: string;
    count: number;
    percentage: number;
}

export interface PriorityDistribution {
    priority: Priority;
    count: number;
    percentage: number;
}

export interface RecentActivity {
    complaints: Array<{
        id: string;
        trackingId: string;
        title: string;
        status: ComplaintStatus;
        priority: Priority;
        tenantName: string;
        createdAt: Date;
    }>;
    businesses: Array<{
        id: string;
        name: string;
        email: string;
        industry: string | null;
        createdAt: Date;
    }>;
}

export class AdminDashboardService {
    async getDashboardStats(): Promise<DashboardStats> {
        const [
            totalBusinesses,
            totalUsers,
            totalComplaints,
            pendingComplaints,
            inProgressComplaints,
            resolvedComplaints,
            highPriorityComplaints,
            criticalComplaints,
            verifiedBusinesses,
            resolvedComplaintsWithTime,
        ] = await Promise.all([
            prisma.tenant.count(),
            prisma.user.count(),
            prisma.complaint.count(),
            prisma.complaint.count({
                where: {
                    status: {
                        in: ['PENDING', 'AI_PROCESSING', 'OPEN'],
                    },
                },
            }),
            prisma.complaint.count({
                where: {
                    status: {
                        in: ['IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'ESCALATED'],
                    },
                },
            }),
            prisma.complaint.count({
                where: {
                    status: {
                        in: ['RESOLVED', 'CLOSED'],
                    },
                },
            }),
            prisma.complaint.count({
                where: { priority: 'HIGH' },
            }),
            prisma.complaint.count({
                where: { priority: 'CRITICAL' },
            }),
            prisma.tenant.count({
                where: { businessVerified: true },
            }),
            prisma.complaint.findMany({
                where: {
                    status: {
                        in: ['RESOLVED', 'CLOSED'],
                    },
                    resolvedAt: { not: null },
                },
                select: {
                    createdAt: true,
                    resolvedAt: true,
                },
            }),
        ]);

        // Calculate average resolution time
        let avgResolutionTimeHours = 0;
        if (resolvedComplaintsWithTime.length > 0) {
            const totalResolutionTimeMs = resolvedComplaintsWithTime.reduce(
                (sum, complaint) => {
                    const resolutionTime =
                        complaint.resolvedAt!.getTime() - complaint.createdAt.getTime();
                    return sum + resolutionTime;
                },
                0
            );
            avgResolutionTimeHours =
                totalResolutionTimeMs / resolvedComplaintsWithTime.length / (1000 * 60 * 60);
        }

        return {
            totalBusinesses,
            totalUsers,
            totalComplaints,
            pendingComplaints,
            inProgressComplaints,
            resolvedComplaints,
            highPriorityComplaints,
            criticalComplaints,
            avgResolutionTimeHours: Math.round(avgResolutionTimeHours * 10) / 10,
            verifiedBusinesses,
            unverifiedBusinesses: totalBusinesses - verifiedBusinesses,
        };
    }

    async getComplaintTrends(days: number = 30): Promise<ComplaintTrend[]> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const complaints = await prisma.complaint.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: {
                    gte: startDate,
                },
            },
            _count: {
                id: true,
            },
        });

        // Group by date
        const trendsMap = new Map<string, number>();
        complaints.forEach((item) => {
            const date = item.createdAt.toISOString().split('T')[0];
            trendsMap.set(date, (trendsMap.get(date) || 0) + item._count.id);
        });

        // Fill in missing dates
        const trends: ComplaintTrend[] = [];
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            trends.unshift({
                date: dateStr,
                count: trendsMap.get(dateStr) || 0,
            });
        }

        return trends;
    }

    async getCategoryDistribution(): Promise<CategoryDistribution[]> {
        const total = await prisma.complaint.count();
        if (total === 0) {
            return [];
        }

        const categories = await prisma.complaint.groupBy({
            by: ['aiCategory'],
            _count: {
                id: true,
            },
            where: {
                aiCategory: {
                    not: null,
                },
            },
        });

        const uncategorized = await prisma.complaint.count({
            where: {
                aiCategory: null,
            },
        });

        const distribution: CategoryDistribution[] = categories.map((cat) => ({
            category: cat.aiCategory || 'Uncategorized',
            count: cat._count.id,
            percentage: Math.round((cat._count.id / total) * 100 * 10) / 10,
        }));

        if (uncategorized > 0) {
            distribution.push({
                category: 'Uncategorized',
                count: uncategorized,
                percentage: Math.round((uncategorized / total) * 100 * 10) / 10,
            });
        }

        return distribution.sort((a, b) => b.count - a.count);
    }

    async getPriorityDistribution(): Promise<PriorityDistribution[]> {
        const total = await prisma.complaint.count();
        if (total === 0) {
            return [];
        }

        const priorities = await prisma.complaint.groupBy({
            by: ['priority'],
            _count: {
                id: true,
            },
        });

        return priorities.map((p) => ({
            priority: p.priority,
            count: p._count.id,
            percentage: Math.round((p._count.id / total) * 100 * 10) / 10,
        }));
    }

    async getRecentActivity(limit: number = 10): Promise<RecentActivity> {
        const [complaints, businesses] = await Promise.all([
            prisma.complaint.findMany({
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    trackingId: true,
                    title: true,
                    status: true,
                    priority: true,
                    createdAt: true,
                    tenant: {
                        select: {
                            name: true,
                        },
                    },
                },
            }),
            prisma.tenant.findMany({
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    industry: true,
                    createdAt: true,
                },
            }),
        ]);

        return {
            complaints: complaints.map((c) => ({
                id: c.id,
                trackingId: c.trackingId,
                title: c.title,
                status: c.status,
                priority: c.priority,
                tenantName: c.tenant.name,
                createdAt: c.createdAt,
            })),
            businesses,
        };
    }

    async getCriticalAlerts(): Promise<
        Array<{
            id: string;
            trackingId: string;
            title: string;
            priority: Priority;
            status: ComplaintStatus;
            tenantName: string;
            createdAt: Date;
            daysOpen: number;
        }>
    > {
        const criticalComplaints = await prisma.complaint.findMany({
            where: {
                OR: [
                    { priority: 'CRITICAL' },
                    {
                        priority: 'HIGH',
                        status: {
                            in: ['PENDING', 'OPEN', 'IN_PROGRESS'],
                        },
                        createdAt: {
                            lt: new Date(Date.now() - 48 * 60 * 60 * 1000), // Older than 48 hours
                        },
                    },
                ],
                status: {
                    notIn: ['RESOLVED', 'CLOSED'],
                },
            },
            orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
            take: 20,
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

        return criticalComplaints.map((c) => {
            const daysOpen = Math.floor(
                (Date.now() - c.createdAt.getTime()) / (1000 * 60 * 60 * 24)
            );
            return {
                id: c.id,
                trackingId: c.trackingId,
                title: c.title,
                priority: c.priority,
                status: c.status,
                tenantName: c.tenant.name,
                createdAt: c.createdAt,
                daysOpen,
            };
        });
    }
}

export const adminDashboardService = new AdminDashboardService();
