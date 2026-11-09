"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  History,
  Layers,
  MessageSquare,
  Send,
  Shield,
  Sparkles,
  User,
  Users,
} from "lucide-react";

import { useComplaint, useUpdateComplaint } from "@/features/complaints/hooks/use-complaints";
import { StatusBadge } from "@/components/data-display/status-badge";
import { Loading } from "@/components/feedback/loading";
import { ErrorMessage } from "@/components/feedback/error-message";
import type { Complaint } from "@/features/complaints/api/complaint-api";

export default function BusinessComplaintDetailPage() {
  const params = useParams<{ complaintId: string }>();
  const router = useRouter();
  const complaintId = params?.complaintId || "";
  const query = useComplaint(complaintId);
  const updateMutation = useUpdateComplaint(complaintId);

  const [status, setStatus] = useState<Complaint["status"] | "">("");
  const [internalNote, setInternalNote] = useState("");
  const [localAuditLogs, setLocalAuditLogs] = useState<
    Array<{ timestamp: string; actor: string; action: string }>
  >([]);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [signalDismissed, setSignalDismissed] = useState(false);

  if (query.isLoading) {
    return (
      <main className="p-8">
        <Loading label="Loading complaint dossier..." />
      </main>
    );
  }

  if (query.isError || !query.data?.data) {
    return (
      <main className="p-8 space-y-4">
        <ErrorMessage
          message={
            query.error instanceof Error
              ? query.error.message
              : "Complaint could not be loaded or was not found."
          }
        />
        <Link
          href="/business/complaints"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#2454d6] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Return to complaint queue
        </Link>
      </main>
    );
  }

  const complaint = query.data.data;
  const currentStatus = status || complaint.status;

  // Realistic fallback metadata for display when backend fields are pending
  const trackingNumber = complaint.trackingId || `BC-${complaint.id.slice(0, 6).toUpperCase()}`;
  const priority = complaint.priority || "medium";
  const category = complaint.category || "General Operations";
  const customerEmail = complaint.customerEmail || "Not provided";
  const customerName = complaint.submittedBy || "Verified Customer";
  const sentiment = complaint.sentiment || "Negative";
  const isUrgent = priority === "high" || priority === "urgent";

  // AI intelligence defaults
  const aiConfidence = 92;
  const aiSignals = [
    "Possible duplicate",
    "High urgency",
    `${category} related`,
    "Escalation threshold met",
  ];
  const suggestedAction =
    "Review recent billing complaints from the same customer segment and verify payment ledger.";
  const suggestedDraft = `Dear ${customerName},\n\nWe have received your report regarding "${complaint.title}" and our operations team is currently investigating the transaction batch. We will provide an update within 2 hours.\n\nSincerely,\nOperations Support Team`;

  async function handleStatusChange(nextStatus: Complaint["status"]) {
    if (nextStatus === complaint.status) return;
    try {
      await updateMutation.mutateAsync({ status: nextStatus });
      setStatus(nextStatus);
      setLocalAuditLogs((prev) => [
        {
          timestamp: "Just now",
          actor: "Current Operator",
          action: `Status transitioned to ${nextStatus}.`,
        },
        ...prev,
      ]);
    } catch (e) {
      console.error("Failed to update status", e);
    }
  }

  function handleAddInternalNote() {
    if (!internalNote.trim()) return;
    setLocalAuditLogs((prev) => [
      {
        timestamp: "Just now",
        actor: "Current Operator",
        action: `Staff Note: "${internalNote.trim()}"`,
      },
      ...prev,
    ]);
    setInternalNote("");
  }

  function copyDraftToClipboard() {
    navigator.clipboard.writeText(suggestedDraft);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  }

  return (
    <main className="space-y-6">
      {/* Breadcrumb Navigation & Top Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link
            href="/business/complaints"
            className="font-medium text-slate-600 hover:text-[#2454d6] flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Complaints
          </Link>
          <span>/</span>
          <span className="font-mono font-bold text-[#101d30]">{trackingNumber}</span>
        </div>

        {/* Quick Lifecycle Controls */}
        <div className="flex items-center gap-2">
          {currentStatus !== "in_progress" && currentStatus !== "resolved" && (
            <button
              type="button"
              onClick={() => handleStatusChange("in_progress")}
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Mark In Progress
            </button>
          )}

          {currentStatus !== "resolved" && (
            <button
              type="button"
              onClick={() => handleStatusChange("resolved")}
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#2454d6] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#1b43b4] shadow-xs transition"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Mark Resolved
            </button>
          )}
        </div>
      </div>

      {/* Main Dossier Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-[#2454d6]">
                {trackingNumber}
              </span>
              <StatusBadge status={currentStatus} />
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  isUrgent
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-amber-50 text-amber-800 border border-amber-200"
                }`}
              >
                {priority} priority
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101d30]">
              {complaint.title}
            </h1>
            <p className="text-xs text-[#5e6b7d]">
              Submitted on {new Date(complaint.createdAt).toLocaleString()} · Multi-channel Intake
            </p>
          </div>

          {/* SLA Clock & Ownership Callout */}
          <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-3 text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              SLA Resolution Clock
            </span>
            <div className="mt-1 flex items-center justify-end gap-1.5 font-mono text-sm font-bold text-slate-900">
              <Clock className={`h-4 w-4 ${isUrgent ? "text-amber-600" : "text-emerald-600"}`} />
              <span>02h 18m remaining</span>
            </div>
            <span className="text-[10px] text-slate-500">Target response: &lt; 4.0h</span>
          </div>
        </div>

        {/* 2-Column Operational Grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-6">
          {/* LEFT: Customer Voice, AI Signals, Suggested Response, Audit Trail */}
          <div className="space-y-6">
            {/* Customer Statement */}
            <div className="rounded-xl border border-slate-200 bg-[#fafbfd] p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Original Customer Statement
              </span>
              <p className="mt-2 text-sm leading-relaxed text-[#101d30] whitespace-pre-wrap font-medium">
                “{complaint.description}”
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60 pt-2.5 text-xs text-slate-500">
                <span>Complainant: <strong className="text-slate-700">{customerName}</strong> ({customerEmail})</span>
                <span>Language: <strong className="text-slate-700">English (Auto-parsed)</strong></span>
              </div>
            </div>

            {/* AI Intelligence & Assistance Box */}
            <div className="rounded-xl border border-blue-200 bg-[#edf2ff]/40 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-blue-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#2454d6]" />
                  <span className="text-xs font-bold text-[#101d30]">
                    AI Intelligence Signals
                  </span>
                </div>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#2454d6]">
                  Confidence: {aiConfidence}%
                </span>
              </div>

              {!signalDismissed ? (
                <>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      AI Detected Signals
                    </span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {aiSignals.map((sig) => (
                        <span
                          key={sig}
                          className="rounded-md border border-blue-200/80 bg-white px-2 py-0.5 text-xs font-medium text-slate-800"
                        >
                          {sig}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI Suggested Action */}
                  <div className="rounded-lg border border-blue-200 bg-white p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2454d6] block">
                      AI Suggested Next Step
                    </span>
                    <p className="mt-1 text-xs font-medium text-slate-800 leading-relaxed">
                      “{suggestedAction}”
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500 italic">
                      AI surfaces the signal. Your team decides what happens next.
                    </p>
                  </div>

                  {/* Operator Controls */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleStatusChange("in_progress")}
                      className="rounded-lg bg-[#2454d6] hover:bg-[#1b43b4] text-white px-3 py-1.5 text-xs font-bold transition"
                    >
                      Accept & Assign
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignalDismissed(true)}
                      className="rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 text-xs font-semibold transition"
                    >
                      Dismiss Signal
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  Signal dismissed by operator. Complaint remains in normal triage queue.
                </div>
              )}
            </div>

            {/* AI Suggested Response Draft */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-[#2454d6]" />
                  Suggested Customer Response Draft
                </span>
                <button
                  type="button"
                  onClick={copyDraftToClipboard}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2454d6] hover:underline"
                >
                  <Copy className="h-3 w-3" />
                  {copiedDraft ? "Copied to clipboard!" : "Copy Draft"}
                </button>
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono">
                {suggestedDraft}
              </p>
            </div>

            {/* Internal Staff Notes & Audit Trail */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Staff Notes & Audit History
              </h2>

              {/* Note input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddInternalNote()}
                  placeholder="Record internal investigation notes..."
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-[#2454d6] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddInternalNote}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition"
                >
                  Add Note
                </button>
              </div>

              {/* Timeline list */}
              <div className="space-y-3 pt-2">
                {[
                  ...localAuditLogs,
                  {
                    timestamp: "2 hours ago",
                    actor: "System Intake",
                    action: `Complaint captured via ${complaint.submittedBy ? "Customer Portal" : "Web Intake"}.`,
                  },
                  {
                    timestamp: "2 hours ago",
                    actor: "AI Intelligence Engine",
                    action: `Classified as ${category} (${aiConfidence}% confidence). Urgency flagged as ${priority}.`,
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <span className="h-2 w-2 rounded-full bg-[#2454d6] mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-800">{item.actor}</strong>
                        <span className="font-mono text-[10px] text-slate-400">{item.timestamp}</span>
                      </div>
                      <p className="mt-0.5 text-slate-600">{item.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Ownership, Customer Context, Related Complaints */}
          <div className="space-y-5">
            {/* Ownership & Assignment Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Ownership & Routing
              </span>

              <div>
                <span className="text-xs text-slate-500">Assigned Team</span>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  Billing Operations
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-500">Assignee</span>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  {complaint.assignedTo || "Unassigned"}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-500">Escalation State</span>
                <p className="text-xs font-mono font-semibold text-amber-700 mt-0.5">
                  Tier 1 Review Required
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700">
                  Update Status
                  <select
                    value={currentStatus}
                    onChange={(e) => handleStatusChange(e.target.value as Complaint["status"])}
                    className="mt-1.5 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:border-[#2454d6] focus:outline-none"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </label>
              </div>
            </div>

            {/* Customer Account Context */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Customer Context
              </span>

              <div>
                <span className="text-xs text-slate-500">Account / Organization</span>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{customerName}</p>
                <span className="inline-block mt-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  Enterprise Tier
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-500">Contact Email</span>
                <p className="text-xs font-mono text-slate-800 mt-0.5">{customerEmail}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex justify-between py-1">
                  <span>Total Complaints</span>
                  <strong className="text-slate-900">3 lifetime</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>Sentiment Trend</span>
                  <span className="font-semibold text-rose-600">Frustrated</span>
                </div>
              </div>
            </div>

            {/* Semantic Duplicate Cluster Match */}
            <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-purple-700" />
                  Semantic Duplicates Detected
                </span>
                <span className="rounded bg-purple-100 px-1.5 py-0.5 font-mono text-[9px] font-bold text-purple-800">
                  2 matches
                </span>
              </div>

              <p className="text-[11px] text-purple-900 leading-snug">
                AI detected similar complaints describing identical transaction batch errors.
              </p>

              <div className="space-y-2 pt-1">
                <div className="rounded-lg bg-white p-2.5 border border-purple-100 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#2454d6]">BC-10433</span>
                    <span className="font-mono text-[10px] font-bold text-purple-700">94% match</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600 line-clamp-1">
                    Duplicate debit on monthly invoice renewal for batch #8841.
                  </p>
                </div>

                <div className="rounded-lg bg-white p-2.5 border border-purple-100 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#2454d6]">BC-10419</span>
                    <span className="font-mono text-[10px] font-bold text-purple-700">88% match</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600 line-clamp-1">
                    Billing system double charge after checkout retry.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}