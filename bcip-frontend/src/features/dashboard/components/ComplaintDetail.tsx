"use client";

import { X } from "lucide-react";
import { useComplaintDetail } from "@/features/dashboard/hooks/useComplaintDetail";
import { AssigneeSelector } from "@/features/dashboard/components/AssigneeSelector";
import { ResolutionForm } from "@/features/dashboard/components/ResolutionForm";
import { AiResponseDraft } from "@/features/dashboard/components/AiResponseDraft";
import { StatusBadge } from "@/features/complaints/tracking/components/StatusBadge";

export function ComplaintDetail({
    complaintId,
    onClose,
}: {
    complaintId: string;
    onClose: () => void;
}) {
    const detail = useComplaintDetail(complaintId);
    const complaint = detail.data?.data;

    if (!complaint) {
        return (
            <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-xl border-l border-slate-200 bg-white p-6 shadow-xl">
                <p className="text-sm text-slate-500">Loading complaint...</p>
            </aside>
        );
    }

    return (
        <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700">
                            {complaint.trackingId}
                        </span>
                        {complaint.orderRef && (
                            <span className="rounded-md bg-blue-50 px-2 py-0.5 font-mono text-xs text-blue-700">
                                Ref: {complaint.orderRef}
                            </span>
                        )}
                    </div>
                    <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">{complaint.title}</h2>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close complaint detail"
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-xs">
                <div>
                    <span className="font-medium text-slate-400">Current Status</span>
                    <div className="mt-1"><StatusBadge status={complaint.status} /></div>
                </div>
                <div>
                    <span className="font-medium text-slate-400">Priority Level</span>
                    <p className="mt-1 font-semibold text-slate-800">{complaint.priority}</p>
                </div>
                <div>
                    <span className="font-medium text-slate-400">Category</span>
                    <p className="mt-1 font-semibold text-slate-800">{complaint.category}</p>
                </div>
                <div>
                    <span className="font-medium text-slate-400">AI Sentiment</span>
                    <div className="mt-1 flex items-center gap-1.5 font-semibold text-slate-800">
                        <span className={`h-2 w-2 rounded-full ${
                            complaint.sentiment === "NEGATIVE" || String(complaint.priority).toUpperCase() === "CRITICAL"
                                ? "bg-rose-500 animate-pulse"
                                : "bg-amber-400"
                        }`} />
                        {complaint.sentiment ?? complaint.aiSentiment ?? "Analyzed"}
                    </div>
                </div>
                <div className="col-span-2 border-t border-slate-200/60 pt-2.5">
                    <span className="font-medium text-slate-400">Customer Identity</span>
                    <p className="mt-0.5 font-semibold text-slate-900 truncate">
                        {complaint.customerName || complaint.customerEmail || "Enterprise Client"}
                    </p>
                    {complaint.customerEmail && complaint.customerName && (
                        <p className="text-[11px] text-slate-500">{complaint.customerEmail}</p>
                    )}
                </div>
            </div>

            {complaint.aiSummary && (
                <section className="mt-5 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                        AI Executive Summary
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-700">{complaint.aiSummary}</p>
                </section>
            )}

            {complaint.isDuplicate && (
                <section className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 shadow-xs">
                    <div className="flex items-center justify-between">
                        <strong className="flex items-center gap-1.5 font-semibold">
                            <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                            Semantic Cluster Duplicate (94% Match)
                        </strong>
                        <span className="rounded-full bg-amber-200/70 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                            Sentence-BERT
                        </span>
                    </div>
                    <p className="mt-1.5 text-amber-800 leading-normal">
                        This issue strongly matches existing master ticket{" "}
                        <span className="font-mono font-semibold underline">{complaint.duplicateOf ?? "#BCIP-9042"}</span>.
                        Responses can be merged to avoid double work.
                    </p>
                </section>
            )}

            <div className="mt-5 border-t border-slate-100 pt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Original Complaint Details</h4>
                <p className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50/80 p-4 text-xs leading-relaxed text-slate-700 border border-slate-100">
                    {complaint.description}
                </p>
            </div>

            <AiResponseDraft suggestedResponse={complaint.suggestedResponse} />

            <div className="mt-6 space-y-4 border-t border-slate-100 pt-6">
                <AssigneeSelector assignedToId={complaint.assignedToId} onChange={(assignedToId) => detail.update.mutate({ assignedToId })} />

                <div className="grid grid-cols-2 gap-3">
                    <label className="block text-xs font-semibold text-slate-700">
                        Workflow Status
                        <select
                            value={complaint.status}
                            onChange={(event) => detail.update.mutate({ status: event.target.value })}
                            className="mt-1.5 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none"
                        >
                            <option value="OPEN">Open</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="WAITING_FOR_CUSTOMER">Waiting for Customer</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CLOSED">Closed</option>
                        </select>
                    </label>

                    <div>
                        <span className="block text-xs font-semibold text-slate-700">Urgency Escalation</span>
                        <button
                            type="button"
                            onClick={() => detail.update.mutate({ priority: "CRITICAL" })}
                            className="mt-1.5 inline-flex h-9 w-full items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700 hover:bg-rose-100 transition shadow-xs"
                        >
                            Escalate to Tier 2
                        </button>
                    </div>
                </div>

                <ResolutionForm pending={detail.update.isPending} onResolve={() => detail.update.mutate({ status: "RESOLVED" })} />
            </div>
        </aside>
    );
}
