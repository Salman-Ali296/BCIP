import { randomUUID } from 'crypto';
import { Complaint } from '../../domain/complaint.aggregate';
import { ComplaintId, CustomerId, Priority, SentimentScore, TenantId } from '../../domain/value-objects';
import { IComplaintRepository } from '../../domain/repositories/complaint.repository';
import { AiInsightsResult, IAnalyticsPort } from '../ports/ai-analytics.port';
import { logger } from '../../../../utils/logger';
import { Errors } from '../../../../utils/error';

export interface SubmitComplaintCommand {
    tenantId: string;
    customerId: string;
    title: string;
    description: string;
}

export interface SubmitComplaintResult {
    id: string;
    tenantId: string;
    customerId: string;
    title: string;
    description: string;
    category: string;
    priority: Priority['value'];
    sentimentScore: number | null;
    sentimentLabel: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | null;
    status: string;
    createdAt: Date;
}

export class SubmitComplaintUseCase {
    constructor(
        private readonly complaintRepository: IComplaintRepository,
        private readonly analyticsPort: IAnalyticsPort,
    ) { }

    async execute(command: SubmitComplaintCommand): Promise<SubmitComplaintResult> {
        const tenantId = new TenantId(command.tenantId);
        const customerId = new CustomerId(command.customerId);
        if (!await this.complaintRepository.isCustomerInTenant(customerId, tenantId)) {
            throw Errors.notFound('Customer');
        }

        const complaint = Complaint.create(new ComplaintId(randomUUID()), {
            tenantId,
            customerId,
            title: command.title,
            description: command.description,
            category: 'GENERAL',
        });

        await this.complaintRepository.save(complaint);

        try {
            const insights = await this.analyticsPort.analyzeComplaint(
                `${command.title}\n${command.description}`,
            );
            complaint.applyAiInsights(
                Priority.fromScore(insights.priority),
                new SentimentScore({
                    score: insights.sentimentScore,
                    label: insights.sentimentLabel,
                }),
                insights.category,
            );
        } catch (error) {
            const fallback = this.defaultInsights();
            logger.warn('AI analysis failed; saving complaint with fallback insights', {
                complaintId: complaint.id.value,
                error: error instanceof Error ? error.message : String(error),
            });
            complaint.applyAiInsights(
                Priority.fromScore(fallback.priority),
                new SentimentScore({
                    score: fallback.sentimentScore,
                    label: fallback.sentimentLabel,
                }),
                fallback.category,
            );
        }

        await this.complaintRepository.save(complaint);
        return this.toResult(complaint);
    }

    private defaultInsights(): AiInsightsResult {
        return {
            category: 'GENERAL',
            priority: 50,
            sentimentScore: 0,
            sentimentLabel: 'NEUTRAL',
            isDuplicate: false,
            duplicateOf: null,
            duplicateSimilarity: null,
        };
    }

    private toResult(complaint: Complaint): SubmitComplaintResult {
        const sentiment = complaint.props.sentiment;
        return {
            id: complaint.id.value,
            tenantId: complaint.props.tenantId.value,
            customerId: complaint.props.customerId.value,
            title: complaint.props.title,
            description: complaint.props.description,
            category: complaint.props.category,
            priority: complaint.props.priority.value,
            sentimentScore: sentiment?.value.score ?? null,
            sentimentLabel: sentiment?.value.label ?? null,
            status: complaint.props.status.value,
            createdAt: complaint.props.createdAt,
        };
    }
}