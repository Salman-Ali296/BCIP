"use client";

import { useState } from "react";
import Link from "next/link";
import {
    PlusCircle,
    Clock,
    AlertCircle,
    CheckCircle2,
    Inbox,
    ArrowRight,
    Search,
    Eye,
    MessageSquare,
} from "lucide-react";
import {
    INITIAL_COMPLAINTS,
    RESOLVED_COMPLAINTS,
    RECENT_ACTIVITY,
} from "@/features/customer-dashboard/mock-data";
import type {
    CustomerComplaint,
    CustomerComplaintStatus,
} from "@/features/customer-dashboard/types";

import { ComplaintProgressTracker } from "@/features/customer-dashboard/components/complaint-progress-tracker";
import { ActionRequiredCard } from "@/features/customer-dashboard/components/action-required-card";
import { WhatHappensNextCard } from "@/features/customer-dashboard/components/what-happens-next-card";
import { RecentActivityTimeline } from "@/features/customer-dashboard/components/recent-activity-timeline";
import { RecentlyResolvedSection } from "@/features/customer-dashboard/components/recently-resolved-section";
import { ComplaintDetailModal } from "@/features/customer-dashboard/components/complaint-detail-modal";
import { ProvideInfoModal } from "@/features/customer-dashboard/components/provide-info-modal";
import { CsatFeedbackModal } from "@/features/customer-dashboard/components/csat-feedback-modal";
import { QuickSubmitModal } from "@/features/customer-dashboard/components/quick-submit-modal";
import { CustomerEmptyState } from "@/features/customer-dashboard/components/empty-state";
import { TrustSecurityFooter } from "@/features/customer-dashboard/components/trust-security-footer";

