import type { Metadata } from "next";
import { BusinessTrialOffer } from "@/features/business-trial/components/BusinessTrialOffer";

export const metadata: Metadata = {
    title: "Start a business workspace trial",
    description: "Try the BCIP business workspace for 14 days.",
};

export default function BusinessTrialPage() {
    return <BusinessTrialOffer />;
}
