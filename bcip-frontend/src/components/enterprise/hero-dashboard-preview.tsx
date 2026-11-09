"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  FileSearch,
  Filter,
  Layers,
  LayoutDashboard,
  MoreHorizontal,
  Radar,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useToast } from "./toast-system";

interface ComplaintRecord {
  id: string;
  customer: string;
  summary: string;
  category: "Billing" | "Service" | "Account Access" | "Logistics";
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Needs Review" | "In Progress" | "Investigating" | "Resolved";
  assignedTeam: string;
  slaRemaining: string;
  slaUrgent: boolean;
  aiConfidence: number;
  aiSignals: string[];
  recommendedAction: string;
}

const sampleComplaints: ComplaintRecord[] = [
  {
    id: "BC-10482",
    customer: "Global Logistics Ltd (ID: #4092)",
    summary: "Charged twice for the same transaction via automated ACH payout batch.",
    category: "Billing",
    priority: "High",
    status: "Needs Review",
    assignedTeam: "Billing Operations",
    slaRemaining: "02h 18m",
    slaUrgent: true,
    aiConfidence: 92,
    aiSignals: ["Possible duplicate", "High urgency", "Billing related", "Similar complaints detected"],
    recommendedAction: "Review recent billing complaints from the same customer segment.",
  },
  {
    id: "BC-10485",
    customer: "Apex Retailers (ID: #8812)",
    summary: "Payment debit confirmed but warehouse dispatch order flagged as cancelled.",
    category: "Billing",
    priority: "Critical",
    status: "Investigating",
    assignedTeam: "Tier 2 Support",
    slaRemaining: "00h 45m",
    slaUrgent: true,
    aiConfidence: 96,
    aiSignals: ["Checkout mismatch", "High urgency", "Payment gateway 502", "Customer VIP"],
    recommendedAction: "Reconcile payment ledger and trigger manual dispatch release.",
  },
  {
    id: "BC-10479",
    customer: "Horizon Media (ID: #2190)",
    summary: "Refund not credited to account after 14 business days of return receipt.",
    category: "Billing",
    priority: "High",
    status: "Needs Review",
    assignedTeam: "Finance Operations",
    slaRemaining: "01h 12m",
    slaUrgent: false,
    aiConfidence: 89,
    aiSignals: ["SLA threshold warning", "Recurring dispute pattern", "Urgent tone detected"],
    recommendedAction: "Verify Stripe batch payout state and issue proactive customer update.",
  },
  {
    id: "BC-10471",
    customer: "Northwind Trading (ID: #5541)",
    summary: "Enterprise admin 2FA verification SMS timing out repeatedly on roaming.",
    category: "Account Access",
    priority: "Medium",
    status: "In Progress",
    assignedTeam: "Identity Ops",
    slaRemaining: "05h 40m",
    slaUrgent: false,
    aiConfidence: 94,
    aiSignals: ["Authentication roadblock", "Security policy match", "Low negative sentiment"],
    recommendedAction: "Switch admin profile to hardware token or authenticator app authentication.",
  },
];

