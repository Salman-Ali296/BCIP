"use client";

import React from "react";
import {
  CheckCircle2,
  Filter,
  Layers,
  Search,
  ShieldCheck,
  Zap,
  TrendingDown,
  Clock,
  Sparkles,
} from "lucide-react";

const outcomes = [
  {
    number: "01",
    title: "Accelerated Triage",
    metric: "68% Faster",
    highlight: "Pre-screen urgency & frustration",
    summary: "Incoming issues are instantly scored for urgency before an operator opens the ticket.",
    chips: ["Urgency Scoring", "Frustration Detection", "Keyword Extraction"],
    icon: Zap,
  },
  {
    number: "02",
    title: "Risk-Weighted Prioritization",
    metric: "99.2% SLA Adherence",
    highlight: "Focus on business-critical accounts",
    summary: "Dynamic queue ranking based on VIP status, revenue exposure, and SLA deadlines.",
    chips: ["Revenue Weighting", "Countdown Timers", "VIP Protection"],
    icon: Filter,
  },
  {
    number: "03",
    title: "Semantic Duplicate Detection",
    metric: "≥0.80 Cosine",
    highlight: "Spot system outages early",
    summary: "Vector clustering groups identical grievances together across channels.",
    chips: ["Vector Similarity", "Cluster Radar", "Root-Cause Linking"],
    icon: Search,
  },
  {
    number: "04",
    title: "Single-Point Accountability",
    metric: "100% Tracked",
    highlight: "Zero departmental finger-pointing",
    summary: "Automated routing directly to Billing, Logistics, or Security with complete audit logs.",
    chips: ["Department Queues", "Handoff Timestamps", "Role Scoping"],
    icon: ShieldCheck,
  },
  {
    number: "05",
    title: "Governed Human Decisions",
    metric: "Human Sign-off",
    highlight: "Full context before action",
    summary: "Pre-screened history and proposed drafts arm staff to make confident, compliant fixes.",
    chips: ["Pre-Drafted Fixes", "Ledger Context", "Audit Sign-Off"],
    icon: Layers,
  },
];

export function BusinessOutcomesSection() {
  return (
    <section id="outcomes" className="section bg-white border-b border-slate-200">
      <div className="container-x">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-end pb-8 border-b border-slate-100">
          <div>
            <div className="eyebrow">
              <span className="status-dot" />
              Operational Outcomes
            </div>
            <h2 className="heading-xl mt-3 text-[#101d30]">
              Measurable impact.
              <br />
              <span className="text-[#2454d6]">Zero guesswork.</span>
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-600 max-w-lg lg:ml-auto">
            Eliminate reactive chaos. Convert unstructured complaints into structured, prioritized signals that frontline teams resolve in record time.
          </p>
        </div>

        {/* 5 Capability Cards Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {outcomes.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.number}
                className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-5 flex flex-col justify-between transition-all hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                    <span className="font-mono text-[11px] font-bold text-slate-400">
                      Step {item.number}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#2454d6] bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded">
                      {item.metric}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-2.5">
                    <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#2454d6] text-white shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-[11px] font-semibold text-[#2454d6]">
                        {item.highlight}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-600">
                    {item.summary}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {item.chips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  Audited operational workflow
                </div>
              </div>
            );
          })}

          {/* Outcome Summary Callout */}
          <div className="rounded-2xl border border-blue-200 bg-[#edf2ff] p-5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2454d6]">
                Core Safety Guarantee
              </span>
              <h3 className="mt-3 text-base font-bold text-slate-900 leading-snug">
                AI assists. Authorized humans decide.
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-700">
                BCIP never performs autonomous payouts or customer commitments. Algorithms extract context and suggest options; authorized staff approve every customer action.
              </p>

              <div className="mt-4 space-y-1.5 text-[11px] font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Immutable audit logging on every action</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Zero black-box hallucinations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Role-scoped customer PII redaction</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-blue-200/60 text-xs font-bold text-[#2454d6]">
              Enterprise Trust Model
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
