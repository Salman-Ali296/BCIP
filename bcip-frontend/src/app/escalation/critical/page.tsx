import { EscalationCenterView } from "@/features/enterprise/components/escalation-center-view";

export const metadata = {
    title: "Critical Escalations | BCIP Enterprise",
    description: "Urgent dispute interventions requiring supervisor resolution.",
};

export default function CriticalEscalationsPage() {
    return <EscalationCenterView />;
}
