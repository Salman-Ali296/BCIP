import type {
    ComplaintCategory,
    ComplaintPriority,
    ComplaintStatus,
} from "@/features/complaints/types/complaint";

export const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
    "BILLING",
    "DELIVERY",
    "PRODUCT_QUALITY",
    "TECHNICAL",
    "CUSTOMER_SERVICE",
    "OTHER",
];

export const COMPLAINT_PRIORITIES: ComplaintPriority[] = [
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
];

export const COMPLAINT_STATUSES: ComplaintStatus[] = [
    "PENDING",
    "AI_PROCESSING",
    "OPEN",
    "IN_PROGRESS",
    "WAITING_FOR_CUSTOMER",
    "ESCALATED",
    "RESOLVED",
    "CLOSED",
    "REOPENED",
];