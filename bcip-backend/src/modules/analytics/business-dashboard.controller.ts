import { ComplaintStatus, Prisma } from '@prisma/client';
import { z } from 'zod';
import { NextFunction, Request, Response } from 'express';
import { prisma } from '../../config/database';
import { Errors } from '../../utils/error';

const dashboardQuerySchema = z.object({
    range: z.enum(['today', '7d', '30d', '90d', 'custom']).default('30d'),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    grouping: z.enum(['day', 'week', 'month']).default('day'),
    search: z.string().trim().max(80).optional(),
    category: z.string().trim().max(100).optional(),
    sort: z.enum(['newest', 'oldest']).default('newest'),
    status: z.enum([
        'PENDING',
        'AI_PROCESSING',
        'OPEN',
        'IN_PROGRESS',
        'WAITING_FOR_CUSTOMER',
        'ESCALATED',
        'RESOLVED',
        'CLOSED',
        'REOPENED',
    ]).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(25).default(8),
}).superRefine((query, context) => {
    if (query.range !== 'custom') return;
    if (!query.startDate || !query.endDate) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Both startDate and endDate are required for a custom range.',
        });
        return;
    }

    const start = new Date(`${query.startDate}T00:00:00.000Z`);
    const end = new Date(`${query.endDate}T00:00:00.000Z`);
    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        start.toISOString().slice(0, 10) !== query.startDate ||
        end.toISOString().slice(0, 10) !== query.endDate
    ) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Dates must be valid calendar dates.',
        });
        return;
    }
    const days = (end.getTime() - start.getTime()) / 86_400_000;
    if (days < 0 || days > 365) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'The date range must be valid and no longer than 366 days.',
        });
    }
});

type DashboardRange = z.infer<typeof dashboardQuerySchema>;
type TrendRow = { bucket: Date; received: number; resolved: number };
type CategoryRow = { name: string; count: number; previousCount: number };

function startOfUtcBucket(date: Date, grouping: DashboardRange['grouping']): Date {
    const bucket = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    if (grouping === 'week') {
        const daysSinceMonday = (bucket.getUTCDay() + 6) % 7;
        bucket.setUTCDate(bucket.getUTCDate() - daysSinceMonday);
    } else if (grouping === 'month') {
        bucket.setUTCDate(1);
    }
    return bucket;
}

function completeTrend(
    rows: TrendRow[],
    from: Date,
    to: Date,
    grouping: DashboardRange['grouping'],
): TrendRow[] {
    const counts = new Map(rows.map((row) => [row.bucket.toISOString(), row]));
    const result: TrendRow[] = [];
    const bucket = startOfUtcBucket(from, grouping);

    while (bucket < to) {
        const key = bucket.toISOString();
        result.push(counts.get(key) ?? { bucket: new Date(bucket), received: 0, resolved: 0 });
        if (grouping === 'week') bucket.setUTCDate(bucket.getUTCDate() + 7);
        else if (grouping === 'month') bucket.setUTCMonth(bucket.getUTCMonth() + 1);
        else bucket.setUTCDate(bucket.getUTCDate() + 1);
    }

    return result;
}

function getUtcRange(query: DashboardRange, now: Date) {
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    let from: Date;
    let to = now;

    if (query.range === 'custom') {
        from = new Date(`${query.startDate}T00:00:00.000Z`);
        to = new Date(`${query.endDate}T00:00:00.000Z`);
        to.setUTCDate(to.getUTCDate() + 1);
        if (to > now) to = now;
    } else {
        const days = query.range === 'today'
            ? 1
            : query.range === '7d'
                ? 7
                : query.range === '90d'
                    ? 90
                    : 30;
        from = new Date(today);
        from.setUTCDate(from.getUTCDate() - days + 1);
    }

    const duration = Math.max(1, to.getTime() - from.getTime());
    return {
        from,
        to,
        previousFrom: new Date(from.getTime() - duration),
        previousTo: from,
    };
}

