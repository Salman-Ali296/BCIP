// Live complaint data for the business workspace (Inbox, Escalations).
// Calls the Express API through the Next rewrite in next.config.ts:
//   GET   /api/complaints               -> complaintController.listComplaints
//   POST  /api/complaints/:id/escalate  -> complaintController.escalateComplaint
//   PATCH /api/complaints/:id           -> complaintController.updateComplaintStatus
// and maps each row onto the EnterpriseComplaint shape the workspace views use.

import { notifySessionExpired } from "@/lib/api/client";
import type {
    ComplaintCategory,
    ComplaintPriority,
    EnterpriseComplaint,
    EnterpriseComplaintStatus,
    SLATimer,
} from "../types";

/** Row returned by complaintService.listComplaints. */
export interface ApiComplaintRow {
    id: string;
    trackingId: string;
    title: string;
    priority: string;
    status: string;
    aiCategory: string | null;
    aiSentiment: string | null;
    suggestedResponse: string | null;
    aiSummary: string | null;
    assignedToId: string | null;
    customerEmail: string | null;
    createdAt: string;
}

// TenantSettings.defaultSlaHours defaults to 48 in prisma/schema.prisma.
// The list endpoint does not return dueAt, so the workspace uses this target.
const RESOLUTION_TARGET_HOURS = 48;
const AT_RISK_HOURS = 12;

const CATEGORY_LABELS: Record<string, ComplaintCategory> = {
    BILLING: "Billing",
    DELIVERY: "Delivery",
    PRODUCT_QUALITY: "Product quality",
    CUSTOMER_SERVICE: "Customer service",
    TECHNICAL_SUPPORT: "Technical support",
    REFUND: "Refund",
    GENERAL: "General",
};

function toStatus(status: string): EnterpriseComplaintStatus {
    switch (status) {
        case "IN_PROGRESS":
        case "REOPENED":
            return "IN_PROGRESS";
        case "WAITING_FOR_CUSTOMER":
            return "WAITING_FOR_CUSTOMER";
        case "ESCALATED":
            return "ESCALATED";
        case "RESOLVED":
            return "RESOLVED";
        case "CLOSED":
            return "CLOSED";
        default:
            return "NEW"; // PENDING, AI_PROCESSING, OPEN
    }
}

function toPriority(priority: string): ComplaintPriority {
    return priority === "LOW" || priority === "HIGH" || priority === "CRITICAL" ? priority : "MEDIUM";
}

function toSentiment(sentiment: string | null): EnterpriseComplaint["sentiment"] {
    return sentiment === "NEGATIVE" || sentiment === "POSITIVE" ? sentiment : "NEUTRAL";
}

function formatWhen(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatHours(hours: number): string {
    if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`;
    if (hours < 48) return `${Math.round(hours)}h`;
    return `${Math.round(hours / 24)}d`;
}

function buildSla(createdAt: string, status: EnterpriseComplaintStatus, now: number): SLATimer {
    const created = new Date(createdAt).getTime();
    const deadline = created + RESOLUTION_TARGET_HOURS * 3_600_000;
    const base = {
        deadlineTimestamp: new Date(deadline).toISOString(),
        responseDueMinutes: 120,
        resolutionDueMinutes: RESOLUTION_TARGET_HOURS * 60,
    };

    if (status === "RESOLVED" || status === "CLOSED") {
        return { ...base, status: "ON_TRACK", timeRemainingText: "Resolved", breached: false };
    }

    const hoursLeft = (deadline - now) / 3_600_000;
    if (hoursLeft < 0) {
        return {
            ...base,
            status: "OVERDUE",
            timeRemainingText: `Overdue by ${formatHours(-hoursLeft)}`,
            breached: true,
        };
    }
    return {
        ...base,
        status: hoursLeft < AT_RISK_HOURS ? "AT_RISK" : "ON_TRACK",
        timeRemainingText: `Due in ${formatHours(hoursLeft)}`,
        breached: false,
    };
}

export function mapComplaintRow(
    row: ApiComplaintRow,
    businessName: string,
    now: number = Date.now(),
): EnterpriseComplaint {
    const status = toStatus(row.status);
    const customerName = row.customerEmail?.split("@")[0] ?? "Customer";

    return {
        id: row.id,
        trackingId: row.trackingId,
        referenceNumber: row.trackingId,
        title: row.title,
        description: row.aiSummary ?? row.title,
        customer: {
            id: row.customerEmail ?? row.id,
            name: customerName,
            email: row.customerEmail ?? "",
            phone: "",
            tier: "Standard",
            accountNumber: "",
        },
        organization: businessName,
        businessUnit: "",
        department: "",
        team: "",
        assignedAgent: row.assignedToId
            ? { id: row.assignedToId, name: "Assigned team member", email: "" }
            : undefined,
        category: CATEGORY_LABELS[row.aiCategory ?? ""] ?? "General",
        priority: toPriority(row.priority),
        status,
        sentiment: toSentiment(row.aiSentiment),
        channel: "PORTAL",
        createdAt: formatWhen(row.createdAt),
        updatedAt: formatWhen(row.createdAt),
        sla: buildSla(row.createdAt, status, now),
        aiInsights: {
            summary: row.aiSummary ?? "",
            categoryConfidence: 0,
            sentimentScore: row.aiSentiment ?? "",
            suggestedAction: row.suggestedResponse ?? "",
            relatedComplaintsCount: 0,
        },
        escalation: status === "ESCALATED"
            ? {
                  isEscalated: true,
                  escalatedBy: "",
                  escalatedTo: "Escalation team",
                  reason: "",
                  timestamp: "",
                  comment: "",
              }
            : undefined,
        auditTrail: [],
        messages: [],
        internalNotes: [],
        attachments: [],
    };
}

async function send<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(path, {
        credentials: "include",
        cache: "no-store",
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.method && init.method !== "GET"
                ? { "x-idempotency-key": crypto.randomUUID() }
                : {}),
            ...init?.headers,
        },
    });
    const body = (await response.json().catch(() => null)) as
        | { data?: T; error?: { message?: string } }
        | null;
    if (!response.ok) {
        notifySessionExpired(response);
        throw new Error(body?.error?.message ?? "The complaint service didn't respond.");
    }
    return body?.data as T;
}

export const workspaceComplaintsQueryKey = ["workspace-complaints"] as const;

/** The backend caps a page at 100 rows. */
export function fetchWorkspaceComplaints(): Promise<ApiComplaintRow[]> {
    return send<ApiComplaintRow[]>("/api/complaints?limit=100").then((rows) => rows ?? []);
}

export function escalateWorkspaceComplaint(id: string, reason: string) {
    return send(`/api/complaints/${encodeURIComponent(id)}/escalate`, {
        method: "POST",
        body: JSON.stringify({ reason }),
    });
}

export function resolveWorkspaceComplaint(id: string) {
    return send(`/api/complaints/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "RESOLVED" }),
    });
}
