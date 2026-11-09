import { Complaint } from '../complaint.aggregate';
import { ComplaintId, CustomerId, TenantId } from '../value-objects';

// STRICT RULE: This interface only knows about Domain objects. No Prisma!
export interface IComplaintRepository {
    isCustomerInTenant(customerId: CustomerId, tenantId: TenantId): Promise<boolean>;
    findById(id: ComplaintId, tenantId: TenantId): Promise<Complaint | null>;
    save(complaint: Complaint): Promise<void>;
    findByTenant(tenantId: TenantId, limit: number, offset: number): Promise<Complaint[]>;
}