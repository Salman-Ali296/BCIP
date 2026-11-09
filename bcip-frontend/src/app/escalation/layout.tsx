import type { ReactNode } from "react";
import { EnterpriseShell } from "@/features/enterprise/components/enterprise-shell";

export default function EscalationLayout({ children }: { children: ReactNode }) {
    return <EnterpriseShell>{children}</EnterpriseShell>;
}
