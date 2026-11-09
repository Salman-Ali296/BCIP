import { DM_Sans } from "next/font/google";
import type { ReactNode } from "react";
import "./business-workspace.css";
import { BusinessTrialGate } from "@/features/business-trial/components/BusinessTrialGate";

const workspaceSans = DM_Sans({
    subsets: ["latin"],
    variable: "--font-workspace-sans",
});

interface BusinessLayoutProps {
    children: ReactNode;
}

export default function BusinessLayout({
    children,
}: BusinessLayoutProps) {
    return (
        <div className={workspaceSans.variable}>
            <BusinessTrialGate>{children}</BusinessTrialGate>
        </div>
    );
}