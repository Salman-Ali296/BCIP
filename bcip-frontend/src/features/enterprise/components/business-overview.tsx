"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import {
    Activity,
    ArrowRight,
    ArrowUpRight,
    Building2,
    Clock3,
    FileText,
    Inbox,
    RefreshCw,
    ShieldAlert,
    Users,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import {
    getBusinessPlanName,
    getBusinessUsage,
    type BusinessUsage,
} from "@/lib/api/business-billing";
import {
    businessDashboardQueryKey,
    getBusinessDashboard,
    type BusinessDashboardData,
    type DashboardRange,
} from "@/lib/api/business-dashboard";
import { useBusinessWorkspace } from "@/features/business-trial/context/business-workspace-context";
import { AiIntelligencePanel } from "./ai-intelligence-panel";
import { PlanFeaturesPanel } from "./plan-features-panel";
import {
    DashboardLoading,
    DashboardMetric,
    DashboardPanel,
    DistributionList,
    formatDashboardCount,
    formatDashboardDate,
    formatDashboardPriority,
    formatDashboardStatus,
    InlineEmptyState,
    VolumeTrendChart,
} from "@/features/business-dashboard/components/dashboard-widgets";
import {
    RecentComplaintsTable,
    type ComplaintTableFilters,
} from "@/features/business-dashboard/components/recent-complaints-table";

type DashboardRangeOption = Exclude<DashboardRange, "today" | "custom">;
type DashboardFilters = Parameters<typeof getBusinessDashboard>[0];

const RANGE_OPTIONS: Array<{ value: DashboardRangeOption; label: string }> = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
];

const INITIAL_TABLE_FILTERS: ComplaintTableFilters = {
    search: "",
    status: "",
    priority: "",
    category: "",
    sort: "newest",
};

function useDebouncedValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedValue(value), delay);
        return () => window.clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

function formatHours(hours: number | null): string {
    if (hours === null || !Number.isFinite(hours)) return "—";
    if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
    return `${hours.toFixed(1)} hrs`;
}

function formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes < 0) return "—";
    if (bytes < 1024) return `${Math.round(bytes)} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function getResolutionRate(data: BusinessDashboardData): string {
    const total = data.statusDistribution.reduce((sum, item) => sum + item.count, 0);
    const resolved = data.statusDistribution
        .filter(({ status }) => status === "RESOLVED" || status === "CLOSED")
        .reduce((sum, item) => sum + item.count, 0);

    return total > 0 ? `${Math.round((resolved / total) * 100)}%` : "—";
}

function getFollowUpCount(data: BusinessDashboardData): number {
    return (
        data.statusDistribution.find(
            (item) => item.status === "WAITING_FOR_CUSTOMER",
        )?.count ?? 0
    );
}

function getReasonForAttention(
    item: BusinessDashboardData["attention"][number],
): string {
    if (item.status === "ESCALATED") return "Escalated case";
    if (["CRITICAL", "HIGH"].includes(item.priority.toUpperCase())) {
        return `${formatDashboardPriority(item.priority)} priority`;
    }
    if (!item.assignedTo) return "Awaiting assignment";
    return "Active case";
}

function buildDashboardFilters({
    range,
    search,
    tableFilters,
    page,
}: {
    range: DashboardRangeOption;
    search: string;
    tableFilters: ComplaintTableFilters;
    page: number;
}): DashboardFilters {
    return {
        range,
        grouping: range === "90d" ? "week" : "day",
        search: search.trim() || undefined,
        sort: tableFilters.sort,
        status: tableFilters.status || undefined,
        priority: tableFilters.priority || undefined,
        category: tableFilters.category || undefined,
        page,
    };
}

function useBusinessOverviewQueries(
    workspaceName: string,
    filters: DashboardFilters,
) {
    const dashboard = useQuery({
        queryKey: businessDashboardQueryKey(workspaceName, filters),
        queryFn: () => getBusinessDashboard(filters),
        staleTime: 30_000,
    });

    const usage = useQuery({
        queryKey: ["business-usage", workspaceName],
        queryFn: getBusinessUsage,
        staleTime: 30_000,
    });

    return { dashboard, usage };
}

function UsageMeter({
    label,
    used,
    limit,
    formatValue = formatDashboardCount,
}: {
    label: string;
    used: number;
    limit: number | null;
    formatValue?: (value: number) => string;
}) {
    const percent =
        limit !== null && limit > 0
            ? Math.round((used / limit) * 100)
            : null;
    const nearLimit = percent !== null && percent >= 80;

    return (
        <div className="business-usage-row">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-[var(--workspace-muted)]">
                    {formatValue(used)} /{" "}
                    {limit === null ? "No set limit" : formatValue(limit)}
                </p>
            </div>

            {percent !== null && (
                <div
                    className="business-usage-track mt-2.5"
                    role="progressbar"
                    aria-label={`${label} usage`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.min(percent, 100)}
                    aria-valuetext={`${formatValue(used)} of ${formatValue(100)} used`}
                >
                    <span
                        className={nearLimit ? "is-near-limit" : ""}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                </div>
            )}

            {percent !== null && percent >= 100 && (
                <p className="mt-1.5 text-xs font-medium text-rose-700">
                    This plan limit has been reached.
                </p>
            )}
        </div>
    );
}

function PlanUsagePanel({
    usage,
    workspacePlan,
    isTrial,
    daysRemaining,
    isLoading,
    isError,
    onRetry,
}: {
    usage: BusinessUsage | undefined;
    workspacePlan: string;
    isTrial: boolean;
    daysRemaining: number | null;
    isLoading: boolean;
    isError: boolean;
    onRetry: () => void;
}) {
    return (
        <DashboardPanel
            eyebrow="Subscription & usage"
            title="Plan resources"
            description="Live usage and entitlements for your billing period."
            action={
                <Link href="/business/upgrade" className="business-dashboard-text-link">
                    Manage plan <ArrowRight size={14} aria-hidden="true" />
                </Link>
            }
        >
            <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="business-plan-badge">
                    <span className="size-1.5 rounded-full bg-[var(--workspace-accent)]" />
                    {usage?.plan.name ?? getBusinessPlanName(workspacePlan)}
                </span>

                {isTrial && (
                    <span className="business-plan-caption">
                        {daysRemaining === null
                            ? "Trial active"
                            : `${daysRemaining} trial days remaining`}
                    </span>
                )}
            </div>

            {isLoading ? (
                <div
                    className="mt-5 space-y-3"
                    role="status"
                    aria-label="Loading plan usage"
                >
                    <div className="business-dashboard-skeleton h-12" />
                    <div className="business-dashboard-skeleton h-12" />
                    <div className="business-dashboard-skeleton h-12" />
                </div>
            ) : isError ? (
                <div className="business-dashboard-empty mt-4" role="alert">
                    <p>Usage details could not be loaded.</p>
                    <button
                        type="button"
                        className="business-dashboard-text-link mt-2"
                        onClick={onRetry}
                    >
                        <RefreshCw size={14} aria-hidden="true" /> Try again
                    </button>
                </div>
            ) : usage ? (
                <div className="mt-4 divide-y divide-[var(--workspace-line)]">
                    <UsageMeter
                        label="Complaints"
                        used={usage.usage.complaints.used}
                        limit={usage.usage.complaints.limit}
                    />
                    <UsageMeter
                        label="AI analyses"
                        used={usage.usage.aiAnalyses.used}
                        limit={usage.usage.aiAnalyses.limit}
                    />
                    <UsageMeter
                        label="Team members"
                        used={usage.usage.teamMembers.used}
                        limit={usage.usage.teamMembers.limit}
                    />
                    <UsageMeter
                        label="Evidence storage"
                        used={usage.usage.storage.usedBytes}
                        limit={usage.usage.storage.limitBytes}
                        formatValue={formatBytes}
                    />
                </div>
            ) : (
                <InlineEmptyState>
                    Usage information is not available right now.
                </InlineEmptyState>
            )}

            {usage && (
                <p className="mt-4 border-t border-[var(--workspace-line)] pt-3 text-xs text-[var(--workspace-muted)]">
                    Usage period resets {formatDashboardDate(usage.period.resetsAt)}.
                </p>
            )}
        </DashboardPanel>
    );
}

function TeamPerformancePanel({
    data,
    canManageTeam,
    isLoading,
}: {
    data: BusinessDashboardData["teamPerformance"] | null | undefined;
    canManageTeam: boolean;
    isLoading: boolean;
}) {
    const maxOpen = Math.max(
        1,
        ...(data?.members.map((member) => member.openAssigned) ?? []),
    );

    return (
        <DashboardPanel
            eyebrow="Team performance"
            title="Workload overview"
            description="Assigned work and outcomes reported by the dashboard API."
            action={
                canManageTeam ? (
                    <Link href="/business/teams" className="business-dashboard-text-link">
                        Manage team <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                ) : undefined
            }
        >
            {isLoading ? (
                <p className="mt-5 text-sm text-[var(--workspace-muted)]" role="status">
                    Loading team performance…
                </p>
            ) : data ? (
                <>
                    <div className="mt-4 flex items-end gap-2">
                        <span className="business-display text-3xl tabular-nums">
                            {formatDashboardCount(data.activeMembers)}
                        </span>
                        <span className="pb-1 text-sm text-[var(--workspace-muted)]">
                            active team members
                        </span>
                    </div>

                    {data.members.length > 0 ? (
                        <>
                            <p className="mt-4 text-xs text-[var(--workspace-muted)]">
                                Workload detail for{" "}
                                {data.members.length < 8 ? data.members.length : "up to 8"}{" "}
                                team members.
                            </p>

                            <ul className="mt-2 divide-y divide-[var(--workspace-line)]">
                                {data.members.map((member) => (
                                    <li key={member.id} className="py-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="min-w-0">
                                                <span className="block truncate text-sm font-semibold">
                                                    {member.name}
                                                </span>
                                                <span className="mt-0.5 block truncate text-xs text-[var(--workspace-muted)]">
                                                    {member.team ?? member.role} ·{" "}
                                                    {member.highPriorityAssigned} high priority
                                                </span>
                                            </span>

                                            <span className="shrink-0 text-right text-xs">
                                                <span className="block font-semibold">
                                                    {member.openAssigned} open
                                                </span>
                                                <span className="text-[var(--workspace-muted)]">
                                                    {member.resolvedInPeriod} resolved
                                                </span>
                                            </span>
                                        </div>

                                        <div
                                            className="business-workload-track mt-2"
                                            aria-hidden="true"
                                        >
                                            <span
                                                style={{
                                                    width: `${Math.min(
                                                        100,
                                                        (member.openAssigned / maxOpen) * 100,
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <InlineEmptyState>
                            Team workload will appear as cases are assigned.
                        </InlineEmptyState>
                    )}
                </>
            ) : canManageTeam ? (
                <InlineEmptyState>
                    Team performance is not available right now.
                </InlineEmptyState>
            ) : (
                <div className="business-dashboard-empty mt-5">
                    Team performance is available to workspace managers and
                    administrators.
                </div>
            )}
        </DashboardPanel>
    );
}

