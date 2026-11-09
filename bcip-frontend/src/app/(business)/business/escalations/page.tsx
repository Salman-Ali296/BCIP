import { EscalationCenterView } from "@/features/enterprise/components/escalation-center-view";

export const metadata = {
    title: "Escalated Cases | BCIP Enterprise",
    description: "Enterprise intervention center for critical and escalated complaints.",
};

export default function BusinessEscalationsPage() {
    return <EscalationCenterView />;
}
