"use client";

import { useState } from "react";
import {
    Inbox,
    Clock,
    AlertTriangle,
    ShieldAlert,
    UserCheck,
    CheckCircle2,
    RefreshCw,
    Search,
    Filter,
    ArrowUpRight,
    Sparkles,
    Send,
    Lock,
    FileText,
    Paperclip,
    Eye,
    ChevronRight,
    ShieldCheck,
    User,
    Building2,
    Calendar,
    Hash,
    Phone,
    Mail,
    AlertCircle,
} from "lucide-react";
import { useEnterprise } from "../context/enterprise-context";
import type {
    EnterpriseComplaint,
    QueueType,
    ComplaintPriority,
    SLAState,
    EnterpriseComplaintStatus,
} from "../types";

export function ThreePanelWorkspace() {
    const {
        complaints,
        selectedComplaintId,
        setSelectedComplaintId,
        selectedComplaint,
        activeQueue,
        setActiveQueue,
        setEscalateModalComplaintId,
        setResolveModalComplaintId,
        addInternalNote,
        sendAgentMessage,
        assignComplaint,
    } = useEnterprise();

    // Filters inside Center panel
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

    // Active tab in Right Workspace
    const [activeTab, setActiveTab] = useState<
        "overview" | "conversation" | "ai" | "activity" | "attachments" | "notes"
    >("overview");

    // Form inputs for composer & notes
    const [agentReply, setAgentReply] = useState("");
    const [internalNoteInput, setInternalNoteInput] = useState("");
    const [isNoteRestricted, setIsNoteRestricted] = useState(false);

    // Queue counts calculation
    const counts = {
        MY_WORK: complaints.filter((c) => c.assignedAgent?.id === "usr_agent_sarah").length,
        UNASSIGNED: complaints.filter((c) => !c.assignedAgent).length,
        HIGH_PRIORITY: complaints.filter((c) => c.priority === "HIGH" || c.priority === "CRITICAL").length,
        SLA_RISK: complaints.filter((c) => c.sla.status === "AT_RISK" || c.sla.status === "OVERDUE").length,
        WAITING_FOR_CUSTOMER: complaints.filter((c) => c.status === "WAITING_FOR_CUSTOMER").length,
        ESCALATED: complaints.filter((c) => c.status === "ESCALATED" || c.escalation?.isEscalated).length,
        RECENTLY_UPDATED: complaints.length,
        ALL: complaints.length,
    };

    // Filter center panel complaint list
    const filteredComplaints = complaints.filter((c) => {
        // Queue match
        if (activeQueue === "MY_WORK" && c.assignedAgent?.id !== "usr_agent_sarah") return false;
        if (activeQueue === "UNASSIGNED" && c.assignedAgent) return false;
        if (activeQueue === "HIGH_PRIORITY" && !(c.priority === "HIGH" || c.priority === "CRITICAL")) return false;
        if (activeQueue === "SLA_RISK" && !(c.sla.status === "AT_RISK" || c.sla.status === "OVERDUE")) return false;
        if (activeQueue === "WAITING_FOR_CUSTOMER" && c.status !== "WAITING_FOR_CUSTOMER") return false;
        if (activeQueue === "ESCALATED" && !(c.status === "ESCALATED" || c.escalation?.isEscalated)) return false;

        // Status filter
        if (statusFilter !== "ALL" && c.status !== statusFilter) return false;

        // Priority filter
        if (priorityFilter !== "ALL" && c.priority !== priorityFilter) return false;

        // Search text
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            return (
                c.id.toLowerCase().includes(q) ||
                c.title.toLowerCase().includes(q) ||
                c.customer.name.toLowerCase().includes(q) ||
                c.category.toLowerCase().includes(q)
            );
        }
        return true;
    });

    const getSLABadge = (sla: EnterpriseComplaint["sla"]) => {
        if (sla.status === "OVERDUE") {
            return (
                <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse" />
                    {sla.timeRemainingText}
                </span>
            );
        }
        if (sla.status === "AT_RISK") {
            return (
                <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
                    {sla.timeRemainingText}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                <Clock className="h-3 w-3 text-emerald-600" />
                {sla.timeRemainingText}
            </span>
        );
    };

    const getPriorityBadge = (priority: ComplaintPriority) => {
        switch (priority) {
            case "CRITICAL":
                return <span className="rounded bg-rose-600 text-white px-2 py-0.2 text-[10px] font-extrabold uppercase">Critical</span>;
            case "HIGH":
                return <span className="rounded bg-amber-500 text-white px-2 py-0.2 text-[10px] font-bold uppercase">High</span>;
            case "MEDIUM":
                return <span className="rounded bg-blue-100 text-blue-800 px-2 py-0.2 text-[10px] font-semibold uppercase">Medium</span>;
            default:
                return <span className="rounded bg-slate-100 text-slate-700 px-2 py-0.2 text-[10px] font-medium uppercase">Low</span>;
        }
    };

    const handleSendReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedComplaint || !agentReply.trim()) return;
        sendAgentMessage(selectedComplaint.id, agentReply);
        setAgentReply("");
    };

    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedComplaint || !internalNoteInput.trim()) return;
        addInternalNote(selectedComplaint.id, internalNoteInput, isNoteRestricted);
        setInternalNoteInput("");
    };

    return (
        <div className="flex h-[calc(100vh-140px)] min-h-[640px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            {/* PANEL 1: WORK QUEUES (LEFT) */}
            <aside
                className="w-64 shrink-0 border-r border-slate-200 bg-slate-50/70 p-3 flex flex-col justify-between"
                aria-label="Enterprise Work Queues"
            >
                <div>
                    <div className="px-3 py-2 flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Operational Queues
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Live SLA</span>
                    </div>

                    <nav className="mt-1 space-y-1">
                        {[
                            { key: "MY_WORK", label: "My Work", icon: UserCheck, count: counts.MY_WORK },
                            { key: "UNASSIGNED", label: "Unassigned", icon: Inbox, count: counts.UNASSIGNED },
                            { key: "HIGH_PRIORITY", label: "High Priority", icon: AlertCircle, count: counts.HIGH_PRIORITY },
                            { key: "SLA_RISK", label: "SLA Risk", icon: AlertTriangle, count: counts.SLA_RISK, alert: true },
                            { key: "WAITING_FOR_CUSTOMER", label: "Waiting for Customer", icon: Clock, count: counts.WAITING_FOR_CUSTOMER },
                            { key: "ESCALATED", label: "Escalated Cases", icon: ShieldAlert, count: counts.ESCALATED, alert: true },
                            { key: "RECENTLY_UPDATED", label: "Recently Updated", icon: RefreshCw, count: counts.RECENTLY_UPDATED },
                        ].map((q) => {
                            const active = activeQueue === q.key;
                            const Icon = q.icon;
                            return (
                                <button
                                    key={q.key}
                                    type="button"
                                    onClick={() => setActiveQueue(q.key as QueueType)}
                                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition ${
                                        active
                                            ? "bg-slate-900 text-white shadow-xs"
                                            : "text-slate-700 hover:bg-slate-200/60"
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Icon className={`h-4 w-4 ${active ? "text-white" : "text-slate-500"}`} />
                                        <span>{q.label}</span>
                                    </div>
                                    <span
                                        className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                                            active
                                                ? "bg-slate-800 text-white"
                                                : q.alert && q.count > 0
                                                ? "bg-amber-100 text-amber-900 font-extrabold"
                                                : "bg-slate-200 text-slate-600"
                                        }`}
                                    >
                                        {q.count}
                                    </span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Queue Summary Status */}
                <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1 text-xs">
                    <p className="font-bold text-slate-900">Shift Target: 98% SLA</p>
                    <p className="text-[11px] text-slate-500">
                        {counts.SLA_RISK} cases need update within 45 mins.
                    </p>
                </div>
            </aside>

            {/* PANEL 2: COMPLAINT LIST (CENTER) */}
            <section
                className="w-96 shrink-0 border-r border-slate-200 bg-white flex flex-col"
                aria-label="Queue Complaint List"
            >
                {/* Search & Quick Filters Header */}
                <div className="p-3 border-b border-slate-100 space-y-2.5 bg-slate-50/40">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter queue complaints..."
                            className="w-full rounded-xl border border-slate-200 bg-white pl-8.5 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="WAITING_FOR_CUSTOMER">Waiting Customer</option>
                            <option value="ESCALATED">Escalated</option>
                            <option value="RESOLVED">Resolved</option>
                        </select>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700"
                        >
                            <option value="ALL">All Priorities</option>
                            <option value="CRITICAL">Critical</option>
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                        </select>
                        <span className="text-[11px] text-slate-400 ml-auto font-medium">
                            {filteredComplaints.length} cases
                        </span>
                    </div>
                </div>

                {/* Complaint Cards Scroll List */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                    {filteredComplaints.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500">
                            Your queue is clear. No complaints match current filters.
                        </div>
                    ) : (
                        filteredComplaints.map((item) => {
                            const isSelected = item.id === selectedComplaintId;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setSelectedComplaintId(item.id)}
                                    className={`w-full text-left p-3.5 transition flex flex-col gap-1.5 ${
                                        isSelected
                                            ? "bg-blue-50/70 border-l-4 border-l-blue-600"
                                            : "hover:bg-slate-50 border-l-4 border-l-transparent"
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-mono text-xs font-bold text-slate-900">
                                                {item.id}
                                            </span>
                                            {getPriorityBadge(item.priority)}
                                        </div>
                                        {getSLABadge(item.sla)}
                                    </div>

                                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                                        {item.title}
                                    </h4>

                                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                                        <span className="truncate max-w-[140px] font-medium text-slate-700">
                                            {item.customer.name}
                                        </span>
                                        <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600">
                                            {item.category}
                                        </span>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </section>

            {/* PANEL 3: COMPLAINT WORKSPACE (RIGHT) */}
            <main
                className="flex-1 flex flex-col bg-white overflow-hidden"
                aria-label="Active Complaint Workspace"
            >
                {!selectedComplaint ? (
                    <div className="m-auto text-center p-8 text-slate-400">
                        <Inbox className="h-12 w-12 mx-auto stroke-1" />
                        <p className="mt-2 text-sm font-semibold">Select a complaint from the queue to start working</p>
                    </div>
                ) : (
                    <>
                        {/* Workspace Header */}
                        <div className="border-b border-slate-200 bg-slate-50/50 p-5">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-mono text-sm font-bold text-slate-900">
                                            {selectedComplaint.id}
                                        </span>
                                        <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                                            {selectedComplaint.category}
                                        </span>
                                        {getPriorityBadge(selectedComplaint.priority)}
                                        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-900">
                                            ● {selectedComplaint.status}
                                        </span>
                                        <span className="text-xs text-slate-500 font-medium">
                                            Team: <strong className="text-slate-800">{selectedComplaint.team}</strong>
                                        </span>
                                    </div>
                                    <h2 className="mt-1.5 text-lg font-bold text-slate-900 tracking-tight">
                                        {selectedComplaint.title}
                                    </h2>
                                </div>

                                {/* Operational Action Controls */}
                                <div className="flex flex-wrap items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setEscalateModalComplaintId(selectedComplaint.id)}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-800 hover:bg-rose-100 transition"
                                    >
                                        <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                                        Escalate
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setResolveModalComplaintId(selectedComplaint.id)}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition"
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Resolve
                                    </button>
                                </div>
                            </div>

                            {/* SLA Alert Strip */}
                            <div className="mt-3 flex items-center justify-between rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-700">SLA Performance:</span>
                                    {getSLABadge(selectedComplaint.sla)}
                                    <span className="text-slate-400">•</span>
                                    <span className="text-slate-500">Ref: {selectedComplaint.referenceNumber}</span>
                                </div>
                                <span className="text-slate-500">
                                    Assigned: <strong className="text-slate-800">{selectedComplaint.assignedAgent?.name || "Unassigned"}</strong>
                                </span>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex border-b border-slate-200 bg-white px-5">
                            {[
                                { key: "overview", label: "Overview" },
                                { key: "conversation", label: `Conversation (${selectedComplaint.messages.length})` },
                                { key: "ai", label: "AI & Semantic Intelligence" },
                                { key: "activity", label: `Audit Log (${selectedComplaint.auditTrail.length})` },
                                { key: "attachments", label: `Attachments (${selectedComplaint.attachments.length})` },
                                { key: "notes", label: `Internal Notes (${selectedComplaint.internalNotes.length})` },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveTab(tab.key as any)}
                                    className={`py-3 px-3 text-xs font-semibold border-b-2 transition ${
                                        activeTab === tab.key
                                            ? "border-blue-600 text-blue-600"
                                            : "border-transparent text-slate-500 hover:text-slate-900"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* 1. OVERVIEW TAB */}
                            {activeTab === "overview" && (
                                <div className="space-y-6">
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Customer Identity</p>
                                            <p className="mt-1 text-sm font-bold text-slate-900">{selectedComplaint.customer.name}</p>
                                            <p className="text-xs text-slate-500">{selectedComplaint.customer.email}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Tier: <strong className="text-blue-700">{selectedComplaint.customer.tier}</strong></p>
                                        </div>
                                        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Department & Routing</p>
                                            <p className="mt-1 text-sm font-bold text-slate-900">{selectedComplaint.businessUnit}</p>
                                            <p className="text-xs text-slate-600">{selectedComplaint.department} / {selectedComplaint.team}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Channel: {selectedComplaint.channel}</p>
                                        </div>
                                        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Timestamps & Ledger</p>
                                            <p className="mt-1 text-xs text-slate-800 font-medium">Logged: {selectedComplaint.createdAt}</p>
                                            <p className="text-xs text-slate-500">Updated: {selectedComplaint.updatedAt}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Ref: {selectedComplaint.referenceNumber}</p>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                            Customer Statement & Evidence
                                        </h4>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                                            {selectedComplaint.description}
                                        </p>
                                    </div>

                                    {/* Escalation details if present */}
                                    {selectedComplaint.escalation?.isEscalated && (
                                        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <ShieldAlert className="h-4 w-4 text-rose-600" />
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                                                    Active Escalation Record
                                                </h4>
                                            </div>
                                            <p className="text-xs text-rose-950">
                                                <strong>Reason:</strong> {selectedComplaint.escalation.reason} • <strong>Target:</strong> {selectedComplaint.escalation.escalatedTo}
                                            </p>
                                            <p className="text-xs text-rose-800 mt-1 italic">
                                                &ldquo;{selectedComplaint.escalation.comment}&rdquo; — {selectedComplaint.escalation.escalatedBy}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 2. CONVERSATION TAB */}
                            {activeTab === "conversation" && (
                                <div className="flex flex-col h-[480px]">
                                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                                        {selectedComplaint.messages.map((m) => {
                                            const isAgent = m.sender === "AGENT";
                                            return (
                                                <div
                                                    key={m.id}
                                                    className={`flex flex-col ${isAgent ? "items-end" : "items-start"}`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-semibold text-slate-700">{m.senderName}</span>
                                                        <span className="text-[10px] text-slate-400">{m.timestamp}</span>
                                                    </div>
                                                    <div
                                                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                                            isAgent
                                                                ? "bg-slate-900 text-white rounded-br-xs"
                                                                : "bg-slate-100 text-slate-900 rounded-bl-xs"
                                                        }`}
                                                    >
                                                        {m.content}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Reply Composer */}
                                    <form onSubmit={handleSendReply} className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-2">
                                        <button
                                            type="button"
                                            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                                            title="Attach evidence"
                                        >
                                            <Paperclip className="h-5 w-5" />
                                        </button>
                                        <input
                                            type="text"
                                            value={agentReply}
                                            onChange={(e) => setAgentReply(e.target.value)}
                                            placeholder="Send verified reply to customer portal..."
                                            className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!agentReply.trim()}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-40"
                                        >
                                            <span>Send Response</span>
                                            <Send className="h-3.5 w-3.5" />
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* 3. AI & SEMANTIC INTELLIGENCE TAB */}
                            {activeTab === "ai" && (
                                <div className="space-y-6">
                                    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="h-5 w-5 text-indigo-600" />
                                                <h3 className="text-sm font-bold text-indigo-950">AI Summary & Diagnostics</h3>
                                            </div>
                                            <span className="rounded bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-800">
                                                Confidence: {Math.round(selectedComplaint.aiInsights.categoryConfidence * 100)}%
                                            </span>
                                        </div>

                                        <p className="text-sm leading-relaxed text-slate-800 font-medium bg-white p-4 rounded-xl border border-slate-200">
                                            &ldquo;{selectedComplaint.aiInsights.summary}&rdquo;
                                        </p>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                                                <p className="text-[11px] font-bold uppercase text-slate-400">Classified Category</p>
                                                <p className="text-sm font-bold text-slate-900 mt-1">{selectedComplaint.category}</p>
                                            </div>
                                            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                                                <p className="text-[11px] font-bold uppercase text-slate-400">Detected Sentiment</p>
                                                <p className="text-sm font-bold text-slate-900 mt-1">{selectedComplaint.aiInsights.sentimentScore}</p>
                                            </div>
                                        </div>

                                        {/* Suggested Action */}
                                        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4">
                                            <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase">
                                                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                                                <span>AI-generated suggestion</span>
                                            </div>
                                            <p className="mt-1 text-sm text-blue-950 font-medium">
                                                {selectedComplaint.aiInsights.suggestedAction}
                                            </p>
                                            <p className="mt-1.5 text-[11px] text-blue-800">
                                                The employee remains responsible for final decision verification and customer authorization.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Semantic Recurring Issue Intelligence */}
                                    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900">Semantic Complaint Intelligence</h4>
                                                <p className="text-xs text-slate-500">Cross-case pattern detection across recent intake</p>
                                            </div>
                                            <span className="rounded bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">
                                                {selectedComplaint.aiInsights.relatedComplaintsCount} similar reports
                                            </span>
                                        </div>

                                        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                                                <h5 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                                                    Potential Recurring Issue Pattern Detected
                                                </h5>
                                            </div>
                                            <p className="mt-1 text-sm font-bold text-slate-900">
                                                &ldquo;Payment successful but order creation failed&rdquo;
                                            </p>
                                            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                                                <span>Impact: <strong className="text-rose-700">High</strong></span>
                                                <span>Affected complaints: <strong className="text-slate-900">14 cases</strong></span>
                                                <span>Root hypothesis: <strong>Gateway webhook timeout</strong></span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    window.location.href = "/business/trends";
                                                }}
                                                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                                            >
                                                Review Issue Pattern →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 4. ACTIVITY & IMMUTABLE AUDIT LOG TAB */}
                            {activeTab === "activity" && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-slate-900">Immutable Audit History</h4>
                                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                                            <ShieldCheck className="h-3.5 w-3.5" />
                                            Tamper-Evident Ledger
                                        </span>
                                    </div>

                                    <ol className="relative space-y-6 border-l-2 border-slate-200 pl-6 ml-2">
                                        {selectedComplaint.auditTrail.map((ev) => (
                                            <li key={ev.id} className="relative">
                                                <span className="absolute -left-[33px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700 ring-4 ring-white">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                </span>
                                                <div className="space-y-1">
                                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                                        <strong className="text-slate-900">{ev.actorName}</strong>
                                                        <span className="text-slate-400">({ev.actorRole})</span>
                                                        <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600">
                                                            {ev.action}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 ml-auto">
                                                            {ev.timestamp}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-700 leading-relaxed">
                                                        {ev.details}
                                                    </p>
                                                    {ev.previousState && ev.newState && (
                                                        <div className="rounded bg-slate-50 p-2 text-[11px] font-mono text-slate-600 border border-slate-200 inline-block mt-1">
                                                            {ev.previousState} → {ev.newState}
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}

                            {/* 5. ATTACHMENTS TAB */}
                            {activeTab === "attachments" && (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-900">Case Evidence & Documents</h4>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {selectedComplaint.attachments.map((att) => (
                                            <div
                                                key={att.name}
                                                className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 bg-slate-50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-6 w-6 text-blue-600" />
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-900">{att.name}</p>
                                                        <p className="text-[11px] text-slate-500">{att.size} • {att.date}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="text-xs font-semibold text-blue-600 hover:underline"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 6. INTERNAL NOTES TAB */}
                            {activeTab === "notes" && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900">Restricted Team Notes</h4>
                                            <p className="text-xs text-slate-500">Internal notes are strictly hidden from the customer portal.</p>
                                        </div>
                                        <Lock className="h-4 w-4 text-slate-400" />
                                    </div>

                                    {/* Note Composer */}
                                    <form onSubmit={handleAddNote} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        <textarea
                                            rows={2}
                                            value={internalNoteInput}
                                            onChange={(e) => setInternalNoteInput(e.target.value)}
                                            placeholder="Write an internal operational note for dispute specialists..."
                                            className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                                        />
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center gap-2 text-xs text-slate-600">
                                                <input
                                                    type="checkbox"
                                                    checked={isNoteRestricted}
                                                    onChange={(e) => setIsNoteRestricted(e.target.checked)}
                                                    className="rounded border-slate-300"
                                                />
                                                <span>Restrict to Escalation Managers only</span>
                                            </label>
                                            <button
                                                type="submit"
                                                disabled={!internalNoteInput.trim()}
                                                className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-40"
                                            >
                                                Save Internal Note
                                            </button>
                                        </div>
                                    </form>

                                    {/* Existing Notes */}
                                    <div className="space-y-3">
                                        {selectedComplaint.internalNotes.map((n) => (
                                            <div
                                                key={n.id}
                                                className={`rounded-xl p-3.5 border text-xs leading-relaxed ${
                                                    n.isRestricted
                                                        ? "border-amber-200 bg-amber-50/50"
                                                        : "border-slate-200 bg-white"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-bold text-slate-900">{n.authorName} ({n.authorRole})</span>
                                                    <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                                                </div>
                                                <p className="text-slate-800">{n.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