function ComplaintIntelligence({
    data,
    hasAiTriage,
    hasAnalytics,
    isTrial,
}: {
    data: BusinessDashboardData;
    hasAiTriage: boolean;
    hasAnalytics: boolean;
    isTrial: boolean;
}) {
    return (
        <div className="grid gap-4 xl:grid-cols-2">
            <DashboardPanel
                eyebrow="Needs attention"
                title="Look at these first"
                description="High priority, escalated, unassigned or still waiting for a first reply."
                action={
                    <Link href="/business/inbox" className="business-dashboard-text-link">
                        Open inbox <ArrowUpRight size={14} aria-hidden="true" />
                    </Link>
                }
            >
                {data.attention.length === 0 ? (
                    <div className="business-dashboard-empty mt-5">
                        <p className="font-semibold">
                            Nothing urgent right now.
                        </p>
                        <p className="mt-1 text-sm">
                            Urgent and unassigned complaints will show up here.
                        </p>
                    </div>
                ) : (
                    <>
                        <ul className="mt-4 divide-y divide-[var(--workspace-line)]">
                            {data.attention.map((item) => (
                                <li key={item.id}>
                                    <Link
                                        href={`/business/complaints/${encodeURIComponent(item.id)}`}
                                        className="business-attention-row"
                                    >
                                        <span className="business-attention-icon">
                                            <ShieldAlert size={16} aria-hidden="true" />
                                        </span>

                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-semibold">
                                                {item.title}
                                            </span>
                                            <span className="mt-1 block truncate text-xs text-[var(--workspace-muted)]">
                                                {item.trackingId} · {getReasonForAttention(item)}
                                                {item.assignedTo
                                                    ? ` · ${item.assignedTo.fullName}`
                                                    : ""}
                                            </span>
                                        </span>

                                        <span className="business-status-pill">
                                            {formatDashboardStatus(item.status)}
                                        </span>
                                        <ArrowUpRight
                                            size={15}
                                            className="shrink-0 text-[var(--workspace-muted)]"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {data.attention.length === 8 && (
                            <p className="mt-3 text-xs text-[var(--workspace-muted)]">
                                Showing the top 8. Open the inbox to see the rest.
                            </p>
                        )}
                    </>
                )}
            </DashboardPanel>

            <AiIntelligencePanel
                data={data}
                hasAiTriage={hasAiTriage}
                hasAnalytics={hasAnalytics}
                isTrial={isTrial}
            />
        </div>
    );
}

function OverviewHeader({
    businessName,
    firstName,
    planName,
    isTrial,
    trialDaysRemaining,
}: {
    businessName: string;
    firstName: string;
    planName: string;
    isTrial: boolean;
    trialDaysRemaining: number | null;
}) {
    return (
        <header className="business-dashboard-welcome">
            <div className="min-w-0">
                <p className="business-eyebrow">
                    {businessName}
                </p>
                <h1 className="business-display mt-1.5 text-3xl leading-tight sm:text-4xl">
                    Welcome back, {firstName}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--workspace-muted)]">
                    {isTrial
                        ? "Here's what came in during your trial and what still needs a reply."
                        : "Here's what came in, what's urgent and how your team is keeping up."}
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <span className="business-plan-badge">
                    <span className="size-1.5 rounded-full bg-[var(--workspace-accent)]" />
                    {isTrial
                        ? trialDaysRemaining === null
                            ? "Free trial"
                            : `Free trial · ${trialDaysRemaining} ${trialDaysRemaining === 1 ? "day" : "days"} left`
                        : `${planName} plan`}
                </span>

                <Link
                    href="/business/upgrade"
                    className="business-button-secondary min-h-9 px-3 py-2 text-xs"
                >
                    {isTrial ? "Upgrade" : "Plan & billing"} <ArrowRight size={14} aria-hidden="true" />
                </Link>
            </div>
        </header>
    );
}

function OverviewActions({
    portalHref,
    portalUrl,
}: {
    portalHref: string;
    portalUrl: string | null;
}) {
    const isExternalPortal = portalUrl?.startsWith("http") === true;

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Link
                href="/business/inbox"
                className="business-button-primary min-h-10 px-4 py-2 text-sm"
            >
                <Inbox size={16} aria-hidden="true" /> Open complaint inbox
            </Link>

            <Link
                href={portalHref}
                target={isExternalPortal ? "_blank" : undefined}
                rel={isExternalPortal ? "noreferrer" : undefined}
                className="business-button-secondary min-h-10 px-4 py-2 text-sm"
            >
                <Building2 size={16} aria-hidden="true" />
                {portalUrl ? "Customer portal" : "Set up customer portal"}
                {isExternalPortal && (
                    <ArrowUpRight size={14} aria-hidden="true" />
                )}
            </Link>
        </div>
    );
}

