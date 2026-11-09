import type { BusinessPlan } from "@/lib/api/business-billing";

export interface BusinessPlanDetails {
    id: BusinessPlan;
    name: string;
    audience: string;
    summary: string;
    features: string[];
    featured?: boolean;
}

export const BUSINESS_PLANS: BusinessPlanDetails[] = [
    {
        id: "starter",
        name: "Starter",
        audience: "For a focused support team",
        summary: "A clear home for customer complaints and day-to-day follow-up.",
        features: [
            "Customer complaint portal",
            "Complaint inbox and case tracking",
            "Response and resolution management",
        ],
    },
    {
        id: "growth",
        name: "Growth",
        audience: "For teams building consistency",
        summary: "See what is changing across customer feedback and service outcomes.",
        features: [
            "Everything in Starter",
            "Business analytics and trends",
            "Reports and customer history",
        ],
        featured: true,
    },
    {
        id: "business",
        name: "Business",
        audience: "For connected operations",
        summary: "Coordinate more people, processes, and customer care resources.",
        features: [
            "Everything in Growth",
            "Teams, categories, and escalations",
            "Knowledge resources and workspace settings",
        ],
    },
];
