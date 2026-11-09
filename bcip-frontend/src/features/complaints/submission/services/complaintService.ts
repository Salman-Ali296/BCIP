import { apiClient } from "@/lib/api/client";
import type {
    ComplaintResponse,
    ComplaintSubmissionPayload,
} from "@/features/complaints/submission/types/complaint.types";
import type { CreateComplaintResponse } from "@/features/complaints/types/complaint-api";

export async function getTenantIdBySlug(slug: string): Promise<string> {
    const response = await apiClient<{ data: { id: string } }>(`/api/complaints/tenant/${encodeURIComponent(slug)}`);
    return response.data.id;
}

interface BackendSubmissionResponse {
    success: boolean;
    data: CreateComplaintResponse["data"];
    message?: string;
}

function getTenantId(tenantId?: string): string {
    if (tenantId) return tenantId;

    if (typeof window !== "undefined") {
        const storedTenant = window.localStorage.getItem("bcip_tenant");
        if (storedTenant) {
            const tenant = JSON.parse(storedTenant) as { id?: string };
            if (tenant.id) return tenant.id;
        }
    }

    throw new Error("This complaint portal is not linked to a business.");
}

export async function submitComplaint(
    payload: ComplaintSubmissionPayload,
): Promise<ComplaintResponse> {
    const submission = {
        title: payload.subject,
        description: payload.description,
        customerEmail: payload.email,
        customerName: payload.fullName,
        tenantId: getTenantId(payload.tenantId),
    };
    const body = payload.files?.length
        ? (() => {
            const form = new FormData();
            Object.entries(submission).forEach(([key, value]) => form.append(key, value));
            payload.files.forEach((file) => form.append("files", file));
            return form;
        })()
        : JSON.stringify(submission);
    const response = await apiClient<BackendSubmissionResponse>("/api/complaints/submit", {
        method: "POST",
        body,
    });

    return {
        id: response.data.id,
        trackingId: response.data.trackingId,
        status: response.data.status,
        priority: response.data.priority,
        category: response.data.category,
        submittedAt: new Date().toISOString(),
        message: response.message,
    };
}
