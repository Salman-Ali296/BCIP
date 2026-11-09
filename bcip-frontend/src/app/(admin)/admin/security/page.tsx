import { AdminGovernanceView } from "@/features/enterprise/components/admin-governance-view";

export const metadata = {
    title: "Security & Governance | BCIP Enterprise",
    description: "MFA enforcement, tenant isolation verification, and RBAC policies.",
};

export default function AdminSecurityPage() {
    return <AdminGovernanceView />;
}
