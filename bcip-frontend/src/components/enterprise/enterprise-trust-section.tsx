"use client";

import React, { useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  Database,
  Eye,
  FileCheck,
  Key,
  Layers,
  Lock,
  Server,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

type GovernanceTab = "rbac" | "audit" | "retention" | "ai-gov";

export function EnterpriseTrustSection() {
  const [activeTab, setActiveTab] = useState<GovernanceTab>("rbac");

  return (
    <section id="trust" className="section bg-[#f8fafc] border-b border-slate-200">
      <div className="container-x">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="eyebrow">
            <span className="status-dot" />
            Governance & Enterprise Trust
          </div>
          <h2 className="heading-xl mt-4 text-[#101d30]">
            Built for teams accountable
            <br />
            <span className="text-[#2454d6]">for customer outcomes.</span>
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            BCIP provides rigorous operational boundaries: multi-tenant PostgreSQL data separation,
            immutable audit trails, granular role-based permissions, and transparent human-in-the-loop AI governance.
          </p>
        </div>

        {/* 6 Enterprise Trust Pillars (Section 12) */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              title: "Role-Based Access Control",
              description:
                "Control who can view, triage, assign, and resolve customer complaints with fine-grained department and team scopes.",
              icon: Users,
            },
            {
              title: "Tamper-Evident Audit Trails",
              description:
                "Every status change, staff note, assignment handoff, and AI suggestion is stamped with an immutable timestamp and actor identity.",
              icon: Clock,
            },
            {
              title: "Data Protection & Retention",
              description:
                "Tenant isolation at the persistence layer, custom data retention lifecycles, and automated PII redaction on customer inputs.",
              icon: ShieldCheck,
            },
            {
              title: "Human-in-the-Loop Oversight",
              description:
                "AI never executes autonomous customer promises. Intelligent suggestions surface signal while staff officers approve decisions.",
              icon: Sparkles,
            },
            {
              title: "Scalable Operations Workflows",
              description:
                "Engineered to support surging complaint volumes, multi-department hierarchies, and high-concurrency triage queues.",
              icon: Layers,
            },
            {
              title: "Enterprise System Integration",
              description:
                "Connect seamlessly with CRMs, helpdesks, and transactional data sources through standard REST endpoints and authenticated webhooks.",
              icon: Database,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-slate-300 transition"
              >
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#2454d6]/10 text-[#2454d6]">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.description}</p>
              </div>
            );
          })}
        </div>

        {/* Interactive Governance Console Preview (Section 14) */}
        <div className="mt-14 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Security & Governance Console
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Operational Control Architecture
              </h3>
            </div>

            {/* Sub-tabs */}
            <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
              {[
                { id: "rbac", label: "Access Control (RBAC)" },
                { id: "audit", label: "Audit Trails" },
                { id: "retention", label: "Data Retention" },
                { id: "ai-gov", label: "AI Governance" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as GovernanceTab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === tab.id
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Console Tab Content */}
          <div className="mt-6">
            {activeTab === "rbac" && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600">
                  Granular permission matrix enforced on Express API endpoints with tenant middleware isolation:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                    <thead className="bg-slate-50 text-[10px] font-mono uppercase text-slate-500">
                      <tr className="border-b border-slate-200">
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3">View Queue</th>
                        <th className="py-2.5 px-3">Assign & Re-route</th>
                        <th className="py-2.5 px-3">Resolve & Refund</th>
                        <th className="py-2.5 px-3">AI Model Config</th>
                        <th className="py-2.5 px-3">Audit Log Access</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-900">Frontline Agent</td>
                        <td className="py-2.5 px-3 text-emerald-600 font-bold">Assigned only</td>
                        <td className="py-2.5 px-3 text-slate-400">Restricted</td>
                        <td className="py-2.5 px-3 text-slate-400">Escalate only</td>
                        <td className="py-2.5 px-3 text-slate-400">No</td>
                        <td className="py-2.5 px-3 text-slate-400">No</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-900">Shift Supervisor</td>
                        <td className="py-2.5 px-3 text-emerald-600 font-bold">Full team queue</td>
                        <td className="py-2.5 px-3 text-emerald-600 font-bold">Allowed</td>
                        <td className="py-2.5 px-3 text-emerald-600 font-bold">Approved limits</td>
                        <td className="py-2.5 px-3 text-slate-400">Read only</td>
                        <td className="py-2.5 px-3 text-emerald-600 font-bold">Team history</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-900">Operations Manager</td>
                        <td className="py-2.5 px-3 text-emerald-600 font-bold">All queues</td>
                        <td className="py-2.5 px-3 text-emerald-600 font-bold">Allowed</td>
                        <td className="py-2.5 px-3 text-emerald-600 font-bold">Full authority</td>
                        <td className="py-2.5 px-3 text-emerald-600 font-bold">Adjust thresholds</td>
                        <td className="py-2.5 px-3 text-emerald-600 font-bold">Full export</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-900">Security Officer</td>
                        <td className="py-2.5 px-3 text-slate-400">Metadata only</td>
                        <td className="py-2.5 px-3 text-slate-400">Security holds</td>
                        <td className="py-2.5 px-3 text-slate-400">No</td>
                        <td className="py-2.5 px-3 text-emerald-600 font-bold">Enforce policies</td>
                        <td className="py-2.5 px-3 text-emerald-600 font-bold">Cryptographic export</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "audit" && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Every interaction is permanently journaled with actor identity, action type, and cryptographic record hash:
                </p>
                <div className="rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-[11px] text-slate-300 space-y-2">
                  <div className="text-emerald-400">
                    [2026-10-06 14:12:08.412 UTC] COMPLAINT_CAPTURED :: ID=BC-10482 :: SOURCE=PORTAL_WEB :: HASH=8a3f9e2b
                  </div>
                  <div className="text-blue-400">
                    [2026-10-06 14:12:09.118 UTC] AI_ANALYSIS_COMPLETE :: CATEGORY=Billing :: CONFIDENCE=0.92 :: SIGNALS=[PossibleDuplicate, HighUrgency]
                  </div>
                  <div className="text-amber-400">
                    [2026-10-06 14:15:32.091 UTC] ROUTED_QUEUE :: QUEUE=Billing_Operations :: ASSIGNED_BY=RULE_4
                  </div>
                  <div className="text-slate-300">
                    [2026-10-06 14:28:44.209 UTC] OPERATOR_NOTE :: ACTOR=tariq.m@vanguard.com :: MESSAGE=&quot;Payment batch #8841 verified&quot;
                  </div>
                </div>
              </div>
            )}

            {activeTab === "retention" && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600">
                  Automated complaint archival, cryptographic hashing, and automated customer PII scrubbers:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Active Working State</span>
                    <div className="text-sm font-bold text-slate-900 mt-1">90 Days Hot Storage</div>
                    <p className="text-[11px] text-slate-600 mt-1">Full verbatim text & immediate search indexes.</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Compliance Archive</span>
                    <div className="text-sm font-bold text-slate-900 mt-1">7 Years Cold Archive</div>
                    <p className="text-[11px] text-slate-600 mt-1">Tamper-evident compressed immutable logs.</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                    <span className="text-[10px] font-bold uppercase text-slate-500">PII Scrubbing Policy</span>
                    <div className="text-sm font-bold text-slate-900 mt-1">Automated Redaction</div>
                    <p className="text-[11px] text-slate-600 mt-1">Redacts credit card numbers & SSNs prior to AI ingestion.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ai-gov" && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Predictable, transparent AI model guardrails. Never black-box autonomous actions:
                </p>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span><strong>Explainable Signals:</strong> Every classification displays confidence % and reasoning signals.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span><strong>Human Decision Barrier:</strong> AI suggestions cannot dispatch external customer emails without staff review.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span><strong>Continuous Calibration:</strong> Operator feedback (&quot;Dismiss Signal&quot; or manual overrides) refines model accuracy.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
