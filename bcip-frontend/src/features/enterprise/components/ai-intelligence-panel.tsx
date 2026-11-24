"use client";

import Link from "next/link";
import { ArrowRight, BrainCircuit, LockKeyhole } from "lucide-react";
import type { BusinessDashboardData } from "@/lib/api/business-dashboard";
import {
    DashboardPanel,
    formatDashboardCount,
    formatDashboardPriority,
    InlineEmptyState,
} from "@/features/business-dashboard/components/dashboard-widgets";

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
    return (
        <div className="business-insight-stat">
            <span className="block truncate text-base font-bold">{value}</span>
            <span className="mt-1 block text-xs text-[var(--workspace-muted)]">{label}</span>
            {hint && <span className="mt-0.5 block text-[11px] text-[var(--workspace-muted)]">{hint}</span>}
        </div>
    );
}

function countFor<T extends { count: number }>(
    rows: T[],
    match: (row: T) => boolean,
): number {
    return rows.filter(match).reduce((total, row) => total + row.count, 0);
}

/**
 * AI panel on the business overview.
 * - Every plan with AI triage sees what the models produced for the period
 *   (sentiment, priority, category). That data comes back on every plan.
 * - Plans with `analytics` also get `data.ai` from the backend: duplicates,
 *   change against the previous period and AI priority recommendations.
 */
export function AiIntelligencePanel({
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
    const analysed = data.sentiment.sampleSize;
    const negative = countFor(data.sentiment.distribution, (row) => row.sentiment === "NEGATIVE");
    const urgent = countFor(
        data.priorityDistribution,
        (row) => row.priority === "HIGH" || row.priority === "CRITICAL",
    );
    const topCategory = [...data.categories].sort((a, b) => b.count - a.count)[0];
    const negativeShare = analysed > 0 ? Math.round((negative / analysed) * 100) : null;

    return (
        <DashboardPanel
            eyebrow="AI intelligence"
            title="What the AI noticed"
            description="Every new complaint is read by the AI before your team opens it. Your team can change anything it suggests."
            action={
                <BrainCircuit size={18} className="text-[var(--workspace-accent-strong)]" aria-hidden="true" />
            }
        >
            {!hasAiTriage ? (
                <InlineEmptyState>AI triage isn&apos;t switched on for this workspace.</InlineEmptyState>
            ) : analysed === 0 ? (
                <InlineEmptyState>
                    Nothing to show yet. Once complaints come in, you&apos;ll see their tone, priority and
                    most common category here.
                </InlineEmptyState>
            ) : (
                <>
                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                        <Stat
                            label="Upset customers"
                            value={formatDashboardCount(negative)}
                            hint={negativeShare === null ? undefined : `${negativeShare}% of analysed complaints`}
                        />
                        <Stat label="High or critical" value={formatDashboardCount(urgent)} />
                        <Stat
                            label="Most common category"
                            value={topCategory ? topCategory.name : "None yet"}
                            hint={topCategory ? `${formatDashboardCount(topCategory.count)} complaints` : undefined}
                        />
                    </div>

                    {hasAnalytics && data.ai ? (
                        <div className="mt-5 border-t border-[var(--workspace-line)] pt-4">
                            <div className="grid gap-2 sm:grid-cols-2">
                                <Stat
                                    label="Possible duplicates"
                                    value={formatDashboardCount(data.ai.duplicateCount)}
                                    hint="Complaints about the same problem"
                                />
                                <Stat
                                    label="Compared with last period"
                                    value={
                                        data.ai.insights.complaintChangePercent === null
                                            ? "New"
                                            : `${data.ai.insights.complaintChangePercent > 0 ? "+" : ""}${data.ai.insights.complaintChangePercent}%`
                                    }
                                    hint="Change in complaint volume"
                                />
                            </div>

                            {data.ai.priorityRecommendations.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--workspace-muted)]">
                                        The AI would look at these first
                                    </h3>
                                    <ul className="mt-2 divide-y divide-[var(--workspace-line)]">
                                        {data.ai.priorityRecommendations.slice(0, 3).map((item) => (
                                            <li key={item.id}>
                                                <Link
                                                    href={`/business/complaints/${encodeURIComponent(item.id)}`}
                                                    className="flex items-center justify-between gap-3 py-3"
                                                >
                                                    <span className="min-w-0">
                                                        <span className="block truncate text-sm font-semibold">
                                                            {item.title}
                                                        </span>
                                                        <span className="mt-0.5 block truncate text-xs text-[var(--workspace-muted)]">
                                                            {item.trackingId}
                                                            {item.aiSummary ? ` · ${item.aiSummary}` : ""}
                                                        </span>
                                                    </span>
                                                    <span className="business-priority-pill is-high">
                                                        {formatDashboardPriority(item.aiPriority ?? item.priority)}
                                                    </span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : !hasAnalytics ? (
                        <div className="mt-5 rounded-xl border border-dashed border-[var(--workspace-line)] p-4">
                            <p className="flex items-center gap-2 text-sm font-semibold">
                                <LockKeyhole size={14} aria-hidden="true" />
                                More from the AI on Professional
                            </p>
                            <p className="mt-1 text-sm leading-6 text-[var(--workspace-muted)]">
                                Duplicate detection, the complaints it would handle first, and how this
                                period compares with the last one.
                                {isTrial ? " You can upgrade during the trial." : ""}
                            </p>
                            <Link href="/business/upgrade" className="business-dashboard-text-link mt-2">
                                Upgrade to Professional <ArrowRight size={14} aria-hidden="true" />
                            </Link>
                        </div>
                    ) : null}
                </>
            )}
        </DashboardPanel>
    );
}
