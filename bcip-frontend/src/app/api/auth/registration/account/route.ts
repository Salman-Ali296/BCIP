import type { NextRequest } from "next/server";
import {
    authConfigurationError,
    forwardAuthRequest,
    getAuthBackendUrl,
    invalidOriginError,
    isSameOrigin,
} from "@/lib/server/auth-backend";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
    if (!isSameOrigin(request)) return invalidOriginError();
    const backendUrl = getAuthBackendUrl(request, "registration/account");
    if (!backendUrl) return authConfigurationError();
    return forwardAuthRequest(request, backendUrl, "PATCH");
}
