import type { Metadata } from "next";
import { BusinessOverview } from "@/features/enterprise/components/business-overview";

export const metadata: Metadata = {
    title: "Business overview",
    description: "Your business complaint workspace at a glance.",
};

export default function BusinessDashboardPage() {
    return <BusinessOverview />;
}
