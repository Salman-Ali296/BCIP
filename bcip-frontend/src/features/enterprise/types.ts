export type EnterpriseRole =
    | "SUPPORT_AGENT"
    | "ESCALATION_MANAGER"
    | "BUSINESS_MANAGER"
    | "PLATFORM_ADMIN"
    | "CUSTOMER";

export type SLAState = "ON_TRACK" | "AT_RISK" | "OVERDUE";

export type ComplaintPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type EnterpriseComplaintStatus =
    | "NEW"
    | "IN_PROGRESS"
    | "WAITING_FOR_CUSTOMER"
    | "PENDING_APPROVAL"
    | "ESCALATED"
    | "RESOLVED"
    | "CLOSED";

export type ComplaintCategory =
    | "Payment"
    | "Retail Banking"
    | "Credit Cards"
    | "Corporate Banking"
    | "Digital Banking"
    | "Account Security"
    | "Compliance & KYC"
    | "Delivery & Logistics"
    | "Other";

export interface BusinessUnit {
    id: string;
    name: string;
    code: string;
    description: string;
    departments: Department[];
}

export interface Department {
    id: string;
    businessUnitId: string;
    name: string;
    code: string;
    teams: Team[];
}

export interface Team {
    id: string;
    departmentId: string;
    name: string;
    leadName: string;
    memberCount: number;
    activeComplaintsCount: number;
}

export interface EnterpriseUser {
    id: string;
    fullName: string;
    email: string;
    role: EnterpriseRole;
    roleLabel: string;
    organization: string;
    businessUnit: string;
    department: string;
    team: string;
    avatar: string;
    mfaEnabled: boolean;
    permissions: string[];
}

export interface SLATimer {
    status: SLAState;
    timeRemainingText: string;
    deadlineTimestamp: string;
    responseDueMinutes: number;
    resolutionDueMinutes: number;
    breached: boolean;
}

export interface AuditEvent {
    id: string;
    actorName: string;
    actorEmail: string;
    actorRole: string;
    action: string;
    details: string;
    previousState?: string;
    newState?: string;
    timestamp: string;
    ipAddress: string;
    businessUnit: string;
}

export interface RecurringIssueCluster {
    id: string;
    title: string;
    summary: string;
    impact: "HIGH" | "CRITICAL" | "MEDIUM";
    affectedComplaintsCount: number;
    affectedBusinessUnit: string;
    detectedAt: string;
    rootCauseHypothesis: string;
    suggestedRemediation: string;
    status: "INVESTIGATING" | "CONFIRMED" | "REMEDIATING" | "RESOLVED";
}

export interface InternalNote {
    id: string;
    authorName: string;
    authorRole: string;
    content: string;
    timestamp: string;
    isRestricted: boolean;
}

export interface ConversationMessage {
    id: string;
    sender: "CUSTOMER" | "AGENT" | "SYSTEM";
    senderName: string;
    senderRole?: string;
    content: string;
    timestamp: string;
    attachments?: { name: string; size: string }[];
}

export interface EnterpriseComplaint {
    id: string; // e.g. "BCIP-10482"
    trackingId: string;
    title: string;
    description: string;
    customer: {
        id: string;
        name: string;
        email: string;
        phone: string;
        tier: "Standard" | "Preferred" | "VIP Enterprise";
        accountNumber: string;
    };
    organization: string;
    businessUnit: string;
    department: string;
    team: string;
    assignedAgent?: {
        id: string;
        name: string;
        email: string;
    };
    category: ComplaintCategory;
    priority: ComplaintPriority;
    status: EnterpriseComplaintStatus;
    sentiment: "NEGATIVE" | "NEUTRAL" | "POSITIVE" | "URGENT";
    channel: "PORTAL" | "EMAIL" | "VOICE" | "API" | "BRANCH";
    referenceNumber: string;
    createdAt: string;
    updatedAt: string;
    sla: SLATimer;
    aiInsights: {
        summary: string;
        categoryConfidence: number;
        sentimentScore: string;
        suggestedAction: string;
        relatedComplaintsCount: number;
        recurringClusterId?: string;
    };
    escalation?: {
        isEscalated: boolean;
        escalatedBy: string;
        escalatedTo: string;
        reason: string;
        timestamp: string;
        comment: string;
    };
    auditTrail: AuditEvent[];
    messages: ConversationMessage[];
    internalNotes: InternalNote[];
    attachments: { id?: string; name: string; size: string; type: string; date: string }[];
}

export type QueueType =
    | "MY_WORK"
    | "UNASSIGNED"
    | "HIGH_PRIORITY"
    | "SLA_RISK"
    | "WAITING_FOR_CUSTOMER"
    | "ESCALATED"
    | "RECENTLY_UPDATED"
    | "ALL";

export interface PermissionDefinition {
    key: string;
    name: string;
    category: "Complaints" | "Customers" | "Workflows" | "Administration" | "Security";
    description: string;
}
