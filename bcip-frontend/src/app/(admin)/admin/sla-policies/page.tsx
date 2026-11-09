import { AdminGovernanceView } from "@/features/enterprise/components/admin-governance-view";

export const metadata = {
    title: "SLA Policy Engine | BCIP Enterprise",
    description: "Configure service-level agreement thresholds and automated escalation triggers.",
};

export default function AdminSlaPoliciesPage() {
    return <AdminGovernanceView />;
}
