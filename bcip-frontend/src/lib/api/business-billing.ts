import { apiClient } from "@/lib/api/client";

export type BusinessPlan = "starter" | "growth" | "business";
export type BillingInterval = "month" | "year";

export interface BusinessSubscription {
    customerId: string | null;
    subscriptionId: string | null;
    status: string | null;
    plan: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
}

interface ApiEnvelope<T> {
    success: true;
    data: T;
}

interface CheckoutSession {
    id: string;
    url: string;
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

export function createBusinessBillingPortal(): Promise<BillingPortalSession> {
    return requireData(
        apiClient<ApiEnvelope<BillingPortalSession>>(
            "/api/v1/auth/billing/portal",
            { method: "POST" },
        ),
    );
}

export function normalizeBusinessPlan(plan: string | null | undefined): BusinessPlan | null {
    const normalized = plan?.toLowerCase();
    if (
        normalized === "starter" ||
        normalized === "growth" ||
        normalized === "business"
    ) {
        return normalized;
    }
    return null;
}

export function hasActiveBusinessSubscription(
    subscription: BusinessSubscription,
): boolean {
    const status = subscription.status?.toLowerCase();
    return status === "active" || status === "trialing";
}

const PLAN_LEVEL: Record<BusinessPlan, number> = {
    starter: 1,
    growth: 2,
    business: 3,
};

const BUSINESS_FEATURES: Array<{
    path: string;
    minimumPlan: BusinessPlan;
}> = [
    { path: "/business/analytics", minimumPlan: "growth" },
    { path: "/business/trends", minimumPlan: "growth" },
    { path: "/business/reports", minimumPlan: "growth" },
    { path: "/business/customers", minimumPlan: "growth" },
    { path: "/business/escalations", minimumPlan: "business" },
    { path: "/business/knowledge", minimumPlan: "business" },
    { path: "/business/categories", minimumPlan: "business" },
    { path: "/business/teams", minimumPlan: "business" },
    { path: "/business/team", minimumPlan: "business" },
    { path: "/business/employees", minimumPlan: "business" },
    { path: "/business/performance", minimumPlan: "business" },
    { path: "/business/settings", minimumPlan: "business" },
];

export function requiredPlanForPath(pathname: string): BusinessPlan | null {
    return BUSINESS_FEATURES.find(
        ({ path }) => pathname === path || pathname.startsWith(`${path}/`),
    )?.minimumPlan ?? null;
}

export function businessPlanCanAccess(
    currentPlan: BusinessPlan,
    minimumPlan: BusinessPlan | null,
): boolean {
    return minimumPlan === null || PLAN_LEVEL[currentPlan] >= PLAN_LEVEL[minimumPlan];
}
