import assert from 'node:assert/strict';
import test from 'node:test';
import { SubmitComplaintUseCase } from '../src/modules/complaints/application/use-cases/submit-complaint.use-case';
import { Complaint } from '../src/modules/complaints/domain/complaint.aggregate';
import { IComplaintRepository } from '../src/modules/complaints/domain/repositories/complaint.repository';
import { ComplaintId, TenantId } from '../src/modules/complaints/domain/value-objects';
import { AiInsightsResult, IAnalyticsPort } from '../src/modules/complaints/application/ports/ai-analytics.port';

class InMemoryComplaintRepository implements IComplaintRepository {
    readonly saved: Complaint[] = [];
    customerBelongsToTenant = true;

    async isCustomerInTenant(customerId: CustomerId, tenantId: TenantId): Promise<boolean> {
        return this.customerBelongsToTenant
            && customerId.value === command.customerId
            && tenantId.value === command.tenantId;
    }

    async save(complaint: Complaint): Promise<void> {
        this.saved.push(complaint);
    }

    async findById(id: ComplaintId, tenantId: TenantId): Promise<Complaint | null> {
        return this.saved.find(
            complaint => complaint.id.value === id.value
                && complaint.props.tenantId.value === tenantId.value,
        ) ?? null;
    }

    async findByTenant(tenantId: TenantId): Promise<Complaint[]> {
        return this.saved.filter(complaint => complaint.props.tenantId.value === tenantId.value);
    }
}

class StubAnalyticsPort implements IAnalyticsPort {
    constructor(
        private readonly response?: AiInsightsResult,
        private readonly error?: Error,
    ) { }

    async analyzeComplaint(): Promise<AiInsightsResult> {
        if (this.error) throw this.error;
        return this.response as AiInsightsResult;
    }
}

const command = {
    tenantId: '11111111-1111-4111-8111-111111111111',
    customerId: '22222222-2222-4222-8222-222222222222',
    title: 'Billing amount is incorrect',
    description: 'The invoice contains a charge that does not belong to my account.',
};

test('submits a complaint and persists AI insights', async () => {
    const repository = new InMemoryComplaintRepository();
    const analytics = new StubAnalyticsPort({
        category: 'BILLING',
        priority: 85,
        sentimentScore: -0.7,
        sentimentLabel: 'NEGATIVE',
        isDuplicate: false,
        duplicateOf: null,
        duplicateSimilarity: null,
    });

    const result = await new SubmitComplaintUseCase(repository, analytics).execute(command);

    assert.equal(repository.saved.length, 2);
    assert.equal(result.category, 'BILLING');
    assert.equal(result.priority, 'HIGH');
    assert.equal(result.sentimentLabel, 'NEGATIVE');
    assert.equal(result.status, 'TRIAGED');
});

test('keeps the complaint available with neutral fallback insights when AI fails', async () => {
    const repository = new InMemoryComplaintRepository();
    const analytics = new StubAnalyticsPort(undefined, new Error('AI unavailable'));

    const result = await new SubmitComplaintUseCase(repository, analytics).execute(command);

    assert.equal(repository.saved.length, 2);
    assert.equal(result.category, 'GENERAL');
    assert.equal(result.priority, 'MEDIUM');
    assert.equal(result.sentimentLabel, 'NEUTRAL');
    assert.equal(result.sentimentScore, 0);
    assert.equal(result.status, 'TRIAGED');
});

test('rejects a customer record that does not belong to the authenticated tenant', async () => {
    const repository = new InMemoryComplaintRepository();
    repository.customerBelongsToTenant = false;
    const useCase = new SubmitComplaintUseCase(repository, new StubAnalyticsPort());

    await assert.rejects(useCase.execute(command), {
        code: 'RESOURCE_NOT_FOUND',
        statusCode: 404,
    });
    assert.equal(repository.saved.length, 0);
});