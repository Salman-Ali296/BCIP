"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
  Lock,
  Layers,
  ArrowRight,
  Eye,
  Sliders,
  AlertTriangle,
  Scale,
  FileCheck2,
} from "lucide-react";
import Link from "next/link";

export function CapabilitiesGuardrailsSection() {
  const [activeFilter, setActiveFilter] = useState<"all" | "can-do" | "guardrails">("all");

  const canDoItems = [
    {
      title: "Omnichannel Ingestion",
      summary: "Ingest complaints automatically from email, web portals, chat, and voice transcripts.",
      badge: "Multi-Source Intake",
      metric: "Sub-second ingest",
      icon: Zap,
    },
    {
      title: "Semantic Duplicate Clustering",
      summary: "Identify complaints describing identical root issues using vector cosine similarity (≥0.80).",
      badge: "Vector AI Engine",
      metric: "Cosine ≥0.80",
      icon: Sparkles,
    },
    {
      title: "Real-Time SLA & Urgency Ranking",
      summary: "Prioritize incoming cases dynamically based on financial impact, churn risk, and breach deadlines.",
      badge: "Dynamic Radar",
      metric: "Live countdowns",
      icon: Sliders,
    },
    {
      title: "Contextual Resolution Drafting",
      summary: "Generate tailored resolution summaries, refund recommendations, and next-step proposals for review.",
      badge: "Assisted Copilot",
      metric: "Pre-drafted context",
      icon: FileCheck2,
    },
    {
      title: "Role-Scoped Department Routing",
      summary: "Directly assign cases to specialized teams (Billing, Logistics, Identity) with tracked handoffs.",
      badge: "Audit-Tracked",
      metric: "100% clear ownership",
      icon: Layers,
    },
  ];

  const cannotDoItems = [
    {
      title: "Never Issues Autonomous Refunds",
      summary: "The platform cannot debit accounts or issue monetary payouts without explicit human staff sign-off.",
      badge: "Financial Lock",
      rule: "Human-in-the-loop only",
      icon: Lock,
    },
    {
      title: "Never Sends Unreviewed Commitments",
      summary: "AI will never dispatch legal agreements, apologies, or binding promises directly to customers.",
      badge: "Zero Unchecked Output",
      rule: "Operator review required",
      icon: ShieldAlert,
    },
    {
      title: "Never Acts as a Black Box",
      summary: "Every triage label and sentiment rating shows confidence scores and exact message snippets.",
      badge: "Full Explainability",
      rule: "Traceable reasoning",
      icon: Eye,
    },
    {
      title: "Never Exposes Unmasked Customer PII",
      summary: "Sensitive personal data, card numbers, and credentials are auto-redacted before cross-tier review.",
      badge: "PII Redaction Gate",
      rule: "Role-scoped masking",
      icon: ShieldCheck,
    },
    {
      title: "Never Overrides Human Decisions",
      summary: "Staff members have full authority to override AI triage, reclassify urgency, or reassign cases.",
      badge: "Human Primacy",
      rule: "Staff override final",
      icon: Scale,
    },
  ];

  return (
    <section id="capabilities-guardrails" className="section bg-white border-b border-slate-200">
      <div className="container-x">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 border-b border-slate-100">
          <div className="max-w-2xl">
            <div className="eyebrow">
              <span className="status-dot" />
              Operational Transparency
            </div>
            <h2 className="heading-xl mt-3 text-[#101d30]">
              What BCIP does.
              <br />
              <span className="text-[#2454d6]">And what it never will.</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 max-w-xl">
              High-velocity operational intelligence with strict safety guardrails. We accelerate frontline triage without ever delegating binding customer authority to AI.
            </p>
          </div>

          {/* View Filter Pill Switcher */}
          <div className="flex items-center gap-2 self-start lg:self-end bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeFilter === "all"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Signals
            </button>
            <button
              onClick={() => setActiveFilter("can-do")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeFilter === "can-do"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              What You Can Do
            </button>
            <button
              onClick={() => setActiveFilter("guardrails")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeFilter === "guardrails"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              What System Prevents
            </button>
          </div>
        </div>

        {/* Product Visual Showcase Banner */}
        <div className="mt-8 rounded-2xl border border-slate-200/80 bg-slate-900 overflow-hidden shadow-xl text-white">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] items-center">
            {/* Left Context Info */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Human-in-the-Loop Governance
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                AI proposes. <span className="text-emerald-400">Humans approve.</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Notice the separation in our case interface: AI calculates confidence (94%), flags sentiment anomalies, and drafts the next action. But every customer refund, discount code, or final escalation requires an authorized operator click.
              </p>

              <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-slate-300">
                <span className="rounded-md bg-white/10 px-2.5 py-1 border border-white/10">
                  Compliance Lock: Active
                </span>
                <span className="rounded-md bg-white/10 px-2.5 py-1 border border-white/10">
                  Audit Trail: Immutable
                </span>
                <span className="rounded-md bg-white/10 px-2.5 py-1 border border-white/10">
                  PII Masking: Enforced
                </span>
              </div>
            </div>

            {/* Right Product Image Visual */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-950/80 border-t lg:border-t-0 lg:border-l border-white/10">
              <Image
                src="/images/governance-approval-preview.jpg"
                alt="BCIP Human-in-the-Loop Decision Governance Interface"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover object-center transition-transform duration-500 hover:scale-[1.02]"
                priority={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 right-3 rounded-lg bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-mono font-semibold text-white/90 border border-white/20">
                Live Governance Screen Preview
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Comparison Grid: Can Do vs Cannot Do */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1: WHAT YOU CAN DO */}
          {(activeFilter === "all" || activeFilter === "can-do") && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/30 p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-600 text-white">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        What You & BCIP Can Do
                      </h4>
                      <p className="text-[11px] text-emerald-800 font-medium">Platform superpowers for your team</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-mono text-[10px] font-bold px-2.5 py-0.5">
                    5 Capabilities
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  {canDoItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-emerald-200/80 bg-white p-4 shadow-2xs transition hover:border-emerald-400 hover:shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-emerald-100 text-emerald-700">
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                              {item.title}
                            </span>
                          </div>
                          <span className="shrink-0 font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {item.metric}
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-slate-600">
                          {item.summary}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-emerald-200/60 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Explore interactive workspace</span>
                <Link
                  href="#workspace"
                  className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  Try simulator below <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Column 2: WHAT THE SYSTEM CANNOT DO / GUARDRAILS */}
          {(activeFilter === "all" || activeFilter === "guardrails") && (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-50/30 p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-rose-500/20">
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-7 w-7 place-items-center rounded-lg bg-rose-600 text-white">
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        What The System Will Never Do
                      </h4>
                      <p className="text-[11px] text-rose-800 font-medium">Non-negotiable safety guardrails</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-rose-100 border border-rose-300 text-rose-800 font-mono text-[10px] font-bold px-2.5 py-0.5">
                    5 Safety Locks
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  {cannotDoItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-rose-200/80 bg-white p-4 shadow-2xs transition hover:border-rose-400 hover:shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-rose-100 text-rose-700">
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                              {item.title}
                            </span>
                          </div>
                          <span className="shrink-0 font-mono text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            {item.rule}
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-slate-600">
                          {item.summary}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-rose-200/60 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Verify enterprise compliance</span>
                <Link
                  href="#trust"
                  className="inline-flex items-center gap-1 font-bold text-rose-700 hover:text-rose-800 hover:underline"
                >
                  View audit architecture <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
