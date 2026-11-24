import type { ReactNode } from "react";
import "./business-workspace.css";
import { BusinessTrialGate } from "@/features/business-trial/components/BusinessTrialGate";

interface BusinessLayoutProps {
    children: ReactNode;
}

export default function BusinessLayout({
    children,
}: BusinessLayoutProps) {
    return <BusinessTrialGate>{children}</BusinessTrialGate>;
}
