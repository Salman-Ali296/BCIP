export type ComplaintCategory =
    | "Payment"
    | "Delivery"
    | "Refund"
    | "Product"
    | "Account"
    | "Service";

export type CustomerComplaintStatus =
    | "Open"
    | "Under Review"
    | "In Progress"
    | "Awaiting Response"
    | "Escalated"
    | "Resolved"
    | "Closed";

export type ComplaintPriority = "Low" | "Medium" | "High" | "Critical";

export interface ComplaintTimelineEvent {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    date: string;
    actor: "system" | "team" | "customer";
    actorName: string;
    icon?: "check" | "user" | "clock" | "alert" | "file";
}

export interface CustomerMessage {
    id: string;
    sender: "customer" | "support";
    senderName: string;
    senderRole?: string;
    content: string;
    timestamp: string;
    attachments?: { name: string; size: string }[];
}

export interface ComplaintAttachment {
    id: string;
    name: string;
    size: string;
    type: string;
    uploadedAt: string;
    url?: string;
}

export interface CustomerComplaint {
    id: string; // e.g. "BCIP-10482"
    subject: string;
    description: string;
    category: ComplaintCategory;
    status: CustomerComplaintStatus;
    priority: ComplaintPriority;
    submittedDate: string;
    lastUpdate: string;
    assignedTeam: string;
    assignedAgent?: string;
    referenceNumber?: string;
    currentProgressStep: number; // 0: Submitted, 1: Under Review, 2: Assigned, 3: Investigation, 4: Resolution, 5: Resolved
    whatHappensNext?: {
        summary: string;
        details: string;
        expectedNextUpdate: string;
    };
    actionRequired?: {
        id: string;
        title: string;
        description: string;
        requestedBy: string;
        requestedAt: string;
        isResolved?: boolean;
    };
    aiTransparency?: {
        categoryNote: string;
        priorityNote: string;
        patternNote: string;
    };
    timeline: ComplaintTimelineEvent[];
    messages: CustomerMessage[];
    attachments: ComplaintAttachment[];
    feedback?: {
        rating: number;
        comment?: string;
        submittedAt?: string;
    };
}

export interface CustomerNotification {
    id: string;
    complaintId: string;
    title: string;
    message: string;
    timestamp: string;
    type: "update" | "assignment" | "action_required" | "resolution" | "feedback";
    isRead: boolean;
}

export interface CustomerActivityItem {
    id: string;
    complaintId: string;
    title: string;
    description: string;
    timestamp: string;
    isHighlight?: boolean;
    type: "assigned" | "requested" | "submitted" | "resolved" | "status";
}
