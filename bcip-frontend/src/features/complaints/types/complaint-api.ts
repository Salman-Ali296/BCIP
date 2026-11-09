import type {
    ComplaintPriority,
    ComplaintStatus,
    Priority,
} from "@/features/complaints/types/complaint";
import type { Complaint } from "@/features/complaints/api/complaint-api";

export interface ComplaintListResponse {
    data: Complaint[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export interface ComplaintResponse {
    data: Complaint;
}

export interface CreateComplaintRequest {
    title: string;
    description: string;
    customerEmail: string;
    customerName: string;
    tenantId: string;
    attachmentUrl?: string;
}

export interface CreateComplaintResponse {
    data: {
        id: string;
        trackingId: string;
        status: ComplaintStatus;
        priority: ComplaintPriority | Priority;
        sentiment: Complaint["sentiment"];
        category: string;
    };
    message: string;
}

export interface UpdateComplaintRequest {
    status: Complaint["status"];
    assignedToId?: string;
}

export interface UpdateComplaintResponse {
    data: Complaint;
    message: string;
}