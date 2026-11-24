import { apiClient } from "@/lib/api/client";
import type {
    BusinessOverviewComplaint,
    BusinessOverviewSnapshot,
} from "@/features/enterprise/types";

interface ComplaintListResponse {
    success: true;
    data: BusinessOverviewComplaint[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

async function getComplaintPage(
    status?: string,
    limit = 1,
): Promise<ComplaintListResponse> {
    const params = new URLSearchParams({ page: "1", limit: String(limit) });
    if (status) params.set("status", status);

    return apiClient<ComplaintListResponse>(
        `/api/complaints?${params.toString()}`,
        { method: "GET", cache: "no-store" },
    );
}

export async function getBusinessOverviewSnapshot(): Promise<BusinessOverviewSnapshot> {
    const [recent, open, inProgress, resolved] = await Promise.all([
        getComplaintPage(undefined, 5),
        getComplaintPage("OPEN,ESCALATED"),
        getComplaintPage("IN_PROGRESS,WAITING_FOR_CUSTOMER"),
        getComplaintPage("RESOLVED,CLOSED"),
    ]);

    return {
        counts: {
            total: recent.pagination.total,
            open: open.pagination.total,
            inProgress: inProgress.pagination.total,
            resolved: resolved.pagination.total,
        },
        recent: recent.data,
    };
}
