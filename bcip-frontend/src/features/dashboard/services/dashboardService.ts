import { apiClient } from "@/lib/api/client";
import type { ComplaintListResponse, ComplaintResponse, UpdateComplaintResponse } from "@/features/complaints/types/complaint-api";
import type { ComplaintListItem, BulkOperation } from "@/features/dashboard/types/dashboard.types";
import { MOCK_ENTERPRISE_COMPLAINTS } from "@/features/dashboard/data/mockComplaints";

export async function getDashboardComplaints(params: Record<string, string | number | undefined> = {}) {
    const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined).map(([key, value]) => [key, String(value)]));
    try {
        const response = await apiClient<ComplaintListResponse & { data: ComplaintListItem[] }>(`/api/complaints${query.toString() ? `?${query}` : ""}`);
        if (response?.data && response.data.length > 0) {
            return response;
        }
    } catch {
        // Fallback to rich enterprise mock data when offline or backend unavailable
    }

    // Apply basic filtering to mock complaints
    let filtered = [...MOCK_ENTERPRISE_COMPLAINTS];
    const statusParam = params.status ? String(params.status).split(",") : null;
    const priorityParam = params.priority ? String(params.priority).split(",") : null;
    const categoryParam = params.category ? String(params.category).split(",") : null;
    const searchParam = params.search ? String(params.search).toLowerCase() : null;

    if (statusParam && statusParam.length > 0) {
        filtered = filtered.filter((c) => statusParam.includes(c.status));
    }
    if (priorityParam && priorityParam.length > 0) {
        filtered = filtered.filter((c) => priorityParam.includes(c.priority));
    }
    if (categoryParam && categoryParam.length > 0) {
        filtered = filtered.filter((c) => categoryParam.includes(c.category));
    }
    if (searchParam) {
        filtered = filtered.filter((c) =>
            c.title.toLowerCase().includes(searchParam) ||
            c.description.toLowerCase().includes(searchParam) ||
            c.trackingId.toLowerCase().includes(searchParam) ||
            (c.customerName && c.customerName.toLowerCase().includes(searchParam))
        );
    }

    return {
        data: filtered,
        pagination: {
            page: Number(params.page || 1),
            pageSize: Number(params.limit || 10),
            total: filtered.length,
            pages: Math.ceil(filtered.length / Number(params.limit || 10)),
        },
    } as unknown as ComplaintListResponse & { data: ComplaintListItem[] };
}

export async function getDashboardComplaint(id: string) {
    try {
        const response = await apiClient<ComplaintResponse & { data: ComplaintListItem }>(`/api/complaints/${id}`);
        if (response?.data) return response;
    } catch {
        // Fallback
    }
    const mock = MOCK_ENTERPRISE_COMPLAINTS.find((c) => c.id === id || c.trackingId === id) || MOCK_ENTERPRISE_COMPLAINTS[0];
    return { data: mock } as unknown as ComplaintResponse & { data: ComplaintListItem };
}

export async function updateDashboardComplaint(id: string, payload: { status?: string; assignedToId?: string; priority?: string }) {
    try {
        return await apiClient<UpdateComplaintResponse>(`/api/complaints/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
    } catch {
        // Update local mock object
        const mock = MOCK_ENTERPRISE_COMPLAINTS.find((c) => c.id === id);
        if (mock) {
            if (payload.status) mock.status = payload.status as any;
            if (payload.priority) mock.priority = payload.priority as any;
            if (payload.assignedToId !== undefined) mock.assignedToId = payload.assignedToId;
        }
        return { success: true } as unknown as UpdateComplaintResponse;
    }
}

export async function executeBulkOperation(operation: BulkOperation) {
    return Promise.all(operation.complaintIds.map((id) =>
        updateDashboardComplaint(
            id,
            operation.type === "status"
                ? { status: operation.value }
                : operation.type === "priority"
                ? { priority: operation.value }
                : { assignedToId: operation.value }
        )
    ));
}

export function exportComplaintsCsv(complaints: ComplaintListItem[]) {
    const rows = [
        ["Tracking ID", "Title", "Category", "Status", "Priority", "Customer", "Created"],
        ...complaints.map((item) => [
            item.trackingId,
            item.title,
            item.category,
            item.status,
            item.priority,
            item.customerName || item.customerEmail || "N/A",
            item.createdAt,
        ])
    ];
    return rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
}

