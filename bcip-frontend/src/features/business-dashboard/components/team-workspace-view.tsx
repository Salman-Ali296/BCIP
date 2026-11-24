"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Inbox, RefreshCw, Users } from "lucide-react";
import { useBusinessWorkspace } from "@/features/business-trial/context/business-workspace-context";
import {
    businessDashboardQueryKey,
    getBusinessDashboard,
} from "@/lib/api/business-dashboard";
import {
    DashboardPanel,
    formatDashboardCount,
} from "./dashboard-widgets";

const TEAM_FILTERS = { range: "30d" as const, grouping: "day" as const, page: 1 };

type TeamSnapshot = NonNullable<
    Awaited<ReturnType<typeof getBusinessDashboard>>["teamPerformance"]
>;

function useTeamSnapshot() {
    const workspace = useBusinessWorkspace();
    return useQuery({
        queryKey: businessDashboardQueryKey(workspace.businessName, TEAM_FILTERS),
        queryFn: () => getBusinessDashboard(TEAM_FILTERS),
        staleTime: 30_000,
    });
}

function TeamDataState({
    isLoading,
    isError,
    hasMembers,
    onRetry,
}: {
    isLoading: boolean;
    isError: boolean;
    hasMembers: boolean;
    onRetry: () => void;
}) {
    if (isLoading) {
        return (
            <p className="mt-5 text-sm text-[var(--workspace-muted)]" role="status">
                Loading team workload…
            </p>
        );
    }

    if (isError) {
        return (
            <div className="business-dashboard-empty mt-5" role="alert">
                <p>Team workload could not be loaded.</p>
                <button type="button" className="business-dashboard-text-link mt-2" onClick={onRetry}>
                    <RefreshCw size={14} aria-hidden="true" /> Try again
                </button>
            </div>
        );
    }

    if (!hasMembers) {
        return (
            <div className="business-dashboard-empty mt-5">
                Team workload data is not available yet. It will appear here when the dashboard service
                reports assigned cases.
            </div>
        );
    }

    return null;
}

function SnapshotNote({ count }: { count: number }) {
    return (
        <p className="mt-4 text-xs leading-5 text-[var(--workspace-muted)]">
            Workload from the last 30 days. The dashboard service returns up to 8 member records
            {count === 8 ? ", so this is not a complete staff directory." : "."}
        </p>
    );
}