function countChange(current: number, previous: number) {
    if (previous === 0) return current === 0 ? 0 : null;
    return Math.round(((current - previous) / previous) * 100);
}

function bucketExpression(grouping: DashboardRange['grouping']) {
    return grouping === 'week' ? 'week' : grouping === 'month' ? 'month' : 'day';
}

export async function getBusinessDashboard(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const parsed = dashboardQuerySchema.safeParse(req.query);
        if (!parsed.success) {
            throw Errors.validation(parsed.error.issues[0]?.message ?? 'Invalid dashboard filters.');
        }
        if (!req.tenantId || !req.user) {
            throw Errors.unauthorized('Tenant context missing');
        }
        const planAccess = req.businessPlanAccess;
        if (!planAccess?.active || planAccess.features?.complaint_management !== true) {
            throw Errors.forbidden('An active plan with complaint management access is required');
        }

        const filters = parsed.data;
        const now = new Date();
        const range = getUtcRange(filters, now);
        if (range.from >= range.to) {
            throw Errors.validation('The start date must be in the past and before the end date.');
        }
        const scope = req.user.role === 'AGENT' || req.user.role === 'ESCALATION_AGENT'
            ? { assignedToId: req.user.id }
            : {};
        const isManager = req.user.role === 'BUSINESS_ADMIN' || req.user.role === 'MANAGER';
        const canViewAdvancedAnalytics = planAccess.features?.analytics === true;
        const canViewTeamManagement = planAccess.features?.team_management === true;
        const openStatuses: ComplaintStatus[] = [
            'PENDING',
            'AI_PROCESSING',
            'OPEN',
            'IN_PROGRESS',
            'WAITING_FOR_CUSTOMER',
            'ESCALATED',
            'REOPENED',
        ];
        const activeWhere = {
            tenantId: req.tenantId,
            ...scope,
            status: { in: openStatuses },
        };
        const currentWhere = {
            tenantId: req.tenantId,
            ...scope,
            createdAt: { gte: range.from, lt: range.to },
        };
        const previousWhere = {
            tenantId: req.tenantId,
            ...scope,
            createdAt: { gte: range.previousFrom, lt: range.previousTo },
        };
        const previousResolvedWhere = {
            tenantId: req.tenantId,
            ...scope,
            resolvedAt: { gte: range.previousFrom, lt: range.previousTo },
        };
        const grouping = bucketExpression(filters.grouping);
        const assignedToSql = req.user.role === 'AGENT' || req.user.role === 'ESCALATION_AGENT'
            ? Prisma.sql`AND "assignedToId" = ${req.user.id}`
            : Prisma.empty;
        const complaintListWhere: Prisma.ComplaintWhereInput = {
            ...currentWhere,
            ...(filters.status ? { status: filters.status } : {}),
            ...(filters.priority ? { priority: filters.priority } : {}),
            ...(filters.category
                ? {
                    OR: [
                        {
                            category: {
                                is: {
                                    tenantId: req.tenantId,
                                    name: { equals: filters.category, mode: 'insensitive' },
                                },
                            },
                        },
                        {
                            categoryId: null,
                            aiCategory: { equals: filters.category, mode: 'insensitive' },
                        },
                        ...(filters.category.toLowerCase() === 'uncategorized'
                            ? [{ categoryId: null, aiCategory: null }]
                            : []),
                    ],
                }
                : {}),
            ...(filters.search
                ? {
                    AND: [{
                        OR: [
                            { trackingId: { contains: filters.search, mode: 'insensitive' } },
                            { title: { contains: filters.search, mode: 'insensitive' } },
                        ],
                    }],
                }
                : {}),
        };

        const [
            newCount,
            previousNewCount,
            workspaceComplaintCount,
            openCount,
            highPriorityCount,
            averageResolution,
            resolvedCount,
            previousResolvedCount,
            statusGroups,
            priorityGroups,
            sentimentGroups,
            categoryRows,
            trendRows,
            urgent,
            duplicateCount,
            duplicates,
            priorityRecommendations,
            attention,
            recentCount,
            recent,
            activeTeamMembers,
            teamMembers,
        ] = await Promise.all([
            prisma.complaint.count({ where: currentWhere }),
            prisma.complaint.count({ where: previousWhere }),
            prisma.complaint.count({ where: { tenantId: req.tenantId, ...scope } }),
            prisma.complaint.count({ where: activeWhere }),
            prisma.complaint.count({
                where: { ...activeWhere, priority: { in: ['HIGH', 'CRITICAL'] } },
            }),
            prisma.$queryRaw<Array<{ averageHours: number | null }>>(Prisma.sql`
                SELECT AVG(EXTRACT(EPOCH FROM ("resolvedAt" - "createdAt")) / 3600.0)::float8 AS "averageHours"
                FROM "complaints"
                WHERE "tenantId" = ${req.tenantId}
                  AND "resolvedAt" >= ${range.from}
                  AND "resolvedAt" < ${range.to}
                  AND "resolvedAt" >= "createdAt"
                  ${assignedToSql}
            `),
            prisma.complaint.count({
                where: {
                    tenantId: req.tenantId,
                    ...scope,
                    resolvedAt: { gte: range.from, lt: range.to },
                },
            }),
            prisma.complaint.count({ where: previousResolvedWhere }),
            prisma.complaint.groupBy({
                by: ['status'],
                where: currentWhere,
                _count: { _all: true },
            }),
            prisma.complaint.groupBy({
                by: ['priority'],
                where: currentWhere,
                _count: { _all: true },
            }),
            prisma.complaint.groupBy({
                by: ['aiSentiment'],
                where: { ...currentWhere, aiSentiment: { not: null } },
                _count: { _all: true },
            }),
            prisma.$queryRaw<CategoryRow[]>(Prisma.sql`
                SELECT COALESCE(category."name", complaint."aiCategory", 'Uncategorized') AS name,
                       COUNT(*) FILTER (
                           WHERE complaint."createdAt" >= ${range.from}
                             AND complaint."createdAt" < ${range.to}
                       )::int AS count,
                       COUNT(*) FILTER (
                           WHERE complaint."createdAt" >= ${range.previousFrom}
                             AND complaint."createdAt" < ${range.previousTo}
                       )::int AS "previousCount"
                FROM "complaints" AS complaint
                LEFT JOIN "complaint_categories" AS category
                  ON category."id" = complaint."categoryId"
                 AND category."tenantId" = complaint."tenantId"
                WHERE complaint."tenantId" = ${req.tenantId}
                  AND complaint."createdAt" >= ${range.previousFrom}
                  AND complaint."createdAt" < ${range.to}
                  ${assignedToSql}
                GROUP BY 1
                HAVING COUNT(*) FILTER (
                    WHERE complaint."createdAt" >= ${range.from}
                      AND complaint."createdAt" < ${range.to}
                ) > 0
                ORDER BY count DESC, name ASC
                LIMIT 8
            `),
            prisma.$queryRaw<TrendRow[]>(Prisma.sql`
                WITH events AS (
                    SELECT date_trunc(${grouping}, "createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' AS bucket,
                           COUNT(*)::int AS received,
                           0::int AS resolved
                    FROM "complaints"
                    WHERE "tenantId" = ${req.tenantId}
                      AND "createdAt" >= ${range.from}
                      AND "createdAt" < ${range.to}
                      ${assignedToSql}
                    GROUP BY 1
                    UNION ALL
                    SELECT date_trunc(${grouping}, "resolvedAt" AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' AS bucket,
                           0::int AS received,
                           COUNT(*)::int AS resolved
                    FROM "complaints"
                    WHERE "tenantId" = ${req.tenantId}
                      AND "resolvedAt" >= ${range.from}
                      AND "resolvedAt" < ${range.to}
                      ${assignedToSql}
                    GROUP BY 1
                )
                SELECT bucket, SUM(received)::int AS received, SUM(resolved)::int AS resolved
                FROM events
                GROUP BY bucket
                ORDER BY bucket ASC
            `),
            canViewAdvancedAnalytics ? prisma.complaint.findMany({
                where: {
                    ...activeWhere,
                    OR: [
                        { priority: { in: ['CRITICAL', 'HIGH'] } },
                        { aiPriority: { in: ['CRITICAL', 'HIGH'] } },
                    ],
                },
                orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
                take: 6,
                select: {
                    id: true,
                    trackingId: true,
                    title: true,
                    priority: true,
                    aiPriority: true,
                    aiPriorityScore: true,
                    aiUrgencyScore: true,
                    status: true,
                    createdAt: true,
                },
            }) : Promise.resolve([]),
            canViewAdvancedAnalytics
                ? prisma.complaint.count({
                    where: { ...currentWhere, isDuplicate: true },
                })
                : Promise.resolve(0),
            canViewAdvancedAnalytics ? prisma.complaint.findMany({
                where: { ...currentWhere, isDuplicate: true },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: {
                    id: true,
                    trackingId: true,
                    title: true,
                    duplicateSimilarity: true,
                    duplicateOf: { select: { id: true, trackingId: true, title: true, tenantId: true } },
                    createdAt: true,
                },
            }) : Promise.resolve([]),
            canViewAdvancedAnalytics ? prisma.complaint.findMany({
                where: {
                    ...currentWhere,
                    aiPriority: { not: null },
                },
                orderBy: { aiPriorityScore: 'desc' },
                take: 20,
                select: {
                    id: true,
                    trackingId: true,
                    title: true,
                    priority: true,
                    aiPriority: true,
                    aiPriorityScore: true,
                    aiSummary: true,
                },
            }) : Promise.resolve([]),
            prisma.complaint.findMany({
                where: {
                    ...activeWhere,
                    OR: [
                        { priority: { in: ['HIGH', 'CRITICAL'] } },
                        { dueAt: { lt: now } },
                        { assignedToId: null },
                        { status: 'ESCALATED' },
                        { firstResponseAt: null, status: { in: ['OPEN', 'PENDING'] } },
                        { createdAt: { lt: new Date(now.getTime() - 7 * 86_400_000) } },
                    ],
                },
                orderBy: [{ dueAt: { sort: 'asc', nulls: 'last' } }, { createdAt: 'asc' }],
                take: 8,
                select: {
                    id: true,
                    trackingId: true,
                    title: true,
                    status: true,
                    priority: true,
                    aiSentiment: true,
                    aiCategory: true,
                    dueAt: true,
                    createdAt: true,
                    assignedTo: { select: { id: true, fullName: true, tenantId: true } },
                },
            }),
            prisma.complaint.count({
                where: complaintListWhere,
            }),
            prisma.complaint.findMany({
                where: complaintListWhere,
                orderBy: { createdAt: filters.sort === 'oldest' ? 'asc' : 'desc' },
                skip: (filters.page - 1) * filters.limit,
                take: filters.limit,
                select: {
                    id: true,
                    trackingId: true,
                    title: true,
                    status: true,
                    priority: true,
                    aiSentiment: true,
                    aiCategory: true,
                    createdAt: true,
                    assignedTo: { select: { id: true, fullName: true, tenantId: true } },
                    customer: { select: { fullName: true, tenantId: true } },
                    category: { select: { name: true, tenantId: true } },
                },
            }),
            isManager && canViewTeamManagement
                ? prisma.user.count({
                    where: {
                        tenantId: req.tenantId,
                        isActive: true,
                        role: { in: ['MANAGER', 'AGENT', 'ESCALATION_AGENT'] },
                    },
                })
                : Promise.resolve(null),
            isManager && canViewTeamManagement
                ? prisma.user.findMany({
                    where: {
                        tenantId: req.tenantId,
                        isActive: true,
                        role: { in: ['MANAGER', 'AGENT', 'ESCALATION_AGENT'] },
                    },
                    orderBy: { fullName: 'asc' },
                    take: 8,
                    select: {
                        id: true,
                        fullName: true,
                        role: true,
                        team: { select: { name: true } },
                        _count: { select: { assignedComplaints: true } },
                    },
                })
                : Promise.resolve([]),
        ]);

        const normalizedCategories = categoryRows;
        const sentimentCounts = sentimentGroups.reduce<Record<string, number>>(
            (counts, { aiSentiment, _count }) => {
                if (aiSentiment !== null) counts[aiSentiment] = _count._all;
                return counts;
            },
            {},
        );
        const filteredPriorityRecommendations = priorityRecommendations.filter(
            ({ aiPriority, priority }) => aiPriority !== priority,
        ).slice(0, 5);
        const safeDuplicates = duplicates.map(({ duplicateOf, ...duplicate }) => {
            if (!duplicateOf || duplicateOf.tenantId !== req.tenantId) {
                return { ...duplicate, duplicateOf: null };
            }
            return {
                ...duplicate,
                duplicateOf: {
                    id: duplicateOf.id,
                    trackingId: duplicateOf.trackingId,
                    title: duplicateOf.title,
                },
            };
        });
        const safeAttention = attention.map(({ assignedTo, ...complaint }) => {
            if (!assignedTo || assignedTo.tenantId !== req.tenantId) {
                return { ...complaint, assignedTo: null };
            }
            return {
                ...complaint,
                assignedTo: { id: assignedTo.id, fullName: assignedTo.fullName },
            };
        });
        const safeRecent = recent.map(({ assignedTo, customer, category, ...complaint }) => ({
            ...complaint,
            categoryName: category && category.tenantId === req.tenantId ? category.name : complaint.aiCategory,
            assignedTo: assignedTo && assignedTo.tenantId === req.tenantId
                ? { id: assignedTo.id, fullName: assignedTo.fullName }
                : null,
            customer: customer && customer.tenantId === req.tenantId
                ? { fullName: customer.fullName }
                : null,
        }));
        const teamMemberIds = teamMembers.map((member) => member.id);
        let assignedGroups: Array<{ assignedToId: string | null; _count: { _all: number } }> = [];
        let highPriorityGroups: Array<{ assignedToId: string | null; _count: { _all: number } }> = [];
        let resolvedGroups: Array<{ assignedToId: string | null; _count: { _all: number } }> = [];
        if (teamMemberIds.length > 0 && isManager && canViewTeamManagement) {
            [assignedGroups, highPriorityGroups, resolvedGroups] = await Promise.all([
                prisma.complaint.groupBy({
                    by: ['assignedToId'],
                    where: {
                        tenantId: req.tenantId,
                        assignedToId: { in: teamMemberIds },
                        status: { in: openStatuses },
                    },
                    _count: { _all: true },
                }),
                prisma.complaint.groupBy({
                    by: ['assignedToId'],
                    where: {
                        tenantId: req.tenantId,
                        assignedToId: { in: teamMemberIds },
                        status: { in: openStatuses },
                        priority: { in: ['HIGH', 'CRITICAL'] },
                    },
                    _count: { _all: true },
                }),
                prisma.complaint.groupBy({
                    by: ['assignedToId'],
                    where: {
                        tenantId: req.tenantId,
                        assignedToId: { in: teamMemberIds },
                        resolvedAt: { gte: range.from, lt: range.to },
                    },
                    _count: { _all: true },
                }),
            ]);
        }
        const assignedCounts = new Map(
            assignedGroups.map(({ assignedToId, _count }) => [assignedToId, _count._all]),
        );
        const highPriorityCounts = new Map(
            highPriorityGroups.map(({ assignedToId, _count }) => [assignedToId, _count._all]),
        );
        const resolvedCounts = new Map(
            resolvedGroups.map(({ assignedToId, _count }) => [assignedToId, _count._all]),
        );
        const negativeSentimentCount = sentimentCounts.NEGATIVE ?? 0;
        const analyzedSentimentCount = Object.values(sentimentCounts)
            .reduce((total, count) => total + count, 0);
        const trend = completeTrend(trendRows, range.from, range.to, filters.grouping);
        const statusCounts = new Map(
            statusGroups.map(({ status, _count }) => [status, _count._all]),
        );

        res.json({
            success: true,
            data: {
                entitlements: {
                    plan: planAccess.plan,
                    source: planAccess.source,
                    trial: planAccess.trial,
                    features: planAccess.features ?? {},
                    limits: planAccess.limits,
                },
                visibility: {
                    scope: req.user.role === 'AGENT' || req.user.role === 'ESCALATION_AGENT'
                        ? 'assigned'
                        : 'tenant',
                },
                period: {
                    range: filters.range,
                    grouping: filters.grouping,
                    from: range.from.toISOString(),
                    to: range.to.toISOString(),
                    previousFrom: range.previousFrom.toISOString(),
                    previousTo: range.previousTo.toISOString(),
                },
                kpis: {
                    totalComplaints: {
                        value: newCount,
                        previousValue: previousNewCount,
                        changePercent: countChange(newCount, previousNewCount),
                    },
                    workspaceComplaintCount,
                    openComplaints: { value: openCount },
                    highPriorityComplaints: { value: highPriorityCount },
                    averageResolutionHours: averageResolution[0]?.averageHours ?? null,
                    resolvedComplaints: {
                        value: resolvedCount,
                        previousValue: previousResolvedCount,
                        changePercent: countChange(resolvedCount, previousResolvedCount),
                    },
                },
                trend,
                statusDistribution: Object.values(ComplaintStatus).map((status) => ({
                    status,
                    count: statusCounts.get(status) ?? 0,
                })),
                priorityDistribution: priorityGroups.map(({ priority, _count }) => ({
                    priority,
                    count: _count._all,
                })),
                sentiment: {
                    sampleSize: analyzedSentimentCount,
                    distribution: Object.entries(sentimentCounts).map(([sentiment, count]) => ({
                        sentiment,
                        count,
                    })),
                },
                categories: normalizedCategories,
                ai: canViewAdvancedAnalytics ? {
                    analysis: analyzedSentimentCount > 0 ? 'available' : 'no_data',
                    urgent,
                    duplicateCount,
                    duplicates: safeDuplicates,
                    priorityRecommendations: filteredPriorityRecommendations,
                    insights: {
                        complaintChangePercent: countChange(newCount, previousNewCount),
                        negativeSentimentCount,
                        analyzedSentimentCount,
                        leadingCategory: normalizedCategories[0] ?? null,
                    },
                } : null,
                attention: safeAttention,
                recent: {
                    items: safeRecent,
                    page: filters.page,
                    limit: filters.limit,
                    total: recentCount,
                    pages: Math.ceil(recentCount / filters.limit),
                },
                teamPerformance: isManager && canViewTeamManagement
                    ? {
                        activeMembers: activeTeamMembers,
                        members: teamMembers.map((member) => ({
                            id: member.id,
                            name: member.fullName,
                            role: member.role,
                            team: member.team?.name ?? null,
                            openAssigned: assignedCounts.get(member.id) ?? 0,
                            highPriorityAssigned: highPriorityCounts.get(member.id) ?? 0,
                            resolvedInPeriod: resolvedCounts.get(member.id) ?? 0,
                        })),
                    }
                    : null,
            },
        });
    } catch (error) {
        next(error);
    }
}