export function HeroDashboardPreview() {
  const [viewMode, setViewMode] = useState<"interactive" | "visual">("visual");
  const [selectedId, setSelectedId] = useState<string>("BC-10482");
  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D">("30D");
  const [complaintState, setComplaintState] = useState<ComplaintRecord[]>(sampleComplaints);
  const { toast } = useToast();

  const selectedComplaint =
    complaintState.find((c) => c.id === selectedId) || complaintState[0];

  const handleReview = () => {
    toast({
      title: `Review initiated for ${selectedComplaint.id}`,
      description: "Opened case audit logs and ledger transactions.",
      variant: "info",
    });
  };

  const handleAssign = () => {
    toast({
      title: `Assignment updated: ${selectedComplaint.id}`,
      description: `Task assigned to ${selectedComplaint.assignedTeam} with high priority SLA.`,
      variant: "success",
    });
  };

  const handleDismiss = () => {
    toast({
      title: `Signal dismissed: ${selectedComplaint.id}`,
      description: "Human operator marked signal as verified non-duplicate.",
      variant: "warning",
    });
  };

  return (
    <div className="relative rounded-2xl border border-white/20 bg-[#0c1626] p-2.5 shadow-2xl shadow-black/60 sm:p-3.5 text-slate-100">
      {/* Browser Bar / Window Frame */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5 px-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[11px] font-mono text-slate-400 font-semibold ml-2">
            app.bcip.internal/ops-workspace
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex rounded-lg bg-white/10 p-0.5 border border-white/10 text-[10px]">
            <button
              onClick={() => setViewMode("visual")}
              className={`px-2 py-0.5 rounded font-semibold transition flex items-center gap-1 ${viewMode === "visual"
                ? "bg-[#2454d6] text-white shadow-xs"
                : "text-slate-400 hover:text-white"
                }`}
            >
              <Radar className="h-2.5 w-2.5" />
              AI Radar View
            </button>
            <button
              onClick={() => setViewMode("interactive")}
              className={`px-2 py-0.5 rounded font-semibold transition ${viewMode === "interactive"
                ? "bg-[#2454d6] text-white shadow-xs"
                : "text-slate-400 hover:text-white"
                }`}
            >
              Live Simulator
            </button>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Queue
          </span>
        </div>
      </div>

      {viewMode === "visual" ? (
        <div className="relative mt-2 overflow-hidden rounded-xl border border-white/10 bg-[#08101e]">
          <div className="relative aspect-[16/9] w-full">
            <Image
              src="/images/triage-dashboard-preview.jpg"
              alt="BCIP AI Complaint Operations and Triage Radar"
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover object-top"
              priority
            />
            {/* Ambient vignette and overlay labels */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

            {/* Top Floating Signal Badges */}
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-wrap gap-1.5 sm:gap-2">
              <span className="rounded-lg bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-lg">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                96% AI Confidence
              </span>
              <span className="rounded-lg bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold text-blue-300 border border-blue-500/30 shadow-lg">
                Vector Cosine Radar Active
              </span>
            </div>

            {/* Bottom Interactive Bar */}
            <div className="absolute bottom-2 sm:bottom-3 inset-x-2 sm:inset-x-3 flex items-center justify-between gap-2 bg-slate-950/85 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-white/15 shadow-xl">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-white text-[11px] sm:text-xs">
                  Operational Radar View
                </span>
                <span className="text-slate-400 text-[10px] sm:text-[11px] hidden sm:inline">
                  · 1,345 Complaints Ingested · SLA Countdown: 01h 14m
                </span>
              </div>
              <button
                onClick={() => setViewMode("interactive")}
                className="rounded-lg bg-[#2454d6] hover:bg-[#1b43b4] text-white px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold transition flex items-center gap-1 shadow-md"
              >
                Launch Simulator →
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Main App Grid: Sidebar + Operational Body */
        <div className="grid grid-cols-1 lg:grid-cols-[165px_1fr] gap-3 pt-3">
          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col justify-between border-r border-white/10 pr-3">
            <div className="space-y-4">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block px-2">
                  Workspace
                </span>
                <nav className="mt-2 space-y-0.5" aria-label="Hero workspace sidebar">
                  {[
                    { name: "Overview", icon: LayoutDashboard },
                    { name: "Complaints", icon: AlertTriangle, badge: "86" },
                    { name: "Priorities", icon: Zap },
                    { name: "Analytics", icon: BarChart3 },
                    { name: "Teams", icon: Users },
                    { name: "Integrations", icon: Layers },
                    { name: "Settings", icon: Settings },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.name;
                    return (
                      <button
                        key={item.name}
                        onClick={() => setActiveTab(item.name)}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${isActive
                          ? "bg-[#2454d6] text-white shadow-sm"
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                          }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5" />
                          {item.name}
                        </span>
                        {item.badge && (
                          <span
                            className={`rounded px-1.5 py-0.2 text-[9px] font-mono font-bold ${isActive
                              ? "bg-white/20 text-white"
                              : "bg-rose-500/20 text-rose-300"
                              }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-left">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                  SLA Compliance
                </span>
                <div className="mt-1.5 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-emerald-400 font-mono">98.4%</span>
                  <span className="text-[10px] text-slate-400">Target: 95%</span>
                </div>
                <div className="mt-1 h-1 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full w-[98.4%]" />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center gap-2 px-1">
                <div className="h-6 w-6 rounded-full bg-blue-600 text-[10px] font-bold grid place-items-center text-white">
                  EA
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-[11px] font-bold truncate text-slate-200">Elena Archer</p>
                  <p className="text-[9px] text-slate-400 truncate">Ops Lead</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Dashboard Content */}
          <div className="min-w-0 space-y-3">
            {/* Header & Filter Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Operational Queue & Intelligence
                  <span className="text-[10px] font-normal text-slate-400">
                    (Real-time stream)
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                {(["7D", "30D", "90D"] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-bold transition ${timeRange === range
                      ? "bg-white/20 text-white"
                      : "text-slate-400 hover:text-white"
                      }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 7 Top KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                {
                  label: "Total Complaints",
                  value: "1,284",
                  change: "+4.2% vs last month",
                  subtext: "18 new today",
                  border: "border-blue-500/20",
                },
                {
                  label: "High Priority",
                  value: "86",
                  change: "Needs review",
                  subtext: "14 approaching SLA",
                  border: "border-amber-500/30",
                  badgeColor: "text-amber-400 bg-amber-950/40",
                },
                {
                  label: "AI-Detected Duplicates",
                  value: "142",
                  change: "Potential links",
                  subtext: "Linked to master cases",
                  border: "border-purple-500/20",
                },
                {
                  label: "Avg. Resolution Time",
                  value: "18.4h",
                  change: "-2.1h reduction",
                  subtext: "Target < 24.0h",
                  border: "border-emerald-500/20",
                },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className={`rounded-xl border ${kpi.border} bg-white/[0.04] p-2.5 text-left transition hover:bg-white/[0.06]`}
                >
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">
                    {kpi.label}
                  </span>
                  <div className="mt-1 text-lg sm:text-xl font-bold font-mono tracking-tight text-white">
                    {kpi.value}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[9px]">
                    <span className="text-emerald-400 font-semibold">{kpi.change}</span>
                    <span className="text-slate-500 hidden sm:inline">{kpi.subtext}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row: Trend Chart + Category Distribution */}
            <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr] gap-2.5">
              {/* Volume Trend Bar Chart */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-left">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-200">Complaint Volume Velocity</span>
                  <span className="text-[9px] font-mono text-slate-400">Last 7 days · Mon–Sun</span>
                </div>
                <div className="mt-3 grid grid-cols-7 gap-1.5 items-end h-16 pt-2">
                  {[
                    { day: "Mon", count: 24, height: "45%" },
                    { day: "Tue", count: 32, height: "60%" },
                    { day: "Wed", count: 28, height: "52%" },
                    { day: "Thu", count: 41, height: "76%" },
                    { day: "Fri", count: 36, height: "68%" },
                    { day: "Sat", count: 54, height: "94%" },
                    { day: "Sun", count: 46, height: "82%" },
                  ].map((item) => (
                    <div key={item.day} className="flex flex-col items-center gap-1 group">
                      <span className="text-[8px] font-mono text-slate-400 group-hover:text-white transition">
                        {item.count}
                      </span>
                      <div className="w-full bg-white/10 rounded-t h-12 flex items-end">
                        <div
                          className="w-full bg-[#2454d6] group-hover:bg-[#386df6] transition-all rounded-t"
                          style={{ height: item.height }}
                        />
                      </div>
                      <span className="text-[8px] font-mono text-slate-500">{item.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories & Priority Segment */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-left flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-200">Category Distribution</span>
                  <span className="text-[9px] font-mono text-slate-400">Total 1,284</span>
                </div>
                <div className="space-y-1.5 mt-2">
                  {[
                    { name: "Billing & Transactions", pct: 34, color: "bg-[#2454d6]" },
                    { name: "Order & Logistics", pct: 27, color: "bg-emerald-500" },
                    { name: "Account & 2FA Access", pct: 21, color: "bg-indigo-400" },
                    { name: "Platform & Support", pct: 18, color: "bg-slate-400" },
                  ].map((cat) => (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between text-[9px] text-slate-300">
                        <span>{cat.name}</span>
                        <span className="font-mono font-bold">{cat.pct}%</span>
                      </div>
                      <div className="mt-0.5 h-1 w-full rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full ${cat.color}`}
                          style={{ width: `${cat.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Grid: Recent High-Priority Table + Live AI Insight Panel */}
            <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-2.5 text-left">
              {/* Recent Complaints Table */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 overflow-hidden">
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">Recent High-Priority Queue</span>
                    <span className="text-[9px] font-mono rounded bg-white/10 px-1.5 py-0.2 text-slate-300">
                      4 active
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">Click row to inspect AI signals</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-[9px] font-mono uppercase text-slate-400">
                        <th className="py-1.5 pr-2">ID</th>
                        <th className="py-1.5 pr-2">Complaint</th>
                        <th className="py-1.5 pr-2">Priority</th>
                        <th className="py-1.5 pr-2">SLA</th>
                        <th className="py-1.5 text-right">Team</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {complaintState.map((complaint) => {
                        const isSelected = complaint.id === selectedId;
                        return (
                          <tr
                            key={complaint.id}
                            onClick={() => setSelectedId(complaint.id)}
                            className={`cursor-pointer transition-colors ${isSelected
                              ? "bg-[#2454d6]/20 text-white font-semibold"
                              : "hover:bg-white/[0.04] text-slate-300"
                              }`}
                          >
                            <td className="py-2 pr-2 font-mono text-[10px] text-blue-300">
                              {complaint.id}
                            </td>
                            <td className="py-2 pr-2 max-w-[200px] truncate">
                              <span className="block truncate text-slate-200">{complaint.summary}</span>
                              <span className="text-[9px] text-slate-400">{complaint.category}</span>
                            </td>
                            <td className="py-2 pr-2">
                              <span
                                className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold ${complaint.priority === "Critical"
                                  ? "bg-rose-500/20 text-rose-300"
                                  : "bg-amber-500/20 text-amber-300"
                                  }`}
                              >
                                {complaint.priority}
                              </span>
                            </td>
                            <td className="py-2 pr-2 font-mono text-[10px]">
                              <span
                                className={
                                  complaint.slaUrgent
                                    ? "text-amber-400 font-bold"
                                    : "text-slate-400"
                                }
                              >
                                {complaint.slaRemaining}
                              </span>
                            </td>
                            <td className="py-2 text-right text-[10px] text-slate-400">
                              {complaint.assignedTeam}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 9: Live AI Insight Panel */}
              <div className="rounded-xl border border-blue-500/30 bg-[#101e38] p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                      AI Intelligence Signals
                    </div>
                    <span className="rounded-full bg-blue-500/20 border border-blue-400/30 px-2 py-0.5 font-mono text-[9px] font-bold text-blue-300">
                      Confidence: {selectedComplaint.aiConfidence}%
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block">
                      Detected Signals · {selectedComplaint.id}
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {selectedComplaint.aiSignals.map((sig) => (
                        <span
                          key={sig}
                          className="rounded-md bg-white/10 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-200"
                        >
                          {sig}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300 block">
                      AI Recommended Action
                    </span>
                    <p className="mt-1 text-xs text-slate-200 leading-relaxed">
                      “{selectedComplaint.recommendedAction}”
                    </p>
                    <p className="mt-1.5 text-[9px] text-slate-400 italic">
                      AI assists with triage context. Human teams retain authority over customer actions.
                    </p>
                  </div>
                </div>

                {/* Action Buttons: Review, Assign, Dismiss */}
                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    onClick={handleReview}
                    className="flex-1 rounded-lg bg-[#2454d6] hover:bg-[#1b43b4] text-white py-1.5 text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    Review
                  </button>
                  <button
                    onClick={handleAssign}
                    className="flex-1 rounded-lg border border-white/20 hover:bg-white/10 text-slate-200 py-1.5 text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    Assign
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="rounded-lg px-2 py-1.5 text-[11px] text-slate-400 hover:text-slate-200 transition"
                    title="Dismiss AI Signal"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
