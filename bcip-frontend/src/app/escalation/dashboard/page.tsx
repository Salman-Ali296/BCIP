import { EscalationCenterView } from "@/features/enterprise/components/escalation-center-view";

export const metadata = {
    title: "Escalation Command Center | BCIP Enterprise",
    description: "Enterprise operational intervention center for critical disputes, repeated cases, and SLA risk radar.",
};

export default function EscalationDashboardPage() {
    return <EscalationCenterView />;
}
