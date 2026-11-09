import { ValueObject } from '../../../core/domain/ValueObject';

export class ComplaintId extends ValueObject<string> { }
export class TenantId extends ValueObject<string> { }
export class CustomerId extends ValueObject<string> { }

export class Priority extends ValueObject<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> {
    static fromScore(score: number): Priority {
        if (score >= 90) return new Priority('CRITICAL');
        if (score >= 70) return new Priority('HIGH');
        if (score >= 40) return new Priority('MEDIUM');
        return new Priority('LOW');
    }
}

export class SentimentScore extends ValueObject<{ score: number; label: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' }> { }

export class ComplaintStatus extends ValueObject<'SUBMITTED' | 'TRIAGED' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED'> { }