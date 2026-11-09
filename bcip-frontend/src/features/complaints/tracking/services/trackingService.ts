import { apiClient } from "@/lib/api/client";
import type { Complaint } from "@/features/complaints/types/complaint";

export interface TrackingEvent { id: string; status: string; message?: string; timestamp: string; }
export interface TrackedComplaint extends Omit<Complaint, "description" | "channel" | "email"> {
    description?: string;
    channel?: Complaint["channel"];
    email?: string;
    events?: TrackingEvent[];
    customer?: { fullName?: string | null; email?: string | null } | null;
}
interface TrackingResponse { success: boolean; data: TrackedComplaint; }

interface BackendTrackedComplaint extends Omit<TrackedComplaint, "category" | "events"> {
    aiCategory?: string | null;
    statusHistory?: Array<{ id: string; toStatus: string; comment?: string | null; changedAt: string }>;
}

function normalizeTrackingComplaint(complaint: BackendTrackedComplaint): TrackedComplaint {
    return {
        ...complaint,
        category: complaint.aiCategory ?? "GENERAL",
        events: complaint.statusHistory?.map((event) => ({
            id: event.id,
            status: event.toStatus,
            message: event.comment ?? undefined,
            timestamp: event.changedAt,
        })),
    };
}

export async function getComplaintByTrackingId(trackingId: string): Promise<TrackedComplaint> {
    const response = await apiClient<TrackingResponse & { data: BackendTrackedComplaint }>(`/api/complaints/track/${encodeURIComponent(trackingId)}`);
    return normalizeTrackingComplaint(response.data);
}

export function subscribeToComplaintUpdates(trackingId: string, onUpdate: (complaint: TrackedComplaint) => void, onError?: () => void): () => void {
    const websocketBase = process.env.NEXT_PUBLIC_WS_URL;
    if (!websocketBase || typeof WebSocket === "undefined") return () => undefined;
    const socket = new WebSocket(`${websocketBase}/complaints/updates?trackingId=${encodeURIComponent(trackingId)}`);
    socket.onmessage = (event) => { try { const payload = JSON.parse(event.data) as { data?: TrackedComplaint }; if (payload.data) onUpdate(payload.data); } catch { onError?.(); } };
    socket.onerror = () => onError?.();
    return () => socket.close();
}
