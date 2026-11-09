"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BrainCircuit,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { FeedbackForm } from "./Feedbackform";
import { acceptResolution, getComplaint, requestAlternative } from "@/lib/api/complaints";
import { tenant } from "@/config/tenant";
import type { Complaint } from "@/types/complaint";

const STATUS_STEPS = [
  { key: "submitted", label: "Incident Logged", desc: "Received into intake pipeline" },
  { key: "analyzed", label: "AI Triaged", desc: "Categorized & sentiment-scored" },
  { key: "assigned", label: "Specialist Assigned", desc: "Under active investigation" },
  { key: "in_review", label: "Management Review", desc: "Remediation verified" },
  { key: "awaiting_customer", label: "Resolution Proposed", desc: "Awaiting your confirmation" },
  { key: "resolved", label: "Incident Resolved", desc: "Closed & verified" },
];

export function TrackView({ id }: { id: string }) {
  const [c, setC] = useState<Complaint | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      setC(await getComplaint(id));
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load this complaint.");
    }
  }, [id]);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 4000);
    return () => clearInterval(t);
  }, [load]);

  const copyTrackingId = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  async function act(fn: (id: string) => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn(id);
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to update this incident.");
    } finally {
      setBusy(false);
    }
  }

  if (c === undefined && error)
    return (
      <div className="min-h-screen bg-[#0d1526] text-white flex items-center justify-center p-6">
        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-8 text-center max-w-md">
          <AlertTriangle className="mx-auto h-8 w-8 text-rose-400 mb-3" />
          <h2 className="font-bold text-lg">Error Loading Incident</h2>
          <p className="text-xs text-rose-300 mt-2">{error}</p>
          <Link
            href="/support/track"
            className="mt-5 inline-block rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
          >
            Try Another ID
          </Link>
        </div>
      </div>
    );

  if (c === undefined)
    return (
      <div className="min-h-screen bg-[#0d1526] text-white flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <span className="h-10 w-10 animate-spin rounded-full border-3 border-blue-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-400">Loading incident #{id} telemetry...</p>
        </div>
      </div>
    );

  if (c === null)
    return (
      <div className="min-h-screen bg-[#0d1526] text-white flex items-center justify-center p-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-10 text-center max-w-md shadow-2xl">
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-400 mb-4" />
          <h2 className="text-xl font-bold">Incident Not Found</h2>
          <p className="text-xs text-slate-400 mt-2">
            No incident matching tracking ID <strong className="text-white font-mono">{id}</strong> was
            found in the enterprise registry.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              href="/support/track"
              className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-xs font-bold text-white transition shadow-lg shadow-blue-600/30"
            >
              Search Again
            </Link>
            <Link
              href="/support/report"
              className="rounded-xl border border-slate-700 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 transition"
            >
              Submit New Complaint
            </Link>
          </div>
        </div>
      </div>
    );

  const isResolved = c.status === "resolved" || c.status === "RESOLVED";
  const isAwaitingCustomer = c.status === "awaiting_customer" || c.status === "WAITING_FOR_CUSTOMER";

  // Calculate active timeline index
  const activeStepIdx = isResolved
    ? 5
    : isAwaitingCustomer
    ? 4
    : c.status === "in_review" || c.status === "IN_PROGRESS"
    ? 3
    : c.assignedToId
    ? 2
    : 1;

  return (
    <div className="min-h-screen bg-[#0d1526] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/support"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Support Center
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 font-mono text-xs text-blue-300">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              Live SLA Tracking
            </span>
          </div>
        </div>

        {/* Hero Incident Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-lg bg-slate-800 px-2.5 py-1 font-mono text-xs font-bold text-slate-200 border border-slate-700">
                  {c.trackingId || c.id}
                </span>
                <button
                  type="button"
                  onClick={copyTrackingId}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-blue-400 transition"
                  title="Copy Tracking ID"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                {c.orderRef && (
                  <span className="rounded-lg bg-blue-950/60 px-2.5 py-1 font-mono text-xs text-blue-300 border border-blue-800/60">
                    Ref: {c.orderRef}
                  </span>
                )}
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-white">
                {c.title}
              </h1>
            </div>

            {/* Status & SLA Badge */}
            <div className="flex flex-col items-end gap-2">
              <span
                className={`rounded-xl px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider border ${
                  isResolved
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : isAwaitingCustomer
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}
              >
                {isResolved ? "Incident Resolved" : isAwaitingCustomer ? "Response Ready" : "In Investigation"}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                <Clock className="h-3.5 w-3.5 text-blue-400" />
                {isResolved ? "Completed within SLA window" : "SLA Remaining: 1h 42m"}
              </span>
            </div>
          </div>

          {/* Interactive Milestone Timeline */}
          <div className="pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
              Incident Milestone Progression
            </h3>

            <div className="grid gap-3 sm:grid-cols-6">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx <= activeStepIdx;
                const isCurrent = idx === activeStepIdx;
                return (
                  <div
                    key={step.key}
                    className={`relative rounded-2xl border p-3.5 text-left transition ${
                      isCurrent
                        ? "border-blue-500 bg-blue-950/30 shadow-lg shadow-blue-500/10"
                        : isPassed
                        ? "border-emerald-500/40 bg-emerald-950/20"
                        : "border-slate-800 bg-slate-950/40 opacity-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-400">
                        0{idx + 1}
                      </span>
                      {isPassed && (
                        <CheckCircle2
                          className={`h-3.5 w-3.5 ${
                            isCurrent ? "text-blue-400 animate-pulse" : "text-emerald-400"
                          }`}
                        />
                      )}
                    </div>
                    <p className="mt-2 text-xs font-bold text-white">{step.label}</p>
                    <p className="mt-1 text-[10px] text-slate-400 leading-tight">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Grid: Details & AI Intelligence */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Left Column (2 cols): Details & Resolution */}
          <div className="md:col-span-2 space-y-6">
            {/* Proposed Resolution Offer (When available) */}
            {c.response && (
              <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 to-slate-900 p-6 sm:p-8 shadow-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <h3 className="font-bold text-white text-base">
                    Official Enterprise Resolution Proposed
                  </h3>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-black/30 p-4.5 space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Executive Response:
                  </p>
                  <p className="text-sm leading-relaxed text-slate-200">{c.response.message}</p>
                </div>

                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4.5 space-y-2">
                  <p className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                    Proposed Remedy & Adjustment:
                  </p>
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    {c.response.proposedResolution}
                  </p>
                </div>

                {!isResolved && (
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => act(acceptResolution)}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      Accept Resolution & Close Incident
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => act(requestAlternative)}
                      className="rounded-xl border border-slate-700 hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 transition disabled:opacity-50"
                    >
                      Request Alternative Solution
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Complaint Narrative Card */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Submitted Incident Description
              </h3>
              <p className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap bg-slate-950/60 p-4.5 rounded-2xl border border-slate-800">
                {c.description}
              </p>
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span>
                  Submitted via <strong className="capitalize text-slate-200">{c.channel || "text"}</strong> intake
                </span>
                <span>{new Date(c.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Post-Resolution Feedback CSAT (Proposal Section 3.2.2) */}
            {isResolved && (
              <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/90 p-6 sm:p-8 shadow-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <h3 className="font-bold text-white text-base">
                    Customer Satisfaction & Service Quality (CSAT)
                  </h3>
                </div>
                {c.feedback ? (
                  <p className="text-xs text-emerald-400 bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/30">
                    ✓ Feedback received with {c.feedback.rating} / 5 stars. Thank you for helping us improve our enterprise service quality!
                  </p>
                ) : (
                  <FeedbackForm id={id} onDone={load} />
                )}
              </div>
            )}
          </div>

          {/* Right Column (1 col): AI Understanding & Organization Metadata */}
          <div className="space-y-6">
            {/* AI Intelligence Insights Card */}
            <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-b from-blue-950/30 via-slate-900/90 to-slate-900 p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-300">
                <BrainCircuit className="h-4 w-4 text-blue-400" />
                AI Triage Classification
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                  <span className="text-slate-400">Classified Category:</span>
                  <span className="font-bold text-blue-400">{c.category}</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                  <span className="text-slate-400">Urgency Level:</span>
                  <span className="font-bold text-rose-400 uppercase">{c.priority}</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                  <span className="text-slate-400">Emotional Sentiment:</span>
                  <span className="font-bold text-purple-400 capitalize">{c.sentiment || "Negative"}</span>
                </div>
              </div>

              {c.aiSummary && (
                <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-3.5 text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-blue-300 block">AI Executive Summary:</span>
                  <p className="leading-relaxed">{c.aiSummary}</p>
                </div>
              )}
            </div>

            {/* Enterprise Assignment Card */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4 text-xs">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-blue-400" />
                Assigned Specialist
              </h3>
              <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-800 space-y-2">
                <p className="font-bold text-white text-sm">
                  {(c as any).assignedToName || c.assignedTo || "Senior Enterprise Escalation Desk"}
                </p>
                <p className="text-[11px] text-slate-400">
                  Direct SLA oversight · Level-2 Certified Incident Specialist
                </p>
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-1.5 text-slate-400">
                <p className="flex justify-between">
                  <span>Registered Contact:</span>
                  <strong className="text-slate-200">{c.email || c.customerEmail}</strong>
                </p>
                <p className="flex justify-between">
                  <span>Enterprise SLA:</span>
                  <strong className="text-emerald-400">Tier-1 Guaranteed</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