function GettingStartedPanel({
    portalHref,
    portalUrl,
}: {
    portalHref: string;
    portalUrl: string | null;
}) {
    const isExternalPortal = portalUrl?.startsWith("http") === true;

    return (
        <section
            className="business-dashboard-panel flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            aria-labelledby="workspace-start-heading"
        >
            <div className="max-w-2xl">
                <p className="business-eyebrow">Getting started</p>
                <h2
                    id="workspace-start-heading"
                    className="business-display mt-1 text-xl"
                >
                    No complaints yet
                </h2>
                <p className="mt-1.5 text-sm leading-5 text-[var(--workspace-muted)]">
                    Share your complaint page with customers, or file a test
                    complaint yourself. It will land in the inbox and this page
                    fills in as your team works it.
                </p>
            </div>

            <Link
                href={portalHref}
                target={isExternalPortal ? "_blank" : undefined}
                rel={isExternalPortal ? "noreferrer" : undefined}
                className="business-button-primary shrink-0 px-4 py-2 text-sm"
            >
                {portalUrl ? "Open customer portal" : "Set up customer portal"}
                {isExternalPortal && (
                    <ArrowUpRight size={14} aria-hidden="true" />
                )}
            </Link>
        </section>
    );
}

function DashboardError({ onRetry }: { onRetry: () => void }) {
    return (
        <section className="business-dashboard-panel" role="alert">
            <p className="text-sm font-bold">
                Dashboard data could not be loaded.
            </p>
            <p className="mt-1 text-sm text-[var(--workspace-muted)]">
                Check your connection and try again.
            </p>
            <button
                type="button"
                onClick={onRetry}
                className="business-dashboard-text-link mt-3"
            >
                <RefreshCw size={14} aria-hidden="true" /> Try again
            </button>
        </section>
    );
}

