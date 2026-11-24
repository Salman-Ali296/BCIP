import { apiClient } from "@/lib/api/client";

export type BusinessPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type BusinessMemberRole = "BUSINESS_ADMIN" | "MANAGER" | "AGENT" | "ESCALATION_AGENT";
export type BusinessWeekday =
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";

export interface BusinessIdentityStep {
    businessName: string;
    legalBusinessName: string;
    website: string;
    industry: string;
    teamSize: string;
    country: string;
    timezone: string;
    primaryEmail: string;
    primaryContactName: string;
    phone: string;
    logoUrl: string;
}

export interface BusinessDepartmentDraft {
    id?: string;
    name: string;
    description: string;
    managerUserId: string | null;
    isActive: boolean;
}

export type TeamRoleLevelRole = "MANAGER" | "ESCALATION_AGENT" | "AGENT";

export interface TeamRoleLevel {
    role: TeamRoleLevelRole;
    count: number;
}

export interface BusinessTeamDraft {
    id?: string;
    name: string;
    description: string;
    roleLevels?: TeamRoleLevel[];
    /** Client-only: saved as the owner of the team's matching department. */
    leadUserId?: string | null;
    isActive: boolean;
}

export interface BusinessOperationsStep {
    departments: BusinessDepartmentDraft[];
    teams: BusinessTeamDraft[];
    workingDays: BusinessWeekday[];
    workingHourStart: string;
    workingHourEnd: string;
    defaultResponseTargetMinutes: number;
    defaultResolutionTargetMinutes: number;
    escalationThresholdMinutes: number;
    defaultPriority: BusinessPriority;
    primaryTeamId: string | null;
}

export interface BusinessCategoryDraft {
    id?: string;
    name: string;
    description: string;
    defaultPriority: BusinessPriority;
    isActive: boolean;
}

export interface BusinessIntelligenceStep {
    categories: BusinessCategoryDraft[];
    ai: {
        categorizationEnabled: boolean;
        sentimentEnabled: boolean;
        prioritySuggestionEnabled: boolean;
        similarityDetectionEnabled: boolean;
        responseSuggestionEnabled: boolean;
        summaryEnabled: boolean;
    };
}

export interface BusinessTeamStep {
    members: Array<{
        userId: string;
        departmentId: string | null;
        teamId: string | null;
    }>;
}

export interface BusinessWorkspaceStep {
    workspaceDisplayName: string;
    primaryColor: string;
    dateFormat: "MMM d, yyyy" | "dd/MM/yyyy" | "MM/dd/yyyy" | "yyyy-MM-dd";
    defaultComplaintView: "inbox" | "table";
    defaultDashboardPeriod: "7d" | "30d" | "90d";
    notifications: {
        newComplaint: boolean;
        highPriority: boolean;
        escalation: boolean;
        assignment: boolean;
        weeklySummary: boolean;
        email: boolean;
        inApp: boolean;
    };
}

export interface BusinessOnboardingData {
    tenant: {
        id: string;
        name: string;
        legalName: string | null;
        slug: string;
        email: string;
        phone: string | null;
        website: string | null;
        industry: string | null;
        teamSize: string | null;
        country: string | null;
        timezone: string;
        primaryContactName: string | null;
        logoUrl: string | null;
        complaintChannel: string | null;
        onboardingCompletedAt: string | null;
    };
    progress: {
        currentStep: number;
        completedThrough: number;
        version: number;
        completedAt: string | null;
    };
    steps: {
        "1": BusinessIdentityStep;
        "2": BusinessOperationsStep;
        "3": BusinessIntelligenceStep;
        "4": BusinessTeamStep;
        "5": BusinessWorkspaceStep;
    };
    departments: Array<BusinessDepartmentDraft & { id: string }>;
    teams: Array<BusinessTeamDraft & { id: string }>;
    categories: Array<BusinessCategoryDraft & { id: string }>;
    users: Array<{
        id: string;
        fullName: string;
        email: string;
        role: BusinessMemberRole;
        departmentId: string | null;
        teamId: string | null;
    }>;
    invitations: Array<{
        id: string;
        email: string;
        role: Exclude<BusinessMemberRole, "BUSINESS_ADMIN">;
        expiresAt: string;
        department: { name: string } | null;
    }>;
}

interface ApiEnvelope<T> {
    success: true;
    data: T;
}

async function requireData<T>(request: Promise<ApiEnvelope<T>>): Promise<T> {
    const response = await request;
    if (!response?.data) {
        throw new Error("The onboarding service returned an incomplete response.");
    }
    return response.data;
}

export function getBusinessOnboarding(): Promise<BusinessOnboardingData> {
    return requireData(
        apiClient<ApiEnvelope<BusinessOnboardingData>>(
            "/api/v1/auth/onboarding",
            { method: "GET", cache: "no-store", sameOrigin: true },
        ),
    );
}

export function saveBusinessOnboardingStep(
    step: number,
    version: number,
    data:
        | BusinessIdentityStep
        | BusinessOperationsStep
        | BusinessIntelligenceStep
        | BusinessTeamStep
        | BusinessWorkspaceStep,
): Promise<BusinessOnboardingData> {
    return requireData(
        apiClient<ApiEnvelope<BusinessOnboardingData>>(
            `/api/v1/auth/onboarding/steps/${step}`,
            {
                method: "PUT",
                sameOrigin: true,
                body: JSON.stringify({ version, data }),
            },
        ),
    );
}

export function completeBusinessWorkspaceOnboarding(
    version: number,
): Promise<{ completedAt: string; onboarding: BusinessOnboardingData }> {
    return requireData(
        apiClient<ApiEnvelope<{ completedAt: string; onboarding: BusinessOnboardingData }>>(
            "/api/v1/auth/onboarding/complete",
            {
                method: "POST",
                sameOrigin: true,
                body: JSON.stringify({ version }),
            },
        ),
    );
}

export function createBusinessInvitation(input: {
    email: string;
    role: "MANAGER" | "AGENT" | "ESCALATION_AGENT";
    departmentId: string | null;
}): Promise<{
    id: string;
    email: string;
    role: string;
    expiresAt: string;
}> {
    return requireData(
        apiClient<ApiEnvelope<{
            id: string;
            email: string;
            role: string;
            expiresAt: string;
        }>>(
            "/api/v1/auth/onboarding/invitations",
            {
                method: "POST",
                sameOrigin: true,
                body: JSON.stringify(input),
            },
        ),
    );
}

export function inspectBusinessInvitation(token: string): Promise<{
    email: string;
    role: string;
    businessName: string;
    expiresAt: string;
}> {
    return requireData(
        apiClient<ApiEnvelope<{
            email: string;
            role: string;
            businessName: string;
            expiresAt: string;
        }>>(
            "/api/v1/auth/invitations/preview",
            { method: "POST", sameOrigin: true, body: JSON.stringify({ token }) },
        ),
    );
}

export function acceptBusinessInvitation(input: {
    token: string;
    fullName: string;
    password: string;
}): Promise<{ businessName: string; email: string }> {
    return requireData(
        apiClient<ApiEnvelope<{ businessName: string; email: string }>>(
            "/api/v1/auth/invitations/accept",
            { method: "POST", sameOrigin: true, body: JSON.stringify(input) },
        ),
    );
}
