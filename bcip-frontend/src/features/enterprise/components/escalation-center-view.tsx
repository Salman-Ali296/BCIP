"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Clock, ShieldAlert } from "lucide-react";
import { useEnterprise } from "../context/enterprise-context";

export function EscalationCenterView() {
    const router = useRouter();
    const {
        complaints,
        setSelectedComplaintId,
        setResolveModalComplaintId,
        isLoadingComplaints,
        complaintsError,
        refreshComplaints,
    } = useEnterprise();
    const [filterCategory, setFilterCategory] = useState<string>("ALL");

    // Anything critical, escalated, or close to / past its deadline.
    const needsAttention = useMemo(
        () =>
            complaints.filter(
                (c) =>
                    c.status !== "RESOLVED" &&
                    c.status !== "CLOSED" &&
                    (c.priority === "CRITICAL" ||
                        c.status === "ESCALATED" ||
                        c.sla.status === "AT_RISK" ||
                        c.sla.status === "OVERDUE"),
            ),
        [complaints],
    );

    const overdue = needsAttention.filter((c) => c.sla.status === "OVERDUE").length;
    const atRisk = needsAttention.filter((c) => c.sla.status === "AT_RISK").length;
    const escalated = needsAttention.filter((c) => c.status === "ESCALATED").length;
    const categories = Array.from(new Set(needsAttention.map((c) => c.category))).sort();

    const filtered = needsAttention.filter(
        (c) => filterCategory === "ALL" || c.category === filterCategory,
    );

    function openInInbox(id: string) {
        setSelectedComplaintId(id);
        router.push("/business/inbox");
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
                <div>
                    <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-800">
                        Escalations
                    </span>
                    <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                        Cases that need a senior look
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        Critical complaints, escalated cases, and anything close to or past its 48-hour target.
                    </p>
                </div>

                <span className="inline-flex items-center gap-1.5 self-start rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-800">
                    {needsAttention.length > 0 && (
                        <span className="h-2 w-2 rounded-full bg-rose-600 animate-pulse" />
                    )}
                    {needsAttention.length} {needsAttention.length === 1 ? "case" : "cases"} open
                </span>
            </div>

            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-900">Past deadline</span>
                        <Clock className="h-4 w-4 text-rose-600" aria-hidden="true" />
                    </div>
                    <p className="text-3xl font-extrabold text-rose-900">{overdue}</p>
                    <p className="text-xs text-rose-800">Older than 48 hours and still open</p>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-900">Due soon</span>
                        <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
                    </div>
                    <p className="text-3xl font-extrabold text-amber-900">{atRisk}</p>
                    <p className="text-xs text-amber-800">Less than 12 hours left</p>
                </div>

                <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-900">Escalated</span>
                        <ShieldAlert className="h-4 w-4 text-blue-600" aria-hidden="true" />
                    </div>
                    <p className="text-3xl font-extrabold text-blue-900">{escalated}</p>
                    <p className="text-xs text-blue-800">Handed to a manager or escalation agent</p>
                </div>
            </div>

            {/* Queue table */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                <div className="border-b border-slate-100 p-4 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">Open cases</h2>
                        <p className="text-xs text-slate-500">Oldest deadline first. Open a case to reply, or resolve it here.</p>
                    </div>

                    {categories.length > 1 && (
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            aria-label="Filter by category"
                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
                        >
                            <option value="ALL">All categories</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {isLoadingComplaints ? (
                    <p className="p-8 text-center text-xs text-slate-500" role="status">
                        Loading cases…
                    </p>
                ) : complaintsError ? (
                    <div className="p-8 text-center text-xs text-slate-500" role="alert">
                        <p>{complaintsError}</p>
                        <button
                            type="button"
                            onClick={refreshComplaints}
                            className="mt-2 font-semibold text-slate-800 underline underline-offset-4"
                        >
                            Try again
                        </button>
                    </div>
                ) : filtered.length === 0 ? (
                    <p className="p-8 text-center text-xs text-slate-500">
                        Nothing needs escalating right now.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-100 bg-slate-50/40 text-slate-400 uppercase font-semibold">
                                <tr>
                                    <th className="p-4">Tracking ID</th>
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Complaint</th>
                                    <th className="p-4">Owner</th>
                                    <th className="p-4">Deadline</th>
                                    <th className="p-4">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {[...filtered]
                                    .sort((a, b) => a.sla.deadlineTimestamp.localeCompare(b.sla.deadlineTimestamp))
                                    .map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition">
                                            <td className="p-4">
                                                <span className="font-mono font-bold text-slate-900">{item.trackingId}</span>
                                                <span className="block text-[10px] text-slate-400 mt-0.5">{item.createdAt}</span>
                                            </td>
                                            <td className="p-4">
                                                <strong className="text-slate-900 block">{item.customer.name}</strong>
                                                {item.customer.email && (
                                                    <span className="text-[11px] text-slate-500">{item.customer.email}</span>
                                                )}
                                            </td>
                                            <td className="p-4 max-w-xs">
                                                <p className="font-bold text-slate-900 truncate">{item.title}</p>
                                                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                                    {item.priority === "CRITICAL" ? "Critical · " : ""}
                                                    {item.escalation?.reason ? item.escalation.reason : item.category}
                                                </p>
                                            </td>
                                            <td className="p-4">
                                                <span className={item.assignedAgent ? "text-slate-800" : "font-semibold text-rose-700"}>
                                                    {item.assignedAgent?.name || "Unassigned"}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {item.sla.status === "OVERDUE" ? (
                                                    <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-800">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                                                        {item.sla.timeRemainingText}
                                                    </span>
                                                ) : item.sla.status === "AT_RISK" ? (
                                                    <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                                                        {item.sla.timeRemainingText}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-slate-500">
                                                        <Clock className="h-3 w-3" aria-hidden="true" />
                                                        {item.sla.timeRemainingText}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openInInbox(item.id)}
                                                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                                    >
                                                        Open
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setResolveModalComplaintId(item.id)}
                                                        className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                                                    >
                                                        Resolve
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
