"use client";

import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Database,
  Eye,
  Key,
  Layers,
  LayoutDashboard,
  Lock,
  MessageSquare,
  Shield,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";

type RoleKey = "agent" | "manager" | "executive" | "admin";

interface RoleConfig {
  key: RoleKey;
  label: string;
  badge: string;
  tagline: string;
  description: string;
  focusAreas: string[];
  kpis: { label: string; value: string; detail: string }[];
  primaryActions: string[];
}

const roleConfigs: Record<RoleKey, RoleConfig> = {
  agent: {
    key: "agent",
    label: "Triage Operator / Agent",
    badge: "Operations Frontline",
    tagline: "Focused triage queues, rich customer context, rapid assignment.",
    description: "Built for speed and clarity. Agents scan incoming complaints, review AI suggestions, inspect customer history, and record verified resolutions.",
    focusAreas: ["My Queue", "Assigned Complaints", "Priority Issues", "Customer Context", "Resolution Actions"],
    kpis: [
      { label: "My Active Queue", value: "7", detail: "2 approaching SLA" },
      { label: "Avg First Response", value: "14m", detail: "Target < 30m" },
      { label: "Resolved Today", value: "19", detail: "100% human sign-off" },
      { label: "Duplicate Matches", value: "4", detail: "Linked to master tickets" },
    ],
    primaryActions: [
      "Review AI-suggested category & sentiment",
      "Assign complaint to specialised team member",
      "Post verified resolution note with customer update",
      "Link repetitive complaints into master issue",
    ],
  },
  manager: {
    key: "manager",
    label: "Complaint Operations Manager",
    badge: "Operational Oversight",
    tagline: "Bottleneck detection, team workload balancing, recurring issue clusters.",
    description: "Managers track capacity, monitor SLA breaches before they escalate, identify recurring problem clusters, and evaluate queue throughput.",
    focusAreas: ["Overview", "Complaint Queue", "Team Workload", "Analytics", "Recurring Issues", "SLA Performance"],
    kpis: [
      { label: "Unassigned Queue", value: "12", detail: "Oldest: 42 mins" },
      { label: "Team SLA Adherence", value: "97.8%", detail: "+1.4% this week" },
      { label: "Recurring Clusters", value: "6", detail: "Top: Double billing" },
      { label: "Active Shift Operators", value: "18", detail: "88% avg load" },
    ],
    primaryActions: [
      "Rebalance queue load across operational shifts",
      "Escalate complaints nearing SLA breach threshold",
      "Investigate root cause on recurring issue clusters",
      "Generate weekly compliance and throughput summary",
    ],
  },
  executive: {
    key: "executive",
    label: "Executive & CX Leadership",
    badge: "Strategic Impact",
    tagline: "Business risk signals, complaint velocity, customer retention impact.",
    description: "Executives need high-level operational intelligence without drowning in individual tickets: risk indicators, financial exposure, and CX health.",
    focusAreas: ["Business Overview", "Complaint Trends", "Risk Signals", "Operational Performance", "Customer Experience"],
    kpis: [
      { label: "Monthly Dispute Vol.", value: "1,284", detail: "-6.2% vs previous quarter" },
      { label: "Dispute Resolution Time", value: "18.4h", detail: "Down from 31.0h" },
      { label: "High-Risk Exposure", value: "4", detail: "All under active management" },
      { label: "Customer Retention Score", value: "94.1%", detail: "+3.8pts post-resolution" },
    ],
    primaryActions: [
      "Review cross-department dispute heatmaps",
      "Evaluate financial impact of recurring billing disputes",
      "Track compliance posture and regulatory response time",
      "Allocate operational resources based on trend forecasts",
    ],
  },
  admin: {
    key: "admin",
    label: "Platform Admin & Governance",
    badge: "Security & Control",
    tagline: "Multi-tenant RBAC, immutable audit logging, data retention, API security.",
    description: "Platform administrators manage role permissions, monitor tamper-evident audit trails, set AI confidence thresholds, and configure enterprise integrations.",
    focusAreas: ["Workspace Settings", "User Management", "Roles & Permissions", "Integrations", "Security", "Audit Logs"],
    kpis: [
      { label: "Active Enterprise Users", value: "64", detail: "Enforced 2FA" },
      { label: "Audit Trail Records", value: "48.2k", detail: "100% immutable hash verified" },
      { label: "Configured Connectors", value: "7", detail: "CRM, Helpdesk, Webhooks" },
      { label: "AI Governance Rules", value: "12", detail: "Human sign-off mandatory" },
    ],
    primaryActions: [
      "Define granular role-based access permissions",
      "Export immutable audit logs for compliance reviews",
      "Configure automated data retention and PII redaction",
      "Rotate API credentials and inspect webhook deliveries",
    ],
  },
};

export function RoleMatrixView() {
  const [activeRole, setActiveRole] = useState<RoleKey>("agent");
  const config = roleConfigs[activeRole];

  return (
    <section id="roles" className="section bg-[#f8fafc] border-b border-slate-200">
      <div className="container-x">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="eyebrow">
            <span className="status-dot" />
            Tailored Enterprise Experiences
          </div>
          <h2 className="heading-xl mt-4 text-[#101d30]">
            Different roles. Different priorities.
            <br />
            <span className="text-[#2454d6]">One unified workspace.</span>
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            BCIP doesn&apos;t force every user into the same dashboard. Frontline operators get focused triage queues,
            managers get bottleneck visibility, executives see business risk signals, and admins maintain strict governance.
          </p>
        </div>

        {/* Role Tabs Switcher */}
        <div className="mt-10 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {(["agent", "manager", "executive", "admin"] as RoleKey[]).map((role) => {
            const isCurrent = activeRole === role;
            const item = roleConfigs[role];
            return (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 ${
                  isCurrent
                    ? "bg-[#2454d6] text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`rounded px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase ${
                    isCurrent ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Role Preview Card */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
            {/* Left: Role Description & Navigation Modules */}
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-[#2454d6]">
                  {config.badge}
                </span>
                <span className="text-xs font-mono text-slate-400">Persona Profile</span>
              </div>

              <h3 className="mt-4 text-2xl font-bold text-slate-900 leading-snug">
                {config.tagline}
              </h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                {config.description}
              </p>

              {/* Modules dedicated to this persona */}
              <div className="mt-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Dedicated Workspace Navigation Modules
                </span>
                <div className="flex flex-wrap gap-2">
                  {config.focusAreas.map((area) => (
                    <span
                      key={area}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Primary Actions taken by persona */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  Everyday Operational Actions
                </span>
                <div className="space-y-2">
                  {config.primaryActions.map((action, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2454d6]" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Persona KPI Metric Grid */}
            <div className="rounded-xl border border-slate-200 bg-[#f8fafc] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-[#2454d6]" /> Key Performance Metrics
                </span>
                <span className="text-[10px] font-mono text-slate-400">Real-time telemetry</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {config.kpis.map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs"
                  >
                    <span className="text-[10px] font-semibold text-slate-500 block uppercase tracking-wide">
                      {kpi.label}
                    </span>
                    <div className="mt-1 text-xl font-bold font-mono text-slate-900">
                      {kpi.value}
                    </div>
                    <div className="mt-1 text-[10px] font-medium text-emerald-600">
                      {kpi.detail}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-blue-100 bg-[#edf2ff] p-3 text-xs text-slate-700">
                <p className="font-semibold text-[#2454d6]">Role Governance Principle</p>
                <p className="mt-1 text-[11px] text-slate-600 leading-snug">
                  Role assignments and access scopes are bound to organization-wide SSO and directory groups.
                  Users only access data relevant to their operational responsibility.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
