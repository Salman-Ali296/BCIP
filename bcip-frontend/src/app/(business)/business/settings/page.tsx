"use client";

import React, { useState } from "react";
import {
  Bell,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Database,
  Globe,
  Key,
  Layers,
  Lock,
  Mail,
  RefreshCw,
  Save,
  Shield,
  Sliders,
  Sparkles,
  Users,
} from "lucide-react";

type SettingsTab = "general" | "sla" | "ai" | "integrations" | "notifications" | "security";

export default function BusinessSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [savedNotice, setSavedNotice] = useState(false);

  // Form states
  const [workspaceName, setWorkspaceName] = useState("Acme Global Logistics");
  const [inboundEmail, setInboundEmail] = useState("support-inbound@acme-global.com");
  const [timezone, setTimezone] = useState("Asia/Karachi (UTC+05:00)");
  const [firstResponseHours, setFirstResponseHours] = useState("4");
  const [resolutionHours, setResolutionHours] = useState("24");
  const [duplicateThreshold, setDuplicateThreshold] = useState("0.80");
  const [autoEscalateCritical, setAutoEscalateCritical] = useState(true);
  const [aiAssistedDrafts, setAiAssistedDrafts] = useState(true);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText("bcip_live_sk_948f92a10b982ce4771e89");
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Save Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#101d30]">
            Workspace Settings
          </h1>
          <p className="mt-1 text-xs text-[#5e6b7d]">
            Manage organization policies, SLA thresholds, AI triage parameters, and API access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedNotice && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4" /> Changes saved
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#2454d6] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#1b43b4] transition"
          >
            <Save className="h-4 w-4" />
            Save Preferences
          </button>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 gap-1 pb-px text-xs font-semibold">
        {[
          { id: "general", label: "General & Identity", icon: Globe },
          { id: "sla", label: "SLAs & Operations", icon: Clock },
          { id: "ai", label: "AI Governance & Triage", icon: Sparkles },
          { id: "integrations", label: "API Keys & Webhooks", icon: Key },
          { id: "notifications", label: "Alert Routing", icon: Bell },
          { id: "security", label: "Security & Retention", icon: Shield },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as SettingsTab)}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 transition-colors ${
              activeTab === id
                ? "border-[#2454d6] text-[#2454d6]"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="max-w-4xl space-y-6">
        {/* TAB 1: GENERAL */}
        {activeTab === "general" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-sm font-bold text-[#101d30]">Organization Profile</h2>
              <p className="mt-0.5 text-xs text-[#5e6b7d]">
                Basic details identifying your business on complaint receipts and portals.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Workspace Legal Name</label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:border-[#2454d6] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Inbound Support Email</label>
                <input
                  type="email"
                  value={inboundEmail}
                  onChange={(e) => setInboundEmail(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:border-[#2454d6] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Operating Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-[#2454d6] focus:outline-none"
                >
                  <option>Asia/Karachi (UTC+05:00)</option>
                  <option>Europe/London (UTC+00:00)</option>
                  <option>America/New_York (UTC-05:00)</option>
                  <option>Asia/Dubai (UTC+04:00)</option>
                </select>
                <p className="text-[11px] text-slate-500">
                  Used for calculating working-hour SLA targets and escalation countdowns.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SLAs & OPERATIONS */}
        {activeTab === "sla" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-sm font-bold text-[#101d30]">Service Level Agreements (SLAs)</h2>
              <p className="mt-0.5 text-xs text-[#5e6b7d]">
                Define target times for first agent response and full case resolution.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                <span className="text-xs font-bold text-slate-900">First Response Target</span>
                <p className="text-xs text-slate-500">
                  Target duration between complaint capture and first staff communication.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="number"
                    value={firstResponseHours}
                    onChange={(e) => setFirstResponseHours(e.target.value)}
                    className="h-10 w-24 rounded-lg border border-slate-200 px-3 font-mono text-sm text-slate-900 focus:border-[#2454d6] focus:outline-none"
                  />
                  <span className="text-xs font-semibold text-slate-600">Hours</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                <span className="text-xs font-bold text-slate-900">Resolution Target</span>
                <p className="text-xs text-slate-500">
                  Maximum time to investigate and communicate final customer resolution.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="number"
                    value={resolutionHours}
                    onChange={(e) => setResolutionHours(e.target.value)}
                    className="h-10 w-24 rounded-lg border border-slate-200 px-3 font-mono text-sm text-slate-900 focus:border-[#2454d6] focus:outline-none"
                  />
                  <span className="text-xs font-semibold text-slate-600">Hours</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoEscalateCritical}
                  onChange={(e) => setAutoEscalateCritical(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#2454d6]"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-900">
                    Automatically elevate critical issues when 50% of SLA time has elapsed
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Sends proactive notification to operations shift manager.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* TAB 3: AI GOVERNANCE & TRIAGE */}
        {activeTab === "ai" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#2454d6]" />
                <h2 className="text-sm font-bold text-[#101d30]">
                  AI Governance & Triage Thresholds
                </h2>
              </div>
              <p className="mt-0.5 text-xs text-[#5e6b7d]">
                Configure how the NLP engine surfaces signals, detects semantic duplicates, and drafts responses.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-blue-100 bg-[#edf2ff]/30 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Semantic Duplicate Similarity Cutoff (Cosine Threshold)
                  </span>
                  <span className="font-mono text-xs font-bold text-[#2454d6]">
                    {duplicateThreshold}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Complaints with vector similarity equal to or exceeding this threshold are flagged as possible duplicates of a master cluster.
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <input
                    type="range"
                    min="0.70"
                    max="0.95"
                    step="0.05"
                    value={duplicateThreshold}
                    onChange={(e) => setDuplicateThreshold(e.target.value)}
                    className="w-full h-1.5 bg-slate-200 rounded-lg accent-[#2454d6] cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-500 whitespace-nowrap">
                    Recommended: 0.80
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiAssistedDrafts}
                    onChange={(e) => setAiAssistedDrafts(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#2454d6]"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-900">
                      Generate pre-drafted customer responses
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Drafts are provided for operator review and will never be sent to customers automatically.
                    </p>
                  </div>
                </label>
              </div>

              <div className="rounded-xl border border-slate-200 bg-[#fafbfd] p-3 text-[11px] text-slate-600">
                <strong>Human-in-the-loop statement:</strong> In accordance with BCIP governance policies, AI strictly assists with classification and signal detection. All customer commitments, financial adjustments, and final ticket closures require explicit operator confirmation.
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: API & INTEGRATIONS */}
        {activeTab === "integrations" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-sm font-bold text-[#101d30]">REST API & Ingestion Webhooks</h2>
              <p className="mt-0.5 text-xs text-[#5e6b7d]">
                Connect ERP, CRM, and customer portal pipelines directly into BCIP intake.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                <span className="text-xs font-bold text-slate-900 block">Production Secret API Key</span>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    readOnly
                    value="bcip_live_sk_948f92a10b982ce4771e89"
                    className="h-10 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 font-mono text-xs text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={copyApiKey}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {apiKeyCopied ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Authenticate REST calls using HTTP Bearer token.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                <span className="text-xs font-bold text-slate-900 block">Inbound Webhook Endpoint</span>
                <p className="font-mono text-xs text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  https://api.bcip.io/v1/tenants/acme-global/complaints/webhook
                </p>
                <p className="text-[11px] text-slate-500">
                  Send JSON payloads with HMAC-SHA256 signature verification.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-sm font-bold text-[#101d30]">Operational Alert Routing</h2>
              <p className="mt-0.5 text-xs text-[#5e6b7d]">
                Configure when team leads and agents receive escalation notifications.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { title: "Critical Priority Complaint Intake", desc: "Immediate alert when AI flags work-stopping or high-financial impact issue." },
                { title: "SLA 1-Hour Breach Warning", desc: "Notify assigned team when resolution target is approaching threshold." },
                { title: "Semantic Duplicate Spike Warning", desc: "Notify lead when ≥3 similar complaints are detected within a 1-hour window." },
                { title: "Daily Operational Summary", desc: "Morning briefing with open queue volume, resolution rates, and top categories." },
              ].map((item, idx) => (
                <label key={idx} className="flex items-start gap-3 rounded-xl border border-slate-100 p-3.5 hover:bg-slate-50 transition cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#2454d6]"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{item.title}</span>
                    <span className="text-[11px] text-slate-500">{item.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SECURITY & RETENTION */}
        {activeTab === "security" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-sm font-bold text-[#101d30]">Security, Auditing & Data Retention</h2>
              <p className="mt-0.5 text-xs text-[#5e6b7d]">
                Strict tenant isolation, immutable activity logging, and retention rules.
              </p>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                <span className="font-bold text-slate-900 block">Complaint Data Retention</span>
                <p className="text-slate-600">
                  Historical resolved complaints are archived for auditing and compliance according to your plan policy.
                </p>
                <span className="inline-block rounded bg-slate-100 px-2.5 py-1 font-mono font-semibold text-slate-800">
                  Standard Retention: 36 Months
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                <span className="font-bold text-slate-900 block">Audit Logging & RBAC Enforcement</span>
                <p className="text-slate-600">
                  Every status update, staff note, assignment change, and AI recommendation interaction is permanently recorded in an immutable tenant log.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}