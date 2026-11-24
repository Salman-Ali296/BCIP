import type { Metadata } from "next";
import { Suspense } from "react";
import { BusinessBillingOverview } from "@/features/business-billing/components/BusinessBillingOverview";

export const metadata: Metadata = {
    title: "Plan & billing",
    description: "Manage your BCIP subscription, usage, invoices and billing details.",
};

export default function BusinessBillingPage() {
    return (
        <Suspense fallback={null}>
            <BusinessBillingOverview />
        </Suspense>
    );
}
