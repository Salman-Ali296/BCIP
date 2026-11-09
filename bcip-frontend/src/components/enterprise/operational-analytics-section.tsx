"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart2,
  BarChart3,
  CheckCircle2,
  Clock,
  Compass,
  FileSearch,
  Filter,
  HelpCircle,
  Layers,
  LineChart,
  PieChart,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

type QuestionKey = "categories" | "resolution" | "recurring" | "workload";

export function OperationalAnalyticsSection() {
  const [activeQuestion, setActiveQuestion] = useState<QuestionKey>("categories");

  return (
    <section id="analytics" className="section bg-white border-b border-slate-200">
      <div className="container-x">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="eyebrow">
            <span className="status-dot" />
            Decision-Grade Analytics
          </div>
          <h2 className="heading-xl mt-4 text-[#101d30]">
            Analytics that answer
            <br />
            <span className="text-[#2454d6]">real business questions.</span>
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Enterprise leaders don&apos;t need decorative charts. BCIP provides structured operational answers
            to the core questions that determine customer retention, staff capacity, and dispute risk.
          </p>
        </div>

        {/* 4 Real Question Tabs */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: "categories",
              question: "Which complaint categories are increasing?",
              subtitle: "Detect shifting dispute volumes before they spike",
              icon: TrendingUp,
            },
            {
              id: "resolution",
              question: "Where are resolution times slowing down?",
              subtitle: "Pinpoint operational triage bottlenecks",
              icon: Clock,
            },
            {
              id: "recurring",
              question: "Which issues are recurring across customers?",
              subtitle: "Surface multi-customer defect patterns",
              icon: FileSearch,
            },
            {
              id: "workload",
              question: "Which teams have the highest workload?",
              subtitle: "Rebalance staff and queue allocation",
              icon: Users,
            },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeQuestion === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveQuestion(item.id as QuestionKey)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-[#2454d6] bg-[#edf2ff] shadow-sm ring-1 ring-[#2454d6]/20"
                    : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300"
                }`}
              >
                <div
                  className={`grid h-8 w-8 place-items-center rounded-lg ${
                    isSelected ? "bg-[#2454d6] text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="mt-3 text-xs font-bold text-slate-900 leading-snug">
                  {item.question}
                </h3>
                <p className="mt-1 text-[11px] text-slate-500">{item.subtitle}</p>
              </button>
            );
          })}
        </div>

        {/* Dynamic Question Detail Visualizer */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-[#f8fafc] p-6 sm:p-8">
          {activeQuestion === "categories" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Category Velocity & Shifting Trends (Past 30 Days)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Surfacing +14% surge in Billing & Payment disputes following checkout gateway migration.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-[#2454d6] bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                  Total Captured: 1,284 Complaints
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    name: "Billing & Invoicing",
                    count: "436 cases",
                    delta: "+14.2%",
                    increasing: true,
                    insight: "Driven by duplicate batch debits on renewal dates.",
                  },
                  {
                    name: "Order & Dispatch",
                    count: "348 cases",
                    delta: "-3.1%",
                    increasing: false,
                    insight: "Delivery courier handoffs stabilized post-weekend.",
                  },
                  {
                    name: "Account & 2FA Auth",
                    count: "269 cases",
                    delta: "+8.4%",
                    increasing: true,
                    insight: "International SMS gateway latency during peak hours.",
                  },
                  {
                    name: "Platform & Reports",
                    count: "231 cases",
                    delta: "-1.2%",
                    increasing: false,
                    insight: "Standard performance queries, within SLA bounds.",
                  },
                ].map((cat) => (
                  <div key={cat.name} className="rounded-xl border border-slate-200 bg-white p-4">
                    <span className="text-xs font-bold text-slate-800">{cat.name}</span>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-xl font-bold font-mono text-slate-900">{cat.count}</span>
                      <span
                        className={`inline-flex items-center text-xs font-bold font-mono ${
                          cat.increasing ? "text-rose-600" : "text-emerald-600"
                        }`}
                      >
                        {cat.increasing ? (
                          <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
                        )}
                        {cat.delta}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500 leading-snug">{cat.insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeQuestion === "resolution" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Resolution Stage Latency & Bottleneck Inspection
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Average overall resolution time: 18.4 hours. Stage 2 (Ledger Verification) accounts for 42% of total latency.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  Target SLA: &lt; 24.0h
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                {[
                  { stage: "1. Intake & AI Triage", time: "12 mins", status: "Optimal", color: "text-emerald-600" },
                  { stage: "2. Queue Assignment", time: "28 mins", status: "Optimal", color: "text-emerald-600" },
                  { stage: "3. Ledger Verification", time: "7.8 hours", status: "Bottleneck", color: "text-rose-600" },
                  { stage: "4. Final Resolution & Note", time: "9.9 hours", status: "Normal", color: "text-slate-700" },
                ].map((st) => (
                  <div key={st.stage} className="rounded-xl border border-slate-200 bg-white p-3.5">
                    <span className="text-slate-500 font-medium">{st.stage}</span>
                    <div className="mt-2 text-lg font-bold font-mono text-slate-900">{st.time}</div>
                    <span className={`inline-block mt-1 font-bold text-[11px] ${st.color}`}>
                      {st.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeQuestion === "recurring" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Top Recurring Semantic Clusters
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Vector cosine similarity (≥0.80) matches scattered tickets expressing the same underlying root cause.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
                  142 Linked Duplicates
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    title: "Checkout 502 Double-Debit Cluster",
                    cases: "84 complaints",
                    similarity: "94% average semantic match",
                    rootCause: "Transient gateway timeout caused customers to retry card submit twice.",
                    action: "Master incident ticket linked; bulk customer resolution draft prepared.",
                  },
                  {
                    title: "ACH Batch Delayed Payout Cluster",
                    cases: "38 complaints",
                    similarity: "89% average semantic match",
                    rootCause: "Banking holiday created 48h settlement delay on weekly transfers.",
                    action: "Proactive status notification dispatched to affected cohort.",
                  },
                  {
                    title: "Rider Package Manifest Mismatch",
                    cases: "20 complaints",
                    similarity: "91% average semantic match",
                    rootCause: "Barcode scanner calibration at regional depot hub #4.",
                    action: "Re-routed to Logistics Dispatch Lead.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{item.title}</span>
                      <span className="rounded bg-purple-50 text-purple-700 font-mono text-xs font-bold px-2 py-0.5">
                        {item.cases}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-slate-600">
                      <strong>Root Cause:</strong> {item.rootCause}
                    </div>
                    <div className="mt-1 text-xs text-emerald-700 font-semibold">
                      <strong>Resolution:</strong> {item.action}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeQuestion === "workload" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Departmental Capacity & Queue Workload
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Real-time active queue distribution across operations teams.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                  4 Active Teams
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { team: "Billing Operations", count: 48, max: 60, pct: 80, status: "High Load" },
                  { team: "Dispatch Logistics", count: 24, max: 50, pct: 48, status: "Normal" },
                  { team: "Identity & SecOps", count: 18, max: 40, pct: 45, status: "Normal" },
                  { team: "Platform Support", count: 12, max: 40, pct: 30, status: "Balanced" },
                ].map((team) => (
                  <div key={team.team} className="rounded-xl border border-slate-200 bg-white p-3.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-900">{team.team}</span>
                      <span className="font-mono text-slate-600">
                        {team.count} active tickets ({team.pct}% capacity)
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          team.pct > 75 ? "bg-amber-500" : "bg-[#2454d6]"
                        }`}
                        style={{ width: `${team.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
