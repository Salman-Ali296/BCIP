"use client";

import { Calendar, Download } from "lucide-react";
import { useEnterprise } from "@/features/enterprise/context/enterprise-context";
import { useBusinessWorkspace } from "@/features/business-trial/context/business-workspace-context";
import type { EnterpriseComplaint } from "@/features/enterprise/types";

type ReportDefinition = {
    id: string;
    type: string;
    title: string;
    description: string;
    pick: (complaints: EnterpriseComplaint[]) => EnterpriseComplaint[];
};

// Each report is a CSV built in the browser from the complaints the API returned.
const REPORTS: ReportDefinition[] = [
    {
        id: "all",
        type: "Complaints",
        title: "All complaints",
        description: "Every complaint with its status, priority, category and deadline.",
        pick: (complaints) => complaints,
    },
    {
        id: "open",
        type: "Operations",
        title: "Open complaints",
        description: "Everything not yet resolved, for a daily stand-up or handover.",
        pick: (complaints) => complaints.filter((c) => c.status !== "RESOLVED" && c.status !== "CLOSED"),
    },
    {
        id: "overdue",
        type: "Deadlines",
        title: "Past the 48-hour target",
        description: "Open complaints older than the default resolution target.",
        pick: (complaints) => complaints.filter((c) => c.sla.status === "OVERDUE"),
    },
    {
        id: "escalated",
        type: "Escalations",
        title: "Escalated and critical",
        description: "Cases handed to a senior person or marked critical by the AI.",
        pick: (complaints) => complaints.filter((c) => c.status === "ESCALATED" || c.priority === "CRITICAL"),
    },
];

const COLUMNS: Array<[string, (c: EnterpriseComplaint) => string]> = [
    ["Tracking ID", (c) => c.trackingId],
    ["Title", (c) => c.title],
    ["Customer email", (c) => c.customer.email],
    ["Category", (c) => c.category],
    ["Priority", (c) => c.priority],
    ["Sentiment", (c) => c.sentiment],
    ["Status", (c) => c.status],
    ["Assigned", (c) => (c.assignedAgent ? "Yes" : "No")],
    ["Submitted", (c) => c.createdAt],
    ["Deadline", (c) => c.sla.timeRemainingText],
];

function toCsv(rows: EnterpriseComplaint[]): string {
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const header = COLUMNS.map(([label]) => escape(label)).join(",");
    const body = rows.map((row) => COLUMNS.map(([, read]) => escape(read(row) ?? "")).join(","));
    return [header, ...body].join("\r\n");
}

function download(filename: string, csv: string) {
    // BOM so Excel opens UTF-8 names correctly.
    const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

export default function BusinessReportsPage() {
    const { complaints, isLoadingComplaints, showToast } = useEnterprise();
    const workspace = useBusinessWorkspace();
    const today = new Date().toISOString().slice(0, 10);
    const slug = workspace.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    function exportReport(report: ReportDefinition) {
        const rows = report.pick(complaints);
        if (rows.length === 0) {
            showToast(`Nothing to export for "${report.title}" yet.`);
            return;
        }
        download(`${slug || "bcip"}-${report.id}-${today}.csv`, toCsv(rows));
        showToast(`Downloaded ${rows.length} ${rows.length === 1 ? "row" : "rows"}`);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
                <div>
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">Reports</span>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Download your complaints</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        CSV files that open in Excel or Google Sheets. They include your latest 100 complaints.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {REPORTS.map((report) => {
                    const count = report.pick(complaints).length;
                    return (
                        <div
                            key={report.id}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 flex flex-col justify-between"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                        {report.type}
                                    </span>
                                    <span className="text-[11px] font-mono text-slate-400">CSV</span>
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 leading-snug">{report.title}</h3>
                                <p className="text-xs leading-5 text-slate-500">{report.description}</p>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Calendar className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                                    <span>As of today</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                                <span className="text-slate-500">
                                    {isLoadingComplaints ? "Counting…" : `${count} ${count === 1 ? "complaint" : "complaints"}`}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => exportReport(report)}
                                    disabled={isLoadingComplaints}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 font-bold text-white hover:bg-slate-800 transition disabled:opacity-50"
                                >
                                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                                    <span>Download</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
