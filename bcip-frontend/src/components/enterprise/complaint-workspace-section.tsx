"use client";

import React, { useState, useMemo } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUpDown,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  FileSearch,
  Filter,
  History,
  Info,
  Layers,
  MessageSquare,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Send,
  Shield,
  Sparkles,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useToast } from "./toast-system";

export interface FullComplaint {
  id: string;
  customerName: string;
  customerTier: "Enterprise" | "Mid-Market" | "Standard";
  email: string;
  message: string;
  category: "Billing" | "Service" | "Account Access" | "Logistics" | "Technical";
  priority: "Critical" | "High" | "Medium" | "Low";
  sentiment: "Negative" | "Frustrated" | "Neutral";
  aiConfidence: number;
  aiSignal: string;
  assignedTeam: string;
  assignedMember: string;
  status: "Needs Review" | "In Progress" | "Escalated" | "Resolved";
  createdTime: string;
  slaRemaining: string;
  slaUrgent: boolean;
  channel: "Web Portal" | "Email Intake" | "API / Webhook" | "Support Chat";
  duplicates: { id: string; similarity: number; summary: string }[];
  auditHistory: { timestamp: string; actor: string; action: string }[];
}

const initialComplaints: FullComplaint[] = [
  {
    id: "BC-10482",
    customerName: "Zainab Malik",
    customerTier: "Enterprise",
    email: "z.malik@vanguard-corp.com",
    message: "Charged twice for the same transaction via invoice batch #8841. Amount of $1,420 was debited simultaneously on Oct 4 and Oct 5.",
    category: "Billing",
    priority: "High",
    sentiment: "Frustrated",
    aiConfidence: 92,
    aiSignal: "Possible duplicate",
    assignedTeam: "Billing Operations",
    assignedMember: "Tariq Mahmood",
    status: "Needs Review",
    createdTime: "12 mins ago",
    slaRemaining: "02h 18m remaining",
    slaUrgent: true,
    channel: "Web Portal",
    duplicates: [
      { id: "BC-10433", similarity: 0.94, summary: "Duplicate debit on monthly invoice renewal for batch #8841." },
      { id: "BC-10419", similarity: 0.88, summary: "Billing system double charge after checkout retry." },
    ],
    auditHistory: [
      { timestamp: "12m ago", actor: "System Intake", action: "Complaint captured via Enterprise Web Portal." },
      { timestamp: "11m ago", actor: "AI Intelligence Engine", action: "Categorized as Billing (92% conf); detected possible duplicate batch transaction." },
      { timestamp: "8m ago", actor: "Routing Rule #4", action: "Assigned queue to Billing Operations." },
    ],
  },
  {
    id: "BC-10485",
    customerName: "Marcus Vance",
    customerTier: "Enterprise",
    email: "marcus.vance@apex-retail.io",
    message: "Payment confirmed on ledger but order status shows cancelled. Our inventory dispatch at the warehouse is currently blocked.",
    category: "Billing",
    priority: "Critical",
    sentiment: "Negative",
    aiConfidence: 96,
    aiSignal: "High urgency",
    assignedTeam: "Tier 2 Support",
    assignedMember: "Sara Connor",
    status: "In Progress",
    createdTime: "24 mins ago",
    slaRemaining: "00h 45m remaining",
    slaUrgent: true,
    channel: "API / Webhook",
    duplicates: [
      { id: "BC-10480", similarity: 0.91, summary: "Payment gateway timed out during high volume checkout." },
    ],
    auditHistory: [
      { timestamp: "24m ago", actor: "Webhook Ingestion", action: "Captured from ERP Integration." },
      { timestamp: "23m ago", actor: "AI Engine", action: "Flagged High Urgency & Critical priority due to blocked dispatch." },
      { timestamp: "20m ago", actor: "Sara Connor", action: "Status updated to In Progress." },
    ],
  },
  {
    id: "BC-10479",
    customerName: "Ayesha Siddiqui",
    customerTier: "Mid-Market",
    email: "a.siddiqui@solaris-logistics.net",
    message: "Refund of $340 approved 14 business days ago has not cleared in our bank statement. Support representative promised 3 days.",
    category: "Billing",
    priority: "High",
    sentiment: "Negative",
    aiConfidence: 89,
    aiSignal: "Similar complaints detected",
    assignedTeam: "Finance Operations",
    assignedMember: "Unassigned",
    status: "Needs Review",
    createdTime: "45 mins ago",
    slaRemaining: "01h 12m remaining",
    slaUrgent: false,
    channel: "Email Intake",
    duplicates: [
      { id: "BC-10410", similarity: 0.89, summary: "Refund SLA delay exceeding 10 business days." },
    ],
    auditHistory: [
      { timestamp: "45m ago", actor: "Email Parser", action: "Parsed inbound support thread." },
      { timestamp: "44m ago", actor: "AI Engine", action: "Matched similar refund delay cluster." },
    ],
  },
  {
    id: "BC-10471",
    customerName: "David Chen",
    customerTier: "Enterprise",
    email: "dchen@northwind-energy.org",
    message: "Primary admin locked out: 2FA verification SMS codes fail to arrive on international roaming. Three engineers unable to deploy.",
    category: "Account Access",
    priority: "High",
    sentiment: "Frustrated",
    aiConfidence: 94,
    aiSignal: "High urgency",
    assignedTeam: "Identity Ops",
    assignedMember: "Hamza Farooq",
    status: "In Progress",
    createdTime: "1h 10m ago",
    slaRemaining: "03h 25m remaining",
    slaUrgent: false,
    channel: "Web Portal",
    duplicates: [],
    auditHistory: [
      { timestamp: "1h 10m ago", actor: "Web Intake", action: "Submitted via urgent security gate." },
      { timestamp: "1h 05m ago", actor: "Hamza Farooq", action: "Identity verification initiated via backup secret." },
    ],
  },
  {
    id: "BC-10468",
    customerName: "Bilal Ahmed",
    customerTier: "Standard",
    email: "bilal@cloudware-solutions.com",
    message: "Rider delivered consignment package with wrong branch manifest #B-901 instead of #B-902. Goods returned to courier hub.",
    category: "Logistics",
    priority: "Medium",
    sentiment: "Neutral",
    aiConfidence: 88,
    aiSignal: "Logistics pattern",
    assignedTeam: "Dispatch Logistics",
    assignedMember: "Kashif Niaz",
    status: "Resolved",
    createdTime: "3h ago",
    slaRemaining: "Completed",
    slaUrgent: false,
    channel: "Support Chat",
    duplicates: [],
    auditHistory: [
      { timestamp: "3h ago", actor: "Chat Intake", action: "Ticket opened by logistics coordinator." },
      { timestamp: "1h ago", actor: "Kashif Niaz", action: "Consignment rerouted and proof of delivery confirmed." },
      { timestamp: "30m ago", actor: "Kashif Niaz", action: "Marked Resolved with customer sign-off." },
    ],
  },
  {
    id: "BC-10462",
    customerName: "Rachel Brooks",
    customerTier: "Mid-Market",
    email: "rachel@strata-design.com",
    message: "Exporting annual complaint analytics report to CSV returns 504 gateway timeout on datasets larger than 10,000 records.",
    category: "Technical",
    priority: "Low",
    sentiment: "Neutral",
    aiConfidence: 91,
    aiSignal: "Technical defect",
    assignedTeam: "Platform Engineering",
    assignedMember: "Unassigned",
    status: "Needs Review",
    createdTime: "4h ago",
    slaRemaining: "14h 20m remaining",
    slaUrgent: false,
    channel: "Web Portal",
    duplicates: [],
    auditHistory: [
      { timestamp: "4h ago", actor: "Web Portal", action: "Bug report filed with stack trace." },
      { timestamp: "3h 59m ago", actor: "AI Engine", action: "Identified platform query optimization issue." },
    ],
  },
];

