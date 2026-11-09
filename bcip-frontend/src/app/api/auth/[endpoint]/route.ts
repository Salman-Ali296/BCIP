import type { NextRequest } from "next/server";
import {
    authConfigurationError,
    forwardAuthRequest,
    getAuthBackendUrl,
    invalidOriginError,
    isSameOrigin,
} from "@/lib/server/auth-backend";
import { isPersonalEmailAddress } from "@/lib/validation/business-email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type AuthEndpoint =
    | "login"
    | "register"
    | "resend-verification"
    | "verify-email"
    | "me"
    | "firebase-bootstrap"
    | "firebase-login"
    | "session-upgrade"
    | "logout";

function isAuthEndpoint(endpoint: string): endpoint is AuthEndpoint {
    return endpoint === "login" ||
        endpoint === "register" ||
        endpoint === "resend-verification" ||
        endpoint === "verify-email" ||
        endpoint === "me" ||
        endpoint === "firebase-bootstrap" ||
        endpoint === "firebase-login" ||
        endpoint === "session-upgrade" ||
        endpoint === "logout";
}

interface RouteContext {
    params: Promise<{ endpoint: string }>;
}

async function proxyAuthRequest(
    request: NextRequest,
    context: RouteContext,
    method: "GET" | "POST",
) {
    const { endpoint } = await context.params;
    if (!isAuthEndpoint(endpoint)) {
        return Response.json(
            { message: "Authentication endpoint not found." },
            { status: 404, headers: { "Cache-Control": "no-store" } },
        );
    }

    if (!isSameOrigin(request)) {
        return invalidOriginError();
    }

    const backendUrl = getAuthBackendUrl(request, endpoint);
    if (!backendUrl) {
        return authConfigurationError();
    }
    if (method === "GET") backendUrl.search = request.nextUrl.search;

    return forwardAuthRequest(request, backendUrl, method);
}

export function GET(request: NextRequest, context: RouteContext) {
    return proxyAuthRequest(request, context, "GET");
}

export function POST(request: NextRequest, context: RouteContext) {
    return validateAndProxyRegistration(request, context);
}

async function validateAndProxyRegistration(
    request: NextRequest,
    context: RouteContext,
) {
    const { endpoint } = await context.params;
    if (!isSameOrigin(request)) {
        return invalidOriginError();
    }

    if (endpoint === "register") {
        const payload: unknown = await request.clone().json().catch(() => null);
        if (
            typeof payload === "object" &&
            payload !== null &&
            "accountType" in payload &&
            payload.accountType === "BUSINESS" &&
            "email" in payload &&
            typeof payload.email === "string" &&
            isPersonalEmailAddress(payload.email)
        ) {
            const message =
                "Use your work email address. Personal email addresses aren’t allowed for business registration.";
            return Response.json(
                {
                    message,
                    error: { code: "BUSINESS_EMAIL_REQUIRED", message },
                },
                { status: 400, headers: { "Cache-Control": "no-store" } },
            );
        }
    }
    return proxyAuthRequest(request, context, "POST");
}