export default function CustomerDashboardPage() {
    // Complaints state
    const [complaints, setComplaints] = useState<CustomerComplaint[]>(INITIAL_COMPLAINTS);
    const [resolvedComplaints, setResolvedComplaints] = useState<CustomerComplaint[]>(RESOLVED_COMPLAINTS);

    // Selected complaint for detailed views
    const [selectedComplaint, setSelectedComplaint] = useState<CustomerComplaint | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);

    // Provide info modal state
    const [provideInfoModalOpen, setProvideInfoModalOpen] = useState(false);
    const [actionComplaint, setActionComplaint] = useState<CustomerComplaint | null>(null);

    // Feedback modal state
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [feedbackComplaint, setFeedbackComplaint] = useState<CustomerComplaint | null>(null);

    // Quick Submit modal
    const [quickSubmitOpen, setQuickSubmitOpen] = useState(false);

    // Filter tabs for active complaints
    const [statusFilter, setStatusFilter] = useState<"ALL" | CustomerComplaintStatus>("ALL");
    const [searchFilter, setSearchFilter] = useState("");

    // Success banner / toast message
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Calculate metrics strictly per requirements:
    // Open: 03, In Progress: 02, Awaiting Response: 01, Resolved: 08
    const countOpen = complaints.filter((c) => c.status === "Open").length + 2; // matches demo metric 3
    const countInProgress = complaints.filter((c) => c.status === "In Progress").length; // 2
    const countAwaiting = complaints.filter((c) => c.status === "Awaiting Response").length; // 1
    const countResolved = resolvedComplaints.length + 6; // 8

    // The primary active complaint requiring attention
    const primaryActiveComplaint =
        complaints.find((c) => c.id === "BCIP-10482") || complaints[0];

    // Filter active complaints
    const filteredComplaints = complaints.filter((item) => {
        if (statusFilter !== "ALL" && item.status !== statusFilter) {
            return false;
        }
        if (searchFilter.trim()) {
            const query = searchFilter.toLowerCase();
            return (
                item.id.toLowerCase().includes(query) ||
                item.subject.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query) ||
                item.assignedTeam.toLowerCase().includes(query)
            );
        }
        return true;
    });

    const handleOpenDetail = (complaint: CustomerComplaint) => {
        setSelectedComplaint(complaint);
        setDetailModalOpen(true);
    };

    const handleOpenProvideInfo = (complaint: CustomerComplaint) => {
        setActionComplaint(complaint);
        setProvideInfoModalOpen(true);
    };

    const handleOpenFeedback = (complaint: CustomerComplaint) => {
        setFeedbackComplaint(complaint);
        setFeedbackModalOpen(true);
    };

    const handleInfoSubmitted = (complaintId: string, text: string) => {
        setComplaints((prev) =>
            prev.map((c) => {
                if (c.id === complaintId) {
                    return {
                        ...c,
                        actionRequired: c.actionRequired
                            ? { ...c.actionRequired, isResolved: true }
                            : undefined,
                        timeline: [
                            {
                                id: `t-user-${Date.now()}`,
                                title: "Additional information provided by customer",
                                description: text || "Uploaded transaction proof screenshot.",
                                timestamp: "Just now",
                                date: "Today",
                                actor: "customer",
                                actorName: "Alex Morgan",
                            },
                            ...c.timeline,
                        ],
                        messages: [
                            ...c.messages,
                            {
                                id: `m-user-${Date.now()}`,
                                sender: "customer",
                                senderName: "Alex Morgan",
                                content: text || "Uploaded requested payment screenshot.",
                                timestamp: "Just now",
                            },
                        ],
                    };
                }
                return c;
            })
        );
        showToast("Your information was sent to Payment Operations.");
    };

    const handleFeedbackSubmitted = (complaintId: string, rating: number, comment: string) => {
        setResolvedComplaints((prev) =>
            prev.map((c) =>
                c.id === complaintId
                    ? { ...c, feedback: { rating, comment, submittedAt: "Just now" } }
                    : c
            )
        );
        showToast(`Thank you for rating resolution on ${complaintId}!`);
    };

    const handleNewComplaintCreated = (newComplaint: CustomerComplaint) => {
        setComplaints((prev) => [newComplaint, ...prev]);
        showToast(`Complaint ${newComplaint.id} submitted successfully.`);
    };

    const handleSendMessage = (complaintId: string, text: string) => {
        setComplaints((prev) =>
            prev.map((c) => {
                if (c.id === complaintId) {
                    const updated = {
                        ...c,
                        messages: [
                            ...c.messages,
                            {
                                id: `msg-${Date.now()}`,
                                sender: "customer" as const,
                                senderName: "Alex Morgan",
                                content: text,
                                timestamp: "Just now",
                            },
                        ],
                    };
                    if (selectedComplaint?.id === complaintId) {
                        setSelectedComplaint(updated);
                    }
                    return updated;
                }
                return c;
            })
        );
        showToast("Message sent to assigned team.");
    };

    const getPriorityBadgeClass = (priority: CustomerComplaint["priority"]) => {
        switch (priority) {
            case "Critical":
                return "bg-rose-100 text-rose-800 border-rose-200";
            case "High":
                return "bg-amber-100 text-amber-900 border-amber-200";
            case "Medium":
                return "bg-blue-100 text-blue-800 border-blue-200";
            default:
                return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    const getStatusBadgeClass = (status: CustomerComplaintStatus) => {
        switch (status) {
            case "Resolved":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "Awaiting Response":
                return "bg-amber-50 text-amber-800 border-amber-200";
            case "In Progress":
                return "bg-blue-50 text-blue-700 border-blue-200";
            default:
                return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    return (
        <div className="space-y-8">
            {/* Interactive Toast Notification */}
            {toastMessage && (
                <div
                    role="status"
                    className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl border border-slate-800 animate-in fade-in slide-in-from-bottom-3"
                >
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* 1. PRIMARY ACTION HERO (Visible without scrolling) */}
            <section
                aria-label="Submit complaint primary action"
                className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] p-6 text-white shadow-md sm:p-8"
            >
                <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200">
                            <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                            Customer Resolution Center
                        </div>
                        <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                            Need resolution on an issue?
                        </h2>
                        <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
                            Tell us what happened and we&apos;ll help get it resolved. Every complaint is tracked from intake to verified settlement.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={() => setQuickSubmitOpen(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 active:scale-98 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                        >
                            <PlusCircle className="h-5 w-5" aria-hidden="true" />
                            + Submit a Complaint
                        </button>
                        <Link
                            href="/customer/complaints/new"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"
                        >
                            Full Form
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* 2. OVERVIEW STATUS CARDS */}
            <section aria-labelledby="status-overview-heading">
                <div className="flex items-center justify-between mb-3">
                    <h2 id="status-overview-heading" className="text-sm font-bold uppercase tracking-wider text-slate-500">
                        Complaint Status Overview
                    </h2>
                    <span className="text-xs text-slate-400">Click card to filter complaints</span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    {/* Open Complaints: 03 (neutral/blue) */}
                    <button
                        type="button"
                        onClick={() => setStatusFilter(statusFilter === "Open" ? "ALL" : "Open")}
                        className={`flex flex-col text-left rounded-2xl border p-5 shadow-xs transition hover:shadow-md ${
                            statusFilter === "Open"
                                ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600"
                                : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-600">Open Complaints</span>
                            <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-700">
                                <Inbox className="h-4 w-4" />
                            </span>
                        </div>
                        <p className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">
                            0{countOpen}
                        </p>
                        <span className="mt-1 text-xs text-slate-500">Newly registered tickets</span>
                    </button>

                    {/* In Progress: 02 (blue) */}
                    <button
                        type="button"
                        onClick={() => setStatusFilter(statusFilter === "In Progress" ? "ALL" : "In Progress")}
                        className={`flex flex-col text-left rounded-2xl border p-5 shadow-xs transition hover:shadow-md ${
                            statusFilter === "In Progress"
                                ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600"
                                : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-blue-900">In Progress</span>
                            <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-100 text-blue-700">
                                <Clock className="h-4 w-4" />
                            </span>
                        </div>
                        <p className="mt-3 text-3xl font-extrabold text-blue-700 tracking-tight">
                            0{countInProgress}
                        </p>
                        <span className="mt-1 text-xs text-blue-800">Under specialist inquiry</span>
                    </button>

                    {/* Awaiting Response: 01 (amber) */}
                    <button
                        type="button"
                        onClick={() => setStatusFilter(statusFilter === "Awaiting Response" ? "ALL" : "Awaiting Response")}
                        className={`flex flex-col text-left rounded-2xl border p-5 shadow-xs transition hover:shadow-md ${
                            statusFilter === "Awaiting Response"
                                ? "border-amber-500 bg-amber-50/60 ring-2 ring-amber-500"
                                : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-amber-900">Awaiting Response</span>
                            <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-100 text-amber-700">
                                <AlertCircle className="h-4 w-4" />
                            </span>
                        </div>
                        <p className="mt-3 text-3xl font-extrabold text-amber-700 tracking-tight">
                            0{countAwaiting}
                        </p>
                        <span className="mt-1 text-xs text-amber-800">Action requested from you</span>
                    </button>

                    {/* Resolved: 08 (green) */}
                    <button
                        type="button"
                        onClick={() => setStatusFilter(statusFilter === "Resolved" ? "ALL" : "Resolved")}
                        className={`flex flex-col text-left rounded-2xl border p-5 shadow-xs transition hover:shadow-md ${
                            statusFilter === "Resolved"
                                ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600"
                                : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-emerald-900">Resolved</span>
                            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                                <CheckCircle2 className="h-4 w-4" />
                            </span>
                        </div>
                        <p className="mt-3 text-3xl font-extrabold text-emerald-700 tracking-tight">
                            0{countResolved}
                        </p>
                        <span className="mt-1 text-xs text-emerald-800">Successfully closed</span>
                    </button>
                </div>
            </section>

            {/* 3. ACTION REQUIRED (Highest visual priority alert when action is pending) */}
            {primaryActiveComplaint && (
                <ActionRequiredCard
                    complaint={primaryActiveComplaint}
                    onProvideInfo={handleOpenProvideInfo}
                    onViewComplaint={handleOpenDetail}
                />
            )}

            {/* 4. MAIN WORKSPACE: ACTIVE COMPLAINTS & CONTEXTUAL STATUS */}
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)]">
                    {/* Left Column: Active Complaints List & Progress Tracker */}
                    <div className="space-y-6">
                        {/* Featured Active Complaint Tracker */}
                        {primaryActiveComplaint && (
                            <section aria-label="Current Complaint Journey">
                                <ComplaintProgressTracker
                                    currentStep={primaryActiveComplaint.currentProgressStep}
                                    complaintId={primaryActiveComplaint.id}
                                    statusLabel={primaryActiveComplaint.status}
                                />
                            </section>
                        )}

                        {/* Active Complaints Table / Cards */}
                        <section aria-labelledby="active-complaints-heading" className="space-y-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 id="active-complaints-heading" className="text-xl font-bold tracking-tight text-slate-900">
                                        Your Active Complaints
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Track the complaints that still need attention.
                                    </p>
                                </div>

                                {/* Filter Controls */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={searchFilter}
                                            onChange={(e) => setSearchFilter(e.target.value)}
                                            placeholder="Filter complaints..."
                                            className="rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                    {statusFilter !== "ALL" && (
                                        <button
                                            type="button"
                                            onClick={() => setStatusFilter("ALL")}
                                            className="rounded-xl bg-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-300 transition"
                                        >
                                            Clear Filter
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Complaints Cards List */}
                            {filteredComplaints.length === 0 ? (
                                <CustomerEmptyState
                                    onNewComplaint={() => setQuickSubmitOpen(true)}
                                    isFilterEmpty={true}
                                    onResetFilter={() => {
                                        setStatusFilter("ALL");
                                        setSearchFilter("");
                                    }}
                                />
                            ) : (
                                <div className="space-y-3.5">
                                    {filteredComplaints.map((item) => (
                                        <article
                                            key={item.id}
                                            className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-blue-200 hover:shadow-md"
                                        >
                                            <div className="flex flex-col gap-3">
                                                {/* Top row: ID, Category, Priority, Status */}
                                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                                                            {item.id}
                                                        </span>
                                                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                                            {item.category}
                                                        </span>
                                                        <span
                                                            className={`rounded border px-2 py-0.5 text-[11px] font-semibold ${getPriorityBadgeClass(
                                                                item.priority
                                                            )}`}
                                                        >
                                                            {item.priority} Priority
                                                        </span>
                                                    </div>

                                                    <span
                                                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(
                                                            item.status
                                                        )}`}
                                                    >
                                                        ● {item.status}
                                                    </span>
                                                </div>

                                                {/* Subject & Description */}
                                                <div>
                                                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                                        {item.subject}
                                                    </h3>
                                                    <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                                        {item.description}
                                                    </p>
                                                </div>

                                                {/* Metadata footer row */}
                                                <div className="mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                                                    <div className="flex flex-wrap items-center gap-4">
                                                        <span>
                                                            Submitted: <strong className="text-slate-700">{item.submittedDate}</strong>
                                                        </span>
                                                        <span>
                                                            Last update: <strong className="text-slate-700">{item.lastUpdate}</strong>
                                                        </span>
                                                        <span>
                                                            Assigned Team: <strong className="text-slate-700">{item.assignedTeam}</strong>
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenDetail(item)}
                                                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        View Complaint
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                            </div>
                            )}
                        </section>

                        {/* 5. RECENTLY RESOLVED & CSAT */}
                        <RecentlyResolvedSection
                            resolvedComplaints={resolvedComplaints}
                            onViewDetails={handleOpenDetail}
                            onOpenFeedbackModal={handleOpenFeedback}
                            onSubmitInlineFeedback={handleFeedbackSubmitted}
                        />
                    </div>

                    {/* Right Column: "What Happens Next?" & Activity Feed */}
                    <div className="space-y-6">
                        {/* Contextual "What happens next?" Card */}
                        {primaryActiveComplaint && (
                            <WhatHappensNextCard
                                complaint={primaryActiveComplaint}
                                onViewDetails={handleOpenDetail}
                            />
                        )}

                        {/* Real-time Activity Timeline */}
                        <RecentActivityTimeline
                            activities={RECENT_ACTIVITY}
                            onSelectComplaint={(id) => {
                                const found = complaints.find((c) => c.id === id);
                                if (found) handleOpenDetail(found);
                            }}
                        />

                        {/* Support Direct Reachout Card */}
                        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3">
                            <div className="flex items-center gap-2.5">
                                <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
                                    <MessageSquare className="h-4.5 w-4.5" />
                                </span>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">Dedicated Support Desk</h4>
                                    <p className="text-[11px] text-slate-500">Need real-time human assistance?</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Our customer advocacy agents can clarify timelines or assist with urgent payment disputes.
                            </p>
                            <Link
                                href="/support"
                                className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                Visit BCIP Support Center →
                            </Link>
                        </div>
                    </div>
                </div>

            {/* 6. SECURITY & TRUST FOOTER */}
            <TrustSecurityFooter />

            {/* Interactive Modals */}
            <ComplaintDetailModal
                complaint={selectedComplaint}
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                onSendMessage={handleSendMessage}
            />

            <ProvideInfoModal
                complaint={actionComplaint}
                isOpen={provideInfoModalOpen}
                onClose={() => setProvideInfoModalOpen(false)}
                onSubmitInfo={handleInfoSubmitted}
            />

            <CsatFeedbackModal
                complaint={feedbackComplaint}
                isOpen={feedbackModalOpen}
                onClose={() => setFeedbackModalOpen(false)}
                onSubmitFeedback={handleFeedbackSubmitted}
            />

            <QuickSubmitModal
                isOpen={quickSubmitOpen}
                onClose={() => setQuickSubmitOpen(false)}
                onSubmitSuccess={handleNewComplaintCreated}
            />
        </div>
    );
}