export function ComplaintWorkspaceSection() {
  const [complaints, setComplaints] = useState<FullComplaint[]>(initialComplaints);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedComplaint, setSelectedComplaint] = useState<FullComplaint | null>(null);
  const [internalNote, setInternalNote] = useState("");
  const { toast } = useToast();

  // Filtered complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      const matchesSearch =
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.assignedTeam.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || item.priority === priorityFilter;

      const matchesCategory =
        categoryFilter === "All" || item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [complaints, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  const activeFiltersCount =
    (statusFilter !== "All" ? 1 : 0) +
    (priorityFilter !== "All" ? 1 : 0) +
    (categoryFilter !== "All" ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setCategoryFilter("All");
  };

  const handleUpdateStatus = (id: string, newStatus: FullComplaint["status"]) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: newStatus,
              auditHistory: [
                ...c.auditHistory,
                {
                  timestamp: "Just now",
                  actor: "Current Operator",
                  action: `Status changed to ${newStatus}.`,
                },
              ],
            }
          : c
      )
    );

    if (selectedComplaint && selectedComplaint.id === id) {
      setSelectedComplaint((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              auditHistory: [
                ...prev.auditHistory,
                {
                  timestamp: "Just now",
                  actor: "Current Operator",
                  action: `Status changed to ${newStatus}.`,
                },
              ],
            }
          : null
      );
    }

    toast({
      title: `${id} Status Updated`,
      description: `Complaint state updated to "${newStatus}".`,
      variant: newStatus === "Resolved" ? "success" : "info",
    });
  };

  const handleAddNote = () => {
    if (!selectedComplaint || !internalNote.trim()) return;

    const noteText = internalNote.trim();
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === selectedComplaint.id
          ? {
              ...c,
              auditHistory: [
                ...c.auditHistory,
                {
                  timestamp: "Just now",
                  actor: "Current Operator",
                  action: `Staff Note: "${noteText}"`,
                },
              ],
            }
          : c
      )
    );

    setSelectedComplaint((prev) =>
      prev
        ? {
            ...prev,
            auditHistory: [
              ...prev.auditHistory,
              {
                timestamp: "Just now",
                actor: "Current Operator",
                action: `Staff Note: "${noteText}"`,
              },
            ],
          }
        : null
    );

    setInternalNote("");
    toast({
      title: "Note Recorded",
      description: "Appended to immutable audit trail.",
      variant: "success",
    });
  };

  return (
    <section id="workspace" className="section bg-[#f8fafc] border-b border-slate-200">
      <div className="container-x">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
          <div className="max-w-2xl">
            <div className="eyebrow">
              <span className="status-dot" />
              Interactive Triage Console
            </div>
            <h2 className="heading-xl mt-3 text-[#101d30]">
              Fast triage. Clear context.
              <br />
              <span className="text-[#2454d6]">Zero guesswork.</span>
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Scan queues instantly with AI duplicate clusters, live SLA countdowns, and accountable human decision actions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-lg bg-blue-50 border border-blue-200 text-[#2454d6] px-3 py-1 font-mono text-[11px]">
              Interactive Prototype
            </span>
            <span className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 font-mono text-[11px]">
              Audit Trail Active
            </span>
          </div>
        </div>

        {/* Operational Filter & Action Toolbar */}
        <div className="mt-10 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, customer name, keyword or team..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#2454d6] focus:outline-none focus:ring-2 focus:ring-[#2454d6]/10 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="text-[11px] font-semibold text-slate-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-[#2454d6] focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Needs Review">Needs Review</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              {/* Priority */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="text-[11px] font-semibold text-slate-500">Priority:</span>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-[#2454d6] focus:outline-none"
                >
                  <option value="All">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Category */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="text-[11px] font-semibold text-slate-500">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-[#2454d6] focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  <option value="Billing">Billing</option>
                  <option value="Account Access">Account Access</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Technical">Technical</option>
                </select>
              </div>

              {/* Reset button if active filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
                >
                  Reset ({activeFiltersCount})
                </button>
              )}
            </div>
          </div>

          {/* Results count indicator */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-800">{filteredComplaints.length}</strong> of{" "}
              {complaints.length} complaints in operational queue
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Double-click or click “Inspect” for full dossier & audit log
            </span>
          </div>
        </div>

        {/* Section 8 Table or Section 20 Empty State */}
        <div className="mt-4 rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
          {filteredComplaints.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
                <Filter className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-slate-900">
                No complaints match your current filters
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Try removing one or more search filters or keywords to view complaints in the queue.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#2454d6] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#1b43b4] transition"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    <th className="py-3 px-4">Complaint ID</th>
                    <th className="py-3 px-4">Customer & Message</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">AI Signal</th>
                    <th className="py-3 px-4">Assigned Team</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">SLA Clock</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {filteredComplaints.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedComplaint(item)}
                      className={`cursor-pointer transition-colors hover:bg-blue-50/30 ${
                        selectedComplaint?.id === item.id ? "bg-blue-50/60" : ""
                      }`}
                    >
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#2454d6] whitespace-nowrap">
                        {item.id}
                      </td>

                      {/* Customer / Message */}
                      <td className="py-3.5 px-4 max-w-[280px]">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                          <span className="truncate">{item.customerName}</span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-bold text-slate-500">
                            {item.customerTier}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-600 line-clamp-1 leading-snug">
                          {item.message}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                          {item.category}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            item.priority === "Critical"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : item.priority === "High"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : item.priority === "Medium"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              item.priority === "Critical"
                                ? "bg-rose-600"
                                : item.priority === "High"
                                ? "bg-amber-600"
                                : item.priority === "Medium"
                                ? "bg-blue-600"
                                : "bg-slate-400"
                            }`}
                          />
                          {item.priority}
                        </span>
                      </td>

                      {/* AI Signal */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700">
                            <Sparkles className="h-3 w-3 text-indigo-500" />
                            {item.aiSignal}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400">
                            Confidence: {item.aiConfidence}%
                          </span>
                        </div>
                      </td>

                      {/* Assigned Team */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-xs font-semibold text-slate-800">
                          {item.assignedTeam}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.assignedMember}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            item.status === "Needs Review"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : item.status === "In Progress"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* SLA */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px]">
                        <span
                          className={`inline-flex items-center gap-1 ${
                            item.slaUrgent
                              ? "text-rose-600 font-bold"
                              : "text-slate-600"
                          }`}
                        >
                          <Clock className="h-3 w-3 shrink-0" />
                          {item.slaRemaining}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedComplaint(item);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:border-[#2454d6] hover:text-[#2454d6] shadow-2xs transition"
                        >
                          Inspect <ArrowRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Complaint Dossier Drawer (Sections 8 & 18) */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200">
            {/* Drawer Header */}
            <div className="border-b border-slate-200 p-5 flex items-center justify-between bg-slate-50/70">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-[#2454d6]">
                    {selectedComplaint.id}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      selectedComplaint.status === "Needs Review"
                        ? "bg-amber-100 text-amber-800"
                        : selectedComplaint.status === "In Progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {selectedComplaint.status}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    SLA: {selectedComplaint.slaRemaining}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {selectedComplaint.customerName} · {selectedComplaint.customerTier} Tier
                </h3>
              </div>

              <button
                onClick={() => setSelectedComplaint(null)}
                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
                aria-label="Close complaint inspector"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-700">
              {/* Customer Verbatim Statement */}
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Original Customer Voice ({selectedComplaint.channel})
                </span>
                <p className="mt-2 text-sm font-medium text-slate-900 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                  “{selectedComplaint.message}”
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Customer Contact: {selectedComplaint.email}</span>
                  <span>Captured: {selectedComplaint.createdTime}</span>
                </div>
              </div>

              {/* Section 9: AI Intelligence Breakdown */}
              <div className="rounded-xl border border-blue-200 bg-[#edf2ff]/40 p-4">
                <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
                  <span className="inline-flex items-center gap-1.5 font-bold text-[#2454d6]">
                    <Sparkles className="h-4 w-4" /> AI Assisted Signals
                  </span>
                  <span className="font-mono text-[10px] font-bold rounded-full bg-blue-100 text-[#2454d6] px-2 py-0.5">
                    Confidence: {selectedComplaint.aiConfidence}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block">Detected Category</span>
                    <span className="text-xs font-bold text-slate-900">{selectedComplaint.category}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block">Customer Sentiment</span>
                    <span className="text-xs font-bold text-slate-900">{selectedComplaint.sentiment}</span>
                  </div>
                </div>

                {/* Duplicates Cluster */}
                {selectedComplaint.duplicates.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-200/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 block">
                      Semantic Duplicates Detected ({selectedComplaint.duplicates.length})
                    </span>
                    <div className="mt-2 space-y-1.5">
                      {selectedComplaint.duplicates.map((dup) => (
                        <div
                          key={dup.id}
                          className="flex items-center justify-between rounded-lg bg-white p-2 border border-blue-100"
                        >
                          <div className="overflow-hidden pr-2">
                            <span className="font-mono font-bold text-[#2454d6] text-[10px]">
                              {dup.id}
                            </span>
                            <p className="truncate text-[11px] text-slate-600">{dup.summary}</p>
                          </div>
                          <span className="rounded bg-indigo-50 px-1.5 py-0.5 font-mono text-[9px] font-bold text-indigo-700 whitespace-nowrap">
                            {(dup.similarity * 100).toFixed(0)}% match
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Audit Trail & History */}
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  Immutable Audit Trail & Timeline
                </span>
                <div className="space-y-3">
                  {selectedComplaint.auditHistory.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div className="h-2 w-2 rounded-full bg-[#2454d6] mt-1 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <strong className="text-slate-800">{item.actor}</strong>
                          <span className="font-mono text-[10px] text-slate-400">{item.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">{item.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Internal Notes Section */}
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Add Operational Staff Note
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                    placeholder="Enter resolution notes or internal findings..."
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-[#2454d6] focus:outline-none"
                  />
                  <button
                    onClick={handleAddNote}
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="border-t border-slate-200 p-4 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Quick State:</span>
                <button
                  onClick={() => handleUpdateStatus(selectedComplaint.id, "In Progress")}
                  className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  Mark In Progress
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedComplaint.id, "Resolved")}
                  className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700 transition"
                >
                  Resolve Case
                </button>
              </div>

              <button
                onClick={() => setSelectedComplaint(null)}
                className="rounded-md px-3 py-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
