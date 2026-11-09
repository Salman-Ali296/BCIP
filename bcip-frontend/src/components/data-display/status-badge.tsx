import { Badge } from "@/components/ui/badge";
import type { ComplaintStatus } from "@/features/complaints/types/complaint";

interface StatusBadgeProps {
    status: ComplaintStatus;
    className?: string;
}

// Maps your status to the EXACT variants your Badge component expects,
// plus a matching Tailwind color for the visual status dot.
const statusConfig: Record<
    ComplaintStatus,
    {
        label: string;
        variant: "default" | "success" | "warning" | "danger" | "info";
        dotColor: string;
    }
> = {
    submitted: { label: "Submitted", variant: "info", dotColor: "bg-blue-500" },
    analyzed: { label: "Analyzed", variant: "info", dotColor: "bg-indigo-500" },
    assigned: { label: "Assigned", variant: "info", dotColor: "bg-blue-500" },
    in_review: { label: "In Review", variant: "warning", dotColor: "bg-amber-500" },
    awaiting_customer: { label: "Awaiting customer", variant: "warning", dotColor: "bg-amber-500" },
    resolved: { label: "Resolved", variant: "success", dotColor: "bg-emerald-500" },
    acknowledged: { label: "Acknowledged", variant: "info", dotColor: "bg-blue-500" },
    in_progress: { label: "In Progress", variant: "warning", dotColor: "bg-amber-500" },
    PENDING: {
        label: "Pending",
        variant: "warning",
        dotColor: "bg-amber-500",
    },
    AI_PROCESSING: {
        label: "AI Processing",
        variant: "info",
        dotColor: "bg-indigo-500",
    },
    OPEN: {
        label: "Open",
        variant: "info",
        dotColor: "bg-blue-500",
    },
    IN_PROGRESS: {
        label: "In Progress",
        variant: "warning",
        dotColor: "bg-amber-500",
    },
    WAITING_FOR_CUSTOMER: {
        label: "Waiting for customer",
        variant: "warning",
        dotColor: "bg-amber-500",
    },
    ESCALATED: {
        label: "Escalated",
        variant: "danger",
        dotColor: "bg-rose-500",
    },
    RESOLVED: {
        label: "Resolved",
        variant: "success",
        dotColor: "bg-emerald-500",
    },
    CLOSED: {
        label: "Closed",
        variant: "default",
        dotColor: "bg-slate-500",
    },
    REOPENED: {
        label: "Reopened",
        variant: "info",
        dotColor: "bg-blue-500",
    },
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <Badge
            variant={config.variant}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium transition-colors duration-200 ${className}`}
        >
            {/* Animated Status Dot */}
            <span className="relative flex h-1.5 w-1.5 shrink-0">
                {/* Ping animation only for In Progress */}
                {(status === "IN_PROGRESS" || status === "in_review") && (
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${config.dotColor}`} />
                )}
                {/* Solid dot */}
                <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
            </span>
            {config.label}
        </Badge>
    );
}