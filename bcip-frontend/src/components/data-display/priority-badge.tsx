import { Badge } from "@/components/ui/badge";
import type { ComplaintPriority, Priority } from "@/features/complaints/types/complaint";

interface PriorityBadgeProps {
    priority: ComplaintPriority | Priority;
    className?: string;
}

const priorityConfig: Record<
    ComplaintPriority | Priority,
    {
        label: string;
        variant: "default" | "success" | "warning" | "danger" | "info";
        icon: string;
        dotColor: string;
    }
> = {
    low: { label: "Low", variant: "info", icon: "↓", dotColor: "bg-blue-500" },
    medium: { label: "Medium", variant: "warning", icon: "→", dotColor: "bg-amber-500" },
    high: { label: "High", variant: "warning", icon: "↑", dotColor: "bg-orange-500" },
    LOW: {
        label: "Low",
        variant: "info",
        icon: "↓",
        dotColor: "bg-blue-500",
    },
    MEDIUM: {
        label: "Medium",
        variant: "warning",
        icon: "→",
        dotColor: "bg-amber-500",
    },
    HIGH: {
        label: "High",
        variant: "warning",
        icon: "↑",
        dotColor: "bg-orange-500",
    },
    CRITICAL: {
        label: "Critical",
        variant: "danger",
        icon: "⚠",
        dotColor: "bg-rose-500",
    },
};

export function PriorityBadge({ priority, className = "" }: PriorityBadgeProps) {
    const config = priorityConfig[priority];

    return (
        <Badge
            variant={config.variant}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium transition-colors duration-200 ${className}`}
        >
            {/* Priority Icon */}
            <span className="text-sm leading-none">{config.icon}</span>

            {/* Animated Dot for Critical */}
            <span className="relative flex h-1.5 w-1.5 shrink-0">
                {priority === "CRITICAL" && (
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${config.dotColor}`} />
                )}
                <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
            </span>

            {config.label}
        </Badge>
    );
}