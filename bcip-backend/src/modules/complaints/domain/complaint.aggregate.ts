import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { ComplaintId, TenantId, CustomerId, Priority, SentimentScore, ComplaintStatus } from './value-objects';
import { ComplaintCreatedEvent } from './events/complaint-created.event';

export interface ComplaintProps {
    tenantId: TenantId;
    customerId: CustomerId;
    title: string;
    description: string;
    category: string; // e.g., 'BILLING', 'DELIVERY'
    status: ComplaintStatus;
    priority: Priority;
    sentiment: SentimentScore | null;
    createdAt: Date;
    resolvedAt?: Date;
}

export class Complaint extends AggregateRoot<ComplaintProps> {
    // Factory method for creation
    static create(id: ComplaintId, props: Omit<ComplaintProps, 'status' | 'priority' | 'sentiment' | 'createdAt'>): Complaint {
        const complaint = new Complaint(id, {
            ...props,
            status: new ComplaintStatus('SUBMITTED'),
            priority: new Priority('MEDIUM'), // Default until AI processes it
            sentiment: null,
            createdAt: new Date(),
        });

        // Record domain event
        complaint.addEvent(new ComplaintCreatedEvent(id.value, props.tenantId.value));
        return complaint;
    }

    // Business Logic: Update AI insights
    public applyAiInsights(priority: Priority, sentiment: SentimentScore, category: string): void {
        if (this.props.status.value === 'RESOLVED') {
            throw new Error('Cannot update AI insights on a resolved complaint');
        }

        this.props.priority = priority;
        this.props.sentiment = sentiment;
        this.props.category = category;
        this.props.status = new ComplaintStatus('TRIAGED');
    }

    public resolve(): void {
        this.props.status = new ComplaintStatus('RESOLVED');
        this.props.resolvedAt = new Date();
    }
}