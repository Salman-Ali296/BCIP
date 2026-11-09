"use client";

import { useState } from "react";
import { Download, FileText, Calendar, CheckCircle2, BarChart3, Filter } from "lucide-react";

export default function BusinessReportsPage() {
    const [downloading, setDownloading] = useState<string | null>(null);

    const reports = [
        {
            id: "rep-01",
            title: "Executive Complaint Health & SLA Breach Report (Q3 2026)",
            format: "PDF / CSV",
            period: "01 Jul 2026 – 30 Sep 2026",
            size: "3.4 MB",
            type: "Executive",
        },
        {
            id: "rep-02",
            title: "Multi-Department SLA Compliance & Breach Ledger",
            format: "CSV",
            period: "Past 30 Days (Rolling)",
            size: "840 KB",
            type: "Operations",
        },
        {
            id: "rep-03",
            title: "Recurring Issue Root Cause & Cluster Remediation Audit",
            format: "PDF",
            period: "Past 14 Days",
            size: "1.8 MB",
            type: "Quality & Escalations",
        },
        {
            id: "rep-04",
            title: "Regulatory Compliance & Escalated Case Register",
            format: "Encrypted PDF",
            period: "Year to Date (2026)",
            size: "5.1 MB",
            type: "Compliance",
        },
    ];

    const handleDownload = (id: string, title: string) => {
        setDownloading(id);
        setTimeout(() => {
            setDownloading(null);
            alert(`Generating ${title}. Export initiated.`);
        }, 600);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
                <div>
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                        Auditable Reporting
                    </span>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                        Operational & Compliance Reports
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Export historical complaint ledgers, SLA compliance audits, and recurring issue dossiers for executive oversight.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {reports.map((rep) => (
                    <div
                        key={rep.id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 flex flex-col justify-between"
                    >
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                    {rep.type}
                                </span>
                                <span className="text-[11px] font-mono text-slate-400">{rep.format}</span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 leading-snug">{rep.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                <span>{rep.period}</span>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-mono text-[11px]">{rep.size}</span>
                            <button
                                type="button"
                                onClick={() => handleDownload(rep.id, rep.title)}
                                disabled={downloading === rep.id}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 font-bold text-white hover:bg-slate-800 transition disabled:opacity-50"
                            >
                                <Download className="h-3.5 w-3.5" />
                                <span>{downloading === rep.id ? "Preparing..." : "Export Report"}</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
