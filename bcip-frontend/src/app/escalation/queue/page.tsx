import { ThreePanelWorkspace } from "@/features/enterprise/components/three-panel-workspace";

export const metadata = {
    title: "Escalated Cases Queue | BCIP Enterprise",
    description: "Operational queue for escalated complaints.",
};

export default function EscalationQueuePage() {
    return <ThreePanelWorkspace />;
}
