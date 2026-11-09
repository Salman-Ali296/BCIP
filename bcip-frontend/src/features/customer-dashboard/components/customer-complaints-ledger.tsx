"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
    Search,
    Filter,
    PlusCircle,
    Clock,
    AlertCircle,
    CheckCircle2,
    ArrowRight,
    ExternalLink,
    ShieldCheck,
    FileText,
} from "lucide-react";
import {
    INITIAL_COMPLAINTS,
    RESOLVED_COMPLAINTS,
} from "@/features/customer-dashboard/mock-data";
import type { CustomerComplaint } from "@/features/customer-dashboard/types";

export function CustomerComplaintsLedger() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [localComplaints, setLocalComplaints] = useState<CustomerComplaint[]>([]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("bcip:customer-complaints");
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    const mapped: CustomerComplaint[] = parsed.map((p: Record<string, unknown>) => ({
                        id: (p.id || p.trackingId) as string,
                        subject: (p.title || (typeof p.description === "string" ? p.description.slice(0, 40) : "Complaint")) as string,
                        description: (p.description || "") as string,
                        category: ((p.category as string) || "Service") as CustomerComplaint["category"],
                        status:
                            p.status === "resolved"
                                ? "Resolved" as const
                                : p.status === "awaiting_customer"
                                ? "Awaiting Response" as const
                                : p.status === "in_review"
                                ? "In Progress" as const
                                : "Open" as const,
                        priority:
                            p.priority === "high" || p.priority === "HIGH" || p.priority === "CRITICAL"
                                ? "High" as const
                                : "Medium" as const,
                        assignedTeam: "Customer Operations",
                        submittedDate: new Date((p.createdAt as number) || Date.now()).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        }),
                        lastUpdate: "Just now",
                        currentProgressStep: 1,
                        timeline: [],
                        messages: [],
                        attachments: [],
                    }));
                    setLocalComplaints(mapped);
                }
            }
        } catch {
            // Ignore parse errors
        }
    }, []);

    const allComplaints: CustomerComplaint[] = useMemo(() => {
        const combined = [...localComplaints, ...INITIAL_COMPLAINTS, ...RESOLVED_COMPLAINTS];
        const seen = new Set<string>();
        return combined.filter((c) => {
            if (seen.has(c.id)) return false;
            seen.add(c.id);
            return true;
        });
    }, [localComplaints]);

    const filtered = useMemo(() => {
        return allComplaints.filter((c) => {
            const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
            const q = searchQuery.toLowerCase().trim();
            const matchSearch =
                !q ||
                c.id.toLowerCase().includes(q) ||
                c.subject.toLowerCase().includes(q) ||
                c.category.toLowerCase().includes(q) ||
                c.assignedTeam.toLowerCase().includes(q);
            return matchStatus && matchSearch;
        });
    }, [allComplaints, statusFilter, searchQuery]);

    const getStatusBadge = (status: CustomerComplaint["status"]) => {
        switch (status) {
            case "Resolved":
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        Resolved
                    </span>
                );
            case "In Progress":
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
                        <Clock className="h-3 w-3" />
                        In Progress
                    </span>
                );
            case "Awaiting Response":
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                        <AlertCircle className="h-3 w-3" />
                        Awaiting Info
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 border border-slate-200">
                        Open
                    </span>
                );
        }
    };

    const getPriorityBadge = (priority: CustomerComplaint["priority"]) => {
        switch (priority) {
            case "Critical":
                return "bg-rose-100 text-rose-800 border-rose-200";
            case "High":
                return "bg-amber-100 text-amber-900 border-amber-200";
            case "Medium":
                return "bg-blue-100 text-blue-800 border-blue-200";
            default:
                return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    return (
        <div className="space-y-6 pb-12 font-sans">
            {/* Header with Title and Primary CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                        My Grievances & Complaints
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600">
                        Track all formal incidents filed under your corporate account with real-time SLA telemetry.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <Link
                        href="/customer/complaints/new"
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Submit New Grievance
                    </Link>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by ID, subject, category..."
                        className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                {/* Status Filter Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                    {[
                        { key: "ALL", label: "All" },
                        { key: "Open", label: "Open" },
                        { key: "In Progress", label: "In Progress" },
                        { key: "Awaiting Response", label: "Awaiting Response" },
                        { key: "Resolved", label: "Resolved" },
                    ].map((btn) => (
                        <button
                            key={btn.key}
                            type="button"
                            onClick={() => setStatusFilter(btn.key)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                statusFilter === btn.key
                                    ? "bg-slate-900 text-white font-bold"
                                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table / Card List */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                            <tr>
                                <th className="px-5 py-3.5">Complaint ID</th>
                                <th className="px-5 py-3.5">Subject Narrative</th>
                                <th className="px-5 py-3.5">Category</th>
                                <th className="px-5 py-3.5">Status</th>
                                <th className="px-5 py-3.5">Priority</th>
                                <th className="px-5 py-3.5">Last Updated</th>
                                <th className="px-5 py-3.5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                                        <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                                        <p className="font-semibold text-slate-700">No matching grievances found</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            Try adjusting your search criteria or register a new complaint.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50/80 transition">
                                        <td className="px-5 py-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                                            {c.id}
                                        </td>
                                        <td className="px-5 py-4 max-w-xs sm:max-w-md">
                                            <p className="font-semibold text-slate-900 truncate">{c.subject}</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                Filed on {c.submittedDate} &bull; {c.assignedTeam}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4 text-slate-700 whitespace-nowrap">{c.category}</td>
                                        <td className="px-5 py-4 whitespace-nowrap">{getStatusBadge(c.status)}</td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <span
                                                className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${getPriorityBadge(
                                                    c.priority
                                                )}`}
                                            >
                                                {c.priority}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                                            {c.lastUpdate}
                                        </td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap">
                                            <Link
                                                href={`/customer/dashboard`}
                                                className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                Track Progress
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
