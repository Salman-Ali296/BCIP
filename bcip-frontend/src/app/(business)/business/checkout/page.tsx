import type { Metadata } from "next";
import { BusinessCheckout } from "@/features/business-billing/components/BusinessCheckout";

export const metadata: Metadata = {
    title: "Checkout",
    description: "Confirm your billing details and activate a BCIP business plan.",
};

export default function BusinessCheckoutPage() {
    return <BusinessCheckout />;
}
