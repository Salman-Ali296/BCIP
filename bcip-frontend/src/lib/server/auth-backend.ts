import { NextResponse, type NextRequest } from "next/server";

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

type AuthMethod = "GET" | "POST";

const REQUEST_TIMEOUT_MS = 10_000;

const AUTH_ENDPOINTS: AuthEndpoint[] = [
    "login",
    "register",
    "resend-verification",
    "verify-email",
    "me",
    "firebase-bootstrap",
    "firebase-login",
    "session-upgrade",
    "logout",
];

/**
 * Removes trailing slashes from a URL path or base URL.
 */
function trimTrailingSlashes(value: string): string {
    return value.replace(/\/+$/, "");
}

/**
 * Parses and validates an absolute HTTP(S) URL.
 * Rejects relative URLs and URLs containing credentials.
 */
function parseBackendUrl(value: string): URL | null {
    try {
        const url = new URL(value);

        if (
            (url.protocol !== "http:" && url.protocol !== "https:") ||
            url.username ||
            url.password
        ) {
            return null;
        }

        return url;
    } catch {
        return null;
    }
}

/**
 * Builds the backend authentication endpoint.
 *
 * Configuration priority:
 * 1. BCIP_AUTH_LOGIN_URL — overrides only the login endpoint.
 * 2. BCIP_AUTH_API_BASE_URL — authentication base URL.
 * 3. BCIP_API_BASE_URL — general API base URL.
 * 4. NEXT_PUBLIC_API_BASE_URL — fallback.
 * 5. http://localhost:4000 — development fallback.
 *
 * Supported base URLs:
 * http://localhost:4000
 * http://localhost:4000/api
 * http://localhost:4000/api/v1
 * http://localhost:4000/api/v1/auth
 */
export function getAuthBackendUrl(
    request: NextRequest,
    endpoint: AuthEndpoint,
): URL | null {
    if (!AUTH_ENDPOINTS.includes(endpoint)) {
        return null;
    }

    // Allow a dedicated login URL when login uses a separate backend route.
    if (endpoint === "login") {
        const loginUrl = process.env.BCIP_AUTH_LOGIN_URL?.trim();

        if (loginUrl) {
            return parseBackendUrl(loginUrl);
        }
    }

    // Authentication-specific base URL.
    const authBase = process.env.BCIP_AUTH_API_BASE_URL?.trim();

    if (authBase) {
        const baseUrl = parseBackendUrl(authBase);

        if (!baseUrl) {
            return null;
        }

        const authPath = normalizeAuthPath(baseUrl.pathname);

        return new URL(
            `${authPath}/${endpoint}`,
            baseUrl.origin,
        );
    }

    // General backend API base URL.
    const apiBase =
        process.env.BCIP_API_BASE_URL?.trim() ||
        process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
        "http://localhost:4000";

    const baseUrl = parseBackendUrl(
        new URL(apiBase, request.url).toString(),
    );

    if (!baseUrl) {
        return null;
    }

    const authPath = normalizeAuthPath(baseUrl.pathname);

    return new URL(
        `${authPath}/${endpoint}`,
        baseUrl.origin,
    );
}

/**
 * Normalizes the backend base path to /api/v1/auth.
 */
function normalizeAuthPath(pathname: string): string {
    const path = trimTrailingSlashes(pathname);

    if (path.endsWith("/api/v1/auth")) {
        return path;
    }

    if (path.endsWith("/api/v1")) {
        return `${path}/auth`;
    }

    if (path.endsWith("/api")) {
        return `${path}/v1/auth`;
    }

    return `${path}/api/v1/auth`;
}

/**
 * Checks whether the request's Origin matches the frontend origin.
 *
 * Requests without an Origin header are allowed here for compatibility
 * with non-browser clients. Cookie-authenticated state-changing routes
 * should also enforce an appropriate CSRF policy.
 */
export function isSameOrigin(request: NextRequest): boolean {
    const origin = request.headers.get("origin");

    if (!origin) {
        return true;
    }

    try {
        return new URL(origin).origin === new URL(request.url).origin;
    } catch {
        return false;
    }
}

/**
 * Returns an error when backend configuration is invalid.
 */
export function authConfigurationError() {
    return NextResponse.json(
        {
            message: "Authentication service is not configured.",
        },
        {
            status: 500,
            headers: {
                "Cache-Control": "no-store",
            },
        },
    );
}

/**
 * Returns an error when the request origin is invalid.
 */
export function invalidOriginError() {
    return NextResponse.json(
        {
            message: "Invalid request origin.",
        },
        {
            status: 403,
            headers: {
                "Cache-Control": "no-store",
            },
        },
    );
}

/**
 * Forwards an authentication request to the backend.
 *
 * Preserves the upstream HTTP status and response body.
 * Does not log passwords, tokens, request bodies, or response bodies.
 */
export async function forwardAuthRequest(
    request: NextRequest,
    backendUrl: URL,
    method: AuthMethod,
): Promise<NextResponse> {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, REQUEST_TIMEOUT_MS);

    try {
        const headers = new Headers({
            Accept: "application/json",
        });

        if (method === "POST") {
            headers.set("Content-Type", "application/json");
        }

        const authorization = request.headers.get("authorization");
        const cookie = request.headers.get("cookie");
        const origin = request.headers.get("origin");
        const correlationId = request.headers.get("x-correlation-id");

        if (authorization) {
            headers.set("Authorization", authorization);
        }

        if (cookie) {
            headers.set("Cookie", cookie);
        }

        if (origin) {
            headers.set("Origin", origin);
        }

        if (correlationId) {
            headers.set("X-Correlation-ID", correlationId);
        }

        const upstream = await fetch(backendUrl, {
            method,
            headers,
            ...(method === "POST"
                ? { body: await request.text() }
                : {}),
            cache: "no-store",
            signal: controller.signal,
            redirect: "manual",
        });

        const responseHeaders = new Headers({
            "Cache-Control": "no-store",
        });

        const contentType = upstream.headers.get("content-type");

        if (contentType) {
            responseHeaders.set("Content-Type", contentType);
        }

        const setCookie = upstream.headers.get("set-cookie");
        if (setCookie) {
            responseHeaders.set("Set-Cookie", setCookie);
        }

        return new NextResponse(upstream.body, {
            status: upstream.status,
            headers: responseHeaders,
        });
    } catch (error: unknown) {
        const errorName =
            error instanceof Error ? error.name : "UnknownError";

        console.error("BCIP authentication upstream request failed.", {
            endpoint: backendUrl.pathname,
            method,
            errorName,
        });

        if (errorName === "AbortError") {
            return NextResponse.json(
                {
                    message:
                        "Authentication service timed out. Please try again.",
                },
                {
                    status: 504,
                    headers: {
                        "Cache-Control": "no-store",
                    },
                },
            );
        }

        return NextResponse.json(
            {
                message:
                    "Authentication service is temporarily unavailable.",
            },
            {
                status: 502,
                headers: {
                    "Cache-Control": "no-store",
                },
            },
        );
    } finally {
        clearTimeout(timeout);
    }
}