import { AdminGovernanceView } from "@/features/enterprise/components/admin-governance-view";

export const metadata = {
    title: "Business Units & Departments | BCIP Enterprise",
    description: "Manage divisional business units, operational departments, and support teams.",
};

export default function AdminBusinessUnitsPage() {
    return <AdminGovernanceView />;
}
