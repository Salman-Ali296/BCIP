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
  Sparkles,
  User,
} from "lucide-react";
import { FeedbackForm } from "./Feedbackform";
import { acceptResolution, getComplaint, requestAlternative } from "@/lib/api/complaints";
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
    const first = setTimeout(() => void load(), 0);
    const t = setInterval(() => void load(), 4000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
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
      <div className="min-h-screen bg-wash text-ink flex items-center justify-center p-6">
        <div className="rounded-2xl border border-danger/30 bg-danger-soft p-8 text-center max-w-md">
          <AlertTriangle className="mx-auto h-8 w-8 text-danger mb-3" />
          <h2 className="font-bold text-lg">Error Loading Incident</h2>
          <p className="text-xs text-danger mt-2">{error}</p>
          <Link
            href="/support/track"
            className="mt-5 inline-block rounded-xl bg-lilac-soft px-4 py-2 text-xs font-semibold text-ink hover:bg-line"
          >
            Try Another ID
          </Link>
        </div>
      </div>
    );

  if (c === undefined)
    return (
      <div className="min-h-screen bg-wash text-ink flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <span className="h-10 w-10 animate-spin rounded-full border-3 border-brand-soft border-t-transparent" />
          <p className="text-sm font-medium text-muted">Loading incident #{id} telemetry...</p>
        </div>
      </div>
    );

  if (c === null)
    return (
      <div className="min-h-screen bg-wash text-ink flex items-center justify-center p-6">
        <div className="rounded-3xl border border-line bg-white p-10 text-center max-w-md shadow-2xl">
          <AlertTriangle className="mx-auto h-10 w-10 text-warning mb-4" />
          <h2 className="text-xl font-bold">Incident Not Found</h2>
          <p className="text-xs text-muted mt-2">
            No incident matching tracking ID <strong className="text-ink font-mono">{id}</strong> was
            found in the enterprise registry.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              href="/support/track"
              className="rounded-xl bg-ink hover:bg-brand px-4 py-2.5 text-xs font-bold text-white transition shadow-lg shadow-brand/15"
            >
              Search Again
            </Link>
            <Link
              href="/support/report"
              className="rounded-xl border border-line hover:bg-lilac-soft px-4 py-2 text-xs font-semibold text-ink-soft transition"
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
    <div className="min-h-screen bg-wash text-ink py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/support"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-ink transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Support Center
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-soft bg-lilac px-3 py-1 font-mono text-xs text-brand">
              <span className="h-2 w-2 rounded-full bg-brand-glow animate-pulse" />
              Live SLA Tracking
            </span>
          </div>
        </div>

        {/* Hero Incident Card */}
        <div className="rounded-3xl border border-line bg-white p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-lg bg-lilac-soft px-2.5 py-1 font-mono text-xs font-bold text-ink border border-line">
                  {c.trackingId || c.id}
                </span>
                <button
                  type="button"
                  onClick={copyTrackingId}
                  className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-brand transition"
                  title="Copy Tracking ID"
                >
                  {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                {c.orderRef && (
                  <span className="rounded-lg bg-lilac-soft px-2.5 py-1 font-mono text-xs text-brand border border-line">
                    Ref: {c.orderRef}
                  </span>
                )}
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-ink">
                {c.title}
              </h1>
            </div>

            {/* Status & SLA Badge */}
            <div className="flex flex-col items-end gap-2">
              <span
                className={`rounded-xl px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider border ${
                  isResolved
                    ? "bg-success-soft text-success border-success/30"
                    : isAwaitingCustomer
                    ? "bg-lilac text-brand border-brand-soft"
                    : "bg-warning-soft text-warning border-warning/30"
                }`}
              >
                {isResolved ? "Incident Resolved" : isAwaitingCustomer ? "Response Ready" : "In Investigation"}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-muted">
                <Clock className="h-3.5 w-3.5 text-brand" />
                {isResolved ? "Completed within SLA window" : "SLA Remaining: 1h 42m"}
              </span>
            </div>
          </div>

          {/* Interactive Milestone Timeline */}
          <div className="pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-6">
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
                        ? "border-brand-soft bg-lilac-soft shadow-lg shadow-brand/15"
                        : isPassed
                        ? "border-success/30 bg-success-soft"
                        : "border-line bg-wash opacity-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-muted">
                        0{idx + 1}
                      </span>
                      {isPassed && (
                        <CheckCircle2
                          className={`h-3.5 w-3.5 ${
                            isCurrent ? "text-brand animate-pulse" : "text-success"
                          }`}
                        />
                      )}
                    </div>
                    <p className="mt-2 text-xs font-bold text-ink">{step.label}</p>
                    <p className="mt-1 text-[10px] text-muted leading-tight">{step.desc}</p>
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
              <div className="rounded-3xl border border-brand-soft bg-gradient-to-br from-lilac to-wash p-6 sm:p-8 shadow-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-lilac text-brand">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <h3 className="font-bold text-ink text-base">
                    Official Enterprise Resolution Proposed
                  </h3>
                </div>

                <div className="rounded-2xl border border-line bg-ink/10 p-4.5 space-y-2">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                    Executive Response:
                  </p>
                  <p className="text-sm leading-relaxed text-ink">{c.response.message}</p>
                </div>

                <div className="rounded-2xl border border-brand-soft bg-lilac p-4.5 space-y-2">
                  <p className="text-xs font-bold text-brand uppercase tracking-wider">
                    Proposed Remedy & Adjustment:
                  </p>
                  <p className="text-sm font-semibold text-ink leading-relaxed">
                    {c.response.proposedResolution}
                  </p>
                </div>

                {!isResolved && (
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => act(acceptResolution)}
                      className="inline-flex items-center gap-2 rounded-xl bg-success hover:bg-success px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-success/15 transition disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      Accept Resolution & Close Incident
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => act(requestAlternative)}
                      className="rounded-xl border border-line hover:bg-lilac-soft px-4 py-2.5 text-xs font-bold text-ink-soft transition disabled:opacity-50"
                    >
                      Request Alternative Solution
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Complaint Narrative Card */}
            <div className="rounded-3xl border border-line bg-white p-6 sm:p-8 shadow-xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
                Submitted Incident Description
              </h3>
              <p className="text-sm leading-relaxed text-ink whitespace-pre-wrap bg-wash p-4.5 rounded-2xl border border-line">
                {c.description}
              </p>
              <div className="flex flex-wrap items-center justify-between text-xs text-muted pt-2 border-t border-line">
                <span>
                  Submitted via <strong className="capitalize text-ink">{c.channel || "text"}</strong> intake
                </span>
                <span>{new Date(c.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Post-Resolution Feedback CSAT (Proposal Section 3.2.2) */}
            {isResolved && (
              <div className="rounded-3xl border border-success/30 bg-white p-6 sm:p-8 shadow-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-success-soft text-success">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <h3 className="font-bold text-ink text-base">
                    Customer Satisfaction & Service Quality (CSAT)
                  </h3>
                </div>
                {c.feedback ? (
                  <p className="text-xs text-success bg-success-soft p-3 rounded-xl border border-success/30">
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
            <div className="rounded-3xl border border-brand-soft bg-gradient-to-b from-lilac via-wash to-wash p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand">
                <BrainCircuit className="h-4 w-4 text-brand" />
                AI Triage Classification
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between rounded-xl bg-wash p-3 border border-line">
                  <span className="text-muted">Classified Category:</span>
                  <span className="font-bold text-brand">{c.category}</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-wash p-3 border border-line">
                  <span className="text-muted">Urgency Level:</span>
                  <span className="font-bold text-danger uppercase">{c.priority}</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-wash p-3 border border-line">
                  <span className="text-muted">Emotional Sentiment:</span>
                  <span className="font-bold text-brand capitalize">{c.sentiment || "Negative"}</span>
                </div>
              </div>

              {c.aiSummary && (
                <div className="rounded-xl border border-brand-soft bg-lilac-soft p-3.5 text-xs text-ink-soft space-y-1">
                  <span className="font-bold text-brand block">AI Executive Summary:</span>
                  <p className="leading-relaxed">{c.aiSummary}</p>
                </div>
              )}
            </div>

            {/* Enterprise Assignment Card */}
            <div className="rounded-3xl border border-line bg-white p-6 shadow-xl space-y-4 text-xs">
              <h3 className="font-bold text-ink text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-brand" />
                Assigned Specialist
              </h3>
              <div className="rounded-2xl bg-wash p-4 border border-line space-y-2">
                <p className="font-bold text-ink text-sm">
                  {(c as typeof c & { assignedToName?: string | null }).assignedToName || c.assignedTo || "Senior Enterprise Escalation Desk"}
                </p>
                <p className="text-[11px] text-muted">
                  Direct SLA oversight · Level-2 Certified Incident Specialist
                </p>
              </div>

              <div className="border-t border-line pt-3 space-y-1.5 text-muted">
                <p className="flex justify-between">
                  <span>Registered Contact:</span>
                  <strong className="text-ink">{c.email || c.customerEmail}</strong>
                </p>
                <p className="flex justify-between">
                  <span>Enterprise SLA:</span>
                  <strong className="text-success">Tier-1 Guaranteed</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
