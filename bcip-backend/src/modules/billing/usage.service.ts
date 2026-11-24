import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { getPlanForTenant } from './plan-catalog.service';

export interface UsagePeriod {
    start: Date;
    end: Date;
}

export function getCurrentUsagePeriod(now = new Date()): UsagePeriod {
    return {
        start: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
        end: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)),
    };
}

export async function reserveUsageWithinTransaction(
    tx: Prisma.TransactionClient,
    tenantId: string,
    metric: string,
    limit: number | null,
    period = getCurrentUsagePeriod(),
): Promise<boolean> {
    await tx.usageRecord.upsert({
        where: {
            tenantId_metric_periodStart: {
                tenantId,
                metric,
                periodStart: period.start,
            },
        },
        create: {
            tenantId,
            metric,
            quantity: 0,
            periodStart: period.start,
            periodEnd: period.end,
        },
        update: {},
    });

    const [usage] = await tx.$queryRaw<Array<{ id: string; quantity: number }>>`
        SELECT "id", "quantity"
        FROM "usage_records"
        WHERE "tenantId" = ${tenantId}
          AND "metric" = ${metric}
          AND "periodStart" = ${period.start}
        FOR UPDATE
    `;
    if (!usage) throw new Error(`Usage record for ${metric} was not created.`);
    if (limit !== null && usage.quantity >= limit) return false;

    await tx.$executeRaw`
        UPDATE "usage_records"
        SET "quantity" = "quantity" + 1, "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = ${usage.id}
    `;
    return true;
}

export async function releaseUsageWithinTransaction(
    tx: Prisma.TransactionClient,
    tenantId: string,
    metric: string,
    period = getCurrentUsagePeriod(),
): Promise<void> {
    await tx.$executeRaw`
        UPDATE "usage_records"
        SET "quantity" = GREATEST("quantity" - 1, 0), "updatedAt" = CURRENT_TIMESTAMP
        WHERE "tenantId" = ${tenantId}
          AND "metric" = ${metric}
          AND "periodStart" = ${period.start}
    `;
}

export async function getTenantUsage(tenantId: string, now = new Date()) {
    const plan = await getPlanForTenant(tenantId);
    const period = getCurrentUsagePeriod(now);
    if (!plan) return null;

    const [periodRecords, teamMembers, storage] = await Promise.all([
        prisma.usageRecord.findMany({
            where: {
                tenantId,
                periodStart: period.start,
            },
            select: { metric: true, quantity: true },
        }),
        prisma.user.count({
            where: {
                tenantId,
                isActive: true,
                role: { in: ['BUSINESS_ADMIN', 'MANAGER', 'AGENT', 'ESCALATION_AGENT'] },
            },
        }),
        prisma.complaintAttachment.aggregate({
            where: { complaint: { tenantId } },
            _sum: { fileSize: true },
        }),
    ]);
    const quantities = Object.fromEntries(
        periodRecords.map(({ metric, quantity }) => [metric, quantity]),
    );
    const storageBytes = storage._sum.fileSize ?? 0;
    return {
        plan: {
            slug: plan.slug,
            name: plan.name,
            limits: {
                complaintsPerMonth: plan.complaintLimit,
                teamMembers: plan.teamMemberLimit,
                aiAnalysesPerMonth: plan.aiAnalysisLimit,
                storageMb: plan.storageLimitMb,
            },
        },
        period: { start: period.start, end: period.end, resetsAt: period.end },
        usage: {
            complaints: {
                used: quantities.complaints ?? 0,
                limit: plan.complaintLimit,
            },
            aiAnalyses: {
                used: quantities.ai_analyses ?? 0,
                limit: plan.aiAnalysisLimit,
            },
            teamMembers: {
                used: teamMembers,
                limit: plan.teamMemberLimit,
            },
            storage: {
                usedBytes: storageBytes,
                limitBytes: plan.storageLimitMb === null
                    ? null
                    : plan.storageLimitMb * 1024 * 1024,
            },
        },
    };
}
