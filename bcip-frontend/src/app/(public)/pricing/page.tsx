import type { Metadata } from "next";
import { PublicPricing } from "@/features/business-billing/components/PublicPricing";

export const metadata: Metadata = {
    title: "Pricing",
    description:
        "Compare BCIP Starter, Professional and Enterprise plans for AI-powered business complaint management, billed monthly or yearly.",
};

export default function PricingPage() {
    return <PublicPricing />;
}
