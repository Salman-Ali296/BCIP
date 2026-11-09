import { EscalationCenterView } from "@/features/enterprise/components/escalation-center-view";

export const metadata = {
    title: "SLA Risk Radar | BCIP Enterprise",
    description: "Real-time SLA risk monitoring and countdowns.",
};

export default function SlaRiskPage() {
    return <EscalationCenterView />;
}
