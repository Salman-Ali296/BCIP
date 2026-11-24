import { apiClient } from "@/lib/api/client";

export type BusinessPlan = string;
export type BillingInterval = "month" | "year";

export interface BusinessPlanFeature {
    id: string;
    name: string;
    group: string;
}

export interface BusinessPlanCatalogItem {
    id: BusinessPlan;
    name: string;
    audience: string;
    summary: string;
    tagline: string;
    highlights: string[];
    featured?: boolean;
    trialAvailable: boolean;
    pricing: {
        currency: string;
        amountCents: Record<BillingInterval, number>;
        annualDiscountPercent: number;
    };
    limits: {
        complaintsPerMonth: number | null;
        teamMembers: number | null;
        aiAnalysesPerMonth: number | null;
        storageMb: number | null;
        retentionDays: number | null;
    };
    contactSales: boolean;
    customPricing: boolean;
    billingIntervals: Record<BillingInterval, boolean>;
    billingVerificationFailedIntervals: Record<BillingInterval, boolean>;
    demoCheckoutAvailable: boolean;
    features: BusinessPlanFeature[];
    featureComparison: Array<BusinessPlanFeature & { included: boolean }>;
}

export interface BillingProfile {
    companyName: string;
    contactName: string;
    billingEmail: string;
    phone: string | null;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string | null;
    postalCode: string;
    country: string;
    taxId: string | null;
    updatedAt?: string | null;
}

export interface BillingProfileState {
    saved: boolean;
    profile: BillingProfile;
}

export interface BusinessSubscription {
    customerId: string | null;
    subscriptionId: string | null;
    status: string | null;
    plan: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    billingCycle?: BillingInterval | null;
    startDate?: string | null;
    planName?: string | null;
    paymentProvider?: string | null;
    features?: Record<string, boolean> | null;
}

export interface BusinessUsage {
    plan: {
        slug: string;
        name: string;
        limits: {
            complaintsPerMonth: number | null;
            teamMembers: number | null;
            aiAnalysesPerMonth: number | null;
            storageMb: number | null;
        };
    };
    period: { start: string; end: string; resetsAt: string };
    usage: {
        complaints: { used: number; limit: number | null };
        aiAnalyses: { used: number; limit: number | null };
        teamMembers: { used: number; limit: number | null };
        storage: { usedBytes: number; limitBytes: number | null };
    };
}

interface ApiEnvelope<T> {
    success: true;
    data: T;
}

interface CheckoutSession {
    id: string;
    url: string;
}

interface DemoCheckoutResult {
    plan: BusinessPlan;
    interval: BillingInterval;
    periodEndsAt: string;
    mode: "demo";
    paymentProcessed: false;
}

interface BillingPortalSession {
    url: string;
}

async function requireData<T>(request: Promise<ApiEnvelope<T>>): Promise<T> {
    const response = await request;
    if (!response?.data) {
        throw new Error("The billing service returned an incomplete response.");
    }
    return response.data;
}

export function getBusinessSubscription(): Promise<BusinessSubscription> {
    return requireData(
        apiClient<ApiEnvelope<BusinessSubscription>>(
            "/api/v1/auth/billing/subscription",
            { method: "GET", cache: "no-store" },
        ),
    );
}

export function getBusinessPlans(): Promise<BusinessPlanCatalogItem[]> {
    return requireData(
        apiClient<ApiEnvelope<BusinessPlanCatalogItem[]>>(
            "/api/v1/auth/billing/plans",
            { method: "GET", cache: "no-store" },
        ),
    );
}

export function createBusinessCheckout(
    plan: BusinessPlan,
    interval: BillingInterval,
): Promise<CheckoutSession> {
    return requireData(
        apiClient<ApiEnvelope<CheckoutSession>>(
            "/api/v1/auth/billing/checkout",
            {
                method: "POST",
                body: JSON.stringify({ plan, interval }),
            },
        ),
    );
}

export function changeBusinessSubscription(
    plan: BusinessPlan,
    interval: BillingInterval,
): Promise<BusinessSubscription & { mode: "demo" | "stripe"; paymentProcessed?: false }> {
    return requireData(
        apiClient<ApiEnvelope<BusinessSubscription & {
            mode: "demo" | "stripe";
            paymentProcessed?: false;
        }>>(
            "/api/v1/auth/billing/subscription/change",
            { method: "POST", body: JSON.stringify({ plan, interval }) },
        ),
    );
}

export function getBusinessUsage(): Promise<BusinessUsage> {
    return requireData(
        apiClient<ApiEnvelope<BusinessUsage>>(
            "/api/v1/auth/billing/subscription/usage",
            { method: "GET", cache: "no-store" },
        ),
    );
}

export function getBusinessSubscriptionHistory(): Promise<Array<{
    id: string;
    action: string;
    previousPlan: string | null;
    newPlan: string | null;
    effectiveDate: string;
    createdAt: string;
}>> {
    return requireData(
        apiClient<ApiEnvelope<Array<{
            id: string;
            action: string;
            previousPlan: string | null;
            newPlan: string | null;
            effectiveDate: string;
            createdAt: string;
        }>>>(
            "/api/v1/auth/billing/subscription/history",
            { method: "GET", cache: "no-store" },
        ),
    );
}