function DashboardMetrics({ data }: { data: BusinessDashboardData }) {
    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <DashboardMetric
                icon={FileText}
                label="Total complaints"
                value={formatDashboardCount(data.kpis.totalComplaints.value)}
                detail="For the selected period"
                changePercent={data.kpis.totalComplaints.changePercent}
                trend={data.trend.map((item) => item.received)}
            />
            <DashboardMetric
                icon={Inbox}
                label="Open complaints"
                value={formatDashboardCount(data.kpis.openComplaints.value)}
                detail="Currently unresolved"
                changePercent={data.kpis.openComplaints.changePercent}
            />
            <DashboardMetric
                icon={ShieldAlert}
                label="High / critical cases"
                value={formatDashboardCount(
                    data.kpis.highPriorityComplaints.value,
                )}
                detail="Priority follow-up"
                changePercent={data.kpis.highPriorityComplaints.changePercent}
            />
            <DashboardMetric
                icon={Clock3}
                label="Avg. resolution time"
                value={formatHours(data.kpis.averageResolutionHours)}
                detail="For cases resolved in this period"
            />
            <DashboardMetric
                icon={Activity}
                label="Resolution rate"
                value={getResolutionRate(data)}
                detail="Based on current case statuses"
                trend={data.trend.map((item) => item.resolved)}
            />
            <DashboardMetric
                icon={Users}
                label="Pending follow-ups"
                value={formatDashboardCount(getFollowUpCount(data))}
                detail="Waiting for customer"
            />
        </div>
    );
}

