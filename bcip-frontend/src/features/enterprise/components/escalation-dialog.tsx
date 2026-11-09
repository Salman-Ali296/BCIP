"use client";

import { useState } from "react";
import { AlertTriangle, X, ShieldAlert, ArrowRight } from "lucide-react";
import { useEnterprise } from "../context/enterprise-context";

export function EscalationDialog() {
    const {
        escalateModalComplaintId,
        setEscalateModalComplaintId,
        complaints,
        escalateComplaint,
    } = useEnterprise();

    const [reason, setReason] = useState<string>("SLA Risk");
    const [targetTeam, setTargetTeam] = useState<string>("Tier 2 Dispute Desk");
    const [comment, setComment] = useState<string>("");

    if (!escalateModalComplaintId) return null;

    const complaint = complaints.find((c) => c.id === escalateModalComplaintId);
    if (!complaint) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        escalateComplaint(complaint.id, reason, targetTeam, comment);
        setComment("");
    };

    const ESCALATION_REASONS = [
        "SLA Risk",
        "Customer Impact",
        "Critical Issue",
        "Repeated Complaint",
        "Specialist Required",
        "Management Review",
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="escalate-modal-title"
        >
            <div className="relative flex flex-col w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-rose-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-rose-100 bg-rose-50/70 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-600 text-white shadow-sm">
                            <ShieldAlert className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-rose-800">
                                    {complaint.id}
                                </span>
                                <span className="rounded bg-rose-100 px-2 py-0.2 text-[10px] font-bold text-rose-900 uppercase">
                                    Formal Escalation
                                </span>
                            </div>
                            <h2 id="escalate-modal-title" className="text-base font-bold text-slate-900 mt-0.5">
                                Escalate Case Intervention
                            </h2>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setEscalateModalComplaintId(null)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <p className="text-xs font-semibold text-slate-700">Subject Case:</p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">{complaint.title}</p>
                        <p className="text-xs text-slate-500">Customer: {complaint.customer.name} ({complaint.customer.tier})</p>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Escalation Reason *
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {ESCALATION_REASONS.map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setReason(r)}
                                    className={`p-2.5 text-xs text-left font-medium rounded-xl border transition ${
                                        reason === r
                                            ? "border-rose-600 bg-rose-50 text-rose-950 font-bold ring-1 ring-rose-600"
                                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                                    }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Escalate To Department / Team *
                        </label>
                        <select
                            value={targetTeam}
                            onChange={(e) => setTargetTeam(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:outline-none"
                        >
                            <option value="Tier 2 Dispute Desk">Tier 2 Dispute Desk (Quality & Escalations)</option>
                            <option value="Executive Resolutions">Executive Resolutions (VIP Unit)</option>
                            <option value="Payment Operations Lead">Payment Operations Lead Review</option>
                            <option value="Treasury Clearing Desk">Treasury Clearing Desk (Corporate Banking)</option>
                            <option value="Engineering Diagnostics">Engineering & Gateway Diagnostics</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Auditable Justification Comment *
                        </label>
                        <textarea
                            rows={3}
                            required
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="State exact financial risk, customer impact, or SLA breach circumstances for the permanent compliance audit log..."
                            className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:outline-none"
                        />
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-[11px] text-amber-900">
                        ⚠️ <strong>Enterprise Compliance:</strong> This escalation will be permanently appended to the immutable audit log with your digital employee signature.
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setEscalateModalComplaintId(null)}
                            className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!comment.trim()}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition disabled:opacity-50"
                        >
                            <span>Authorize Escalation</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