function TeamSummary({ snapshot }: { snapshot: TeamSnapshot }) {
    const teams = new Map<string, TeamSnapshot["members"]>();
    for (const member of snapshot.members) {
        const teamName = member.team?.trim() || "Not assigned to a team";
        const teamMembers = teams.get(teamName) ?? [];
        teamMembers.push(member);
        teams.set(teamName, teamMembers);
    }

    const sortedTeams = [...teams.entries()].sort(([a], [b]) => a.localeCompare(b));

    return (
        <>
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="business-dashboard-panel">
                    <p className="text-sm font-semibold text-[var(--workspace-muted)]">Active team members</p>
                    <p className="business-display mt-2 text-3xl tabular-nums">
                        {formatDashboardCount(snapshot.activeMembers)}
                    </p>
                    <p className="mt-1 text-xs text-[var(--workspace-muted)]">Reported by the dashboard service</p>
                </div>
                <div className="business-dashboard-panel">
                    <p className="text-sm font-semibold text-[var(--workspace-muted)]">Teams represented</p>
                    <p className="business-display mt-2 text-3xl tabular-nums">
                        {formatDashboardCount(sortedTeams.length)}
                    </p>
                    <p className="mt-1 text-xs text-[var(--workspace-muted)]">Based on assigned member team labels</p>
                </div>
            </div>

            {sortedTeams.length > 0 && (
                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    {sortedTeams.map(([teamName, members]) => {
                        const openCases = members.reduce((total, member) => total + member.openAssigned, 0);
                        const priorityCases = members.reduce(
                            (total, member) => total + member.highPriorityAssigned,
                            0,
                        );

                        return (
                            <DashboardPanel
                                key={teamName}
                                eyebrow={`${members.length} ${members.length === 1 ? "member" : "members"}`}
                                title={teamName}
                                description={`${formatDashboardCount(openCases)} open assigned ${
                                    openCases === 1 ? "case" : "cases"
                                } · ${formatDashboardCount(priorityCases)} high priority`}
                            >
                                <ul className="mt-3 divide-y divide-[var(--workspace-line)]">
                                    {members.map((member) => (
                                        <li key={member.id} className="flex items-center justify-between gap-3 py-3">
                                            <span className="min-w-0">
                                                <span className="block truncate text-sm font-semibold">{member.name}</span>
                                                <span className="mt-0.5 block truncate text-xs text-[var(--workspace-muted)]">
                                                    {member.role}
                                                </span>
                                            </span>
                                            <span className="shrink-0 text-right text-xs">
                                                <span className="block font-semibold">
                                                    {formatDashboardCount(member.openAssigned)} open
                                                </span>
                                                <span className="text-[var(--workspace-muted)]">
                                                    {formatDashboardCount(member.resolvedInPeriod)} resolved
                                                </span>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </DashboardPanel>
                        );
                    })}
                </div>
            )}
            <SnapshotNote count={snapshot.members.length} />
        </>
    );
}

function PeopleSummary({ snapshot }: { snapshot: TeamSnapshot }) {
    return (
        <DashboardPanel
            eyebrow="Assigned workload"
            title="People in the workspace"
            description={`${formatDashboardCount(snapshot.activeMembers)} active members reported. Assignment activity covers the last 30 days.`}
        >
            {snapshot.members.length ? (
                <>
                    <ul className="mt-4 divide-y divide-[var(--workspace-line)]">
                        {snapshot.members.map((member) => (
                            <li key={member.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-semibold">{member.name}</span>
                                    <span className="mt-0.5 block truncate text-xs text-[var(--workspace-muted)]">
                                        {member.role} · {member.team ?? "Not assigned to a team"}
                                    </span>
                                </span>
                                <span className="flex shrink-0 gap-4 text-right text-xs">
                                    <span>
                                        <span className="block font-semibold">
                                            {formatDashboardCount(member.openAssigned)}
                                        </span>
                                        <span className="text-[var(--workspace-muted)]">open</span>
                                    </span>
                                    <span>
                                        <span className="block font-semibold">
                                            {formatDashboardCount(member.highPriorityAssigned)}
                                        </span>
                                        <span className="text-[var(--workspace-muted)]">high priority</span>
                                    </span>
                                    <span>
                                        <span className="block font-semibold">
                                            {formatDashboardCount(member.resolvedInPeriod)}
                                        </span>
                                        <span className="text-[var(--workspace-muted)]">resolved</span>
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ul>
                    <SnapshotNote count={snapshot.members.length} />
                </>
            ) : (
                <div className="business-dashboard-empty mt-5">
                    No member workload is available yet. Assigned complaint activity will appear here.
                </div>
            )}
        </DashboardPanel>
    );
}

export function TeamWorkspaceView({ mode }: { mode: "teams" | "people" }) {
    const query = useTeamSnapshot();
    const snapshot = query.data?.teamPerformance;
    const title = mode === "teams" ? "Teams & departments" : "People";

    return (
        <div className="business-dashboard space-y-5 sm:space-y-6" aria-busy={query.isPending}>
            <header className="business-dashboard-welcome">
                <div className="min-w-0">
                    <p className="business-eyebrow">{title} / Workspace</p>
                    <h1 className="business-display mt-1.5 text-3xl leading-tight sm:text-4xl">{title}</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--workspace-muted)]">
                        {mode === "teams"
                            ? "See how team labels relate to complaint ownership and response workload. This view reflects live assignments; it is not a department editor."
                            : "Review the member workload and outcomes returned by the dashboard service. This is an assignment snapshot, not a full staff directory."}
                    </p>
                </div>
                <Link href="/business/inbox" className="business-button-secondary min-h-10 px-4 py-2 text-sm">
                    <Inbox size={16} aria-hidden="true" /> Open complaint inbox
                    <ArrowRight size={14} aria-hidden="true" />
                </Link>
            </header>

            <TeamDataState
                isLoading={query.isPending}
                isError={query.isError && !query.data}
                hasMembers={Boolean(snapshot?.members.length)}
                onRetry={() => void query.refetch()}
            />

            {snapshot && (
                mode === "teams"
                    ? <TeamSummary snapshot={snapshot} />
                    : <PeopleSummary snapshot={snapshot} />
            )}

            {mode === "teams" && (
                <p className="sr-only">
                    <Users aria-hidden="true" /> Teams and departments are based on names included with case assignments.
                </p>
            )}
        </div>
    );
}
