import { apiClient } from "@/lib/api/client";

interface ApiEnvelope<T> {
    success: true;
    message: string;
    data: T;
}

export interface AuthUser {
    id: string;
    fullName?: string;
    email: string;
    role: string;
    accountType?: string;
    emailVerified: boolean;
    tenantId?: string;
    tenantName?: string;
}

export interface AuthSession {
    token: string;
    user: AuthUser;
}

export interface CookieAuthSession {
    user: AuthUser;
}

export interface RegistrationRequest {
    accountType: "BUSINESS" | "CUSTOMER";
    email: string;
    password: string;
    fullName: string;
    businessName?: string;
    industry?: string;
    teamSize?: string;
    workspaceName?: string;
    timezone?: string;
    phone?: string;
    website?: string;
    documents?: Array<{
        documentType: string;
        fileName: string;
        fileUrl: string;
        metadata?: Record<string, unknown>;
    }>;
    policies?: Array<{
        name: string;
        version: string;
        content: string;
        effectiveAt?: string;
    }>;
}

export async function loginWithPassword(
    email: string,
    password: string,
): Promise<AuthSession> {
    const response = await apiClient<ApiEnvelope<AuthSession>>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        sameOrigin: true,
    });
    return response.data;
}

export async function bootstrapFirebaseLogin(
    email: string,
    password: string,
): Promise<{ customToken: string }> {
    const response = await apiClient<ApiEnvelope<{ customToken: string }>>(
        "/api/auth/firebase-bootstrap",
        {
            method: "POST",
            body: JSON.stringify({ email, password }),
        },
    );
    return response.data;
}

export async function exchangeFirebaseToken(
    idToken: string,
    rememberMe: boolean,
): Promise<CookieAuthSession> {
    const response = await apiClient<ApiEnvelope<CookieAuthSession>>(
        "/api/auth/firebase-login",
        {
            method: "POST",
            token: idToken,
            body: JSON.stringify({ rememberMe }),
        },
    );
    return response.data;
}

export async function upgradeLegacySession(
    token: string,
    rememberMe: boolean,
): Promise<CookieAuthSession> {
    const response = await apiClient<ApiEnvelope<CookieAuthSession>>(
        "/api/auth/session-upgrade",
        {
            method: "POST",
            token,
            body: JSON.stringify({ rememberMe }),
            sameOrigin: true,
        },
    );
    return response.data;
}

export async function logoutFromBackend(): Promise<void> {
    await apiClient<void>("/api/auth/logout", {
        method: "POST",
    });
}

export async function getCurrentUser(token?: string): Promise<AuthUser> {
    const response = await apiClient<ApiEnvelope<{ user: AuthUser }>>("/api/auth/me", {
        method: "GET",
        token,
        cache: "no-store",
    });
    return response.data.user;
}

export async function registerAccount(
    payload: RegistrationRequest,
): Promise<{ verificationRequired: boolean }> {
    const response = await apiClient<ApiEnvelope<{ verificationRequired: boolean }>>(
        "/api/auth/register",
        { method: "POST", body: JSON.stringify(payload), sameOrigin: true },
    );
    return response.data;
}

export async function requestEmailVerificationCode(email: string): Promise<{ accepted: boolean }> {
    const response = await apiClient<ApiEnvelope<{ accepted: boolean }>>(
        "/api/auth/resend-verification",
        { method: "POST", body: JSON.stringify({ email }), sameOrigin: true },
    );
    return response.data;
}

export async function verifyEmailToken(
    token: string,
): Promise<{ id: string; email: string; emailVerified: boolean }> {
    const response = await apiClient<
        ApiEnvelope<{ id: string; email: string; emailVerified: boolean }>
    >(
        "/api/auth/verify-email",
        { method: "POST", body: JSON.stringify({ token }), sameOrigin: true },
    );
    return response.data;
}

export async function verifyEmailCode(
    email: string,
    code: string,
): Promise<{ id: string; email: string; emailVerified: boolean }> {
    const response = await apiClient<
        ApiEnvelope<{ id: string; email: string; emailVerified: boolean }>
    >(
        "/api/auth/verify-email",
        { method: "POST", body: JSON.stringify({ email, code }), sameOrigin: true },
    );
    return response.data;
}
