"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  FileCheck,
  FileSearch,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

interface WorkflowScenario {
  id: string;
  tag: string;
  customerQuote: string;
  customerMeta: string;
  signals: {
    name: string;
    value: string;
    type: "neutral" | "urgent" | "pattern" | "sentiment";
  }[];
  confidence: number;
  operationalOutcome: {
    actionTitle: string;
    routingTarget: string;
    contextSummary: string;
    escalationLevel: string;
  };
}

const scenarios: WorkflowScenario[] = [
  {
    id: "billing",
    tag: "Billing Dispute",
    customerQuote: "I was charged twice for my order #9021 on checkout retry.",
    customerMeta: "Elena R. · Platinum Account · Order #9021",
    signals: [
      { name: "Issue Category", value: "Billing & Transactions", type: "neutral" },
      { name: "Duplicate Detection", value: "Possible Duplicate (94% Match)", type: "pattern" },
      { name: "Urgency Level", value: "High Urgency", type: "urgent" },
      { name: "Customer Sentiment", value: "Negative / Frustrated", type: "sentiment" },
      { name: "Related Cases", value: "3 Similar Cases Linked", type: "pattern" },
      { name: "Customer Context", value: "5-Year Active Account", type: "neutral" },
    ],
    confidence: 94,
    operationalOutcome: {
      actionTitle: "Billing Issue to Review",
      routingTarget: "Billing Operations Queue",
      contextSummary: "Pre-screened against payment gateway batch logs. Ledger discrepancy pre-highlighted for agent review.",
      escalationLevel: "Priority Tier 1",
    },
  },
  {
    id: "refund",
    tag: "Refund SLA",
    customerQuote: "My refund still hasn't arrived after 14 business days.",
    customerMeta: "Hamid K. · Verified Merchant · Case #3194",
    signals: [
      { name: "Issue Category", value: "Accounts & Payouts", type: "neutral" },
      { name: "Duplicate Detection", value: "Non-Duplicate Unique", type: "neutral" },
      { name: "Urgency Level", value: "SLA Exceeded", type: "urgent" },
      { name: "Customer Sentiment", value: "Escalated Concern", type: "sentiment" },
      { name: "Related Cases", value: "Cluster #402 (ACH Delay)", type: "pattern" },
      { name: "Customer Context", value: "Prior Ticket Pending", type: "neutral" },
    ],
    confidence: 91,
    operationalOutcome: {
      actionTitle: "Finance Escalation to Review",
      routingTarget: "Finance Operations",
      contextSummary: "Automated verification of bank settlement window. Direct notification queued for finance shift lead.",
      escalationLevel: "SLA Warning Stage 2",
    },
  },
  {
    id: "support",
    tag: "Support Delay",
    customerQuote: "Support hasn't replied to my case for over 48 hours.",
    customerMeta: "Sarah M. · Commercial SaaS · Ticket #1109",
    signals: [
      { name: "Issue Category", value: "Service Quality", type: "neutral" },
      { name: "Duplicate Detection", value: "Thread Follow-up", type: "pattern" },
      { name: "Urgency Level", value: "Manager Attention", type: "urgent" },
      { name: "Customer Sentiment", value: "High Churn Risk", type: "sentiment" },
      { name: "Related Cases", value: "Single Incident", type: "neutral" },
      { name: "Customer Context", value: "Renewal within 30 Days", type: "urgent" },
    ],
    confidence: 96,
    operationalOutcome: {
      actionTitle: "Recurring Service Issue",
      routingTarget: "Customer Experience Team Lead",
      contextSummary: "Elevated to team supervisor dashboard with response history and SLA breach countdown.",
      escalationLevel: "Supervisory Review",
    },
  },
  {
    id: "account",
    tag: "Account Lockout",
    customerQuote: "I can't access my account after 2FA reset was initiated.",
    customerMeta: "Tariq A. · Workspace Admin · Auth ID #884",
    signals: [
      { name: "Issue Category", value: "Account & Identity", type: "neutral" },
      { name: "Duplicate Detection", value: "Security Flag", type: "urgent" },
      { name: "Urgency Level", value: "Work-Stopping Blocker", type: "urgent" },
      { name: "Customer Sentiment", value: "Critical Blocker", type: "sentiment" },
      { name: "Related Cases", value: "Auth Gateway Event", type: "pattern" },
      { name: "Customer Context", value: "Org Owner Profile", type: "neutral" },
    ],
    confidence: 98,
    operationalOutcome: {
      actionTitle: "Account Access Gate",
      routingTarget: "Identity & SecOps Queue",
      contextSummary: "Strict identity protocol verified. One-time verification token generated awaiting human officer approval.",
      escalationLevel: "Immediate Security Gate",
    },
  },
];

