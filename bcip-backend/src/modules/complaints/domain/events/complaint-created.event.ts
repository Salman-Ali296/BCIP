export class ComplaintCreatedEvent {
    constructor(
        public readonly complaintId: string,
        public readonly tenantId: string,
    ) { }
}