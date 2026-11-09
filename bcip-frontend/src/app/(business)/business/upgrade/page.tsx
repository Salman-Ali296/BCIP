import type { Metadata } from "next";
import { BusinessPlanSelection } from "@/features/business-billing/components/BusinessPlanSelection";

export const metadata: Metadata = {
    title: "Choose your business plan",
    description: "Compare BCIP business plans and continue to secure checkout.",
};

export default function BusinessUpgradePage() {
    return <BusinessPlanSelection />;
}