export function WorkflowVisualizer() {
  const [activeScenarioId, setActiveScenarioId] = useState("billing");

  const currentScenario =
    scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];

  return (
    <section id="workflow" className="section bg-white border-b border-slate-200">
      <div className="container-x">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="eyebrow mx-auto justify-center">
            <span className="status-dot" />
            End-to-End Complaint Intelligence
          </div>
          <h2 className="heading-xl mt-4 text-[#101d30]">
            From customer voice to team action.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Incoming messages are parsed into structured operational signals. AI assists with
            classification and clustering, while your authorised team retains complete control over decisions.
          </p>

          {/* Interactive Scenario Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {scenarios.map((sc) => (
              <button
                key={sc.id}
                onClick={() => setActiveScenarioId(sc.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  activeScenarioId === sc.id
                    ? "bg-[#2454d6] text-white shadow-sm"
                    : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                {sc.tag}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Column Architecture: CUSTOMER VOICE → COMPLAINT INTELLIGENCE → TEAM ACTION */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Column 1: CUSTOMER VOICE */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-[#f8fafc] p-6 shadow-2xs">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  Step 01 · Capture
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-slate-200/70 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                  <MessageSquare className="h-3 w-3" /> Customer Voice
                </span>
              </div>

              <div className="mt-6">
                <p className="text-lg font-bold text-slate-900 leading-snug">
                  “{currentScenario.customerQuote}”
                </p>
                <p className="mt-3 text-xs font-mono text-slate-500">
                  Source: {currentScenario.customerMeta}
                </p>
              </div>

              <div className="mt-8 space-y-2 border-t border-slate-200/80 pt-4 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Channel</span>
                  <strong className="text-slate-800">Multi-Channel Intake</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Input Format</span>
                  <strong className="text-slate-800">Unstructured Text / Form</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Capture Latency</span>
                  <strong className="text-slate-800">&lt; 250ms</strong>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-2 text-xs font-semibold text-[#2454d6]">
              <span>Ingested & Queued for AI Enrichment</span>
              <ArrowRight className="h-3.5 w-3.5 ml-auto" />
            </div>
          </div>

          {/* Column 2: COMPLAINT INTELLIGENCE (Center) */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#2454d6]/30 bg-[#edf2ff]/30 p-6 shadow-md relative">
            <div>
              <div className="flex items-center justify-between border-b border-[#2454d6]/20 pb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2454d6]">
                  Step 02 · Understand
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#2454d6] text-white px-2 py-0.5 text-[10px] font-bold font-mono">
                  <Sparkles className="h-3 w-3" /> Confidence: {currentScenario.confidence}%
                </span>
              </div>

              <h3 className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Extracted Operational Signals
              </h3>

              <div className="mt-3 space-y-2">
                {currentScenario.signals.map((sig) => (
                  <div
                    key={sig.name}
                    className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-slate-200/80 shadow-2xs"
                  >
                    <span className="text-xs font-medium text-slate-600">{sig.name}</span>
                    <span
                      className={`text-[11px] font-bold rounded px-2 py-0.5 ${
                        sig.type === "urgent"
                          ? "bg-rose-50 text-rose-700 font-mono"
                          : sig.type === "pattern"
                          ? "bg-purple-50 text-purple-700 font-mono"
                          : sig.type === "sentiment"
                          ? "bg-amber-50 text-amber-800"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {sig.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#2454d6]/20 text-[11px] text-slate-500 italic">
              AI surfaces signals and duplicate clusters. Teams own final decisions.
            </div>
          </div>

          {/* Column 3: TEAM ACTION */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-[#f8fafc] p-6 shadow-2xs">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  Step 03 · Decide & Resolve
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                  <Users className="h-3 w-3" /> Team Action
                </span>
              </div>

              <div className="mt-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                  Recommended Operational Route
                </span>
                <h4 className="text-lg font-bold text-slate-900 mt-1">
                  {currentScenario.operationalOutcome.actionTitle}
                </h4>
                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Pre-Drafted Action Context
                  </span>
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                    {currentScenario.operationalOutcome.contextSummary}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-2 border-t border-slate-200/80 pt-4 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Routed Queue</span>
                  <strong className="text-slate-800">
                    {currentScenario.operationalOutcome.routingTarget}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Escalation Status</span>
                  <span className="font-mono font-bold text-amber-700">
                    {currentScenario.operationalOutcome.escalationLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Decision Authority</span>
                  <strong className="text-slate-800">Authorised Staff Officer</strong>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Ready for Team Follow-up
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
