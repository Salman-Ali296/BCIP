"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useWorkspaceDashboard } from "@/features/business-dashboard/hooks/use-workspace-dashboard";
import {
    DashboardLoading,
    DashboardPanel,
    formatDashboardCount,
} from "@/features/business-dashboard/components/dashboard-widgets";

// The categories the AI service sorts into (bcip-ai-services/app/services/nlp.py),
// with the kind of complaint each one catches.
const AI_CATEGORIES = [
    { key: "BILLING", name: "Billing", catches: "Wrong charges, double payments, invoice errors" },
    { key: "DELIVERY", name: "Delivery", catches: "Late, lost or stuck orders and courier problems" },
    { key: "REFUND", name: "Refund", catches: "Refunds that were promised but haven't arrived" },
    { key: "PRODUCT_QUALITY", name: "Product quality", catches: "Damaged, broken or defective items" },
    { key: "TECHNICAL_SUPPORT", name: "Technical support", catches: "Login problems, errors and crashes" },
    { key: "CUSTOMER_SERVICE", name: "Customer service", catches: "How staff treated the customer" },
    { key: "GENERAL", name: "General", catches: "Anything that doesn't fit the others" },
];

const RANGES = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
] as const;

function normalize(name: string) {
    return name.toUpperCase().replace(/[\s-]+/g, "_");
}

export default function BusinessCategoriesPage() {
    const [range, setRange] = useState<(typeof RANGES)[number]["value"]>("30d");
    const dashboard = useWorkspaceDashboard(range);
    const counts = new Map(
        (dashboard.data?.categories ?? []).map((row) => [normalize(row.name), row]),
    );
    const total = (dashboard.data?.categories ?? []).reduce((sum, row) => sum + row.count, 0);

    return (
        <div className="business-dashboard space-y-5">
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="business-eyebrow">Setup</p>
                    <h1 className="business-display mt-1.5 text-3xl">Categories</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--workspace-muted)]">
                        Every new complaint is put into one of these by the AI. Your team can change the
                        category on any complaint if it got it wrong.
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
            ) : dashboard.isError ? (
                <section className="business-dashboard-panel" role="alert">
                    <p className="text-sm font-bold">Category counts couldn&apos;t be loaded.</p>
                    <button
                        type="button"
                        onClick={() => void dashboard.refetch()}
                        className="business-dashboard-text-link mt-3"
                    >
                        <RefreshCw size={14} aria-hidden="true" /> Try again
                    </button>
                </section>
            ) : (
                <DashboardPanel
                    title={`${formatDashboardCount(total)} complaints sorted`}
                    description="Compared with the period before, so you can see which kinds of complaint are growing."
                >
                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-xs text-[var(--workspace-muted)]">
                                <tr>
                                    <th className="py-2 pr-4 font-semibold">Category</th>
                                    <th className="py-2 pr-4 font-semibold">What it catches</th>
                                    <th className="py-2 pr-4 text-right font-semibold">This period</th>
                                    <th className="py-2 text-right font-semibold">Before</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--workspace-line)]">
                                {AI_CATEGORIES.map((category) => {
                                    const row = counts.get(category.key);
                                    const count = row?.count ?? 0;
                                    const previous = row?.previousCount ?? 0;
                                    const growing = count > previous;
                                    return (
                                        <tr key={category.key}>
                                            <td className="py-3 pr-4 font-semibold">{category.name}</td>
                                            <td className="py-3 pr-4 text-[var(--workspace-muted)]">{category.catches}</td>
                                            <td className="py-3 pr-4 text-right tabular-nums font-semibold">
                                                {growing && previous > 0 && (
                                                    <span className="mr-1.5 text-xs font-bold text-[var(--workspace-rust)]">▲</span>
                                                )}
                                                {formatDashboardCount(count)}
                                            </td>
                                            <td className="py-3 text-right tabular-nums text-[var(--workspace-muted)]">
                                                {formatDashboardCount(previous)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </DashboardPanel>
            )}
        </div>
    );
}
