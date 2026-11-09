import { notifySessionExpired } from "@/lib/api/client";

export interface BusinessTrial {
    acceptedAt: string;
    expiresAt: string;
    active: boolean;
    daysRemaining: number;
}

export interface BusinessTrialStatus {
    tenant: {
        id: string;
        name: string;
        slug: string;
    };
    canAcceptTrial: boolean;
    onboardingComplete: boolean;
    complaintChannel: "WEB_PORTAL" | null;
    complaintPortalUrl: string | null;
    trial: BusinessTrial | null;
}

interface ApiEnvelope {
    data?: BusinessTrialStatus;
    message?: string;
    error?: { message?: string };
}

export class BusinessTrialApiError extends Error {
    constructor(message: string, public readonly status: number) {
        super(message);
        this.name = "BusinessTrialApiError";
    }
}

async function requestBusinessTrial(
    path: string,
    method: "GET" | "POST" = "GET",
    requestBody?: Record<string, boolean | string>,
): Promise<BusinessTrialStatus> {
    let response: Response;
    try {
        response = await fetch(path, {
            method,
            credentials: "same-origin",
            cache: "no-store",
            headers: {
                ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
            },
            ...(method === "POST"
                ? { body: JSON.stringify(requestBody ?? { accepted: true }) }
                : {}),
        });
    } catch {
        throw new BusinessTrialApiError(
            "We couldn’t reach the business service. Check your connection and try again.",
            0,
        );
    }

    const body = (await response.json().catch(() => null)) as ApiEnvelope | null;
    if (!response.ok) {
        notifySessionExpired(response);
        throw new BusinessTrialApiError(
            body?.error?.message ??
                body?.message ??
                "We couldn’t load your business plan details.",
            response.status,
        );
    }
    if (!body?.data) {
        throw new BusinessTrialApiError(
            "The business service returned an incomplete response.",
            response.status,
        );
    }
    return body.data;
}

export function getBusinessTrialStatus() {
    return requestBusinessTrial("/api/v1/auth/trial");
}

export function acceptBusinessTrial() {
    return requestBusinessTrial("/api/v1/auth/trial/accept", "POST");
}

export function completeBusinessOnboarding() {
    return requestBusinessTrial(
        "/api/v1/auth/trial/onboarding",
        "POST",
        { complaintChannel: "WEB_PORTAL" },
    );
}
