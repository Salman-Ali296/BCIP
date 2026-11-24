import { apiClient } from "@/lib/api/client";

export interface CustomerComplaintRecord {
    id: string;
    trackingId: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    category: string;
    sentiment: string | null;
    createdAt: string;
    updatedAt?: string;
    statusHistory?: Array<{
        id: string;
        toStatus: string;
        changedAt: string;
    }>;
}

export interface CustomerComplaintPage {
    data: CustomerComplaintRecord[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

interface CustomerComplaintListResponse extends CustomerComplaintPage {
    success: boolean;
}

interface CustomerComplaintResponse {
    success: boolean;
    data: CustomerComplaintRecord;
}

export async function getCustomerComplaints(
    page: number,
    limit: number,
    search = "",
): Promise<CustomerComplaintPage> {
    const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
    });
    if (search.trim()) query.set("search", search.trim());

    const response = await apiClient<CustomerComplaintListResponse>(
        `/api/complaints?${query.toString()}`,
    );

    return {
        data: response.data,
        pagination: response.pagination,
    };
}

export async function getCustomerComplaint(
    complaintId: string,
): Promise<CustomerComplaintRecord> {
    const response = await apiClient<CustomerComplaintResponse>(
        `/api/complaints/${encodeURIComponent(complaintId)}`,
    );

    return response.data;
}
