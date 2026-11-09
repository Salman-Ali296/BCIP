"use client";

import { useState } from "react";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Users,
    Building2,
    Sparkles,
    ShieldAlert,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
} from "lucide-react";
import { useEnterprise } from "../context/enterprise-context";
import { RECURRING_CLUSTERS } from "../mock-data";

export function ExecutiveDashboardView() {
    const { organization, businessUnits, selectedBusinessUnitId } = useEnterprise();
    const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("7d");

    const executiveInsights = [
        {
            title: "Payment complaints increased 18% this week",
            impact: "HIGH",
            summary: "Digital gateway timeout spike during afternoon settlement batches created duplicate pending authorization holds.",
            metricChange: "+18% WoW",
            actionText: "View Gateway Diagnostics",
            link: "/business/trends",
        },
        {
            title: "Delivery transit accounts for the largest complaint volume",
            impact: "MEDIUM",
            summary: "Regional Hub 48 logistics delays accounted for 41% of physical product dispute filings.",
            metricChange: "+12% Volume",
            actionText: "Inspect Logistics SLA",
            link: "/business/analytics",
        },
        {
            title: "Three recurring issue patterns represent 31% of high-priority cases",
            impact: "CRITICAL",
            summary: "Correlated gateway drops, missing tracking telemetry, and restocking fee discrepancies are cluster-linked.",
            metricChange: "31% Concentration",
            actionText: "Review Semantic Clusters",
            link: "/business/trends",
        },
        {
            title: "Average resolution time improved to 3.8h in Customer Operations",
            impact: "POSITIVE",
            summary: "Direct AI triage and routing saved an estimated 42 minutes per case in initial dispatch triage.",
            metricChange: "-42m Triage",
            actionText: "View Team Breakdown",
            link: "/business/performance",
        },
    ];

    const categoryBreakdown = [
        { name: "Payment & Gateway", percentage: 38, count: 542, change: "+14%", isUp: true },
        { name: "Delivery & Logistics", percentage: 26, count: 371, change: "+9%", isUp: true },
        { name: "Cards & Disputes", percentage: 18, count: 257, change: "-4%", isUp: false },
        { name: "Corporate Banking", percentage: 11, count: 157, change: "+2%", isUp: true },
        { name: "Account & Compliance", percentage: 7, count: 101, change: "-8%", isUp: false },
    ];

    const businessUnitComparison = [
        { unit: "Retail Banking", activeCases: 842, resolutionRate: "93.4%", avgHours: "3.2h", slaBreach: "1.8%" },
        { unit: "Corporate Banking", activeCases: 312, resolutionRate: "97.1%", avgHours: "2.1h", slaBreach: "0.4%" },
        { unit: "Digital Banking", activeCases: 274, resolutionRate: "91.8%", avgHours: "4.5h", slaBreach: "3.2%" },
    ];

    return (
        <div className="space-y-8">
            {/* Executive Health Overview Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                            Executive Overview
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">{organization.name}</span>
                    </div>
                    <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                        Customer Complaint Health & Operations
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        Enterprise complaint volume, SLA resolution compliance, recurring issue risk, and departmental metrics.
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold">
                        {(["7d", "30d", "90d"] as const).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setTimeframe(t)}
                                className={`rounded-lg px-3 py-1.5 transition ${
                                    timeframe === t
                                        ? "bg-slate-900 text-white shadow-xs"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                {t.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Core KPIs */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-7">
                {[
                    { label: "Total Complaints", value: "1,428", sub: "+8% vs last week", tone: "text-slate-900" },
                    { label: "Open Cases", value: "142", sub: "Currently active", tone: "text-blue-700" },
                    { label: "High Priority", value: "29", sub: "Priority queues", tone: "text-amber-700" },
                    { label: "SLA At Risk", value: "08", sub: "<45m to breach", tone: "text-rose-700", alert: true },
                    { label: "Resolution Rate", value: "94.2%", sub: "+1.4% target", tone: "text-emerald-700" },
                    { label: "Avg Resolution", value: "3.8h", sub: "Down from 4.6h", tone: "text-slate-900" },
                    { label: "CSAT Score", value: "4.6/5", sub: "Based on 318 reviews", tone: "text-slate-900" },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className={`rounded-2xl border bg-white p-4 shadow-xs ${
                            stat.alert ? "border-rose-200 bg-rose-50/30" : "border-slate-200"
                        }`}
                    >
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
                        <p className={`mt-2 text-2xl font-extrabold tracking-tight ${stat.tone}`}>{stat.value}</p>
                        <p className="mt-1 text-[11px] text-slate-400">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* Executive Insights Section */}
            <section aria-labelledby="exec-insights-heading" className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-600" />
                        <h2 id="exec-insights-heading" className="text-lg font-bold text-slate-900">
                            Executive Intelligence Insights
                        </h2>
                    </div>
                    <span className="text-xs text-slate-400">Synthesized from 1,428 recent events</span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {executiveInsights.map((ins) => (
                        <div
                            key={ins.title}
                            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-300 transition"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2">
                                    <span
                                        className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                                            ins.impact === "CRITICAL"
                                                ? "bg-rose-100 text-rose-800"
                                                : ins.impact === "HIGH"
                                                ? "bg-amber-100 text-amber-900"
                                                : ins.impact === "POSITIVE"
                                                ? "bg-emerald-100 text-emerald-800"
                                                : "bg-blue-100 text-blue-800"
                                        }`}
                                    >
                                        {ins.impact} IMPACT
                                    </span>
                                    <span className="font-mono text-xs font-bold text-slate-700">
                                        {ins.metricChange}
                                    </span>
                                </div>
                                <h3 className="mt-2 text-sm font-bold text-slate-900">
                                    {ins.title}
                                </h3>
                                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                                    {ins.summary}
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                                <a
                                    href={ins.link}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                                >
                                    <span>{ins.actionText}</span>
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Business Questions Answered */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Question 1: What are customers complaining about? */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                            Root Cause Distribution
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5">
                            What are customers complaining about?
                        </h3>
                    </div>

                    <div className="space-y-3">
                        {categoryBreakdown.map((cat) => (
                            <div key={cat.name} className="space-y-1">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className="text-slate-800">{cat.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500 font-normal">{cat.count} cases</span>
                                        <span className={cat.isUp ? "text-rose-600" : "text-emerald-600"}>
                                            {cat.change}
                                        </span>
                                    </div>
                                </div>
                                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-blue-600 transition-all duration-500"
                                        style={{ width: `${cat.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Question 2: How does complaint volume vary by business unit? */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                            Multi-Department Matrix
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5">
                            How does complaint volume vary by business unit?
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                                <tr>
                                    <th className="py-2">Business Unit</th>
                                    <th className="py-2">Active Cases</th>
                                    <th className="py-2">Resolution Rate</th>
                                    <th className="py-2">Avg Speed</th>
                                    <th className="py-2">SLA Breach</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {businessUnitComparison.map((bu) => (
                                    <tr key={bu.unit} className="hover:bg-slate-50">
                                        <td className="py-3 font-bold text-slate-900">{bu.unit}</td>
                                        <td className="py-3 text-slate-700">{bu.activeCases}</td>
                                        <td className="py-3 font-semibold text-emerald-700">{bu.resolutionRate}</td>
                                        <td className="py-3 text-slate-700">{bu.avgHours}</td>
                                        <td className="py-3 text-rose-700 font-semibold">{bu.slaBreach}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Semantic Recurring Issue Clusters */}
            <section aria-labelledby="clusters-heading" className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 id="clusters-heading" className="text-lg font-bold text-slate-900">
                            Active Semantic Issue Clusters
                        </h2>
                        <p className="text-xs text-slate-500">
                            Cross-department recurring complaint patterns requiring operational remediation
                        </p>
                    </div>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                        {RECURRING_CLUSTERS.length} Pattern Clusters Active
                    </span>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {RECURRING_CLUSTERS.map((cl) => (
                        <div
                            key={cl.id}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 flex flex-col justify-between"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs font-bold text-slate-500">{cl.id}</span>
                                    <span className="rounded bg-rose-100 text-rose-800 px-2 py-0.2 text-[10px] font-bold uppercase">
                                        {cl.status}
                                    </span>
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                                    {cl.title}
                                </h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    {cl.summary}
                                </p>
                            </div>

                            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                                <div className="flex items-center justify-between text-slate-500">
                                    <span>Affected volume:</span>
                                    <strong className="text-slate-900">{cl.affectedComplaintsCount} complaints</strong>
                                </div>
                                <div className="rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-700 leading-tight">
                                    💡 <strong>Remediation:</strong> {cl.suggestedRemediation}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
