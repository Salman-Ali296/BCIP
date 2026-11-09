import { AdminGovernanceView } from "@/features/enterprise/components/admin-governance-view";

export const metadata = {
    title: "Organizations | BCIP Enterprise",
    description: "Enterprise multi-tenant organizational structure and hierarchy.",
};

export default function AdminOrganizationsPage() {
    return <AdminGovernanceView />;
}
