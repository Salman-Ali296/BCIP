"use client";

import { useState } from "react";
import { CheckCircle2, Clock3, FileText, RefreshCw, ShieldAlert } from "lucide-react";
import { useWorkspaceDashboard } from "@/features/business-dashboard/hooks/use-workspace-dashboard";
import {
    DashboardLoading,
    DashboardMetric,
    DashboardPanel,
    DistributionList,
    formatDashboardCount,
    formatDashboardStatus,
    VolumeTrendChart,
} from "@/features/business-dashboard/components/dashboard-widgets";

const RANGES = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
] as const;

function formatHours(hours: number | null) {
    if (hours === null) return "No data";
    if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
    if (hours < 48) return `${hours.toFixed(1)} h`;
    return `${(hours / 24).toFixed(1)} days`;
}

export default function BusinessAnalyticsPage() {
    const [range, setRange] = useState<(typeof RANGES)[number]["value"]>("30d");
    const dashboard = useWorkspaceDashboard(range);
    const data = dashboard.data;

    const received = data?.kpis.totalComplaints.value ?? 0;
    const resolved = data?.kpis.resolvedComplaints.value ?? 0;
    const resolutionRate = received > 0 ? Math.round((resolved / received) * 100) : null;

    return (
        <div className="business-dashboard space-y-5">
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="business-eyebrow">Insights</p>
                    <h1 className="business-display mt-1.5 text-3xl">Analytics</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--workspace-muted)]">
                        How many complaints came in, how fast your team closed them, and what they were about.
                        Every number compares with the period before.
                    </p>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-[var(--workspace-muted)]">
                    Period
                    <select
                        value={range}
                        onChange={(event) => setRange(event.target.value as typeof range)}
                        className="business-dashboard-select min-w-36"
                    >
                        {RANGES.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
            </header>

            {dashboard.isPending ? (
                <DashboardLoading />
            ) : dashboard.isError || !data ? (
                <section className="business-dashboard-panel" role="alert">
                    <p className="text-sm font-bold">Analytics couldn&apos;t be loaded.</p>
                    <p className="mt-1 text-sm text-[var(--workspace-muted)]">Check your connection and try again.</p>
                    <button
                        type="button"
                        onClick={() => void dashboard.refetch()}
                        className="business-dashboard-text-link mt-3"
                    >
                        <RefreshCw size={14} aria-hidden="true" /> Try again
                    </button>
                </section>
            ) : (
                <>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <DashboardMetric
                            icon={FileText}
                            label="Complaints received"
                            value={formatDashboardCount(received)}
                            detail="In this period"
                            changePercent={data.kpis.totalComplaints.changePercent}
                            trend={data.trend.map((item) => item.received)}
                        />
                        <DashboardMetric
                            icon={CheckCircle2}
                            label="Resolved"
                            value={formatDashboardCount(resolved)}
                            detail={resolutionRate === null ? "Nothing received yet" : `${resolutionRate}% of what came in`}
                            changePercent={data.kpis.resolvedComplaints.changePercent}
                            trend={data.trend.map((item) => item.resolved)}
                        />
                        <DashboardMetric
                            icon={ShieldAlert}
                            label="High or critical"
                            value={formatDashboardCount(data.kpis.highPriorityComplaints.value)}
                            detail="Still open"
                        />
                        <DashboardMetric
                            icon={Clock3}
                            label="Average time to resolve"
                            value={formatHours(data.kpis.averageResolutionHours)}
                            detail="From submission to resolved"
                        />
                    </div>

                    <DashboardPanel
                        title="Received and resolved"
                        description={range === "90d" ? "Grouped by week." : "Grouped by day."}
                    >
                        <VolumeTrendChart data={data.trend} />
                    </DashboardPanel>

                    <div className="grid gap-4 xl:grid-cols-2">
                        <DashboardPanel title="By priority" description="Set by the AI when the complaint arrives, changed by your team if needed.">
                            <DistributionList
                                kind="priority"
                                items={data.priorityDistribution.map(({ priority, count }) => ({ label: priority, count }))}
                                emptyMessage="No complaints in this period."
                            />
                        </DashboardPanel>
                        <DashboardPanel title="By customer tone" description={`Based on ${formatDashboardCount(data.sentiment.sampleSize)} analysed complaints.`}>
                            <DistributionList
                                kind="sentiment"
                                items={data.sentiment.distribution.map(({ sentiment, count }) => ({ label: sentiment, count }))}
                                emptyMessage="No analysed complaints in this period."
                            />
                        </DashboardPanel>
                        <DashboardPanel title="By category">
                            <DistributionList
                                kind="category"
                                items={data.categories.map(({ name, count }) => ({ label: name, count }))}
                                emptyMessage="No categorised complaints in this period."
                            />
                        </DashboardPanel>
                        <DashboardPanel title="By status" description="Where complaints are right now.">
                            <DistributionList
                                kind="status"
                                items={data.statusDistribution.map(({ status, count }) => ({
                                    label: formatDashboardStatus(status),
                                    count,
                                }))}
                                emptyMessage="No complaints in this period."
                            />
                        </DashboardPanel>
                    </div>
                </>
            )}
        </div>
    );
}
