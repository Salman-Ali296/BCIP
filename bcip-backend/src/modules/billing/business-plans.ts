import { getBusinessTrialState, type BusinessTrialPeriod } from '../accounts/trial-policy';

export const BUSINESS_PLAN_IDS = ['starter', 'growth', 'business', 'enterprise'] as const;
export type BusinessPlanId = (typeof BUSINESS_PLAN_IDS)[number];
// `business` (Business Growth) is retired from the public catalog but stays
// purchasable so legacy workspaces can keep or renew their existing plan.
export const PURCHASABLE_BUSINESS_PLAN_IDS = ['starter', 'growth', 'business', 'enterprise'] as const;
export type PurchasableBusinessPlanId = (typeof PURCHASABLE_BUSINESS_PLAN_IDS)[number];
export const BILLING_INTERVALS = ['month', 'year'] as const;
export type BillingInterval = (typeof BILLING_INTERVALS)[number];

export const BUSINESS_FEATURE_GROUPS = [
    'Complaint handling',
    'AI intelligence',
    'Team & workflow',
    'Analytics & reporting',
    'Security & support',
] as const;
export type BusinessFeatureGroup = (typeof BUSINESS_FEATURE_GROUPS)[number];

/**
 * Plan entitlements. Each key is stored as a boolean in `business_plans.features`
 * and enforced by `requireBusinessFeature` (backend) and the workspace gate (frontend).
 */
export const BUSINESS_FEATURES = {
    complaint_management: {
        name: 'Unified complaint inbox and case tracking',
        group: 'Complaint handling',
    },
    complaint_portal: {
        name: 'Customer complaint portal with tracking IDs',
        group: 'Complaint handling',
    },
    resolution_management: {
        name: 'Response and resolution workflows',
        group: 'Complaint handling',
    },
    csat_feedback: {
        name: 'Customer satisfaction (CSAT) feedback',
        group: 'Complaint handling',
    },
    ai_triage: {
        name: 'AI categorization, sentiment and priority scoring',
        group: 'AI intelligence',
    },
    duplicate_detection: {
        name: 'Duplicate and similar complaint detection',
        group: 'AI intelligence',
    },
    ai_response_suggestions: {
        name: 'AI-drafted response suggestions',
        group: 'AI intelligence',
    },
    team_management: {
        name: 'Team members, roles and departments',
        group: 'Team & workflow',
    },
    escalations: {
        name: 'Escalation workflows and SLA alerts',
        group: 'Team & workflow',
    },
    knowledge_resources: {
        name: 'Knowledge base and company policies',
        group: 'Team & workflow',
    },
    analytics: {
        name: 'Advanced analytics and trend insights',
        group: 'Analytics & reporting',
    },
    reports: {
        name: 'Reports and customer insights',
        group: 'Analytics & reporting',
    },
    audit_logs: {
        name: 'Audit logs and compliance history',
        group: 'Security & support',
    },
    custom_branding: {
        name: 'White-label portal and custom branding',
        group: 'Security & support',
    },
    api_access: {
        name: 'API access and integrations',
        group: 'Security & support',
    },
    priority_support: {
        name: 'Priority support with a dedicated success manager',
        group: 'Security & support',
    },
} as const satisfies Record<string, { name: string; group: BusinessFeatureGroup }>;

export type BusinessFeature = keyof typeof BUSINESS_FEATURES;

/**
 * Marketing copy for the public catalog. Prices, limits and entitlements live in
 * the database; this only describes how each tier is positioned.
 */
export const BUSINESS_PLAN_PRESENTATION: Record<string, {
    tagline: string;
    highlights: string[];
    featured?: boolean;
    trialAvailable?: boolean;
}> = {
    starter: {
        tagline: 'Everything a small team needs to capture, triage and resolve complaints.',
        highlights: [
            'Customer complaint portal and tracking',
            'AI categorization and priority scoring',
            'Up to 5 team members',
            'Email support',
        ],
        trialAvailable: true,
    },
    growth: {
        tagline: 'For growing support teams that need SLAs, escalations and insight.',
        highlights: [
            'Everything in Starter',
            'Escalation workflows and SLA alerts',
            'AI response suggestions and duplicate detection',
            'Advanced analytics and reports',
        ],
        featured: true,
    },
    enterprise: {
        tagline: 'For multi-department organizations with compliance and scale needs.',
        highlights: [
            'Everything in Professional',
            'Unlimited complaints, AI analyses and seats',
            'Audit logs, white-label portal and API access',
            'Priority support with a success manager',
        ],
    },
};

export function normalizeBusinessPlan(value: unknown): BusinessPlanId | null {
    if (typeof value !== 'string') return null;
    const normalized = value.toLowerCase();
    if (normalized === 'professional') return 'growth';
    if (normalized === 'business_growth') return 'business';
    return BUSINESS_PLAN_IDS.find((plan) => plan === normalized) ?? null;
}

export interface BusinessPlanAccessInput {
    subscriptionStatus: string | null;
    subscriptionPlan: string | null;
    subscriptionCurrentPeriodEnd?: Date | null;
    trial: BusinessTrialPeriod | null;
    now?: Date;
}

export interface BusinessPlanAccess {
    active: boolean;
    plan: string | null;
    source: 'trial' | 'subscription' | null;
    trial: ReturnType<typeof getBusinessTrialState> | null;
    features: Record<string, boolean> | null;
    limits: {
        complaintsPerMonth: number | null;
        teamMembers: number | null;
        aiAnalysesPerMonth: number | null;
        storageMb: number | null;
    } | null;
}

export function resolveBusinessPlanAccess(
    input: BusinessPlanAccessInput,
): BusinessPlanAccess {
    const trial = input.trial
        ? getBusinessTrialState(input.trial, input.now)
        : null;
    const plan = normalizeBusinessPlan(input.subscriptionPlan);
    const status = input.subscriptionStatus?.toLowerCase();
    const subscriptionActive =
        status === 'active' ||
        status === 'trialing' ||
        status === 'demo_active';
    const periodActive =
        !input.subscriptionCurrentPeriodEnd ||
        input.subscriptionCurrentPeriodEnd > (input.now ?? new Date());
    if (subscriptionActive && periodActive && plan) {
        return {
            active: true,
            plan,
            source: 'subscription',
            trial,
            features: null,
            limits: null,
        };
    }

    if (trial?.active) {
        return {
            active: true,
            plan: normalizeBusinessPlan(input.trial?.plan) ?? 'starter',
            source: 'trial',
            trial,
            features: null,
            limits: null,
        };
    }

    return {
        active: false,
        plan: null,
        source: null,
        trial,
        features: null,
        limits: null,
    };
}