function DashboardBreakdowns({ data }: { data: BusinessDashboardData }) {
    return (
        <>
            <div className="mt-4 grid gap-4 xl:grid-cols-3">
                <DashboardPanel
                    eyebrow="Case activity"
                    title="Received vs. resolved"
                    description="Complaint volume over the selected period."
                    className="xl:col-span-2"
                >
                    <VolumeTrendChart data={data.trend} />
                </DashboardPanel>

                <DashboardPanel
                    eyebrow="Priority mix"
                    title="Cases by priority"
                    description="Distribution of complaints in this period."
                >
                    <DistributionList
                        kind="priority"
                        items={data.priorityDistribution.map(({ priority, count }) => ({
                            label: priority,
                            count,
                        }))}
                        emptyMessage="Priority distribution will appear when cases are received."
                    />
                </DashboardPanel>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-3">
                <DashboardPanel
                    eyebrow="Customer themes"
                    title="Category breakdown"
                    description="Categories returned by complaint analysis."
                >
                    <DistributionList
                        kind="category"
                        items={data.categories.map(({ name, count }) => ({
                            label: name,
                            count,
                        }))}
                        emptyMessage="Category breakdown will appear after complaints are categorized."
                    />
                </DashboardPanel>

                <DashboardPanel
                    eyebrow="Customer experience"
                    title="Sentiment distribution"
                    description={`${formatDashboardCount(data.sentiment.sampleSize)} analyzed complaints`}
                >
                    <DistributionList
                        kind="sentiment"
                        items={data.sentiment.distribution.map(
                            ({ sentiment, count }) => ({
                                label: sentiment,
                                count,
                            }),
                        )}
                        emptyMessage="Sentiment data is not available yet."
                    />
                </DashboardPanel>

                <DashboardPanel
                    eyebrow="Resolution performance"
                    title="Current case status"
                    description={`${formatDashboardCount(data.kpis.resolvedComplaints.value)} resolved in this period`}
                >
                    <DistributionList
                        kind="status"
                        items={data.statusDistribution.map(({ status, count }) => ({
                            label: status,
                            count,
                        }))}
                        emptyMessage="Status performance will appear after cases are received."
                    />
                </DashboardPanel>
            </div>
        </>
    );
}

