"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Search } from "lucide-react";
import type { BusinessDashboardData } from "@/lib/api/business-dashboard";
import {
    formatDashboardCount,
    formatDashboardDate,
    formatDashboardPriority,
    formatDashboardStatus,
} from "./dashboard-widgets";

type ComplaintItem = BusinessDashboardData["recent"]["items"][number];

export interface ComplaintTableFilters {
    search: string;
    status: string;
    priority: string;
    category: string;
    sort: "newest" | "oldest";
}

export function RecentComplaintsTable({
    data,
    filters,
    statusOptions,
    priorityOptions,
    categoryOptions,
    onChange,
    onPageChange,
    isFetching,
    isError,
    onRetry,
}: {
    data: BusinessDashboardData["recent"] | undefined;
    filters: ComplaintTableFilters;
    statusOptions: string[];
    priorityOptions: string[];
    categoryOptions: string[];
    onChange: (filters: Partial<ComplaintTableFilters>) => void;
    onPageChange: (page: number) => void;
    isFetching: boolean;
    isError: boolean;
    onRetry: () => void;
}) {
    const items = data?.items ?? [];
    const hasFilters = Boolean(
        filters.search || filters.status || filters.priority || filters.category,
    );

    const clearFilters = () =>
        onChange({ search: "", status: "", priority: "", category: "" });

    return (
        <section className="business-dashboard-panel" aria-labelledby="recent-complaints-heading">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="business-eyebrow">Complaint management</p>
                    <h2 id="recent-complaints-heading" className="business-display mt-1 text-xl sm:text-2xl">
                        Recent complaints
                    </h2>
                    <p className="mt-1.5 text-sm text-[var(--workspace-muted)]">
                        Search, filter and open cases from your workspace.
                    </p>
                </div>
                <Link href="/business/inbox" className="business-dashboard-text-link">
                    Open inbox <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(15rem,1.5fr)_repeat(4,minmax(8rem,1fr))]">
                <label className="business-dashboard-search-field">
                    <Search size={16} aria-hidden="true" />
                    <span className="sr-only">Search complaints</span>
                    <input
                        type="search"
                        value={filters.search}
                        maxLength={80}
                        onChange={(event) => onChange({ search: event.target.value })}
                        placeholder="Search ID, subject, customer…"
                    />
                </label>
                <label className="sr-only" htmlFor="complaint-status-filter">Filter by status</label>
                <select
                    id="complaint-status-filter"
                    className="business-dashboard-select"
                    value={filters.status}
                    onChange={(event) => onChange({ status: event.target.value })}
                >
                    <option value="">All statuses</option>
                    {statusOptions.map((status) => (
                        <option value={status} key={status}>{formatDashboardStatus(status)}</option>
                    ))}
                </select>
                <label className="sr-only" htmlFor="complaint-priority-filter">Filter by priority</label>
                <select
                    id="complaint-priority-filter"
                    className="business-dashboard-select"
                    value={filters.priority}
                    onChange={(event) => onChange({ priority: event.target.value })}
                >
                    <option value="">All priorities</option>
                    {priorityOptions.map((priority) => (
                        <option value={priority} key={priority}>{formatDashboardPriority(priority)}</option>
                    ))}
                </select>
                <label className="sr-only" htmlFor="complaint-category-filter">Filter by category</label>
                <select
                    id="complaint-category-filter"
                    className="business-dashboard-select"
                    value={filters.category}
                    onChange={(event) => onChange({ category: event.target.value })}
                >
                    <option value="">All categories</option>
                    {categoryOptions.map((category) => (
                        <option value={category} key={category}>{category}</option>
                    ))}
                </select>
                <label className="sr-only" htmlFor="complaint-sort">Sort complaints</label>
                <select
                    id="complaint-sort"
                    className="business-dashboard-select"
                    value={filters.sort}
                    onChange={(event) =>
                        onChange({ sort: event.target.value as ComplaintTableFilters["sort"] })
                    }
                >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                </select>
            </div>

            {isFetching && data && (
                <p className="mt-3 text-xs text-[var(--workspace-muted)]" role="status">
                    Updating complaint results…
                </p>
            )}

            {isError ? (
                <div className="business-dashboard-empty mt-5" role="alert">
                    <p>Complaint results could not be loaded.</p>
                    <button type="button" className="business-dashboard-text-link mt-2" onClick={onRetry}>
                        Try again
                    </button>
                </div>
            ) : !data ? (
                <div className="mt-5 space-y-2" role="status" aria-label="Loading complaint results">
                    {Array.from({ length: 4 }, (_, index) => (
                        <div className="business-dashboard-skeleton h-12" key={index} />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="business-dashboard-empty mt-5">
                    <p className="font-semibold">
                        {hasFilters ? "No complaints match these filters." : "No complaints have been received yet."}
                    </p>
                    <p className="mt-1 text-sm">
                        {hasFilters
                            ? "Try changing your search or filters."
                            : "New customer cases will appear here."}
                    </p>
                    {hasFilters && (
                        <button type="button" className="business-dashboard-text-link mt-3" onClick={clearFilters}>
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="business-complaint-table-wrap mt-5">
                        <table className="business-complaint-table">
                            <thead>
                                <tr>
                                    <th scope="col">Complaint</th>
                                    <th scope="col">Category</th>
                                    <th scope="col">Priority</th>
                                    <th scope="col">Sentiment</th>
                                    <th scope="col">Assigned to</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Submitted</th>
                                    <th scope="col"><span className="sr-only">Open complaint</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => <ComplaintRow key={item.id} item={item} />)}
                            </tbody>
                        </table>
                    </div>
                    <ul className="business-complaint-mobile-list mt-4">
                        {items.map((item) => (
                            <li className="business-complaint-mobile-card" key={item.id}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold">{item.title}</p>
                                        <p className="mt-1 text-xs text-[var(--workspace-muted)]">
                                            {item.trackingId} · {formatDashboardDate(item.createdAt)}
                                        </p>
                                    </div>
                                    <PriorityBadge value={item.priority} />
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                    <DataCell label="Category" value={item.categoryName ?? item.aiCategory ?? "Uncategorized"} />
                                    <DataCell label="Status" value={formatDashboardStatus(item.status)} />
                                    <DataCell label="Sentiment" value={formatDashboardStatus(item.aiSentiment ?? "Not analyzed")} />
                                    <DataCell label="Assigned to" value={item.assignedTo?.fullName ?? "Unassigned"} />
                                </div>
                                <Link
                                    href={`/business/complaints/${encodeURIComponent(item.id)}`}
                                    className="business-dashboard-text-link mt-3"
                                    aria-label={`Open complaint ${item.trackingId}`}
                                >
                                    View complaint <ArrowUpRight size={14} aria-hidden="true" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--workspace-line)] pt-4">
                        <p className="text-xs text-[var(--workspace-muted)]">
                            {formatDashboardCount(data.total)} complaints
                            {data.pages > 0 && ` · Page ${data.page} of ${data.pages}`}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="business-dashboard-page-button"
                                disabled={data.page <= 1 || isFetching}
                                onClick={() => onPageChange(data.page - 1)}
                                aria-label="Previous page"
                            >
                                <ArrowLeft size={15} aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                className="business-dashboard-page-button"
                                disabled={data.page >= data.pages || isFetching}
                                onClick={() => onPageChange(data.page + 1)}
                                aria-label="Next page"
                            >
                                <ArrowRight size={15} aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}

function ComplaintRow({ item }: { item: ComplaintItem }) {
    return (
        <tr>
            <td>
                <span className="block max-w-[18rem] truncate font-semibold" title={item.title}>{item.title}</span>
                <span className="mt-1 block text-xs text-[var(--workspace-muted)]">{item.trackingId}</span>
            </td>
            <td>{item.categoryName ?? item.aiCategory ?? "Uncategorized"}</td>
            <td><PriorityBadge value={item.priority} /></td>
            <td>{formatDashboardStatus(item.aiSentiment ?? "Not analyzed")}</td>
            <td>{item.assignedTo?.fullName ?? "Unassigned"}</td>
            <td><span className="business-status-pill">{formatDashboardStatus(item.status)}</span></td>
            <td>{formatDashboardDate(item.createdAt)}</td>
            <td>
                <Link
                    href={`/business/complaints/${encodeURIComponent(item.id)}`}
                    className="business-dashboard-row-action"
                    aria-label={`Open complaint ${item.trackingId}`}
                >
                    <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
            </td>
        </tr>
    );
}

function PriorityBadge({ value }: { value: string }) {
    return (
        <span className={`business-priority-pill is-${value.toLowerCase()}`}>
            {formatDashboardPriority(value)}
        </span>
    );
}

function DataCell({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-[var(--workspace-muted)]">{label}</span>
            <span className="mt-0.5 block truncate font-medium">{value}</span>
        </div>
    );
}
