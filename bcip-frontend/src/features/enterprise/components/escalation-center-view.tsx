"use client";

import { useState } from "react";
import {
    ShieldAlert,
    Clock,
    AlertTriangle,
    CheckCircle2,
    ArrowUpRight,
    UserCheck,
    FileText,
    Filter,
} from "lucide-react";
import { useEnterprise } from "../context/enterprise-context";
import type { EnterpriseComplaint } from "../types";

export function EscalationCenterView() {
    const { complaints, setSelectedComplaintId, setEscalateModalComplaintId, setResolveModalComplaintId } = useEnterprise();
    const [filterCategory, setFilterCategory] = useState<string>("ALL");

    // All escalated complaints or complaints at SLA risk
    const criticalComplaints = complaints.filter(
        (c) =>
            c.priority === "CRITICAL" ||
            c.status === "ESCALATED" ||
            c.sla.status === "AT_RISK" ||
            c.sla.status === "OVERDUE"
    );

    const filtered = criticalComplaints.filter((c) => {
        if (filterCategory !== "ALL" && c.category !== filterCategory) return false;
        return true;
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-800">
                            Quality & Escalation Control
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">Tier 2 Dispute Operations</span>
                    </div>
                    <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                        Escalation Command Center
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        Intervention center for critical disputes, SLA breach risks, repeated customer complaints, and executive overrides.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-800">
                        <span className="h-2 w-2 rounded-full bg-rose-600 animate-pulse" />
                        {criticalComplaints.length} Intervention Cases Pending
                    </span>
                </div>
            </div>

            {/* Radar Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-900">Overdue Breaches</span>
                        <Clock className="h-4 w-4 text-rose-600" />
                    </div>
                    <p className="text-3xl font-extrabold text-rose-900">01</p>
                    <p className="text-xs text-rose-800">Requires executive settlement immediately</p>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-900">At Risk (&lt;45 mins)</span>
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                    </div>
                    <p className="text-3xl font-extrabold text-amber-900">02</p>
                    <p className="text-xs text-amber-800">Assigned handlers actively drafting replies</p>
                </div>

                <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-900">VIP Client Disputes</span>
                        <ShieldAlert className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-3xl font-extrabold text-blue-900">02</p>
                    <p className="text-xs text-blue-800">Commercial & preferred accounts</p>
                </div>
            </div>

            {/* Escalated Queue Table */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                <div className="border-b border-slate-100 p-4 flex items-center justify-between bg-slate-50/60">
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">Active Critical & Escalated Queue</h2>
                        <p className="text-xs text-slate-500">Authorized dispute supervisors can reassign or resolve cases</p>
                    </div>

                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
                    >
                        <option value="ALL">All Categories</option>
                        <option value="Payment">Payment</option>
                        <option value="Delivery & Logistics">Delivery & Logistics</option>
                        <option value="Corporate Banking">Corporate Banking</option>
                        <option value="Digital Banking">Digital Banking</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-100 bg-slate-50/40 text-slate-400 uppercase font-semibold">
                            <tr>
                                <th className="p-4">Case ID</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Subject & Reason</th>
                                <th className="p-4">Department / Team</th>
                                <th className="p-4">SLA Countdown</th>
                                <th className="p-4">Intervention Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition">
                                    <td className="p-4">
                                        <span className="font-mono font-bold text-slate-900">{item.id}</span>
                                        <span className="block text-[10px] text-slate-400 mt-0.5">{item.referenceNumber}</span>
                                    </td>
                                    <td className="p-4">
                                        <strong className="text-slate-900 block">{item.customer.name}</strong>
                                        <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600 font-semibold inline-block mt-0.5">
                                            {item.customer.tier}
                                        </span>
                                    </td>
                                    <td className="p-4 max-w-xs">
                                        <p className="font-bold text-slate-900 truncate">{item.title}</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                            {item.escalation?.reason ? `Reason: ${item.escalation.reason}` : item.category}
                                        </p>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-medium text-slate-800 block">{item.team}</span>
                                        <span className="text-[11px] text-slate-400">{item.assignedAgent?.name || "Unassigned"}</span>
                                    </td>
                                    <td className="p-4">
                                        {item.sla.status === "OVERDUE" ? (
                                            <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-800">
                                                <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse" />
                                                {item.sla.timeRemainingText}
                                            </span>
                                        ) : item.sla.status === "AT_RISK" ? (
                                            <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
                                                {item.sla.timeRemainingText}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-slate-500">
                                                <Clock className="h-3 w-3" />
                                                {item.sla.timeRemainingText}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedComplaintId(item.id);
                                                    window.location.href = "/business/inbox";
                                                }}
                                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                            >
                                                Open Workspace
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setResolveModalComplaintId(item.id)}
                                                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                                            >
                                                Settle
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
