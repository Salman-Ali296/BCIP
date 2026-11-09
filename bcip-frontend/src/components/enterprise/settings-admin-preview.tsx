"use client";

import React, { useState } from "react";
import {
  Bell,
  CheckCircle2,
  Cpu,
  Database,
  FileText,
  Key,
  Layers,
  Lock,
  Save,
  Server,
  Settings,
  Shield,
  Sliders,
  Users,
} from "lucide-react";
import { useToast } from "./toast-system";

type SettingsNav =
  | "workspace"
  | "teams"
  | "ai-config"
  | "sla-rules"
  | "api-keys"
  | "retention";

export function SettingsAdminPreview() {
  const [activeNav, setActiveNav] = useState<SettingsNav>("ai-config");
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [slaEscalationHours, setSlaEscalationHours] = useState(2);
  const [humanApprovalRequired, setHumanApprovalRequired] = useState(true);
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Enterprise policy updated and published across workspace.",
      variant: "success",
    });
  };

  return (
    <section id="settings-preview" className="section bg-white border-b border-slate-200">
      <div className="container-x">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="eyebrow">
            <span className="status-dot" />
            Operational Administration
          </div>
          <h2 className="heading-xl mt-4 text-[#101d30]">
            Enterprise-grade configuration
            <br />
            <span className="text-[#2454d6]">and policy control.</span>
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            BCIP provides granular administrative controls for AI thresholds, department queues,
            SLA breach escalations, API keys, and compliance retention policies.
          </p>
        </div>

        {/* Administration Workbench Preview */}
        <div className="mt-12 rounded-2xl border border-slate-200 bg-[#f8fafc] overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr]">
            {/* Settings Sidebar */}
            <div className="border-b lg:border-b-0 lg:border-r border-slate-200 bg-white p-4 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block px-2 mb-2">
                Settings Navigation
              </span>
              {[
                { id: "workspace", label: "Workspace & Profile", icon: Settings },
                { id: "teams", label: "Teams & Routing", icon: Users },
                { id: "ai-config", label: "AI Governance & Confidence", icon: Cpu },
                { id: "sla-rules", label: "SLA Escalation Rules", icon: Sliders },
                { id: "api-keys", label: "API Keys & Webhooks", icon: Key },
                { id: "retention", label: "Data Retention & Legal", icon: Database },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveNav(item.id as SettingsNav)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      isSelected
                        ? "bg-[#2454d6] text-white shadow-2xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Settings Main Content Area */}
            <div className="p-6 sm:p-8 bg-white min-h-[380px] flex flex-col justify-between">
              {activeNav === "ai-config" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      AI Model Confidence & Human-in-the-Loop Rules
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Configure when AI signals are surfaced to agents and enforce mandatory human approval for resolutions.
                    </p>
                  </div>

                  {/* Confidence Slider */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Minimum Confidence Score Threshold
                        </span>
                        <span className="text-[11px] text-slate-500">
                          AI categorisation below this threshold will be flagged as &quot;Needs Human Review&quot;.
                        </span>
                      </div>
                      <span className="font-mono text-sm font-bold text-[#2454d6] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        {confidenceThreshold}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min={70}
                      max={98}
                      value={confidenceThreshold}
                      onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                      className="w-full accent-[#2454d6] cursor-pointer"
                    />

                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>70% (Broader matching)</span>
                      <span>85% (Recommended)</span>
                      <span>98% (Strict precision)</span>
                    </div>
                  </div>

                  {/* Mandatory Human Approval Toggle */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Mandatory Human Sign-off on Resolutions
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Never permit automated closure without verified staff sign-off.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={humanApprovalRequired}
                      onChange={(e) => setHumanApprovalRequired(e.target.checked)}
                      className="h-4 w-4 accent-[#2454d6] rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {activeNav === "sla-rules" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      SLA Escalation & Breach Warnings
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Automatically alert team supervisors when high-priority disputes approach their target deadline.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Pre-Breach Warning Window
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Trigger urgent dashboard notifications before critical SLA expires.
                        </span>
                      </div>
                      <span className="font-mono text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                        {slaEscalationHours} hours prior
                      </span>
                    </div>

                    <input
                      type="range"
                      min={1}
                      max={6}
                      value={slaEscalationHours}
                      onChange={(e) => setSlaEscalationHours(Number(e.target.value))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {activeNav === "workspace" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Workspace Details</h3>
                    <p className="text-xs text-slate-600 mt-1">Tenant identity and localized default routing.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-500 font-medium block">Organization Name</label>
                      <input
                        type="text"
                        defaultValue="Acme Global Operations"
                        className="mt-1 w-full rounded-lg border border-slate-200 p-2 font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 font-medium block">Primary Operations Timezone</label>
                      <input
                        type="text"
                        defaultValue="UTC+05:00 (Asia/Karachi)"
                        className="mt-1 w-full rounded-lg border border-slate-200 p-2 font-semibold text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeNav === "teams" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Operational Queues & Routing</h3>
                    <p className="text-xs text-slate-600 mt-1">Department assignment policies for intake.</p>
                  </div>
                  <div className="space-y-2 text-xs">
                    {[
                      { name: "Billing Operations", lead: "Tariq Mahmood", members: 8 },
                      { name: "Tier 2 Support", lead: "Sara Connor", members: 12 },
                      { name: "Dispatch Logistics", lead: "Kashif Niaz", members: 6 },
                      { name: "Identity & SecOps", lead: "Hamza Farooq", members: 4 },
                    ].map((t) => (
                      <div key={t.name} className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 bg-slate-50">
                        <div>
                          <strong className="text-slate-900">{t.name}</strong>
                          <span className="text-slate-500 ml-2">Lead: {t.lead}</span>
                        </div>
                        <span className="rounded bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700 border border-slate-200">
                          {t.members} operators
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeNav === "api-keys" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">API Credentials & Inbound Webhooks</h3>
                    <p className="text-xs text-slate-600 mt-1">Authenticate ERP and external CRM connectors.</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3 bg-slate-50 flex items-center justify-between font-mono text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">PRODUCTION_API_KEY</span>
                      <span className="text-slate-800 font-bold">bcip_live_sk_8923a109f***</span>
                    </div>
                    <span className="rounded bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                      Active
                    </span>
                  </div>
                </div>
              )}

              {activeNav === "retention" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Data Lifecycle & PII Scrubbing</h3>
                    <p className="text-xs text-slate-600 mt-1">Compliance policies for customer complaint records.</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3 bg-slate-50 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span>PII Masking at Ingestion</span>
                      <strong className="text-emerald-700">Enabled</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Encrypted Database Backups</span>
                      <strong className="text-emerald-700">Daily Automated</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Bar */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Changes take effect immediately across all active tenant sessions.
                </span>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#2454d6] px-4 py-2 text-xs font-bold text-white hover:bg-[#1b43b4] transition"
                >
                  <Save className="h-3.5 w-3.5" /> Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
