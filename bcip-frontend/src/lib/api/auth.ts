import { apiClient } from "@/lib/api/client";

/**
 * Standard API response envelope returned by the BCIP backend.
 */
interface ApiEnvelope<T> {
    success: true;
    message: string;
    data: T;
}

/**
 * Authenticated user profile returned by the backend.
 */
export interface AuthUser {
    id: string;
    fullName?: string;
    email: string;
    role: string;
    accountType?: string;
    emailVerified: boolean;
    businessVerified?: boolean;
    tenantId?: string;
    tenantName?: string;
}

/**
 * Token-based session returned by password login.
 */
export interface AuthSession {
    token: string;
    user: AuthUser;
}

/**
 * Cookie-based session returned by Firebase login or session upgrade.
 */
export interface CookieAuthSession {
    user: AuthUser;
}

/**
 * A supporting document submitted during business registration.
 */
export interface RegistrationDocument {
    documentType: string;
    fileName: string;
    fileUrl: string;
    metadata?: Record<string, unknown>;
}

/**
 * A company policy submitted during business registration.
 */
export interface RegistrationPolicy {
    name: string;
    version: string;
    content: string;
    effectiveAt?: string;
}

/**
 * Payload used to create a new business or customer account.
 */
export interface RegistrationRequest {
    accountType: "BUSINESS" | "CUSTOMER";
    email: string;
    password: string;
    fullName: string;
    phone: string;
    businessName?: string;
    industry?: string;
    teamSize?: string;
    workspaceName?: string;
    timezone?: string;
    website?: string;
    termsAccepted: boolean;
    privacyPolicyAccepted: boolean;
    documents?: RegistrationDocument[];
    policies?: RegistrationPolicy[];
}

/**
 * Email verification configuration returned by the backend.
 */
export interface EmailVerificationPolicy {
    codeLength: number;
    expiresInSeconds: number;
    resendCooldownSeconds: number;
}

/**
 * Final result returned after completing business registration.
 */
export interface BusinessRegistrationResult {
    registrationReferenceId: string;
    emailVerified: boolean;
    businessVerified: boolean;
    businessApprovalStatus: "APPROVED" | "PENDING_REVIEW";
}

/**
 * Payload used to submit final business registration details for review.
 */
export interface CompleteBusinessRegistrationPayload {
    businessName: string;
    industry: string;
    website?: string;
    teamSize: string;
    phone: string;
    country: string;
    city: string;
    businessAddress?: string;
    description?: string;
    registrationNumber?: string;
    evidenceUrl?: string;
    confirmationAccepted: boolean;
}

/**
 * Result returned after verifying an email address.
 */
export interface EmailVerificationResult {
    id: string;
    email: string;
    emailVerified: boolean;
    registrationToken?: string;
}

/**
 * Fetch the email verification policy (code length, expiry, resend cooldown).
 */
export async function getEmailVerificationPolicy(): Promise<EmailVerificationPolicy> {
    const response = await apiClient<ApiEnvelope<EmailVerificationPolicy>>(
        "/api/auth/verification-policy",
        { method: "GET", sameOrigin: true, cache: "no-store" },
    );
    return response.data;
}

/**
 * Sign in with email and password. Returns a bearer token session.
 */
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

/**
 * Exchange BCIP credentials for a Firebase custom token.
 */
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

/**
 * Exchange a Firebase ID token for a cookie-based BCIP session.
 */
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

/**
 * Upgrade a bearer token session into a cookie-based session.
 */
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

/**
 * Sign out from the backend and invalidate the session.
 */
export async function logoutFromBackend(): Promise<void> {
    await apiClient<void>("/api/auth/logout", {
        method: "POST",
    });
}

/**
 * Fetch the currently authenticated user profile.
 */
export async function getCurrentUser(token?: string): Promise<AuthUser> {
    const response = await apiClient<ApiEnvelope<{ user: AuthUser }>>("/api/auth/me", {
        method: "GET",
        token,
        cache: "no-store",
    });
    return response.data.user;
}

/**
 * Create a new account. For business accounts this starts the registration wizard.
 */
export async function registerAccount(
    payload: RegistrationRequest,
): Promise<{ verificationRequired: boolean }> {
    const response = await apiClient<ApiEnvelope<{ verificationRequired: boolean }>>(
        "/api/auth/register",
        { method: "POST", body: JSON.stringify(payload), sameOrigin: true },
    );
    return response.data;
}

/**
 * Change the email address used during a pending registration.
 */
export async function changeRegistrationEmail(
    email: string,
    newEmail: string,
    password: string,
): Promise<{ accepted: boolean }> {
    const response = await apiClient<ApiEnvelope<{ accepted: boolean }>>(
        "/api/auth/registration/email",
        {
            method: "POST",
            body: JSON.stringify({ email, newEmail, password }),
            sameOrigin: true,
        },
    );
    return response.data;
}

/**
 * Update account details (name and phone) during a pending registration.
 */
export async function updateRegistrationAccount(
    token: string,
    fullName: string,
    phone: string,
): Promise<void> {
    await apiClient<ApiEnvelope<{ updated: boolean }>>(
        "/api/auth/registration/account",
        {
            method: "PATCH",
            token,
            body: JSON.stringify({ fullName, phone }),
            sameOrigin: true,
        },
    );
}

/**
 * Submit final business registration details for admin review.
 */
export async function completeBusinessRegistration(
    token: string,
    payload: CompleteBusinessRegistrationPayload,
): Promise<BusinessRegistrationResult> {
    const response = await apiClient<ApiEnvelope<BusinessRegistrationResult>>(
        "/api/auth/registration/complete",
        {
            method: "POST",
            token,
            body: JSON.stringify(payload),
            sameOrigin: true,
        },
    );
    return response.data;
}

/**
 * Request a 6-digit email verification code.
 */
export async function requestEmailVerificationCode(
    email: string,
): Promise<{ accepted: boolean }> {
    const response = await apiClient<ApiEnvelope<{ accepted: boolean }>>(
        "/api/auth/resend-verification",
        { method: "POST", body: JSON.stringify({ email }), sameOrigin: true },
    );
    return response.data;
}

/**
 * Verify an email address using a long-lived token (legacy link flow).
 */
export async function verifyEmailToken(
    token: string,
): Promise<EmailVerificationResult> {
    const response = await apiClient<ApiEnvelope<EmailVerificationResult>>(
        "/api/auth/verify-email",
        { method: "POST", body: JSON.stringify({ token }), sameOrigin: true },
    );
    return response.data;
}

/**
 * Verify an email address using a 6-digit code (current wizard flow).
 */
export async function verifyEmailCode(
    email: string,
    code: string,
): Promise<EmailVerificationResult> {
    const response = await apiClient<ApiEnvelope<EmailVerificationResult>>(
        "/api/auth/verify-email",
        { method: "POST", body: JSON.stringify({ email, code }), sameOrigin: true },
    );
    return response.data;
}