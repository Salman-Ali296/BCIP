import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../../(business)/business-workspace.css";

export const metadata: Metadata = {
    title: "Accept business invitation",
    robots: { index: false, follow: false },
    referrer: "no-referrer",
};

export default function AcceptInvitationLayout({ children }: { children: ReactNode }) {
    return children;
}
