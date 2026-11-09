"use client";

import { Building2, Users, ArrowRight, ShieldCheck, Mail } from "lucide-react";
import { BUSINESS_UNITS } from "@/features/enterprise/mock-data";

export default function BusinessTeamsPage() {
    return (
        <div className="space-y-6">
            <div className="border-b border-slate-200 pb-5">
                <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                    Operations Matrix
                </span>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    Enterprise Departments & Teams
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                    Operational staffing distribution, active ticket workloads, and team leads across all business divisions.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {BUSINESS_UNITS.map((bu) => (
                    <div key={bu.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                            <span className="font-mono text-xs font-bold text-blue-600">{bu.code}</span>
                            <h2 className="text-base font-bold text-slate-900 mt-0.5">{bu.name}</h2>
                            <p className="text-xs text-slate-500 mt-1">{bu.description}</p>
                        </div>

                        <div className="space-y-3">
                            {bu.departments.map((dept) => (
                                <div key={dept.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-2">
                                    <h3 className="text-xs font-bold text-slate-900">{dept.name}</h3>
                                    <div className="space-y-1.5">
                                        {dept.teams.map((t) => (
                                            <div key={t.id} className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-slate-900">{t.name}</span>
                                                    <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-600">
                                                        {t.memberCount} agents
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-[11px] text-slate-500">
                                                    <span>Lead: {t.leadName}</span>
                                                    <span className="font-semibold text-blue-700">{t.activeComplaintsCount} active</span>
                                                </div>
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
    );
}
