"use client";

import { useState } from "react";
import { BookOpen, Search, FileText, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function BusinessKnowledgePage() {
    const [search, setSearch] = useState("");

    const articles = [
        {
            id: "kb-01",
            title: "Standard Operating Procedure: Online Payment Timeout & Hold Release",
            category: "Payment Operations",
            summary: "Step-by-step procedure for verifying authorization holds when checkout timed out before receipt generation.",
            readTime: "4 min read",
            lastUpdated: "Yesterday",
        },
        {
            id: "kb-02",
            title: "Transit Damage Carrier Claim & Replacement Dispatch Protocol",
            category: "Logistics",
            summary: "Guidelines on approving instant replacement orders for VIP tier clients and filing courier subrogation claims.",
            readTime: "6 min read",
            lastUpdated: "03 Oct 2026",
        },
        {
            id: "kb-03",
            title: "Restocking Fee Waiver Discretionary Thresholds",
            category: "Billing Operations",
            summary: "Policy governing authorized customer goodwill allowances and return fee exemptions up to $50.",
            readTime: "3 min read",
            lastUpdated: "29 Sep 2026",
        },
        {
            id: "kb-04",
            title: "Commercial Payroll ACH Batch Failure Escalation Matrix",
            category: "Corporate Banking",
            summary: "Immediate 15-minute SLA protocol when corporate salary batches fail federal clearing endpoint validation.",
            readTime: "5 min read",
            lastUpdated: "01 Oct 2026",
        },
    ];

    const filtered = articles.filter(
        (a) =>
            a.title.toLowerCase().includes(search.toLowerCase()) ||
            a.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
                <div>
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                        Operational SOPs
                    </span>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                        Resolution Knowledge Base & Playbooks
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Verified resolution policies, standard workflows, and compliance playbooks for support teams.
                    </p>
                </div>

                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search playbooks & SOPs..."
                        className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {filtered.map((item) => (
                    <div
                        key={item.id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 hover:border-blue-200 transition flex flex-col justify-between"
                    >
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                    {item.category}
                                </span>
                                <span className="text-[11px] text-slate-400">{item.readTime}</span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">{item.summary}</p>
                        </div>
                        <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                            <span className="text-slate-400">Updated: {item.lastUpdated}</span>
                            <span className="font-bold text-blue-600 hover:underline cursor-pointer">
                                Read SOP →
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
