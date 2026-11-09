"use client";

import { useState } from "react";
import {
    ShieldCheck,
    Building2,
    KeyRound,
    Clock,
    Lock,
    FileText,
    CheckCircle2,
    Server,
} from "lucide-react";
import { useEnterprise } from "../context/enterprise-context";
import { BUSINESS_UNITS, PERMISSIONS_LIST, SLA_POLICIES } from "../mock-data";

const ADMIN_SECTIONS = [
    { key: "org", label: "Organization structure", icon: Building2 },
    { key: "rbac", label: "Roles & permissions", icon: KeyRound },
    { key: "sla", label: "SLA policies", icon: Clock },
    { key: "security", label: "Security & compliance", icon: Lock },
    { key: "audit", label: "Audit logs", icon: FileText },
] as const;

export function AdminGovernanceView() {
    const { organization, complaints } = useEnterprise();
    const [activeSection, setActiveSection] = useState<
        "org" | "rbac" | "sla" | "security" | "audit"
    >("org");

    // Sample audit events consolidated from all complaints
    const allAuditEvents = complaints.flatMap((c) => c.auditTrail);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="rounded-full bg-violet-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-violet-900">
                            Platform oversight
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">{organization.name}</span>
                    </div>
                    <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                        Platform overview
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        Review organizations, access, service commitments, and platform activity from one place.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        Tenant Isolation: Verified (Active)
                    </span>
                </div>
            </div>

            {/* Sub-navigation tabs */}
            <div className="border-b border-slate-200">
                <div className="flex flex-wrap gap-2">
                {ADMIN_SECTIONS.map((tab) => {
                    const active = activeSection === tab.key;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveSection(tab.key)}
                            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition ${
                                active
                                    ? "border-slate-900 text-slate-900"
                                    : "border-transparent text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
                </div>
            </div>

            {/* TAB 1: ORGANIZATION STRUCTURE */}
            {activeSection === "org" && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Organizational Hierarchy</h3>
                            <p className="text-xs text-slate-500">
                                Multi-level structure of business units, operational departments, and support teams
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {BUSINESS_UNITS.map((bu) => (
                            <div
                                key={bu.id}
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4"
                            >
                                <div className="border-b border-slate-100 pb-3">
                                    <span className="font-mono text-xs font-bold text-blue-600">{bu.code}</span>
                                    <h4 className="text-base font-bold text-slate-900 mt-0.5">{bu.name}</h4>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{bu.description}</p>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Departments ({bu.departments.length})
                                    </p>
                                    {bu.departments.map((dept) => (
                                        <div key={dept.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-900">{dept.name}</span>
                                                <span className="font-mono text-[10px] text-slate-400">{dept.code}</span>
                                            </div>
                                            <div className="space-y-1">
                                                {dept.teams.map((t) => (
                                                    <div key={t.id} className="flex items-center justify-between text-[11px] text-slate-600 bg-white p-1.5 rounded-lg border border-slate-200">
                                                        <span>{t.name}</span>
                                                        <span className="font-semibold text-slate-900">{t.memberCount} specialists</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 2: RBAC PERMISSIONS */}
            {activeSection === "rbac" && (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Role-Based Access Control (RBAC) Matrix</h3>
                        <p className="text-xs text-slate-500">
                            Granular permission enforcement across enterprise operator roles. Enforced strictly server-side.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase font-bold text-[11px]">
                                    <tr>
                                        <th className="p-4">Permission Key</th>
                                        <th className="p-4">Category</th>
                                        <th className="p-4">Support Agent</th>
                                        <th className="p-4">Escalation Manager</th>
                                        <th className="p-4">Business Manager</th>
                                        <th className="p-4">Platform Admin</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {PERMISSIONS_LIST.map((p) => {
                                        const isAgent = ["complaints.view", "complaints.create", "complaints.update", "complaints.resolve", "complaints.escalate"].includes(p.key);
                                        const isEscalation = ["complaints.view", "complaints.create", "complaints.update", "complaints.resolve", "complaints.escalate", "customers.view", "reports.export"].includes(p.key);
                                        const isManager = ["complaints.view", "customers.view", "reports.export", "workflows.manage"].includes(p.key);
                                        const isAdmin = true;

                                        return (
                                            <tr key={p.key} className="hover:bg-slate-50">
                                                <td className="p-4">
                                                    <span className="font-bold text-slate-900 block">{p.name}</span>
                                                    <span className="font-mono text-[10px] text-slate-400">{p.key}</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                                                        {p.category}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">{isAgent ? <CheckCircle2 className="h-4 w-4 text-emerald-600 inline" /> : <span className="text-slate-300">—</span>}</td>
                                                <td className="p-4 text-center">{isEscalation ? <CheckCircle2 className="h-4 w-4 text-emerald-600 inline" /> : <span className="text-slate-300">—</span>}</td>
                                                <td className="p-4 text-center">{isManager ? <CheckCircle2 className="h-4 w-4 text-emerald-600 inline" /> : <span className="text-slate-300">—</span>}</td>
                                                <td className="p-4 text-center">{isAdmin ? <CheckCircle2 className="h-4 w-4 text-emerald-600 inline" /> : <span className="text-slate-300">—</span>}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: SLA POLICIES */}
            {activeSection === "sla" && (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Configured SLA Policy Tiers</h3>
                        <p className="text-xs text-slate-500">
                            Service Level Agreement targets governing automated escalation alerts and breach timers
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {SLA_POLICIES.map((policy) => (
                            <div
                                key={policy.id}
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4"
                            >
                                <div className="border-b border-slate-100 pb-3">
                                    <span
                                        className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                                            policy.tier === "CRITICAL"
                                                ? "bg-rose-100 text-rose-800"
                                                : policy.tier === "HIGH"
                                                ? "bg-amber-100 text-amber-900"
                                                : "bg-blue-100 text-blue-800"
                                        }`}
                                    >
                                        {policy.tier} TIER
                                    </span>
                                    <h4 className="text-base font-bold text-slate-900 mt-2">{policy.name}</h4>
                                </div>

                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-500">First Response Target:</span>
                                        <strong className="text-slate-900">{policy.firstResponseTarget}</strong>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-500">Resolution Target:</span>
                                        <strong className="text-slate-900">{policy.resolutionTarget}</strong>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-500">At-Risk Warning Threshold:</span>
                                        <strong className="text-amber-800">{policy.escalationThreshold}</strong>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Applicable Categories</p>
                                    <div className="flex flex-wrap gap-1">
                                        {policy.applicableCategories.map((cat) => (
                                            <span key={cat} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 font-medium">
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 4: SECURITY CONTROLS */}
            {activeSection === "security" && (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Security Architecture & Governance</h3>
                        <p className="text-xs text-slate-500">
                            Defense-in-depth posture enforcing tenant isolation, authentication, and access controls.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {[
                            { title: "Multi-Factor Authentication (MFA)", status: "ENFORCED", desc: "Mandatory TOTP/Hardware token for all enterprise personnel across ABC Financial Group.", icon: Lock },
                            { title: "Strict Multi-Tenant Isolation", status: "VERIFIED", desc: "Cryptographic database tenant context validation on every backend complaint transaction query.", icon: Server },
                            { title: "Role-Based Least Privilege (RBAC)", status: "ACTIVE", desc: "Server-side endpoint policy interceptors block unauthorized mutations independent of frontend UI.", icon: KeyRound },
                            { title: "Immutable Audit Ledger", status: "RECORDING", desc: "Permanent record of state changes with actor digital identity, IP telemetry, and previous state hashes.", icon: FileText },
                            { title: "Session Lifecycle & Timeout", status: "15 MIN IDLE", desc: "Enterprise session automatic termination upon 15 minutes of inactivity with re-authentication prompt.", icon: Clock },
                            { title: "Safe Error Handling & Sanitization", status: "ACTIVE", desc: "Technical stack traces and database schemas are stripped from production responses.", icon: ShieldCheck },
                        ].map((sec) => (
                            <div key={sec.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-start gap-4">
                                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-800">
                                    <sec.icon className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-bold text-slate-900">{sec.title}</h4>
                                        <span className="rounded bg-emerald-100 px-2 py-0.2 text-[10px] font-bold text-emerald-800">
                                            {sec.status}
                                        </span>
                                    </div>
                                    <p className="text-xs leading-relaxed text-slate-600">{sec.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 5: AUDIT LOGS */}
            {activeSection === "audit" && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Enterprise Immutable Audit Trail</h3>
                            <p className="text-xs text-slate-500">
                                Permanent record of administrative actions, status mutations, priority changes, and escalations
                            </p>
                        </div>
                        <span className="font-mono text-xs text-slate-400">Total Entries: {allAuditEvents.length + 12}</span>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase font-bold text-[11px]">
                                    <tr>
                                        <th className="p-4">Timestamp</th>
                                        <th className="p-4">Actor</th>
                                        <th className="p-4">Action</th>
                                        <th className="p-4">Details & Mutation</th>
                                        <th className="p-4">IP Address</th>
                                        <th className="p-4">Unit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {allAuditEvents.map((ev) => (
                                        <tr key={ev.id} className="hover:bg-slate-50">
                                            <td className="p-4 text-slate-500 font-mono whitespace-nowrap">{ev.timestamp}</td>
                                            <td className="p-4">
                                                <strong className="text-slate-900 block">{ev.actorName}</strong>
                                                <span className="text-[10px] text-slate-400">{ev.actorRole}</span>
                                            </td>
                                            <td className="p-4 font-bold text-slate-800">{ev.action}</td>
                                            <td className="p-4 max-w-sm">
                                                <p className="text-slate-700 leading-tight">{ev.details}</p>
                                                {ev.previousState && ev.newState && (
                                                    <span className="font-mono text-[10px] text-blue-600 block mt-0.5">
                                                        {ev.previousState} → {ev.newState}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 font-mono text-slate-400 text-[11px]">{ev.ipAddress}</td>
                                            <td className="p-4 text-slate-600">{ev.businessUnit}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