export function getBusinessBillingHistory(): Promise<Array<{
    id: string;
    status: string;
    amountPaid: number | null;
    currency: string | null;
    createdAt: string | null;
    hostedInvoiceUrl: string | null;
}>> {
    return requireData(
        apiClient<ApiEnvelope<Array<{
            id: string;
            status: string;
            amountPaid: number | null;
            currency: string | null;
            createdAt: string | null;
            hostedInvoiceUrl: string | null;
        }>>>(
            "/api/v1/auth/billing/history",
            { method: "GET", cache: "no-store" },
        ),
    );
}

export function createDemoBusinessCheckout(
    plan: BusinessPlan,
    interval: BillingInterval,
): Promise<DemoCheckoutResult> {
    return requireData(
        apiClient<ApiEnvelope<DemoCheckoutResult>>(
            "/api/v1/auth/billing/demo-checkout",
            {
                method: "POST",
                body: JSON.stringify({ plan, interval }),
            },
        ),
    );
}

export function getBillingProfile(): Promise<BillingProfileState> {
    return requireData(
        apiClient<ApiEnvelope<BillingProfileState>>(
            "/api/v1/auth/billing/profile",
            { method: "GET", cache: "no-store" },
        ),
    );
}

export function saveBillingProfile(profile: BillingProfile): Promise<BillingProfileState> {
    const payload = {
        companyName: profile.companyName,
        contactName: profile.contactName,
        billingEmail: profile.billingEmail,
        phone: profile.phone ?? "",
        addressLine1: profile.addressLine1,
        addressLine2: profile.addressLine2 ?? "",
        city: profile.city,
        state: profile.state ?? "",
        postalCode: profile.postalCode,
        country: profile.country,
        taxId: profile.taxId ?? "",
    };
    return requireData(
        apiClient<ApiEnvelope<BillingProfileState>>(
            "/api/v1/auth/billing/profile",
            { method: "PUT", body: JSON.stringify(payload) },
        ),
    );
}

export function resumeBusinessSubscription(): Promise<BusinessSubscription> {
    return requireData(
        apiClient<ApiEnvelope<BusinessSubscription>>(
            "/api/v1/auth/billing/resume",
            { method: "POST" },
        ),
    );
}

export function createBusinessBillingPortal(): Promise<BillingPortalSession> {
    return requireData(
        apiClient<ApiEnvelope<BillingPortalSession>>(
            "/api/v1/auth/billing/portal",
            { method: "POST" },
        ),
    );
}

export function cancelBusinessSubscription(): Promise<BusinessSubscription> {
    return requireData(
        apiClient<ApiEnvelope<BusinessSubscription>>(
            "/api/v1/auth/billing/cancel",
            { method: "POST" },
        ),
    );
}

export function normalizeBusinessPlan(plan: string | null | undefined): BusinessPlan | null {
    const normalized = plan?.toLowerCase();
    if (
        normalized === "starter" ||
        normalized === "growth" ||
        normalized === "business" ||
        normalized === "enterprise"
    ) {
        return normalized;
    }
    if (normalized === "professional") return "growth";
    if (normalized === "business_growth") return "business";
    return null;
}

export function hasActiveBusinessSubscription(
    subscription: BusinessSubscription,
): boolean {
    const status = subscription.status?.toLowerCase();
    return status === "active" || status === "trialing" || status === "demo_active";
}

const FEATURE_PATHS: Array<{ path: string; feature: string }> = [
    { path: "/business/complaints", feature: "complaint_management" },
    { path: "/business/inbox", feature: "complaint_management" },
    { path: "/business/analytics", feature: "analytics" },
    { path: "/business/trends", feature: "analytics" },
    { path: "/business/reports", feature: "reports" },
    { path: "/business/customers", feature: "reports" },
    { path: "/business/escalations", feature: "escalations" },
    { path: "/business/knowledge", feature: "knowledge_resources" },
    { path: "/business/categories", feature: "team_management" },
    { path: "/business/teams", feature: "team_management" },
    { path: "/business/team", feature: "team_management" },
    { path: "/business/employees", feature: "team_management" },
    { path: "/business/performance", feature: "analytics" },
    { path: "/business/settings", feature: "team_management" },
];

export function requiredFeatureForPath(pathname: string): string | null {
    return FEATURE_PATHS.find(
        ({ path }) => pathname === path || pathname.startsWith(`${path}/`),
    )?.feature ?? null;
}

export function isBusinessFeatureAvailable(
    features: Record<string, boolean> | null | undefined,
    pathname: string,
): boolean {
    const requiredFeature = requiredFeatureForPath(pathname);
    return requiredFeature === null || features?.[requiredFeature] === true;
}

const PLAN_DISPLAY_NAMES: Record<string, string> = {
    starter: "Starter",
    growth: "Professional",
    professional: "Professional",
    business: "Business Growth",
    business_growth: "Business Growth",
    enterprise: "Enterprise",
};

export function getBusinessPlanName(plan: string): string {
    const normalized = plan.toLowerCase();
    return PLAN_DISPLAY_NAMES[normalized] ??
        normalized.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