function PerformanceSection({
    data,
    isPending,
    hasError,
    range,
    onRangeChange,
    onRetry,
    tableFilters,
    onTableFiltersChange,
    onPageChange,
    isFetching,
    hasAiTriage,
    hasAnalytics,
    isTrial,
}: {
    data: BusinessDashboardData | undefined;
    isPending: boolean;
    hasError: boolean;
    range: DashboardRangeOption;
    onRangeChange: (range: DashboardRangeOption) => void;
    onRetry: () => void;
    tableFilters: ComplaintTableFilters;
    onTableFiltersChange: (changes: Partial<ComplaintTableFilters>) => void;
    onPageChange: (page: number) => void;
    isFetching: boolean;
    hasAiTriage: boolean;
    hasAnalytics: boolean;
    isTrial: boolean;
}) {
    return (
        <section aria-labelledby="performance-heading">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="business-eyebrow">Performance</p>
                    <h2
                        id="performance-heading"
                        className="business-display mt-1 text-xl sm:text-2xl"
                    >
                        This period
                    </h2>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-[var(--workspace-muted)]">
                    Time period
                    <select
                        value={range}
                        onChange={(event) =>
                            onRangeChange(event.target.value as DashboardRangeOption)
                        }
                        className="business-dashboard-select min-w-36"
                    >
                        {RANGE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {isPending ? (
                <DashboardLoading />
            ) : hasError && !data ? (
                <DashboardError onRetry={onRetry} />
            ) : data ? (
                <>
                    <DashboardMetrics data={data} />
                    <DashboardBreakdowns data={data} />

                    <div id="ai-insights" className="mt-4 scroll-mt-24">
                        <ComplaintIntelligence
                            data={data}
                            hasAiTriage={hasAiTriage}
                            hasAnalytics={hasAnalytics}
                            isTrial={isTrial}
                        />
                    </div>

                    <div className="mt-4">
                        <RecentComplaintsTable
                            data={data.recent}
                            filters={tableFilters}
                            statusOptions={data.statusDistribution.map(
                                (item) => item.status,
                            )}
                            priorityOptions={data.priorityDistribution.map(
                                (item) => item.priority,
                            )}
                            categoryOptions={data.categories.map(
                                (item) => item.name,
                            )}
                            onChange={onTableFiltersChange}
                            onPageChange={onPageChange}
                            isFetching={isFetching}
                            isError={hasError && !data}
                            onRetry={onRetry}
                        />
                    </div>
                </>
            ) : null}
        </section>
    );
}

export function BusinessOverview() {
    const { user } = useAuth();
    const workspace = useBusinessWorkspace();
    const reducedMotion = useReducedMotion();

    const [range, setRange] = useState<DashboardRangeOption>("30d");
    const [tableFilters, setTableFilters] =
        useState<ComplaintTableFilters>(INITIAL_TABLE_FILTERS);
    const [page, setPage] = useState(1);

    const debouncedFilters = useDebouncedValue(tableFilters, 250);
    const filters = buildDashboardFilters({
        range,
        search: debouncedFilters.search,
        tableFilters: debouncedFilters,
        page,
    });

    const { dashboard, usage } = useBusinessOverviewQueries(
        workspace.businessName,
        filters,
    );

    const firstName = user?.fullName?.trim().split(/\s+/)[0] || "there";
    const planName = getBusinessPlanName(workspace.plan);
    const data = dashboard.data;
    const portalHref = workspace.complaintPortalUrl ?? "/business/onboarding";

    function handleTableFiltersChange(
        changes: Partial<ComplaintTableFilters>,
    ) {
        setTableFilters((current) => ({ ...current, ...changes }));
        setPage(1);
    }

    function handleRangeChange(nextRange: DashboardRangeOption) {
        setRange(nextRange);
        setPage(1);
    }

    return (
        <motion.div
            className="business-dashboard space-y-5 sm:space-y-6"
            aria-busy={dashboard.isPending}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.25 }}
        >
            <OverviewHeader
                businessName={workspace.businessName}
                firstName={firstName}
                planName={planName}
                isTrial={workspace.isTrial}
                trialDaysRemaining={workspace.trialDaysRemaining}
            />

            <OverviewActions
                portalHref={portalHref}
                portalUrl={workspace.complaintPortalUrl}
            />

            <PlanFeaturesPanel
                plan={workspace.plan}
                isTrial={workspace.isTrial}
                features={workspace.features}
            />

            {data?.kpis.workspaceComplaintCount === 0 && !dashboard.isError && (
                <GettingStartedPanel
                    portalHref={portalHref}
                    portalUrl={workspace.complaintPortalUrl}
                />
            )}

            <PerformanceSection
                data={data}
                isPending={dashboard.isPending}
                hasError={dashboard.isError}
                range={range}
                onRangeChange={handleRangeChange}
                onRetry={() => void dashboard.refetch()}
                tableFilters={tableFilters}
                onTableFiltersChange={handleTableFiltersChange}
                onPageChange={setPage}
                isFetching={dashboard.isFetching}
                hasAiTriage={workspace.features.ai_triage === true}
                hasAnalytics={workspace.features.analytics === true}
                isTrial={workspace.isTrial}
            />

            <div className="grid gap-4 xl:grid-cols-2">
                <TeamPerformancePanel
                    data={data?.teamPerformance}
                    canManageTeam={
                        workspace.features.team_management === true
                    }
                    isLoading={dashboard.isPending}
                />

                <PlanUsagePanel
                    usage={usage.data}
                    workspacePlan={workspace.plan}
                    isTrial={workspace.isTrial}
                    daysRemaining={workspace.trialDaysRemaining}
                    isLoading={usage.isPending}
                    isError={usage.isError}
                    onRetry={() => void usage.refetch()}
                />
            </div>

            <p className="sr-only" aria-live="polite">
                {dashboard.isFetching ? "Refreshing dashboard data." : ""}
            </p>
        </motion.div>
    );
}