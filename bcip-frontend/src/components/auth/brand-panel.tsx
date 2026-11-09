"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronRight, Clock, ShieldCheck, Sparkles } from "lucide-react";

export function BrandPanel() {
    return (
        <aside
            aria-label="BCIP Product Intelligence Overview"
            className="hidden lg:flex flex-col justify-between w-full h-full bg-[#0d1526] text-slate-100 p-10 xl:p-14 border-r border-slate-800/80 relative overflow-hidden select-none"
        >
            {/* Ambient structural background grid & restrained lighting */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.035]"
                style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: "32px 32px",
                }}
            />
            <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-600/15 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px]" />

            {/* Top Brand & Tagline */}
            <div className="relative z-10 space-y-4">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2.5 text-white group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                >
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm shadow-blue-500/30 group-hover:bg-blue-500 transition-colors">
                        <span className="text-sm font-semibold tracking-wider">B</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-base font-bold tracking-tight text-white leading-none">
                            BCIP
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">
                            Business Complaint Intelligence Platform
                        </span>
                    </div>
                </Link>

                <div className="pt-2">
                    <h2 className="text-2xl xl:text-3xl font-semibold tracking-tight text-white leading-snug">
                        Turn customer complaints into business intelligence.
                    </h2>
                    <p className="text-sm text-slate-400 mt-2 max-w-md leading-relaxed">
                        Deploy SLA-aware resolution workflows, detect root causes with semantic NLP clustering, and protect brand reputation across enterprise departments.
                    </p>
                </div>
            </div>

            {/* Middle: Minimal Product Intelligence Pipeline & Realistic Preview Card */}
            <div className="relative z-10 my-8 space-y-5">
                {/* Pipeline visualizer */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        <span>Intelligence Pipeline</span>
                        <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Active Engine
                        </span>
                    </div>

                    <div className="grid grid-cols-6 gap-1.5 text-center text-[10px]">
                        {[
                            { name: "Complaint", color: "text-slate-300 bg-slate-800/80 border-slate-700" },
                            { name: "AI Analysis", color: "text-blue-300 bg-blue-950/60 border-blue-800" },
                            { name: "Priority", color: "text-amber-300 bg-amber-950/60 border-amber-800" },
                            { name: "Assignment", color: "text-indigo-300 bg-indigo-950/60 border-indigo-800" },
                            { name: "Resolution", color: "text-cyan-300 bg-cyan-950/60 border-cyan-800" },
                            { name: "Insight", color: "text-emerald-300 bg-emerald-950/60 border-emerald-800" },
                        ].map((step, idx) => (
                            <div
                                key={step.name}
                                className={`rounded-lg py-2 px-1 border font-medium ${step.color} flex flex-col items-center justify-center`}
                            >
                                <span className="opacity-60 text-[9px]">0{idx + 1}</span>
                                <span className="truncate w-full mt-0.5">{step.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Realistic BCIP Complaint Preview Card */}
                <div className="rounded-xl border border-slate-700/80 bg-slate-900/90 p-4 shadow-lg">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">Complaint Intelligence</span>
                            <span className="rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono px-1.5 py-0.5 border border-blue-500/30">
                                #CMP-9482
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-300 text-[11px] font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            <span>SLA 01h 42m remaining</span>
                        </div>
                    </div>

                    <p className="text-xs font-medium text-slate-200 mb-3.5 leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
                        &ldquo;Payment deducted but order not confirmed.&rdquo;
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-[11px]">
                        <div className="rounded-lg bg-slate-800/50 p-2 border border-slate-800">
                            <span className="text-[10px] text-slate-400 block font-normal">Category</span>
                            <span className="text-slate-200 font-medium">Payment</span>
                        </div>
                        <div className="rounded-lg bg-slate-800/50 p-2 border border-slate-800">
                            <span className="text-[10px] text-slate-400 block font-normal">Sentiment</span>
                            <span className="text-rose-300 font-medium">Negative</span>
                        </div>
                        <div className="rounded-lg bg-slate-800/50 p-2 border border-slate-800">
                            <span className="text-[10px] text-slate-400 block font-normal">Priority</span>
                            <span className="text-amber-300 font-medium">High</span>
                        </div>
                        <div className="rounded-lg bg-slate-800/50 p-2 border border-slate-800">
                            <span className="text-[10px] text-slate-400 block font-normal">Similarity</span>
                            <span className="text-blue-300 font-medium">87% Match</span>
                        </div>
                    </div>

                    <div className="rounded-lg bg-blue-950/40 border border-blue-800/50 p-2.5 flex items-center justify-between text-[11px]">
                        <div>
                            <span className="text-slate-400 text-[10px] block">Suggested Action</span>
                            <span className="text-blue-200 font-medium">Escalate to Payment Operations</span>
                        </div>
                        <span className="text-[10px] text-blue-400 bg-blue-900/60 px-2 py-0.5 rounded font-mono">
                            Auto-Routing
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom: Three Concise Capabilities + Enterprise Trust Note */}
            <div className="relative z-10 pt-4 border-t border-slate-800/80 space-y-4">
                <div className="grid grid-cols-1 gap-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>AI-powered complaint analysis & root-cause detection</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>SLA-aware complaint workflows with automatic escalation</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>Operational intelligence & executive governance reporting</span>
                    </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                        Enterprise multi-tenant isolation
                    </span>
                    <span>v2.4 Enterprise</span>
                </div>
            </div>
        </aside>
    );
}
