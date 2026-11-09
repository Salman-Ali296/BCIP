// src/modules/complaints/infrastructure/repositories/prisma-complaint.repository.ts
import { prisma } from '../../../../config/prisma.client';
import { IComplaintRepository } from '../../domain/repositories/complaint.repository';
import { Complaint } from '../../domain/complaint.aggregate';
import { ComplaintId, TenantId, CustomerId, Priority, SentimentScore, ComplaintStatus } from '../../domain/value-objects';

export class PrismaComplaintRepository implements IComplaintRepository {

    async isCustomerInTenant(customerId: CustomerId, tenantId: TenantId): Promise<boolean> {
        const customer = await prisma.customer.findFirst({
            where: {
                id: customerId.value,
                tenantId: tenantId.value,
                isActive: true,
            },
            select: { id: true },
        });
        return customer !== null;
    }

    async save(complaint: Complaint): Promise<void> {
        const props = complaint.props;

        // Map Domain Entity to Prisma Model
        await prisma.complaint.upsert({
            where: { id: complaint.id.value },
            update: {
                status: this.toPrismaStatus(props.status.value),
                priority: props.priority.value,
                aiCategory: props.category,
                sentimentScore: props.sentiment?.value.score,
                aiSentiment: props.sentiment?.value.label,
                aiSentimentScore: props.sentiment?.value.score,
                aiPriority: props.priority.value,
                resolvedAt: props.resolvedAt,
            },
            create: {
                id: complaint.id.value,
                trackingId: complaint.id.value,
                tenantId: props.tenantId.value,
                customerId: props.customerId.value,
                title: props.title,
                description: props.description,
                aiCategory: props.category,
                aiSentiment: props.sentiment?.value.label,
                aiSentimentScore: props.sentiment?.value.score,
                aiPriority: props.priority.value,
                status: this.toPrismaStatus(props.status.value),
                priority: props.priority.value,
            },
        });
    }

    async findById(id: ComplaintId, tenantId: TenantId): Promise<Complaint | null> {
        const record = await prisma.complaint.findFirst({
            where: { id: id.value, tenantId: tenantId.value },
        });

        if (!record) return null;

        // Map Prisma Model back to Domain Entity
        return this.mapToDomain(record);
    }

    async findByTenant(tenantId: TenantId, limit: number, offset: number): Promise<Complaint[]> {
        const records = await prisma.complaint.findMany({
            where: { tenantId: tenantId.value },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });

        return records.map((record) => this.mapToDomain(record));
    }

    private mapToDomain(record: any): Complaint {
        // Reconstruct Value Objects
        const priority = new Priority(record.priority as any);
        const status = new ComplaintStatus(this.toDomainStatus(record.status));
        const sentiment = record.aiSentimentScore !== null
            ? new SentimentScore({ score: record.aiSentimentScore, label: record.aiSentiment as any })
            : null;

        // Reconstruct Aggregate
        return new Complaint(
            new ComplaintId(record.id),
            {
                tenantId: new TenantId(record.tenantId),
                customerId: new CustomerId(record.customerId ?? ''),
                title: record.title,
                description: record.description,
                category: record.aiCategory ?? 'GENERAL',
                status,
                priority,
                sentiment,
                createdAt: record.createdAt,
                resolvedAt: record.resolvedAt ?? undefined,
            }
        );
    }

    private toPrismaStatus(status: ComplaintStatus['value']): 'PENDING' | 'AI_PROCESSING' | 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_CUSTOMER' | 'ESCALATED' | 'RESOLVED' | 'CLOSED' | 'REOPENED' {
        switch (status) {
            case 'SUBMITTED':
                return 'PENDING';
            case 'TRIAGED':
                return 'OPEN';
            default:
                return status;
        }
    }

    private toDomainStatus(status: string): ComplaintStatus['value'] {
        switch (status) {
            case 'PENDING':
                return 'SUBMITTED';
            case 'OPEN':
            case 'AI_PROCESSING':
            case 'WAITING_FOR_CUSTOMER':
            case 'CLOSED':
            case 'REOPENED':
                return 'TRIAGED';
            default:
                return status as ComplaintStatus['value'];
        }
    }
}